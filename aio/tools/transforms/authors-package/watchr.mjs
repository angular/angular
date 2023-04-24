/* eslint no-console: "off" */
import watchr from 'watchr';
import canonicalPath from 'canonical-path';
import authorsPackage from './index.js';
import config from '../config.js';

function listener(changeType, fullPath) {
  try {
    const relativePath = canonicalPath.relative(config.PROJECT_ROOT, fullPath);
    console.log('The file', relativePath, `was ${changeType}d at`, new Date().toUTCString());
    authorsPackage.generateDocs(relativePath);
  } catch (err) {
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
  console.log(' - ', config.CONTENTS_PATH);
  console.log(' - ', config.API_SOURCE_PATH);
  console.log('Doc gen will automatically run on any change to a file in either directory.');
  console.log('============================================================================');

  watchr.open(config.CONTENTS_PATH, listener, next);
  watchr.open(config.API_SOURCE_PATH, listener, next);
}

exports.watch = watch;
