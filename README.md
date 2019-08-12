### misty conversation skill

The Misty **Conversation Skill** uses Microsoft Azure Cognitive Serices (SpeechToText, LUIS NLU, and Azure TextToSpeech) to implement a simple conversation with *Misty II*.

The Azure services are implemented as a Function App called *AudioToTTSResponse*

The Conversation Skill calls the AudioToTTSResponse Function App using Misty's *misty.SendExternalRequest()* On-robot api call.

The Conversation Skill uses *misty.StartKeyPhraseRecognition()* to listen for the "Hey Misty" key phrase (i.e. wake-up word)

#### example
With the Conversation skill running:
- say "Hey, Misty"
- Misty will make a sound and set her LED to BLUE to indicate that she is listening
- say "do you know any jokes?"
- Misty will say: "Where does the general keep his armies? ,, In his sleevies."

- say "Hey, Misty"
- Misty will make a sound and set her LED to BLUE to indicate that she is listening
- say "what time is it?"
- Misty will say: "The time is *something* o'clock."

#### AudioToTTSResponse
This folder contains the code for an Azure Fucnction App that processes audio from Misty and returns a TTS reponse. The AudioToTTSResponse function manages:
- speech to text
- text to intent (NLU via LUIS)
- intent to response text (skill logic)
- response text to TTS

``` javascript
try {
    const accessToken = await getAccessToken();
    const utterance = await speechToText(accessToken, audioBase64, context);
    const intent = await textToIntent(accessToken, utterance, context);
    const responseText = await intentToResponseText(accessToken, intent, context);
    await textToSpeech(accessToken, responseText, context);
} catch (err) {
    context.log(`Something went wrong: ${err}`);
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
