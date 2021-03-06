#!/bin/env node
'use strict';

/**
 * Usage:
 * ```sh
 * node scripts/audit-web-app <url> <min-scores> [<log-file>]
 * ```
 *
 * Runs audits against the specified URL on specific categories (accessibility, best practices, performance, PWA, SEO).
 * It fails, if the score in any category is below the score specified in `<min-scores>`. (Only runs audits for the
 * specified categories.)
 *
 * `<min-scores>` is either a number (in which case it is interpreted as `all:<min-score>`) or a list of comma-separated
 * strings of the form `key:value`, where `key` is one of `accessibility`, `best-practices`, `performance`, `pwa`, `seo`
 * or `all` and `value` is a number (between 0 and 100).
 *
 * Examples:
 * - `95` _(Same as `all:95`.)_
 * - `all:95` _(Run audits for all categories and require a score of 95 or higher.)_
 * - `all:95,pwa:100` _(Same as `all:95`, except that a scope of 100 is required for the `pwa` category.)_
 * - `performance:90` _(Only run audits for the `performance` category and require a score of 90 or higher.)_
 *
 * If `<log-file>` is defined, the full results will be logged there.
 *
 * (Skips HTTPS-related audits, when run for an HTTP URL.)
 */

// Imports
const lighthouse = require('lighthouse');
const printer = require('lighthouse/lighthouse-cli/printer');
const logger = require('lighthouse-logger');
const puppeteer = require('puppeteer');

// Constants
const AUDIT_CATEGORIES = ['accessibility', 'best-practices', 'performance', 'pwa', 'seo'];
const LIGHTHOUSE_FLAGS = {logLevel: process.env.CI ? 'error' : 'info'};  // Be less verbose on CI.
const VIEWER_URL = 'https://googlechrome.github.io/lighthouse/viewer';
const WAIT_FOR_SW_DELAY = 5000;

// Run
_main(process.argv.slice(2));

// Functions - Definitions
async function _main(args) {
  const {url, minScores, logFile} = parseInput(args);
  const lhFlags = {...LIGHTHOUSE_FLAGS, onlyCategories: Object.keys(minScores).sort()};
  const lhConfig = {
    extends: 'lighthouse:default',
    // Since the Angular ServiceWorker waits for the app to stabilize before registering,
    // wait a few seconds after load to allow Lighthouse to reliably detect it.
    passes: [{passName: 'defaultPass', pauseAfterLoadMs: WAIT_FOR_SW_DELAY}],
  };

  console.log(`Running web-app audits for '${url}'...`);
  console.log(`  Audit categories: ${lhFlags.onlyCategories.join(', ')}`);

  logger.setLevel(lhFlags.logLevel);

  try {
    console.log('');
    const startTime = Date.now();
    const browser = await puppeteer.launch();
    const browserVersion = await browser.version();
    const results = await runLighthouse(browser, url, lhFlags, lhConfig);

    console.log(
        `\n  Browser version:    ${browserVersion}` +
        `\n  Lighthouse version: ${results.lhr.lighthouseVersion}`);

    const success = await processResults(results, minScores, logFile);
    console.log(`\n  (Completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s.)\n`);

    if (!success) {
      throw new Error('One or more scores are too low.');
    }
  } catch (err) {
    onError(err);
  }
}

function formatScore(score) {
  return `${(score * 100).toFixed(0).padStart(3)}`;
}

function onError(err) {
  console.error(err);
  console.error('');
  process.exit(1);
}

function parseInput(args) {
  const [url, minScoresRaw, logFile] = args;

  if (!url) {
    onError('Invalid arguments: <url> not specified.');
  } else if (!minScoresRaw) {
    onError('Invalid arguments: <min-scores> not specified.');
  }

  const minScores = parseMinScores(minScoresRaw || '');
  const unknownCategories = Object.keys(minScores).filter(cat => !AUDIT_CATEGORIES.includes(cat));
  const allValuesValid = Object.values(minScores).every(x => (0 <= x) && (x <= 1));

  if (unknownCategories.length > 0) {
    onError(`Invalid arguments: <min-scores> contains unknown category(-ies): ${unknownCategories.join(', ')}`);
  } else if (!allValuesValid) {
    onError(`Invalid arguments: <min-scores> has non-numeric or out-of-range values: ${minScoresRaw}`);
  }

  return {url, minScores, logFile};
}

function parseMinScores(raw) {
  const minScores = {};

  if (/^\d+$/.test(raw)) {
    raw = `all:${raw}`;
  }

  raw.
    split(',').
    map(x => x.split(':')).
    forEach(([key, val]) => minScores[key] = Number(val) / 100);

  if (minScores.hasOwnProperty('all')) {
    AUDIT_CATEGORIES.forEach(cat => minScores.hasOwnProperty(cat) || (minScores[cat] = minScores.all));
    delete minScores.all;
  }

  return minScores;
}

async function processResults(results, minScores, logFile) {
  const categories = results.lhr.categories;
  const report = results.report;

  if (logFile) {
    console.log(`\n  Saving results in '${logFile}'...`);
    console.log(`    LightHouse viewer: ${VIEWER_URL}`);

    await printer.write(report, printer.OutputMode.json, logFile);
  }

  console.log('\n  Audit results:');

  const maxTitleLen = Math.max(...Object.values(categories).map(({title}) => title.length));
  const success = Object.keys(categories).sort().reduce((aggr, cat) => {
    const {title, score} = categories[cat];
    const paddedTitle = `${title}:`.padEnd(maxTitleLen + 1);
    const minScore = minScores[cat];
    const passed = !isNaN(score) && (score >= minScore);

    console.log(
      `    - ${paddedTitle}  ${formatScore(score)}  (Required: ${formatScore(minScore)})  ${passed ? 'OK' : 'FAILED'}`);

    return aggr && passed;
  }, true);

  return success;
}

async function runLighthouse(browser, url, flags, config) {
  try {
    flags.port = (new URL(browser.wsEndpoint())).port;
    return await lighthouse(url, flags, config);
  } finally {
    await browser.close();
  }
}
