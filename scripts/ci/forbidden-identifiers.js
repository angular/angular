#!/usr/bin/env node

'use strict';

/*
 * The forbidden identifiers script will check for blocked statements and also detect invalid
 * imports of other scope packages.
 *
 * When running against a PR, the script will only analyze the specific amount of commits inside
 * of the Pull Request.
 *
 * By default it checks all source files and fail if any errors were found.
 */

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;

const blocked_statements = [
  '\\bddescribe\\(',
  '\\bfdescribe\\(',
  '\\biit\\(',
  '\\bfit\\(',
  '\\bxdescribe\\(',
  '\\bxit\\(',
  '\\bdebugger;',
  'from \\\'rxjs/Rx\\\'',
  '\\r'
];

const sourceFolders = ['./src', './e2e'];
const blockedRegex = new RegExp(blocked_statements.join('|'), 'g');

/*
 * Verify that the current PR is not adding any forbidden identifiers.
 * Run the forbidden identifiers check against all sources when not verifying a PR.
 */

findTestFiles()

  /* Only match .js or .ts, and remove .d.ts files. */
  .then(files => files.filter(name => /\.(js|ts)$/.test(name) && !/\.d\.ts$/.test(name)))

  /* Read content of the filtered files */
  .then(files => files.map(name => ({ name, content: fs.readFileSync(name, 'utf-8') })))

  /* Run checks against content of the filtered files. */
  .then(diffList => findErrors(diffList))

  /* Groups similar errors to simplify console output */
  .then(errors => groupErrors(errors))

  /* Print the resolved errors to the console */
  .then(errors => printErrors(errors))

  .catch(err => {
    // An error occurred in this script. Output the error and the stack.
    console.error(err.stack || err);
    process.exit(2);
  });

/**
 * Finds errors inside of changed files by running them against the blocked statements.
 * @param {{name: string, content: string}[]} diffList
 */
function findErrors(diffList) {
  return diffList.reduce((errors, diffFile) => {
    let fileName = diffFile.name;
    let content = diffFile.content.split('\n');
    let lineNumber = 0;

    content.forEach(line => {
      lineNumber++;

      let matches = line.match(blockedRegex);

      if (matches) {

        errors.push({
          fileName,
          lineNumber,
          statement: matches[0]
        });

      }
    });

    return errors;

  }, []);
}

/**
 * Groups similar errors in the same file which are present over a range of lines.
 * @param {{fileName: string, lineNumber: number, statement: string}[]} errors
 */
function groupErrors(errors) {

  let initialError, initialLine, previousLine;

  return errors.filter(error => {

    if (initialError && isSimilarError(error)) {
      previousLine = error.lineNumber;

      // Overwrite the lineNumber with a string, which indicates the range of lines.
      initialError.lineNumber = `${initialLine}-${previousLine}`;

      return false;
    }

    initialLine = previousLine = error.lineNumber;
    initialError = error;

    return true;
  });

  /** Checks whether the given error is similar to the previous one. */
  function isSimilarError(error) {
    return initialError.fileName === error.fileName &&
           initialError.statement === error.statement &&
           previousLine === (error.lineNumber - 1);
  }
}

/**
 * Prints all errors to the console and terminates the process if errors were present.
 * @param {{fileName: string, lineNumber: number, statement: string}[]} errors
 */
function printErrors(errors) {
  if (errors.length > 0) {

    console.error('Error: You are using one or more blocked statements:\n');

    errors.forEach(entry => {

      // Stringify the statement to represent line-endings or other unescaped characters.
      let statement = JSON.stringify(entry.statement);

      console.error(`   ${entry.fileName}@${entry.lineNumber}, Statement: ${statement}.\n`);
    });

    // Exit the process with an error exit code to notify the CI.
    process.exit(1);
  }
}

/**
 * Resolves all files, which should run against the forbidden identifiers check.
 * @return {Promise.<Array.<string>>} Files to be checked.
 */
function findTestFiles() {
  if (process.env['TRAVIS_PULL_REQUEST']) {
    return findChangedFiles();
  }

  let files = sourceFolders.map(folder => {
    return glob(`${folder}/**/*`);
  }).reduce((files, fileSet) => files.concat(fileSet), []);

  return Promise.resolve(files);
}

/**
 * List all the files that have been changed or added in the last commit range.
 * @returns {Promise.<Array.<string>>} Resolves with a list of files that are added or changed.
 */
function findChangedFiles() {
  let commitRange = process.env['TRAVIS_COMMIT_RANGE'];

  return exec(`git diff --name-status ${commitRange} ${sourceFolders.join(' ')}`)
    .then(rawDiff => {
      return rawDiff
        .split('\n')
        .filter(line => {
          // Status: C## => Copied (##% confident)
          //         R## => Renamed (##% confident)
          //         D   => Deleted
          //         M   => Modified
          //         A   => Added
          return line.match(/([CR][0-9]*|[AM])\s+/);
        })
        .map(line => line.split(/\s+/, 2)[1]);
    });
}

/**
 * Executes a process command and wraps it inside of a promise.
 * @returns {Promise.<String>}
 */
function exec(cmd) {
  return new Promise(function(resolve, reject) {
    child_process.exec(cmd, function(err, stdout /*, stderr */) {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}
