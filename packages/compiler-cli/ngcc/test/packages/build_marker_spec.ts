/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../test/helpers';
import {hasBeenProcessed, markAsProcessed} from '../../src/packages/build_marker';

runInEachFileSystem(() => {
  describe('Marker files', () => {
    let _: typeof absoluteFrom;
    beforeEach(() => {
      _ = absoluteFrom;
      loadTestFiles([
        {
          name: _('/node_modules/@angular/common/package.json'),
          contents:
              `{"fesm2015": "./fesm2015/common.js", "fesm5": "./fesm5/common.js", "typings": "./common.d.ts"}`
        },
        {name: _('/node_modules/@angular/common/fesm2015/common.js'), contents: 'DUMMY CONTENT'},
        {name: _('/node_modules/@angular/common/fesm2015/http.js'), contents: 'DUMMY CONTENT'},
        {
          name: _('/node_modules/@angular/common/fesm2015/http/testing.js'),
          contents: 'DUMMY CONTENT'
        },
        {name: _('/node_modules/@angular/common/fesm2015/testing.js'), contents: 'DUMMY CONTENT'},
        {
          name: _('/node_modules/@angular/common/http/package.json'),
          contents:
              `{"fesm2015": "../fesm2015/http.js", "fesm5": "../fesm5/http.js", "typings": "./http.d.ts"}`
        },
        {
          name: _('/node_modules/@angular/common/http/testing/package.json'),
          contents:
              `{"fesm2015": "../../fesm2015/http/testing.js", "fesm5": "../../fesm5/http/testing.js", "typings": "../http/testing.d.ts" }`
        },
        {name: _('/node_modules/@angular/common/other/package.json'), contents: '{ }'},
        {
          name: _('/node_modules/@angular/common/testing/package.json'),
          contents:
              `{"fesm2015": "../fesm2015/testing.js", "fesm5": "../fesm5/testing.js", "typings": "../testing.d.ts"}`
        },
        {name: _('/node_modules/@angular/common/node_modules/tslib/package.json'), contents: '{ }'},
        {
          name: _(
              '/node_modules/@angular/common/node_modules/tslib/node_modules/other-lib/package.json'),
          contents: '{ }'
        },
        {
          name: _('/node_modules/@angular/no-typings/package.json'),
          contents: `{ "fesm2015": "./fesm2015/index.js" }`
        },
        {name: _('/node_modules/@angular/no-typings/fesm2015/index.js'), contents: 'DUMMY CONTENT'},
        {
          name: _('/node_modules/@angular/no-typings/fesm2015/index.d.ts'),
          contents: 'DUMMY CONTENT'
        },
        {
          name: _('/node_modules/@angular/other/not-package.json'),
          contents: '{ "fesm2015": "./fesm2015/other.js" }'
        },
        {
          name: _('/node_modules/@angular/other/package.jsonot'),
          contents: '{ "fesm5": "./fesm5/other.js" }'
        },
        {
          name: _('/node_modules/@angular/other2/node_modules_not/lib1/package.json'),
          contents: '{ }'
        },
        {
          name: _('/node_modules/@angular/other2/not_node_modules/lib2/package.json'),
          contents: '{ }'
        },
      ]);
    });

    describe('markAsProcessed', () => {
      it('should write properties in the package.json containing the version placeholder', () => {
        const COMMON_PACKAGE_PATH = _('/node_modules/@angular/common/package.json');
        const fs = getFileSystem();
        let pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH));
        expect(pkg.__processed_by_ivy_ngcc__).toBeUndefined();
        expect(pkg.scripts).toBeUndefined();

        markAsProcessed(fs, pkg, COMMON_PACKAGE_PATH, ['fesm2015', 'fesm5']);
        pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH));
        expect(pkg.__processed_by_ivy_ngcc__.fesm2015).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__.fesm5).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__.esm2015).toBeUndefined();
        expect(pkg.__processed_by_ivy_ngcc__.esm5).toBeUndefined();
        expect(pkg.scripts.prepublishOnly).toBeDefined();

        markAsProcessed(fs, pkg, COMMON_PACKAGE_PATH, ['esm2015', 'esm5']);
        pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH));
        expect(pkg.__processed_by_ivy_ngcc__.fesm2015).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__.fesm5).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__.esm2015).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__.esm5).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.scripts.prepublishOnly).toBeDefined();
      });

      it('should update the packageJson object in-place', () => {
        const COMMON_PACKAGE_PATH = _('/node_modules/@angular/common/package.json');
        const fs = getFileSystem();
        const pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH));
        expect(pkg.__processed_by_ivy_ngcc__).toBeUndefined();
        expect(pkg.scripts).toBeUndefined();

        markAsProcessed(fs, pkg, COMMON_PACKAGE_PATH, ['fesm2015', 'fesm5']);
        expect(pkg.__processed_by_ivy_ngcc__.fesm2015).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__.fesm5).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__.esm2015).toBeUndefined();
        expect(pkg.__processed_by_ivy_ngcc__.esm5).toBeUndefined();
        expect(pkg.scripts.prepublishOnly).toBeDefined();

        markAsProcessed(fs, pkg, COMMON_PACKAGE_PATH, ['esm2015', 'esm5']);
        expect(pkg.__processed_by_ivy_ngcc__.fesm2015).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__.fesm5).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__.esm2015).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__.esm5).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.scripts.prepublishOnly).toBeDefined();
      });

      it('should one perform one write operation for all updated properties', () => {
        const COMMON_PACKAGE_PATH = _('/node_modules/@angular/common/package.json');
        const fs = getFileSystem();
        const writeFileSpy = spyOn(fs, 'writeFile');
        let pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH));

        markAsProcessed(fs, pkg, COMMON_PACKAGE_PATH, ['fesm2015', 'fesm5', 'esm2015', 'esm5']);
        expect(writeFileSpy).toHaveBeenCalledTimes(1);
      });

      it(`should keep backup of existing 'prepublishOnly' script`, () => {
        const COMMON_PACKAGE_PATH = _('/node_modules/@angular/common/package.json');
        const fs = getFileSystem();
        const prepublishOnly = 'existing script';
        let pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH));
        pkg.scripts = {prepublishOnly};

        markAsProcessed(fs, pkg, COMMON_PACKAGE_PATH, ['fesm2015']);
        pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH));
        expect(pkg.scripts.prepublishOnly).toContain('This is not allowed');
        expect(pkg.scripts.prepublishOnly__ivy_ngcc_bak).toBe(prepublishOnly);
      });

      it(`should not keep backup of overwritten 'prepublishOnly' script`, () => {
        const COMMON_PACKAGE_PATH = _('/node_modules/@angular/common/package.json');
        const fs = getFileSystem();
        let pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH));

        markAsProcessed(fs, pkg, COMMON_PACKAGE_PATH, ['fesm2015']);

        pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH));
        expect(pkg.scripts.prepublishOnly).toContain('This is not allowed');
        expect(pkg.scripts.prepublishOnly__ivy_ngcc_bak).toBeUndefined();

        // Running again, now that there is `prepublishOnly` script (created by `ngcc`), it should
        // still not back it up as `prepublishOnly__ivy_ngcc_bak`.
        markAsProcessed(fs, pkg, COMMON_PACKAGE_PATH, ['fesm2015']);

        pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH));
        expect(pkg.scripts.prepublishOnly).toContain('This is not allowed');
        expect(pkg.scripts.prepublishOnly__ivy_ngcc_bak).toBeUndefined();
      });
    });

    describe('hasBeenProcessed', () => {
      let entryPointPath: AbsoluteFsPath;

      beforeEach(() => entryPointPath = _('/node_modules/test'));

      it('should return true if the marker exists for the given format property', () => {
        expect(hasBeenProcessed(
                   {name: 'test', __processed_by_ivy_ngcc__: {'fesm2015': '0.0.0-PLACEHOLDER'}},
                   'fesm2015', entryPointPath))
            .toBe(true);
      });
      it('should return false if the marker does not exist for the given format property', () => {
        expect(hasBeenProcessed(
                   {name: 'test', __processed_by_ivy_ngcc__: {'fesm2015': '0.0.0-PLACEHOLDER'}},
                   'module', entryPointPath))
            .toBe(false);
      });
      it('should return false if no markers exist',
         () => { expect(hasBeenProcessed({name: 'test'}, 'module', entryPointPath)).toBe(false); });
      it('should throw an Error if the format has been compiled with a different version.', () => {
        expect(
            () => hasBeenProcessed(
                {name: 'test', __processed_by_ivy_ngcc__: {'fesm2015': '8.0.0'}}, 'fesm2015',
                entryPointPath))
            .toThrowError(
                'The ngcc compiler has changed since the last ngcc build.\n' +
                `Please completely remove the "node_modules" folder containing "${entryPointPath}" and try again.`);
      });
      it('should throw an Error if any format has been compiled with a different version.', () => {
        expect(
            () => hasBeenProcessed(
                {name: 'test', __processed_by_ivy_ngcc__: {'fesm2015': '8.0.0'}}, 'module',
                entryPointPath))
            .toThrowError(
                'The ngcc compiler has changed since the last ngcc build.\n' +
                `Please completely remove the "node_modules" folder containing "${entryPointPath}" and try again.`);
        expect(
            () => hasBeenProcessed(
                {
                  name: 'test',
                  __processed_by_ivy_ngcc__: {'module': '0.0.0-PLACEHOLDER', 'fesm2015': '8.0.0'}
                },
                'module', entryPointPath))
            .toThrowError(
                'The ngcc compiler has changed since the last ngcc build.\n' +
                `Please completely remove the "node_modules" folder containing "${entryPointPath}" and try again.`);
        expect(
            () => hasBeenProcessed(
                {
                  name: 'test',
                  __processed_by_ivy_ngcc__: {'module': '0.0.0-PLACEHOLDER', 'fesm2015': '8.0.0'}
                },
                'fesm2015', entryPointPath))
            .toThrowError(
                'The ngcc compiler has changed since the last ngcc build.\n' +
                `Please completely remove the "node_modules" folder containing "${entryPointPath}" and try again.`);
      });
    });
  });
});
