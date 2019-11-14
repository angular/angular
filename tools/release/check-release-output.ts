import chalk from 'chalk';
import {join} from 'path';
import {checkReleasePackage} from './release-output/check-package';
import {releasePackages} from './release-output/release-packages';
import {parseVersionName, Version} from './version-name/parse-version';

/**
 * Checks the release output by running the release-output validations for each
 * release package.
 */
export function checkReleaseOutput(releaseOutputDir: string, currentVersion: Version) {
  let hasFailed = false;

  releasePackages.forEach(packageName => {
    if (!checkReleasePackage(releaseOutputDir, packageName, currentVersion)) {
      hasFailed = true;
    }
  });

  // In case any release validation did not pass, abort the publishing because
  // the issues need to be resolved before publishing.
  if (hasFailed) {
    console.error(chalk.red(`  ✘   Release output does not pass all release validations. ` +
      `Please fix all failures or reach out to the team.`));
    process.exit(1);
  }

  console.info(chalk.green(`  ✓   Release output passed validation checks.`));
}


if (require.main === module) {
  const currentVersion = parseVersionName(require('../../package.json').version);
  if (currentVersion === null) {
    throw Error('Version in project "package.json" is invalid.');
  }
  checkReleaseOutput(join(__dirname, '../../dist/releases'), currentVersion);
}
