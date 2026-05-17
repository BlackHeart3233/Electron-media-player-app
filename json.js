
 const fs = require('fs').promises;
 const value =  [{
    title: "PATTY",
    streamPath: "media/Patty_2_stream.mp4",
    picturePath: "media/Patty_2.png",
    year: 1956,
    Author: "LeanBeefPatty",
    Length: 22.45,
},
{
    title: "I got a feeling",
    streamPath: "media/i_got_feeling_3_stream.mp3",
    picturePath: "media/i_got_feeling_3.png",
    year: 1900,
    Author: "Author name 1",
    Length: 3.45,
},
{
    title: "INTELLLLL",
    streamPath: "media/LTT_1_stream.mp4",
    picturePath: "media/LTT_1.png",
    year: 2003,
    Author: "Linus tech tips",
    Length: 18.45,
}
];

async function writeTofile(json) {
    try{
        await fs.writeFile('Media_data.json', JSON.stringify(json, null, 2), 'utf8');        console.log("File written successfully");
    }catch(err){
        console.error("Error writing file", err);
    }
}

writeTofile(value);