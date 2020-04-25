/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TargetVersion} from './target-version';

export type VersionChanges<T> = {
  [target in TargetVersion]?: ReadableChange<T>[];
};

export type ReadableChange<T> = {
  pr: string; changes: T[]
};

/** Conditional type that unwraps the value of a version changes type. */
export type ValueOfChanges<T> = T extends VersionChanges<infer X>? X : null;

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
    throw new Error(
        `No data could be found for target version: ${TargetVersion[target]}`);
  }

  if (!data[target]) {
    return [];
  }

  return data[target]!.reduce((result, prData) => result.concat(prData.changes), [] as T[]);
}

/**
 * Gets all changes from the specified version changes object. This is helpful in case a migration
 * rule does not distinguish data based on the target version, but for readability the
 * upgrade data is separated for each target version.
 */
export function getAllChanges<T>(data: VersionChanges<T>): T[] {
  return Object.keys(data)
      .map(targetVersion => getChangesForTarget(targetVersion as TargetVersion, data))
      .reduce((result, versionData) => result.concat(versionData), []);
}
