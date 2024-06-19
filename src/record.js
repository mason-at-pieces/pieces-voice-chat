// Import required modules
const mic = require('mic');
const fs = require('fs');
const readline = require('readline');
const transcribeAndRespond = require('./transcribe');

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
