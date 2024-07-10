/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, computed, inject, signal} from '@angular/core';
import {VERSIONS_CONFIG} from '../constants/versions';
import {WINDOW} from '@angular/docs';
import {CURRENT_MAJOR_VERSION} from '../providers/current-version';

export interface Version {
  displayName: string;
  version: VersionMode;
  url: string;
}

export type VersionMode = 'stable' | 'deprecated' | 'rc' | 'next' | number;

export const INITIAL_ADEV_DOCS_VERSION = 18;
export const VERSION_PLACEHOLDER = '{{version}}';
export const MODE_PLACEHOLDER = '{{prefix}}';

@Injectable({
  providedIn: 'root',
})
export class VersionManager {
  private readonly currentMajorVersion = inject(CURRENT_MAJOR_VERSION);
  private readonly window = inject(WINDOW);

  // Note: We can assume that if the URL starts with v{{version}}, it is documentation for previous versions of Angular.
  // Based on URL we can indicate as well if it's rc or next Docs version.
  private get currentVersionMode(): VersionMode {
    const hostname = this.window.location.hostname;
    if (hostname.startsWith('v')) return 'deprecated';
    if (hostname.startsWith('rc')) return 'rc';
    if (hostname.startsWith('next')) return 'next';

    return 'stable';
  }

  versions = signal<Version[]>([
    ...this.getRecentVersions(),
    ...this.getAdevVersions(),
    ...this.getAioVersions(),
  ]);

  currentDocsVersion = computed(() => {
    return this.versions().find(
      (version) => version.version.toString() === this.currentVersionMode,
    );
  });

  // List of Angular Docs versions which includes current version, next and rc.
  private getRecentVersions(): Version[] {
    return [
      {
        url: this.getAdevDocsUrl('next'),
        displayName: `next`,
        version: 'next',
      },
      // Note: 'rc' should not be visible for now
      // {
      //   url: this.getAdevDocsUrl('rc'),
      //   displayName: `rc`,
      //   version: 'rc',
      // },
      {
        url: this.getAdevDocsUrl(this.currentMajorVersion),
        displayName: this.getVersion(this.currentMajorVersion),
        version: this.currentVersionMode,
      },
    ];
  }

  // List of Angular Docs versions hosted on angular.dev domain.
  private getAdevVersions(): Version[] {
    const adevVersions: Version[] = [];
    for (
      let version = this.currentMajorVersion - 1;
      version >= INITIAL_ADEV_DOCS_VERSION;
      version--
    ) {
      adevVersions.push({
        url: this.getAdevDocsUrl(version),
        displayName: this.getVersion(version),
        version: 'deprecated',
      });
    }
    return adevVersions;
  }

  // List of Angular Docs versions hosted on angular.io domain.
  private getAioVersions(): Version[] {
    return VERSIONS_CONFIG.aioVersions.map((item) =>
      this.mapToVersion(item as Pick<Version, 'url' | 'version'>),
    );
  }

  private mapToVersion(value: Pick<Version, 'url' | 'version'>): Version {
    return {
      ...value,
      displayName: this.getVersion(value.version),
    };
  }

  private getVersion(versionMode: VersionMode): string {
    if (versionMode === 'stable' || versionMode === 'deprecated') {
      return `v${this.currentMajorVersion}`;
    }
    if (Number.isInteger(versionMode)) {
      return `v${versionMode}`;
    }
    return versionMode.toString();
  }

  private getAdevDocsUrl(version: VersionMode): string {
    const docsUrlPrefix = isNaN(Number(version)) ? `` : 'v';

    return VERSIONS_CONFIG.aDevVersionsLinkPattern
      .replace(MODE_PLACEHOLDER, docsUrlPrefix)
      .replace(
        VERSION_PLACEHOLDER,
        `${version.toString() === 'stable' ? '' : `${version.toString()}.`}`,
      );
  }
}
