/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Route} from '@angular/router';
import API_MANIFEST_JSON from '../../../../../src/assets/api/manifest.json';
import {ApiManifest, ApiManifestItem} from '../interfaces/api-manifest';
import {PagePrefix} from '../../../core/enums/pages';
import {NavigationItem, contentResolver} from '@angular/docs';

export const ANGULAR_PACKAGE_PREFIX = '@angular/';

export function mapApiManifestToRoutes(): Route[] {
  const manifest = API_MANIFEST_JSON as ApiManifest;
  const packageNames = Object.keys(API_MANIFEST_JSON);

  const apiRoutes: Route[] = [];

  for (const packageName of packageNames) {
    const packageNameWithoutPrefix = packageName.replace(ANGULAR_PACKAGE_PREFIX, '');
    const packageApis = manifest[packageName];

    for (const api of packageApis) {
      apiRoutes.push({
        path: getApiUrl(packageNameWithoutPrefix, api.name),
        loadComponent: () =>
          import('./../api-reference-details-page/api-reference-details-page.component'),
        resolve: {
          docContent: contentResolver(
            `api/${getNormalizedFilename(packageNameWithoutPrefix, api)}`,
          ),
        },
        data: {
          displaySecondaryNav: true,
        },
      });
    }
  }

  return apiRoutes;
}

export function getApiNavigationItems(): NavigationItem[] {
  const manifest = API_MANIFEST_JSON as ApiManifest;
  const packageNames = Object.keys(API_MANIFEST_JSON);

  const apiNavigationItems: NavigationItem[] = [];

  for (const packageName of packageNames) {
    const packageNameWithoutPrefix = packageName.replace(ANGULAR_PACKAGE_PREFIX, '');
    const packageApis = manifest[packageName];

    const packageNavigationItem: NavigationItem = {
      label: packageNameWithoutPrefix,
      children: packageApis
        .map((api) => ({
          path: getApiUrl(packageNameWithoutPrefix, api.name),
          label: api.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    };

    apiNavigationItems.push(packageNavigationItem);
  }

  return apiNavigationItems;
}

export function getApiUrl(packageNameWithoutPrefix: string, apiName: string): string {
  return `${PagePrefix.API}/${packageNameWithoutPrefix}/${apiName}`;
}

function getNormalizedFilename(moduleName: string, entry: ApiManifestItem): string {
  // Angular entry points can contain `/`, we would like to swap `/` with an underscore
  const normalizedModuleName = moduleName.replaceAll('/', '_');
  return `angular_${normalizedModuleName}_${entry.name}_${entry.type}.html`;
}
