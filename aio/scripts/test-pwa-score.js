#!/bin/env node
'use strict';

/**
 * Usage:
 * ```sh
 * node scripts/test-pwa-score <url> <min-score> [<log-file>]
 * ```
 *
 * Fails if the score is below `<min-score>`.
 * If `<log-file>` is defined, the full results will be logged there.
 *
 * (Skips HTTPS-related audits, when run for an HTTP URL.)
 */

// Imports
const chromeLauncher = require('chrome-launcher');
const lighthouse = require('lighthouse');
const printer = require('lighthouse/lighthouse-cli/printer');
const logger = require('lighthouse-logger');

// Constants
const CHROME_LAUNCH_OPTS = {chromeFlags: ['--headless']};
const LIGHTHOUSE_FLAGS = {logLevel: process.env.CI ? 'error' : 'info'};  // Be less verbose on CI.
const SKIPPED_HTTPS_AUDITS = ['redirects-http', 'uses-http2'];
const VIEWER_URL = 'https://googlechrome.github.io/lighthouse/viewer';
const WAIT_FOR_SW_DELAY = 5000;

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
  };

  console.log(`Running PWA audit for '${url}'...`);

  // If testing on HTTP, skip HTTPS-specific tests.
  // (Note: Browsers special-case localhost and run ServiceWorker even on HTTP.)
  if (isOnHttp) skipHttpsAudits(config);

  logger.setLevel(LIGHTHOUSE_FLAGS.logLevel);

  try {
    console.log('');
    const startTime = Date.now();
    const results = await launchChromeAndRunLighthouse(url, LIGHTHOUSE_FLAGS, config);
    const score = await processResults(results, logFile);
    evaluateScore(minScore, score);
    console.log(`\n(Completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s.)\n`);
  } catch (err) {
    onError(err);
  }
}

function evaluateScore(expectedScore, actualScore) {
  console.log('\nLighthouse PWA score:');
  console.log(`  - Expected: ${formatScore(expectedScore)} (or higher)`);
  console.log(`  - Actual:   ${formatScore(actualScore)}`);

  if (isNaN(actualScore) || (actualScore < expectedScore)) {
    throw new Error(`PWA score is too low. (${actualScore} < ${expectedScore})`);
  }
}

function formatScore(score) {
  return `${(score * 100).toFixed(0).padStart(3)}`;
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
  console.error('');
  process.exit(1);
}

function parseInput(args) {
  const [url, minScoreRaw, logFile] = args;

  if (!url) {
    onError('Invalid arguments: <url> not specified.');
  } else if (!minScoreRaw) {
    onError('Invalid arguments: <min-score> not specified.');
  }

  const minScore = Number(minScoreRaw) / 100;
  const isValid = (0 <= minScore) && (minScore <= 1);

  if (!isValid) {
    onError(`Invalid arguments: <min-score> has non-numeric or out-of-range values: ${minScoreRaw}`);
  }

  return {url, minScore, logFile};
}

async function processResults(results, logFile) {
  const lhVersion = results.lhr.lighthouseVersion;
  const categories = results.lhr.categories;
  const report = results.report;

  if (logFile) {
    console.log(`\nSaving results in '${logFile}'...`);
    console.log(`  LightHouse viewer: ${VIEWER_URL}`);

    await printer.write(report, printer.OutputMode.json, logFile);
  }

  console.log(`\nLighthouse version: ${lhVersion}`);
  console.log('\nAudit scores:');

  const maxTitleLen = Math.max(...Object.values(categories).map(({title}) => title.length));
  Object.keys(categories).sort().forEach(cat => {
    const {title, score} = categories[cat];
    const paddedTitle = `${title}:`.padEnd(maxTitleLen + 1);

    console.log(`  - ${paddedTitle}  ${formatScore(score)}`);
  });

  return categories.pwa.score;
}

function skipHttpsAudits(config) {
  console.log(`  Skipping HTTPS-related audits: ${SKIPPED_HTTPS_AUDITS.join(', ')}`);
  const settings = config.settings || (config.settings = {});
  settings.skipAudits = SKIPPED_HTTPS_AUDITS;
}
