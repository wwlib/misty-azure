const fs = require('fs');
const { AzureSpeechApiController } = require('cognitiveserviceslib');
const config = require('../AzureFunctions/AudioToTTSResponse/config.json');

let timeStart = new Date().getTime();
const timeLog = {
  timeStart: timeStart
}

// console.log(AzureSpeechApiController);
// console.log(config);

const azureSpeechApiController = new AzureSpeechApiController(config);

// console.log(azureSpeechApiController);
// azureSpeechApiController.client.issueToken()
//     .then((token) => {
//         console.log(`token:`, token);
//     })

let waveBuffer;
fs.readFile('jokes.wav', function (err, waveBuffer) {
    if (err) throw err;
    console.log(waveBuffer);

    const token = azureSpeechApiController.RecognizeWaveBuffer(waveBuffer);

    token.on('Listening', () => {
        console.log(`azureSpeechApiController: on Listening`);
    });

    token.on('RecognitionEndedEvent', () => {
        console.log(`azureSpeechApiController: on RecognitionEndedEvent`);
    });

    token.on('Recording_Stopped', () => {
        console.log(`azureSpeechApiController: on Recording_Stopped`);
    });

    token.complete
        .then((utterance) => {
            timeLog.timeToResponse = new Date().getTime();
            timeLog.elapsedTime = timeLog.timeToResponse - timeLog.timeStart;
            console.log(JSON.stringify(timeLog, null, 2));
            console.log(`azureSpeechApiController: utterance: ${utterance}`);
        })
        .catch((error) => {
            console.log(error);
        });
});
