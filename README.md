# pieces-voice-chat

A simply cli that allows you to have conversations with Pieces OS using just your voice.

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
npm run start
```

or you can use the prebuild docker image (currently only on Linux, for MacOS and Windows you need a way to passthrough a microphone to the container)

```bash
# make sure your microphone is connected to the host machine and can be accessed by the operating system
docker run -it --device /dev/snd:/dev/snd ghcr.io/mason-at-pieces/pieces-voice-chat:latest
```
