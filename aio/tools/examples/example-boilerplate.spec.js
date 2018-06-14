const path = require('canonical-path');
const fs = require('fs-extra');
const glob = require('glob');
const shelljs = require('shelljs');

const exampleBoilerPlate = require('./example-boilerplate');

describe('example-boilerplate tool', () => {
  describe('add', () => {
    const sharedDir = path.resolve(__dirname, 'shared');
    const sharedNodeModulesDir = path.resolve(sharedDir, 'node_modules');
    const BPFiles = {
      cli: 19,
      i18n: 2,
      universal: 2,
      systemjs: 7,
      common: 1
    };
    const exampleFolders = ['a/b', 'c/d'];

    beforeEach(() => {
      spyOn(fs, 'ensureSymlinkSync');
      spyOn(fs, 'existsSync').and.returnValue(true);
      spyOn(exampleBoilerPlate, 'copyFile');
      spyOn(exampleBoilerPlate, 'getFoldersContaining').and.returnValue(exampleFolders);
      spyOn(exampleBoilerPlate, 'loadJsonFile').and.returnValue({});
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

    it('should error if the node_modules folder is missing', () => {
      fs.existsSync.and.returnValue(false);
      expect(() => exampleBoilerPlate.add()).toThrowError(
        `The shared node_modules folder for the examples (${sharedNodeModulesDir}) is missing.\n` +
        `Perhaps you need to run "yarn example-use-npm" or "yarn example-use-local" to install the dependencies?`);
      expect(fs.ensureSymlinkSync).not.toHaveBeenCalled();
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

    it('should copy all the source boilerplate files for i18n', () => {
      const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
      exampleBoilerPlate.loadJsonFile.and.callFake(filePath => filePath.indexOf('a/b') !== -1 ? { projectType: 'i18n' } : {})
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledTimes(
        (BPFiles.cli + BPFiles.i18n) +
        (BPFiles.cli) +
        (BPFiles.common * exampleFolders.length)
      );
      // for example
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledWith(`${boilerplateDir}/i18n`, 'a/b', '../cli/angular.json');
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledWith(`${boilerplateDir}/i18n`, 'a/b', 'package.json');
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledWith(`${boilerplateDir}/common`, 'c/d', 'src/styles.css');
    });

    it('should copy all the source boilerplate files for universal', () => {
      const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
      exampleBoilerPlate.loadJsonFile.and.callFake(filePath => filePath.indexOf('a/b') !== -1 ? { projectType: 'universal' } : {})
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledTimes(
        (BPFiles.cli + BPFiles.universal) +
        (BPFiles.cli) +
        (BPFiles.common * exampleFolders.length)
      );
      // for example
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledWith(`${boilerplateDir}/universal`, 'a/b', '../cli/tslint.json');
      expect(exampleBoilerPlate.copyFile).toHaveBeenCalledWith(`${boilerplateDir}/universal`, 'a/b', 'angular.json');
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
