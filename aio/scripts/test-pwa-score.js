#!/bin/env node

/**
 * Usage:
 *   node scripts/test-pwa-score <url> <min-score> [<log-file>]
 *
 * Fails if the score is below `<min-score>`.
 * If `<log-file>` is defined, the full results will be logged there.
 *
 * (Ignores HTTPS-related audits, when run for HTTP URL.)
 */

// Imports
const lighthouse = require('lighthouse');
const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const printer = require('lighthouse/lighthouse-cli/printer');
const config = require('lighthouse/lighthouse-core/config/default.js');

// Constants
const VIEWER_URL = 'https://googlechrome.github.io/lighthouse/viewer/';

// Run
_main(process.argv.slice(2));

// Functions - Definitions
function _main(args) {
  const {url, minScore, logFile} = parseInput(args);
  const isOnHttp = /^http:/.test(url);

  console.log(`Running PWA audit for '${url}'...`);

  if (isOnHttp) {
    ignoreHttpsAudits(config);
  }

  launchChromeAndRunLighthouse(url, {}, config).
    then(results => processResults(results, logFile)).
    then(score => evaluateScore(minScore, score)).
    catch(onError);
}

function evaluateScore(expectedScore, actualScore) {
  console.log('Lighthouse PWA score:');
  console.log(`  - Expected: ${expectedScore} / 100 (or higher)`);
  console.log(`  - Actual:   ${actualScore} / 100`);

  if (actualScore < expectedScore) {
    throw new Error(`PWA score is too low. (${actualScore} < ${expectedScore})`);
  }
}

function ignoreHttpsAudits(config) {
  const httpsAudits = [
    'redirects-http'
  ];

  console.info(`Ignoring HTTPS-related audits (${httpsAudits.join(', ')})...`);

  config.categories.pwa.audits.forEach(audit => {
    if (httpsAudits.indexOf(audit.id) !== -1) {
      // Ugly hack to ignore HTTPS-related audits.
      // Only meant for use during development.
      audit.weight = 0;
     }
   });
}

function launchChromeAndRunLighthouse(url, flags, config) {
  return chromeLauncher.launch().then(chrome => {
    flags.port = chrome.port;
    return lighthouse(url, flags, config).
      then(results => chrome.kill().then(() => results)).
      catch(err => chrome.kill().then(() => { throw err; }, () => { throw err; }));
  });
}

function onError(err) {
  console.error(err);
  process.exit(1);
}

function parseInput(args) {
  const url = args[0];
  const minScore = Number(args[1]);
  const logFile = args[2];

  if (!url) {
    onError('Invalid arguments: <URL> not specified.');
  } else if (isNaN(minScore)) {
    onError('Invalid arguments: <MIN_SCORE> not specified or not a number.');
  }

  return {url, minScore, logFile};
}

function processResults(results, logFile) {
  let promise = Promise.resolve();

  if (logFile) {
    console.log(`Saving results in '${logFile}'...`);
    console.log(`(LightHouse viewer: ${VIEWER_URL})`);

    results.artifacts = undefined;   // Too large for the logs.
    promise = printer.write(results, 'json', logFile);
  }

  return promise.then(() => Math.round(results.score));
}
