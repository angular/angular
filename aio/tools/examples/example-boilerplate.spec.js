const path = require('canonical-path');
const fs = require('fs-extra');
const glob = require('glob');
const shelljs = require('shelljs');

const ngPackagesInstaller = require('../ng-packages-installer');
const exampleBoilerPlate = require('./example-boilerplate');

describe('example-boilerplate tool', () => {
  describe('add', () => {
    const sharedDir = path.resolve(__dirname, 'shared');
    const sharedNodeModulesDir = path.resolve(sharedDir, 'node_modules');
    const BPFiles = {
      cli: 18,
      systemjs: 7,
      common: 1
    };
    const exampleFolders = ['a/b', 'c/d'];

    beforeEach(() => {
      spyOn(fs, 'ensureSymlinkSync');
      spyOn(exampleBoilerPlate, 'copyFile');
      spyOn(exampleBoilerPlate, 'getFoldersContaining').and.returnValue(exampleFolders);
      spyOn(exampleBoilerPlate, 'installNodeModules');
      spyOn(exampleBoilerPlate, 'loadJsonFile').and.returnValue({});
    });

    it('should install the npm dependencies into `sharedDir` (and pass the `useLocal` argument through)', () => {
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.installNodeModules).toHaveBeenCalledWith(sharedDir, undefined);

      exampleBoilerPlate.installNodeModules.calls.reset();

      exampleBoilerPlate.add(true);
      expect(exampleBoilerPlate.installNodeModules).toHaveBeenCalledWith(sharedDir, true);

      exampleBoilerPlate.installNodeModules.calls.reset();

      exampleBoilerPlate.add(false);
      expect(exampleBoilerPlate.installNodeModules).toHaveBeenCalledWith(sharedDir, false);
    });

    it('should process all the example folders', () => {
      const examplesDir = path.resolve(__dirname, '../../content/examples');
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.getFoldersContaining)
          .toHaveBeenCalledWith(examplesDir, 'example-config.json', 'node_modules');
    });

    it('should symlink the node_modules', () => {
      exampleBoilerPlate.add();
      expect(fs.ensureSymlinkSync).toHaveBeenCalledTimes(exampleFolders.length);
      expect(fs.ensureSymlinkSync).toHaveBeenCalledWith(sharedNodeModulesDir, path.resolve('a/b/node_modules'));
      expect(fs.ensureSymlinkSync).toHaveBeenCalledWith(sharedNodeModulesDir, path.resolve('c/d/node_modules'));
    });

    it('should copy all the source boilerplate files for systemjs', () => {
      const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
      exampleBoilerPlate.loadJsonFile.and.callFake(filePath => filePath.indexOf('a/b') !== -1 ? { projectType: 'systemjs' } : {})
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledTimes(
        (BPFiles.cli) +
        (BPFiles.systemjs) +
        (BPFiles.common * exampleFolders.length)
      );
      // for example
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledWith(`${boilerplateDir}/systemjs`, 'a/b', 'package.json');
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledWith(`${boilerplateDir}/common`, 'a/b', 'src/styles.css');
    });

    it('should copy all the source boilerplate files for cli', () => {
      const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledTimes(
        (BPFiles.cli * exampleFolders.length) +
        (BPFiles.common * exampleFolders.length)
      );
      // for example
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledWith(`${boilerplateDir}/cli`, 'a/b', 'package.json');
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledWith(`${boilerplateDir}/common`, 'c/d', 'src/styles.css');
    });

    it('should try to load the example config file', () => {
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.loadJsonFile).toHaveBeenCalledTimes(exampleFolders.length);
      expect(exampleBoilerPlate.loadJsonFile).toHaveBeenCalledWith(path.resolve('a/b/example-config.json'));
      expect(exampleBoilerPlate.loadJsonFile).toHaveBeenCalledWith(path.resolve('c/d/example-config.json'));
    });
  });

  describe('remove', () => {
    it('should run `git clean`', () => {
      spyOn(shelljs, 'exec');
      exampleBoilerPlate.remove();
      expect(shelljs.exec).toHaveBeenCalledWith('git clean -xdfq', {cwd: path.resolve(__dirname, '../../content/examples') });
    });
  });

  describe('installNodeModules', () => {
    beforeEach(() => {
      spyOn(shelljs, 'exec');
      spyOn(ngPackagesInstaller, 'overwritePackages');
      spyOn(ngPackagesInstaller, 'restorePackages');
    });

    it('should run `yarn` in the base path', () => {
      exampleBoilerPlate.installNodeModules('some/base/path');
      expect(shelljs.exec).toHaveBeenCalledWith('yarn', { cwd: 'some/base/path' });
    });

    it('should overwrite the Angular packages if `useLocal` is true', () => {
      ngPackagesInstaller.overwritePackages.and.callFake(() => expect(shelljs.exec).toHaveBeenCalled());

      exampleBoilerPlate.installNodeModules('some/base/path', true);
      expect(ngPackagesInstaller.overwritePackages).toHaveBeenCalledWith('some/base/path');
      expect(ngPackagesInstaller.restorePackages).not.toHaveBeenCalled();
    });

    it('should restore the Angular packages if `useLocal` is not true', () => {
      exampleBoilerPlate.installNodeModules('some/base/path1');
      expect(ngPackagesInstaller.restorePackages).toHaveBeenCalledWith('some/base/path1');

      exampleBoilerPlate.installNodeModules('some/base/path2', false);
      expect(ngPackagesInstaller.restorePackages).toHaveBeenCalledWith('some/base/path2');

      expect(ngPackagesInstaller.overwritePackages).not.toHaveBeenCalled();
    });
  });

  describe('getFoldersContaining', () => {
    it('should use glob.sync', () => {
      spyOn(glob, 'sync').and.returnValue(['a/b/config.json', 'c/d/config.json']);
      const result = exampleBoilerPlate.getFoldersContaining('base/path', 'config.json', 'node_modules');
      expect(glob.sync).toHaveBeenCalledWith(path.resolve('base/path/**/config.json'), { ignore: [path.resolve('base/path/**/node_modules/**')] });
      expect(result).toEqual(['a/b', 'c/d']);
    });
  });

  describe('copyFile', () => {
    it('should use copySync and chmodSync', () => {
      spyOn(fs, 'copySync');
      spyOn(fs, 'chmodSync');
      exampleBoilerPlate.copyFile('source/folder', 'destination/folder', 'some/file/path');
      expect(fs.copySync).toHaveBeenCalledWith(
        path.resolve('source/folder/some/file/path'),
        path.resolve('destination/folder/some/file/path'),
        { overwrite: true });
      expect(fs.chmodSync).toHaveBeenCalledWith(path.resolve('destination/folder/some/file/path'), 444);
    });
  });

  describe('loadJsonFile', () => {
    it('should use fs.readJsonSync', () => {
      spyOn(fs, 'readJsonSync').and.returnValue({ some: 'value' });
      const result = exampleBoilerPlate.loadJsonFile('some/file');
      expect(fs.readJsonSync).toHaveBeenCalledWith('some/file', {throws: false});
      expect(result).toEqual({ some: 'value' });
    });

    it('should return an empty object if readJsonSync fails', () => {
      spyOn(fs, 'readJsonSync').and.returnValue(null);
      const result = exampleBoilerPlate.loadJsonFile('some/file');
      expect(result).toEqual({});
    });
  });
});
