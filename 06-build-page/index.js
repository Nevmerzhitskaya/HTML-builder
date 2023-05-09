const fsPromises = require('node:fs/promises');
const { createReadStream } = require('node:fs');
const { createWriteStream } = require('node:fs');

const path = require('path');
const pathCssSource = path.join('06-build-page', 'styles');
const pathCssCopy = path.join('06-build-page', 'project-dist', 'style.css');
const pathComponents = path.join('06-build-page', 'components');
const pathHtmlSource = path.join('06-build-page', 'template.html');
const pathHtmlCopy = path.join('06-build-page', 'project-dist', 'index.html');
const pathSource = path.join('06-build-page', 'assets');
const pathCopy = path.join('06-build-page', 'project-dist', 'assets');


const makeDirectory = async (pathCopy) => {
  try {
    await fsPromises.mkdir(pathCopy, { recursive: true });
  } catch {
    console.log('The folder could not be created');
  }
}

const copyDirectory = async (pathSource, pathCopy) => {
  await makeDirectory(pathCopy);
  await cleanDirectory(pathCopy);

  const fileList = await fsPromises.readdir(pathSource, { withFileTypes: true });

  for (const file of fileList) {
    if (file.isDirectory()) {
      copyDirectory(path.join(pathSource, file.name), path.join(pathCopy, file.name));
    } else {
      copyFile(path.join(pathSource, file.name), path.join(pathCopy, file.name));
    }
  }
}

const cleanDirectory = async (pathCopy) => {

  const fileList = await fsPromises.readdir(pathCopy, { withFileTypes: true });

  for (const file of fileList) {
    if (file.isDirectory()) {
      cleanDirectory(path.join(pathCopy, file.name));
    } else {
      fsPromises.unlink(path.join(pathCopy, file.name));
    }
  }
}

const copyFile = async (pathSource, pathCopy) => {
  try {
    await fsPromises.copyFile(pathSource, pathCopy);
  } catch (error) {
    console.log(error, 'The file could not be copied');
  }
}

const mergeCssFiles = async (pathCssSource, pathCssCopy) => {
  const writeStream = createWriteStream(pathCssCopy);
  try {
    const fileList = await fsPromises.readdir(pathCssSource, { withFileTypes: true });
    let promises = [];

    for (const file of fileList) {
      if (!file.isDirectory() && path.extname(file.name).substring(1) === 'css') {
        promises.push(readCssFile(path.join(pathCssSource, file.name)));
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

const readCssFile = async (filePath) => {
  const readStream = createReadStream(filePath);
  let file = '';

  return new Promise((resolve, reject) => {
    readStream.on('data', (data) => {
      file += data.toString();
    }).on('end', () => resolve(file)).on('error', error => reject(error));
  });
}

const readTemplateFile = async (templateName) => {
  const filePath = path.join(pathComponents, `${templateName}.html`)
  const readStream = createReadStream(filePath);
  let file = '';
  return new Promise((resolve, reject) => {
    readStream.on('data', (data) => {
      file += data.toString();
    }).on('end', () => resolve({ name: templateName, file: file })).on('error', error => reject(error));
  });
}

const createHtml = async (pathHtmlSource, pathHtmlCopy) => {
  const readStream = createReadStream(pathHtmlSource);
  const writeStream = createWriteStream(pathHtmlCopy);
  let file = '';
  let promises = [];
  const regexp = /{{(.*?)}}/g;

  readStream.on('data', (data) => {

    while ((match = regexp.exec(data.toString())) !== null) {
      promises.push(readTemplateFile(match[1]));
    }
    file += data.toString();
  }).on('close', () => {

    Promise.all(promises).then((template) => {
      for (let index = 0; index < template.length; index++) {
        file = file.replace(`{{${template[index].name}}}`, template[index].file);
      }

      writeStream.write(file);
    });
  }).on('error', error => console.log(error));
}

const buildPage = async () => {

  copyDirectory(pathSource, pathCopy);
  mergeCssFiles(pathCssSource, pathCssCopy);
  createHtml(pathHtmlSource, pathHtmlCopy);
}

buildPage();