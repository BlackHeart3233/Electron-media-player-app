globalThis.File =require('node:buffer').File
const {app, BrowserWindow, ipcMain, protocol} = require('electron')
const path = require('path')
const fs = require('fs')
const record = require('node-record-lpcm16')
const OpenAI = require('openai')
let client
let recording
let mediaLibrary = []
let currentShownCommands = ["play", "pause", "next", "back", "change theme"]
let win
let settingsWindow
let addMediaWindow
let currentTheme = 'light'
let shownResults = []
let currentIndex = 0
let keyApiValue = ""

async function init() {
  try {
    const data = await fs.promises.readFile('apiKey.txt', 'utf8')
    keyApiValue = data.trim()
    //console.log("API key loaded:", keyApiValue)
    client = new OpenAI({
        apiKey: keyApiValue
    })
  } catch (err) {
    console.error("Error reading API key from file:", err)
  }
}
init()


protocol.registerSchemesAsPrivileged([
    {
        scheme: 'app',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            stream: true
        }
    }
])


async function saveMediaLibrary(){
    try{
        await fs.promises.writeFile('MediaLibraryAppSave.json', JSON.stringify(mediaLibrary, null, 2), 'utf8')
    }catch(err){
        console.error("Error saving media library", err);
    }
}

async function  loadMediaLibrary(){
    try{
        if(fs.existsSync("./MediaLibraryAppSave.json")){
        const data = await fs.promises.readFile('MediaLibraryAppSave.json', 'utf8')
        mediaLibrary.push(...JSON.parse(data))
        shownResults = mediaLibrary
        }
    }catch(err){
        console.error("Error loading media library", err);
    }
}

const createWindow = () => {
    win = new BrowserWindow({
        width: 1200,
        height: 700,
        minWidth: 800,
        minHeight: 400,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    })
    win.loadFile('index.html')
    win.webContents.on('did-finish-load', () => {
        win.webContents.send('showCommands', currentShownCommands)
    })
}

function createSettingsWindow(){
    settingsWindow = new BrowserWindow({
        width:300,
        height:200,
        minWidth:200,
        minHeight:100,
        webPreferences:{
            preload: path.join(__dirname,"preload.js")
        },
        parent:win,
        modal: true
    })
    settingsWindow.loadFile("settings.html")
    settingsWindow.webContents.on("did-finish-load", () => {
        settingsWindow.webContents.send(
            'themeChanged',
            currentTheme
        )
    })
}

function addMedia(){
    addMediaWindow = new BrowserWindow({
        width:500,
        height:500,
        minWidth:200,
        minHeight:100,
        webPreferences:{
            preload: path.join(__dirname,"preload.js")
        },
        parent:win,
        modal: true
    })
    addMediaWindow.loadFile("addMedia.html")
    addMediaWindow.webContents.on('did-finish-load', () => {
        addMediaWindow.webContents.send(
            'themeChanged',
            currentTheme
        )
    })
    addMediaWindow.on('closed', () => {
        addMediaWindow = null
    })
}


app.whenReady().then(async ()=>{
        protocol.handle('app', async (request) => {
            const url = request.url.replace('app://', '')
            const filePath = path.join(__dirname, url)
            const data = await fs.promises.readFile(filePath)
            if (filePath.endsWith('.mp4')) {
                return new Response(data, {
                    headers: {
                        'content-type': 'video/mp4'
                    }
                })
            }
            if (filePath.endsWith('.mp3')) {
                return new Response(data, {
                    headers: {
                        'content-type': 'audio/mpeg'
                    }
                })
            }
            if (filePath.endsWith('.png')) {
                return new Response(data, {
                    headers: {
                        'content-type': 'image/png'
                    }
                })
            }
            return new Response(data)
        })
        await loadMediaLibrary()
        createWindow()
        win.webContents.on('did-finish-load', () => {
            win.webContents.send("media-data", mediaLibrary)

        })
    })


app.on('window-all-closed',async  () =>{
    await saveMediaLibrary()
    if(process.platform !== 'darwin') app.quit()
})

ipcMain.on('open_settings', () =>{
    createSettingsWindow();
})

ipcMain.on('addMedia', () =>{
    addMedia();
})

ipcMain.on('log', (event, message) =>{
    console.log("Log from renderer:", message)
})

ipcMain.on('changeIndex', (event, index) =>{
    currentIndex = index
})

ipcMain.on('addMediaToLibrary', (event, mediaData) =>{
    mediaLibrary.push(...mediaData)
    shownResults = mediaLibrary
    addMediaWindow.close()
    win.webContents.send("media-data", mediaLibrary);
})

ipcMain.on('changeTheme',(event, theme)=>{
    currentTheme = theme
    win.webContents.send('themeChanged', theme)
    if(settingsWindow){
        settingsWindow.webContents.send('themeChanged', theme)
    }
    if(addMediaWindow){
        addMediaWindow.webContents.send('themeChanged', theme)
    }
})

ipcMain.on('searchMedia', (event, text, type, exact) => {
    if(text === ""){
        shownResults = mediaLibrary
        event.reply('media-data', mediaLibrary)
        return
    }
    shownResults = mediaLibrary.filter(media => {
        let value = String(media[type])
        if(!exact){
            value = value.toLowerCase()
            text = text.toLowerCase()
        }
        return value.includes(text)
    })
    event.reply('media-data', shownResults)
})


ipcMain.on('sortMedia', (event, type, direction) => {
    const sorted = [...shownResults].sort((a, b) => {
        const valA = a[type]
        const valB = b[type]
        if(typeof valA === 'string'){
            if(direction === 'asc'){
                return valA.localeCompare(valB)
            }
            return valB.localeCompare(valA)
        }
        if(direction === 'asc'){
            return valA - valB
        }
        return valB - valA
    })
    event.reply('media-data', sorted)
})


