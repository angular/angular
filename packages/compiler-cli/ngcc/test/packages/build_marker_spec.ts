/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {cleanPackageJson, hasBeenProcessed, markAsProcessed, needsCleaning, NGCC_VERSION} from '../../src/packages/build_marker';
import {EntryPointPackageJson} from '../../src/packages/entry_point';
import {DirectPackageJsonUpdater} from '../../src/writing/package_json_updater';

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
        const pkgUpdater = new DirectPackageJsonUpdater(fs);
        // TODO: Determine the correct/best type for the `pkg` type.
        let pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH)) as EntryPointPackageJson;
        expect(pkg.__processed_by_ivy_ngcc__).toBeUndefined();
        expect(pkg.scripts).toBeUndefined();

        markAsProcessed(pkgUpdater, pkg, COMMON_PACKAGE_PATH, ['fesm2015', 'fesm5']);
        pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH)) as EntryPointPackageJson;
        expect(pkg.__processed_by_ivy_ngcc__!.fesm2015).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__!.fesm5).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__!.esm2015).toBeUndefined();
        expect(pkg.__processed_by_ivy_ngcc__!.esm5).toBeUndefined();
        expect(pkg.scripts!.prepublishOnly).toBeDefined();

        markAsProcessed(pkgUpdater, pkg, COMMON_PACKAGE_PATH, ['esm2015', 'esm5']);
        pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH)) as EntryPointPackageJson;
        expect(pkg.__processed_by_ivy_ngcc__!.fesm2015).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__!.fesm5).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__!.esm2015).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__!.esm5).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.scripts!.prepublishOnly).toBeDefined();
      });

      it('should update the packageJson object in-place', () => {
        const COMMON_PACKAGE_PATH = _('/node_modules/@angular/common/package.json');
        const fs = getFileSystem();
        const pkgUpdater = new DirectPackageJsonUpdater(fs);
        const pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH)) as EntryPointPackageJson;
        expect(pkg.__processed_by_ivy_ngcc__).toBeUndefined();
        expect(pkg.scripts).toBeUndefined();

        markAsProcessed(pkgUpdater, pkg, COMMON_PACKAGE_PATH, ['fesm2015', 'fesm5']);
        expect(pkg.__processed_by_ivy_ngcc__!.fesm2015).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__!.fesm5).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__!.esm2015).toBeUndefined();
        expect(pkg.__processed_by_ivy_ngcc__!.esm5).toBeUndefined();
        expect(pkg.scripts!.prepublishOnly).toBeDefined();

        markAsProcessed(pkgUpdater, pkg, COMMON_PACKAGE_PATH, ['esm2015', 'esm5']);
        expect(pkg.__processed_by_ivy_ngcc__!.fesm2015).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__!.fesm5).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__!.esm2015).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.__processed_by_ivy_ngcc__!.esm5).toBe('0.0.0-PLACEHOLDER');
        expect(pkg.scripts!.prepublishOnly).toBeDefined();
      });

      it('should one perform one write operation for all updated properties', () => {
        const COMMON_PACKAGE_PATH = _('/node_modules/@angular/common/package.json');
        const fs = getFileSystem();
        const pkgUpdater = new DirectPackageJsonUpdater(fs);
        const writeFileSpy = spyOn(fs, 'writeFile');
        let pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH)) as EntryPointPackageJson;

        markAsProcessed(
            pkgUpdater, pkg, COMMON_PACKAGE_PATH, ['fesm2015', 'fesm5', 'esm2015', 'esm5']);
        expect(writeFileSpy).toHaveBeenCalledTimes(1);
      });

      it(`should keep backup of existing 'prepublishOnly' script`, () => {
        const COMMON_PACKAGE_PATH = _('/node_modules/@angular/common/package.json');
        const fs = getFileSystem();
        const pkgUpdater = new DirectPackageJsonUpdater(fs);
        const prepublishOnly = 'existing script';
        let pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH)) as EntryPointPackageJson;
        pkg.scripts = {prepublishOnly};

        markAsProcessed(pkgUpdater, pkg, COMMON_PACKAGE_PATH, ['fesm2015']);
        pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH)) as EntryPointPackageJson;
        expect(pkg.scripts!.prepublishOnly).toContain('This is not allowed');
        expect(pkg.scripts!.prepublishOnly__ivy_ngcc_bak).toBe(prepublishOnly);
      });

      it(`should not keep backup of overwritten 'prepublishOnly' script`, () => {
        const COMMON_PACKAGE_PATH = _('/node_modules/@angular/common/package.json');
        const fs = getFileSystem();
        const pkgUpdater = new DirectPackageJsonUpdater(fs);
        let pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH)) as EntryPointPackageJson;

        markAsProcessed(pkgUpdater, pkg, COMMON_PACKAGE_PATH, ['fesm2015']);

        pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH)) as EntryPointPackageJson;
        expect(pkg.scripts!.prepublishOnly).toContain('This is not allowed');
        expect(pkg.scripts!.prepublishOnly__ivy_ngcc_bak).toBeUndefined();

        // Running again, now that there is `prepublishOnly` script (created by `ngcc`), it should
        // still not back it up as `prepublishOnly__ivy_ngcc_bak`.
        markAsProcessed(pkgUpdater, pkg, COMMON_PACKAGE_PATH, ['fesm2015']);

        pkg = JSON.parse(fs.readFile(COMMON_PACKAGE_PATH)) as EntryPointPackageJson;
        expect(pkg.scripts!.prepublishOnly).toContain('This is not allowed');
        expect(pkg.scripts!.prepublishOnly__ivy_ngcc_bak).toBeUndefined();
      });
    });

    describe('hasBeenProcessed', () => {
      it('should return true if the marker exists for the given format property', () => {
        expect(hasBeenProcessed(
                   {name: 'test', __processed_by_ivy_ngcc__: {'fesm2015': '0.0.0-PLACEHOLDER'}},
                   'fesm2015'))
            .toBe(true);
      });

      it('should return false if the marker does not exist for the given format property', () => {
        expect(hasBeenProcessed(
                   {name: 'test', __processed_by_ivy_ngcc__: {'fesm2015': '0.0.0-PLACEHOLDER'}},
                   'module'))
            .toBe(false);
      });

      it('should return false if no markers exist', () => {
        expect(hasBeenProcessed({name: 'test'}, 'module')).toBe(false);
      });
    });

    describe('needsCleaning()', () => {
      it('should return true if any format has been compiled with a different version', () => {
        expect(needsCleaning({
          name: 'test',
          __processed_by_ivy_ngcc__: {'fesm2015': '8.0.0', 'esm5': NGCC_VERSION}
        })).toBe(true);
      });

      it('should return false if all formats have been compiled with the current version', () => {
        expect(needsCleaning({name: 'test', __processed_by_ivy_ngcc__: {'fesm2015': NGCC_VERSION}}))
            .toBe(false);
      });

      it('should return false if no formats have been compiled', () => {
        expect(needsCleaning({name: 'test', __processed_by_ivy_ngcc__: {}})).toBe(false);
        expect(needsCleaning({name: 'test'})).toBe(false);
      });
    });

    describe('cleanPackageJson()', () => {
      it('should not touch the object if there is no build marker', () => {
        const packageJson: EntryPointPackageJson = {name: 'test-package'};
        const result = cleanPackageJson(packageJson);
        expect(result).toBe(false);
        expect(packageJson).toEqual({name: 'test-package'});
      });

      it('should remove the processed marker', () => {
        const packageJson: EntryPointPackageJson = {
          name: 'test-package',
          __processed_by_ivy_ngcc__: {'fesm2015': '8.0.0'}
        };
        const result = cleanPackageJson(packageJson);
        expect(result).toBe(true);
        expect(packageJson).toEqual({name: 'test-package'});
      });

      it('should remove new entry-point format properties', () => {
        const packageJson: EntryPointPackageJson = {
          name: 'test-package',
          __processed_by_ivy_ngcc__: {'fesm2015': '8.0.0'},
          fesm2015: 'index.js',
          fesm2015_ivy_ngcc: '__ivy_ngcc__/index.js'
        };
        const result = cleanPackageJson(packageJson);
        expect(result).toBe(true);
        expect(packageJson).toEqual({name: 'test-package', fesm2015: 'index.js'});
      });

      it('should remove the prepublish script if there was a processed marker', () => {
        const packageJson: EntryPointPackageJson = {
          name: 'test-package',
          __processed_by_ivy_ngcc__: {'fesm2015': '8.0.0'},
          scripts: {prepublishOnly: 'added by ngcc', test: 'do testing'},
        };
        const result = cleanPackageJson(packageJson);
        expect(result).toBe(true);
        expect(packageJson).toEqual({
          name: 'test-package',
          scripts: {test: 'do testing'},
        });
      });

      it('should revert and remove the backup for the prepublish script if there was a processed marker',
         () => {
           const packageJson: EntryPointPackageJson = {
             name: 'test-package',
             __processed_by_ivy_ngcc__: {'fesm2015': '8.0.0'},
             scripts: {
               prepublishOnly: 'added by ngcc',
               prepublishOnly__ivy_ngcc_bak: 'original',
               test: 'do testing'
             },
           };
           const result = cleanPackageJson(packageJson);
           expect(result).toBe(true);
           expect(packageJson).toEqual({
             name: 'test-package',
             scripts: {prepublishOnly: 'original', test: 'do testing'},
           });
         });

      it('should not touch the scripts if there was no processed marker', () => {
        const packageJson: EntryPointPackageJson = {
          name: 'test-package',
          scripts: {
            prepublishOnly: 'added by ngcc',
            prepublishOnly__ivy_ngcc_bak: 'original',
            test: 'do testing'
          },
        };
        const result = cleanPackageJson(packageJson);
        expect(result).toBe(false);
        expect(packageJson).toEqual({
          name: 'test-package',
          scripts: {
            prepublishOnly: 'added by ngcc',
            prepublishOnly__ivy_ngcc_bak: 'original',
            test: 'do testing'
          }
        });
      });
    });
  });
});
