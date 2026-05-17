# Electron Media Player App

Desktop multimedia player built with Electron featuring media playback, filtering, sorting, themes, custom CSP protocol handling, and automated E2E testing using Playwright.

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

---

## Technologies

- Electron
- JavaScript
- HTML/CSS
- Node.js
- Playwright

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
├── Folder_for_test/
├── playwright-report/
└── package.json
```

---

## Security

The application uses:

- Content Security Policy (CSP)
- Custom `app://` Electron protocol
- Context isolation via preload scripts
- IPC communication between renderer and main process

---

## Author

BlackHeart323

---

## License

MIT
