'use strict';

const chalk = require('chalk');
const fs = require('fs-extra');
const lockfile = require('@yarnpkg/lockfile');
const path = require('canonical-path');
const semver = require('semver');
const shelljs = require('shelljs');
const yargs = require('yargs');

const PACKAGE_JSON = 'package.json';
const YARN_LOCK = 'yarn.lock';
const LOCAL_MARKER_PATH = 'node_modules/_local_.json';

const ANGULAR_ROOT_DIR = path.resolve(__dirname, '../../..');
const ANGULAR_DIST_PACKAGES_DIR = path.join(ANGULAR_ROOT_DIR, 'dist/packages-dist');
const AIMWA_DIST_PACKAGES_DIR = path.join(ANGULAR_ROOT_DIR, 'dist/angular-in-memory-web-api-dist');
const ZONEJS_DIST_PACKAGES_DIR = path.join(ANGULAR_ROOT_DIR, 'dist/zone.js-dist');
const DIST_PACKAGES_BUILD_SCRIPT = path.join(ANGULAR_ROOT_DIR, 'scripts/build/build-packages-dist.js');
const DIST_PACKAGES_BUILD_CMD = `"${process.execPath}" "${DIST_PACKAGES_BUILD_SCRIPT}"`;

/**
 * A tool that can install Angular/Zone.js dependencies for a project from NPM or from the
 * locally built distributables.
 *
 * This tool is used to change dependencies of the `aio` application and the example
 * applications.
 */
class NgPackagesInstaller {

  /**
   * Create a new installer for a project in the specified directory.
   *
   * @param {string} projectDir - the path to the directory containing the project.
   * @param {object} options - a hash of options for the install:
   *     * `debug` (`boolean`) - whether to display debug messages.
   *     * `force` (`boolean`) - whether to force a local installation even if there is a local marker file.
   *     * `buildPackages` (`boolean`) - whether to build the local Angular/Zone.js packages before using them.
   *           (NOTE: Building the packages is currently not supported on Windows, so a message is printed instead.)
   *     * `ignorePackages` (`string[]`) - a collection of names of packages that should not be copied over.
   */
  constructor(projectDir, options = {}) {
    this.debug = this._parseBooleanArg(options.debug);
    this.force = this._parseBooleanArg(options.force);
    this.buildPackages = this._parseBooleanArg(options.buildPackages);
    this.ignorePackages = options.ignorePackages || [];
    this.projectDir = path.resolve(projectDir);
    this.localMarkerPath = path.resolve(this.projectDir, LOCAL_MARKER_PATH);

    this._log('Project directory:', this.projectDir);
  }

  // Public methods

  /**
   * Check whether the dependencies have been overridden with locally built
   * Angular/Zone.js packages. This is done by checking for the `_local_.json` marker file.
   * This will emit a warning to the console if the dependencies have been overridden.
   */
  checkDependencies() {
    if (this._checkLocalMarker()) {
      this._printWarning();
    }
  }

