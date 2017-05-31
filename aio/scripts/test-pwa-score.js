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
const ChromeLauncher = require('lighthouse/lighthouse-cli/chrome-launcher').ChromeLauncher;
const Printer = require('lighthouse/lighthouse-cli/printer');
const config = require('lighthouse/lighthouse-core/config/default.json');

// Constants
const VIEWER_URL = 'https://googlechrome.github.io/lighthouse/viewer/';

// Work-around traceviewer-js bug.
global.atob = str => new Buffer(str, 'base64').toString('binary');
global.btoa = str => new Buffer(str, 'binary').toString('base64');

// Specify the path to Chrome on Travis
if (process.env.TRAVIS) {
  process.env.LIGHTHOUSE_CHROMIUM_PATH = process.env.CHROME_BIN;
}

// Run
_main(process.argv.slice(2));

// Functions - Definitions
function _main(args) {
  const {url, minScore, logFile} = parseInput(args);
  const isOnHttp = /^http:/.test(url);

  console.log(`Running PWA audit for '${url}'...`);

  if (isOnHttp) {
    ignoreHttpsAudits(config.aggregations);
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

function ignoreHttpsAudits(aggregations) {
  const httpsAudits = [
    'redirects-http'
  ];

  console.info(`Ignoring HTTPS-related audits (${httpsAudits.join(', ')})...`);

  aggregations.forEach(aggregation =>
    aggregation.items.forEach(item =>
      httpsAudits.map(key => item.audits[key]).forEach(audit =>
        // Ugly hack to ignore HTTPS-related audits (i.e. simulate them passing).
        // Only meant for use during development.
        audit && (audit.expectedValue = !audit.expectedValue))));
}

function launchChromeAndRunLighthouse(url, flags, config) {
  const launcher = new ChromeLauncher({autoSelectChrome: true});

  return launcher.run().
    then(() => lighthouse(url, flags, config)).
    // Avoid race condition by adding a delay before killing Chrome.
    // (See also https://github.com/paulirish/pwmetrics/issues/63#issuecomment-282721068.)
    then(results => new Promise(resolve => setTimeout(() => resolve(results), 1000))).
    then(results => launcher.kill().then(() => results)).
    catch(err => launcher.kill().then(() => { throw err; }, () => { throw err; }));
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
  if (logFile) {
    console.log(`Saving results in '${logFile}'...`);
    console.log(`(LightHouse viewer: ${VIEWER_URL})`);

    results.artifacts = undefined;   // Avoid circular dependency errors.
    Printer.write(results, 'json', logFile);
  }

  const scoredAggregations = results.aggregations.filter(a => a.scored);
  const total = scoredAggregations.reduce((sum, a) => sum + a.total, 0);

  return Math.round((total / scoredAggregations.length) * 100);
}
