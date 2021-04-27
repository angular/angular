const path = require('canonical-path');
const fs = require('fs-extra');
const {glob} = require('glob');

const {EXAMPLES_BASE_PATH, EXAMPLE_CONFIG_FILENAME, SHARED_PATH, STACKBLITZ_CONFIG_FILENAME} =
    require('./constants');

const {
  copyExampleFiles,
  createEmptyExample,
  ensureExamplePath,
  titleize,
  writeExampleConfigFile,
  writeStackBlitzFile
} = require('./create-example');

describe('create-example tool', () => {
  describe('createEmptyExample', () => {
    it('should create an empty example with marker files', () => {
      spyOn(fs, 'existsSync').and.returnValue(false);
      spyOn(fs, 'ensureDirSync');
      const writeFileSpy = spyOn(fs, 'writeFileSync');

      createEmptyExample('foo-bar', '/path/to/foo-bar');
      expect(writeFileSpy).toHaveBeenCalledTimes(2);
      expect(writeFileSpy)
          .toHaveBeenCalledWith(
              path.resolve(`/path/to/foo-bar/${EXAMPLE_CONFIG_FILENAME}`), jasmine.any(String));
      expect(writeFileSpy)
          .toHaveBeenCalledWith(
              path.resolve(`/path/to/foo-bar/${STACKBLITZ_CONFIG_FILENAME}`), jasmine.any(String));
    });
  });

  describe('ensureExamplePath', () => {
    it('should error if the path already exists', () => {
      spyOn(fs, 'existsSync').and.returnValue(true);
      expect(() => ensureExamplePath('foo/bar'))
          .toThrowError(
              `Unable to create example. The path to the new example already exists: foo/bar`);
    });

    it('should create the directory on disk', () => {
      spyOn(fs, 'existsSync').and.returnValue(false);
      const spy = spyOn(fs, 'ensureDirSync');
      ensureExamplePath('foo/bar');
      expect(spy).toHaveBeenCalledWith('foo/bar');
    });
  });

  describe('writeExampleConfigFile', () => {
    it('should write a JSON file to disk', () => {
      const spy = spyOn(fs, 'writeFileSync');
      writeExampleConfigFile('/foo/bar');
      expect(spy).toHaveBeenCalledWith(path.resolve(`/foo/bar/${EXAMPLE_CONFIG_FILENAME}`), '');
    });
  });

  describe('writeStackBlitzFile', () => {
    it('should write a JSON file to disk', () => {
      const spy = spyOn(fs, 'writeFileSync');
      writeStackBlitzFile('bar-bar', '/foo/bar-bar');
      expect(spy).toHaveBeenCalledWith(path.resolve(`/foo/bar-bar/${STACKBLITZ_CONFIG_FILENAME}`), [
        '{',
        '  "description": "Bar Bar",',
        '  "files": [',
        '    "!**/*.d.ts",',
        '    "!**/*.js",',
        '    "!**/*.[1,2].*"',
        '  ],',
        '  "tags": [',
        '    [',
        '      "bar",',
        '      "bar"',
        '    ]',
        '  ]',
        '}',
        '',
      ].join('\n'));
    });
  });

  describe('copyExampleFiles', () => {
    it('should copy over files that are not ignored by git', () => {
      const examplesGitIgnorePath = path.resolve(EXAMPLES_BASE_PATH, '.gitignore');
      const sourceGitIgnorePath = path.resolve('/source/path', '.gitignore');

      spyOn(console, 'log');
      spyOn(fs, 'existsSync').and.returnValue(true);
      const readFileSyncSpy = spyOn(fs, 'readFileSync').and.callFake(p => {
        switch (p) {
          case examplesGitIgnorePath:
            return '**/a/b/**';
          case sourceGitIgnorePath:
            return '**/*.bad';
          default:
            throw new Error('Unexpected path');
        }
      });
      spyOn(glob, 'sync').and.returnValue([
        'a/', 'a/b/', 'a/c', 'x.ts', 'x.bad', 'a/b/y.ts', 'a/b/y.bad'
      ]);
      const ensureDirSyncSpy = spyOn(fs, 'ensureDirSync');
      const copySyncSpy = spyOn(fs, 'copySync');

      copyExampleFiles('/source/path', '/path/to/test-example', 'test-example');

      expect(readFileSyncSpy).toHaveBeenCalledWith(examplesGitIgnorePath, 'utf8');
      expect(readFileSyncSpy).toHaveBeenCalledWith(sourceGitIgnorePath, 'utf8');

      expect(ensureDirSyncSpy.calls.allArgs()).toEqual([
        [path.resolve('/path/to/test-example/a')],
        [path.resolve('/path/to/test-example')],
      ]);

      expect(copySyncSpy.calls.allArgs()).toEqual([
        [path.resolve('/source/path/a/c'), path.resolve('/path/to/test-example/a/c')],
        [path.resolve('/source/path/x.ts'), path.resolve('/path/to/test-example/x.ts')],
      ]);
    });
  });

  describe('titleize', () => {
    it('should convert a kebab-case string to title-case', () => {
      expect(titleize('abc')).toEqual('Abc');
      expect(titleize('abc-def')).toEqual('Abc Def');
      expect(titleize('123')).toEqual('123');
      expect(titleize('abc---def')).toEqual('Abc - Def');
    });
  });
});
