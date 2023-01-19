const fs = require('fs');
const path = require('path');

const ASSETS_DIR = './src/assets';

fs.readdirSync(ASSETS_DIR)
  .map(fileName => `${ASSETS_DIR}/${fileName}`)
  .filter(filePath => filePath.endsWith('.base64.png'))
  .forEach(filePath => {
    const base64Content = fs.readFileSync(filePath, 'utf-8');
    const pngPath = filePath.replace('.base64', '');

    fs.writeFileSync(pngPath, Buffer.from(base64Content, 'base64'));
    console.log(`Converted ${filePath} to ${pngPath}.`);
  });
