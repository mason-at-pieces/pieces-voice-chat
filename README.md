# pieces-voice-chat

This is a simple voice chat CLI application that allows users to communicate with [pieces](https://pieces.app) other using their voice.

## Installation

1. Clone the repository and switch to the project directory
```bash
git clone https://github.com/mason-at-pieces/pieces-voice-chat.git
cd pieces-voice-chat
```

2. Install the dependencies
```bash
npm install
```

3. Run the application
```bash
node src/index.js
```

or you can use the prebuild docker image

```bash
# make sure your microphone is connected to the host machine and can be accessed by the operating system
docker run -it --device /dev/snd:/dev/snd ghcr.io/mason-at-pieces/pieces-voice-chat:latest
```
