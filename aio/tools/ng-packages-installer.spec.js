'use strict';

const fs = require('fs-extra');
const path = require('canonical-path');
const shelljs = require('shelljs');

const installer = require('./ng-packages-installer');

describe('NgPackagesInstaller', () => {
  const ngPackages = installer.ngPackages;
  const rootDir = 'root/dir';
  const absoluteRootDir = path.resolve(rootDir);
  const nodeModulesDir = `${absoluteRootDir}/node_modules`;

  beforeEach(() => {
    spyOn(fs, 'copySync');
    spyOn(fs, 'existsSync');
    spyOn(fs, 'writeFileSync');
    spyOn(shelljs, 'exec');
    spyOn(shelljs, 'rm');
  });

  // Properties

  describe('.ngPackages', () => {
    it('should include all package names', () => {
      // For example...
      expect(installer.ngPackages).toContain('common');
      expect(installer.ngPackages).toContain('core');
      expect(installer.ngPackages).toContain('router');
      expect(installer.ngPackages).toContain('upgrade');

      expect(installer.ngPackages).not.toContain('static');
      expect(installer.ngPackages).not.toContain('upgrade/static');
    });

    it('should correspond to package directories with top-level \'package.json\' files', () => {
      fs.existsSync.and.callThrough();

      const packagesDir = path.resolve(__dirname, '../../packages');

      installer.ngPackages.forEach(packageName => {
        const packageJson = `${packagesDir}/${packageName}/package.json`;
        expect(fs.existsSync(packageJson)).toBe(true);
      });
    });
  });

  // Methods

  describe('checkPackages()', () => {
    beforeEach(() => {
      spyOn(console, 'warn');
      spyOn(installer, '_findLocalPackages');
    });

    it('should check whether there are any local Angular packages in the target directory', () => {
      installer._findLocalPackages.and.returnValue([]);

      installer.checkPackages(rootDir);
      expect(installer._findLocalPackages).toHaveBeenCalledWith(absoluteRootDir);
    });

    it('should not print a warning if all Angular packages come from npm', () => {
      installer._findLocalPackages.and.returnValue([]);

      installer.checkPackages(rootDir);
      expect(console.warn).not.toHaveBeenCalled();
    });

    describe('when there are local Angular packages', () => {
      beforeEach(() => {
        installer._findLocalPackages.and.returnValue(['common', 'router']);
      });

      it('should print a warning', () => {
        installer.checkPackages(rootDir);

        expect(console.warn).toHaveBeenCalled();
        expect(console.warn.calls.mostRecent().args[0]).toContain('WARNING');
      });

      it('should list the local (i.e. overwritten) packages', () => {
        installer.checkPackages(rootDir);

        const warning = console.warn.calls.mostRecent().args[0];
        expect(warning).toContain('@angular/common');
        expect(warning).toContain('@angular/router');
        expect(warning).not.toContain('@angular/core');
        expect(warning).not.toContain('@angular/upgrade');
      });

      it('should mention the command to restore the Angular packages', () => {
        // When run for the current working directory...
        const dir1 = '.';
        const restoreCmdRe1 = RegExp('\\bnode .*?ng-packages-installer restore \\.');

        installer.checkPackages(dir1);

        expect(console.warn.calls.argsFor(0)[0]).toMatch(restoreCmdRe1);

        // When run for a different directory...
        const dir2 = rootDir;
        const restoreCmdRe2 = RegExp(`\\bnode .*?ng-packages-installer restore .*?${path.normalize(rootDir)}\\b`);

        installer.checkPackages(dir2);

        expect(console.warn.calls.argsFor(1)[0]).toMatch(restoreCmdRe2);
      });
    });
  });

  describe('overwritePackages()', () => {
    beforeEach(() => {
      spyOn(installer, '_overwritePackage');
    });

    it('should override the Angular packages in the target directory with the locally built ones', () => {
      installer.overwritePackages(rootDir);
      expect(installer._overwritePackage).toHaveBeenCalledTimes(ngPackages.length);

      ngPackages.forEach(packageName =>
        expect(installer._overwritePackage).toHaveBeenCalledWith(packageName, nodeModulesDir));
    });
  });

  describe('restorePackages()', () => {
    beforeEach(() => {
      spyOn(installer, '_findLocalPackages');
      spyOn(installer, '_reinstallOverwrittenNodeModules');
    });

    it('should check whether there are any local Angular packages in the target directory first', () => {
      installer._findLocalPackages.and.callFake(() => {
        expect(installer._reinstallOverwrittenNodeModules).not.toHaveBeenCalled();
        return [];
      });

      installer.restorePackages(rootDir);
      expect(installer._findLocalPackages).toHaveBeenCalledWith(absoluteRootDir);
    });

    it('should re-install dependencies from npm afterwards (if necessary)', () => {
      // No local packages.
      installer._findLocalPackages.and.returnValue([]);

      installer.restorePackages(rootDir);
      expect(installer._reinstallOverwrittenNodeModules).not.toHaveBeenCalled();

      // All local packages.
      installer._reinstallOverwrittenNodeModules.calls.reset();
      installer._findLocalPackages.and.returnValue(ngPackages);

      installer.restorePackages(rootDir);
      expect(installer._reinstallOverwrittenNodeModules).toHaveBeenCalledWith(absoluteRootDir);

      // Some local packages.
      installer._reinstallOverwrittenNodeModules.calls.reset();
      installer._findLocalPackages.and.returnValue(['common', 'core', 'router', 'upgrade']);

      installer.restorePackages(rootDir);
      expect(installer._reinstallOverwrittenNodeModules).toHaveBeenCalledWith(absoluteRootDir);
    });
  });

  describe('_findLocalPackages()', () => {
    beforeEach(() => {
      spyOn(installer, '_isLocalPackage');
    });

    it('should check all Angular packages', () => {
      installer._findLocalPackages(absoluteRootDir);

      ngPackages.forEach(packageName =>
        expect(installer._isLocalPackage).toHaveBeenCalledWith(packageName, nodeModulesDir));
    });

    it('should return an empty list if all Angular packages come from npm', () => {
      installer._isLocalPackage.and.returnValue(false);
      expect(installer._findLocalPackages(rootDir)).toEqual([]);
    });

    it('should return a list of all local (i.e. overwritten) Angular packages', () => {
      const localPackages = ['common', 'core', 'router', 'upgrade'];

      installer._isLocalPackage.and.callFake(packageName => localPackages.includes(packageName));

      expect(installer._findLocalPackages(rootDir)).toEqual(localPackages);
    });
  });

  describe('_isLocalPackage()', () => {
    it('should check whether the specified package is local/overwritten', () => {
      const targetPackageDir = `${rootDir}/@angular/somePackage`;
      const localFlagFile = `${targetPackageDir}/.ng-local`;

      installer._isLocalPackage('somePackage', rootDir);
      expect(fs.existsSync).toHaveBeenCalledWith(localFlagFile);
    });

    it('should return whether the specified package was local', () => {
      fs.existsSync.and.returnValues(true, false);

      expect(installer._isLocalPackage('somePackage', rootDir)).toBe(true);
      expect(installer._isLocalPackage('somePackage', rootDir)).toBe(false);
    });
  });

  describe('_log()', () => {
    beforeEach(() => {
      spyOn(console, 'info');
    });

    afterEach(() => {
      installer.debug = false;
    });

    it('should log a message to the console if the `debug` property is true', () => {
      installer._log('foo');
      expect(console.info).not.toHaveBeenCalled();

      installer.debug = true;
      installer._log('bar');
      expect(console.info).toHaveBeenCalledWith('  [NgPackagesInstaller]: bar');
    });
  });

  describe('_overwritePackage()', () => {
    beforeEach(() => {
      fs.existsSync.and.returnValue(true);
    });

    it('should check whether the Angular package is installed', () => {
      const targetPackageDir = `${rootDir}/@angular/somePackage`;

      installer._overwritePackage('somePackage', rootDir);
      expect(fs.existsSync).toHaveBeenCalledWith(targetPackageDir);
    });

    it('should remove the original package from the target directory', () => {
      const targetPackageDir = `${rootDir}/@angular/somePackage`;

      shelljs.rm.and.callFake(() => expect(fs.existsSync).toHaveBeenCalled());

      installer._overwritePackage('somePackage', rootDir);
      expect(shelljs.rm).toHaveBeenCalledWith('-rf', targetPackageDir);
    });

    it('should copy the source package directory to the target directory', () => {
      const sourcePackageDir = path.resolve(__dirname, '../../dist/packages-dist/somePackage');
      const targetPackageDir = `${rootDir}/@angular/somePackage`;

      fs.copySync.and.callFake(() => expect(shelljs.rm).toHaveBeenCalled());

      installer._overwritePackage('somePackage', rootDir);
      expect(fs.copySync).toHaveBeenCalledWith(sourcePackageDir, targetPackageDir);
    });

    it('should add an empty `.ng-local` file to the target directory', () => {
      const targetPackageDir = `${rootDir}/@angular/somePackage`;
      const localFlagFile = `${targetPackageDir}/.ng-local`;

      fs.writeFileSync.and.callFake(() => expect(fs.copySync).toHaveBeenCalled());

      installer._overwritePackage('somePackage', rootDir);
      expect(fs.writeFileSync).toHaveBeenCalledWith(localFlagFile, '');
    });

    it('should do nothing if the Angular package is not installed', () => {
      fs.existsSync.and.returnValue(false);

      installer._overwritePackage('somePackage', rootDir);

      expect(shelljs.rm).not.toHaveBeenCalled();
      expect(fs.copySync).not.toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('_reinstallOverwrittenNodeModules()', () => {
    it('should run `yarn install --check-files` in the specified directory', () => {
      installer._reinstallOverwrittenNodeModules(rootDir);
      expect(shelljs.exec).toHaveBeenCalledWith('yarn install --check-files', {cwd: rootDir});
    });
  });
});
