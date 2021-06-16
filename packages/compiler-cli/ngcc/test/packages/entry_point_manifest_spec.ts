/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {createHash} from 'crypto';

import {absoluteFrom, FileSystem, getFileSystem, relativeFrom} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {MockLogger} from '../../../src/ngtsc/logging/testing';
import {loadTestFiles} from '../../../src/ngtsc/testing';
import {EntryPointWithDependencies} from '../../src/dependencies/dependency_host';
import {NGCC_VERSION} from '../../src/packages/build_marker';
import {NgccConfiguration, ProcessedNgccPackageConfig} from '../../src/packages/configuration';
import {EntryPointManifest, EntryPointManifestFile} from '../../src/packages/entry_point_manifest';

import {createPackageJson} from './entry_point_spec';

runInEachFileSystem(() => {
  describe('EntryPointManifest', () => {
    let fs: FileSystem;
    let _Abs: typeof absoluteFrom;
    let config: NgccConfiguration;
    let logger: MockLogger;
    let manifest: EntryPointManifest;

    beforeEach(() => {
      _Abs = absoluteFrom;
      fs = getFileSystem();
      fs.ensureDir(_Abs('/project/node_modules'));
      config = new NgccConfiguration(fs, _Abs('/project'));
      logger = new MockLogger();
      manifest = new EntryPointManifest(fs, config, logger);
    });

    describe('readEntryPointsUsingManifest()', () => {
      let manifestFile: EntryPointManifestFile;
      beforeEach(() => {
        manifestFile = {
          ngccVersion: NGCC_VERSION,
          lockFileHash: createHash('sha256').update('LOCK FILE CONTENTS').digest('hex'),
          configFileHash: config.hash,
          entryPointPaths: []
        };
      });

      it('should return null if the base path is not node_modules', () => {
        fs.ensureDir(_Abs('/project/dist'));
        fs.writeFile(_Abs('/project/yarn.lock'), 'LOCK FILE CONTENTS');
        fs.writeFile(
            _Abs('/project/dist/__ngcc_entry_points__.json'), JSON.stringify(manifestFile));
        const entryPoints = manifest.readEntryPointsUsingManifest(_Abs('/project/dist'));
        expect(entryPoints).toBe(null);
      });

      it('should return null if there is no package lock-file', () => {
        fs.ensureDir(_Abs('/project/node_modules'));
        fs.writeFile(
            _Abs('/project/node_modules/__ngcc_entry_points__.json'), JSON.stringify(manifestFile));
        const entryPoints = manifest.readEntryPointsUsingManifest(_Abs('/project/node_modules'));
        expect(entryPoints).toBe(null);
      });

      it('should return null if there is no manifest file', () => {
        fs.ensureDir(_Abs('/project/node_modules'));
        fs.writeFile(_Abs('/project/yarn.lock'), 'LOCK FILE CONTENTS');
        const entryPoints = manifest.readEntryPointsUsingManifest(_Abs('/project/node_modules'));
        expect(entryPoints).toBe(null);
      });

      it('should return null if the ngcc version does not match', () => {
        fs.ensureDir(_Abs('/project/node_modules'));
        fs.writeFile(_Abs('/project/yarn.lock'), 'LOCK FILE CONTENTS');
        manifestFile.ngccVersion = 'bad-version';
        fs.writeFile(
            _Abs('/project/node_modules/__ngcc_entry_points__.json'), JSON.stringify(manifestFile));
        const entryPoints = manifest.readEntryPointsUsingManifest(_Abs('/project/node_modules'));
        expect(entryPoints).toBe(null);
      });

      it('should return null if the config hash does not match', () => {
        fs.ensureDir(_Abs('/project/node_modules'));
        fs.writeFile(_Abs('/project/yarn.lock'), 'LOCK FILE CONTENTS');
        manifestFile.configFileHash = 'bad-hash';
        fs.writeFile(
            _Abs('/project/node_modules/__ngcc_entry_points__.json'), JSON.stringify(manifestFile));
        const entryPoints = manifest.readEntryPointsUsingManifest(_Abs('/project/node_modules'));
        expect(entryPoints).toBe(null);
      });

      ['yarn.lock', 'package-lock.json'].forEach(packageLockFilePath => {
        it('should return null if the lockfile hash does not match', () => {
          fs.ensureDir(_Abs('/project/node_modules'));
          fs.writeFile(_Abs(`/project/${packageLockFilePath}`), 'LOCK FILE CONTENTS');
          manifestFile.lockFileHash = 'bad-hash';
          fs.writeFile(
              _Abs('/project/node_modules/__ngcc_entry_points__.json'),
              JSON.stringify(manifestFile));
          const entryPoints = manifest.readEntryPointsUsingManifest(_Abs('/project/node_modules'));
          expect(entryPoints).toBe(null);
        });

        it('should return an array of entry-points if all the checks pass', () => {
          fs.ensureDir(_Abs('/project/node_modules'));
          fs.writeFile(_Abs(`/project/${packageLockFilePath}`), 'LOCK FILE CONTENTS');
          fs.writeFile(
              _Abs('/project/node_modules/__ngcc_entry_points__.json'),
              JSON.stringify(manifestFile));
          const entryPoints = manifest.readEntryPointsUsingManifest(_Abs('/project/node_modules'));
          expect(entryPoints).toEqual([]);
        });
      });

      it('should read in all the entry-point info', () => {
        fs.ensureDir(_Abs('/project/node_modules'));
        fs.writeFile(_Abs('/project/yarn.lock'), 'LOCK FILE CONTENTS');
        loadTestFiles([
          {
            name: _Abs('/project/node_modules/some_package/valid_entry_point/package.json'),
            contents: createPackageJson('valid_entry_point')
          },
          {
            name: _Abs(
                '/project/node_modules/some_package/valid_entry_point/valid_entry_point.metadata.json'),
            contents: 'some meta data'
          },
        ]);
        manifestFile.entryPointPaths.push([
          _Abs('/project/node_modules/some_package'),
          _Abs('/project/node_modules/some_package/valid_entry_point'),
          [
            _Abs('/project/node_modules/other_package_1'),
            _Abs('/project/node_modules/other_package_2'),
          ],
          [
            _Abs('/project/node_modules/missing_1'),
            relativeFrom('missing_2'),
          ],
          [
            _Abs('/project/node_modules/deep/import/path'),
          ],
        ]);
        fs.writeFile(
            _Abs('/project/node_modules/__ngcc_entry_points__.json'), JSON.stringify(manifestFile));
        const entryPoints = manifest.readEntryPointsUsingManifest(_Abs('/project/node_modules'));
        expect(entryPoints).toEqual([{
          entryPoint: {
            name: 'some_package/valid_entry_point',
            path: _Abs('/project/node_modules/some_package/valid_entry_point'),
            packageName: 'some_package',
            packagePath: _Abs('/project/node_modules/some_package'),
            packageJson: jasmine.any(Object),
            typings:
                _Abs('/project/node_modules/some_package/valid_entry_point/valid_entry_point.d.ts'),
            compiledByAngular: true,
            ignoreMissingDependencies: false,
            generateDeepReexports: false,
          } as any,
          depInfo: {
            dependencies: new Set([
              _Abs('/project/node_modules/other_package_1'),
              _Abs('/project/node_modules/other_package_2'),
            ]),
            missing: new Set([
              _Abs('/project/node_modules/missing_1'),
              relativeFrom('missing_2'),
            ]),
            deepImports: new Set([
              _Abs('/project/node_modules/deep/import/path'),
            ])
          }
        }]);
      });

      it('should return null if any of the entry-points are not valid', () => {
        fs.ensureDir(_Abs('/project/node_modules'));
        fs.writeFile(_Abs('/project/yarn.lock'), 'LOCK FILE CONTENTS');
        manifestFile.entryPointPaths.push([
          _Abs('/project/node_modules/some_package'),
          _Abs('/project/node_modules/some_package/valid_entry_point'), [], [], []
        ]);
        fs.writeFile(
            _Abs('/project/node_modules/__ngcc_entry_points__.json'), JSON.stringify(manifestFile));
        const entryPoints = manifest.readEntryPointsUsingManifest(_Abs('/project/node_modules'));
        expect(entryPoints).toEqual(null);
      });

      it('should return null if any of the entry-points are ignored by a config', () => {
        fs.ensureDir(_Abs('/project/node_modules'));
        fs.writeFile(_Abs('/project/yarn.lock'), 'LOCK FILE CONTENTS');
        loadTestFiles([
          {
            name: _Abs('/project/node_modules/some_package/valid_entry_point/package.json'),
            contents: createPackageJson('valid_entry_point'),
          },
          {
            name: _Abs(
                '/project/node_modules/some_package/valid_entry_point/valid_entry_point.metadata.json'),
            contents: 'some meta data',
          },
          {
            name: _Abs('/project/node_modules/some_package/ignored_entry_point/package.json'),
            contents: createPackageJson('ignored_entry_point'),
          },
          {
            name: _Abs(
                '/project/node_modules/some_package/ignored_entry_point/ignored_entry_point.metadata.json'),
            contents: 'some meta data',
          },
        ]);
        manifestFile.entryPointPaths.push(
            [
              _Abs('/project/node_modules/some_package'),
              _Abs('/project/node_modules/some_package/valid_entry_point'), [], [], []
            ],
            [
              _Abs('/project/node_modules/some_package'),
              _Abs('/project/node_modules/some_package/ignored_entry_point'), [], [], []
            ],
        );
        fs.writeFile(
            _Abs('/project/node_modules/__ngcc_entry_points__.json'), JSON.stringify(manifestFile));

        spyOn(config, 'getPackageConfig')
            .and.returnValue(
                new ProcessedNgccPackageConfig(fs, _Abs('/project/node_modules/some_package'), {
                  entryPoints: {
                    './ignored_entry_point': {ignore: true},
                  },
                }));

        const entryPoints = manifest.readEntryPointsUsingManifest(_Abs('/project/node_modules'));
        expect(entryPoints).toEqual(null);
      });
    });

    describe('writeEntryPointManifest()', () => {
      it('should do nothing if there is no package lock-file', () => {
        manifest.writeEntryPointManifest(_Abs('/project/node_modules'), []);
        expect(fs.exists(_Abs('/project/node_modules/__ngcc_entry_points__.json'))).toBe(false);
      });

      it('should do nothing if the basePath is not node_modules', () => {
        fs.writeFile(_Abs('/project/yarn.lock'), 'LOCK FILE CONTENTS');
        manifest.writeEntryPointManifest(_Abs('/project/dist'), []);
        expect(fs.exists(_Abs('/project/dist/__ngcc_entry_points__.json'))).toBe(false);
      });

      it('should write an __ngcc_entry_points__.json file below the base path if there is a yarn.lock file',
         () => {
           fs.writeFile(_Abs('/project/yarn.lock'), 'LOCK FILE CONTENTS');
           manifest.writeEntryPointManifest(_Abs('/project/node_modules'), []);
           expect(fs.exists(_Abs('/project/node_modules/__ngcc_entry_points__.json'))).toBe(true);
         });

      it('should write an __ngcc_entry_points__.json file below the base path if there is a package-lock.json file',
         () => {
           fs.writeFile(_Abs('/project/package-lock.json'), 'LOCK FILE CONTENTS');
           manifest.writeEntryPointManifest(_Abs('/project/node_modules'), []);
           expect(fs.exists(_Abs('/project/node_modules/__ngcc_entry_points__.json'))).toBe(true);
         });

      it('should write the ngcc version', () => {
        fs.writeFile(_Abs('/project/yarn.lock'), 'LOCK FILE CONTENTS');
        manifest.writeEntryPointManifest(_Abs('/project/node_modules'), []);
        const file =
            JSON.parse(fs.readFile(_Abs('/project/node_modules/__ngcc_entry_points__.json'))) as
            EntryPointManifestFile;
        expect(file.ngccVersion).toEqual(NGCC_VERSION);
      });

      it('should write a hash of the yarn.lock file', () => {
        fs.writeFile(_Abs('/project/yarn.lock'), 'LOCK FILE CONTENTS');
        manifest.writeEntryPointManifest(_Abs('/project/node_modules'), []);
        const file =
            JSON.parse(fs.readFile(_Abs('/project/node_modules/__ngcc_entry_points__.json'))) as
            EntryPointManifestFile;
        expect(file.lockFileHash)
            .toEqual(createHash('sha256').update('LOCK FILE CONTENTS').digest('hex'));
      });

      it('should write a hash of the package-lock.json file', () => {
        fs.writeFile(_Abs('/project/package-lock.json'), 'LOCK FILE CONTENTS');
        manifest.writeEntryPointManifest(_Abs('/project/node_modules'), []);
        const file =
            JSON.parse(fs.readFile(_Abs('/project/node_modules/__ngcc_entry_points__.json'))) as
            EntryPointManifestFile;
        expect(file.lockFileHash)
            .toEqual(createHash('sha256').update('LOCK FILE CONTENTS').digest('hex'));
      });

      it('should write a hash of the project config', () => {
        fs.writeFile(_Abs('/project/package-lock.json'), 'LOCK FILE CONTENTS');
        manifest.writeEntryPointManifest(_Abs('/project/node_modules'), []);
        const file =
            JSON.parse(fs.readFile(_Abs('/project/node_modules/__ngcc_entry_points__.json'))) as
            EntryPointManifestFile;
        expect(file.configFileHash).toEqual(config.hash);
      });

      it('should write the package path and entry-point path of each entry-point provided', () => {
        fs.writeFile(_Abs('/project/package-lock.json'), 'LOCK FILE CONTENTS');
        const entryPoint1: EntryPointWithDependencies = {
          entryPoint: {
            path: _Abs('/project/node_modules/package-1/'),
            packagePath: _Abs('/project/node_modules/package-1/'),
          } as any,
          depInfo: {
            dependencies: new Set([
              _Abs('/project/node_modules/other_package_1'),
              _Abs('/project/node_modules/other_package_2'),
            ]),
            missing: new Set(),
            deepImports: new Set()
          }
        };
        const entryPoint2: EntryPointWithDependencies = {
          entryPoint: {
            path: _Abs('/project/node_modules/package-2/entry-point'),
            packagePath: _Abs('/project/node_modules/package-2/'),
          } as any,
          depInfo: {
            dependencies: new Set(),
            missing: new Set([
              _Abs('/project/node_modules/missing_1'),
              relativeFrom('missing_2'),
            ]),
            deepImports: new Set([
              _Abs('/project/node_modules/deep/import/path'),
            ])
          }
        };
        manifest.writeEntryPointManifest(_Abs('/project/node_modules'), [entryPoint1, entryPoint2]);
        const file =
            JSON.parse(fs.readFile(_Abs('/project/node_modules/__ngcc_entry_points__.json'))) as
            EntryPointManifestFile;
        expect(file.entryPointPaths).toEqual([
          [
            'package-1',
            'package-1',
            [
              _Abs('/project/node_modules/other_package_1'),
              _Abs('/project/node_modules/other_package_2'),
            ],
          ],
          [
            'package-2',
            'package-2/entry-point',
            [],
            [
              _Abs('/project/node_modules/missing_1'),
              relativeFrom('missing_2'),
            ],
            [
              _Abs('/project/node_modules/deep/import/path'),
            ],
          ]
        ]);
      });
    });
  });
});
