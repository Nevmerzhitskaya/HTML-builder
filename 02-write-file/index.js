
const { createWriteStream } = require('node:fs');
const readline = require('readline');
const path = require('path');

const filePath = path.join('02-write-file/', 'text.txt');


console.log(`Welcome! If you want exit type 'exit' or use 'ctrl + c'`);

process.on('exit', () => {
  console.log(`Thank you for using our program, your text have been written to ${filePath}, goodbye!`);
});

process.on('SIGINT', () => {
  process.exit(0);
});

const writeFile = () => {
  const writeStream = createWriteStream(filePath);

  writeStream.on('error', (error) => {
    console.log(`Some error occured. Error: ${error}`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Enter some text: '
  });

  rl.prompt();

  rl.on('line', line => {
    if (line.trim() === 'exit') rl.close();
    writeStream.write(line + '\n');
  }).on('close', () => {
    writeStream.end();
    process.exit(0);
  });
}

writeFile();