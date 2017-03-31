#!/bin/env node

/**
 * Usage:
 *   node scripts/test-pwa-score [<url> [<min-score>]]
 *
 * Defaults:
 *   url: http://localhost:4200
 *   minScore: 90
 *
 * (Ignores HTTPS-related audits, when run for HTTP URL.)
 */

// Imports
const lighthouse = require('lighthouse');
const ChromeLauncher = require('lighthouse/lighthouse-cli/chrome-launcher').ChromeLauncher;
const Printer = require('lighthouse/lighthouse-cli/printer');
const config = require('lighthouse/lighthouse-core/config/default.json');

// Constants
const FLAGS = {output: 'json'};

// Specify the path to Chrome on Travis
if (process.env.TRAVIS) {
  process.env.LIGHTHOUSE_CHROMIUM_PATH = process.env.CHROME_BIN;
}

// Run
_main(process.argv.slice(2));

// Functions - Definitions
function _main(args) {
  const {url, minScore} = parseInput(args);
  const isOnHttp = /^http:/.test(url);

  console.log(`Running PWA audit for '${url}'...`);

  if (isOnHttp) {
    ignoreHttpsAudits(config.aggregations);
  }

  launchChromeAndRunLighthouse(url, FLAGS, config).
    then(getScore).
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

function getScore(results) {
  const scoredAggregations = results.aggregations.filter(a => a.scored);
  const total = scoredAggregations.reduce((sum, a) => sum + a.total, 0);

  return Math.round((total / scoredAggregations.length) * 100);
}

function ignoreHttpsAudits(aggregations) {
  const httpsAudits = [
    'is-on-https',
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

  if (!url) {
    onError('Invalid arguments: <URL> not specified.');
  } else if (isNaN(minScore)) {
    onError('Invalid arguments: <MIN_SCORE> not specified or not a number.');
  }

  return {url, minScore};
}
