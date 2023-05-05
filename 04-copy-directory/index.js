const fsPromises = require('node:fs/promises');


const path = require('node:path');
const pathSource = path.join('04-copy-directory/', 'files');
const pathCopy = path.join('04-copy-directory/', 'files-copy');

async function makeDirectory() {
  try {
    await fsPromises.mkdir(pathCopy, { recursive: true });
  } catch {
    console.log('The folder could not be created');
  }
}

async function copyDirectory(pathSource, pathCopy) {

  await makeDirectory();
  await cleanDirectory(pathCopy);

  const fileList = await fsPromises.readdir(pathSource, { withFileTypes: true });

  for (const file of fileList) {
    copyFile(path.join(pathSource, file.name), path.join(pathCopy, file.name));
  }
}

async function cleanDirectory(pathCopy) {

  const fileList = await fsPromises.readdir(pathCopy, { withFileTypes: true });

  for (const file of fileList) {
    fsPromises.unlink(path.join(pathCopy,file.name));
  }
}

async function copyFile(pathSource, pathCopy) {
  try {
    await fsPromises.copyFile(pathSource, pathCopy);
  } catch {
    console.log('The file could not be copied');
  }
}

copyDirectory(pathSource, pathCopy);