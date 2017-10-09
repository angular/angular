'use strict';

const fs = require('fs-extra');
const path = require('canonical-path');
const shelljs = require('shelljs');

const NgPackagesInstaller = require('./index');

describe('NgPackagesInstaller', () => {
  const rootDir = 'root/dir';
  const absoluteRootDir = path.resolve(rootDir);
  const nodeModulesDir = path.resolve(absoluteRootDir, 'node_modules');
  const packageJsonPath = path.resolve(absoluteRootDir, 'package.json');
  const packagesDir = path.resolve(path.resolve(__dirname, '../../../dist/packages-dist'));
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
    let dummyNgPackages, dummyPackage, dummyPackageJson, expectedModifiedPackage, expectedModifiedPackageJson;

    beforeEach(() => {
      spyOn(installer, '_checkLocalMarker');

      // These are the packages that are "found" in the dist directory
      dummyNgPackages = {
        '@angular/core': { peerDependencies: { rxjs: '5.0.1' } },
        '@angular/common': { peerDependencies: { '@angular/core': '4.4.1' } },
        '@angular/compiler': { },
        '@angular/compiler-cli': { peerDependencies: { typescript: '^2.4.2', '@angular/compiler': '4.3.2' } }
      };
      spyOn(installer, '_getDistPackages').and.returnValue(dummyNgPackages);

      // This is the package.json in the "test" folder
      dummyPackage = {
        dependencies: {
          '@angular/core': '4.4.1',
          '@angular/common': '4.4.1'
        },
        devDependencies: {
          '@angular/compiler-cli': '4.4.1'
        }
      };
      dummyPackageJson = JSON.stringify(dummyPackage);
      fs.readFileSync.and.returnValue(dummyPackageJson);

      // This is the package.json that is temporarily written to the "test" folder
      // Note that the Angular (dev)dependencies have been modified to use a "file:" path
      // And that the peerDependencies from `dummyNgPackages` have been added as (dev)dependencies.
      expectedModifiedPackage = {
        dependencies: {
          '@angular/core': `file:${packagesDir}/core`,
          '@angular/common': `file:${packagesDir}/common`
        },
        devDependencies: {
          '@angular/compiler-cli': `file:${packagesDir}/compiler-cli`,
          rxjs: '5.0.1',
          typescript: '^2.4.2'
        },
        __angular: { local: true }
      };
      expectedModifiedPackageJson = JSON.stringify(expectedModifiedPackage, null, 2);
    });

    describe('when there is a local package marker', () => {
      it('should not continue processing', () => {
        installer._checkLocalMarker.and.returnValue(true);
        installer.installLocalDependencies();
        expect(installer._checkLocalMarker).toHaveBeenCalled();
        expect(installer._getDistPackages).not.toHaveBeenCalled();
      });
    });

    describe('when there is no local package marker', () => {
      let log;

      beforeEach(() => {
        log = [];
        fs.writeFileSync.and.callFake((filePath, contents) => filePath === packageJsonPath && log.push(`writeFile: ${contents}`));
        spyOn(installer, '_installDeps').and.callFake(() => log.push('installDeps:'));
        spyOn(installer, '_setLocalMarker');
        installer._checkLocalMarker.and.returnValue(false);
        installer.installLocalDependencies();
      });

      it('should get the dist packages', () => {
        expect(installer._checkLocalMarker).toHaveBeenCalled();
        expect(installer._getDistPackages).toHaveBeenCalled();
      });

      it('should load the package.json', () => {
        expect(fs.readFileSync).toHaveBeenCalledWith(packageJsonPath);
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
          `installDeps:`,
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
      expect(installer._installDeps).toHaveBeenCalledWith('--freeze-lockfile', '--check-files');
    });
  });

  describe('_getDistPackages', () => {
    it('should include top level Angular packages', () => {
      const ngPackages = installer._getDistPackages();

      // For example...
      expect(ngPackages['@angular/common']).toBeDefined();
      expect(ngPackages['@angular/core']).toBeDefined();
      expect(ngPackages['@angular/router']).toBeDefined();
      expect(ngPackages['@angular/upgrade']).toBeDefined();

      expect(ngPackages['@angular/upgrade/static']).not.toBeDefined();

      it('should not include packages that have been ignored', () => {
        installer = new NgPackagesInstaller(rootDir, { ignorePackages: ['@angular/router'] });
        const ngPackages = installer._getDistPackages();

        expect(ngPackages['@angular/common']).toBeDefined();
        expect(ngPackages['@angular/router']).toBeUndefined();
      });
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

  describe('_printWarning', () => {
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

  describe('_installDeps', () => {
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
