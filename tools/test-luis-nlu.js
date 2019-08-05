const { LUISController } = require('cognitiveserviceslib');
const config = require('../AudioToTTSResponse/config.json');

console.log(`LUISController:`, LUISController);
console.log(config);

const luisController = new LUISController(config);

// luisController.config = config;

const token = luisController.getIntentAndEntities('what time is it');
token.complete
    .then((intentAndEntities) => {
        console.log(`NLUIntentAndEntities: `, JSON.stringify(intentAndEntities, null, 2));
    })
    .catch((error) => {
        console.log(error);
    });