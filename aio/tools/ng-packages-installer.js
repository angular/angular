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
const ROOT_NODE_MODULES_DIR = path.join(ROOT_DIR, 'node_modules');
const NG_LOCAL_FILENAME = '.ng-local';
const PACKAGE_JSON_FILENAME = 'package.json';
const PACKAGE_JSON_REGEX = new RegExp(`^[^/]+/${PACKAGE_JSON_FILENAME}$`);

// Classes
class NgPackagesInstaller {
  constructor() {
    const packagePaths = shelljs.
      find(PACKAGES_DIR).
      map(path => path.slice(PACKAGES_DIR.length + 1)).
      filter(path => PACKAGE_JSON_REGEX.test(path));
    const packageConfigs = packagePaths.
      map(packagePath => require(PACKAGES_DIR + '/' + packagePath));

    // Properties - Protected

    /**
     * A sorted list of Angular package names.
     * (Detected as directories in '/packages/' that contain a top-level 'package.json' file.)
     */
    this.ngPackages = packagePaths.
      map(path => path.slice(0, -PACKAGE_JSON_FILENAME.length - 1)).
      sort();

    /**
     * A sorted list of node modules that are depedencies of the Angular pacakges
     */
    this.dependencies = this._extractDependencies(packageConfigs, 'dependencies');

    /**
     * A sorted list of node modules that are peer depedencies of the Angular pacakges
     */
    this.peerDependencies = this._extractDependencies(packageConfigs, 'peerDependencies');
  }

  // Methods - Public

  /**
   * Check whether the Angular packages installed in the specified `rootDir`'s 'node_modules/' come from npm and print a
   * warning if not.
   * @param {string} rootDir - The root directory whose npm dependencies will be checked.
   */
  checkPackages(rootDir) {
    rootDir = path.resolve(rootDir);
    const localPackages = this._findAllLocalPackages(rootDir);

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
        ...localPackages.map(pkg => `!!!    - ${pkg}`),
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

    this.ngPackages.forEach(packageName => this._overwritePackage(PACKAGES_DIST_DIR, packageName, path.join(nodeModulesDir, '@angular/')));
    // this.dependencies.forEach(packageName => this._overwritePackage(ROOT_NODE_MODULES_DIR, packageName, nodeModulesDir));
    // this.peerDependencies.forEach(packageName => this._overwritePackage(ROOT_NODE_MODULES_DIR, packageName, nodeModulesDir));

    // Reset the executable flags in .bin
    this._log('Updating executable flags in node_modules .bin folder');
    shelljs.ls(path.join(nodeModulesDir, '.bin', '*')).forEach(file => {
      if (fs.existsSync(file)) {
        shelljs.chmod('+x', file);
      } else {
        this._log(' - unable to update ' + file);
      }
    });
  }

  /**
   * Ensure that the Angular packages installed in the specified `rootDir`'s 'node_modules/' come from npm.
   * (If necessary, re-install the Angular packages using `yarn`.)
   * @param {string} rootDir - The root directory whose npm dependencies will be restored.
   */
  restorePackages(rootDir) {
    rootDir = path.resolve(rootDir);
    const localPackages = this._findAllLocalPackages(rootDir);

    if (localPackages.length) {
      this._reinstallOverwrittenNodeModules(rootDir);
    }
  }

  // Methods - Protected

  /**
   * Parse the `package.json` files for their dependencies.
   * @param {Object[]} packageConfigs - a collection of package.json objects.
   * @param {string} dependenciesProperty - the key of the property that holds the dependency info.
   * @return a sorted collection of dependency names.
   */
  _extractDependencies(packageConfigs, dependenciesProperty) {
    const dependencyMap = Object.create(null);

    packageConfigs.forEach(packageConfig => {
      const dependencies = packageConfig[dependenciesProperty] || Object.create(null);
      Object.keys(dependencies).forEach(key => {
        if (key.indexOf('@angular/') !== 0 && dependencies[key] !== '0.0.0-PLACEHOLDER') {
          dependencyMap[key] = dependencies[key];
        }
      });
    });

    return Object.keys(dependencyMap).sort();
  }

  /**
   *
   * @param {string} nodeModulesDir - The base node_modules directory containing packages
   * @param {string} scope - The npm scope of the packages to search
   */
  _findLocalPackages(nodeModulesDir, scope) {
    try {
      return shelljs.ls(path.join(nodeModulesDir, scope, '*', NG_LOCAL_FILENAME)).
        map(path => path.slice(nodeModulesDir.length + 1, - NG_LOCAL_FILENAME.length - 1));
    } catch(e) {
      if (e.message.indexOf('ls: no such file or directory') === -1) throw e;
      return [];
    }
  }

  /**
   * Find and return all Angular packages installed in the specified `rootDir`'s 'node_modules/' that have been
   * overwritten with the locally built ones.
   * @param {string} rootDir - The root directory whose npm dependencies will be checked.
   * @return {string[]} - A list of overwritten package names.
   */
  _findAllLocalPackages(rootDir) {
    const nodeModulesDir = path.join(rootDir, 'node_modules');

    let localPackages = this._findLocalPackages(nodeModulesDir, '@angular');
    this._log(`Local packages found: ${localPackages.join(', ') || '-'}`);

    let localDependencies = this._findLocalPackages(nodeModulesDir, '');
    this._log(`Local dependencies found: ${localDependencies.join(', ') || '-'}`);

    return localPackages.concat(localDependencies);
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

      const dependencies = this.dependencies.map(pkg => `\n  - ${pkg}`).join('') || '-';
      this._log(`Angular dependencies: ${dependencies}`);

      const peerDependencies = this.peerDependencies.map(pkg => `\n  - ${pkg}`).join('') || '-';
      this._log(`Angular peerDependencies: ${peerDependencies}`);
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
   * Remove an installed Angular package from `targetFolder` and replace it with the locally built
   * one. Mark the package by adding an `.ng-local` file in the target directory.
   * @param {string} sourceFolder   - The folder where we should find the source package
   * @param {string} packageName    - The name of the package to overwrite.
   * @param {string} targetFolder - The target `node_modules/` directory.
   */
  _overwritePackage(sourceFolder, packageName, targetFolder) {
    const sourcePackageDir = path.join(sourceFolder, packageName);
    const targetPackageDir = path.join(targetFolder, packageName);
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
