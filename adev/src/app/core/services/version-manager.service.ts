/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, VERSION, computed, signal} from '@angular/core';

// TODO(josephperrott): extract this out of the file into a managed location.
const VERSIONS_CONFIG = {
  currentVersion: 'stable',
  historicalVersionsLinkPattern: 'https://v{{version}}.angular.dev',
  mainVersions: [
    {
      version: 'stable',
      url: 'https://angular.dev',
    },
    {
      version: 'v16',
      url: 'https://v16.angular.io/docs',
    },
    {
      version: 'v15',
      url: 'https://v15.angular.io/docs',
    },
    {
      version: 'v14',
      url: 'https://v14.angular.io/docs',
    },
    {
      version: 'v13',
      url: 'https://v13.angular.io/docs',
    },
    {
      version: 'v12',
      url: 'https://v12.angular.io/docs',
    },
    {
      version: 'v11',
      url: 'https://v11.angular.io/docs',
    },
    {
      version: 'v10',
      url: 'https://v10.angular.io/docs',
    },
    {
      version: 'v9',
      url: 'https://v9.angular.io/docs',
    },
    {
      version: 'v8',
      url: 'https://v8.angular.io/docs',
    },
    {
      version: 'v7',
      url: 'https://v7.angular.io/docs',
    },
    {
      version: 'v6',
      url: 'https://v6.angular.io/docs',
    },
    {
      version: 'v5',
      url: 'https://v5.angular.io/docs',
    },
    {
      version: 'v4',
      url: 'https://v4.angular.io/docs',
    },
    {
      version: 'v2',
      url: 'https://v2.angular.io/docs',
    },
  ],
};

export interface Version {
  displayName: string;
  version: VersionMode;
  url: string;
}

export type VersionMode = 'stable' | 'rc' | 'next' | number;

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
      return `v${VERSION.major}`;
    }
    if (Number.isInteger(versionMode)) {
      return `v${versionMode}`;
    }
    return versionMode.toString();
  }
}
