const path = require('canonical-path');
const fs = require('fs-extra');
const glob = require('glob');
const shelljs = require('shelljs');

const {EXAMPLES_BASE_PATH, BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH} = require("./constants");
const exampleBoilerPlate = require('./example-boilerplate');

describe('example-boilerplate tool', () => {
  describe('add', () => {
    const sharedDir = path.resolve(__dirname, 'shared');
    const exampleFolders = [`${EXAMPLES_BASE_PATH}/a/b`, `${EXAMPLES_BASE_PATH}/c/d`];

    beforeEach(() => {
      spyOn(fs, 'ensureSymlinkSync');
      spyOn(fs, 'existsSync').and.returnValue(true);
      spyOn(shelljs, 'exec');
      spyOn(exampleBoilerPlate, 'copyDirectoryContents');
      spyOn(exampleBoilerPlate, 'getFoldersContaining').and.returnValue(exampleFolders);
      spyOn(exampleBoilerPlate, 'loadJsonFile').and.returnValue({});
    });

    it('should process all the example folders', () => {
      const examplesDir = path.resolve(__dirname, '../../content/examples');
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.getFoldersContaining)
          .toHaveBeenCalledWith(examplesDir, 'example-config.json', 'node_modules');
    });

    it('should copy all the source boilerplate files for systemjs', () => {
      const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
      exampleBoilerPlate.loadJsonFile.and.returnValue({ projectType: 'systemjs' });

      exampleBoilerPlate.add();

      expect(exampleBoilerPlate.copyDirectoryContents).toHaveBeenCalledTimes(4);
      expect(exampleBoilerPlate.copyDirectoryContents.calls.allArgs()).toEqual([
        [`${boilerplateDir}/systemjs`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/a/b`, jasmine.any(Function)],
        [`${boilerplateDir}/common`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/a/b`, jasmine.any(Function)],
        [`${boilerplateDir}/systemjs`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/c/d`, jasmine.any(Function)],
        [`${boilerplateDir}/common`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/c/d`, jasmine.any(Function)],
      ]);
    });

    it('should copy all the source boilerplate files for cli', () => {
      const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
      exampleBoilerPlate.loadJsonFile.and.returnValue({ projectType: 'cli' });

      exampleBoilerPlate.add();

      expect(exampleBoilerPlate.copyDirectoryContents).toHaveBeenCalledTimes(4);
      expect(exampleBoilerPlate.copyDirectoryContents.calls.allArgs()).toEqual([
        [`${boilerplateDir}/cli`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/a/b`, jasmine.any(Function)],
        [`${boilerplateDir}/common`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/a/b`, jasmine.any(Function)],
        [`${boilerplateDir}/cli`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/c/d`, jasmine.any(Function)],
        [`${boilerplateDir}/common`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/c/d`, jasmine.any(Function)],
      ]);
    });

    it('should default to `cli` if `projectType` is not specified', () => {
      const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
      exampleBoilerPlate.loadJsonFile.and.returnValue({});

      exampleBoilerPlate.add();

      expect(exampleBoilerPlate.copyDirectoryContents).toHaveBeenCalledTimes(4);
      expect(exampleBoilerPlate.copyDirectoryContents.calls.allArgs()).toEqual([
        [`${boilerplateDir}/cli`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/a/b`, jasmine.any(Function)],
        [`${boilerplateDir}/common`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/a/b`, jasmine.any(Function)],
        [`${boilerplateDir}/cli`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/c/d`, jasmine.any(Function)],
        [`${boilerplateDir}/common`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/c/d`, jasmine.any(Function)],
      ]);
    });

    it('should copy all the source boilerplate files for i18n (on top of the cli ones)', () => {
      const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
      exampleBoilerPlate.loadJsonFile.and.returnValue({ projectType: 'i18n' });

      exampleBoilerPlate.add();

      expect(exampleBoilerPlate.copyDirectoryContents).toHaveBeenCalledTimes(6);
      expect(exampleBoilerPlate.copyDirectoryContents.calls.allArgs()).toEqual([
        [`${boilerplateDir}/cli`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/a/b`, jasmine.any(Function)],
        [`${boilerplateDir}/i18n`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/a/b`, jasmine.any(Function)],
        [`${boilerplateDir}/common`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/a/b`, jasmine.any(Function)],
        [`${boilerplateDir}/cli`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/c/d`, jasmine.any(Function)],
        [`${boilerplateDir}/i18n`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/c/d`, jasmine.any(Function)],
        [`${boilerplateDir}/common`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/c/d`, jasmine.any(Function)],
      ]);
    });

    it('should copy all the source boilerplate files for universal (on top of the cli ones)', () => {
      const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
      exampleBoilerPlate.loadJsonFile.and.returnValue({ projectType: 'universal' });

      exampleBoilerPlate.add();

      expect(exampleBoilerPlate.copyDirectoryContents).toHaveBeenCalledTimes(6);
      expect(exampleBoilerPlate.copyDirectoryContents.calls.allArgs()).toEqual([
        [`${boilerplateDir}/cli`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/a/b`, jasmine.any(Function)],
        [`${boilerplateDir}/universal`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/a/b`, jasmine.any(Function)],
        [`${boilerplateDir}/common`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/a/b`, jasmine.any(Function)],
        [`${boilerplateDir}/cli`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/c/d`, jasmine.any(Function)],
        [`${boilerplateDir}/universal`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/c/d`, jasmine.any(Function)],
        [`${boilerplateDir}/common`, `${BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH}/c/d`, jasmine.any(Function)],
      ]);
    });

    it('should not copy boilerplate files that are match `overrideBoilerplate` in the example-config.json file', () => {
      const boilerplateDir = path.resolve(sharedDir, 'boilerplate');
      exampleBoilerPlate.loadJsonFile.and.returnValue({
        'overrideBoilerplate': [ 'c/d' ]
      });

      exampleBoilerPlate.add();

      const isPathIgnored = exampleBoilerPlate.copyDirectoryContents.calls.first().args[2];
      expect(isPathIgnored(`${boilerplateDir}/cli/a/b`)).toBe(false);
      expect(isPathIgnored(`${boilerplateDir}/cli/c/d`)).toBe(true);
    });

    it('should try to load the example config file', () => {
      exampleBoilerPlate.add();
      expect(exampleBoilerPlate.loadJsonFile).toHaveBeenCalledTimes(exampleFolders.length);
      expect(exampleBoilerPlate.loadJsonFile).toHaveBeenCalledWith(path.resolve(`${EXAMPLES_BASE_PATH}/a/b/example-config.json`));
      expect(exampleBoilerPlate.loadJsonFile).toHaveBeenCalledWith(path.resolve(`${EXAMPLES_BASE_PATH}/c/d/example-config.json`));
    });
  });

  describe('remove', () => {
    it('should run `git clean`', () => {
      spyOn(shelljs, 'exec');
      exampleBoilerPlate.remove();
      expect(shelljs.exec).toHaveBeenCalledWith('git clean -xdfq', {cwd: path.resolve(__dirname, '../../content/examples') });
    });
  });

  describe('listOverrides', () => {
    const exampleFolders = [`${EXAMPLES_BASE_PATH}/a/b`, `${EXAMPLES_BASE_PATH}/c/d`, `${EXAMPLES_BASE_PATH}/e/f`];
    beforeEach(() => {
      spyOn(exampleBoilerPlate, 'getFoldersContaining').and.returnValue(exampleFolders);
      spyOn(console, 'log');
    });

    it('should list all files that are overridden in examples', () => {
      spyOn(exampleBoilerPlate, 'loadJsonFile').and.returnValues(
        {"overrideBoilerplate": ["angular.json", "tsconfig.json"]}, // a/b/example-config.json
        {"overrideBoilerplate": []}, // c/d/example-config.json
        {}, // e/f/example-config.json
      );
      exampleBoilerPlate.listOverrides();
      expect(exampleBoilerPlate.getFoldersContaining)
          .toHaveBeenCalledWith(EXAMPLES_BASE_PATH, 'example-config.json', 'node_modules');
      expect(console.log).toHaveBeenCalledWith('Boilerplate files that have been overridden in examples:');
      expect(console.log).toHaveBeenCalledWith(' - a/b/angular.json');
      expect(console.log).toHaveBeenCalledWith(' - a/b/tsconfig.json');
      expect(console.log).toHaveBeenCalledWith(`(All these paths are relative to ${EXAMPLES_BASE_PATH}.)`);
      expect(console.log).toHaveBeenCalledWith('If you are updating the boilerplate files then also consider updating these too.');
    });

    it('should display a helpful message if there are no overridden files', () => {
      spyOn(exampleBoilerPlate, 'loadJsonFile').and.returnValues(
        {"overrideBoilerplate": null}, // a/b/example-config.json
        {"overrideBoilerplate": []}, // c/d/example-config.json
        {}, // e/f/example-config.json
      );
      exampleBoilerPlate.listOverrides();
      expect(exampleBoilerPlate.getFoldersContaining)
          .toHaveBeenCalledWith(EXAMPLES_BASE_PATH, 'example-config.json', 'node_modules');
      expect(console.log).toHaveBeenCalledWith('No boilerplate files have been overridden in examples.');
      expect(console.log).toHaveBeenCalledWith('You are safe to update the boilerplate files.');
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
