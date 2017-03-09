// Imports
import {getEnvVar} from '../common/utils';
import {BuildCleaner} from './build-cleaner';

// Constants
const AIO_BUILDS_DIR = getEnvVar('AIO_BUILDS_DIR');
const AIO_GITHUB_TOKEN = getEnvVar('AIO_GITHUB_TOKEN', true);
const AIO_REPO_SLUG = getEnvVar('AIO_REPO_SLUG');

// Run
_main();

// Functions
function _main() {
  console.log(`[${new Date()}] - Cleaning up builds...`);

  const buildCleaner = new BuildCleaner(AIO_BUILDS_DIR, AIO_REPO_SLUG, AIO_GITHUB_TOKEN);

  buildCleaner.cleanUp().catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
  });
}
