const fsPromises = require('node:fs/promises');
const { stat } = require('fs');

const path = require('path');
const filePath = path.join('03-files-in-folder', 'secret-folder');

const showFileList = async () => {
  try {
    const fileList = await fsPromises.readdir(filePath, { withFileTypes: true });

    for (const file of fileList) {
      if (!file.isDirectory()) {
        stat(path.join(filePath, file.name), (err, stats) => {
          if (err) {
            console.log(err);
          } else {
            console.log(`${path.parse(file.name).name} - ${path.extname(file.name).substring(1)} - ${stats.size} bytes`);
          }
        });
      }
    }
  } catch (error) {
    console.error(error.name + ':', 'Operation failed');
  }
}

showFileList();