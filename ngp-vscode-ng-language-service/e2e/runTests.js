/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const path = require('path');
const {runTests} = require('@vscode/test-electron');

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../');
    const extensionTestsPath = path.resolve(__dirname, './dist/index');

    // Create workspace for testing
    const workspacePath = path.resolve(__dirname, 'test-workspace');
    const userDataDir = path.resolve(__dirname, '../../.vscode-test-user-data');

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [workspacePath, '--disable-extensions', `--user-data-dir=${userDataDir}`],
    });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}

main();