  /**
   * Install locally built Angular/Zone.js dependencies, overriding the dependencies in the `package.json`.
   * This will also write a "marker" file (`_local_.json`), which contains the overridden `package.json`
   * contents and acts as an indicator that dependencies have been overridden.
   */
  installLocalDependencies() {
    if (this.force || !this._checkLocalMarker()) {
      const pathToPackageConfig = path.resolve(this.projectDir, PACKAGE_JSON);
      const packageConfigFile = fs.readFileSync(pathToPackageConfig, 'utf8');
      const packageConfig = JSON.parse(packageConfigFile);

      const pathToLockfile = path.resolve(this.projectDir, YARN_LOCK);
      const parsedLockfile = this._parseLockfile(pathToLockfile);

      const packages = this._getDistPackages();

      try {
        // Overwrite local Angular packages dependencies to other Angular packages with local files.
        Object.keys(packages).forEach(key => {
          const pkg = packages[key];
          const tmpConfig = JSON.parse(JSON.stringify(pkg.config));

          // Prevent accidental publishing of the package, if something goes wrong.
          tmpConfig.private = true;

          // Overwrite project dependencies/devDependencies to Angular/Zone.js packages with local files.
          ['dependencies', 'devDependencies'].forEach(prop => {
            const deps = tmpConfig[prop] || {};
            Object.keys(deps).forEach(key2 => {
              const pkg2 = packages[key2];
              if (pkg2) {
                // point the local packages at the distributable folder
                deps[key2] = `file:${pkg2.packageDir}`;
                this._log(`Overriding dependency of local ${key} with local package: ${key2}: ${deps[key2]}`);
              }
            });
          });

          // Overwrite the package's version to avoid version mismatch errors with the CLI.
          this._overwritePackageVersion(key, tmpConfig, packageConfig, parsedLockfile);

          fs.writeFileSync(pkg.packageJsonPath, JSON.stringify(tmpConfig, null, 2));
        });

        const [dependencies, peers] = this._collectDependencies(packageConfig.dependencies || {}, packages);
        const [devDependencies, devPeers] = this._collectDependencies(packageConfig.devDependencies || {}, packages);

        this._assignPeerDependencies(peers, dependencies, devDependencies, parsedLockfile);
        this._assignPeerDependencies(devPeers, dependencies, devDependencies, parsedLockfile);

        const localPackageConfig = Object.assign(Object.create(null), packageConfig, { dependencies, devDependencies });
        localPackageConfig.__angular = { local: true };
        const localPackageConfigJson = JSON.stringify(localPackageConfig, null, 2);

        try {
          this._log(`Writing temporary local ${PACKAGE_JSON} to ${pathToPackageConfig}`);
          fs.writeFileSync(pathToPackageConfig, localPackageConfigJson);
          this._installDeps('--pure-lockfile', '--check-files');
          this._setLocalMarker(localPackageConfigJson);
        } finally {
          this._log(`Restoring original ${PACKAGE_JSON} to ${pathToPackageConfig}`);
          fs.writeFileSync(pathToPackageConfig, packageConfigFile);
        }
      } finally {
        // Restore local Angular/Zone.js packages dependencies to other Angular packages.
        this._log(`Restoring original ${PACKAGE_JSON} for local packages.`);
        Object.keys(packages).forEach(key => {
          const pkg = packages[key];
          fs.writeFileSync(pkg.packageJsonPath, JSON.stringify(pkg.config, null, 2));
        });
      }
    }
  }

  /**
   * Reinstall the original package.json depdendencies
   * Yarn will also delete the local marker file for us.
   */
  restoreNpmDependencies() {
    this._installDeps('--frozen-lockfile', '--check-files');
  }

  // Protected helpers

  _assignPeerDependencies(peerDependencies, dependencies, devDependencies, parsedLockfile) {
    Object.keys(peerDependencies).forEach(key => {
      const peerDepRange = peerDependencies[key];

      // Ignore peerDependencies whose range is already satisfied by current version in lockfile.
      const originalRange = dependencies[key] || devDependencies[key];
      const lockfileVersion = originalRange && parsedLockfile[`${key}@${originalRange}`].version;

      if (lockfileVersion && semver.satisfies(lockfileVersion, peerDepRange)) return;

      // If there is already an equivalent dependency then override it - otherwise assign/override the devDependency
      if (dependencies[key]) {
        this._log(`Overriding dependency with peerDependency: ${key}: ${peerDepRange}`);
        dependencies[key] = peerDepRange;
      } else {
        this._log(
          `${devDependencies[key] ? 'Overriding' : 'Assigning'} devDependency with peerDependency: ` +
          `${key}: ${peerDepRange}`);
        devDependencies[key] = peerDepRange;
      }
    });
  }

  /**
   * Build the local Angular/Zone.js packages.
   *
   * NOTE:
   * Building the packages is currently not supported on Windows, so a message is printed instead, prompting the user to
   * do it themselves (e.g. using Windows Subsystem for Linux or a docker container).
   */
  _buildDistPackages() {
    const canBuild = process.platform !== 'win32';

    if (canBuild) {
      this._log(`Building the local packages with: ${DIST_PACKAGES_BUILD_SCRIPT}`);
      shelljs.exec(DIST_PACKAGES_BUILD_CMD);
    } else {
      this._warn([
        'Automatically building the local Angular/angular-in-memory-web-api/zone.js packages is currently not ' +
          'supported on Windows.',
        `Please, ensure '${ANGULAR_DIST_PACKAGES_DIR}', '${AIMWA_DIST_PACKAGES_DIR}' and ` +
          `'${ZONEJS_DIST_PACKAGES_DIR}' exist and are up-to-date (e.g. by running '${DIST_PACKAGES_BUILD_SCRIPT}' ` +
          'in Git Bash for Windows, Windows Subsystem for Linux or a Linux docker container or VM).',
        '',
        'Proceeding anyway...',
      ].join('\n'));
    }
  }

