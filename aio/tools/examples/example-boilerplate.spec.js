const exampleBoilerPlate = require('./example-boilerplate');
const shelljs = require('shelljs');
const fs = require('fs-extra');
const glob = require('glob');
const path = require('canonical-path');

describe('example-boilerplate tool', () => {
  describe('add', () => {
    const numberOfBoilerPlateFiles = 8;
    const numberOfBoilerPlateTestFiles = 3;
    const exampleFolders = ['a/b', 'c/d'];

    beforeEach(() => {
      spyOn(exampleBoilerPlate, 'installNodeModules');
      spyOn(exampleBoilerPlate, 'overridePackage');
      spyOn(exampleBoilerPlate, 'getFoldersContaining').and.returnValue(exampleFolders);
      spyOn(fs, 'ensureSymlinkSync');
      spyOn(exampleBoilerPlate, 'copyFile');
      spyOn(exampleBoilerPlate, 'loadJsonFile').and.returnValue({});
    });

    it('should install the node modules', () => {
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.installNodeModules).toHaveBeenCalledWith(path.resolve(__dirname, 'shared'));
    });

    it('should override the Angular node_modules with the locally built Angular packages if `useLocal` is true', () => {
      const numberOfAngularPackages = 12;
      const numberOfAngularToolsPackages = 1;
      exampleBoilerPlate.add(true);
      expect(exampleBoilerPlate.overridePackage).toHaveBeenCalledTimes(numberOfAngularPackages + numberOfAngularToolsPackages);
      // for example
      expect(exampleBoilerPlate.overridePackage).toHaveBeenCalledWith(path.resolve(__dirname, '../../../dist/packages-dist'), 'core');
      expect(exampleBoilerPlate.overridePackage).toHaveBeenCalledWith(path.resolve(__dirname, '../../../dist/tools/@angular'), 'tsc-wrapped');
    });

    it('should process all the example folders', () => {
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.getFoldersContaining).toHaveBeenCalledWith(path.resolve(__dirname, '../../content/examples'), 'example-config.json', 'node_modules');
    });

    it('should symlink the node_modules', () => {
      exampleBoilerPlate.add();
      expect(fs.ensureSymlinkSync).toHaveBeenCalledTimes(exampleFolders.length);
      expect(fs.ensureSymlinkSync).toHaveBeenCalledWith(path.resolve(__dirname, 'shared/node_modules'), path.resolve('a/b/node_modules'));
      expect(fs.ensureSymlinkSync).toHaveBeenCalledWith(path.resolve(__dirname, 'shared/node_modules'), path.resolve('c/d/node_modules'));
    });

    it('should copy all the source boilerplate files', () => {
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledTimes(numberOfBoilerPlateFiles * exampleFolders.length);
      // for example
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledWith(path.resolve(__dirname, 'shared/boilerplate'), 'a/b', 'package.json');
    });

    it('should try to load the example config file', () => {
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.loadJsonFile).toHaveBeenCalledTimes(exampleFolders.length);
      expect(exampleBoilerPlate.loadJsonFile).toHaveBeenCalledWith(path.resolve('a/b/example-config.json'));
      expect(exampleBoilerPlate.loadJsonFile).toHaveBeenCalledWith(path.resolve('c/d/example-config.json'));
    });

    it('should copy all the test boilerplate files if unit testing is configured', () => {
      // configure unit testing for example a/b and not c/d
      exampleBoilerPlate.loadJsonFile.and.callFake(filePath => filePath.indexOf('a/b') !== -1 ? { unittesting: true } : {});
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledTimes((numberOfBoilerPlateFiles * 2) + numberOfBoilerPlateTestFiles);
      // for example
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledWith(path.resolve(__dirname, '../../content/examples/testing'), 'a/b', 'karma.conf.js');
      expect(exampleBoilerPlate.copyFile).not.toHaveBeenCalledWith(path.resolve(__dirname, '../../content/examples/testing'), 'c/d', 'karma.conf.js');
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
    it('should run `yarn` in the base path', () => {
      spyOn(shelljs, 'exec');
      exampleBoilerPlate.installNodeModules('some/base/path');
      expect(shelljs.exec).toHaveBeenCalledWith('yarn', { cwd: 'some/base/path' });
    });
  });

  describe('overridePackage', () => {
    beforeEach(() => {
      spyOn(shelljs, 'rm');
      spyOn(fs, 'ensureSymlinkSync');
    });

    it('should remove the original package from the shared node_modules folder', () => {
      exampleBoilerPlate.overridePackage('base/path', 'somePackage');
      expect(shelljs.rm).toHaveBeenCalledWith('-rf', path.resolve(__dirname, 'shared/node_modules/@angular/somePackage'));
    });

    it('should symlink the source folder to the shared node_modules folder', () => {
      exampleBoilerPlate.overridePackage('base/path', 'somePackage');
      expect(fs.ensureSymlinkSync).toHaveBeenCalledWith(path.resolve('base/path/somePackage'), path.resolve(__dirname, 'shared/node_modules/@angular/somePackage'));
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
