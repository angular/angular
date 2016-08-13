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
];

const sourceFolders = ['./src', './e2e'];
const scopePackages = ['src/core'].concat(glob('src/components/*'));
const blockedRegex = new RegExp(blocked_statements.join('|'), 'g');
const importRegex = /from\s+'(.*)';/g;

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
  .then(diffList => {

    return diffList.reduce((errors, diffFile) => {
      let fileName = diffFile.name;
      let content = diffFile.content.split('\n');
      let lineCount = 0;

      content.forEach(line => {
        lineCount++;

        let matches = line.match(blockedRegex);
        let scopeImport = isRelativeScopeImport(fileName, line);

        if (matches || scopeImport) {

          let error = {
            fileName: fileName,
            lineNumber: lineCount,
            statement: matches && matches[0] || scopeImport.invalidStatement
          };

          if (scopeImport) {
            error.messages = [
              'You are using an import statement, which imports a file from another scope package.',
              `Please import the file by using the following path: ${scopeImport.scopeImportPath}`
            ];
          }

          errors.push(error);
        }
      });

      return errors;

    }, []);
  })

  /* Print the resolved errors to the console */
  .then(errors => {
    if (errors.length > 0) {
      console.error('Error: You are using one or more blocked statements:\n');

      errors.forEach(entry => {
        if (entry.messages) {
          entry.messages.forEach(message => console.error(`   ${message}`))
        }

        console.error(`   ${entry.fileName}@${entry.lineNumber}, Statement: ${entry.statement}.\n`);
      });

      process.exit(1);
    }
  })

  .catch(err => {
    // An error occurred in this script. Output the error and the stack.
    console.error('An error occurred during execution:');
    console.error(err.stack || err);
    process.exit(2);
  });


/**
 * Resolves all files, which should run against the forbidden identifiers check.
 * @return {Promise.<Array.<string>>} Files to be checked.
 */
function findTestFiles() {
  if (process.env['TRAVIS_PULL_REQUEST']) {
    return findChangedFiles();
  }

  var files = sourceFolders.map(folder => {
    return glob(`${folder}/**/*.ts`);
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
 * Checks the line for any relative imports of a scope package, which should be imported by using
 * the scope package name instead of the relative path.
 * @param fileName Filename to validate the path
 * @param line Line to be checked.
 */
function isRelativeScopeImport(fileName, line) {
  let importMatch = importRegex.exec(line);

  // We have to reset the last index of the import regex, otherwise we
  // would have incorrect matches in the next execution.
  importRegex.lastIndex = 0;

  // Skip the check if the current line doesn't match any imports.
  if (!importMatch) {
    return false;
  }

  let importPath = importMatch[1];

  // Skip the check when the import doesn't start with a dot, because the line
  // isn't importing any file relatively. Also applies to scope packages starting
  // with `@`.
  if (!importPath.startsWith('.')) {
    return false;
  }

  // Transform the relative import path into an absolute path.
  importPath = path.resolve(path.dirname(fileName), importPath);

  let fileScope = findScope(fileName);
  let importScope = findScope(importPath);

  if (fileScope.path !== importScope.path) {

    // Creates a valid import statement, which uses the correct scope package.
    let importFilePath = path.relative(importScope.path, importPath);
    let validImportPath = `@angular2-material/${importScope.name}/${importFilePath}`;

    return {
      fileScope: fileScope.name,
      importScope: importScope.name,
      invalidStatement: importMatch[0],
      scopeImportPath: validImportPath
    }
  }

  function findScope(filePath) {
    // Normalize the filePath, to avoid issues with the different environments path delimiter.
    filePath = path.normalize(filePath);

    // Iterate through all scope paths and try to find them inside of the file path.
    var scopePath = scopePackages
      .filter(scope => filePath.indexOf(path.normalize(scope)) !== -1)
      .pop();

    // Return an object containing the name of the scope and the associated path.
    return {
      name: path.basename(scopePath),
      path: scopePath
    }
  }

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