  _collectDependencies(dependencies, packages) {
    const peerDependencies = Object.create(null);
    const mergedDependencies = Object.assign(Object.create(null), dependencies);

    Object.keys(dependencies).forEach(key => {
      const sourcePackage = packages[key];
      if (sourcePackage) {
        // point the core Angular packages at the distributable folder
        mergedDependencies[key] = `file:${sourcePackage.packageDir}`;
        this._log(`Overriding dependency with local package: ${key}: ${mergedDependencies[key]}`);
        // grab peer dependencies
        const sourcePackagePeerDeps = sourcePackage.config.peerDependencies || {};
        Object.keys(sourcePackagePeerDeps)
          // ignore peerDependencies which are already core Angular/Zone.js packages
          .filter(key => !packages[key])
          .forEach(key => peerDependencies[key] = sourcePackagePeerDeps[key]);
      }
    });

    return [mergedDependencies, peerDependencies];
  }

  /**
   * A hash of Angular/Zone.js package configs.
   * (Detected as directories in '/dist/packages-dist/' and '/dist/zone.js-dist/' that contain a top-level
   * 'package.json' file.)
   */
  _getDistPackages() {
    this._log(`Distributable directory for Angular framework: ${ANGULAR_DIST_PACKAGES_DIR}`);
    this._log(`Distributable directory for angular-in-memory-web-api: ${AIMWA_DIST_PACKAGES_DIR}`);
    this._log(`Distributable directory for zone.js: ${ZONEJS_DIST_PACKAGES_DIR}`);

    if (this.buildPackages) {
      this._buildDistPackages();
    }

    const collectPackages = containingDir => {
      const packages = {};

      for (const dirName of shelljs.ls(containingDir)) {
        const packageDir = path.resolve(containingDir, dirName);
        const packageJsonPath = path.join(packageDir, PACKAGE_JSON);
        const packageConfig = fs.existsSync(packageJsonPath) ? require(packageJsonPath) : null;
        const packageName = packageConfig && packageConfig.name;

        if (!packageConfig) {
          // No `package.json` found - this directory is not a package.
          continue;
        } else if (!packageName) {
          // No `name` property in `package.json`. (This should never happen.)
          throw new Error(`Package '${packageDir}' specifies no name in its '${PACKAGE_JSON}'.`);
        } else if (this.ignorePackages.includes(packageName)) {
          this._log(`Ignoring package '${packageName}'.`);
          continue;
        }

        packages[packageName] = {
          packageDir,
          packageJsonPath,
          config: packageConfig,
        };
      }

      return packages;
    };

    const packageConfigs = {
      ...collectPackages(ANGULAR_DIST_PACKAGES_DIR),
      ...collectPackages(AIMWA_DIST_PACKAGES_DIR),
      ...collectPackages(ZONEJS_DIST_PACKAGES_DIR),
    };

    this._log('Found the following Angular distributables:', ...Object.keys(packageConfigs).map(key => `\n - ${key}`));
    return packageConfigs;
  }

  _installDeps(...options) {
    const command = 'yarn install ' + options.join(' ');
    this._log('Installing dependencies with:', command);
    shelljs.exec(command, {cwd: this.projectDir});
  }

  /**
   * Log a message if the `debug` property is set to true.
   * @param {string[]} messages - The messages to be logged.
   */
  _log(...messages) {
    if (this.debug) {
      const header = `  [${NgPackagesInstaller.name}]: `;
      const indent = ' '.repeat(header.length);
      const message = messages.join(' ');
      console.info(`${header}${message.split('\n').join(`\n${indent}`)}`);
    }
  }

  /**
   * Update a package's version with the fake version based on the package's original version in the projects's
   * lockfile.
   *
   * **Background:**
   * This helps avoid version mismatch errors with the CLI.
   * Since the version set by bazel on the locally built packages is determined based on the latest tag for a commit on
   * the current branch, it is often the case that this version is older than what the current `@angular/cli` version is
   * compatible with (e.g. if the user has not fetched the latest tags from `angular/angular` or the branch has not been
   * rebased recently.
   *
   * @param {string} packageName - The name of the package we are updating (e.g. `'@angular/core'`).
   * @param {{[key: string]: any}} packageConfig - The package's parsed `package.json`.
   * @param {{[key: string]: any}} projectConfig - The project's parsed `package.json`.
   * @param {import('@yarnpkg/lockfile').LockFileObject} projectLockfile - The projects's parsed `yarn.lock`.
   */
  _overwritePackageVersion(packageName, packageConfig, projectConfig, projectLockfile) {
    const projectVersionRange = (projectConfig.dependencies || {})[packageName] ||
                                (projectConfig.devDependencies || {})[packageName];
    const projectVersion = (projectLockfile[`${packageName}@${projectVersionRange}`] || {}).version;

    if (projectVersion !== undefined) {
      const newVersion = `${projectVersion}+locally-overwritten-by-ngPackagesInstaller`;
      this._log(`Overwriting the version of '${packageName}': ${packageConfig.version} --> ${newVersion}`);
      packageConfig.version = newVersion;
    }
  }

