'use strict';

const fs = require('fs-extra');
const lockfile = require('@yarnpkg/lockfile');
const path = require('canonical-path');
const semver = require('semver');
const shelljs = require('shelljs');
const yargs = require('yargs');

const PACKAGE_JSON = 'package.json';
const YARN_LOCK = 'yarn.lock';

/**
 * A tool that creates a node_modules folder with optional dependencies from locally
 * built distributables.
 *
 * This tool is used to change dependencies of the `aio` application and the example
 * applications to point to locally build angular packages.
 */
class NgPackagesInstaller {

  /**
   * Install node_modules for a project in the specified directory.
   *
   * @param {string} outputDir - path to output the node_modules directory from the bazel execroot.
   * @param {string} packageJson - path to package.json file from the bazel execroot.
   * @param {string} yarnLock - path to the yarn lockfile from the bazel execroot.
   * @param {object} options - a hash of options for the install:
   *     * `debug` (`boolean`) - whether to display debug messages.
   *     * `localPackages` (`string[]`) - list of paths to local packages to substitute for their third-party equivalents
   *     * `modulesFolder` (`string`) - name of the resulting node_modules folder
   */
  constructor(outputDir, packageJson, yarnLock, options = {}) {
    this.debug = this._parseBooleanArg(options.debug);
    this.buildPackages = this._parseBooleanArg(options.buildPackages);
    this.modulesFolder = options.modulesFolder;
    this.localPackages = options.localPackages || [];
    this.outputDir = path.resolve(outputDir);
    this.packageJson = path.resolve(packageJson);
    this.yarnLock = path.resolve(yarnLock);

    this._log('Output directory:', this.outputDir);
  }

  /**
   * Install locally built dependencies, overriding the dependencies in the `package.json`.
   */
  installLocalDependencies() {
    // Copy package.json, yarn.lock, and the locally-built packages to a temporary directory
    // to form node_modules.
    //
    // 1. We cannot use Yarn --modules-folder (it causes issues when resolving bins for postinstall scripts)
    //    so we always need to put into $CWD/node_modules`
    // 2. To avoid conflicts with multiple such targets in the same Bazel package --> we construct
    //     the folder in a temporary directory and copy it over to the destination directory.
    const tempDir = path.join(this.outputDir, this.modulesFolder + '_tmp');

    const pathToPackageConfig = path.resolve(tempDir, PACKAGE_JSON);
    fs.copySync(this.packageJson, pathToPackageConfig)
    fs.chmodSync(path.join(tempDir, PACKAGE_JSON), '755');

    const pathToLockfile = path.resolve(tempDir, YARN_LOCK);
    fs.copySync(this.yarnLock, pathToLockfile)
    fs.chmodSync(path.join(tempDir, YARN_LOCK), '755');


    const packageConfigFile = fs.readFileSync(pathToPackageConfig, 'utf8');
    const packageConfig = JSON.parse(packageConfigFile);
    const parsedLockfile = this._parseLockfile(pathToLockfile);

    try {

      if (this.localPackages.length) {
        const localPackagesDir = path.join(tempDir, 'local_packages');
        this._copyLocalPackagesTo(localPackagesDir);

        const packages = this._getDistPackages(localPackagesDir);

        // Overwrite local packages dependencies to other packages with local files.
        Object.keys(packages).forEach(key => {
          const pkg = packages[key];
          const tmpConfig = JSON.parse(JSON.stringify(pkg.config));

          // Prevent accidental publishing of the package, if something goes wrong.
          tmpConfig.private = true;

          // Overwrite project dependencies/devDependencies to packages with local files.
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
        
        this._log(`Writing temporary local ${PACKAGE_JSON} to ${pathToPackageConfig}`);
        fs.writeFileSync(pathToPackageConfig, localPackageConfigJson);
      }

      this._installDeps('--pure-lockfile', '--cwd', tempDir);

      // We change the name of the node_modules folder manually rather than using yarn's --modules-folder argument because it
      // doesn't work well with invoking .bin executables in yarn scripts (https://github.com/yarnpkg/yarn/issues/8134).
      fs.moveSync(path.join(tempDir, 'node_modules'), path.join(this.outputDir, this.modulesFolder), {overwrite: true});
    } finally {
      fs.rmSync(tempDir, {recursive: true});
    }
  }

  /**
   * Reinstall the original package.json dependencies
   * Yarn will also delete the local marker file for us.
   */
  restoreNpmDependencies() {
    this._installDeps('--frozen-lockfile', '--check-files');
  }

  
  _copyLocalPackagesTo(dest) {
    for (let pkg of this.localPackages) {
      // Get the package name from the path: .../{packageName}/npm_package.
      const name = path.basename(path.resolve(pkg, ".."))
      fs.copySync(pkg, path.join(dest, name))
      fs.chmodSync(path.join(dest, name, PACKAGE_JSON), '755')
    }
  }

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
   * A hash of local package configs included with --local-packages
   */
  _getDistPackages(containingDir) {
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
      ...collectPackages(containingDir)
    };

    this._log('Found the following distributables:', ...Object.keys(packageConfigs).map(key => `\n - ${key}`));
    return packageConfigs;
  }

  _installDeps(...options) {
    const command = `${process.execPath} ${process.env.YARN} install ${options.join(' ')}`;
    this._log('Installing dependencies with:', command);
    shelljs.exec(command);
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
}

function main() {
  shelljs.set('-e');

  const createInstaller = argv => {
    const {outputDir, packageJson, yarnLock, ...options} = argv;
    return new NgPackagesInstaller(outputDir, packageJson, yarnLock, options);
  };

  /* eslint-disable max-len */
  yargs
    .usage('$0 [args]')
    .option('debug', { describe: 'Print additional debug information.', default: false })
    .option('local-packages', { describe: 'List of locally built packages that should be substituted in place of their npm equivalent.', default: [], array: true })
    .option('modules-folder', { describe: 'Name of the node_modules folder.', default: 'node_modules'})
    .command('* <outputDir> <packageJson> <yarnLock> [--debug] [--local-packages package1Path package2Path] [--modules-folder node_modules]', 'Install dependencies from the locally built Angular/Zone.js distributables.', () => {}, argv => {
      createInstaller(argv).installLocalDependencies();
    })
    .strict()
    .wrap(yargs.terminalWidth())
    .argv;
  /* eslint-enable max-len */
}

module.exports = NgPackagesInstaller;
if (require.main === module) {
  main();
}
