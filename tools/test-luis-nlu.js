const { LUISController } = require('cognitiveserviceslib');
const config = require('../AzureFunctions/AudioToTTSResponse/config.json');

let timeStart = new Date().getTime();
const timeLog = {
  timeStart: timeStart
}

// console.log(`LUISController:`, LUISController);
// console.log(config);

const luisController = new LUISController(config);

// luisController.config = config;

const token = luisController.getIntentAndEntities('what time is it');
token.complete
    .then((intentAndEntities) => {
        timeLog.timeToResponse = new Date().getTime();
        timeLog.elapsedTime = timeLog.timeToResponse - timeLog.timeStart;
        console.log(JSON.stringify(timeLog, null, 2));
        console.log(`NLUIntentAndEntities: `, JSON.stringify(intentAndEntities, null, 2));
    })
    .catch((error) => {
        console.log(error);
    });