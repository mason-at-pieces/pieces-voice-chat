// Import required modules
const mic = require('mic');
const fs = require('fs');
const readline = require('readline');
const { PiecesClient } = require("pieces-copilot-sdk");
const player = require('play-sound')(opts = {})
const WaveFile = require('wavefile').WaveFile;

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

      // Transcribe the audio
      const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
      const output = await transcriber(audioData);

      console.log(`USER:\n${output.text}\n`);

      // console.log("\nProcessing transcription...\n");
      const piecesClient = new PiecesClient({
        baseUrl: 'http://localhost:1000',
      });

      const answer = await piecesClient.askQuestion({
        question: output.text,
      });

      if (!answer) {
        console.log("BOT: I'm sorry, I ran into an issue and couldn't generate a response. Please try again.");
        return;
      }

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


// Define audio configuration
const audioConfig = {
  rate: '16000',
  channels: '1',
  fileType: 'wav',
};

// Initialize mic with the audio configuration
let micInstance;
let recordingInProgress = false; // Flag to control recording state

// Function to start recording
function startRecording() {
  micInstance = mic(audioConfig);
  const micInputStream = micInstance.getAudioStream();
  const fileName = `recordings/output.${audioConfig.fileType}`;
  const outputFileStream = fs.createWriteStream(fileName);

  micInputStream.pipe(outputFileStream);

  micInputStream.on('startComplete', () => {
    console.log("Recording in progress... Press SPACE to stop.");
    recordingInProgress = true;
  });

  micInputStream.on('stopComplete', async () => {
    console.log("Recording stopped.");
    recordingInProgress = false;

    // End file stream
    outputFileStream.end();

    // Dynamically import ora
    // const ora = (await import('ora')).default;

    // Start spinner
    // const spinner = ora('Generating response...').start();

    // Process the recorded file
    await transcribeAndRespond(fileName);

    // Stop spinner
    // spinner.stop();

    // Ask for the next question
    console.log("\nPress SPACE to ask another question or Q to exit.");
  });

  micInputStream.on('error', (err) => {
    console.error('Error occurred: ', err);
  });

  micInstance.start();
}

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

// Listen for keypress events
process.stdin.on('keypress', (str, key) => {
  if (key.name === 'space') {
    if (recordingInProgress) {
      console.log("SPACE key pressed. Stopping recording...");
      micInstance.stop();
    } else {
      console.log("\nSPACE key pressed. Starting recording...");
      startRecording();
    }
  } else if (key.name === 'q') {
    console.log("\nQ key pressed. Stopping recording and exiting...");
    if (recordingInProgress) {
      micInstance.stop();
    }
    rl.close();
    process.stdin.setRawMode(false);
    process.stdin.pause();
  } else if (key.ctrl && key.name === 'c') {
    process.exit();
  }
});

// Start recording if this script is the main module
if (require.main === module) {
  console.log("Press SPACE to start recording.");
}
