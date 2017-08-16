#!/bin/env node
'use strict';

// Imports
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('canonical-path');
const shelljs = require('shelljs');
const yargs = require('yargs');

// Config
shelljs.set('-e');

// Constants
const ROOT_DIR = path.resolve(__dirname, '../..');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const PACKAGES_DIST_DIR = path.join(ROOT_DIR, 'dist/packages-dist');
const NG_LOCAL_FILENAME = '.ng-local';

// Classes
class NgPackagesInstaller {
  constructor() {
    // Properties - Protected

    /**
     * A sorted list of Angular package names.
     * (Detected as directories in '/packages/' that contain a top-level 'package.json' file.)
     */
    this.ngPackages = shelljs.
      find(PACKAGES_DIR).
      map(path => path.slice(PACKAGES_DIR.length + 1)).
      filter(path => /^[^/]+\/package.json$/.test(path)).
      map(path => path.slice(0, -13)).
      sort();
  }

  // Methods - Public

  /**
   * Check whether the Angular packages installed in the specified `rootDir`'s 'node_modules/' come from npm and print a
   * warning if not.
   * @param {string} rootDir - The root directory whose npm dependencies will be checked.
   */
  checkPackages(rootDir) {
    rootDir = path.resolve(rootDir);
    const localPackages = this._findLocalPackages(rootDir);

    if (localPackages.length) {
      const relativeScriptPath = path.relative('.', __filename.replace(/\.js$/, ''));
      const relativeRootDir = path.relative('.', rootDir) || '.';
      const restoreCmd = `node ${relativeScriptPath} restore ${relativeRootDir}`;

      // Log a warning.
      console.warn(chalk.yellow([
        '',
        '!'.repeat(110),
        '!!!',
        '!!!  WARNING',
        '!!!',
        `!!!  The following packages have been overwritten in '${rootDir}/node_modules/' with the locally built ones:`,
        '!!!',
        ...localPackages.map(pkg => `!!!    - @angular/${pkg}`),
        '!!!',
        '!!!  To restore the packages run:',
        '!!!',
        `!!!    ${restoreCmd}`,
        '!!!',
        '!'.repeat(110),
        '',
      ].join('\n')));
    }
  }

  /**
   * Overwrite the Angular packages installed in the specified `rootDir`'s 'node_modules/' with the locally built ones.
   * @param {string} rootDir - The root directory whose npm dependencies will be overwritten.
   */
  overwritePackages(rootDir) {
    rootDir = path.resolve(rootDir);
    const nodeModulesDir = path.join(rootDir, 'node_modules');

    this.ngPackages.forEach(packageName => this._overwritePackage(packageName, nodeModulesDir));
  }

  /**
   * Ensure that the Angular packages installed in the specified `rootDir`'s 'node_modules/' come from npm.
   * (If necessary, re-install the Angular packages using `yarn`.)
   * @param {string} rootDir - The root directory whose npm dependencies will be restored.
   */
  restorePackages(rootDir) {
    rootDir = path.resolve(rootDir);
    const localPackages = this._findLocalPackages(rootDir);

    if (localPackages.length) {
      this._reinstallOverwrittenNodeModules(rootDir);
    }
  }

  // Methods - Protected

  /**
   * Find and return all Angular packages installed in the specified `rootDir`'s 'node_modules/' that have been
   * overwritten with the locally built ones.
   * @param {string} rootDir - The root directory whose npm dependencies will be checked.
   * @return {string[]} - A list of overwritten package names.
   */
  _findLocalPackages(rootDir) {
    const nodeModulesDir = path.join(rootDir, 'node_modules');
    const localPackages = this.ngPackages.filter(packageName => this._isLocalPackage(packageName, nodeModulesDir));

    this._log(`Local packages found: ${localPackages.join(', ') || '-'}`);

    return localPackages;
  }

