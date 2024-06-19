// Import required modules
// @ts-ignore
import mic from 'mic';
import fs from 'fs';
import readline from 'readline';
import { PiecesClient } from 'pieces-copilot-sdk';
import player from 'play-sound';
import wavefile from 'wavefile';
import { pipeline } from '@xenova/transformers';

export const transcribeAndRespond = async (filePath: string) => {
  try {
    console.log("Transcribing audio...\n");

    // Get buffer from file
    const buffer = await fs.promises.readFile(filePath)

    // Read .wav file and convert it to required format
    let wav = new wavefile.WaveFile(buffer);
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
    const output = (await transcriber(audioData)) as {
      text: string;
    }
    console.log(`USER:\n${output.text as string}\n`);

    const piecesClient = new PiecesClient({
      baseUrl: 'http://localhost:1000',
    });

    const answer = await piecesClient.askQuestion({
      question: output.text,
    });

    if (!answer) {
      console.log("BOT: Sorry, I didn't understand your question. Please try again.");
      return;
    }

    console.log(`BOT:\n${answer}`);

    const synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts', { quantized: false });
    const speaker_embeddings = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';
    const out = await synthesizer(answer, { speaker_embeddings });

    const responseFilePath = 'recordings/response.wav';
    wav.fromScratch(1, out.sampling_rate, '32f', out.audio);
    fs.writeFileSync(responseFilePath, wav.toBuffer());

    // Play the speech file
    const playerInstance = player();
    playerInstance.play(responseFilePath, function(err: any){
      if (err) throw err
    })
  } catch (error) {
    console.error("Error during transcription or processing:", error);
  }
}


// Define audio configuration
const audioConfig = {
  rate: '16000',
  channels: '1',
  fileType: 'wav',
};

// Initialize mic with the audio configuration
let micInstance: any;
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

  micInputStream.on('error', (err: any) => {
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

// Display initial message
console.log("Press SPACE to start recording your question or Q to exit.");
