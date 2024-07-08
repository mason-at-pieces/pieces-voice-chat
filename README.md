# pieces-voice-chat

__Overview__

A simply cli that allows you to have conversations with Pieces OS using just your voice.

__Table of Contents__

1. [Introduction](#introduction)
2. [Setup Instructions](#setup_instructions)
	- [Prerequisites](#prerequisites)
	- [Installation](#installation)
	- [Usage](#usage)
3. [Voice-Enabled Conversation Setup](#voice_enabled_conversation_setup)
4. [Troubleshooting](#troubleshooting)

## Introduction <a name="introduction"></a>

Include detailed instructions on setting up and configuring the application to communicate with Pieces OS 100% on-device.

## Setup Instructions <a name="setup_instructions"></a>

__Prerequisites__ <a name="prerequisites"></a>

Before starting, ensure you have the following installed:

- Node.js: Version 16.0.0 or higher
- NPM (Node Package Manager) or Yarn

__Installation__ <a name="installation"></a>

Clone the repository and install dependencies:

```bash
git clone https://github.com/mason-at-pieces/pieces-voice-chat.git pieces-voice-chat
cd pieces-voice-chat
npm install
```

__Usage__ <a name="usage"></a>

Start the application:

```bash
npm run start
```

## Voice-Enabled Conversation Setup <a name="voice_enabled_conversation_setup"></a>

To initiate voice-enabled conversations with Pieces OS 100% on-device:

1. ***Ensure Pieces OS is Running Locally***: Start Pieces OS on your local machine using the installation method appropriate for your operating system. Refer to the Pieces OS [Installation Guide for detailed instructions](https://docs.pieces.app/installation-getting-started/pieces-os#installation-guide).
2. ***Integrate with Local Setup***: Modify your application logic (`transcribeAndRespond` function) to communicate with Pieces OS's local endpoint (`http://localhost:1000`). Ensure the application can transcribe audio inputs and respond using local machine learning models managed by Pieces OS.
3. ***Launch the Application***: Run the application by executing `npm run start` in your terminal.
4. ***Start Recording***: Press the `SPACE` key to start recording your voice input.
5. ***Speak Your Command***: Clearly speak your question or command into the microphone.
6. ***Receive Response***: Listen for the response from Pieces OS, which will be played back automatically.

## Troubleshooting <a name="troubleshooting"></a>

If you encounter any issues during setup or usage, consider the following steps:

- ***Check Dependencies***: Verify that all required dependencies are installed correctly.
- ***Review Console Output***: Look for error messages or warnings in the console output.
- ***Community Support***: Visit the Issues page for common [issues](https://github.com/mason-at-pieces/pieces-voice-chat/issues) or seek assistance from the community.

By following these steps, your `pieces-voice-chat` project will effectively integrate with Pieces OS 100% on-device, providing a seamless voice interaction experience powered by local machine learning capabilities.

