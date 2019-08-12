const axios = require('axios');

let timeStart = new Date().getTime();
const timeLog = {
  timeStart: timeStart
}

const config = require('./config.json');

axios.post(config.Microsoft.TextToTTSFunctionURL, {
    message: "Where does the general keep his armies? ,, In his sleevies."
  })
  .then(function (response) {
    timeLog.timeToResponse = new Date().getTime();
    timeLog.elapsedTime = timeLog.timeToResponse - timeLog.timeStart;
    console.log(JSON.stringify(timeLog, null, 2));
    console.log(`Response Length:`, response.data.length);
    // console.log(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });