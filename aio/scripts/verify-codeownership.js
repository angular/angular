#!/usr/bin/env node
'use strict';

/**
 * **Usage:**
 * ```
 * node aio/scripts/verify-codeownership
 * ```
 *
 * Verify whether there are directories in the codebase that don't have a codeowner (in `.github/CODEOWNERS`) and vice
 * versa (that there are no patterns in `CODEOWNERS` that do not correspond to actual directories).
 *
 * The script does not aim to be exhaustive and highly accurate, checking all files and directories (since that would be
 * too complicated). Instead, it does a coarse check on some important (or frequently changing) directories.
 *
 * Currently, it checks the following:
 * - **Packages**: Top-level directories in `packages/`.
 * - **API docs examples**: Top-level directories in `packages/examples/`.
 * - **Guides**: Top-level files in `aio/content/guide/`.
 * - **Guide images**: Top-level directories in `aio/content/images/guide/`.
 * - **Guide examples**: Top-level directories in `aio/content/examples/`.
 */

// Imports
const fs = require('fs');
const path = require('path');

// Constants
const PROJECT_ROOT_DIR = path.resolve(__dirname, '../..');
const CODEOWNERS_PATH = path.resolve(PROJECT_ROOT_DIR, '.github/CODEOWNERS');
const PKG_DIR = path.resolve(PROJECT_ROOT_DIR, 'packages');
const PKG_EXAMPLES_DIR = path.resolve(PKG_DIR, 'examples');
const AIO_CONTENT_DIR = path.resolve(PROJECT_ROOT_DIR, 'aio/content');
const AIO_GUIDES_DIR = path.resolve(AIO_CONTENT_DIR, 'guide');
const AIO_GUIDE_IMAGES_DIR = path.resolve(AIO_CONTENT_DIR, 'images/guide');
const AIO_GUIDE_EXAMPLES_DIR = path.resolve(AIO_CONTENT_DIR, 'examples');
const IGNORED_PKG_DIRS = new Set([
  // Examples are checked separately.
  'examples',
]);

// Run
_main();

// Functions - Definitions
function _main() {
  const {packages: pkgPackagePaths, examples: pkgExamplePaths} = getPathsFromPkg();
  const {guides: aioGuidePaths, images: aioGuideImagesPaths, examples: aioExamplePaths} = getPathsFromAioContent();
  const {
    pkgPackages: coPkgPackagePaths,
    pkgExamples: coPkgExamplePaths,
    aioGuides: coAioGuidePaths,
    aioImages: coAioGuideImagesPaths,
    aioExamples: coAioExamplePaths,
  } = getPathsFromCodeowners();

  const pkgPackagesDiff = arrayDiff(pkgPackagePaths, coPkgPackagePaths);
  const pkgExamplesDiff = arrayDiff(pkgExamplePaths, coPkgExamplePaths);
  const aioGuidesDiff = arrayDiff(aioGuidePaths, coAioGuidePaths);
  const aioImagesDiff = arrayDiff(aioGuideImagesPaths, coAioGuideImagesPaths);
  const aioExamplesDiff = arrayDiff(aioExamplePaths, coAioExamplePaths);
  const hasDiff = (pkgPackagesDiff.diffCount > 0) || (pkgExamplesDiff.diffCount > 0) ||
                  (aioGuidesDiff.diffCount > 0) || (aioImagesDiff.diffCount> 0) || (aioExamplesDiff.diffCount > 0);

  if (hasDiff) {
    const expectedPkgPackagesSrc = path.relative(PROJECT_ROOT_DIR, PKG_DIR);
    const expectedPkgExamplesSrc = path.relative(PROJECT_ROOT_DIR, PKG_EXAMPLES_DIR);
    const expectedAioGuidesSrc = path.relative(PROJECT_ROOT_DIR, AIO_GUIDES_DIR);
    const expectedAioImagesSrc = path.relative(PROJECT_ROOT_DIR, AIO_GUIDE_IMAGES_DIR);
    const expectedAioExamplesSrc = path.relative(PROJECT_ROOT_DIR, AIO_GUIDE_EXAMPLES_DIR);
    const actualSrc = path.relative(PROJECT_ROOT_DIR, CODEOWNERS_PATH);

    reportDiff(pkgPackagesDiff, expectedPkgPackagesSrc, actualSrc);
    reportDiff(pkgExamplesDiff, expectedPkgExamplesSrc, actualSrc);
    reportDiff(aioGuidesDiff, expectedAioGuidesSrc, actualSrc);
    reportDiff(aioImagesDiff, expectedAioImagesSrc, actualSrc);
    reportDiff(aioExamplesDiff, expectedAioExamplesSrc, actualSrc);
  }

  process.exit(hasDiff ? 1 : 0);
}

function arrayDiff(expected, actual) {
  const missing = expected.filter(x => !actual.includes(x)).sort();
  const extra = actual.filter(x => !expected.includes(x)).sort();

  return {missing, extra, diffCount: missing.length + extra.length};
}

function findDirectories(parentDir) {
  return fs.readdirSync(parentDir).
    filter(name => fs.statSync(`${parentDir}/${name}`).isDirectory());
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
  const pkgPackagesPathRe = /^\/packages\/([^\s\*/]+)\/\*?\*\s/;
  const pkgExamplesPathRe = /^\/packages\/examples\/([^\s\*/]+)/;
  // Use capturing groups for `images/` and `examples` to be able to differentiate between the
  // different kinds of matches (guide, image, example) later (see `isImage`/`isExample` below).
  const aioGuidesImagesExamplesPathRe = /^\/aio\/content\/(?:(images\/)?guide|(examples))\/([^\s\*/]+)/;
  const manualGlobExpansions = {
    // `CODEOWNERS` has a glob to match all `testing/` directories, so no specific glob for
    // `packages/examples/testing/` is necessary.
    'testing/**': ['/packages/examples/testing/**'],
  };

  const pkgPackages = [];
  const pkgExamples = [];
  const aioGuides = [];
  const aioImages = [];
  const aioExamples = [];

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

  // Collect packages (`packages/`).
  lines.
    map(l => l.match(pkgPackagesPathRe)).
    filter(m => m).
    forEach(([, path]) => pkgPackages.push(path));

  // Collect API docs examples (`packages/examples/`).
  lines.
    map(l => l.match(pkgExamplesPathRe)).
    filter(m => m).
    forEach(([, path]) => pkgExamples.push(path));

  // Collect `aio/` guides/images/examples.
  lines.
    map(l => l.match(aioGuidesImagesExamplesPathRe)).
    filter(m => m).
    forEach(([, isImage, isExample, path]) => {
      const list = isExample ? aioExamples :
                   isImage   ? aioImages :
                               aioGuides;
      list.push(path);
    });

  return {pkgPackages, pkgExamples, aioGuides, aioImages, aioExamples};
}

function getPathsFromPkg() {
  return {
    packages: findDirectories(PKG_DIR).filter(name => !IGNORED_PKG_DIRS.has(name)),
    examples: findDirectories(PKG_EXAMPLES_DIR),
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