ipcMain.on('shufflePlay', (event) => {
    if(shownResults.length === 0){
        return
    }
    const randomIndex = Math.floor(Math.random() * shownResults.length)
    event.reply('play-next-media',shownResults[randomIndex], randomIndex)
})

ipcMain.on('playNext', (event, currentIndex) => {
    if(shownResults.length === 0){
        return
    }
    let nextIndex = currentIndex + 1
    if(nextIndex >= shownResults.length){
        nextIndex = 0
    }
    currentIndex = nextIndex
    event.reply(
    'play-next-media',
    shownResults[nextIndex],
    nextIndex
)
})

ipcMain.on('playPrev', (event, currentIndex) => {
    if(shownResults.length === 0){
        return
    }
    let prevIndex = currentIndex - 1
    if(prevIndex < 0){
        prevIndex = shownResults.length - 1
    }
    currentIndex = prevIndex
    event.reply('play-next-media',shownResults[prevIndex], prevIndex)
})
const { exec } =
    require('child_process')

async function speak(text) {

    const response =
        await client.audio.speech.create({
            model: 'gpt-4o-mini-tts',
            voice: 'alloy',
            input: text
        })

    const buffer = Buffer.from(
        await response.arrayBuffer()
    )

    const fileName =
        `speech-${Date.now()}.mp3`

    fs.writeFileSync(fileName, buffer)

    win.webContents.send(
        'playSpeech',
        fileName
    )
}

ipcMain.on('startVoiceRecognition',async () => {
        await recordVoice()
        await sendAudioToTranscription()
})

function recordVoice(){
    return new Promise((resolve, reject) => {
        console.log("Recording...")
        exec(
            'sox -t waveaudio default voice.wav trim 0 3',
            (error) => {
                if(error){
                    console.log(error)
                    reject(error)
                    return
                }
                console.log(
                    "Recording stopped"
                )
                resolve()
            }
        )
    })
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendAudioToTranscription(){
    /*const transcription = await client.audio.transcriptions.create({
            file: fs.createReadStream(
                './voice_commands/pause_command.mp3'
            ),
            model: 'whisper-1'
        })*/
    const transcription = await client.audio.transcriptions.create({
        file: fs.createReadStream('voice.wav'),
        model: 'whisper-1',
        language: 'en',
        prompt: 'Voice commands: play, pause, next, back, change theme'
    });
    /*const transcription = {
        text: "change theme to dark"
    }*/
    console.log("Transcription: " + transcription.text)
    if(transcription.text.toLowerCase().includes("play")){
        win.webContents.send('VoiceCommand','play',currentIndex)
        await speak('Play command recognized, playing media')
        //win.webContents.send('onAlert', `Play command recognized, playing media`)
    }else if(transcription.text.toLowerCase().includes("pause")){
        win.webContents.send('VoiceCommand','pause',currentIndex)
        await speak('Pause command recognized, pausing media')
        //win.webContents.send('onAlert', `Pause command recognized, pausing media`)
    }else if(transcription.text.toLowerCase().includes("next")){
        win.webContents.send('VoiceCommand','next',currentIndex)
        await speak('Next command recognized, going to next media')
        //win.webContents.send('onAlert', `Next command recognized, going to next media`)
    }else if(transcription.text.toLowerCase().includes("back")){
        win.webContents.send('VoiceCommand','back',currentIndex)
        await speak('Back command recognized, going to previous media')
        //win.webContents.send('onAlert', `Back command recognized, going to previous media`)
    }else if(transcription.text.toLowerCase().includes("change theme")){
        //win.webContents.send('onAlert', "Listening for theme choice (3 seconds)... dark or light")
        await speak('Listening for theme choice (3 seconds)... dark or light')
        currentShownCommands = ["dark", "light"]
        win.webContents.send('showCommands', currentShownCommands)
        await recordVoice()
        let transcription = await client.audio.transcriptions.create({
            file: fs.createReadStream(
                'voice.wav'
            ),
            model: 'whisper-1',
            language: 'en',
            prompt: 'Voice commands: dark, light'
        })
        if(transcription.text.toLowerCase().includes("dark")){
            currentTheme = 'dark'   
        }else if(transcription.text.toLowerCase().includes("light")){
            currentTheme = 'light'
        }else{
            await speak('Choice not recognized, theme unchanged. U said: ' + transcription.text)
            //win.webContents.send('onAlert', "Choice not recognized, theme unchanged. U said: " + transcription.text)
            currentShownCommands = ["play", "pause", "next", "back", "change theme"]
            win.webContents.send('showCommands', currentShownCommands)
            return
        }
        //console.log(`Changing theme to ${currentTheme}`)
        win.webContents.send('themeChanged', currentTheme)
        if(settingsWindow){
            settingsWindow.webContents.send('themeChanged', currentTheme)
        }
        if(addMediaWindow){
            addMediaWindow.webContents.send('themeChanged', currentTheme)
        }
        currentShownCommands = ["play", "pause", "next", "back", "change theme"]
        //win.webContents.send('onAlert', `Theme changed successfully to ${currentTheme}`)
        await speak(`Theme changed successfully to ${currentTheme}`)
        win.webContents.send('showCommands', currentShownCommands)
    }else{
        //win.webContents.send('onAlert', "Voice command not recognized. U said: " + transcription.text)
        await speak("Voice command not recognized. U said: " + transcription.text)
    }

}

