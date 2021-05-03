/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, FileSystem, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {RawSourceMap} from '../../../src/ngtsc/sourcemaps';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {DtsProcessing} from '../../src/execution/tasks/api';
import {NgccConfiguration} from '../../src/packages/configuration';
import {EntryPoint, EntryPointFormat, EntryPointJsonProperty, getEntryPointInfo, isEntryPoint} from '../../src/packages/entry_point';
import {EntryPointBundle, makeEntryPointBundle} from '../../src/packages/entry_point_bundle';
import {NewEntryPointPropertiesMap} from '../../src/packages/entry_point_manifest';
import {createModuleResolutionCache, SharedFileCache} from '../../src/packages/source_file_cache';
import {FileWriter} from '../../src/writing/file_writer';
import {NewEntryPointFileWriter} from '../../src/writing/new_entry_point_file_writer';
import {DirectPackageJsonUpdater} from '../../src/writing/package_json_updater';
import {loadPackageJson} from '../packages/entry_point_spec';

runInEachFileSystem(() => {
  describe('NewEntryPointFileWriter', () => {
    let _: typeof absoluteFrom;
    let fs: FileSystem;
    let fileWriter: FileWriter;
    let logger: MockLogger;
    let entryPoint: EntryPoint;
    let esm5bundle: EntryPointBundle;
    let esm2015bundle: EntryPointBundle;

    beforeEach(() => {
      _ = absoluteFrom;
      fs = getFileSystem();
      logger = new MockLogger();
      loadTestFiles([
        {
          name: _('/node_modules/test/package.json'),
          contents: `
            {
              "module": "./esm5.js",
              "fesm2015": "./es2015/index.js",
              "fesm5": "./esm5.js",
              "es2015": "./es2015/index.js",
              "typings": "./index.d.ts"
            }
          `,
        },
        {name: _('/node_modules/test/index.d.ts'), contents: 'export declare class FooTop {}'},
        {name: _('/node_modules/test/index.d.ts.map'), contents: 'ORIGINAL MAPPING DATA'},
        {name: _('/node_modules/test/index.metadata.json'), contents: '...'},
        {name: _('/node_modules/test/esm5.js'), contents: 'export function FooTop() {}'},
        {name: _('/node_modules/test/esm5.js.map'), contents: 'ORIGINAL MAPPING DATA'},
        {name: _('/node_modules/test/es2015/index.js'), contents: 'export {FooTop} from "./foo";'},
        {
          name: _('/node_modules/test/es2015/index.js.map'),
          contents:
              '{"version":3,"file":"index.js","sources":["../src/index.ts"],"mappings":"AAAA"}'
        },
        {name: _('/node_modules/test/src/index.ts'), contents: 'export {FooTop} from "./foo";'},
        {name: _('/node_modules/test/es2015/foo.js'), contents: 'export class FooTop {}'},
        {
          name: _('/node_modules/test/a/package.json'),
          contents: `
            {
              "module": "./esm5.js",
              "fesm2015": "./es2015/index.js",
              "fesm5": "./esm5.js",
              "es2015": "./es2015/index.js",
              "typings": "./index.d.ts"
            }
          `,
        },
        {name: _('/node_modules/test/a/index.d.ts'), contents: 'export declare class FooA {}'},
        {name: _('/node_modules/test/a/index.metadata.json'), contents: '...'},
        {name: _('/node_modules/test/a/esm5.js'), contents: 'export function FooA() {}'},
        {name: _('/node_modules/test/a/es2015/index.js'), contents: 'export {FooA} from "./foo";'},
        {name: _('/node_modules/test/a/es2015/foo.js'), contents: 'export class FooA {}'},
        {
          name: _('/node_modules/test/b/package.json'),
          // This entry-point points to files outside its folder
          contents:
              `{"module": "../lib/esm5.js", "es2015": "../lib/es2015/index.js", "typings": "../typings/index.d.ts"}`
        },
        {name: _('/node_modules/test/lib/esm5.js'), contents: 'export function FooB() {}'},
        {
          name: _('/node_modules/test/lib/es2015/index.js'),
          contents: 'export {FooB} from "./foo"; import * from "other";'
        },
        {
          name: _('/node_modules/test/lib/es2015/foo.js'),
          contents: 'import {FooA} from "test/a"; import "events"; export class FooB {}'
        },
        {
          name: _('/node_modules/test/typings/index.d.ts'),
          contents: 'export declare class FooB {}'
        },
        {name: _('/node_modules/test/typings/index.metadata.json'), contents: '...'},
        {
          name: _('/node_modules/other/package.json'),
          contents: '{"module": "./esm5.js", "typings": "./index.d.ts"}'
        },
        {name: _('/node_modules/other/index.d.ts'), contents: 'export declare class OtherClass {}'},
        {name: _('/node_modules/other/esm5.js'), contents: 'export class OtherClass {}'},
        {name: _('/node_modules/events/package.json'), contents: '{"main": "./events.js"}'},
        {name: _('/node_modules/events/events.js'), contents: 'export class OtherClass {}'},
      ]);
    });

    describe('writeBundle() [primary entry-point]', () => {
      beforeEach(() => {
        fileWriter = new NewEntryPointFileWriter(
            fs, logger, /* errorOnFailedEntryPoint */ true, new DirectPackageJsonUpdater(fs));
        const config = new NgccConfiguration(fs, _('/'));
        const result = getEntryPointInfo(
            fs, config, logger, _('/node_modules/test'), _('/node_modules/test'))!;
        if (!isEntryPoint(result)) {
          return fail(`Expected an entry point but got ${result}`);
        }
        entryPoint = result;
        esm5bundle = makeTestBundle(fs, entryPoint, 'module', 'esm5');
        esm2015bundle = makeTestBundle(fs, entryPoint, 'es2015', 'esm2015');
      });

      it('should write the modified files to a new folder', () => {
        fileWriter.writeBundle(
            esm5bundle,
            [
              {
                path: _('/node_modules/test/esm5.js'),
                contents: 'export function FooTop() {} // MODIFIED'
              },
              {path: _('/node_modules/test/esm5.js.map'), contents: 'MODIFIED MAPPING DATA'},
            ],
            ['module']);
        expect(fs.readFile(_('/node_modules/test/__ivy_ngcc__/esm5.js')))
            .toEqual('export function FooTop() {} // MODIFIED');
        expect(fs.readFile(_('/node_modules/test/esm5.js'))).toEqual('export function FooTop() {}');
        expect(fs.readFile(_('/node_modules/test/__ivy_ngcc__/esm5.js.map')))
            .toEqual('MODIFIED MAPPING DATA');
        expect(fs.readFile(_('/node_modules/test/esm5.js.map'))).toEqual('ORIGINAL MAPPING DATA');
      });

      it('should also copy unmodified files in the program', () => {
        fileWriter.writeBundle(
            esm2015bundle,
            [
              {
                path: _('/node_modules/test/es2015/foo.js'),
                contents: 'export class FooTop {} // MODIFIED'
              },
            ],
            ['es2015']);
        expect(fs.readFile(_('/node_modules/test/__ivy_ngcc__/es2015/foo.js')))
            .toEqual('export class FooTop {} // MODIFIED');
        expect(fs.readFile(_('/node_modules/test/es2015/foo.js')))
            .toEqual('export class FooTop {}');
        expect(fs.readFile(_('/node_modules/test/__ivy_ngcc__/es2015/index.js')))
            .toEqual('export {FooTop} from "./foo";');
        expect(fs.readFile(_('/node_modules/test/es2015/index.js')))
            .toEqual('export {FooTop} from "./foo";');
      });

      it('should copy any source-map for unmodified files in the program (adding missing sourceRoot)',
         () => {
           // Ensure source-mapping for a non-processed source file `index.js`.
           const sourceMap = {
             version: 3,
             file: 'index.js',
             sources: ['../src/index.ts'],
             mappings: 'AAAA',
           };
           loadTestFiles([
             {
               name: _('/node_modules/test/es2015/index.js.map'),
               contents: JSON.stringify(sourceMap)
             },
             {name: _('/node_modules/test/src/index.ts'), contents: 'export {FooTop} from "./foo";'}
           ]);

           // Simulate that only the `foo.js` file was modified
           const modifiedFiles = [{
             path: _('/node_modules/test/es2015/foo.js'),
             contents: 'export class FooTop {} // MODIFIED'
           }];
           fileWriter.writeBundle(esm2015bundle, modifiedFiles, ['es2015']);

           expect(
               JSON.parse(fs.readFile(_('/node_modules/test/__ivy_ngcc__/es2015/index.js.map'))) as
               Partial<RawSourceMap>)
               .toEqual({...sourceMap, sourceRoot: '../../es2015'});
         });

      it('should copy any source-map for unmodified files in the program (updating sourceRoot)',
         () => {
           // Ensure source-mapping for a non-processed source file `index.js`.
           const sourceMap = {
             version: 3,
             file: 'index.js',
             sourceRoot: '../src',
             sources: ['index.ts'],
             mappings: 'AAAA',
           };
           loadTestFiles([
             {
               name: _('/node_modules/test/es2015/index.js.map'),
               contents: JSON.stringify(sourceMap)
             },
             {name: _('/node_modules/test/src/index.ts'), contents: 'export {FooTop} from "./foo";'}
           ]);

           // Simulate that only the `foo.js` file was modified
           const modifiedFiles = [{
             path: _('/node_modules/test/es2015/foo.js'),
             contents: 'export class FooTop {} // MODIFIED'
           }];
           fileWriter.writeBundle(esm2015bundle, modifiedFiles, ['es2015']);

           expect(
               JSON.parse(fs.readFile(_('/node_modules/test/__ivy_ngcc__/es2015/index.js.map'))) as
               Partial<RawSourceMap>)
               .toEqual({...sourceMap, sourceRoot: '../../src'});
         });

      it('should ignore (with a warning) any invalid source-map for unmodified files in the program',
         () => {
           // Ensure source-mapping for a non-processed source file `index.js`.
           loadTestFiles([
             {name: _('/node_modules/test/es2015/index.js.map'), contents: 'INVALID JSON STRING'},
             {name: _('/node_modules/test/src/index.ts'), contents: 'export {FooTop} from "./foo";'}
           ]);

           // Simulate that only the `foo.js` file was modified
           const modifiedFiles = [{
             path: _('/node_modules/test/es2015/foo.js'),
             contents: 'export class FooTop {} // MODIFIED'
           }];
           fileWriter.writeBundle(esm2015bundle, modifiedFiles, ['es2015']);

           expect(fs.exists(_('/node_modules/test/__ivy_ngcc__/es2015/index.js.map'))).toBe(false);
           expect(logger.logs.warn).toEqual([
             [`Failed to process source-map at ${_('/node_modules/test/es2015/index.js.map')}`],
             ['Unexpected token I in JSON at position 0'],
           ]);
         });

      it('should update the package.json properties', () => {
        fileWriter.writeBundle(
            esm5bundle,
            [
              {
                path: _('/node_modules/test/esm5.js'),
                contents: 'export function FooTop() {} // MODIFIED'
              },
            ],
            ['module']);
        expect(loadPackageJson(fs, '/node_modules/test')).toEqual(jasmine.objectContaining({
          module_ivy_ngcc: '__ivy_ngcc__/esm5.js',
        }));

        fileWriter.writeBundle(
            esm2015bundle,
            [
              {
                path: _('/node_modules/test/es2015/foo.js'),
                contents: 'export class FooTop {} // MODIFIED'
              },
            ],
            ['es2015']);
        expect(loadPackageJson(fs, '/node_modules/test')).toEqual(jasmine.objectContaining({
          module_ivy_ngcc: '__ivy_ngcc__/esm5.js',
          es2015_ivy_ngcc: '__ivy_ngcc__/es2015/index.js',
        }));
      });

      it('should be able to update multiple package.json properties at once', () => {
        fileWriter.writeBundle(
            esm5bundle,
            [
              {
                path: _('/node_modules/test/esm5.js'),
                contents: 'export function FooTop() {} // MODIFIED'
              },
            ],
            ['module', 'fesm5']);
        expect(loadPackageJson(fs, '/node_modules/test')).toEqual(jasmine.objectContaining({
          module_ivy_ngcc: '__ivy_ngcc__/esm5.js',
          fesm5_ivy_ngcc: '__ivy_ngcc__/esm5.js',
        }));

        fileWriter.writeBundle(
            esm2015bundle,
            [
              {
                path: _('/node_modules/test/es2015/foo.js'),
                contents: 'export class FooTop {} // MODIFIED'
              },
            ],
            ['es2015', 'fesm2015']);
        expect(loadPackageJson(fs, '/node_modules/test')).toEqual(jasmine.objectContaining({
          module_ivy_ngcc: '__ivy_ngcc__/esm5.js',
          fesm5_ivy_ngcc: '__ivy_ngcc__/esm5.js',
          es2015_ivy_ngcc: '__ivy_ngcc__/es2015/index.js',
          fesm2015_ivy_ngcc: '__ivy_ngcc__/es2015/index.js',
        }));
      });

      it('should overwrite and backup typings files', () => {
        fileWriter.writeBundle(
            esm2015bundle,
            [
              {
                path: _('/node_modules/test/index.d.ts'),
                contents: 'export declare class FooTop {} // MODIFIED'
              },
              {path: _('/node_modules/test/index.d.ts.map'), contents: 'MODIFIED MAPPING DATA'},
            ],
            ['es2015']);
        expect(fs.readFile(_('/node_modules/test/index.d.ts')))
            .toEqual('export declare class FooTop {} // MODIFIED');
        expect(fs.readFile(_('/node_modules/test/index.d.ts.__ivy_ngcc_bak')))
            .toEqual('export declare class FooTop {}');
        expect(fs.exists(_('/node_modules/test/__ivy_ngcc__/index.d.ts'))).toBe(false);

        expect(fs.readFile(_('/node_modules/test/index.d.ts.map')))
            .toEqual('MODIFIED MAPPING DATA');
        expect(fs.readFile(_('/node_modules/test/index.d.ts.map.__ivy_ngcc_bak')))
            .toEqual('ORIGINAL MAPPING DATA');
        expect(fs.exists(_('/node_modules/test/__ivy_ngcc__/index.d.ts.map'))).toBe(false);
      });
    });

    describe('writeBundle() [secondary entry-point]', () => {
      beforeEach(() => {
        fileWriter = new NewEntryPointFileWriter(
            fs, logger, /* errorOnFailedEntryPoint */ true, new DirectPackageJsonUpdater(fs));
        const config = new NgccConfiguration(fs, _('/'));
        const result = getEntryPointInfo(
            fs, config, logger, _('/node_modules/test'), _('/node_modules/test/a'))!;
        if (!isEntryPoint(result)) {
          return fail(`Expected an entry point but got ${result}`);
        }
        entryPoint = result;
        esm5bundle = makeTestBundle(fs, entryPoint, 'module', 'esm5');
        esm2015bundle = makeTestBundle(fs, entryPoint, 'es2015', 'esm2015');
      });

      it('should write the modified file to a new folder', () => {
        fileWriter.writeBundle(
            esm5bundle,
            [
              {
                path: _('/node_modules/test/a/esm5.js'),
                contents: 'export function FooA() {} // MODIFIED'
              },
            ],
            ['module']);
        expect(fs.readFile(_('/node_modules/test/__ivy_ngcc__/a/esm5.js')))
            .toEqual('export function FooA() {} // MODIFIED');
        expect(fs.readFile(_('/node_modules/test/a/esm5.js'))).toEqual('export function FooA() {}');
      });

      it('should also copy unmodified files in the program', () => {
        fileWriter.writeBundle(
            esm2015bundle,
            [
              {
                path: _('/node_modules/test/a/es2015/foo.js'),
                contents: 'export class FooA {} // MODIFIED'
              },
            ],
            ['es2015']);
        expect(fs.readFile(_('/node_modules/test/__ivy_ngcc__/a/es2015/foo.js')))
            .toEqual('export class FooA {} // MODIFIED');
        expect(fs.readFile(_('/node_modules/test/a/es2015/foo.js')))
            .toEqual('export class FooA {}');
        expect(fs.readFile(_('/node_modules/test/__ivy_ngcc__/a/es2015/index.js')))
            .toEqual('export {FooA} from "./foo";');
        expect(fs.readFile(_('/node_modules/test/a/es2015/index.js')))
            .toEqual('export {FooA} from "./foo";');
      });

      it('should update the package.json properties', () => {
        fileWriter.writeBundle(
            esm5bundle,
            [
              {
                path: _('/node_modules/test/a/esm5.js'),
                contents: 'export function FooA() {} // MODIFIED'
              },
            ],
            ['module']);
        expect(loadPackageJson(fs, '/node_modules/test/a')).toEqual(jasmine.objectContaining({
          module_ivy_ngcc: '../__ivy_ngcc__/a/esm5.js',
        }));

        fileWriter.writeBundle(
            esm2015bundle,
            [
              {
                path: _('/node_modules/test/a/es2015/foo.js'),
                contents: 'export class FooA {} // MODIFIED'
              },
            ],
            ['es2015']);
        expect(loadPackageJson(fs, '/node_modules/test/a')).toEqual(jasmine.objectContaining({
          module_ivy_ngcc: '../__ivy_ngcc__/a/esm5.js',
          es2015_ivy_ngcc: '../__ivy_ngcc__/a/es2015/index.js',
        }));
      });

      it('should be able to update multiple package.json properties at once', () => {
        fileWriter.writeBundle(
            esm5bundle,
            [
              {
                path: _('/node_modules/test/a/esm5.js'),
                contents: 'export function FooA() {} // MODIFIED'
              },
            ],
            ['module', 'fesm5']);
        expect(loadPackageJson(fs, '/node_modules/test/a')).toEqual(jasmine.objectContaining({
          module_ivy_ngcc: '../__ivy_ngcc__/a/esm5.js',
          fesm5_ivy_ngcc: '../__ivy_ngcc__/a/esm5.js',
        }));

        fileWriter.writeBundle(
            esm2015bundle,
            [
              {
                path: _('/node_modules/test/a/es2015/foo.js'),
                contents: 'export class FooA {} // MODIFIED'
              },
            ],
            ['es2015', 'fesm2015']);
        expect(loadPackageJson(fs, '/node_modules/test/a')).toEqual(jasmine.objectContaining({
          module_ivy_ngcc: '../__ivy_ngcc__/a/esm5.js',
          fesm5_ivy_ngcc: '../__ivy_ngcc__/a/esm5.js',
          es2015_ivy_ngcc: '../__ivy_ngcc__/a/es2015/index.js',
          fesm2015_ivy_ngcc: '../__ivy_ngcc__/a/es2015/index.js',
        }));
      });

      it('should overwrite and backup typings files', () => {
        fileWriter.writeBundle(
            esm2015bundle,
            [
              {
                path: _('/node_modules/test/a/index.d.ts'),
                contents: 'export declare class FooA {} // MODIFIED'
              },
            ],
            ['es2015']);
        expect(fs.readFile(_('/node_modules/test/a/index.d.ts')))
            .toEqual('export declare class FooA {} // MODIFIED');
        expect(fs.readFile(_('/node_modules/test/a/index.d.ts.__ivy_ngcc_bak')))
            .toEqual('export declare class FooA {}');
        expect(fs.exists(_('/node_modules/test/__ivy_ngcc__/a/index.d.ts'))).toBe(false);
      });
    });

    describe('writeBundle() [entry-point (with files placed outside entry-point folder)]', () => {
      beforeEach(() => {
        fileWriter = new NewEntryPointFileWriter(
            fs, logger, /* errorOnFailedEntryPoint */ true, new DirectPackageJsonUpdater(fs));
        const config = new NgccConfiguration(fs, _('/'));
        const result = getEntryPointInfo(
            fs, config, new MockLogger(), _('/node_modules/test'), _('/node_modules/test/b'))!;
        if (!isEntryPoint(result)) {
          return fail(`Expected an entry point but got ${result}`);
        }
        entryPoint = result;
        esm5bundle = makeTestBundle(fs, entryPoint, 'module', 'esm5');
        esm2015bundle = makeTestBundle(fs, entryPoint, 'es2015', 'esm2015');
      });

      it('should write the modified file to a new folder', () => {
        fileWriter.writeBundle(
            esm5bundle,
            [
              {
                path: _('/node_modules/test/lib/esm5.js'),
                contents: 'export function FooB() {} // MODIFIED'
              },
            ],
            ['module']);
        expect(fs.readFile(_('/node_modules/test/__ivy_ngcc__/lib/esm5.js')))
            .toEqual('export function FooB() {} // MODIFIED');
        expect(fs.readFile(_('/node_modules/test/lib/esm5.js')))
            .toEqual('export function FooB() {}');
      });

      it('should also copy unmodified files in the program', () => {
        fileWriter.writeBundle(
            esm2015bundle,
            [
              {
                path: _('/node_modules/test/lib/es2015/foo.js'),
                contents: 'export class FooB {} // MODIFIED'
              },
            ],
            ['es2015']);
        expect(fs.readFile(_('/node_modules/test/__ivy_ngcc__/lib/es2015/foo.js')))
            .toEqual('export class FooB {} // MODIFIED');
        expect(fs.readFile(_('/node_modules/test/lib/es2015/foo.js')))
            .toEqual('import {FooA} from "test/a"; import "events"; export class FooB {}');
        expect(fs.readFile(_('/node_modules/test/__ivy_ngcc__/lib/es2015/index.js')))
            .toEqual('export {FooB} from "./foo"; import * from "other";');
        expect(fs.readFile(_('/node_modules/test/lib/es2015/index.js')))
            .toEqual('export {FooB} from "./foo"; import * from "other";');
      });

      it('should not copy typings files within the package (i.e. from a different entry-point)',
         () => {
           fileWriter.writeBundle(
               esm2015bundle,
               [
                 {
                   path: _('/node_modules/test/lib/es2015/foo.js'),
                   contents: 'export class FooB {} // MODIFIED'
                 },
               ],
               ['es2015']);
           expect(fs.exists(_('/node_modules/test/__ivy_ngcc__/a/index.d.ts'))).toEqual(false);
         });

      it('should not copy files outside of the package', () => {
        fileWriter.writeBundle(
            esm2015bundle,
            [
              {
                path: _('/node_modules/test/lib/es2015/foo.js'),
                contents: 'export class FooB {} // MODIFIED'
              },
            ],
            ['es2015']);
        expect(fs.exists(_('/node_modules/test/other/index.d.ts'))).toEqual(false);
        expect(fs.exists(_('/node_modules/test/events/events.js'))).toEqual(false);
      });

      it('should update the package.json properties', () => {
        fileWriter.writeBundle(
            esm5bundle,
            [
              {
                path: _('/node_modules/test/lib/esm5.js'),
                contents: 'export function FooB() {} // MODIFIED'
              },
            ],
            ['module']);
        expect(loadPackageJson(fs, '/node_modules/test/b')).toEqual(jasmine.objectContaining({
          module_ivy_ngcc: '../__ivy_ngcc__/lib/esm5.js',
        }));

        fileWriter.writeBundle(
            esm2015bundle,
            [
              {
                path: _('/node_modules/test/lib/es2015/foo.js'),
                contents: 'export class FooB {} // MODIFIED'
              },
            ],
            ['es2015']);
        expect(loadPackageJson(fs, '/node_modules/test/b')).toEqual(jasmine.objectContaining({
          module_ivy_ngcc: '../__ivy_ngcc__/lib/esm5.js',
          es2015_ivy_ngcc: '../__ivy_ngcc__/lib/es2015/index.js',
        }));
      });

      it('should overwrite and backup typings files', () => {
        fileWriter.writeBundle(
            esm2015bundle,
            [
              {
                path: _('/node_modules/test/typings/index.d.ts'),
                contents: 'export declare class FooB {} // MODIFIED'
              },
            ],
            ['es2015']);
        expect(fs.readFile(_('/node_modules/test/typings/index.d.ts')))
            .toEqual('export declare class FooB {} // MODIFIED');
        expect(fs.readFile(_('/node_modules/test/typings/index.d.ts.__ivy_ngcc_bak')))
            .toEqual('export declare class FooB {}');
        expect(fs.exists(_('/node_modules/test/__ivy_ngcc__/typings/index.d.ts'))).toBe(false);
      });
    });

    describe('revertFile()', () => {
      beforeEach(() => {
        fileWriter = new NewEntryPointFileWriter(
            fs, logger, /* errorOnFailedEntryPoint */ true, new DirectPackageJsonUpdater(fs));
        const config = new NgccConfiguration(fs, _('/'));
        const result = getEntryPointInfo(
            fs, config, logger, _('/node_modules/test'), _('/node_modules/test'))!;
        if (!isEntryPoint(result)) {
          return fail(`Expected an entry point but got ${result}`);
        }
        entryPoint = result;
        esm5bundle = makeTestBundle(fs, entryPoint, 'module', 'esm5');
      });

      it('should remove non-typings files', () => {
        fileWriter.writeBundle(
            esm5bundle,
            [
              {
                path: _('/node_modules/test/esm5.js'),
                contents: 'export function FooTop() {} // MODIFIED',
              },
              {
                path: _('/node_modules/test/esm5.js.map'),
                contents: 'MODIFIED MAPPING DATA',
              },
              // Normally there will be no backup file. Write one here to ensure it is not removed.
              {
                path: _('/node_modules/test/esm5.js.__ivy_ngcc_bak'),
                contents: 'NOT AN ACTUAL BACKUP',
              },
            ],
            ['module']);

        expect(fs.exists(_('/node_modules/test/__ivy_ngcc__/esm5.js'))).toBeTrue();
        expect(fs.exists(_('/node_modules/test/__ivy_ngcc__/esm5.js.map'))).toBeTrue();
        expect(fs.exists(_('/node_modules/test/__ivy_ngcc__/esm5.js.__ivy_ngcc_bak'))).toBeTrue();

        fileWriter.revertBundle(
            esm5bundle.entryPoint,
            [_('/node_modules/test/esm5.js'), _('/node_modules/test/esm5.js.map')], []);

        expect(fs.exists(_('/node_modules/test/__ivy_ngcc__/esm5.js'))).toBeFalse();
        expect(fs.exists(_('/node_modules/test/__ivy_ngcc__/esm5.js.map'))).toBeFalse();
        expect(fs.exists(_('/node_modules/test/__ivy_ngcc__/esm5.js.__ivy_ngcc_bak'))).toBeTrue();
      });

      it('should revert written typings files (and their backups)', () => {
        fileWriter.writeBundle(
            esm5bundle,
            [
              {
                path: _('/node_modules/test/index.d.ts'),
                contents: 'export declare class FooTop {} // MODIFIED'
              },
              {
                path: _('/node_modules/test/index.d.ts.map'),
                contents: 'MODIFIED MAPPING DATA',
              },
            ],
            ['module']);

        expect(fs.readFile(_('/node_modules/test/index.d.ts')))
            .toBe('export declare class FooTop {} // MODIFIED');
        expect(fs.readFile(_('/node_modules/test/index.d.ts.__ivy_ngcc_bak')))
            .toBe('export declare class FooTop {}');
        expect(fs.readFile(_('/node_modules/test/index.d.ts.map'))).toBe('MODIFIED MAPPING DATA');
        expect(fs.readFile(_('/node_modules/test/index.d.ts.map.__ivy_ngcc_bak')))
            .toBe('ORIGINAL MAPPING DATA');

        fileWriter.revertBundle(
            esm5bundle.entryPoint,
            [_('/node_modules/test/index.d.ts'), _('/node_modules/test/index.d.ts.map')], []);

        expect(fs.readFile(_('/node_modules/test/index.d.ts')))
            .toBe('export declare class FooTop {}');
        expect(fs.exists(_('/node_modules/test/index.d.ts.__ivy_ngcc_bak'))).toBeFalse();
        expect(fs.readFile(_('/node_modules/test/index.d.ts.map'))).toBe('ORIGINAL MAPPING DATA');
        expect(fs.exists(_('/node_modules/test/index.d.ts.map.__ivy_ngcc_bak'))).toBeFalse();
      });

      it('should revert changes to `package.json`', () => {
        const entryPoint = esm5bundle.entryPoint;
        const packageJsonPath = fs.join(entryPoint.packagePath, 'package.json');

        fileWriter.writeBundle(
            esm5bundle,
            [
              {
                path: _('/node_modules/test/index.d.ts'),
                contents: 'export declare class FooTop {} // MODIFIED'
              },
              {
                path: _('/node_modules/test/index.d.ts.map'),
                contents: 'MODIFIED MAPPING DATA',
              },
            ],
            ['fesm5', 'module']);
        const packageJsonFromFile1 =
            JSON.parse(fs.readFile(packageJsonPath)) as NewEntryPointPropertiesMap;

        expect(entryPoint.packageJson).toEqual(jasmine.objectContaining({
          fesm5_ivy_ngcc: '__ivy_ngcc__/esm5.js',
          fesm5: './esm5.js',
          module_ivy_ngcc: '__ivy_ngcc__/esm5.js',
          module: './esm5.js',
        }));

        expect(packageJsonFromFile1).toEqual(jasmine.objectContaining({
          fesm5_ivy_ngcc: '__ivy_ngcc__/esm5.js',
          fesm5: './esm5.js',
          module_ivy_ngcc: '__ivy_ngcc__/esm5.js',
          module: './esm5.js',
        }));

        fileWriter.revertBundle(
            esm5bundle.entryPoint,
            [_('/node_modules/test/index.d.ts'), _('/node_modules/test/index.d.ts.map')],
            ['fesm5', 'module']);
        const packageJsonFromFile2 =
            JSON.parse(fs.readFile(packageJsonPath)) as NewEntryPointPropertiesMap;

        expect(entryPoint.packageJson).toEqual(jasmine.objectContaining({
          fesm5: './esm5.js',
          module: './esm5.js',
        }));
        expect(entryPoint.packageJson.fesm5_ivy_ngcc).toBeUndefined();
        expect(entryPoint.packageJson.module_ivy_ngcc).toBeUndefined();

        expect(packageJsonFromFile2).toEqual(jasmine.objectContaining({
          fesm5: './esm5.js',
          module: './esm5.js',
        }));
        expect(packageJsonFromFile2.fesm5_ivy_ngcc).toBeUndefined();
        expect(packageJsonFromFile2.module_ivy_ngcc).toBeUndefined();
      });
    });
  });

  function makeTestBundle(
      fs: FileSystem, entryPoint: EntryPoint, formatProperty: EntryPointJsonProperty,
      format: EntryPointFormat): EntryPointBundle {
    const moduleResolutionCache = createModuleResolutionCache(fs);
    return makeEntryPointBundle(
        fs, entryPoint, new SharedFileCache(fs), moduleResolutionCache,
        entryPoint.packageJson[formatProperty]!, false, format, DtsProcessing.Yes);
  }
});
