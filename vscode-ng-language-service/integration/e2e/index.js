'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
const path_1 = require('path');
const vscode_test_1 = require('vscode-test');
const test_constants_1 = require('../test_constants');
async function main() {
  const EXT_DEVELOPMENT_PATH = test_constants_1.IS_BAZEL
    ? (0, path_1.join)(test_constants_1.PACKAGE_ROOT, 'npm')
    : (0, path_1.join)(test_constants_1.PACKAGE_ROOT, 'dist', 'npm');
  const EXT_TESTS_PATH = test_constants_1.IS_BAZEL
    ? (0, path_1.join)(test_constants_1.PACKAGE_ROOT, 'integration', 'e2e', 'jasmine')
    : (0, path_1.join)(test_constants_1.PACKAGE_ROOT, 'dist', 'integration', 'e2e', 'jasmine');
  try {
    await (0, vscode_test_1.runTests)({
      // Keep version in sync with vscode engine version in package.json
      version: '1.74.3',
      extensionDevelopmentPath: EXT_DEVELOPMENT_PATH,
      extensionTestsPath: EXT_TESTS_PATH,
      launchArgs: [
        test_constants_1.PROJECT_PATH,
        // This disables all extensions except the one being tested
        '--disable-extensions',
      ],
    });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}
main();
//# sourceMappingURL=index.js.map
