import {join} from 'path';
import {runTests} from 'vscode-test';

import {PACKAGE_ROOT, PROJECT_PATH} from '../test_constants';

async function main() {
  const EXT_DEVELOPMENT_PATH = join(PACKAGE_ROOT, 'npm');
  const EXT_TESTS_PATH = join(PACKAGE_ROOT, 'integration', 'e2e', 'jasmine');

  try {
    await runTests({
      // Keep version in sync with vscode engine version in package.json
      version: '1.74.3',
      extensionDevelopmentPath: EXT_DEVELOPMENT_PATH,
      extensionTestsPath: EXT_TESTS_PATH,
      launchArgs: [
        PROJECT_PATH,
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
