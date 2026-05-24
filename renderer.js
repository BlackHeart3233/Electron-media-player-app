const btn = document.getElementById('setting_BTN')
const light_btn = document.getElementById('light_theme')
const dark_btn = document.getElementById('dark_theme')
const add_media_btn = document.getElementById('add_media_BTN')
const add_media_submit_btn = document.getElementById('submit_add_media')
const jsonFileInput = document.getElementById('json_file')
const errorLabel_addMedia = document.getElementById('error_add_media')
const searchMediaInput = document.getElementById('search_input')
const searchMediaType = document.getElementById('search_type')
const searchMediaExact = document.getElementById('search_exact')
const sortTypeMedia = document.getElementById('sort_type')
const sortDirectionMedia = document.getElementById('sort_direction')
const videoPlayer = document.getElementById('video-player')
const repeatBtn = document.getElementById('repeat-btn')
const prevBtn = document.getElementById('prev-btn')
const playBtn = document.getElementById('play-btn')
const nextBtn = document.getElementById('next-btn')
const shuffleBtn = document.getElementById('shuffle-btn')
const speechBtn = document.getElementById('speech_BTN')

let currentIndex = 0

if(speechBtn){

    speechBtn.addEventListener('click', () => {

        window.AppAPI.startVoiceRecognition()
    })
}


if(playBtn){
    playBtn.addEventListener('click', () => {
       if(videoPlayer.src){
        if(videoPlayer.paused){
            videoPlayer.play()
        }else{
            videoPlayer.pause()
        }
         }
    })
}

if(nextBtn){
    nextBtn.addEventListener('click', () => {
        if(repeatBtn.value === '1'){
            videoPlayer.currentTime = 0
            videoPlayer.play()
            return
        }
        if(shuffleBtn.value === '1'){
            window.AppAPI.shufflePlay()
        }else{
            window.AppAPI.playNext(currentIndex)
        }
    })
}

if(prevBtn){
    prevBtn.addEventListener('click', () => {
        window.AppAPI.playPrev(currentIndex)
    })
}

if(videoPlayer){
    videoPlayer.addEventListener('ended', (e) => {
        if(repeatBtn.value === '1'){
            videoPlayer.currentTime = 0
            videoPlayer.play()
            return
        }
        if(shuffleBtn.value === '1'){
            window.AppAPI.shufflePlay()
        }else{
            window.AppAPI.playNext(currentIndex)
        }
    })
}

if(shuffleBtn){
    shuffleBtn.addEventListener('click', () => {
        const isShuffling = shuffleBtn.value === '1'
        shuffleBtn.value = isShuffling ? '0' : '1'
        if(shuffleBtn.value === '1'){
            shuffleBtn.classList.add('active')
        }else{
            shuffleBtn.classList.remove('active')
        }
    })
}
if(repeatBtn){
    repeatBtn.addEventListener('click', () => {
        const isRepeating = repeatBtn.value === '1'
        repeatBtn.value = isRepeating ? '0' : '1'
        if(repeatBtn.value === '1'){
            repeatBtn.classList.add('active')
        }else{
            repeatBtn.classList.remove('active')
        }
    }) 
}

if(sortTypeMedia && sortDirectionMedia){
    sortTypeMedia.addEventListener('change', () =>{
        let type = sortTypeMedia.value
        let direction = sortDirectionMedia.value
        window.AppAPI.SortMedia(type, direction)})

    sortDirectionMedia.addEventListener('change', () =>{
        let type = sortTypeMedia.value
        let direction = sortDirectionMedia.value
        window.AppAPI.SortMedia(type, direction)})
}

if(searchMediaInput){
    searchMediaInput.addEventListener('input', () => {
        let text = searchMediaInput.value;
        let type = searchMediaType.value;
        let exact = searchMediaExact.checked;
        window.AppAPI.searchMedia(text, type, exact);
    });
}

if(dark_btn){

    console.log("Dark button found")
    window.AppAPI.log("Dark button found in renderer")

    dark_btn.addEventListener('click', () => {
        window.AppAPI.changeTheme('dark')
    })
}
if(btn){
    btn.addEventListener('click',() =>{
        window.AppAPI.openSettings()
    })
}
if(add_media_btn){
    add_media_btn.addEventListener('click', () =>{
        window.AppAPI.addMedia()
    })
}
if(light_btn){
    light_btn.addEventListener('click', () =>{
        window.AppAPI.changeTheme('light')
    })
}
if(add_media_submit_btn){
    add_media_submit_btn.addEventListener('click', () =>{
        if(jsonFileInput.files.length > 0){
            const file = jsonFileInput.files[0]
            const reader = new FileReader()
            reader.onload = function(e){
                const content = e.target.result
                try{
                    const jsonData = JSON.parse(content)
                    for(const media of jsonData){
                        if (
                            typeof media.title !== "string" ||
                            typeof media.streamPath !== "string" ||
                            typeof media.picturePath !== "string" ||
                            typeof media.year !== "number" ||
                            typeof media.Author !== "string" ||
                            typeof media.Length !== "number"
                        ) 
                        {
                            errorLabel_addMedia.textContent = "Invalid JSON structure";
                            return;
                        }
                    }
                    window.AppAPI.addMediaToLibrary(jsonData)
                }
                catch(err){
                    errorLabel_addMedia.textContent = "Invalid JSON file";

                }
            }
            reader.readAsText(file)
        }else{
            errorLabel_addMedia.textContent = "Please select a JSON file";
            window.AppAPI.log("No file selected")
        }
    })
}

