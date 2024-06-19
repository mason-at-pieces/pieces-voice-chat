const fs = require("fs");
const { OpenAI } = require("openai");
const { PiecesClient } = require("pieces-copilot-sdk");
const player = require('play-sound')(opts = {})
const WaveFile = require('wavefile').WaveFile;

require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function transcribeAndRespond(filePath) {
  try {
    console.log("Transcribing audio...\n");

    await (async () => {
      const { pipeline } = await import('@xenova/transformers');

      // Get buffer from file
      const buffer = await fs.promises.readFile(filePath)

      // Read .wav file and convert it to required format
      let wav = new WaveFile(buffer);
      wav.toBitDepth('32f'); // Pipeline expects input as a Float32Array
      wav.toSampleRate(16000); // Whisper expects audio with a sampling rate of 16000
      let audioData = wav.getSamples();
      if (Array.isArray(audioData)) {
        if (audioData.length > 1) {
          const SCALING_FACTOR = Math.sqrt(2);

          // Merge channels (into first channel to save memory)
          for (let i = 0; i < audioData[0].length; ++i) {
            audioData[0][i] = SCALING_FACTOR * (audioData[0][i] + audioData[1][i]) / 2;
          }
        }

        // Select first channel
        audioData = audioData[0];
      }

      console.log("Audio data read successfully.\n")

      // Transcribe the audio
      const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small.en');
      const output = await transcriber(audioData);

      console.log(`USER:\n${output.text}\n`);

      // console.log("\nProcessing transcription...\n");
      const piecesClient = new PiecesClient({
        baseURL: 'http://localhost:1000',
      });

      const answer = await piecesClient.askQuestion({
        question: output.text,
      });

      console.log(`BOT:\n${answer}`);

      const synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts', { quantized: false });
      const speaker_embeddings = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';
      const out = await synthesizer(answer, { speaker_embeddings });

      const responseFilePath = 'recordings/response.wav';
      wav.fromScratch(1, out.sampling_rate, '32f', out.audio);
      fs.writeFileSync(responseFilePath, wav.toBuffer());

      // // Play the speech file
      player.play(responseFilePath, function(err){
        if (err) throw err
      })
    })();
  } catch (error) {
    console.error("Error during transcription or processing:", error);
  }
}

module.exports = transcribeAndRespond;
