/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {createHash} from 'crypto';

import {AbsoluteFsPath, FileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../logging/logger';

import {NGCC_VERSION} from './build_marker';
import {NgccConfiguration} from './configuration';
import {EntryPoint, INCOMPATIBLE_ENTRY_POINT, NO_ENTRY_POINT, getEntryPointInfo} from './entry_point';

/**
 * Manages reading and writing a manifest file that contains a list of all the entry-points that
 * were found below a given basePath.
 *
 * This is a super-set of the entry-points that are actually processed for a given run of ngcc,
 * since some may already be processed, or excluded if they do not have the required format.
 */
export class EntryPointManifest {
  constructor(private fs: FileSystem, private config: NgccConfiguration, private logger: Logger) {}

  /**
   * Try to get the entry-point info from a manifest file for the given `basePath` if it exists and
   * is not out of date.
   *
   * Reasons for the manifest to be out of date are:
   *
   * * the file does not exist
   * * the ngcc version has changed
   * * the package lock-file (i.e. yarn.lock or package-lock.json) has changed
   * * the project configuration has changed
   * * one or more entry-points in the manifest are not valid
   *
   * @param basePath The path that would contain the entry-points and the manifest file.
   * @returns an array of entry-point information for all entry-points found below the given
   * `basePath` or `null` if the manifest was out of date.
   */
  readEntryPointsUsingManifest(basePath: AbsoluteFsPath): EntryPoint[]|null {
    try {
      if (this.fs.basename(basePath) !== 'node_modules') {
        return null;
      }

      const manifestPath = this.getEntryPointManifestPath(basePath);
      if (!this.fs.exists(manifestPath)) {
        return null;
      }

      const computedLockFileHash = this.computeLockFileHash(basePath);
      if (computedLockFileHash === null) {
        return null;
      }

      const {ngccVersion, configFileHash, lockFileHash, entryPointPaths} =
          JSON.parse(this.fs.readFile(manifestPath)) as EntryPointManifestFile;
      if (ngccVersion !== NGCC_VERSION || configFileHash !== this.config.hash ||
          lockFileHash !== computedLockFileHash) {
        return null;
      }

      this.logger.debug(
          `Entry-point manifest found for ${basePath} so loading entry-point information directly.`);
      const startTime = Date.now();

      const entryPoints: EntryPoint[] = [];
      for (const [packagePath, entryPointPath] of entryPointPaths) {
        const result =
            getEntryPointInfo(this.fs, this.config, this.logger, packagePath, entryPointPath);
        if (result === NO_ENTRY_POINT || result === INCOMPATIBLE_ENTRY_POINT) {
          throw new Error(
              `The entry-point manifest at ${manifestPath} contained an invalid pair of package paths: [${packagePath}, ${entryPointPath}]`);
        } else {
          entryPoints.push(result);
        }
      }
      const duration = Math.round((Date.now() - startTime) / 100) / 10;
      this.logger.debug(`Reading entry-points using the manifest entries took ${duration}s.`);
      return entryPoints;
    } catch (e) {
      this.logger.warn(
          `Unable to read the entry-point manifest for ${basePath}:\n`, e.stack || e.toString());
      return null;
    }
  }

  /**
   * Write a manifest file at the given `basePath`.
   *
   * The manifest includes the current ngcc version and hashes of the package lock-file and current
   * project config. These will be used to check whether the manifest file is out of date. See
   * `readEntryPointsUsingManifest()`.
   *
   * @param basePath The path where the manifest file is to be written.
   * @param entryPoints A collection of entry-points to record in the manifest.
   */
  writeEntryPointManifest(basePath: AbsoluteFsPath, entryPoints: EntryPoint[]): void {
    if (this.fs.basename(basePath) !== 'node_modules') {
      return;
    }

    const lockFileHash = this.computeLockFileHash(basePath);
    if (lockFileHash === null) {
      return;
    }
    const manifest: EntryPointManifestFile = {
      ngccVersion: NGCC_VERSION,
      configFileHash: this.config.hash,
      lockFileHash: lockFileHash,
      entryPointPaths: entryPoints.map(entryPoint => [entryPoint.package, entryPoint.path]),
    };
    this.fs.writeFile(this.getEntryPointManifestPath(basePath), JSON.stringify(manifest));
  }

  private getEntryPointManifestPath(basePath: AbsoluteFsPath) {
    return this.fs.resolve(basePath, '__ngcc_entry_points__.json');
  }

  private computeLockFileHash(basePath: AbsoluteFsPath): string|null {
    const directory = this.fs.dirname(basePath);
    for (const lockFileName of ['yarn.lock', 'package-lock.json']) {
      const lockFilePath = this.fs.resolve(directory, lockFileName);
      if (this.fs.exists(lockFilePath)) {
        const lockFileContents = this.fs.readFile(lockFilePath);
        return createHash('md5').update(lockFileContents).digest('hex');
      }
    }
    return null;
  }
}

/**
 * A specialized implementation of the `EntryPointManifest` that can be used to invalidate the
 * current manifest file.
 *
 * It always returns `null` from the `readEntryPointsUsingManifest()` method, which forces a new
 * manifest to be created, which will overwrite the current file when `writeEntryPointManifest()` is
 * called.
 */
export class InvalidatingEntryPointManifest extends EntryPointManifest {
  readEntryPointsUsingManifest(basePath: AbsoluteFsPath): EntryPoint[]|null { return null; }
}

/**
 * The JSON format of the manifest file that is written to disk.
 */
export interface EntryPointManifestFile {
  ngccVersion: string;
  configFileHash: string;
  lockFileHash: string;
  entryPointPaths: Array<[AbsoluteFsPath, AbsoluteFsPath]>;
}