  /**
   * Check whether an installed Angular package from `nodeModulesDir` has been overwritten with a
   * locally built package.
   * @param {string} packageName    - The name of the package to check.
   * @param {string} nodeModulesDir - The target `node_modules/` directory.
   * @return {boolean} - True if the package has been overwritten or false otherwise.
   */
  _isLocalPackage(packageName, nodeModulesDir) {
    const targetPackageDir = path.join(nodeModulesDir, '@angular', packageName);
    const localFlagFile = path.join(targetPackageDir, NG_LOCAL_FILENAME);
    const isLocal = fs.existsSync(localFlagFile);

    this._log(`Checking package '${packageName}' (${targetPackageDir})... local: ${isLocal}`);

    return isLocal;
  }

  /**
   * Log a message if the `debug` property is set to true.
   * @param {string} message - The message to be logged.
   */
  _log(message) {
    if (this.debug) {
      const indent = '  ';
      console.info(`${indent}[${NgPackagesInstaller.name}]: ${message.split('\n').join(`\n${indent}`)}`);
    }
  }

  /**
   * Parse and validate the input and invoke the appropriate command.
   */
  _main() {
    const preCommand = argv => {
      this.debug = argv.debug;

      const availablePackages = this.ngPackages.map(pkg => `\n  - @angular/${pkg}`).join('') || '-';
      this._log(`Available Angular packages: ${availablePackages}`);
    };

    yargs.
      usage('$0 <cmd> <args>').
      command(
        'check <projectDir> [--debug]',
        'Check whether the Angular packages installed as dependencies of `projectDir` come from npm and print a ' +
        'warning if not.',
        {
          debug: {describe: 'Print debug information.'}
        },
        argv => {
          preCommand(argv);
          this.checkPackages(argv.projectDir);
        }).
      command(
        'overwrite <projectDir> [--debug]',
        'Overwrite the Angular packages installed as dependencies of `projectDir` with the locally built ones.',
        {
          debug: {describe: 'Print debug information.'}
        },
        argv => {
          preCommand(argv);
          this.overwritePackages(argv.projectDir);
        }).
      command(
        'restore <projectDir> [--debug]',
        'Ensure that the Angular packages installed as dependencies of `projectDir` come from npm.',
        {
          debug: {describe: 'Print debug information.'}
        },
        argv => {
          preCommand(argv);
          this.restorePackages(argv.projectDir);
        }).
      demandCommand(1, 'Please supply a command from the list above.').
      strict().
      argv;
  }

  /**
   * Remove an installed Angular package from `nodeModulesDir` and replace it with the locally built
   * one. Mark the package by adding an `.ng-local` file in the target directory.
   * @param {string} packageName    - The name of the package to overwrite.
   * @param {string} nodeModulesDir - The target `node_modules/` directory.
   */
  _overwritePackage(packageName, nodeModulesDir) {
    const sourcePackageDir = path.join(PACKAGES_DIST_DIR, packageName);
    const targetPackageDir = path.join(nodeModulesDir, '@angular', packageName);
    const localFlagFile = path.join(targetPackageDir, NG_LOCAL_FILENAME);

    this._log(`Overwriting package '${packageName}' (${sourcePackageDir} --> ${targetPackageDir})...`);

    if (fs.existsSync(targetPackageDir)) {
      shelljs.rm('-rf', targetPackageDir);
      fs.copySync(sourcePackageDir, targetPackageDir);
      fs.writeFileSync(localFlagFile, '');
    } else {
      this._log('  Nothing to overwrite - the package is not installed...');
    }
  }

  /**
   * Re-install overwritten npm dependencies using `yarn`. Removes the `.yarn-integrity` file to ensure `yarn` detects
   * the overwritten packages.
   * @param {string} rootDir - The root directory whose npm dependencies will be re-installed.
   */
  _reinstallOverwrittenNodeModules(rootDir) {
    const installCmd = 'yarn install --check-files';

    this._log(`Running '${installCmd}' in '${rootDir}'...`);
    shelljs.exec(installCmd, {cwd: rootDir});
  }
}

// Exports
module.exports = new NgPackagesInstaller();

// Run
if (require.main === module) {
  // This file was run directly; run the main function.
  module.exports._main();
}
