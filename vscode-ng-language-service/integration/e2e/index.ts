import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {runTests} from '@vscode/test-electron';

import {PACKAGE_ROOT, PROJECT_PATH} from '../test_constants';
import {mkdtemp} from 'node:fs/promises';

// @ts-expect-error no types.
import Xvfb from 'xvfb';

async function main() {
  const EXT_DEVELOPMENT_PATH = join(PACKAGE_ROOT, 'npm/vscode-ng-language-service/vsix_sandbox');
  const EXT_TESTS_PATH = join(PACKAGE_ROOT, 'integration', 'e2e', 'jasmine');
  const xvfb = new Xvfb();
  const cacheDir = await mkdtemp(join(tmpdir(), 'vscode-e2e-'));

  try {
    xvfb.start();
    const result = await runTests({
      // Keep version in sync with vscode engine version in package.json
      version: '1.74.3',
      extensionDevelopmentPath: EXT_DEVELOPMENT_PATH,
      extensionTestsPath: EXT_TESTS_PATH,
      cachePath: cacheDir,
      launchArgs: [
        PROJECT_PATH,
        // This disables all extensions except the one being tested
        '--disable-extensions',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        `--extensions-dir=${cacheDir}/extensions`,
        `--user-data-dir=${cacheDir}/user-data`,
      ],
    });

    if (result !== 0) {
      process.exit(result);
    }
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  } finally {
    xvfb.stop();
  }
}

main();
