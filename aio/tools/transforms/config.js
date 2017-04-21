const { resolve } = require('path');
const { readdirSync } = require('fs');

const PROJECT_ROOT = resolve(__dirname, '../../..');
const AIO_PATH = resolve(PROJECT_ROOT, 'aio');
const TEMPLATES_PATH = resolve(AIO_PATH, 'tools/transforms/templates');
const CONTENTS_PATH = resolve(AIO_PATH, 'content');
const OUTPUT_PATH = resolve(AIO_PATH, 'src/content');
const DOCS_OUTPUT_PATH = resolve(OUTPUT_PATH, 'docs');
const API_SOURCE_PATH = resolve(PROJECT_ROOT, 'packages');

function requireFolder(dirname, folderPath) {
  const absolutePath = resolve(dirname, folderPath);
  return readdirSync(absolutePath)
    .filter(p => !/[._]spec\.js$/.test(p))  // ignore spec files
    .map(p => require(resolve(absolutePath, p)));
}

module.exports = { PROJECT_ROOT, AIO_PATH, TEMPLATES_PATH, CONTENTS_PATH, OUTPUT_PATH, DOCS_OUTPUT_PATH, API_SOURCE_PATH, requireFolder };

