/* eslint no-console: "off" */
const watchr = require('watchr');
const {relative} = require('canonical-path');
const {generateDocs} = require('./index.js');
const { PROJECT_ROOT, CONTENTS_PATH, API_SOURCE_PATH } = require('../config');

function listener(changeType, fullPath) {
  try {
    const relativePath = relative(PROJECT_ROOT, fullPath);
    console.log('The file', relativePath, `was ${changeType}d at`, new Date().toUTCString());
    generateDocs(relativePath);
  } catch(err) {
    console.log('Error generating docs', err);
  }
}

function next(error) {
  if (error) {
    console.log(error);
  }
}

function watch() {
    console.log('============================================================================');
    console.log('Started watching files in:');
    console.log(' - ', CONTENTS_PATH);
    console.log(' - ', API_SOURCE_PATH);
    console.log('Doc gen will automatically run on any change to a file in either directory.');
    console.log('============================================================================');

    watchr.open(CONTENTS_PATH, listener, next);
    watchr.open(API_SOURCE_PATH, listener, next);
}

exports.watch = watch;