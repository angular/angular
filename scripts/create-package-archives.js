#!/usr/bin/env node

/**
 * Script that creates tar archives of built release packages. These archives can then
 * be uploaded to the CircleCI artifacts so that PRs or individual commits can be easily
 * tested out without having to build the release packages manually, and packing them up.
 *
 * This is different to the snapshot builds repositories as those only are available for
 * the primary `cdk` and `material` packages, and also don't run for pull requests.
 */

const {join} = require('path');
const {rm, mkdir, test, ls, set, exec, cd} = require('shelljs');
const {red, green} = require('chalk');
const yargs = require('yargs');

const projectDir = join(__dirname, '../');
const archivesDir = 'dist/release-archives';
const releasesDir = 'dist/releases';
const {suffix} = yargs(process.argv.slice(2))
  .option('suffix', {type: 'string', demandOption: true})
  .strict()
  .parseSync();

// Fail if any ShellJS command fails.
set('-e');

cd(projectDir);

if (!test('-e', releasesDir)) {
  console.error(red('The release output has not been built.'));
  process.exit(1);
}

rm('-Rf', archivesDir);
mkdir('-p', archivesDir);

const builtPackages = ls(releasesDir)
  .map(name => ({name, path: join(releasesDir, name)}))
  .filter(pkg => test('-d', pkg.path));

// If multiple packages should be archived, we also generate a single archive that
// contains all packages. This makes it easier to transfer the release packages.
if (builtPackages.length > 1) {
  console.info('Creating archive with all packages..');
  exec(`tar --create --gzip --directory ${releasesDir} --file ${archivesDir}/all-${suffix}.tgz .`);
}

for (const pkg of builtPackages) {
  console.info(`Creating archive for package: ${pkg.name}`);
  exec(
    `tar --create --gzip --directory ${pkg.path} --file ${archivesDir}/${pkg.name}-${suffix}.tgz .`,
  );
}

console.info(green(`Created package archives in: ${archivesDir}`));
