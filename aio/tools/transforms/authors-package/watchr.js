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

let p = Promise.resolve();

if (process.argv.indexOf('--watch-only') === -1) {
  console.log('================================================================');
  console.log('Running initial doc generation');
  console.log('----------------------------------------------------------------');
  console.log('Skip the full doc-gen by running: `yarn docs-watch --watch-only`');
  console.log('================================================================');
  const {Dgeni} = require('dgeni');
  const dgeni = new Dgeni([require('../angular.io-package')]);

  // Turn off all the potential failures for this doc-gen one-off run.
  // This enables authors to run `docs-watch` while the docs are still in an unstable state.
  const injector = dgeni.configureInjector();
  injector.get('linkInlineTagDef').failOnBadLink = false;
  injector.get('checkAnchorLinksProcessor').$enabled = false;
  injector.get('renderExamples').ignoreBrokenExamples = true;

  p = dgeni.generate();
}

p.then(() => {
  console.log('===================================================================');
  console.log('Started watching files in:');
  console.log(' - ', CONTENTS_PATH);
  console.log(' - ', API_SOURCE_PATH);
  console.log('Doc gen will run when you change a file in either of these folders.');
  console.log('===================================================================');

  watchr.open(CONTENTS_PATH, listener, next);
  watchr.open(API_SOURCE_PATH, listener, next);

});
