/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export interface VersionUrl {
  version: VersionMode;
  url: string;
}

export type VersionMode = 'stable' | 'rc' | 'next' | number;

export interface VersionsConfig {
  currentVersion: VersionMode;
  currentVersions: VersionUrl[];
  historicalVersions: VersionUrl[];
}
