const fs = require("fs");
const { OpenAI } = require("openai");
const { PiecesClient } = require("pieces-copilot-sdk");
const player = require('play-sound')(opts = {})

require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function transcribeAndRespond(filePath) {
  try {
    console.log("Transcribing audio...\n");
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });

    console.log(`USER:\n${transcription.text}\n`);

    // console.log("\nProcessing transcription...\n");
    const piecesClient = new PiecesClient({
      baseURL: 'http://localhost:1000',
    });

    const answer = await piecesClient.askQuestion({
      question: transcription.text,
    });

    console.log(`BOT:\n${answer}`);

    const speechFile = "recordings/response.mp3";

    const responseSpeech = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: answer,
    });

    const buffer = Buffer.from(await responseSpeech.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);

    // Play the speech file
    player.play(speechFile, function(err){
      if (err) throw err
    })
  } catch (error) {
    console.error("Error during transcription or processing:", error);
  }
}

module.exports = transcribeAndRespond;
