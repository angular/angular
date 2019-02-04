'use strict';

const fs = require('fs-extra');
const lockfile = require('@yarnpkg/lockfile');
const path = require('canonical-path');
const shelljs = require('shelljs');

const NgPackagesInstaller = require('./index');

describe('NgPackagesInstaller', () => {
  const rootDir = 'root/dir';
  const absoluteRootDir = path.resolve(rootDir);
  const nodeModulesDir = path.resolve(absoluteRootDir, 'node_modules');
  const packageJsonPath = path.resolve(absoluteRootDir, 'package.json');
  const yarnLockPath = path.resolve(absoluteRootDir, 'yarn.lock');
  const packagesDir = path.resolve(path.resolve(__dirname, '../../../dist/packages-dist'));
  const toolsDir = path.resolve(path.resolve(__dirname, '../../../dist/tools/@angular'));
  let installer;

  beforeEach(() => {
    spyOn(fs, 'existsSync');
    spyOn(fs, 'readFileSync');
    spyOn(fs, 'writeFileSync');
    spyOn(shelljs, 'exec');
    spyOn(shelljs, 'rm');
    spyOn(console, 'log');
    spyOn(console, 'warn');
    installer = new NgPackagesInstaller(rootDir);
  });

  describe('checkDependencies()', () => {
    beforeEach(() => {
      spyOn(installer, '_printWarning');
    });

    it('should not print a warning if there is no _local_.json file', () => {
      fs.existsSync.and.returnValue(false);
      installer.checkDependencies();
      expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(rootDir, 'node_modules/_local_.json'));
      expect(installer._printWarning).not.toHaveBeenCalled();
    });

    it('should print a warning if there is a _local_.json file', () => {
      fs.existsSync.and.returnValue(true);
      installer.checkDependencies();
      expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(rootDir, 'node_modules/_local_.json'));
      expect(installer._printWarning).toHaveBeenCalled();
    });
  });

  describe('installLocalDependencies()', () => {
    const copyJsonObj = obj => JSON.parse(JSON.stringify(obj));
    let dummyNgPackages, dummyPackage, dummyPackageJson, expectedModifiedPackage, expectedModifiedPackageJson;

    beforeEach(() => {
      spyOn(installer, '_checkLocalMarker');
      spyOn(installer, '_installDeps');
      spyOn(installer, '_setLocalMarker');

      spyOn(installer, '_parseLockfile').and.returnValue({
        'rxjs@^6.3.0': {version: '6.3.3'},
        'zone.js@^0.8.26': {version: '0.8.27'}
      });

      // These are the packages that are "found" in the dist directory
      dummyNgPackages = {
        '@angular/core': {
          parentDir: packagesDir,
          packageJsonPath: `${packagesDir}/core/package.json`,
          config: {
            peerDependencies: {
              'rxjs': '^6.4.0',
              'some-package': '5.0.1',
              'zone.js': '~0.8.26'
            }
          }
        },
        '@angular/common': {
          parentDir: packagesDir,
          packageJsonPath: `${packagesDir}/common/package.json`,
          config: { peerDependencies: { '@angular/core': '4.4.4-1ab23cd4' } }
        },
        '@angular/compiler': {
          parentDir: packagesDir,
          packageJsonPath: `${packagesDir}/compiler/package.json`,
          config: { peerDependencies: { '@angular/common': '4.4.4-1ab23cd4' } }
        },
        '@angular/compiler-cli': {
          parentDir: toolsDir,
          packageJsonPath: `${toolsDir}/compiler-cli/package.json`,
          config: {
            dependencies: { '@angular/tsc-wrapped': '4.4.4-1ab23cd4' },
            peerDependencies: { typescript: '^2.4.2', '@angular/compiler': '4.4.4-1ab23cd4' }
          }
        },
        '@angular/tsc-wrapped': {
          parentDir: toolsDir,
          packageJsonPath: `${toolsDir}/tsc-wrapped/package.json`,
          config: {
            devDependencies: { '@angular/common': '4.4.4-1ab23cd4' },
            peerDependencies: { tsickle: '^1.4.0' }
          }
        }
      };
      spyOn(installer, '_getDistPackages').and.callFake(() => copyJsonObj(dummyNgPackages));

      // This is the package.json in the "test" folder
      dummyPackage = {
        dependencies: {
          '@angular/core': '4.4.1',
          '@angular/common': '4.4.1',
          rxjs: '^6.3.0'
        },
        devDependencies: {
          '@angular/compiler-cli': '4.4.1',
          'zone.js': '^0.8.26'
        }
      };
      dummyPackageJson = JSON.stringify(dummyPackage);
      fs.readFileSync.and.returnValue(dummyPackageJson);

      // This is the package.json that is temporarily written to the "test" folder
      // Note that the Angular (dev)dependencies have been modified to use a "file:" path
      // And that the peerDependencies from `dummyNgPackages` have been updated or added as
      // (dev)dependencies (unless the current version in lockfile satisfies semver).
      //
      // For example, `zone.js@0.8.27` (from lockfile) satisfies `zone.js@~0.8.26` (from
      // `@angular/core`), thus `zone.js: ^0.8.26` (from original `package.json`) is retained.
      // In contrast, `rxjs@6.3.3` (from lockfile) does not satisfy `rxjs@^6.4.0 (from
      // `@angular/core`), thus `rxjs: ^6.3.0` (from original `package.json`) is replaced with
      // `rxjs: ^6.4.0` (from `@angular/core`).
      expectedModifiedPackage = {
        dependencies: {
          '@angular/core': `file:${packagesDir}/core`,
          '@angular/common': `file:${packagesDir}/common`,
          'rxjs': '^6.4.0'
        },
        devDependencies: {
          '@angular/compiler-cli': `file:${toolsDir}/compiler-cli`,
          'zone.js': '^0.8.26',
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
        const pkgJsonFor = pkgName => dummyNgPackages[`@angular/${pkgName}`].packageJsonPath;
        const pkgConfigFor = pkgName => copyJsonObj(dummyNgPackages[`@angular/${pkgName}`].config);
        const overwriteConfigFor = (pkgName, newProps) => Object.assign(pkgConfigFor(pkgName), newProps);
        const stringifyConfig = config => JSON.stringify(config, null, 2);

        const allArgs = fs.writeFileSync.calls.allArgs();
        const firstFiveArgs = allArgs.slice(0, 5);
        const lastFiveArgs = allArgs.slice(-5);

        expect(firstFiveArgs).toEqual([
          [pkgJsonFor('core'), stringifyConfig(overwriteConfigFor('core', {private: true}))],
          [pkgJsonFor('common'), stringifyConfig(overwriteConfigFor('common', {private: true}))],
          [pkgJsonFor('compiler'), stringifyConfig(overwriteConfigFor('compiler', {private: true}))],
          [pkgJsonFor('compiler-cli'), stringifyConfig(overwriteConfigFor('compiler-cli', {
            private: true,
            dependencies: { '@angular/tsc-wrapped': `file:${toolsDir}/tsc-wrapped` }
          }))],
          [pkgJsonFor('tsc-wrapped'), stringifyConfig(overwriteConfigFor('tsc-wrapped', {
            private: true,
            devDependencies: { '@angular/common': `file:${packagesDir}/common` }
          }))],
        ]);

        expect(lastFiveArgs).toEqual(['core', 'common', 'compiler', 'compiler-cli', 'tsc-wrapped']
            .map(pkgName => [pkgJsonFor(pkgName), stringifyConfig(pkgConfigFor(pkgName))]));
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

  describe('_getDistPackages()', () => {
    it('should include top level Angular packages', () => {
      const ngPackages = installer._getDistPackages();
      const expectedValue = jasmine.objectContaining({
        parentDir: jasmine.any(String),
        packageJsonPath: jasmine.any(String),
        config: jasmine.any(Object),
      });

      // For example...
      expect(ngPackages['@angular/common']).toEqual(expectedValue);
      expect(ngPackages['@angular/core']).toEqual(expectedValue);
      expect(ngPackages['@angular/router']).toEqual(expectedValue);
      expect(ngPackages['@angular/upgrade']).toEqual(expectedValue);

      expect(ngPackages['@angular/upgrade/static']).not.toBeDefined();
    });

    it('should store each package\'s parent directory', () => {
      const ngPackages = installer._getDistPackages();

      // For example...
      expect(ngPackages['@angular/core'].parentDir).toBe(packagesDir);
      expect(ngPackages['@angular/router'].parentDir).toBeDefined(toolsDir);
    });

    it('should not include packages that have been ignored', () => {
      installer = new NgPackagesInstaller(rootDir, { ignorePackages: ['@angular/router'] });
      const ngPackages = installer._getDistPackages();

      expect(ngPackages['@angular/common']).toBeDefined();
      expect(ngPackages['@angular/router']).toBeUndefined();
    });
  });

  describe('_log()', () => {
    beforeEach(() => {
      spyOn(console, 'info');
    });

    it('should assign the debug property from the options', () => {
      installer = new NgPackagesInstaller(rootDir, { debug: true });
      expect(installer.debug).toBe(true);
      installer = new NgPackagesInstaller(rootDir, { });
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
      expect(console.warn.calls.argsFor(0)[0]).toContain('is running against the local Angular build');
    });

    it('should mention the command to restore the Angular packages in any warning', () => {
      // When run for the current working directory...
      const dir1 = '.';
      const restoreCmdRe1 = RegExp('\\bnode .*?ng-packages-installer/index restore ' + path.resolve(dir1));
      installer = new NgPackagesInstaller(dir1);
      installer._printWarning('');
      expect(console.warn.calls.argsFor(0)[0]).toMatch(restoreCmdRe1);

      // When run for a different directory...
      const dir2 = rootDir;
      const restoreCmdRe2 = RegExp(`\\bnode .*?ng-packages-installer/index restore .*?${path.resolve(dir1)}\\b`);
      installer = new NgPackagesInstaller(dir2);
      installer._printWarning('');
      expect(console.warn.calls.argsFor(1)[0]).toMatch(restoreCmdRe2);
    });
  });

  describe('_installDeps()', () => {
    it('should run yarn install with the given options', () => {
      installer._installDeps('option-1', 'option-2');
      expect(shelljs.exec).toHaveBeenCalledWith('yarn install option-1 option-2', { cwd: absoluteRootDir });
    });
  });

  describe('local marker helpers', () => {
    let installer;
    beforeEach(() => {
      installer = new NgPackagesInstaller(rootDir);
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
