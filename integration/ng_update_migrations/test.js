/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const {globSync} = require('tinyglobby');
const chalk = require('chalk');
const diff = require('diff');

const projectDir = __dirname;
const cliBinPath = path.join(projectDir, 'node_modules/@angular/cli/bin/ng');

const expectationFiles = globSync('**/*_expected.+(ts|html)', {cwd: projectDir});

const fromVersion = '12.0.0';
const toVersion = '13.0.0';
// Note that we need to specify "--allow-dirty" as the repository will become dirty
// if dependencies for the integration test are installed (i.e. modified lock files)
const updateCommandArgs = [
  '@angular/core',
  '--migrate-only',
  '--from',
  fromVersion,
  '--to',
  toVersion,
  '--allow-dirty',
];

// Print out the command that is used to run the migrations for easier debugging.
console.error(`Running "ng update ${updateCommandArgs.join(' ')}":`);
console.error(chalk.yellow(`------------------------------------------`));

const updateProcess = child_process.spawnSync(
  'node',
  [cliBinPath, 'update', ...updateCommandArgs],
  {stdio: 'inherit', cwd: projectDir},
);

console.error(chalk.yellow(`------------------------------------------\n`));

if (updateProcess.status !== 0) {
  console.error(chalk.red('✘ Running "ng update" failed. See output above.'));
  process.exit(1);
}

let testsPassing = true;

// Check if each expectation file matches the actual file in the CLI project.
expectationFiles.forEach((relativeFilePath) => {
  const actualFilePath = relativeFilePath.replace(/_expected.(ts)$/, '.$1');
  const expectedContent = fs.readFileSync(path.join(projectDir, relativeFilePath), 'utf8');
  const actualContent = fs.readFileSync(path.join(projectDir, actualFilePath), 'utf8');

  if (expectedContent === actualContent) {
    console.log(chalk.green(`✓  File "${actualFilePath}" matches the expected output.`));
  } else {
    testsPassing = false;
    console.error(chalk.red(`✘  File "${actualFilePath}" does not match the expected output.`));
    console.log(chalk.yellow('--------------------------------------------'));
    printColoredPatch(actualFilePath, actualContent, expectedContent);
    console.log(chalk.yellow('--------------------------------------------\n'));
  }
});

process.exit(testsPassing ? 0 : 1);

/** Compares the two strings and prints out a colored diff to stdout. */
function printColoredPatch(actualFilePath, actualContent, expectedContent) {
  const patchLines = diff
    .createPatch(
      actualFilePath,
      expectedContent,
      actualContent,
      'Expected content',
      'Actual content',
    )
    .split(/\r?\n/);
  // Walk through each line of the patch and print it. We omit the first two lines
  // as these are the patch header and not relevant to the test.
  for (let line of patchLines.slice(2)) {
    if (line.startsWith('+')) {
      console.log(chalk.green(line));
    } else if (line.startsWith('-')) {
      console.log(chalk.red(line));
    } else {
      console.log(chalk.grey(line));
    }
  }
}