window.AppAPI.onThemeChanged((theme)=>{
    const style = document.getElementById('theme_id')
    const style_settings = document.getElementById('theme_id_settings')
    const style_addMedia = document.getElementById('theme_id_addMedia')
    if(style){
        if(theme === 'dark'){
            style.href = 'index_dark.css'
        }
        else{
            style.href = 'index_light.css'
        }
    }
    if(style_settings){
        if(theme === 'dark'){
            style_settings.href = 'settings_dark.css'
        }
        else{
            style_settings.href = 'settings_light.css'
        }
    }
    if(style_addMedia){
        if(theme === 'dark'){
            style_addMedia.href = 'addMedia_dark.css'
        }
        else{
            style_addMedia.href = 'addMedia_light.css'
        }
    }
})



window.electronAPI.onMediaData((event, mediaData) => {
    console.log("Received media data in renderer:", mediaData)
    const container = document.getElementById('media-container')
    container.innerHTML = ""
    mediaData.forEach((media, index) => {
        const mediaItem = document.createElement('div')
        mediaItem.classList.add('video-item')
        mediaItem.dataset.index = index
        const img = document.createElement('img')
        img.src = `app://${media.picturePath}`
        const textContainer = document.createElement('div')
        textContainer.classList.add('video-text')
        const titleSpan = document.createElement('span')
        titleSpan.textContent = media.title
        const yearSpan = document.createElement('span')
        yearSpan.textContent = media.year
        yearSpan.classList.add('video-year')
        textContainer.appendChild(titleSpan)
        textContainer.appendChild(yearSpan)
        mediaItem.appendChild(img)
        mediaItem.appendChild(textContainer)
        mediaItem.addEventListener('click', () => {
            currentIndex = index
            document.querySelectorAll('.video-item').forEach(item => {
                item.classList.remove('active')
            })
            mediaItem.classList.add('active')
            window.AppAPI.changeIndex(currentIndex)
            playMedia(media)
        })
        container.appendChild(mediaItem)
    })
})

function playMedia(media){
    const title = document.querySelector('.title')
    const author = document.querySelector('.author')
    const length = document.querySelector('.length')
    title.textContent = media.title
    author.textContent = media.Author
    videoPlayer.src = `app://${media.streamPath}`
    window.AppAPI.log(`app://${media.streamPath}`)
    window.AppAPI.log("Playing media:", videoPlayer.src)
    videoPlayer.play()
    videoPlayer.onloadedmetadata = () => {
        const duration = videoPlayer.duration
        length.textContent = `${duration.toFixed(0)} seconds`
        } 
}

window.electronAPI.onPlayNextMedia((event, media, index) => {
    currentIndex = index
    document.querySelectorAll('.video-item').forEach(item => {
        item.classList.remove('active')
    })
    const activeItem = document.querySelector(
        `[data-index="${index}"]`
    )
    if(activeItem){
        activeItem.classList.add('active')
    }
    playMedia(media)
})

window.electronAPI.VoiceCommand((command) => {
    window.AppAPI.log("Received voice command in renderer:", command)
    if(command === 'play'){
        if(videoPlayer.src){
            if(videoPlayer.paused){
                window.AppAPI.log("play command received")
                videoPlayer.play()
            }
        }
    }else if(command === 'pause'){
        if(videoPlayer.src){
            window.AppAPI.log("pause command received")
            videoPlayer.pause()
        }
    }else if(command === 'next'){
        window.AppAPI.log("next command received")
        window.AppAPI.playNext(currentIndex)
    }else if(command === 'back'){
         window.AppAPI.log("back command received")
        window.AppAPI.playPrev(currentIndex)
    }
})

window.electronAPI.onAlert((message) => {
    alert(message)
})

window.electronAPI.showCommands((commands) => {
    const commandsContainer = document.getElementById('commands_container')
    commandsContainer.innerHTML = ""
    commands.forEach(element => {
        const commandItem = document.createElement('div')
        commandItem.classList.add('command-item')
        commandItem.textContent = "🎤 "+element
        commandsContainer.appendChild(commandItem)
    });
})

window.electronAPI.onPlaySpeech(
    (fileName) => {
        const audio = new Audio(
            `app://${fileName}`
        )
        audio.play().catch(err => {
            console.error(err)
        })
        audio.onended = () => {
            window.AppAPI.log(
                "Speech finished"
            )
        }
        window.AppAPI.deleteSpeech(
                fileName
        )
    }
)