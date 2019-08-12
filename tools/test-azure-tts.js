const { AzureTTSController } = require('cognitiveserviceslib');
const config = require('../AzureFunctions/AudioToTTSResponse/config.json');

let timeStart = new Date().getTime();
const timeLog = {
  timeStart: timeStart
}

// console.log(AzureTTSController);
// console.log(config);

azureTTSController = new AzureTTSController(config);

// console.log(azureTTSController);
// azureTTSController.client.issueToken()
//     .then((token) => {
//         console.log(`token:`, token);
//     })

const token = azureTTSController.SynthesizerStart("Where does the general keep his armies? ,, In his sleevies.");

token.on('Synthesizing', () => {
    console.log(`azureTTSController: on Synthesizing`);
});

token.on('SynthesisEndedEvent', () => {
    console.log(`azureTTSController: on SynthesisEndedEvent`);
});

token.complete
    .then((result) => {
        timeLog.timeToResponse = new Date().getTime();
        timeLog.elapsedTime = timeLog.timeToResponse - timeLog.timeStart;
        console.log(JSON.stringify(timeLog, null, 2));
        console.log(`azureTTSController: result: ${result}`);
    })
    .catch((error) => {
        console.log(error);
    });