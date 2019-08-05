const fs = require('fs');
const { AzureSpeechApiController } = require('cognitiveserviceslib');
const config = require('../AudioToTTSResponse/config.json');

console.log(AzureSpeechApiController);
console.log(config);

const azureSpeechApiController = new AzureSpeechApiController(config);

// console.log(azureSpeechApiController);
// azureSpeechApiController.client.issueToken()
//     .then((token) => {
//         console.log(`token:`, token);
//     })

let waveBuffer;
fs.readFile('weather.wav', function (err, waveBuffer) {
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
            console.log(`azureSpeechApiController: utterance: ${utterance}`);
        })
        .catch((error) => {
            console.log(error);
        });
});
