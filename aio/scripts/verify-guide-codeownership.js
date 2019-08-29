'use strict';

// Imports
const fs = require('fs');
const path = require('path');

// Constants
const PROJECT_ROOT_DIR = path.resolve(__dirname, '../..');
const CODEOWNERS_PATH = path.resolve(PROJECT_ROOT_DIR, '.github/CODEOWNERS');
const AIO_CONTENT_DIR = path.resolve(PROJECT_ROOT_DIR, 'aio/content');
const AIO_GUIDES_DIR = path.resolve(AIO_CONTENT_DIR, 'guide');
const AIO_GUIDE_IMAGES_DIR = path.resolve(AIO_CONTENT_DIR, 'images/guide');
const AIO_GUIDE_EXAMPLES_DIR = path.resolve(AIO_CONTENT_DIR, 'examples');

// Run
_main();

// Functions - Definitions
function _main() {
  const {guides: acGuidePaths, images: acGuideImagesPaths, examples: acExamplePaths} = getPathsFromAioContent();
  const {guides: coGuidePaths, images: coGuideImagesPaths, examples: coExamplePaths} = getPathsFromCodeowners();

  const guidesDiff = arrayDiff(acGuidePaths, coGuidePaths);
  const imagesDiff = arrayDiff(acGuideImagesPaths, coGuideImagesPaths);
  const examplesDiff = arrayDiff(acExamplePaths, coExamplePaths);
  const hasDiff = !!(guidesDiff.diffCount || imagesDiff.diffCount || examplesDiff.diffCount);

  if (hasDiff) {
    const expectedGuidesSrc = path.relative(PROJECT_ROOT_DIR, AIO_GUIDES_DIR);
    const expectedImagesSrc = path.relative(PROJECT_ROOT_DIR, AIO_GUIDE_IMAGES_DIR);
    const expectedExamplesSrc = path.relative(PROJECT_ROOT_DIR, AIO_GUIDE_EXAMPLES_DIR);
    const actualSrc = path.relative(PROJECT_ROOT_DIR, CODEOWNERS_PATH);

    reportDiff(guidesDiff, expectedGuidesSrc, actualSrc);
    reportDiff(imagesDiff, expectedImagesSrc, actualSrc);
    reportDiff(examplesDiff, expectedExamplesSrc, actualSrc);
  }

  process.exit(hasDiff ? 1 : 0);
}

function arrayDiff(expected, actual) {
  const missing = expected.filter(x => !actual.includes(x)).sort();
  const extra = actual.filter(x => !expected.includes(x)).sort();

  return {missing, extra, diffCount: missing.length + extra.length};
}

function getPathsFromAioContent() {
  return {
    guides: fs.readdirSync(AIO_GUIDES_DIR),
    images: fs.readdirSync(AIO_GUIDE_IMAGES_DIR),
    examples: fs.readdirSync(AIO_GUIDE_EXAMPLES_DIR).
      filter(name => fs.statSync(`${AIO_GUIDE_EXAMPLES_DIR}/${name}`).isDirectory()),
  };
}

function getPathsFromCodeowners() {
  const guidesOrImagesPathRe = /^\/aio\/content\/(?:(images\/)?guide|(examples))\/([^\s/]+)/;

  return fs.
    readFileSync(CODEOWNERS_PATH, 'utf8').
    split('\n').
    map(l => l.trim().match(guidesOrImagesPathRe)).
    filter(m => m).
    reduce((aggr, [, isImage, isExample, path]) => {
      const list = isExample ? aggr.examples :
                   isImage   ? aggr.images :
                               aggr.guides;
      list.push(path);
      return aggr;
    }, {guides: [], images: [], examples: []});
}

function reportDiff(diff, expectedSrc, actualSrc) {
  if (diff.missing.length) {
    console.error(
        `\nEntries in '${expectedSrc}' but not in '${actualSrc}':\n` +
        diff.missing.map(x => `  - ${x}`).join('\n'));
  }

  if (diff.extra.length) {
    console.error(
        `\nEntries in '${actualSrc}' but not in '${expectedSrc}':\n` +
        diff.extra.map(x => `  - ${x}`).join('\n'));
  }
}
