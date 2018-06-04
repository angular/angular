#!/bin/env node

/**
 * Usage:
 *   node scripts/test-pwa-score <url> <min-score> [<log-file>]
 *
 * Fails if the score is below `<min-score>`.
 * If `<log-file>` is defined, the full results will be logged there.
 *
 * (Skips HTTPS-related audits, when run for HTTP URL.)
 */

// Imports
const lighthouse = require('lighthouse');
const chromeLauncher = require('lighthouse/chrome-launcher');
const printer = require('lighthouse/lighthouse-cli/printer');
const config = require('lighthouse/lighthouse-core/config/default.js');

// Constants
const CHROME_LAUNCH_OPTS = {};
const SKIPPED_HTTPS_AUDITS = ['redirects-http'];
const VIEWER_URL = 'https://googlechrome.github.io/lighthouse/viewer/';


// Specify the path and flags for Chrome on Travis
if (process.env.TRAVIS) {
  process.env.LIGHTHOUSE_CHROMIUM_PATH = process.env.CHROME_BIN;
  CHROME_LAUNCH_OPTS.chromeFlags = ['--no-sandbox'];
}

// Run
_main(process.argv.slice(2));

// Functions - Definitions
function _main(args) {
  const {url, minScore, logFile} = parseInput(args);
  const isOnHttp = /^http:/.test(url);

  console.log(`Running PWA audit for '${url}'...`);

  if (isOnHttp) {
    skipHttpsAudits(config);
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

function launchChromeAndRunLighthouse(url, flags, config) {
  return chromeLauncher.launch(CHROME_LAUNCH_OPTS).then(chrome => {
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

    // Remove the artifacts, which are not necessary for the report.
    // (Saves ~1,500,000 lines of formatted JSON output \o/)
    results.artifacts = undefined;

    promise = printer.write(results, 'json', logFile);
  }

  return promise.then(() => Math.round(results.score));
}

function skipHttpsAudits(config) {
  console.info(`Skipping HTTPS-related audits (${SKIPPED_HTTPS_AUDITS.join(', ')})...`);
  config.settings.skipAudits = SKIPPED_HTTPS_AUDITS;
}
