'use strict';

// Imports
const fs = require('fs');
const path = require('path');
const sh = require('shelljs');
const { BASE_URL, BROWSER_INSTANCES, INPUT_DIR, PORT, TMP_OUTPUT_DIR, TMP_SPECS_DIR } = require('./constants');

sh.config.fatal = true;

// Helpers
const chunkArray = (items, numChunks) => {
  numChunks = Math.min(numChunks, items.length);
  const itemsPerChunk = Math.ceil(items.length / numChunks);
  const chunks = new Array(numChunks);

  console.log(`Chunking ${items.length} items into ${numChunks} chunks.`);

  for (let i = 0; i < numChunks; i++) {
    chunks[i] = items.slice(i * itemsPerChunk, (i + 1) * itemsPerChunk);
  }

  return chunks;
};

const getAllFiles = rootDir => fs.readdirSync(rootDir).reduce((files, file) => {
  const absolutePath = path.join(rootDir, file);
  const isFile = fs.lstatSync(absolutePath).isFile();

  return files.concat(isFile ? absolutePath : getAllFiles(absolutePath));
}, []);

const getAllUrls = rootDir => getAllFiles(rootDir).
  filter(absolutePath => path.extname(absolutePath) === '.json').
  map(absolutePath => absolutePath.slice(0, -5)).
  map(absolutePath => path.relative(INPUT_DIR, absolutePath)).
  map(relativePath => `${BASE_URL}/${relativePath}`);

const getTestForChunk = (chunk, idx) => `
  'use strict';

  const fs = require('fs');
  const path = require('path');
  const protractor = require('protractor');
  const sh = require('shelljs');
  const url = require('url');

  const browser = protractor.browser;
  sh.config.fatal = true;

  describe('chunk ${idx}', () => ${JSON.stringify(chunk)}.forEach(urlToPage => {
    const parsedUrl = url.parse(urlToPage);

    it(\`should render \${parsedUrl.path}\`, done => {
      browser.get(urlToPage);
      browser.getPageSource()
        .then(source => {
          if (/document not found/i.test(source) && !/file-not-found/i.test(urlToPage)) {
            return Promise.reject(\`404 for \${urlToPage}\`);
          }

          const relativeFilePath = parsedUrl.path.replace(/\\/$/, '/index').replace(/^\\//, '') + '.html';
          const absoluteFilePath = path.resolve('${TMP_OUTPUT_DIR}', relativeFilePath);
          const absoluteDirPath = path.dirname(absoluteFilePath);

          console.log(\`Writing to \${absoluteFilePath}...\`);

          sh.mkdir('-p', absoluteDirPath);
          fs.writeFileSync(absoluteFilePath, source);
        })
        .then(done, done.fail);
    });
  }));
`;

// Run
const docsUrls = getAllUrls(INPUT_DIR);
const chunked = chunkArray(docsUrls, BROWSER_INSTANCES);

sh.rm('-rf', TMP_OUTPUT_DIR);
sh.rm('-rf', TMP_SPECS_DIR);
sh.mkdir('-p', TMP_SPECS_DIR);

chunked.forEach((chunk, idx) => {
  const outputFile = path.join(TMP_SPECS_DIR, `chunk${idx}.spec.js`);
  const testContent = getTestForChunk(chunk, idx);

  fs.writeFileSync(outputFile, testContent);
});
