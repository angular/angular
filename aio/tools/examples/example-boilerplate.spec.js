const path = require('canonical-path');
const fs = require('fs-extra');
const glob = require('glob');
const shelljs = require('shelljs');

const exampleBoilerPlate = require('./example-boilerplate');

describe('example-boilerplate tool', () => {
  describe('add', () => {
    const sharedDir = path.resolve(__dirname, 'shared');
    const sharedNodeModulesDir = path.resolve(sharedDir, 'node_modules');
    const exampleFolders = ['a/b', 'c/d'];

    beforeEach(() => {
      spyOn(fs, 'ensureSymlinkSync');
      spyOn(fs, 'existsSync').and.returnValue(true);
      spyOn(shelljs, 'exec');
      spyOn(exampleBoilerPlate, 'copyDirectoryContents');
      spyOn(exampleBoilerPlate, 'getFoldersContaining').and.returnValue(exampleFolders);
      spyOn(exampleBoilerPlate, 'loadJsonFile').and.returnValue({});
    });

    it('should run `ngcc`', () => {
      exampleBoilerPlate.add();
      expect(shelljs.exec).toHaveBeenCalledWith(
          `yarn --cwd ${sharedDir} ngcc --properties es2015 browser module main --first-only --create-ivy-entry-points`);
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
      exampleBoilerPlate.loadJsonFile.and.returnValue({ projectType: 'systemjs' });

      exampleBoilerPlate.add();

      expect(exampleBoilerPlate.copyDirectoryContents).toHaveBeenCalledTimes(4);
      expect(exampleBoilerPlate.copyDirectoryContents.calls.allArgs()).toEqual([
        [`${boilerplateDir}/systemjs`, 'a/b', jasmine.any(Function)],
        [`${boilerplateDir}/common`, 'a/b', jasmine.any(Function)],
        [`${boilerplateDir}/systemjs`, 'c/d', jasmine.any(Function)],
        [`${boilerplateDir}/common`, 'c/d', jasmine.any(Function)],
      ]);
    });

    it('should copy all the source boilerplate files for cli', () => {
      const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
      exampleBoilerPlate.loadJsonFile.and.returnValue({ projectType: 'cli' });

      exampleBoilerPlate.add();

      expect(exampleBoilerPlate.copyDirectoryContents).toHaveBeenCalledTimes(4);
      expect(exampleBoilerPlate.copyDirectoryContents.calls.allArgs()).toEqual([
        [`${boilerplateDir}/cli`, 'a/b', jasmine.any(Function)],
        [`${boilerplateDir}/common`, 'a/b', jasmine.any(Function)],
        [`${boilerplateDir}/cli`, 'c/d', jasmine.any(Function)],
        [`${boilerplateDir}/common`, 'c/d', jasmine.any(Function)],
      ]);
    });

    it('should default to `cli` if `projectType` is not specified', () => {
      const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
      exampleBoilerPlate.loadJsonFile.and.returnValue({});

      exampleBoilerPlate.add();

      expect(exampleBoilerPlate.copyDirectoryContents).toHaveBeenCalledTimes(4);
      expect(exampleBoilerPlate.copyDirectoryContents.calls.allArgs()).toEqual([
        [`${boilerplateDir}/cli`, 'a/b', jasmine.any(Function)],
        [`${boilerplateDir}/common`, 'a/b', jasmine.any(Function)],
        [`${boilerplateDir}/cli`, 'c/d', jasmine.any(Function)],
        [`${boilerplateDir}/common`, 'c/d', jasmine.any(Function)],
      ]);
    });

    it('should copy all the source boilerplate files for i18n (on top of the cli ones)', () => {
      const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
      exampleBoilerPlate.loadJsonFile.and.returnValue({ projectType: 'i18n' });

      exampleBoilerPlate.add();

      expect(exampleBoilerPlate.copyDirectoryContents).toHaveBeenCalledTimes(6);
      expect(exampleBoilerPlate.copyDirectoryContents.calls.allArgs()).toEqual([
        [`${boilerplateDir}/cli`, 'a/b', jasmine.any(Function)],
        [`${boilerplateDir}/i18n`, 'a/b', jasmine.any(Function)],
        [`${boilerplateDir}/common`, 'a/b', jasmine.any(Function)],
        [`${boilerplateDir}/cli`, 'c/d', jasmine.any(Function)],
        [`${boilerplateDir}/i18n`, 'c/d', jasmine.any(Function)],
        [`${boilerplateDir}/common`, 'c/d', jasmine.any(Function)],
      ]);
    });

    it('should copy all the source boilerplate files for universal (on top of the cli ones)', () => {
      const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
      exampleBoilerPlate.loadJsonFile.and.returnValue({ projectType: 'universal' });

      exampleBoilerPlate.add();

      expect(exampleBoilerPlate.copyDirectoryContents).toHaveBeenCalledTimes(6);
      expect(exampleBoilerPlate.copyDirectoryContents.calls.allArgs()).toEqual([
        [`${boilerplateDir}/cli`, 'a/b', jasmine.any(Function)],
        [`${boilerplateDir}/universal`, 'a/b', jasmine.any(Function)],
        [`${boilerplateDir}/common`, 'a/b', jasmine.any(Function)],
        [`${boilerplateDir}/cli`, 'c/d', jasmine.any(Function)],
        [`${boilerplateDir}/universal`, 'c/d', jasmine.any(Function)],
        [`${boilerplateDir}/common`, 'c/d', jasmine.any(Function)],
      ]);
    });

    it('should try to load the example config file', () => {
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.loadJsonFile).toHaveBeenCalledTimes(exampleFolders.length);
      expect(exampleBoilerPlate.loadJsonFile).toHaveBeenCalledWith(path.resolve('a/b/example-config.json'));
      expect(exampleBoilerPlate.loadJsonFile).toHaveBeenCalledWith(path.resolve('c/d/example-config.json'));
    });

    describe('(viewengine: true)', () => {
      it('should not run `ngcc`', () => {
        exampleBoilerPlate.add(true);
        expect(shelljs.exec).not.toHaveBeenCalled();
      });

      it('should copy all the source boilerplate files for systemjs', () => {
        const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
        exampleBoilerPlate.loadJsonFile.and.returnValue({ projectType: 'systemjs' });

        exampleBoilerPlate.add(true);

        expect(exampleBoilerPlate.copyDirectoryContents).toHaveBeenCalledTimes(6);
        expect(exampleBoilerPlate.copyDirectoryContents.calls.allArgs()).toEqual([
          [`${boilerplateDir}/systemjs`, 'a/b', jasmine.any(Function)],
          [`${boilerplateDir}/common`, 'a/b', jasmine.any(Function)],
          [`${boilerplateDir}/viewengine/systemjs`, 'a/b', jasmine.any(Function)],
          [`${boilerplateDir}/systemjs`, 'c/d', jasmine.any(Function)],
          [`${boilerplateDir}/common`, 'c/d', jasmine.any(Function)],
          [`${boilerplateDir}/viewengine/systemjs`, 'c/d', jasmine.any(Function)],
        ]);
      });

      it('should copy all the source boilerplate files for cli', () => {
        const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
        exampleBoilerPlate.loadJsonFile.and.returnValue({ projectType: 'cli' });

        exampleBoilerPlate.add(true);

        expect(exampleBoilerPlate.copyDirectoryContents).toHaveBeenCalledTimes(6);
        expect(exampleBoilerPlate.copyDirectoryContents.calls.allArgs()).toEqual([
          [`${boilerplateDir}/cli`, 'a/b', jasmine.any(Function)],
          [`${boilerplateDir}/common`, 'a/b', jasmine.any(Function)],
          [`${boilerplateDir}/viewengine/cli`, 'a/b', jasmine.any(Function)],
          [`${boilerplateDir}/cli`, 'c/d', jasmine.any(Function)],
          [`${boilerplateDir}/common`, 'c/d', jasmine.any(Function)],
          [`${boilerplateDir}/viewengine/cli`, 'c/d', jasmine.any(Function)],
        ]);
      });

      it('should copy all the source boilerplate files for elements', () => {
        const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
        exampleBoilerPlate.loadJsonFile.and.returnValue({ projectType: 'elements' });

        exampleBoilerPlate.add(true);

        expect(exampleBoilerPlate.copyDirectoryContents).toHaveBeenCalledTimes(8);
        expect(exampleBoilerPlate.copyDirectoryContents.calls.allArgs()).toEqual([
          [`${boilerplateDir}/cli`, 'a/b', jasmine.any(Function)],
          [`${boilerplateDir}/elements`, 'a/b', jasmine.any(Function)],
          [`${boilerplateDir}/common`, 'a/b', jasmine.any(Function)],
          [`${boilerplateDir}/viewengine/cli`, 'a/b', jasmine.any(Function)],
          [`${boilerplateDir}/cli`, 'c/d', jasmine.any(Function)],
          [`${boilerplateDir}/elements`, 'c/d', jasmine.any(Function)],
          [`${boilerplateDir}/common`, 'c/d', jasmine.any(Function)],
          [`${boilerplateDir}/viewengine/cli`, 'c/d', jasmine.any(Function)],
        ]);
      });
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

  describe('copyDirectoryContents', () => {
    const spyFnFor = fnName => (...args) => { callLog.push(`${fnName}(${args.join(', ')})`); };
    let isPathIgnoredSpy;
    let callLog;

    beforeEach(() => {
      callLog = [];
      isPathIgnoredSpy = jasmine.createSpy('isPathIgnored').and.returnValue(false);
      spyOn(shelljs, 'chmod').and.callFake(spyFnFor('chmod'));
      spyOn(shelljs, 'cp').and.callFake(spyFnFor('cp'));
      spyOn(shelljs, 'mkdir').and.callFake(spyFnFor('mkdir'));
      spyOn(shelljs, 'test').and.callFake(spyFnFor('test'));
    });

    it('should list all contents of a directory', () => {
      const lsSpy = spyOn(shelljs, 'ls').and.returnValue([]);
      exampleBoilerPlate.copyDirectoryContents('source/dir', 'destination/dir', isPathIgnoredSpy);
      expect(lsSpy).toHaveBeenCalledWith('-Al', 'source/dir');
    });

    it('should copy files and make them read-only', () => {
      spyOn(shelljs, 'ls').and.returnValue([
        {name: 'file-1.txt', isDirectory: () => false},
        {name: 'file-2.txt', isDirectory: () => false},
      ]);

      exampleBoilerPlate.copyDirectoryContents('source/dir', 'destination/dir', isPathIgnoredSpy);

      expect(callLog).toEqual([
        `test(-f, ${path.resolve('destination/dir/file-1.txt')})`,
        `cp(${path.resolve('source/dir/file-1.txt')}, destination/dir)`,
        `chmod(444, ${path.resolve('destination/dir/file-1.txt')})`,

        `test(-f, ${path.resolve('destination/dir/file-2.txt')})`,
        `cp(${path.resolve('source/dir/file-2.txt')}, destination/dir)`,
        `chmod(444, ${path.resolve('destination/dir/file-2.txt')})`,
      ]);
    });

    it('should skip files that are ignored', () => {
      spyOn(shelljs, 'ls').and.returnValue([
        {name: 'file-1.txt', isDirectory: () => false},
        {name: 'file-2.txt', isDirectory: () => false},
      ]);
      isPathIgnoredSpy.and.callFake(path => path.endsWith('file-1.txt'));

      exampleBoilerPlate.copyDirectoryContents('source/dir', 'destination/dir', isPathIgnoredSpy);

      expect(callLog).toEqual([
        `test(-f, ${path.resolve('destination/dir/file-2.txt')})`,
        `cp(${path.resolve('source/dir/file-2.txt')}, destination/dir)`,
        `chmod(444, ${path.resolve('destination/dir/file-2.txt')})`,
      ]);
    });

    it('should make existing files in destination writable before overwriting', () => {
      spyOn(shelljs, 'ls').and.returnValue([
        {name: 'new-file.txt', isDirectory: () => false},
        {name: 'existing-file.txt', isDirectory: () => false},
      ]);
      shelljs.test.and.callFake((_, filePath) => filePath.endsWith('existing-file.txt'));

      exampleBoilerPlate.copyDirectoryContents('source/dir', 'destination/dir', isPathIgnoredSpy);

      expect(callLog).toEqual([
        `cp(${path.resolve('source/dir/new-file.txt')}, destination/dir)`,
        `chmod(444, ${path.resolve('destination/dir/new-file.txt')})`,

        `chmod(666, ${path.resolve('destination/dir/existing-file.txt')})`,
        `cp(${path.resolve('source/dir/existing-file.txt')}, destination/dir)`,
        `chmod(444, ${path.resolve('destination/dir/existing-file.txt')})`,
      ]);
    });

    it('should recursively copy sub-directories', () => {
      spyOn(shelljs, 'ls')
        .withArgs('-Al', 'source/dir').and.returnValue([
          {name: 'file-1.txt', isDirectory: () => false},
          {name: 'sub-dir-1', isDirectory: () => true},
          {name: 'file-2.txt', isDirectory: () => false},
        ])
        .withArgs('-Al', path.resolve('source/dir/sub-dir-1')).and.returnValue([
          {name: 'file-3.txt', isDirectory: () => false},
          {name: 'sub-dir-2', isDirectory: () => true},
        ])
        .withArgs('-Al', path.resolve('source/dir/sub-dir-1/sub-dir-2')).and.returnValue([
          {name: 'file-4.txt', isDirectory: () => false},
        ]);

      exampleBoilerPlate.copyDirectoryContents('source/dir', 'destination/dir', isPathIgnoredSpy);

      expect(callLog).toEqual([
        // Copy `file-1.txt`.
        `test(-f, ${path.resolve('destination/dir/file-1.txt')})`,
        `cp(${path.resolve('source/dir/file-1.txt')}, destination/dir)`,
        `chmod(444, ${path.resolve('destination/dir/file-1.txt')})`,

        // Create `sub-dir-1` and recursively copy its contents.
        `mkdir(-p, ${path.resolve('destination/dir/sub-dir-1')})`,

          // Copy `sub-dir-1/file-3.txt`.
          `test(-f, ${path.resolve('destination/dir/sub-dir-1/file-3.txt')})`,
          'cp(' +
              `${path.resolve('source/dir/sub-dir-1/file-3.txt')}, ` +
              `${path.resolve('destination/dir/sub-dir-1')})`,
          `chmod(444, ${path.resolve('destination/dir/sub-dir-1/file-3.txt')})`,

          // Create `sub-dir-1/sub-dir-2` and recursively copy its contents.
          `mkdir(-p, ${path.resolve('destination/dir/sub-dir-1/sub-dir-2')})`,

            // Copy `sub-dir-1/sub-dir-2/file-4.txt`.
            `test(-f, ${path.resolve('destination/dir/sub-dir-1/sub-dir-2/file-4.txt')})`,
            'cp(' +
                `${path.resolve('source/dir/sub-dir-1/sub-dir-2/file-4.txt')}, ` +
                `${path.resolve('destination/dir/sub-dir-1/sub-dir-2')})`,
            `chmod(444, ${path.resolve('destination/dir/sub-dir-1/sub-dir-2/file-4.txt')})`,

        // Copy `file-2.txt`.
        `test(-f, ${path.resolve('destination/dir/file-2.txt')})`,
        `cp(${path.resolve('source/dir/file-2.txt')}, destination/dir)`,
        `chmod(444, ${path.resolve('destination/dir/file-2.txt')})`,
      ]);
    });

    it('should skip ignored directories', () => {
      spyOn(shelljs, 'ls')
        .withArgs('-Al', 'source/dir').and.returnValue([
          {name: 'file-1.txt', isDirectory: () => false},
          {name: 'sub-dir-1', isDirectory: () => true},
        ])
        .withArgs('-Al', path.resolve('source/dir/sub-dir-1')).and.returnValue([
          {name: 'file-2.txt', isDirectory: () => false},
          {name: 'sub-dir-2', isDirectory: () => true},
        ])
        .withArgs('-Al', path.resolve('source/dir/sub-dir-1/sub-dir-2')).and.returnValue([
          {name: 'file-3.txt', isDirectory: () => false},
        ]);
      isPathIgnoredSpy.and.callFake(path => path.endsWith('sub-dir-1'));

      exampleBoilerPlate.copyDirectoryContents('source/dir', 'destination/dir', isPathIgnoredSpy);

      expect(callLog).toEqual([
        // Copy `file-1.txt`.
        `test(-f, ${path.resolve('destination/dir/file-1.txt')})`,
        `cp(${path.resolve('source/dir/file-1.txt')}, destination/dir)`,
        `chmod(444, ${path.resolve('destination/dir/file-1.txt')})`,

        // Skip `sub-dir-1` and all its contents.
      ]);
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
