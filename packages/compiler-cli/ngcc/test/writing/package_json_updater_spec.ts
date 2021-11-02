/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {JsonObject} from '../../src/packages/entry_point';
import {DirectPackageJsonUpdater, PackageJsonUpdater} from '../../src/writing/package_json_updater';

runInEachFileSystem(() => {
  describe('DirectPackageJsonUpdater', () => {
    let _: typeof absoluteFrom;
    let fs: FileSystem;
    let updater: PackageJsonUpdater;

    // Helpers
    const readJson = <T>(path: AbsoluteFsPath) => JSON.parse(fs.readFile(path)) as T;

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

      const pkg = readJson<{foo: boolean, bar: {baz: string | number}}>(jsonPath);
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

      const pkg = readJson<{foo: {bar: {baz: {qux: string}}}}>(jsonPath);
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

    describe('(property positioning)', () => {
      // Helpers
      const createJsonFile = (jsonObj: JsonObject) => {
        const jsonPath = _('/foo/package.json');
        loadTestFiles([{name: jsonPath, contents: JSON.stringify(jsonObj)}]);
        return jsonPath;
      };
      const expectJsonEquals = (jsonFilePath: AbsoluteFsPath, jsonObj: JsonObject) =>
          expect(fs.readFile(jsonFilePath).trim()).toBe(JSON.stringify(jsonObj, null, 2));

      it('should not change property positioning by default', () => {
        const jsonPath = createJsonFile({
          p2: '2',
          p1: {p12: '1.2', p11: '1.1'},
        });

        updater.createUpdate()
            .addChange(['p1', 'p11'], '1.1-updated')
            .addChange(['p1', 'p10'], '1.0-added')
            .addChange(['p2'], '2-updated')
            .addChange(['p0'], '0-added')
            .writeChanges(jsonPath);

        expectJsonEquals(jsonPath, {
          p2: '2-updated',
          p1: {p12: '1.2', p11: '1.1-updated', p10: '1.0-added'},
          p0: '0-added',
        });
      });

      it('should not change property positioning with `positioning: unimportant`', () => {
        const jsonPath = createJsonFile({
          p2: '2',
          p1: {p12: '1.2', p11: '1.1'},
        });

        updater.createUpdate()
            .addChange(['p1', 'p11'], '1.1-updated', 'unimportant')
            .addChange(['p1', 'p10'], '1.0-added', 'unimportant')
            .addChange(['p2'], '2-updated', 'unimportant')
            .addChange(['p0'], '0-added', 'unimportant')
            .writeChanges(jsonPath);

        expectJsonEquals(jsonPath, {
          p2: '2-updated',
          p1: {p12: '1.2', p11: '1.1-updated', p10: '1.0-added'},
          p0: '0-added',
        });
      });

      it('should position added/updated properties alphabetically with `positioning: alphabetic`',
         () => {
           const jsonPath = createJsonFile({
             p2: '2',
             p1: {p12: '1.2', p11: '1.1'},
           });

           updater.createUpdate()
               .addChange(['p1', 'p11'], '1.1-updated', 'alphabetic')
               .addChange(['p1', 'p10'], '1.0-added', 'alphabetic')
               .addChange(['p0'], '0-added', 'alphabetic')
               .addChange(['p3'], '3-added', 'alphabetic')
               .writeChanges(jsonPath);

           expectJsonEquals(jsonPath, {
             p0: '0-added',
             p2: '2',
             p1: {p10: '1.0-added', p11: '1.1-updated', p12: '1.2'},
             p3: '3-added',
           });
         });

      it('should position added/updated properties correctly with `positioning: {before: ...}`',
         () => {
           const jsonPath = createJsonFile({
             p2: '2',
             p1: {p12: '1.2', p11: '1.1'},
           });

           updater.createUpdate()
               .addChange(['p0'], '0-added', {before: 'p1'})
               .addChange(['p1', 'p10'], '1.0-added', {before: 'p11'})
               .addChange(['p1', 'p12'], '1.2-updated', {before: 'p11'})
               .writeChanges(jsonPath);

           expectJsonEquals(jsonPath, {
             p2: '2',
             p0: '0-added',
             p1: {p10: '1.0-added', p12: '1.2-updated', p11: '1.1'},
           });

           // Verify that trying to add before non-existent property, puts updated property at the
           // end.
           updater.createUpdate()
               .addChange(['p3'], '3-added', {before: 'non-existent'})
               .addChange(['p1', 'p10'], '1.0-updated', {before: 'non-existent'})
               .writeChanges(jsonPath);

           expectJsonEquals(jsonPath, {
             p2: '2',
             p0: '0-added',
             p1: {p12: '1.2-updated', p11: '1.1', p10: '1.0-updated'},
             p3: '3-added',
           });
         });

      it('should ignore positioning when updating an in-memory representation', () => {
        const jsonObj = {
          p20: '20',
          p10: {p102: '10.2', p101: '10.1'},
        };
        const jsonPath = createJsonFile(jsonObj);

        updater.createUpdate()
            .addChange(['p0'], '0-added', 'alphabetic')
            .addChange(['p1'], '1-added', 'unimportant')
            .addChange(['p2'], '2-added')
            .addChange(['p20'], '20-updated', 'alphabetic')
            .addChange(['p10', 'p103'], '10.3-added', {before: 'p102'})
            .addChange(['p10', 'p102'], '10.2-updated', {before: 'p103'})
            .writeChanges(jsonPath, jsonObj);

        expect(JSON.stringify(jsonObj)).toBe(JSON.stringify({
          p20: '20-updated',
          p10: {p102: '10.2-updated', p101: '10.1', p103: '10.3-added'},
          p0: '0-added',
          p1: '1-added',
          p2: '2-added',
        }));
      });
    });
  });
});
