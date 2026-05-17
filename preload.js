const {contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('AppAPI',{
    openSettings:() =>{
        ipcRenderer.send('open_settings')
    },
    changeTheme:(theme)=>{
        ipcRenderer.send('changeTheme', theme)
    },
    onThemeChanged:(callback)=>{
        ipcRenderer.on('themeChanged',(event, theme)=>{
            callback(theme)
        })
    },
    addMedia:() =>{
        ipcRenderer.send('addMedia')
    },
    addMediaToLibrary:(mediaData) =>{
        ipcRenderer.send('addMediaToLibrary', mediaData)
    },
    log: (message) => {
        ipcRenderer.send('log', message)
    },
    searchMedia:(text, type, exact) =>{
        ipcRenderer.send('searchMedia', text, type, exact)
    },
    SortMedia:(type, direction) =>{
        ipcRenderer.send('sortMedia', type, direction)
    },
    shufflePlay: (isShuffling) => {
        ipcRenderer.send('shufflePlay')
    },
    playNext: (currentIndex) => {
        ipcRenderer.send('playNext',currentIndex)
    },
    playPrev: (currentIndex) => {
        ipcRenderer.send('playPrev',currentIndex)
    }

})

contextBridge.exposeInMainWorld("electronAPI", {
    onMediaData: (callback) => ipcRenderer.on("media-data", callback),
    onPlayNextMedia: (callback) =>ipcRenderer.on("play-next-media", callback)
});

