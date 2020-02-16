#!/usr/bin/env node
'use strict';

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Use process.cwd() so that this script is portable and can be used in /aio
// where this will require /aio/node_modules/puppeteer
const puppeteerVersion = require(`${process.cwd()}/node_modules/puppeteer/package.json`).version;
const chromeVersionMap = require('./puppeteer-chrome-versions');
const spawnSync = require('child_process').spawnSync;

const version = chromeVersionMap[puppeteerVersion];
if (!version) {
  console.error(`[webdriver-manager-update.js] Error: Could not Chrome version for Puppeteer version '${puppeteerVersion}' in Chrome/Puppeteer version map. Please update /scripts/puppeteer-chrome-versions.js.`);
  process.exit(1);
}

const args = [
  'update',
  '--gecko=false',
  '--standalone=false',
  '--versions.chrome',
  version,
  // Append additional user arguments after script default arguments
  ...process.argv.slice(2),
];

const isWindows = process.platform === 'win32';
const result = spawnSync(`${process.cwd()}/node_modules/.bin/webdriver-manager${isWindows ? '.cmd' : ''}`, args, {stdio: 'inherit'});
if (result.error) {
  console.error(`[webdriver-manager-update.js] Call to 'webdriver-manager update ${args.join(' ')}' failed with error code ${result.error.code}`);
  process.exit(result.status);
}
if (result.status) {
  console.error(`[webdriver-manager-update.js] Call to 'webdriver-manager update ${args.join(' ')}' failed with error code ${result.status}`);
  process.exit(result.status);
}  
