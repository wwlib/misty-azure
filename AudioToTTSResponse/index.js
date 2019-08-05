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
                // console.log(`NLUIntentAndEntities: `, JSON.stringify(intentAndEntities, null, 2));
                context.log(JSON.stringify(intentAndEntities, null, 2));
                resolve(intentAndEntities.intent);
            })
            .catch((error) => {
                // console.log(error);
                context.log(error);
                reject(error);
            });

    });
}

// Intent to Response Text
function intentToResponseText(accessToken, intent, context) {
    return new Promise(function (resolve, reject) {
        let response = 'Could you repeat that?'
        switch (intent) {
            case 'launchClock':
                let time = new Date();
                let hours = time.getHours();
                if (hours > 12) {
                    hours -= 12;
                }
                let minutes = time.getMinutes();
                let minutesPrefix = (minutes < 10) ? 'oh' : '';
                if (minutes == 0) {
                    response = `The time is ${hours} o'clock`;
                } else {
                    response = `The time is ${hours} ${minutesPrefix} ${minutes}`;
                }
                // response = `The time is something o'clock`
                break;
            case 'launchJoke':
                response = `Where does the general keep his armies? ,, In his sleevies.`
                break;
        }
        resolve(response);
    });
}

// Response Text To Speech Audio
function textToSpeech(accessToken, text, context) {
    // Convert the XML into a string to send in the TTS request.
    let body = '<?xml version="1.0"?><speak version="1.0" xml:lang="en-us"><voice xml:lang="en-us" name="Microsoft Server Speech Text to Speech Voice (en-US, Jessa24kRUS)">' + text + '</voice></speak>';

    let options = {
        method: 'POST',
        baseUrl: 'https://eastus.tts.speech.microsoft.com/', // Be sure this base URL matches your region
        url: 'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'User-Agent': 'Misty Demo Code',
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
            'Content-Type': 'application/ssml+xml'
        },
        body: body
    }

    var dataLength = 0;
    var returnData = ''.toString('base64');
    var soundFile = [];

    let request = rp(options)
        .on('data', function (chunk) {
            dataLength += chunk.length;
            soundFile.push(chunk)
        })
        .on('end', function () {
            context.log('Data Length = ', dataLength);

            // Create new base64 string from the full sound file. 
            var buf = new Buffer(dataLength);
            for (var i = 0, len = soundFile.length, pos = 0; i < len; i++) {
                soundFile[i].copy(buf, pos);
                pos += soundFile[i].length;
            }

            context.res = {
                body: buf.base64Slice()
            };
            context.done();
        });
    return request;

};

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
        const intent = await textToIntent(accessToken, utterance, context);
        const responseText = await intentToResponseText(accessToken, intent, context);
        await textToSpeech(accessToken, responseText, context);
    } catch (err) {
        context.log(`Something went wrong: ${err}`);
    }
};