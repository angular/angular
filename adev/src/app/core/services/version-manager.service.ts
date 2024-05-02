/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, VERSION, computed, signal} from '@angular/core';
import {VERSIONS_CONFIG} from '../constants/versions';

export interface Version {
  displayName: string;
  version: VersionMode;
  url: string;
}

export type VersionMode = 'stable' | 'deprecated' | 'rc' | 'next' | number;

export const INITIAL_DOCS_VERSION = 17;
export const VERSION_PATTERN_PLACEHOLDER = '{{version}}';

@Injectable({
  providedIn: 'root',
})
export class VersionManager {
  versions = signal<Version[]>([
    ...VERSIONS_CONFIG.mainVersions.map((item) =>
      this.mapToVersion(item as Pick<Version, 'url' | 'version'>),
    ),
    ...this.getHistoricalVersions(),
  ]);

  currentDocsVersion = computed(() => {
    return this.versions().find(
      (version) => version.version.toString() === VERSIONS_CONFIG.currentVersion,
    );
  });

  private getHistoricalVersions(): Version[] {
    const historicalVersions: Version[] = [];
    for (let version = Number(VERSION.major) - 1; version >= INITIAL_DOCS_VERSION; version--) {
      historicalVersions.push({
        url: VERSIONS_CONFIG.historicalVersionsLinkPattern.replace(
          VERSION_PATTERN_PLACEHOLDER,
          version.toString(),
        ),
        displayName: this.getVersion(version),
        version,
      });
    }
    return historicalVersions;
  }

  private mapToVersion(value: Pick<Version, 'url' | 'version'>): Version {
    return {
      ...value,
      displayName: this.getVersion(value.version),
    };
  }

  private getVersion(versionMode: VersionMode): string {
    if (versionMode === 'stable') {
      return 'v17';
      // Temporarily commenting out till this works correctly
      // return `v${VERSION.major}`;
    }
    if (Number.isInteger(versionMode)) {
      return `v${versionMode}`;
    }
    return versionMode.toString();
  }
}
