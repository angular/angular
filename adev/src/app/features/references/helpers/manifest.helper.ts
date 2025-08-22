/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Route} from '@angular/router';
import API_MANIFEST_JSON from '../../../../../src/assets/api/manifest.json';
import {ApiManifest, ApiManifestEntry, ApiManifestPackage} from '../interfaces/api-manifest';
import {NavigationItem, contentResolver} from '@angular/docs';
import {PAGE_PREFIX} from '../../../core/constants/pages';

const manifest = API_MANIFEST_JSON as ApiManifest;

export function mapApiManifestToRoutes(): Route[] {
  const apiRoutes: Route[] = [];

  for (const packageEntry of manifest) {
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

  for (const packageEntry of manifest) {
    const packageNavigationItem: NavigationItem = {
      label: packageEntry.moduleLabel,
      children: packageEntry.entries.map((api) => ({
        path: getApiUrl(packageEntry, api.name),
        label: api.name,
      })),
    };

    apiNavigationItems.push(packageNavigationItem);
  }

  return apiNavigationItems;
}

export function getApiUrl(packageEntry: ApiManifestPackage, apiName: string): string {
  const packageName = packageEntry.normalizedModuleName
    // packages like `angular_core` should be `core`
    // packages like `angular_animation_browser` should be `animation/browser`
    .replace('angular_', '')
    .replaceAll('_', '/');
  return `${PAGE_PREFIX.API}/${packageName}/${apiName}`;
}

function getNormalizedFilename(
  manifestPackage: ApiManifestPackage,
  entry: ApiManifestEntry,
): string {
  return `${manifestPackage.normalizedModuleName}_${entry.name}_${entry.type}.html`;
}