  /**
   * Extract the value for a boolean cli argument/option. When passing an option multiple times, `yargs` parses it as an
   * array of boolean values. In that case, we only care about the last occurrence.
   *
   * This can be useful, for example, when one has a base command with the option turned on and another command
   * (building on top of the first one) turning the option off:
   * ```
   * "base-command": "my-script --foo --bar",
   * "no-bar-command": "yarn base-command --no-bar",
   * ```
   */
  _parseBooleanArg(value) {
    return Array.isArray(value) ? value.pop() : value;
  }

  /**
   * Parse and return a `yarn.lock` file.
   */
  _parseLockfile(lockfilePath) {
    const lockfileContent = fs.readFileSync(lockfilePath, 'utf8');
    const parsed = lockfile.parse(lockfileContent);

    if (parsed.type !== 'success') {
      throw new Error(
        `[${NgPackagesInstaller.name}]: Error parsing lockfile '${lockfilePath}' (result type: ${parsed.type}).`);
    }

    return parsed.object;
  }

  _printWarning() {
    const relativeScriptPath = path.relative('.', __filename.replace(/\.js$/, ''));
    const absoluteProjectDir = path.resolve(this.projectDir);
    const restoreCmd = `node ${relativeScriptPath} restore ${absoluteProjectDir}`;

    // Log a warning.
    this._warn([
      `The project at "${absoluteProjectDir}" is running against the local Angular/Zone.js build.`,
      '',
      'To restore the npm packages run:',
      '',
      `  "${restoreCmd}"`,
    ].join('\n'));
  }

  /**
   * Log a warning message do draw user's attention.
   * @param {string[]} messages - The messages to be logged.
   */
  _warn(...messages) {
    const lines = messages.join(' ').split('\n');
    console.warn(chalk.yellow([
      '',
      '!'.repeat(110),
      '!!!',
      '!!!  WARNING',
      '!!!',
      ...lines.map(line => `!!!  ${line}`),
      '!!!',
      '!'.repeat(110),
      '',
    ].join('\n')));
  }

  // Local marker helpers

  _checkLocalMarker() {
    this._log('Checking for local marker at', this.localMarkerPath);
    return fs.existsSync(this.localMarkerPath);
  }

  _setLocalMarker(contents) {
    this._log('Writing local marker file to', this.localMarkerPath);
    fs.writeFileSync(this.localMarkerPath, contents);
  }
}

function main() {
  shelljs.set('-e');

  const createInstaller = argv => {
    const {projectDir, ...options} = argv;
    return new NgPackagesInstaller(projectDir, options);
  };

  /* eslint-disable max-len */
  yargs
    .usage('$0 <cmd> [args]')

    .option('debug', { describe: 'Print additional debug information.', default: false })
    .option('force', { describe: 'Force the command to execute even if not needed.', default: false })
    .option('build-packages', { describe: 'Build the local Angular/Zone.js packages, before using them.', default: false })
    .option('ignore-packages', { describe: 'List of Angular/Zone.js packages that should not be used in local mode.', default: [], array: true })

    .command('overwrite <projectDir> [--force] [--debug] [--ignore-packages package1 package2]', 'Install dependencies from the locally built Angular/Zone.js distributables.', () => {}, argv => {
      createInstaller(argv).installLocalDependencies();
    })
    .command('restore <projectDir> [--debug]', 'Install dependencies from the npm registry.', () => {}, argv => {
      createInstaller(argv).restoreNpmDependencies();
    })
    .command('check <projectDir> [--debug]', 'Check that dependencies came from npm. Otherwise display a warning message.', () => {}, argv => {
      createInstaller(argv).checkDependencies();
    })
    .demandCommand(1, 'Please supply a command from the list above.')
    .strict()
    .wrap(yargs.terminalWidth())
    .argv;
  /* eslint-enable max-len */
}

module.exports = NgPackagesInstaller;
if (require.main === module) {
  main();
}
