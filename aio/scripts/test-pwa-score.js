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
const chromeLauncher = require('chrome-launcher');
const lighthouse = require('lighthouse');
const printer = require('lighthouse/lighthouse-cli/printer');
const config = require('lighthouse/lighthouse-core/config/default-config.js');
const logger = require('lighthouse-logger');

// Constants
const CHROME_LAUNCH_OPTS = {};
const LIGHTHOUSE_FLAGS = {logLevel: 'info'};
const SKIPPED_HTTPS_AUDITS = ['redirects-http'];
const VIEWER_URL = 'https://googlechrome.github.io/lighthouse/viewer/';


// Specify the path and flags for Chrome on Travis.
if (process.env.TRAVIS) {
  process.env.LIGHTHOUSE_CHROMIUM_PATH = process.env.CHROME_BIN;
  CHROME_LAUNCH_OPTS.chromeFlags = ['--no-sandbox'];
}

// Be less verbose on CI.
if (process.env.CI) {
  LIGHTHOUSE_FLAGS.logLevel = 'error';
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

  logger.setLevel(LIGHTHOUSE_FLAGS.logLevel);

  launchChromeAndRunLighthouse(url, LIGHTHOUSE_FLAGS, config).
    then(results => processResults(results, logFile)).
    then(score => evaluateScore(minScore, score)).
    catch(onError);
}

function evaluateScore(expectedScore, actualScore) {
  console.log('\nLighthouse PWA score:');
  console.log(`  - Expected: ${expectedScore.toFixed(0).padStart(3)} / 100 (or higher)`);
  console.log(`  - Actual:   ${actualScore.toFixed(0).padStart(3)} / 100\n`);

  if (isNaN(actualScore) || (actualScore < expectedScore)) {
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
  const categories = results.lhr.categories;
  const report = results.report;

  return Promise.resolve().
    then(() => {
      if (logFile) {
        console.log(`Saving results in '${logFile}'...`);
        console.log(`(LightHouse viewer: ${VIEWER_URL})`);

        return printer.write(report, printer.OutputMode.json, logFile);
      }
    }).
    then(() => {
      const categoryData = Object.keys(categories).map(name => categories[name]);
      const maxTitleLen = Math.max(...categoryData.map(({title}) => title.length));

      console.log('\nAudit scores:');
      categoryData.forEach(({title, score}) => {
        const paddedTitle = `${title}:`.padEnd(maxTitleLen + 1);
        const paddedScore = (score * 100).toFixed(0).padStart(3);
        console.log(`  - ${paddedTitle} ${paddedScore} / 100`);
      });
    }).
    then(() => categories.pwa.score * 100);
}

function skipHttpsAudits(config) {
  console.info(`Skipping HTTPS-related audits (${SKIPPED_HTTPS_AUDITS.join(', ')})...`);
  config.settings.skipAudits = SKIPPED_HTTPS_AUDITS;
}
