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

type TestPackage = {
  displayName: string; packagePath: string; goldenFilePath: string;
};

const packagesToTest: TestPackage[] = [
  {
    displayName: 'Example NPM package',
    // Resolve the "npm_package" directory by using the runfile resolution. Note that we need to
    // resolve the "package.json" of the package since otherwise NodeJS would resolve the "main"
    // file, which is not necessarily at the root of the "npm_package".
    packagePath: path.dirname(
        require.resolve('angular/packages/bazel/test/ng_package/example/npm_package/package.json')),
    goldenFilePath: require.resolve('./example_package.golden')
  },
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
    // We need to sort the directories because on Windows "readdirsync" is not sorted. Since we
    // compare these in a golden file, the order needs to be consistent across different platforms.
    fs.readdirSync(directoryPath).sort().forEach(f => {
      const filePath = path.posix.join(directoryPath, f);
      result.push(
          '  '.repeat(depth) + filePath, ...getIndentedDirectoryStructure(filePath, depth + 1));
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
    // We need to sort the directories because on Windows "readdirsync" is not sorted. Since we
    // compare these in a golden file, the order needs to be consistent across different platforms.
    fs.readdirSync(directoryPath).sort().forEach(dir => {
      result.push(...getDescendantFilesContents(path.posix.join(directoryPath, dir)));
    });
  }
  // Note that we don't want to include ".map" files in the golden file since these are not
  // consistent across different environments (e.g. path delimiters)
  else if (path.extname(directoryPath) !== '.map') {
    result.push(`--- ${directoryPath} ---`, '', readFileContents(directoryPath), '');
  }
  return result;
}

/** Accepts the current package output by overwriting the gold file in source control. */
function acceptNewPackageGold(testPackage: TestPackage) {
  process.chdir(testPackage.packagePath);
  fs.writeFileSync(testPackage.goldenFilePath, getCurrentPackageContent(), 'utf-8');
}

/** Gets the content of the current package. Depends on the current working directory. */
function getCurrentPackageContent() {
  return [...getIndentedDirectoryStructure('.'), ...getDescendantFilesContents('.')]
      .join('\n')
      .replace(/bazel-out\/.*\/bin/g, 'bazel-bin');
}

/** Compares the current package output to the gold file in source control in a jasmine test. */
function runPackageGoldTest(testPackage: TestPackage) {
  const {displayName, packagePath, goldenFilePath} = testPackage;

  process.chdir(packagePath);

  // Gold file content from source control. We expect that the output of the package matches this.
  const expected = fs.readFileSync(goldenFilePath, 'utf-8');

  // Actual file content generated from the rule.
  const actual = getCurrentPackageContent();

  // Without the `--accept` flag, compare the actual to the expected in a jasmine test.
  it(`Package "${displayName}"`, () => {
    if (actual !== expected) {
      // Compute the patch and strip the header
      let patch = createPatch(
          goldenFilePath, expected, actual, 'Golden file', 'Generated file', {context: 5});
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

/**
 * Reads the contents of the specified file. Additionally it strips all carriage return (CR)
 * characters from the given content. We do this since the content that will be pulled into the
 * golden file needs to be consistent across all platforms.
 */
function readFileContents(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8').replace(/\r/g, '');
}

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
