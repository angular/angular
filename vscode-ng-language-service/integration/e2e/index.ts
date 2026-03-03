import {tmpdir} from 'node:os';
import {mkdtemp} from 'node:fs/promises';
import {join} from 'node:path';
import {promisify} from 'node:util';
import {runTests} from '@vscode/test-electron';
import {existsSync} from 'node:fs';

import {PACKAGE_ROOT, PROJECT_PATH} from '../test_constants';

// @ts-expect-error no types.
import Xvfb from 'xvfb';

async function main() {
  const xQuartzXvfb = '/opt/X11/bin/Xvfb';
  if (process.platform === 'darwin' && existsSync(xQuartzXvfb)) {
    process.env['PATH'] = `/opt/X11/bin:${process.env['PATH'] ?? ''}`;
  }

  const EXT_DEVELOPMENT_PATH = join(PACKAGE_ROOT, 'development_package');
  const EXT_TESTS_PATH = join(PACKAGE_ROOT, 'integration', 'e2e', 'jasmine');
  const xvfb = new Xvfb();
  const tmpDir = process.env['TEST_TMPDIR']!;

  // Using `process.env['TEST_TMPDIR']` here causes:
  // Error: listen EROFS: read-only file system /xxxx/.cache/bazel/_bazel_alanagius/
  // d103ea59ab8213e5ce41a45e3b88196a/sandbox/linux-sandbox/7161/execroot/_main/_tmp/
  // dcbbcd4a7c783d91b28a37a9f72272bc/user-data/1.10-main.sock
  const tmpDirUserData = await mkdtemp(join(tmpdir(), 'vscode-e2e-user-data-'));

  try {
    await promisify(xvfb.start).call(xvfb);

    const exitCode = await runTests({
      // The current version should align with the VS Code engine version in package.json, but it's several years old.
      // TODO: We should update the package.json version eventually.
      version: '1.102.0',
      extensionDevelopmentPath: EXT_DEVELOPMENT_PATH,
      extensionTestsPath: EXT_TESTS_PATH,
      extensionTestsEnv: {
        HOME: tmpDir,
      },
      cachePath: join(tmpDir, '.cache'),
      launchArgs: [
        PROJECT_PATH,
        // This disables all extensions except the one being tested
        '--disable-extensions',
        '--password-store=basic',
        '--use-mock-keychain',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--preserve-symlinks',
        '--disable-software-rasterizer',
        `--extensions-dir=${join(tmpDir, 'extensions')}`,
        `--user-data-dir=${tmpDirUserData}`,
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
