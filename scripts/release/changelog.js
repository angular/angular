#!/usr/bin/env node

'use strict';

/*
 * Creates a conventional changelog from the current git repository / metadata.
 */

const fs = require('fs');
const addStream = require('add-stream');
const changelog = require('conventional-changelog');
const spawnSync = require('child_process').spawnSync;
const npmVersion = require('../../package.json').version;

/**
 * When the command line argument `--force` is provided, then the full changelog will created and overwritten.
 * By default, it will only create the changelog from the latest tag to head and prepends it to the changelog.
 */
const isForce = process.argv.indexOf('--force') !== -1;
const inStream = fs.createReadStream('CHANGELOG.md');
const gitTags = getAvailableTags();

// Whether the npm version is later than the most recent tag.
const isNpmLatest = npmVersion !== gitTags[0];
// When the npm version is the latest, use the npm version, otherwise use the latest tag.
const currentTag = isNpmLatest ? npmVersion : gitTags[0];
// When the npm version is the latest use the most recent tag. Otherwise use the previous tag.
const previousTag = isNpmLatest ? gitTags[0] : gitTags[1];

inStream.on('error', function(err) {
  console.error('An error occurred, while reading the previous changelog file.\n' +
    'If there is no previous changelog, then you should create an empty file or use the `--force` flag.\n' + err);

  process.exit(1);
});

var config = {
  preset: 'angular',
  releaseCount: isForce ? 0 : 1
};

var context = {
  currentTag: currentTag,
  previousTag: previousTag
};

var stream = changelog(config, context)
  .on('error', function(err) {
    console.error('An error occurred while generating the changelog: ' + err);
  })
  .pipe(!isForce && addStream(inStream) || getOutputStream());

// When we are pre-pending the new changelog, then we need to wait for the input stream to be ending,
// otherwise we can't write into the same destination.
if (!isForce) {
  inStream.on('end', function() {
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
