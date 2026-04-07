const fs = require('fs');
const path = require('path');

const distPath = './dist/';
const ngDevModeVariable = 'ngDevMode';

const filesWithNgDevMode = fs
  .readdirSync(distPath)
  .filter((p) => p.endsWith('.js'))
  .filter((p) => fs.readFileSync(path.join(distPath, p), 'utf-8').includes(ngDevModeVariable));

if (filesWithNgDevMode.length > 0) {
  throw new Error(
    `Found '${ngDevModeVariable}' referenced in ${filesWithNgDevMode}. These references should be tree-shaken away!`,
  );
} else {
  console.log(`No '${ngDevModeVariable}' references found in ${distPath}`);
}
