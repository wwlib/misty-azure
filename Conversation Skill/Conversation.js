misty.Debug("The Conversation Skill is starting again...");
misty.Set("azureURL", "<YOUR-AZURE-URL>");
misty.Set("ConversationListen", "conversationlisten.wav")

StartKeyPhraseRecognition();

function StartKeyPhraseRecognition() {
	misty.Debug("Starting key phrase recognition...");
	misty.ChangeLED(0, 0, 0);
	// Starts Misty listening for the "Hey, Misty" key phrase
	misty.StartKeyPhraseRecognition();
	// Registers for KeyPhraseRecognized events
	misty.RegisterEvent("KeyPhraseRecognized", "KeyPhraseRecognized", 10, false);
	misty.Debug("KeyPhraseRecognition started. Misty will play a sound and wave when she hears 'Hey Misty'.");
}

// Callback function to execute when Misty hears the key phrase
function _KeyPhraseRecognized() {
	misty.Debug("Key phrase recognized!");
	misty.PlayAudio("002-Weerp.wav", 100);
	misty.Pause(2000);
	misty.ChangeLED(0, 0, 255);
	
	misty.Debug("Recording starting...");
	let conversationListenWav = misty.Get("ConversationListen");
	misty.StartRecordingAudio(conversationListenWav);
	misty.Pause(5000);
	misty.ChangeLED(0, 0, 0);
	misty.StopRecordingAudio();
	misty.Pause(2000);
	
	// Send request to fetch list of audio files
	misty.GetAudioList();
}

function _GetAudioList(data) {
	let conversationListenWav = misty.Get("ConversationListen");
	
	misty.Debug("_GetAudioList: Checking for audio file:" + conversationListenWav);
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
        misty.Debug(conversationListenWav + " found: " + conversationListenWav);
        misty.GetAudioFile(conversationListenWav, false);
    }
	else {
		// If the list does not contain the recording, print an error message
		misty.Debug(conversationListenWav + " file was not found");
	}
}

function _GetAudioFile(data)
{
    misty.Debug("Got audio data:");
    misty.Debug(JSON.stringify(data));
    let azureURL = misty.Get("azureURL");
    let message = data.Result.Audio;
    misty.Debug("Callling azure: " + azureURL);
    misty.SendExternalRequest("GET", azureURL, null, null, JSON.stringify({"message": message}));

    misty.Debug("Done callling Azure: ");
    misty.Pause(4000)
}

function _SendExternalRequest(data) {
	misty.Debug("Response Received");

	if (data !== undefined && data !== null) {
		misty.Debug("Recieved Response from Azure");
		misty.SaveAudio("AzureResponse.wav", data.Result.ResponseObject.Data, true, true);
        // misty.SaveAudio("AzureResponse.wav", base64ToByteArrayString(data.Result.ResponseObject.Data), true, true);
        // misty.Pause(7000);
        // misty.PlayAudio("AzureResponse.wav");
	}
	else {
		misty.Debug("ERROR: Empty user callback data");
	}
	misty.Pause(5000);
    misty.ChangeLED(0, 0, 0);
    // misty.DisplayImage("Wonder.png");
    // misty.Pause(5000);
	StartKeyPhraseRecognition();
}
