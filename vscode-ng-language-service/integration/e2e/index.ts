import {join} from 'node:path';
import {homedir, tmpdir} from 'node:os';
import {promisify} from 'node:util';
import {runTests} from '@vscode/test-electron';

import {PACKAGE_ROOT, PROJECT_PATH} from '../test_constants';
import {mkdtemp} from 'node:fs/promises';

// @ts-expect-error no types.
import Xvfb from 'xvfb';

async function main() {
  const EXT_DEVELOPMENT_PATH = join(PACKAGE_ROOT, 'development_package');
  const EXT_TESTS_PATH = join(PACKAGE_ROOT, 'integration', 'e2e', 'jasmine');
  const xvfb = new Xvfb();

  // We cannot use `TEST_TMPDIR` as it's longer than 170 characters
  const vsCodeDataDir = await mkdtemp(join(tmpdir(), 'vscode-e2e-'));

  try {
    await promisify(xvfb.start).call(xvfb);

    const exitCode = await runTests({
      // Keep version in sync with vscode engine version in package.json
      version: '1.74.3',
      extensionDevelopmentPath: EXT_DEVELOPMENT_PATH,
      extensionTestsPath: EXT_TESTS_PATH,
      // Avoid redownloading vscode if the test if flaky.
      cachePath: join(homedir(), '.cache/vscode-test'),
      launchArgs: [
        PROJECT_PATH,
        // This disables all extensions except the one being tested
        '--disable-extensions',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        `--extensions-dir=${vsCodeDataDir}/extensions`,
        `--user-data-dir=${vsCodeDataDir}/user-data`,
      ],
    });

    if (exitCode !== 0) {
      process.exitCode = exitCode;
    }
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exitCode = 1;
  } finally {
    await promisify(xvfb.stop).call(xvfb);
  }
}

main();
