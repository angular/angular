/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const chalk = require('chalk');
const {createInterface} = require('readline');
const semver = require('semver');
const {writeFileSync, readFileSync} = require('fs');
const {join} = require('path');

const MANIFEST_PATH = join(__dirname, 'src/manifest/manifest.chrome.json');

const manifest = JSON.parse(readFileSync(MANIFEST_PATH).toString());

// tslint:disable-next-line:no-console
console.log('Current version', chalk.yellow(manifest.version));

// tslint:disable-next-line:no-console
console.log('Current version name', chalk.yellow(manifest.version_name));

const setVersion = (nextVersion) => {
  manifest.version = nextVersion;
  manifest.version_name = nextVersion;

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
};

const answerMap = {
  yes: true,
  y: true,
  no: false,
  n: false,
};

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(chalk.yellowBright('Set the current version: '), (nextVersion) => {
  if (!semver.valid(nextVersion)) {
    console.error(chalk.red('Invalid version'));
  }
  if (semver.gt(nextVersion, manifest.version)) {
    rl.close();
    setVersion(nextVersion);
    return;
  }
  console.error(chalk.yellow('Next version cannot be smaller or equal to the previous one'));
  rl.question('Are you sure you want to continue? (y/n) ', (answer) => {
    rl.close();
    answer = answer.toLowerCase();
    if (!answerMap[answer]) {
      throw new Error('Exiting');
    }
    setVersion(nextVersion);
  });
});
