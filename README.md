### misty conversation skill

A first pass **Conversation Skill** using Misty's Key Phrase Recognition (wake word),  Azure 
Speech To Text (STT) and Azure Text To Speech (TTS)

https://github.com/wwlib/misty-azure

Misty II - Conversation Skill (V2)
https://youtu.be/-DtE3KhRmNQ

Misty II - Conversation Skill (V2) w/Console
https://youtu.be/HJD_yYEE2v8

#### Azure Function Apps

The Azure services are implemented as a Function Apps 
- *AudioToIntent* takes an audio input and an NLU intent (Used by Conversation Skill V2)
- *TextToSpeech* takes a text input and returns a TTS response (Used by Conversation Skill V2)
- *AudioToTTSResponse* takes an audio input and returns a TTS response (Used by Conversation Skill V1)

Conversation Skill V2 calls the AudioToIntent function app using Misty's *misty.SendExternalRequest()* On-robot api call. The function app makes a call to LUIS NLU and then returns an intent as a string.

Then Conversation Skill V2 calls the TextToSpeech function app and plays the audio that is returned.

Conversation Skill V2 uses *misty.StartKeyPhraseRecognition()* to listen for the "Hey Misty" key phrase (i.e. wake-up word)

#### example
With Conversation V2 Skill running:
- say "Hey, Misty"
- Misty will set her LED to BLUE to indicate that she is listening
- say "do you know any jokes?"
- Misty will say: "Where does the general keep his armies? ,, In his sleevies."

- say "Hey, Misty"
- Misty will set her LED to BLUE to indicate that she is listening
- say "what time is it?"
- Misty will say: "The time is *current-time*."

#### Azure funciton example: AudioToIntent
This folder contains the code for an Azure Fucnction App that processes audio from Misty and returns an intent. The function manages:
- speech to text
- text to intent (NLU via LUIS)

``` javascript
try {
    const accessToken = await getAccessToken();
    const utterance = await speechToText(accessToken, audioBase64, context);
    await textToIntent(accessToken, utterance, context);
} catch (err) {
    context.log(`Something went wrong: ${err}`);
}
```

Note: Each function requires data from its `config.json`:
```
{
    "Microsoft": {
        "AzureSpeechSubscriptionKey": "<YOUR-BING-SUBSCRIPTION-KEY>",
        "nluLUIS_endpoint": "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/",
        "nluLUIS_appId": "<YOUR-LUIS-APP-ID>",
        "nluLUIS_subscriptionKey": "<YOUR-LUIS-SUBSCRIPTION-KEY>"
    }
}
```

#### tools
The tools foldler contains node/javascript tools for testing the calls to azure:

- post-to-azure-audio-to-intent.js
- post-to-azure-audio-to-tts-response.js
- post-to-azure-text-to-tts.js
- test-azure-speech-bae64.js
- test-azure-speech-wav.js
- test-azure-tts.js
- test-luis-nlu.js

Note: Each of these tools requires data from `config.json`:
```
{
    "Microsoft": {
        "AudioToTTSFunctionURL": "",
        "AudioToIntentFunctionURL": "",
        "TextToTTSFunctionURL": ""
    }
}
```

#### reference

##### misc
- https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-speech-to-text
- https://www.henkboelman.com/speech-to-text-in-an-azure-function-using-the-bing-speech-api/
- https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/quickstart-js-node
- https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/troubleshooting
- https://www.twilio.com/docs/usage/tutorials/serverless-webhooks-azure-functions-and-node-js

##### Azure
- https://markheath.net/post/avoiding-azure-functions-cold-starts
