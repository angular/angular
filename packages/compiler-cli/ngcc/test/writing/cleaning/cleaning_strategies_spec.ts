/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem, PathSegment} from '../../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../../src/ngtsc/file_system/testing';
import {EntryPointPackageJson} from '../../../src/packages/entry_point';
import {BackupFileCleaner, NgccDirectoryCleaner, PackageJsonCleaner} from '../../../src/writing/cleaning/cleaning_strategies';

runInEachFileSystem(() => {
  describe('cleaning strategies', () => {
    let fs: FileSystem;
    let _abs: typeof absoluteFrom;

    beforeEach(() => {
      fs = getFileSystem();
      _abs = absoluteFrom;
    });

    describe('PackageJsonCleaner', () => {
      let packageJsonPath: AbsoluteFsPath;
      beforeEach(() => {
        packageJsonPath = _abs('/node_modules/pkg/package.json');
      });

      describe('canClean()', () => {
        it('should return true if the basename is package.json', () => {
          const strategy = new PackageJsonCleaner(fs);
          expect(strategy.canClean(packageJsonPath, fs.basename(packageJsonPath))).toBe(true);
        });

        it('should return false if the basename is not package.json', () => {
          const filePath = _abs('/node_modules/pkg/index.js');
          const fileName = fs.basename(filePath);
          const strategy = new PackageJsonCleaner(fs);
          expect(strategy.canClean(filePath, fileName)).toBe(false);
        });
      });

      describe('clean()', () => {
        it('should not touch the file if there is no build marker', () => {
          const strategy = new PackageJsonCleaner(fs);
          const packageJson: EntryPointPackageJson = {name: 'test-package'};
          fs.ensureDir(fs.dirname(packageJsonPath));
          fs.writeFile(packageJsonPath, JSON.stringify(packageJson));
          strategy.clean(packageJsonPath, fs.basename(packageJsonPath));
          const newPackageJson = JSON.parse(fs.readFile(packageJsonPath)) as EntryPointPackageJson;
          expect(newPackageJson).toEqual({name: 'test-package'});
        });

        it('should remove the processed marker', () => {
          const strategy = new PackageJsonCleaner(fs);
          const packageJson: EntryPointPackageJson = {
            name: 'test-package',
            __processed_by_ivy_ngcc__: {'fesm2015': '8.0.0'}
          };
          fs.ensureDir(fs.dirname(packageJsonPath));
          fs.writeFile(packageJsonPath, JSON.stringify(packageJson));
          strategy.clean(packageJsonPath, fs.basename(packageJsonPath));
          const newPackageJson = JSON.parse(fs.readFile(packageJsonPath)) as EntryPointPackageJson;
          expect(newPackageJson).toEqual({name: 'test-package'});
        });

        it('should remove the new entry points', () => {
          const strategy = new PackageJsonCleaner(fs);
          const packageJson: EntryPointPackageJson = {
            name: 'test-package',
            __processed_by_ivy_ngcc__: {'fesm2015': '8.0.0'}
          };
          fs.ensureDir(fs.dirname(packageJsonPath));
          fs.writeFile(packageJsonPath, JSON.stringify(packageJson));
          strategy.clean(packageJsonPath, fs.basename(packageJsonPath));
          const newPackageJson = JSON.parse(fs.readFile(packageJsonPath)) as EntryPointPackageJson;
          expect(newPackageJson).toEqual({name: 'test-package'});
        });

        it('should remove the prepublish script if there was a processed marker', () => {
          const strategy = new PackageJsonCleaner(fs);
          const packageJson: EntryPointPackageJson = {
            name: 'test-package',
            __processed_by_ivy_ngcc__: {'fesm2015': '8.0.0'},
            scripts: {prepublishOnly: 'added by ngcc', test: 'do testing'},
          };
          fs.ensureDir(fs.dirname(packageJsonPath));
          fs.writeFile(packageJsonPath, JSON.stringify(packageJson));
          strategy.clean(packageJsonPath, fs.basename(packageJsonPath));
          const newPackageJson = JSON.parse(fs.readFile(packageJsonPath)) as EntryPointPackageJson;
          expect(newPackageJson).toEqual({
            name: 'test-package',
            scripts: {test: 'do testing'},
          });
        });

        it('should revert and remove the backup for the prepublish script if there was a processed marker',
           () => {
             const strategy = new PackageJsonCleaner(fs);
             const packageJson: EntryPointPackageJson = {
               name: 'test-package',
               __processed_by_ivy_ngcc__: {'fesm2015': '8.0.0'},
               scripts: {
                 prepublishOnly: 'added by ngcc',
                 prepublishOnly__ivy_ngcc_bak: 'original',
                 test: 'do testing'
               },
             };
             fs.ensureDir(fs.dirname(packageJsonPath));
             fs.writeFile(packageJsonPath, JSON.stringify(packageJson));
             strategy.clean(packageJsonPath, fs.basename(packageJsonPath));
             const newPackageJson =
                 JSON.parse(fs.readFile(packageJsonPath)) as EntryPointPackageJson;
             expect(newPackageJson).toEqual({
               name: 'test-package',
               scripts: {prepublishOnly: 'original', test: 'do testing'},
             });
           });

        it('should not touch the scripts if there was not processed marker', () => {
          const strategy = new PackageJsonCleaner(fs);
          const packageJson: EntryPointPackageJson = {
            name: 'test-package',
            scripts: {
              prepublishOnly: 'added by ngcc',
              prepublishOnly__ivy_ngcc_bak: 'original',
              test: 'do testing'
            },
          };
          fs.ensureDir(fs.dirname(packageJsonPath));
          fs.writeFile(packageJsonPath, JSON.stringify(packageJson));
          strategy.clean(packageJsonPath, fs.basename(packageJsonPath));
          const newPackageJson = JSON.parse(fs.readFile(packageJsonPath)) as EntryPointPackageJson;
          expect(newPackageJson).toEqual({
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

    describe('BackupFileCleaner', () => {
      let filePath: AbsoluteFsPath;
      let backupFilePath: AbsoluteFsPath;
      beforeEach(() => {
        filePath = _abs('/node_modules/pkg/index.js');
        backupFilePath = _abs('/node_modules/pkg/index.js.__ivy_ngcc_bak');
      });

      describe('canClean()', () => {
        it('should return true if the file name ends in .__ivy_ngcc_bak and the processed file exists',
           () => {
             const strategy = new BackupFileCleaner(fs);
             fs.ensureDir(fs.dirname(filePath));
             fs.writeFile(filePath, 'processed file');
             fs.writeFile(backupFilePath, 'original file');
             expect(strategy.canClean(backupFilePath, fs.basename(backupFilePath))).toBe(true);
           });

        it('should return false if the file does not end in .__ivy_ngcc_bak', () => {
          const strategy = new BackupFileCleaner(fs);
          fs.ensureDir(fs.dirname(filePath));
          fs.writeFile(filePath, 'processed file');
          fs.writeFile(backupFilePath, 'original file');
          expect(strategy.canClean(filePath, fs.basename(filePath))).toBe(false);
        });

        it('should return false if the file ends in .__ivy_ngcc_bak but the processed file does not exist',
           () => {
             const strategy = new BackupFileCleaner(fs);
             fs.ensureDir(fs.dirname(filePath));
             fs.writeFile(backupFilePath, 'original file');
             expect(strategy.canClean(backupFilePath, fs.basename(backupFilePath))).toBe(false);
           });
      });

      describe('clean()', () => {
        it('should move the backup file back to its original file path', () => {
          const strategy = new BackupFileCleaner(fs);
          fs.ensureDir(fs.dirname(filePath));
          fs.writeFile(filePath, 'processed file');
          fs.writeFile(backupFilePath, 'original file');
          strategy.clean(backupFilePath, fs.basename(backupFilePath));
          expect(fs.exists(backupFilePath)).toBe(false);
          expect(fs.readFile(filePath)).toEqual('original file');
        });
      });
    });

    describe('NgccDirectoryCleaner', () => {
      let ivyDirectory: AbsoluteFsPath;
      beforeEach(() => {
        ivyDirectory = _abs('/node_modules/pkg/__ivy_ngcc__');
      });

      describe('canClean()', () => {
        it('should return true if the path is a directory and is called __ivy_ngcc__', () => {
          const strategy = new NgccDirectoryCleaner(fs);
          fs.ensureDir(ivyDirectory);
          expect(strategy.canClean(ivyDirectory, fs.basename(ivyDirectory))).toBe(true);
        });

        it('should return false if the path is a directory and not called __ivy_ngcc__', () => {
          const strategy = new NgccDirectoryCleaner(fs);
          const filePath = _abs('/node_modules/pkg/other');
          fs.ensureDir(ivyDirectory);
          expect(strategy.canClean(filePath, fs.basename(filePath))).toBe(false);
        });

        it('should return false if the path is called __ivy_ngcc__ but does not exist', () => {
          const strategy = new NgccDirectoryCleaner(fs);
          expect(strategy.canClean(ivyDirectory, fs.basename(ivyDirectory))).toBe(false);
        });

        it('should return false if the path is called __ivy_ngcc__ but is not a directory', () => {
          const strategy = new NgccDirectoryCleaner(fs);
          fs.ensureDir(fs.dirname(ivyDirectory));
          fs.writeFile(ivyDirectory, 'some contents');
          expect(strategy.canClean(ivyDirectory, fs.basename(ivyDirectory))).toBe(false);
        });
      });

      describe('clean()', () => {
        it('should remove the __ivy_ngcc__ directory', () => {
          const strategy = new NgccDirectoryCleaner(fs);
          fs.ensureDir(ivyDirectory);
          fs.ensureDir(fs.resolve(ivyDirectory, 'subfolder'));
          fs.writeFile(fs.resolve(ivyDirectory, 'subfolder', 'file.txt'), 'file contents');
          strategy.clean(ivyDirectory, fs.basename(ivyDirectory));
          expect(fs.exists(ivyDirectory)).toBe(false);
        });
      });
    });
  });
});
