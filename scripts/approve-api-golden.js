#!/usr/bin/env node

const shelljs = require('shelljs');
const chalk = require('chalk');
const path = require('path');
const packageName = process.argv[2];
const {guessPackageName} = require('./util');

if (!packageName) {
  console.error(chalk.red('No package name has been passed in for API golden approval.'));
  process.exit(1);
}

const projectDir = path.join(__dirname, '../');
const packageNameGuess = guessPackageName(packageName, path.join(projectDir, 'src'));

if (!packageNameGuess.result) {
  console.error(chalk.red(`Could not find package for API golden approval called ` +
    `${chalk.yellow(packageName)}. Looked in packages: \n${packageNameGuess.attempts.join('\n')}`));
  process.exit(1);
}

// ShellJS should exit if any command fails.
shelljs.set('-e');
shelljs.cd(projectDir);
shelljs.exec(`yarn bazel run //tools/public_api_guard:${packageNameGuess.result}.d.ts_api.accept`);
