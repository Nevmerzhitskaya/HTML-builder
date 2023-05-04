const { createReadStream } = require('node:fs');
const path = require('path');

const filePath = path.join('01-read-file/', 'text.txt');
const readStream = createReadStream(filePath);

readStream.on('data', (data) => {
  console.log(data.toString());
});