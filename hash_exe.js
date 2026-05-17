const fs = require('fs')
const crypto = require('crypto')
const filePath = './out/make/squirrel.windows/x64/electron_3_sklop-1.0.0 Setup.exe'
const fileBuffer = fs.readFileSync(filePath)

const hash = crypto
    .createHash('sha256')
    .update(fileBuffer)
    .digest('hex')

console.log('SHA-256 hash:')
console.log(hash)