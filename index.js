const {app, BrowserWindow, ipcMain, protocol} = require('electron')
const path = require('path')
const fs = require('fs')
let mediaLibrary = []
let win
let settingsWindow
let addMediaWindow
let currentTheme = 'light'
let shownResults = []

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



const createWindow = () =>{
    win = new BrowserWindow({
        width:1200,
        height:700,
        minWidth:800,
        minHeight:400,
        webPreferences:{
            preload: path.join(__dirname,"preload.js")
        }
    })
    win.loadFile('index.html')
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
    event.reply('play-next-media',shownResults[prevIndex], prevIndex)
})