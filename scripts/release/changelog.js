#!/usr/bin/env node

'use strict';

/*
 * Creates a conventional changelog from the current git repository / metadata.
 */

const fs = require('fs');
const merge2 = require('merge2');
const changelog = require('conventional-changelog');
const spawnSync = require('child_process').spawnSync;
const npmVersion = require('../../package.json').version;

/**
 * When the command line argument `--force` is provided, then the full changelog will created and overwritten.
 * By default, it will only create the changelog from the latest tag to head and prepends it to the changelog.
 */
const isForce = process.argv.indexOf('--force') !== -1;
const previousChangelog = fs.createReadStream('CHANGELOG.md');
const gitTags = getAvailableTags();

// Whether the npm version is later than the most recent tag.
const isNpmLatest = npmVersion !== gitTags[0];
// When the npm version is the latest, use the npm version, otherwise use the latest tag.
const currentTag = isNpmLatest ? npmVersion : gitTags[0];
// When the npm version is the latest use the most recent tag. Otherwise use the previous tag.
const previousTag = isNpmLatest ? gitTags[0] : gitTags[1];

if (!isForce) {
  previousChangelog.on('error', function(err) {
    console.error('An error occurred, while reading the previous changelog file.\n' +
      'If there is changelog file, you should create an empty file or use the `--force` flag.\n' + err);

    process.exit(1);
  });
}

const config = {
  preset: 'angular',
  releaseCount: isForce ? 0 : 1
};

const context = {
  currentTag: currentTag,
  previousTag: previousTag
};

let stream = changelog(config, context).on('error', function(err) {
  console.error('An error occurred while generating the changelog: ' + err);
});

if (!isForce) {
  // Append the previous changelog to the new generated one.
  stream = merge2(stream, previousChangelog);
} else {
  stream.pipe(getOutputStream())
}

// When we are pre-pending the new changelog, then we need to wait for the input stream to be ending,
// otherwise we can't write into the same destination.
if (!isForce) {
  previousChangelog.on('end', function() {
    stream.pipe(getOutputStream());
  });
}

function getOutputStream() {
  return fs.createWriteStream('CHANGELOG.md');
}

/**
 * Resolves available tags over all branches from the repository metadata.
 * @returns {Array.<String>} Array of available tags.
 */
function getAvailableTags() {
  return spawnSync('git', ['tag']).stdout.toString().trim().split('\n').reverse();
}
