#!/usr/bin/env node

'use strict';
/**
 * Creates a conventional changelog from the current git repository / metadata.
 */

var fs = require('fs');
var addStream = require('add-stream');
var cl = require('conventional-changelog');
var inStream = fs.createReadStream('CHANGELOG.md');

/**
 * When the command line argument `--force` is provided, then the full changelog will created and overwritten.
 * By default, it will only create the changelog from the latest tag to head and prepends it to the changelog.
 */
var isForce = process.argv.indexOf('--force') !== -1;

inStream.on('error', function(err) {
  console.error('An error occurred, while reading the previous changelog file.\n' +
    'If there is no previous changelog, then you should create an empty file or use the `--force` flag.\n' + err);

  process.exit(1);
});

var config = {
  preset: 'angular',
  releaseCount: isForce ? 0 : 1
};

var stream = cl(config)
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
