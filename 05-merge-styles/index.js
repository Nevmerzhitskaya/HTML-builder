const fsPromises = require('node:fs/promises');
const { createReadStream } = require('node:fs');
const { createWriteStream } = require('node:fs');

const path = require('path');
const filePath = path.join('05-merge-styles', 'styles');
const pathCopy = path.join('05-merge-styles', 'project-dist', 'bundle.css');
const writeStream = createWriteStream(pathCopy);

const mergeCssFiles = async () => {
  try {
    const fileList = await fsPromises.readdir(filePath, { withFileTypes: true });
    let promises = [];

    for (const file of fileList) {
      if (!file.isDirectory() && path.extname(file.name).substring(1) === 'css') {
        promises.push(readFile(path.join(filePath, file.name)));
      }
    }
    Promise.all(promises).then((values) => {
      for (let index = 0; index < values.length; index++) {
        writeStream.write(values[index]);
      }

    });

  } catch (error) {
    console.error(error.name + ':', 'Operation failed');
  }
}


const readFile = async (filePath) => {
  const readStream = createReadStream(filePath);
  let file = '';

  return new Promise((resolve, reject) => {
    readStream.on('data', (data) => {
      file += data.toString();
    }).on('end', () => resolve(file)).on('error', error => reject(error));
  });

}

mergeCssFiles();