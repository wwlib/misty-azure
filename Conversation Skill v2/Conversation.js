misty.Debug("DBG: The Conversation Skill is starting again...");
misty.Set("audioToIntentURL", "<YOUR-AZURE-AUDIO-TO-INTENT-URL-HERE>");
misty.Set("textToTTSURL", "<YOUR-AZURE-TEXT-TO-TTS-URL-HERE>");
misty.Set("conversationListen", "conversationlisten.wav");
misty.Set("responseType", "getIntent");

// time logging
misty.Set("timeLog", "{}");

StartKeyPhraseRecognition();
// registerAudioLocalisation();

function StartKeyPhraseRecognition() {
	misty.Debug("DBG: Starting key phrase recognition...");
	reactionStartKeyPhraseRecognition();
	// Starts Misty listening for the "Hey, Misty" key phrase
	misty.StartKeyPhraseRecognition();
	// Registers for KeyPhraseRecognized events
	misty.RegisterEvent("KeyPhraseRecognized", "KeyPhraseRecognized", 10, false);
	misty.Debug("DBG: KeyPhraseRecognition started. Misty will play a sound and wave when she hears 'Hey Misty'.");
}

// Callback function to execute when Misty hears the key phrase
function _KeyPhraseRecognized() {
	misty.Debug("DBG: Key phrase recognized!");
	reactionKeyPhraseRecognized();
	let conversationListenWav = misty.Get("conversationListen");
	misty.StartRecordingAudio(conversationListenWav);
	misty.Pause(3000);
	misty.ChangeLED(0, 0, 0);
	misty.StopRecordingAudio();
	misty.Pause(1000); // allow time to save the audio file
	// Send request to fetch list of audio files
	misty.GetAudioList();
}

function _GetAudioList(data) {
	let conversationListenWav = misty.Get("conversationListen");
	misty.Debug("DBG: _GetAudioList: Checking for audio file:" + conversationListenWav);
	// Get the array of audio files from the data returned 
	// by GetAudioList()
	let audioArr = data.Result;
	// Initialize a variable to tell us if the list contains 
	// the recorded audio file
	let containsNewFile = false;
	// Loop through list and compare file names to the
	// name specified for the recording
	for (let i = 0; i < audioArr.length; i++) {
		if (audioArr[i].Name === conversationListenWav) {
			// If there's a match, track it by updating
			// the value of containsNewFile to true
			containsNewFile = true;
		}
	}

	// If list contains recording, issue a command to play the recording
	if (containsNewFile) {
		misty.Debug(conversationListenWav + " found.");
		reactionGetAudioList();
		misty.GetAudioFile(conversationListenWav, false);
	}
	else {
		// If the list does not contain the recording, print an error message
		misty.Debug(conversationListenWav + " file was not found.");
	}
}

function _GetAudioFile(data) {
	misty.Debug("DBG: Got audio data:");
	reactionGetAudioFile();
	let audioToIntentURL = misty.Get("audioToIntentURL");
	let message = data.Result.Audio;
	misty.Debug("DBG: Calling Azure:");
	misty.Set("responseType", "getIntent");
	misty.SendExternalRequest("GET", audioToIntentURL, null, null, JSON.stringify({ "message": message }));
}

function _SendExternalRequest(data) {
	const responseType = misty.Get("responseType");
	// misty.Debug(`Response Received: ${responseType}`);
	reactionReceiveExernalResponse()

	if (data !== undefined && data !== null) {
		misty.Debug("DBG: Received Response from Azure");
		let responseData = data.Result.ResponseObject.Data;
		switch (responseType) {
			case 'getIntent':
				reactionReceiveIntentData(responseData);
				let responseText = intentToResponseText(responseData);
				misty.Debug('responseText:' + responseText);
				let textToTTSURL = misty.Get("textToTTSURL");
				misty.Set("responseType", "getTTS");
				misty.SendExternalRequest("GET", textToTTSURL, null, null, JSON.stringify({ "message": responseText }));
				break;
			case 'getTTS':
				reactionReceiveTTS();
				misty.SaveAudio("AzureTTSResponse.wav", data.Result.ResponseObject.Data, true, true);
				StartKeyPhraseRecognition();
				break;
		}
	} else {
		misty.Debug("DBG: ERROR: Empty user callback data");
		StartKeyPhraseRecognition();
	}
}

////// reaction phases

function reationInit() {

}

function reactionStartKeyPhraseRecognition() {
	misty.ChangeLED(255, 255, 25);
}

function reactionKeyPhraseRecognized() {
	const timeStart = new Date().getTime();
	let timeLog = {
		timeStart: timeStart
	}
	misty.Set("timeLog", JSON.stringify(timeLog));

	// misty.PlayAudio("002-Weerp.wav", 100);
	misty.MoveArmPosition("left", getRandomInt(2, 7), 45); // Left arm fully down
	// misty.MoveArmPosition("right", getRandomInt(0, 5), 45); // Right arm fully down
	misty.ChangeLED(0, 0, 255);
}

function reactionGetAudioList() {
	let timeLog = JSON.parse(misty.Get("timeLog"));
	let currentTime = new Date().getTime();
	timeLog.timeToAudioSave = currentTime - timeLog.timeStart;
	misty.Set("timeLog", JSON.stringify(timeLog));
}

function reactionGetAudioFile() {
	let timeLog = JSON.parse(misty.Get("timeLog"));
	const currentTime = new Date().getTime();
	timeLog.timeToAudioSend = currentTime - timeLog.timeStart;
	misty.Set("timeLog", JSON.stringify(timeLog));

	_head_alert();
	misty.ChangeLED(255, 0, 0);
}

function reactionReceiveExernalResponse() {
	misty.ChangeLED(0, 0, 0);
	_head_alert();
}

function reactionReceiveIntentData(intentData) {
	let timeLog = JSON.parse(misty.Get("timeLog"));
	let currentTime = new Date().getTime();
	timeLog.timeToIntent = currentTime - timeLog.timeStart;
	timeLog.intentRoundTrip = timeLog.timeToIntent - timeLog.timeToAudioSend;
	misty.Set("timeLog", JSON.stringify(timeLog));

	_head_alert();
	misty.Debug('DBG: reactionReceiveIntentData:' + intentData);
}

function reactionReceiveTTS() {
	let timeLog = JSON.parse(misty.Get("timeLog"));
	let currentTime = new Date().getTime();
	timeLog.timeToTTS = currentTime - timeLog.timeStart;
	timeLog.ttsRoundTrip = timeLog.timeToTTS - timeLog.timeToIntent;
	misty.Set("timeLog", JSON.stringify(timeLog));
	misty.Debug('DBG: TIME LOG\n' + JSON.stringify(timeLog, null, 2));
	
	_head_alert();
	// misty.MoveArmPosition("left", getRandomInt(1, 6), 45);
	misty.MoveArmPosition("right", getRandomInt(0, 5), 45);
	misty.ChangeLED(0, 255, 0);
}

//////

function intentToResponseText(intent) {
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
	return response;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function _head_alert() {

	misty.MoveHeadPosition(
		getRandomInt(0, 2), // Random pitch position between -5 and 5
		getRandomInt(-2, 2), // Random roll position between -5 and 5
		getRandomInt(-1, 1), // Random yaw position between -5 and 5
		300); // Head movement velocity. Decrease for slower movement.
}