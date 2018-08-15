'use strict';

const fs = require('fs-extra');
const lockfile = require('@yarnpkg/lockfile');
const path = require('canonical-path');
const shelljs = require('shelljs');

const NgPackagesInstaller = require('./index');

describe('NgPackagesInstaller', () => {
  const projectDir = 'root/dir';
  const absoluteProjectDir = path.resolve(projectDir);
  const nodeModulesDir = path.resolve(absoluteProjectDir, 'node_modules');
  const packageJsonPath = path.resolve(absoluteProjectDir, 'package.json');
  const yarnLockPath = path.resolve(absoluteProjectDir, 'yarn.lock');
  const ngRootDir = path.resolve(__dirname, '../../..');
  const packagesDir = path.join(ngRootDir, 'dist/packages-dist');
  const zoneJsDir = path.join(ngRootDir, 'dist/zone.js-dist');
  const toolsDir = path.join(ngRootDir, 'dist/tools/@angular');
  let installer;

  beforeEach(() => {
    spyOn(fs, 'existsSync');
    spyOn(fs, 'readFileSync');
    spyOn(fs, 'writeFileSync');
    spyOn(shelljs, 'exec');
    spyOn(shelljs, 'rm');
    spyOn(console, 'log');
    spyOn(console, 'warn');
    installer = new NgPackagesInstaller(projectDir);
  });

  describe('checkDependencies()', () => {
    beforeEach(() => {
      spyOn(installer, '_printWarning');
    });

    it('should not print a warning if there is no _local_.json file', () => {
      fs.existsSync.and.returnValue(false);
      installer.checkDependencies();
      expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(projectDir, 'node_modules/_local_.json'));
      expect(installer._printWarning).not.toHaveBeenCalled();
    });

    it('should print a warning if there is a _local_.json file', () => {
      fs.existsSync.and.returnValue(true);
      installer.checkDependencies();
      expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(projectDir, 'node_modules/_local_.json'));
      expect(installer._printWarning).toHaveBeenCalled();
    });
  });

  describe('installLocalDependencies()', () => {
    const copyJsonObj = obj => JSON.parse(JSON.stringify(obj));
    let dummyLocalPackages, dummyPackage, dummyPackageJson, expectedModifiedPackage, expectedModifiedPackageJson;

    beforeEach(() => {
      spyOn(installer, '_checkLocalMarker');
      spyOn(installer, '_installDeps');
      spyOn(installer, '_setLocalMarker');

      spyOn(installer, '_parseLockfile').and.returnValue({
        'rxjs@^6.3.0': {version: '6.3.3'},
        'rxjs-dev@^6.3.0': {version: '6.4.2'}
      });

      // These are the packages that are "found" in the dist directory
      dummyLocalPackages = {
        '@angular/core': {
          packageDir: `${packagesDir}/core`,
          packageJsonPath: `${packagesDir}/core/package.json`,
          config: {
            peerDependencies: {
              'rxjs': '^6.4.0',
              'rxjs-dev': '^6.4.0',
              'some-package': '5.0.1',
              'zone.js': '~0.8.26'
            }
          }
        },
        '@angular/common': {
          packageDir: `${packagesDir}/common`,
          packageJsonPath: `${packagesDir}/common/package.json`,
          config: { peerDependencies: { '@angular/core': '4.4.4-1ab23cd4' } }
        },
        '@angular/compiler': {
          packageDir: `${packagesDir}/compiler`,
          packageJsonPath: `${packagesDir}/compiler/package.json`,
          config: { peerDependencies: { '@angular/common': '4.4.4-1ab23cd4' } }
        },
        '@angular/compiler-cli': {
          packageDir: `${toolsDir}/compiler-cli`,
          packageJsonPath: `${toolsDir}/compiler-cli/package.json`,
          config: {
            dependencies: { '@angular/tsc-wrapped': '4.4.4-1ab23cd4' },
            peerDependencies: { typescript: '^2.4.2', '@angular/compiler': '4.4.4-1ab23cd4' }
          }
        },
        '@angular/tsc-wrapped': {
          packageDir: `${toolsDir}/tsc-wrapped`,
          packageJsonPath: `${toolsDir}/tsc-wrapped/package.json`,
          config: {
            devDependencies: { '@angular/common': '4.4.4-1ab23cd4' },
            peerDependencies: { tsickle: '^1.4.0' }
          }
        },
        'zone.js': {
          packageDir: `${zoneJsDir}/zone.js`,
          packageJsonPath: `${zoneJsDir}/zone.js/package.json`,
          config: {
            devDependencies: { typescript: '^2.4.2' }
          }
        },
      };
      spyOn(installer, '_getDistPackages').and.callFake(() => copyJsonObj(dummyLocalPackages));

      // This is the package.json in the "test" folder
      dummyPackage = {
        dependencies: {
          '@angular/core': '4.4.1',
          '@angular/common': '4.4.1',
          rxjs: '^6.3.0',
          'zone.js': '^0.8.26'
        },
        devDependencies: {
          '@angular/compiler-cli': '4.4.1',
          'rxjs-dev': '^6.3.0'
        }
      };
      dummyPackageJson = JSON.stringify(dummyPackage);
      fs.readFileSync.and.returnValue(dummyPackageJson);

      // This is the package.json that is temporarily written to the "test" folder
      // Note that the Angular/Zone.js (dev)dependencies have been modified to use a "file:" path
      // and that the peerDependencies from `dummyLocalPackages` have been updated or added as
      // (dev)dependencies (unless the current version in lockfile satisfies semver).
      //
      // For example, `rxjs-dev@6.4.2` (from lockfile) satisfies `rxjs-dev@^6.4.0` (from
      // `@angular/core`), thus `rxjs-dev: ^6.3.0` (from original `package.json`) is retained.
      // In contrast, `rxjs@6.3.3` (from lockfile) does not satisfy `rxjs@^6.4.0 (from
      // `@angular/core`), thus `rxjs: ^6.3.0` (from original `package.json`) is replaced with
      // `rxjs: ^6.4.0` (from `@angular/core`).
      expectedModifiedPackage = {
        dependencies: {
          '@angular/core': `file:${packagesDir}/core`,
          '@angular/common': `file:${packagesDir}/common`,
          'rxjs': '^6.4.0',
          'zone.js': `file:${zoneJsDir}/zone.js`,
        },
        devDependencies: {
          '@angular/compiler-cli': `file:${toolsDir}/compiler-cli`,
          'rxjs-dev': '^6.3.0',
          'some-package': '5.0.1',
          typescript: '^2.4.2'
        },
        __angular: { local: true }
      };
      expectedModifiedPackageJson = JSON.stringify(expectedModifiedPackage, null, 2);
    });

    describe('when there is a local package marker', () => {
      beforeEach(() => installer._checkLocalMarker.and.returnValue(true));

      it('should not continue processing', () => {
        installer.installLocalDependencies();
        expect(installer._checkLocalMarker).toHaveBeenCalled();
        expect(installer._getDistPackages).not.toHaveBeenCalled();
      });

      it('should continue processing (without checking for local marker) if `force` is true', () => {
        installer.force = true;
        installer.installLocalDependencies();
        expect(installer._checkLocalMarker).not.toHaveBeenCalled();
        expect(installer._getDistPackages).toHaveBeenCalled();
      });
    });

    describe('when there is no local package marker', () => {
      let log;

      beforeEach(() => {
        log = [];
        fs.writeFileSync.and.callFake((filePath, contents) => filePath === packageJsonPath && log.push(`writeFile: ${contents}`));
        installer._installDeps.and.callFake((...args) => log.push(`installDeps: ${args.join(' ')}`));
        installer._checkLocalMarker.and.returnValue(false);
        installer.installLocalDependencies();
      });

      it('should parse the lockfile and get the dist packages', () => {
        expect(installer._checkLocalMarker).toHaveBeenCalled();
        expect(installer._parseLockfile).toHaveBeenCalledWith(yarnLockPath);
        expect(installer._getDistPackages).toHaveBeenCalled();
      });

      it('should temporarily overwrite the package.json files of local Angular packages', () => {
        const pkgJsonPathFor = pkgName => dummyLocalPackages[pkgName].packageJsonPath;
        const pkgConfigFor = pkgName => copyJsonObj(dummyLocalPackages[pkgName].config);
        const overwriteConfigFor = (pkgName, newProps) => Object.assign(pkgConfigFor(pkgName), newProps);
        const stringifyConfig = config => JSON.stringify(config, null, 2);

        const allArgs = fs.writeFileSync.calls.allArgs();
        const firstSixArgs = allArgs.slice(0, 6);
        const lastSixArgs = allArgs.slice(-6);

        expect(firstSixArgs).toEqual([
          [
            pkgJsonPathFor('@angular/core'),
            stringifyConfig(overwriteConfigFor('@angular/core', {private: true})),
          ],
          [
            pkgJsonPathFor('@angular/common'),
            stringifyConfig(overwriteConfigFor('@angular/common', {private: true})),
          ],
          [
            pkgJsonPathFor('@angular/compiler'),
            stringifyConfig(overwriteConfigFor('@angular/compiler', {private: true})),
          ],
          [
            pkgJsonPathFor('@angular/compiler-cli'),
            stringifyConfig(overwriteConfigFor('@angular/compiler-cli', {
              private: true,
              dependencies: { '@angular/tsc-wrapped': `file:${toolsDir}/tsc-wrapped` },
            })),
          ],
          [
            pkgJsonPathFor('@angular/tsc-wrapped'),
            stringifyConfig(overwriteConfigFor('@angular/tsc-wrapped', {
              private: true,
              devDependencies: { '@angular/common': `file:${packagesDir}/common` },
            })),
          ],
          [
            pkgJsonPathFor('zone.js'),
            stringifyConfig(overwriteConfigFor('zone.js', {private: true})),
          ],
        ]);

        expect(lastSixArgs).toEqual([
          '@angular/core',
          '@angular/common',
          '@angular/compiler',
          '@angular/compiler-cli',
          '@angular/tsc-wrapped',
          'zone.js',
        ].map(pkgName => [pkgJsonPathFor(pkgName), stringifyConfig(pkgConfigFor(pkgName))]));
      });

      it('should load the package.json', () => {
        expect(fs.readFileSync).toHaveBeenCalledWith(packageJsonPath, 'utf8');
      });

      it('should overwrite package.json with modified config', () => {
        expect(fs.writeFileSync).toHaveBeenCalledWith(packageJsonPath, expectedModifiedPackageJson);
      });

      it('should restore original package.json', () => {
        expect(fs.writeFileSync).toHaveBeenCalledWith(packageJsonPath, dummyPackageJson);
      });

      it('should overwrite package.json, then install deps, then restore original package.json', () => {
        expect(log).toEqual([
          `writeFile: ${expectedModifiedPackageJson}`,
          `installDeps: --pure-lockfile --check-files`,
          `writeFile: ${dummyPackageJson}`
        ]);
      });

      it('should set the local marker file with the contents of the modified package.json', () => {
        expect(installer._setLocalMarker).toHaveBeenCalledWith(expectedModifiedPackageJson);
      });
    });
  });

  describe('restoreNpmDependencies()', () => {
    it('should run `yarn install` in the specified directory, with the correct options', () => {
      spyOn(installer, '_installDeps');
      installer.restoreNpmDependencies();
      expect(installer._installDeps).toHaveBeenCalledWith('--frozen-lockfile', '--check-files');
    });
  });

  describe('_buildDistPackages()', () => {
    // Call `_buildDistPackages()` with a mock `process.platform` value.
    const buildDistPackagesOnPlatform = platform => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(process, 'platform');
      Object.defineProperty(process, 'platform', {...originalDescriptor, value: platform});
      installer._buildDistPackages();
      Object.defineProperty(process, 'platform', originalDescriptor);
    };

    it('should build the local packages, when not on Windows', () => {
      const buildScript = path.join(ngRootDir, 'scripts/build/build-packages-dist.js');
      const buildCmd = `"${process.execPath}" "${buildScript}"`;

      buildDistPackagesOnPlatform('linux');
      expect(shelljs.exec).toHaveBeenCalledWith(buildCmd);

      shelljs.exec.calls.reset();

      buildDistPackagesOnPlatform('darwin');
      expect(shelljs.exec).toHaveBeenCalledWith(buildCmd);

      shelljs.exec.calls.reset();

      buildDistPackagesOnPlatform('anythingButWindows :(');
      expect(shelljs.exec).toHaveBeenCalledWith(buildCmd);

      // Ensure that the script does actually exist (e.g. it was not renamed/moved).
      fs.existsSync.and.callThrough();
      expect(fs.existsSync(buildScript)).toBe(true);
    });

    it('should print a warning, when on Windows', () => {
      buildDistPackagesOnPlatform('win32');
      const warning = console.warn.calls.argsFor(0)[0];

      expect(shelljs.exec).not.toHaveBeenCalled();
      expect(warning).toContain(
          'Automatically building the local Angular/Zone.js packages is currently not supported on Windows.');
      expect(warning).toContain('Git Bash for Windows');
      expect(warning).toContain('Windows Subsystem for Linux');
      expect(warning).toContain('Linux docker container or VM');
    });
  });

  describe('_getDistPackages()', () => {
    beforeEach(() => {
      fs.existsSync.and.callThrough();
      spyOn(NgPackagesInstaller.prototype, '_buildDistPackages');
    });

    it('should not build the local packages by default', () => {
      installer._getDistPackages();
      expect(installer._buildDistPackages).not.toHaveBeenCalled();
    });

    it('should build the local packages, if `buildPackages` is true', () => {
      installer = new NgPackagesInstaller(projectDir, {buildPackages: true});
      installer._getDistPackages();
      expect(installer._buildDistPackages).toHaveBeenCalledTimes(1);
    });

    it('should not build the local packages by default', () => {
      installer._getDistPackages();
      expect(installer._buildDistPackages).not.toHaveBeenCalled();
    });

    it('should include top level Angular and Zone.js packages', () => {
      const localPackages = installer._getDistPackages();
      const expectedValue = jasmine.objectContaining({
        packageDir: jasmine.any(String),
        packageJsonPath: jasmine.any(String),
        config: jasmine.any(Object),
      });

      // For example...
      expect(localPackages['@angular/common']).toEqual(expectedValue);
      expect(localPackages['@angular/core']).toEqual(expectedValue);
      expect(localPackages['@angular/router']).toEqual(expectedValue);
      expect(localPackages['@angular/upgrade']).toEqual(expectedValue);
      expect(localPackages['zone.js']).toEqual(expectedValue);

      expect(localPackages['@angular/upgrade/static']).not.toBeDefined();
    });

    it('should store each package\'s directory', () => {
      const localPackages = installer._getDistPackages();

      // For example...
      expect(localPackages['@angular/core'].packageDir).toBe(path.join(packagesDir, 'core'));
      expect(localPackages['@angular/router'].packageDir).toBe(path.join(packagesDir, 'router'));
      expect(localPackages['zone.js'].packageDir).toBe(path.join(zoneJsDir, 'zone.js'));
    });

    it('should not include packages that have been ignored', () => {
      installer = new NgPackagesInstaller(projectDir, { ignorePackages: ['@angular/router'] });
      const localPackages = installer._getDistPackages();

      expect(localPackages['@angular/common']).toBeDefined();
      expect(localPackages['@angular/router']).toBeUndefined();
    });
  });

  describe('_log()', () => {
    beforeEach(() => {
      spyOn(console, 'info');
    });

    it('should assign the debug property from the options', () => {
      installer = new NgPackagesInstaller(projectDir, { debug: true });
      expect(installer.debug).toBe(true);
      installer = new NgPackagesInstaller(projectDir, { });
      expect(installer.debug).toBe(undefined);
    });

    it('should log a message to the console if the `debug` property is true', () => {
      installer._log('foo');
      expect(console.info).not.toHaveBeenCalled();

      installer.debug = true;
      installer._log('bar');
      expect(console.info).toHaveBeenCalledWith('  [NgPackagesInstaller]: bar');
    });
  });

  describe('_overwritePackageVersion()', () => {
    it('should do nothing if the specified package is not a dependency', () => {
      const pkgConfig = {name: '@scope/missing', version: 'local-version'};
      const lockFile = {
        [`${pkgConfig.name}@project-range`]: {version: 'project-version'},
      };
      let projectConfig;

      // No `dependencies`/`devDependencies` at all.
      projectConfig = {};
      installer._overwritePackageVersion(pkgConfig.name, pkgConfig, projectConfig, lockFile);
      expect(pkgConfig.version).toBe('local-version');

      // Not listed in `dependencies`/`devDependencies`.
      projectConfig = {
        dependencies: {otherPackage: 'foo'},
        devDependencies: {yetAnotherPackage: 'bar'},
      };
      installer._overwritePackageVersion(pkgConfig.name, pkgConfig, projectConfig, lockFile);
      expect(pkgConfig.version).toBe('local-version');
    });

    it('should do nothing if the specified package cannot be found in the lockfile', () => {
      const pkgConfig = {name: '@scope/missing', version: 'local-version'};
      const projectConfig = {
        dependencies: {[pkgConfig.name]: 'project-range'},
      };
      let lockFile;

      // Package missing from lockfile.
      lockFile = {
        'otherPackage@someRange': {version: 'some-version'},
      };
      installer._overwritePackageVersion(pkgConfig.name, pkgConfig, projectConfig, lockFile);
      expect(pkgConfig.version).toBe('local-version');

      // Package present in lockfile, but for a different version range.
      lockFile = {
        [`${pkgConfig.name}@other-range`]: {version: 'project-version'},
      };
      installer._overwritePackageVersion(pkgConfig.name, pkgConfig, projectConfig, lockFile);
      expect(pkgConfig.version).toBe('local-version');
    });

    it('should overwrite the package version if it is a dependency and found in the lockfile', () => {
      const pkgConfig = {name: '@scope/found', version: 'local-version'};
      const lockFile = {
        [`${pkgConfig.name}@project-range-prod`]: {version: 'project-version-prod'},
        [`${pkgConfig.name}@project-range-dev`]: {version: 'project-version-dev'},
      };
      let projectConfig;

      // Package in `dependencies`.
      projectConfig = {
        dependencies: {[pkgConfig.name]: 'project-range-prod'},
      };
      installer._overwritePackageVersion(pkgConfig.name, pkgConfig, projectConfig, lockFile);
      expect(pkgConfig.version).toBe('project-version-prod+locally-overwritten-by-ngPackagesInstaller');

      // // Package in `devDependencies`.
      projectConfig = {
        devDependencies: {[pkgConfig.name]: 'project-range-dev'},
      };
      installer._overwritePackageVersion(pkgConfig.name, pkgConfig, projectConfig, lockFile);
      expect(pkgConfig.version).toBe('project-version-dev+locally-overwritten-by-ngPackagesInstaller');

      // // Package in both `dependencies` and `devDependencies` (the former takes precedence).
      projectConfig = {
        devDependencies: {[pkgConfig.name]: 'project-range-dev'},
        dependencies: {[pkgConfig.name]: 'project-range-prod'},
      };
      installer._overwritePackageVersion(pkgConfig.name, pkgConfig, projectConfig, lockFile);
      expect(pkgConfig.version).toBe('project-version-prod+locally-overwritten-by-ngPackagesInstaller');
    });
  });

  describe('_parseLockfile()', () => {
    let originalLockfileParseDescriptor;

    beforeEach(() => {
      // Workaround for `lockfile.parse()` being non-writable.
      let parse = lockfile.parse;
      originalLockfileParseDescriptor = Object.getOwnPropertyDescriptor(lockfile, 'parse');
      Object.defineProperty(lockfile, 'parse', {
        get() { return parse; },
        set(newParse) { parse = newParse; },
      });

      fs.readFileSync.and.returnValue('mock content');
      spyOn(lockfile, 'parse').and.returnValue({type: 'success', object: {foo: {version: 'bar'}}});
    });

    afterEach(() => Object.defineProperty(lockfile, 'parse', originalLockfileParseDescriptor));

    it('should parse the specified lockfile', () => {
      installer._parseLockfile('/foo/bar/yarn.lock');
      expect(fs.readFileSync).toHaveBeenCalledWith('/foo/bar/yarn.lock', 'utf8');
      expect(lockfile.parse).toHaveBeenCalledWith('mock content');
    });

    it('should throw if parsing the lockfile fails', () => {
      lockfile.parse.and.returnValue({type: 'not success'});
      expect(() => installer._parseLockfile('/foo/bar/yarn.lock')).toThrowError(
          '[NgPackagesInstaller]: Error parsing lockfile \'/foo/bar/yarn.lock\' (result type: not success).');
    });

    it('should return the parsed lockfile content as an object', () => {
      const parsed = installer._parseLockfile('/foo/bar/yarn.lock');
      expect(parsed).toEqual({foo: {version: 'bar'}});
    });
  });

  describe('_printWarning()', () => {
    it('should mention the message passed in the warning', () => {
      installer._printWarning();
      expect(console.warn.calls.argsFor(0)[0]).toContain('is running against the local Angular/Zone.js build');
    });

    it('should mention the command to restore the Angular packages in any warning', () => {
      // When run for the current working directory...
      const dir1 = '.';
      const restoreCmdRe1 = RegExp('\\bnode .*?ng-packages-installer/index restore ' + path.resolve(dir1));
      installer = new NgPackagesInstaller(dir1);
      installer._printWarning('');
      expect(console.warn.calls.argsFor(0)[0]).toMatch(restoreCmdRe1);

      // When run for a different directory...
      const dir2 = projectDir;
      const restoreCmdRe2 = RegExp(`\\bnode .*?ng-packages-installer/index restore .*?${path.resolve(dir1)}\\b`);
      installer = new NgPackagesInstaller(dir2);
      installer._printWarning('');
      expect(console.warn.calls.argsFor(1)[0]).toMatch(restoreCmdRe2);
    });
  });

  describe('_installDeps()', () => {
    it('should run yarn install with the given options', () => {
      installer._installDeps('option-1', 'option-2');
      expect(shelljs.exec).toHaveBeenCalledWith('yarn install option-1 option-2', { cwd: absoluteProjectDir });
    });
  });

  describe('local marker helpers', () => {
    let installer;
    beforeEach(() => {
      installer = new NgPackagesInstaller(projectDir);
    });

    describe('_checkLocalMarker', () => {
      it ('should return true if the local marker file exists', () => {
        fs.existsSync.and.returnValue(true);
        expect(installer._checkLocalMarker()).toEqual(true);
        expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(nodeModulesDir, '_local_.json'));
        fs.existsSync.calls.reset();

        fs.existsSync.and.returnValue(false);
        expect(installer._checkLocalMarker()).toEqual(false);
        expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(nodeModulesDir, '_local_.json'));
      });
    });

    describe('_setLocalMarker', () => {
      it('should create a local marker file', () => {
        installer._setLocalMarker('test contents');
        expect(fs.writeFileSync).toHaveBeenCalledWith(path.resolve(nodeModulesDir, '_local_.json'), 'test contents');
      });
    });
  });
});
