/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem, absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../test/helpers';
import {DirectPackageJsonUpdater, PackageJsonUpdater} from '../../src/writing/package_json_updater';

runInEachFileSystem(() => {
  describe('DirectPackageJsonUpdater', () => {
    let _: typeof absoluteFrom;
    let fs: FileSystem;
    let updater: PackageJsonUpdater;

    // Helpers
    const readJson = (path: AbsoluteFsPath) => JSON.parse(fs.readFile(path));

    beforeEach(() => {
      _ = absoluteFrom;
      fs = getFileSystem();
      updater = new DirectPackageJsonUpdater(fs);
    });

    it('should update a `package.json` file on disk', () => {
      const jsonPath = _('/foo/package.json');
      loadTestFiles([
        {name: jsonPath, contents: '{"foo": true, "bar": {"baz": "OK"}}'},
      ]);

      const update = updater.createUpdate().addChange(['foo'], false).addChange(['bar', 'baz'], 42);

      // Not updated yet.
      expect(readJson(jsonPath)).toEqual({
        foo: true,
        bar: {baz: 'OK'},
      });

      update.writeChanges(jsonPath);

      // Updated now.
      expect(readJson(jsonPath)).toEqual({
        foo: false,
        bar: {baz: 42},
      });
    });

    it('should update an in-memory representation (if provided)', () => {
      const jsonPath = _('/foo/package.json');
      loadTestFiles([
        {name: jsonPath, contents: '{"foo": true, "bar": {"baz": "OK"}}'},
      ]);

      const pkg = readJson(jsonPath);
      const update = updater.createUpdate().addChange(['foo'], false).addChange(['bar', 'baz'], 42);

      // Not updated yet.
      expect(pkg).toEqual({
        foo: true,
        bar: {baz: 'OK'},
      });

      update.writeChanges(jsonPath, pkg);

      // Updated now.
      expect(pkg).toEqual({
        foo: false,
        bar: {baz: 42},
      });
    });

    it('should create the `package.json` file, if it does not exist', () => {
      const jsonPath = _('/foo/package.json');
      expect(fs.exists(jsonPath)).toBe(false);

      updater.createUpdate()
          .addChange(['foo'], false)
          .addChange(['bar', 'baz'], 42)
          .writeChanges(jsonPath);

      expect(fs.exists(jsonPath)).toBe(true);
      expect(readJson(jsonPath)).toEqual({
        foo: false,
        bar: {baz: 42},
      });
    });

    it('should create any missing ancestor objects', () => {
      const jsonPath = _('/foo/package.json');
      loadTestFiles([
        {name: jsonPath, contents: '{"foo": {}}'},
      ]);

      const pkg = readJson(jsonPath);
      updater.createUpdate()
          .addChange(['foo', 'bar', 'baz', 'qux'], 'updated')
          .writeChanges(jsonPath, pkg);

      expect(readJson(jsonPath)).toEqual(pkg);
      expect(pkg).toEqual({
        foo: {
          bar: {
            baz: {
              qux: 'updated',
            },
          },
        },
      });
    });

    it('should throw, if no changes have been recorded', () => {
      const jsonPath = _('/foo/package.json');

      expect(() => updater.createUpdate().writeChanges(jsonPath))
          .toThrowError(`No changes to write to '${jsonPath}'.`);
    });

    it('should throw, if a property-path is empty', () => {
      const jsonPath = _('/foo/package.json');

      expect(() => updater.createUpdate().addChange([], 'missing').writeChanges(jsonPath))
          .toThrowError(`Missing property path for writing value to '${jsonPath}'.`);
    });

    it('should throw, if a property-path points to a non-object intermediate value', () => {
      const jsonPath = _('/foo/package.json');
      loadTestFiles([
        {name: jsonPath, contents: '{"foo": null, "bar": 42, "baz": {"qux": []}}'},
      ]);

      const writeToProp = (propPath: string[]) =>
          updater.createUpdate().addChange(propPath, 'updated').writeChanges(jsonPath);

      expect(() => writeToProp(['foo', 'child']))
          .toThrowError('Property path \'foo.child\' does not point to an object.');
      expect(() => writeToProp(['bar', 'child']))
          .toThrowError('Property path \'bar.child\' does not point to an object.');
      expect(() => writeToProp(['baz', 'qux', 'child']))
          .toThrowError('Property path \'baz.qux.child\' does not point to an object.');
    });

    it('should throw, if trying to re-apply an already applied update', () => {
      const update = updater.createUpdate().addChange(['foo'], 'updated');

      expect(() => update.writeChanges(_('/foo/package.json'))).not.toThrow();
      expect(() => update.writeChanges(_('/foo/package.json')))
          .toThrowError('Trying to apply a `PackageJsonUpdate` that has already been applied.');
      expect(() => update.writeChanges(_('/bar/package.json')))
          .toThrowError('Trying to apply a `PackageJsonUpdate` that has already been applied.');
    });
  });
});
