/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createPatch} from 'diff';
import * as fs from 'fs';
import * as path from 'path';

/** Directory in the Angular repo where package gold tests live. */
const TEST_DIR = path.resolve(path.join('packages', 'bazel', 'test', 'ng_package'));

type TestPackage = {
  dir: string; goldPath: string
};
const packagesToTest: TestPackage[] = [
  {dir: 'example', goldPath: 'example_package.golden'},
];

/**
 * Gets all entries in a given directory (files and directories) recursively,
 * indented based on each entry's depth.
 *
 * @param directoryPath Path of the directory for which to get entries.
 * @param depth The depth of this directory (used for indentation).
 * @returns Array of all indented entries (files and directories).
 */
function getIndentedDirectoryStructure(directoryPath: string, depth = 0): string[] {
  const result: string[] = [];
  if (fs.statSync(directoryPath).isDirectory()) {
    fs.readdirSync(directoryPath).forEach(f => {
      result.push(
          '  '.repeat(depth) + path.join(directoryPath, f),
          ...getIndentedDirectoryStructure(path.join(directoryPath, f), depth + 1));
    });
  }
  return result;
}

/**
 * Gets all file contents in a given directory recursively. Each file's content will be
 * prefixed with a one-line header with the file name.
 *
 * @param directoryPath Path of the directory for which file contents are collected.
 * @returns Array of all files' contents.
 */
function getDescendantFilesContents(directoryPath: string): string[] {
  const result: string[] = [];
  if (fs.statSync(directoryPath).isDirectory()) {
    fs.readdirSync(directoryPath).forEach(dir => {
      result.push(...getDescendantFilesContents(path.join(directoryPath, dir)));
    });
  } else {
    result.push(`--- ${directoryPath} ---`, '', fs.readFileSync(directoryPath, 'utf-8'), '');
  }
  return result;
}

/** Accepts the current package output by overwriting the gold file in source control. */
function acceptNewPackageGold(testPackage: TestPackage) {
  const goldenFile = path.join(TEST_DIR, testPackage.goldPath);
  process.chdir(path.join(TEST_DIR, `${testPackage.dir}`, 'npm_package'));

  const actual = getCurrentPackageContent();
  fs.writeFileSync(require.resolve(goldenFile), actual, 'utf-8');
}

/** Gets the content of the current package. Depends on the current working directory. */
function getCurrentPackageContent() {
  return [...getIndentedDirectoryStructure('.'), ...getDescendantFilesContents('.')]
      .join('\n')
      .replace(/bazel-out\/.*\/bin/g, 'bazel-bin');
}

/** Compares the current package output to the gold file in source control in a jasmine test. */
function runPackageGoldTest(testPackage: TestPackage) {
  const goldenFile = path.join(TEST_DIR, testPackage.goldPath);
  process.chdir(path.join(TEST_DIR, `${testPackage.dir}`, 'npm_package'));

  // Gold file content from source control. We expect that the output of the package matches this.
  const expected = fs.readFileSync(goldenFile, 'utf-8');

  // Actual file content generated from the rule.
  const actual = getCurrentPackageContent();

  // Without the `--accept` flag, compare the actual to the expected in a jasmine test.
  it(`Package "${testPackage.dir}"`, () => {
    if (actual !== expected) {
      // Compute the patch and strip the header
      let patch =
          createPatch(goldenFile, expected, actual, 'Golden file', 'Generated file', {context: 5});
      const endOfHeader = patch.indexOf('\n', patch.indexOf('\n') + 1) + 1;
      patch = patch.substring(endOfHeader);

      // Use string concatentation instead of whitespace inside a single template string
      // to make the structure message explicit.
      const failureMessage = `example ng_package differs from golden file\n` +
          `    Diff:\n` +
          `    ${patch}\n\n` +
          `    To accept the new golden file, run:\n` +
          `      yarn bazel run ${process.env['BAZEL_TARGET']}.accept\n`;

      fail(failureMessage);
    }
  });
}

/** Gets all errors for missing golden files or packages. Typically missing from the bazel rule. */
function getDependencyErrors(testPackage: TestPackage): string[] {
  const errors = [];

  const goldenFile = path.join(TEST_DIR, testPackage.goldPath);
  if (!fs.existsSync(goldenFile)) {
    errors.push(
        `The golden file "${testPackage.goldPath}" cannot be found. ` +
        `Ensure that the file exists and is added to the 'data' attribute of the test rule`);
  }

  if (!fs.existsSync(path.join(TEST_DIR, `${testPackage.dir}`, 'npm_package'))) {
    errors.push(
        `The package output for "${testPackage.dir}" cannot be found. Ensure that ` +
        `the an ng_package named "npm_package" exists in the "${testPackage.dir }" directory ` +
        `and that it is added to the "data" attribute of the test rule.`);
  }

  return errors;
}


// If there are any dependency errors, emit the errors and set the exit code.
let hasError = false;
for (let p of packagesToTest) {
  const dependencyErrors = getDependencyErrors(p);
  if (dependencyErrors.length) {
    console.error(dependencyErrors.join('\n\n'));
    hasError = true;
  }
}

if (!hasError) {
  if (require.main === module) {
    const args = process.argv.slice(2);
    const acceptingNewGold = (args[0] === '--accept');

    if (acceptingNewGold) {
      for (let p of packagesToTest) {
        acceptNewPackageGold(p);
      }
    }
  } else {
    describe('Comparing test packages to golds', () => {
      for (let p of packagesToTest) {
        runPackageGoldTest(p);
      }
    });
  }
}

process.exitCode = hasError ? 1 : 0;
