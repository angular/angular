#!/usr/bin/env node

'use strict';
/*
 * This script analyzes the current commits of the CI.
 * It will search for blocked statements, which have been added in the commits and fail if present.
 */

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const exec = function(cmd) {
  return new Promise(function(resolve, reject) {
    child_process.exec(cmd, function(err, stdout /*, stderr */) {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
};


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

// Retrieves all scope packages dynamically from the source.
// Developers shouldn't be able to import from other scope packages by using relative paths.
const componentFolders = fs
  .readdirSync(`${__dirname}/../../src/components`)
  .map(componentName => `src/components/${componentName}`);

const scopePackages = ['src/core'].concat(componentFolders);

const blockedRegex = new RegExp(blocked_statements.join('|'), 'g');
const importRegex = /from\s+'(.*)';/g;

/**
 * Find the fork point between HEAD of the current branch, and master.
 * @return {Promise<string>} A promise which resolves with the fork SHA (or reject).
 */
function findForkPoint() {
  return exec('git merge-base --fork-point HEAD master')
    .then(function(stdout) {
      return stdout.split('\n')[0];
    });
}

/**
 * Get the commit range to evaluate when this script is run.
 * @return {Promise<string>} A commit range of the form ref1...ref2.
 */
function getCommitRange() {
  if (process.env['TRAVIS_COMMIT_RANGE']) {
    return Promise.resolve(process.env['TRAVIS_COMMIT_RANGE']);
  } else {
    return findForkPoint().then((forkPointSha) => `${forkPointSha}...HEAD`);
  }
}

/**
 * List all the files that have been changed or added in the last commit range.
 * @returns {Promise<Array<string>>} Resolves with a list of files that are
 *     added or changed.
 */
function findChangedFiles() {
  return getCommitRange()
    .then(range => {
      return exec(`git diff --name-status ${range} ./src ./e2e`);
    })
    .then(rawDiff => {
      // Ignore deleted files.
      return rawDiff.split('\n')
          .filter(function(line) {
            // Status: C## => Copied (##% confident)
            //         R## => Renamed (##% confident)
            //         D   => Deleted
            //         M   => Modified
            //         A   => Added
            return line.match(/([CR][0-9]*|[AM])\s+/);
          })
          .map(function(line) {
            return line.split(/\s+/, 2)[1];
          });
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

  let currentScope = findScope(fileName);
  let importScope = findScope(importPath);

  if (currentScope !== importScope) {
    // Transforms the invalid import statement into a correct import statement, which uses the scope package.
    let scopeImport = `@angular2-material/${path.basename(importScope)}/${path.relative(importScope, importPath)}`;

    return {
      currentScope: currentScope,
      importScope: importScope,
      invalidStatement: importMatch[0],
      scopeImportPath: scopeImport
    }
  }

  return false;

  function findScope(filePath) {
    // Normalize the filePath as well, to avoid issues with the different environments path delimiter.
    filePath = path.normalize(filePath);

    // Iterate through all scopes and try to find them inside of the file path.
    return scopePackages.filter(scope => filePath.indexOf(path.normalize(scope)) !== -1).pop();
  }

}


// Find all files, check for errors, and output every errors found.
findChangedFiles()
  .then(fileList => {
    // Only match .js or .ts, and remove .d.ts files.
    return fileList.filter(function(name) {
      return name.match(/\.[jt]s$/) && !name.match(/\.d\.ts$/);
    });
  })
  .then(fileList => {
    // Read every file and return a Promise that will contain an array of
    // Object of the form { fileName, content }.
    return Promise.all(fileList.map(function(fileName) {
      return {
        fileName: fileName,
        content: fs.readFileSync(fileName, { encoding: 'utf-8' })
      };
    }));
  })
  .then(diffList => {
    // Reduce the diffList to an array of errors. The array will be empty if no errors
    // were found.
    return diffList.reduce((errors, diffEntry) => {
      let fileName = diffEntry.fileName;
      let content = diffEntry.content.split('\n');
      let ln = 0;

      // Get all the lines that start with `+`.
      content.forEach(function(line) {
        ln++;

        let matches = line.match(blockedRegex);
        let isScopeImport = isRelativeScopeImport(fileName, line);

        if (matches || isScopeImport) {
          // Accumulate all errors at once.
          let error = {
            fileName: fileName,
            lineNumber: ln,
            statement: matches && matches[0] || isScopeImport.invalidStatement
          };

          if (isScopeImport) {
            error.message =
              '   You are using an import statement, which imports a file from another scope package.\n' +
              `   Please import the file by using the following path: ${isScopeImport.scopeImportPath}`;
          }

          errors.push(error);
        }
      });
      return errors;
    }, []);
  })
  .then(errors => {
    if (errors.length > 0) {
      console.error('Error: You are using a statement in your commit, which is not allowed.\n');

      errors.forEach(entry => {
        if (entry.message) console.error(entry.message);
        console.error(`   ${entry.fileName}@${entry.lineNumber}, Statement: ${entry.statement}.\n`);
      });

      process.exit(1);
    }
  })
  .catch(err => {
    // An error occured in this script. Output the error and the stack.
    console.error('An error occured during execution:');
    console.error(err);
    console.error(err.stack);
    process.exit(2);
  });
