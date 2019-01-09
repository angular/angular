import {green, red} from 'chalk';
import {join} from 'path';
import {checkReleasePackage} from './release-output/check-package';
import {releasePackages} from './release-output/release-packages';

/**
 * Checks the release output by running the release-output validations for each
 * release package.
 */
export function checkReleaseOutput(releaseOutputDir: string) {
  let hasFailed = false;

  releasePackages.forEach(packageName => {
    if (!checkReleasePackage(releaseOutputDir, packageName)) {
      hasFailed = true;
    }
  });

  // In case any release validation did not pass, abort the publishing because
  // the issues need to be resolved before publishing.
  if (hasFailed) {
    console.error(red(`  ✘   Release output does not pass all release validations. Please fix ` +
      `all failures or reach out to the team.`));
    process.exit(1);
  }

  console.info(green(`  ✓   Release output passed validation checks.`));
}


if (require.main === module) {
  checkReleaseOutput(join(__dirname, '../../dist/releases'));
}
