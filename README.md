# Electron Media Player App

Desktop multimedia player built with Electron featuring media playback, filtering, sorting, themes, OpenAI voice commands, AI speech feedback, custom CSP protocol handling, and automated E2E testing using Playwright.

---

## Features

- Media library management
- Video playback
- Filtering media items
- Sorting media items
- Dark / Light theme switching
- Shuffle and repeat playback
- Custom Electron protocol (`app://`)
- Content Security Policy (CSP)
- Save/load media library to JSON
- Playwright E2E tests
- Voice command recognition using OpenAI Whisper
- AI text-to-speech voice feedback
- Background speech playback inside Electron
- Voice-controlled media navigation

---

## Technologies

- Electron
- JavaScript
- HTML/CSS
- Node.js
- Playwright
- OpenAI API
- Whisper-1
- GPT-4o Mini TTS
- Electron IPC
- SoX

---

## Installation

Clone the repository:

```bash
git clone https://github.com/BlackHeart3233/Electron-media-player-app.git
```

Open the project:

```bash
cd Electron-media-player-app
```

Install dependencies:

```bash
npm install
```

Create an `apiKey.txt` file in the project root and paste your OpenAI API key inside.

Example:

```text
sk-xxxxxxxxxxxxxxxx
```

---

## Requirements

The following tools must be installed and available in PATH:

- Node.js
- npm
- SoX

### SoX Installation

Windows:
https://sourceforge.net/projects/sox/files/latest/download

Verify installation:

```bash
sox --version
```

---

## Running the App

Start the Electron application:

```bash
npm start
```

---

## Packaging

Package the application:

```bash
npm run package
```

Create distributables:

```bash
npm run make
```

---

## Voice Commands

The application supports voice control using OpenAI Whisper speech recognition.

Available commands:

- play
- pause
- next
- back
- change theme
- dark
- light

Voice feedback is generated using OpenAI Text-to-Speech and played directly inside Electron.

---

## Playwright Testing

Run all E2E tests:

```bash
npx playwright test
```

Open the HTML report:

```bash
npx playwright show-report
```

---

## Project Structure

```text
├── index.js
├── preload.js
├── renderer.js
├── index.html
├── settings.html
├── addMedia.html
├── index_light.css
├── index_dark.css
├── settings_light.css
├── settings_dark.css
├── addMedia_light.css
├── addMedia_dark.css
├── voice.wav
├── MediaLibraryAppSave.json
├── apiKey.txt
├── Folder_for_test/
├── playwright-report/
└── package.json
```

---

## Voice Assistant Architecture

1. User records voice command
2. Audio recorded with SoX
3. Audio transcribed using OpenAI Whisper
4. Command processed in Electron main process
5. Media action executed via IPC
6. AI voice feedback generated using OpenAI TTS
7. Speech played inside Electron renderer

---

## Security

The application uses:

- Content Security Policy (CSP)
- Custom `app://` Electron protocol
- Context isolation via preload scripts
- IPC communication between renderer and main process
- Secure OpenAI API communication
- Isolated speech playback through Electron IPC

---

## Author

BlackHeart323

---

## License

MIT
