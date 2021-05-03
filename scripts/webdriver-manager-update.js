#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
'use strict';
// Use process.cwd() so that this script is portable and can be used in /aio
// where this will require /aio/node_modules/puppeteer
const puppeteerPkgPath = require.resolve('puppeteer/package.json', {paths: [process.cwd()]});
const puppeteerVersion = require(puppeteerPkgPath).version;
const chromedriverVersionMap = require('./puppeteer-chromedriver-versions');
const spawnSync = require('child_process').spawnSync;

const version = chromedriverVersionMap[puppeteerVersion];
if (!version) {
  console.error(`[webdriver-manager-update.js] Error: Could not find ChromeDriver version for Puppeteer version '${
      puppeteerVersion}' in ChromeDriver/Puppeteer version map. Please update /scripts/puppeteer-chromedriver-versions.js.`);
  process.exit(1);
}

const args = [
  'webdriver-manager',
  'update',
  '--gecko=false',
  '--standalone=false',
  '--versions.chrome',
  version,
  // Append additional user arguments after script default arguments
  ...process.argv.slice(2),
];

const result = spawnSync('yarn', args, {shell: true, stdio: 'inherit'});
if (result.error) {
  console.error(`[webdriver-manager-update.js] Call to 'yarn ${
      args.join(' ')}' failed with error code ${result.error.code}`);
  process.exit(result.status);
}
if (result.status) {
  console.error(`[webdriver-manager-update.js] Call to 'yarn ${
      args.join(' ')}' failed with error code ${result.status}`);
  process.exit(result.status);
}
