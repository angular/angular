/**
 * Script that sets up Ivy ngcc to postprocess installed node modules. The script achieves
 * this by updating the "postinstall" script in the "package.json". This is necessary because
 * Bazel manages its own version of the node modules and needs to run ngcc on its own when
 * installing dependencies.
 */

const {green} = require('chalk');
const {writeFileSync} = require('fs');
const {join} = require('path');

const projectDir = join(__dirname, '../../');
const packageJsonPath = join(projectDir, 'package.json');
const packageJson = require(packageJsonPath);

const postInstallCommand = `ngcc --properties main module`;

if (!packageJson['scripts']) {
  packageJson['scripts'] = {};
}

if (!packageJson.scripts.postinstall) {
  packageJson.scripts.postinstall = postInstallCommand;
} else {
  packageJson.scripts.postinstall += ` && ${postInstallCommand}`;
}

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(green('Successfully set up Ivy ngcc in the "package.json".'));
