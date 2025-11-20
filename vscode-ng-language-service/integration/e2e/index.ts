import {join} from 'node:path';
import {promisify} from 'node:util';
import {runTests} from '@vscode/test-electron';

import {PACKAGE_ROOT, PROJECT_PATH} from '../test_constants';

// @ts-expect-error no types.
import Xvfb from 'xvfb';

async function main() {
  const EXT_DEVELOPMENT_PATH = join(PACKAGE_ROOT, 'development_package');
  const EXT_TESTS_PATH = join(PACKAGE_ROOT, 'integration', 'e2e', 'jasmine');
  const xvfb = new Xvfb();
  const tmpDir = process.env['TEST_TMPDIR']!;

  try {
    await promisify(xvfb.start).call(xvfb);

    const exitCode = await runTests({
      // The current version should align with the VS Code engine version in package.json, but it's several years old.
      // TODO: We should update the package.json version eventually.
      version: '1.102.0',
      extensionDevelopmentPath: EXT_DEVELOPMENT_PATH,
      extensionTestsPath: EXT_TESTS_PATH,
      cachePath: join(tmpDir, '.cache'),
      launchArgs: [
        PROJECT_PATH,
        // This disables all extensions except the one being tested
        '--disable-extensions',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        `--extensions-dir=${join(tmpDir, 'extensions')}`,
        `--user-data-dir=${join(tmpDir, 'user-data')}`,
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
