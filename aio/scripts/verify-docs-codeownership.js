'use strict';

// Imports
const fs = require('fs');
const path = require('path');

// Constants
const PROJECT_ROOT_DIR = path.resolve(__dirname, '../..');
const CODEOWNERS_PATH = path.resolve(PROJECT_ROOT_DIR, '.github/CODEOWNERS');
const PKG_EXAMPLES_DIR = path.resolve(PROJECT_ROOT_DIR, 'packages/examples');
const AIO_CONTENT_DIR = path.resolve(PROJECT_ROOT_DIR, 'aio/content');
const AIO_GUIDES_DIR = path.resolve(AIO_CONTENT_DIR, 'guide');
const AIO_GUIDE_IMAGES_DIR = path.resolve(AIO_CONTENT_DIR, 'images/guide');
const AIO_GUIDE_EXAMPLES_DIR = path.resolve(AIO_CONTENT_DIR, 'examples');

// Run
_main();

// Functions - Definitions
function _main() {
  const {examples: pkgExamplePaths} = getPathsFromPkgExamples();
  const {guides: aioGuidePaths, images: aioGuideImagesPaths, examples: aioExamplePaths} = getPathsFromAioContent();
  const {
    aioGuides: coAioGuidePaths,
    aioImages: coAioGuideImagesPaths,
    aioExamples: coAioExamplePaths,
    pkgExamples: coPkgExamplePaths,
  } = getPathsFromCodeowners();

  const aioGuidesDiff = arrayDiff(aioGuidePaths, coAioGuidePaths);
  const aioImagesDiff = arrayDiff(aioGuideImagesPaths, coAioGuideImagesPaths);
  const aioExamplesDiff = arrayDiff(aioExamplePaths, coAioExamplePaths);
  const pkgExamplesDiff = arrayDiff(pkgExamplePaths, coPkgExamplePaths);
  const hasDiff = (aioGuidesDiff.diffCount > 0) || (aioImagesDiff.diffCount> 0) || (aioExamplesDiff.diffCount > 0) ||
                  (pkgExamplesDiff.diffCount > 0);

  if (hasDiff) {
    const expectedAioGuidesSrc = path.relative(PROJECT_ROOT_DIR, AIO_GUIDES_DIR);
    const expectedAioImagesSrc = path.relative(PROJECT_ROOT_DIR, AIO_GUIDE_IMAGES_DIR);
    const expectedAioExamplesSrc = path.relative(PROJECT_ROOT_DIR, AIO_GUIDE_EXAMPLES_DIR);
    const expectedPkgExamplesSrc = path.relative(PROJECT_ROOT_DIR, PKG_EXAMPLES_DIR);
    const actualSrc = path.relative(PROJECT_ROOT_DIR, CODEOWNERS_PATH);

    reportDiff(aioGuidesDiff, expectedAioGuidesSrc, actualSrc);
    reportDiff(aioImagesDiff, expectedAioImagesSrc, actualSrc);
    reportDiff(aioExamplesDiff, expectedAioExamplesSrc, actualSrc);
    reportDiff(pkgExamplesDiff, expectedPkgExamplesSrc, actualSrc);
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
  // Use capturing groups for `images/` and `examples` to be able to differentiate between the
  // different kinds of matches (guide, image, example) later (see `isImage`/`isExample` below).
  const aioGuidesOrImagesPathRe = /^\/aio\/content\/(?:(images\/)?guide|(examples))\/([^\s\*/]+)/;
  const pkgExamplesPathRe = /^\/packages\/examples\/([^\s\*/]+)/;
  const manualGlobExpansions = {
    // `CODEOWNERS` has a glob to match all `testing/` directories, so no specific glob for
    // `packages/examples/testing/` is necessary.
    'testing/**': ['/packages/examples/testing/**'],
  };

  const aioGuides = [];
  const aioImages = [];
  const aioExamples = [];
  const pkgExamples = [];

  // Read `CODEOWNERS` and split into lines.
  const lines = fs.
    readFileSync(CODEOWNERS_PATH, 'utf8').
    split('\n').
    map(l => l.trim());

  // Manually expand globs to known matching patterns.
  for (const [glob, expansions] of Object.entries(manualGlobExpansions)) {
    const matchingLine = lines.find(l => l.startsWith(`${glob} `));
    if (matchingLine !== undefined) {
      lines.push(...expansions);
    }
  }

  // Collect `aio/` guides/images/examples.
  lines.
    map(l => l.match(aioGuidesOrImagesPathRe)).
    filter(m => m).
    forEach(([, isImage, isExample, path]) => {
      const list = isExample ? aioExamples :
                   isImage   ? aioImages :
                               aioGuides;
      list.push(path);
    });

  // Collect API docs examples (`packages/examples/`).
  lines.
    map(l => l.match(pkgExamplesPathRe)).
    filter(m => m).
    forEach(([, path]) => pkgExamples.push(path));

  return {aioGuides, aioImages, aioExamples, pkgExamples};
}

function getPathsFromPkgExamples() {
  return {
    examples: fs.readdirSync(PKG_EXAMPLES_DIR).
      filter(name => fs.statSync(`${PKG_EXAMPLES_DIR}/${name}`).isDirectory()),
  };
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
