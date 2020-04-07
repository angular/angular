const chalk = require('chalk');
const { createInterface } = require('readline');
const semver = require('semver');
const { writeFileSync, readFileSync } = require('fs');
const { join } = require('path');

const MANIFEST_PATH = join(__dirname, 'src/manifest.json');

const manifest = JSON.parse(readFileSync(MANIFEST_PATH).toString());

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('Current version', chalk.yellow(manifest.version));
console.log('Current version name', chalk.yellow(manifest.version_name));

rl.question(chalk.yellowBright('Set the current version: '), (nextVersion) => {
  rl.close();
  if (!semver.valid(nextVersion)) {
    console.error(chalk.red('Invalid version'));
    process.exit(1);
  }
  if (semver.lte(nextVersion, manifest.version)) {
    console.error(chalk.red('Next version cant be smaller than the previous one'));
    process.exit(1);
  }

  manifest.version = nextVersion;
  manifest.version_name = nextVersion;

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
});
