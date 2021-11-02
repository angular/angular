/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, AbsoluteFsPath, FileSystem, PathSegment} from '../../../../src/ngtsc/file_system';
import {cleanPackageJson} from '../../packages/build_marker';
import {EntryPointPackageJson} from '../../packages/entry_point';
import {NGCC_BACKUP_EXTENSION} from '../in_place_file_writer';
import {NGCC_DIRECTORY} from '../new_entry_point_file_writer';

import {isLocalDirectory} from './utils';

/**
 * Implement this interface to extend the cleaning strategies of the `PackageCleaner`.
 */
export interface CleaningStrategy {
  canClean(path: AbsoluteFsPath, basename: PathSegment): boolean;
  clean(path: AbsoluteFsPath, basename: PathSegment): void;
}

/**
 * A CleaningStrategy that reverts changes to package.json files by removing the build marker and
 * other properties.
 */
export class PackageJsonCleaner implements CleaningStrategy {
  constructor(private fs: FileSystem) {}
  canClean(_path: AbsoluteFsPath, basename: PathSegment): boolean {
    return basename === 'package.json';
  }
  clean(path: AbsoluteFsPath, _basename: PathSegment): void {
    const packageJson = JSON.parse(this.fs.readFile(path)) as EntryPointPackageJson;
    if (cleanPackageJson(packageJson)) {
      this.fs.writeFile(path, `${JSON.stringify(packageJson, null, 2)}\n`);
    }
  }
}

/**
 * A CleaningStrategy that removes the extra directory containing generated entry-point formats.
 */
export class NgccDirectoryCleaner implements CleaningStrategy {
  constructor(private fs: FileSystem) {}
  canClean(path: AbsoluteFsPath, basename: PathSegment): boolean {
    return basename === NGCC_DIRECTORY && isLocalDirectory(this.fs, path);
  }
  clean(path: AbsoluteFsPath, _basename: PathSegment): void {
    this.fs.removeDeep(path);
  }
}

/**
 * A CleaningStrategy that reverts files that were overwritten and removes the backup files that
 * ngcc created.
 */
export class BackupFileCleaner implements CleaningStrategy {
  constructor(private fs: FileSystem) {}
  canClean(path: AbsoluteFsPath, basename: PathSegment): boolean {
    return this.fs.extname(basename) === NGCC_BACKUP_EXTENSION &&
        this.fs.exists(absoluteFrom(path.replace(NGCC_BACKUP_EXTENSION, '')));
  }
  clean(path: AbsoluteFsPath, _basename: PathSegment): void {
    this.fs.moveFile(path, absoluteFrom(path.replace(NGCC_BACKUP_EXTENSION, '')));
  }
}
