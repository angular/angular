#!/bin/env node

/**
 * Usage:
 * ```sh
 * node scripts/test-pwa-score <url> <min-score> [<log-file>]
 * ```
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
const logger = require('lighthouse-logger');

// Constants
const CHROME_LAUNCH_OPTS = {chromeFlags: ['--headless']};
const LIGHTHOUSE_FLAGS = {logLevel: 'info'};
const SKIPPED_HTTPS_AUDITS = ['redirects-http', 'uses-http2'];
const VIEWER_URL = 'https://googlechrome.github.io/lighthouse/viewer/';
const WAIT_FOR_SW_DELAY = 5000;

// Be less verbose on CI.
if (process.env.CI) {
  LIGHTHOUSE_FLAGS.logLevel = 'error';
}

// Run
_main(process.argv.slice(2));

// Functions - Definitions
async function _main(args) {
  const {url, minScore, logFile} = parseInput(args);
  const isOnHttp = /^http:/.test(url);
  const config = {
    extends: 'lighthouse:default',
    // Since the Angular ServiceWorker waits for the app to stabilize before registering,
    // wait a few seconds after load to allow Lighthouse to reliably detect it.
    passes: [{passName: 'defaultPass', pauseAfterLoadMs: WAIT_FOR_SW_DELAY}],
  }

  console.log(`Running PWA audit for '${url}'...`);

  // If testing on HTTP, skip HTTPS-specific tests.
  // (Note: Browsers special-case localhost and run ServiceWorker even on HTTP.)
  if (isOnHttp) skipHttpsAudits(config);

  logger.setLevel(LIGHTHOUSE_FLAGS.logLevel);

  try {
    const results = await launchChromeAndRunLighthouse(url, LIGHTHOUSE_FLAGS, config);
    const score = await processResults(results, logFile);
    evaluateScore(minScore, score);
  } catch (err) {
    onError(err);
  }
}

function evaluateScore(expectedScore, actualScore) {
  console.log('\nLighthouse PWA score:');
  console.log(`  - Expected: ${expectedScore.toFixed(0).padStart(3)} / 100 (or higher)`);
  console.log(`  - Actual:   ${actualScore.toFixed(0).padStart(3)} / 100\n`);

  if (isNaN(actualScore) || (actualScore < expectedScore)) {
    throw new Error(`PWA score is too low. (${actualScore} < ${expectedScore})`);
  }
}

async function launchChromeAndRunLighthouse(url, flags, config) {
  const chrome = await chromeLauncher.launch(CHROME_LAUNCH_OPTS);
  flags.port = chrome.port;

  try {
    return await lighthouse(url, flags, config);
  } finally {
    await chrome.kill();
  }
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

async function processResults(results, logFile) {
  const lhVersion = results.lhr.lighthouseVersion;
  const categories = results.lhr.categories;
  const report = results.report;

  if (logFile) {
    console.log(`\nSaving results in '${logFile}'...`);
    console.log(`(LightHouse viewer: ${VIEWER_URL})`);

    await printer.write(report, printer.OutputMode.json, logFile);
  }

  const categoryData = Object.keys(categories).map(name => categories[name]);
  const maxTitleLen = Math.max(...categoryData.map(({title}) => title.length));

  console.log(`\nLighthouse version: ${lhVersion}`);

  console.log('\nAudit scores:');
  categoryData.forEach(({title, score}) => {
    const paddedTitle = `${title}:`.padEnd(maxTitleLen + 1);
    const paddedScore = (score * 100).toFixed(0).padStart(3);
    console.log(`  - ${paddedTitle} ${paddedScore} / 100`);
  });

  return categories.pwa.score * 100;
}

function skipHttpsAudits(config) {
  console.info(`Skipping HTTPS-related audits (${SKIPPED_HTTPS_AUDITS.join(', ')})...`);
  const settings = config.settings || (config.settings = {});
  settings.skipAudits = SKIPPED_HTTPS_AUDITS;
}
