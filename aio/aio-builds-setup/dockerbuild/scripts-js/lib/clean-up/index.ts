// Imports
import {AIO_DOWNLOADS_DIR} from '../common/constants';
import {
  AIO_ARTIFACT_PATH,
  AIO_BUILDS_DIR,
  AIO_GITHUB_ORGANIZATION,
  AIO_GITHUB_REPO,
  AIO_GITHUB_TOKEN,
} from '../common/env-variables';
import {BuildCleaner} from './build-cleaner';

// Run
_main();

// Functions
function _main(): void {
  const buildCleaner = new BuildCleaner(
    AIO_BUILDS_DIR,
    AIO_GITHUB_ORGANIZATION,
    AIO_GITHUB_REPO,
    AIO_GITHUB_TOKEN,
    AIO_DOWNLOADS_DIR,
    AIO_ARTIFACT_PATH);

  buildCleaner.cleanUp().catch(() => process.exit(1));
}
