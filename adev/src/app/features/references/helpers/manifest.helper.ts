/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Route} from '@angular/router';
// @ts-ignore This file is generated at build-time, error is expected here.
import API_MANIFEST_JSON from '../../../../../src/assets/api/manifest.json' with {type: 'json'};
import {
  NavigationItem,
  contentResolver,
  Manifest as ApiManifest,
  ManifestEntry as ApiManifestEntry,
  PackageSubEntry as ApiPackageSubEntry,
} from '@angular/docs';
import {PAGE_PREFIX} from '../../../core/constants/pages';

const manifest = API_MANIFEST_JSON as ApiManifest;

export function mapApiManifestToRoutes(): Route[] {
  const apiRoutes: Route[] = [];

  for (const packageEntry of Object.values(manifest).flatMap((entries) => entries)) {
    for (const api of packageEntry.entries) {
      apiRoutes.push({
        path: getApiUrl(packageEntry, api.name),
        loadComponent: () =>
          import('./../api-reference-details-page/api-reference-details-page.component'),
        resolve: {
          docContent: contentResolver(`api/${getNormalizedFilename(packageEntry, api)}`),
        },
        data: {
          label: api.name,
          displaySecondaryNav: true,
        },
      });
    }
  }

  return apiRoutes;
}

export function getApiNavigationItems(): NavigationItem[] {
  const apiNavigationItems: NavigationItem[] = [];

  for (const [packageName, packageSubEntries] of Object.entries(manifest)) {
    for (const packageEntry of packageSubEntries) {
      const packageNavigationItem: NavigationItem = {
        label:
          packageSubEntries.length > 1
            ? packageEntry.moduleLabel.replace('@angular/', '')
            : packageEntry.moduleLabel,
        category: packageName,
        children: packageEntry.entries.map((api) => ({
          path: getApiUrl(packageEntry, api.name),
          label: api.name,
          category: api.category,
        })),
      };

      apiNavigationItems.push(packageNavigationItem);
    }
  }

  return apiNavigationItems;
}

export function getApiUrl(packageEntry: ApiPackageSubEntry, apiName: string): string {
  const packageName = packageEntry.normalizedModuleName
    // packages like `angular_core` should be `core`
    // packages like `angular_animation_browser` should be `animation/browser`
    .replace('angular_', '')
    .replaceAll('_', '/');
  return `${PAGE_PREFIX.API}/${packageName}/${apiName}`;
}

function getNormalizedFilename(
  manifestPackage: ApiPackageSubEntry,
  entry: ApiManifestEntry,
): string {
  return `${manifestPackage.normalizedModuleName}_${entry.name}_${entry.type}.html`;
}
