const rp = require('request-promise');
const { LUISController, AzureSpeechApiController } = require('cognitiveserviceslib');

const config = require('./config.json');
const subscriptionKey = config.Microsoft.AzureSpeechSubscriptionKey;

// Gets an access token.
function getAccessToken() {
    let options = {
        method: 'POST',
        uri: 'https://azurespeechserviceeast.cognitiveservices.azure.com/sts/v1.0/issuetoken', // Be sure this base URL matches your region
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey
        }
    }
    return rp(options);
}

// Speech To Text
function speechToText(accessToken, audioBase64, context) {
    return new Promise(function (resolve, reject) {
        let waveBuffer = Buffer.from(audioBase64, 'base64');
        const azureSpeechApiController = new AzureSpeechApiController(config);
        const token = azureSpeechApiController.RecognizeWaveBuffer(waveBuffer);

        token.on('Listening', () => {
            context.log(`azureSpeechApiController: on Listening`);
        });

        token.on('RecognitionEndedEvent', () => {
            context.log(`azureSpeechApiController: on RecognitionEndedEvent`);
        });

        token.on('Recording_Stopped', () => {
            context.log(`azureSpeechApiController: on Recording_Stopped`);
        });

        token.complete
            .then((utterance) => {
                context.log(`azureSpeechApiController: utterance: ${utterance}`);
                resolve(utterance);
            })
            .catch((error) => {
                context.log(error);
                reject(error);
            });
        
    });
}

// Text to NLU/intent via LUIS
function textToIntent(accessToken, text, context) {
    return new Promise(function (resolve, reject) {
        const luisController = new LUISController(config);
        const token = luisController.getIntentAndEntities(text);

        token.complete
            .then((intentAndEntities) => {
                context.log('Got NLU result...');
                // console.log(`NLUIntentAndEntities: `, JSON.stringify(intentAndEntities, null, 2));
                let result = intentAndEntities.intent; //JSON.stringify(intentAndEntities);
                context.log(result);
                context.res = {
                    body: result
                };
                context.done();
                resolve(result);
                
            })
            .catch((error) => {
                // console.log(error);
                context.log(error);
                context.res = {
                    body: error
                };
                context.done();
                reject(error);
            });

    });
}

module.exports = async function (context, req) {
    context.log('Azure AudioToIntent Function Call Initialized.');

    if (!subscriptionKey) {
        context.res = {
            status: 400,
            body: "Error With Service Token"
        };

        context.done();
        return;
    };

    audioBase64 = '';
    if (req.query.message || (req.body && req.body.message)) {
        audioBase64 = (req.query.message || req.body.message);
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a message in the request string or in the request body"
        };
        context.done();
        return;
    }

    try {
        const accessToken = await getAccessToken();
        const utterance = await speechToText(accessToken, audioBase64, context);
        await textToIntent(accessToken, utterance, context);
    } catch (err) {
        context.log(`Something went wrong: ${err}`);
    }
};