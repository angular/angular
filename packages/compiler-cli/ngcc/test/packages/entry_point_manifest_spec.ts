/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {createHash} from 'crypto';

import {FileSystem, absoluteFrom, getFileSystem} from '../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadTestFiles} from '../../../test/helpers';
import {NGCC_VERSION} from '../../src/packages/build_marker';
import {NgccConfiguration} from '../../src/packages/configuration';
import {EntryPoint} from '../../src/packages/entry_point';
import {EntryPointManifest, EntryPointManifestFile} from '../../src/packages/entry_point_manifest';
import {MockLogger} from '../helpers/mock_logger';

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
          lockFileHash: createHash('md5').update('LOCK FILE CONTENTS').digest('hex'),
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
          _Abs('/project/node_modules/some_package/valid_entry_point')
        ]);
        fs.writeFile(
            _Abs('/project/node_modules/__ngcc_entry_points__.json'), JSON.stringify(manifestFile));
        const entryPoints = manifest.readEntryPointsUsingManifest(_Abs('/project/node_modules'));
        expect(entryPoints).toEqual([{
          name: 'some_package/valid_entry_point', packageJson: jasmine.any(Object),
              package: _Abs('/project/node_modules/some_package'),
              path: _Abs('/project/node_modules/some_package/valid_entry_point'),
              typings: _Abs(
                  '/project/node_modules/some_package/valid_entry_point/valid_entry_point.d.ts'),
              compiledByAngular: true, ignoreMissingDependencies: false,
              generateDeepReexports: false,
        } as any]);
      });

      it('should return null if any of the entry-points are not valid', () => {
        fs.ensureDir(_Abs('/project/node_modules'));
        fs.writeFile(_Abs('/project/yarn.lock'), 'LOCK FILE CONTENTS');
        manifestFile.entryPointPaths.push([
          _Abs('/project/node_modules/some_package'),
          _Abs('/project/node_modules/some_package/valid_entry_point')
        ]);
        fs.writeFile(
            _Abs('/project/node_modules/__ngcc_entry_points__.json'), JSON.stringify(manifestFile));
        const entryPoints = manifest.readEntryPointsUsingManifest(_Abs('/project/node_modules'));
        expect(entryPoints).toEqual(null);
      });
    });

    describe('writeEntryPointManifest()', () => {
      it('should do nothing if there is no package lock-file', () => {
        manifest.writeEntryPointManifest(_Abs('/project/node_modules'), []);
        expect(fs.exists(_Abs('/project/node_modules/__ngcc_entry_points__.json'))).toBe(false);
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
        const file: EntryPointManifestFile =
            JSON.parse(fs.readFile(_Abs('/project/node_modules/__ngcc_entry_points__.json')));
        expect(file.ngccVersion).toEqual(NGCC_VERSION);
      });

      it('should write a hash of the yarn.lock file', () => {
        fs.writeFile(_Abs('/project/yarn.lock'), 'LOCK FILE CONTENTS');
        manifest.writeEntryPointManifest(_Abs('/project/node_modules'), []);
        const file: EntryPointManifestFile =
            JSON.parse(fs.readFile(_Abs('/project/node_modules/__ngcc_entry_points__.json')));
        expect(file.lockFileHash)
            .toEqual(createHash('md5').update('LOCK FILE CONTENTS').digest('hex'));
      });

      it('should write a hash of the package-lock.json file', () => {
        fs.writeFile(_Abs('/project/package-lock.json'), 'LOCK FILE CONTENTS');
        manifest.writeEntryPointManifest(_Abs('/project/node_modules'), []);
        const file: EntryPointManifestFile =
            JSON.parse(fs.readFile(_Abs('/project/node_modules/__ngcc_entry_points__.json')));
        expect(file.lockFileHash)
            .toEqual(createHash('md5').update('LOCK FILE CONTENTS').digest('hex'));
      });

      it('should write a hash of the project config', () => {
        fs.writeFile(_Abs('/project/package-lock.json'), 'LOCK FILE CONTENTS');
        manifest.writeEntryPointManifest(_Abs('/project/node_modules'), []);
        const file: EntryPointManifestFile =
            JSON.parse(fs.readFile(_Abs('/project/node_modules/__ngcc_entry_points__.json')));
        expect(file.configFileHash).toEqual(config.hash);
      });

      it('should write the package path and entry-point path of each entry-point provided', () => {
        fs.writeFile(_Abs('/project/package-lock.json'), 'LOCK FILE CONTENTS');
        const entryPoint1 = {
          package: _Abs('/project/node_modules/package-1/'),
          path: _Abs('/project/node_modules/package-1/'),
        } as unknown as EntryPoint;
        const entryPoint2 = {
          package: _Abs('/project/node_modules/package-2/'),
          path: _Abs('/project/node_modules/package-2/entry-point'),
        } as unknown as EntryPoint;
        manifest.writeEntryPointManifest(_Abs('/project/node_modules'), [entryPoint1, entryPoint2]);
        const file: EntryPointManifestFile =
            JSON.parse(fs.readFile(_Abs('/project/node_modules/__ngcc_entry_points__.json')));
        expect(file.entryPointPaths).toEqual([
          [
            _Abs('/project/node_modules/package-1/'),
            _Abs('/project/node_modules/package-1/'),
          ],
          [
            _Abs('/project/node_modules/package-2/'),
            _Abs('/project/node_modules/package-2/entry-point'),
          ]
        ]);
      });
    });
  });
});