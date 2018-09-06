/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {TargetVersion} from '../index';

export type VersionChanges<T> = {
  [target in TargetVersion]?: ReadableChange<T>[];
};

export type ReadableChange<T> = {
  pr: string;
  changes: T[]
};

/**
 * Gets the changes for a given target version from the specified version changes object.
 *
 * For readability and a good overview of breaking changes, the version change data always
 * includes the related Pull Request link. Since this data is not needed when performing the
 * upgrade, this unused data can be removed and the changes data can be flattened into an
 * easy iterable array.
 */
export function getChangesForTarget<T>(target: TargetVersion, data: VersionChanges<T>): T[] {
  if (!data) {
    throw new Error(`No data could be found for target version: ${TargetVersion[target]}`);
  }

  if (!data[target]) {
    return [];
  }

  return data[target]!.reduce((result, prData) => result.concat(prData.changes), [] as T[]);
}
