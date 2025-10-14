/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import API_MANIFEST_JSON from '../../../../../src/assets/api/manifest.json';
import {contentResolver} from '@angular/docs';
import {PAGE_PREFIX} from '../../../core/constants/pages';
const manifest = API_MANIFEST_JSON;
export function mapApiManifestToRoutes() {
  const apiRoutes = [];
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
export function getApiNavigationItems() {
  const apiNavigationItems = [];
  for (const packageEntry of manifest) {
    const packageNavigationItem = {
      label: packageEntry.moduleLabel,
      children: packageEntry.entries.map((api) => ({
        path: getApiUrl(packageEntry, api.name),
        label: api.name,
        category: api.category,
      })),
    };
    apiNavigationItems.push(packageNavigationItem);
  }
  return apiNavigationItems;
}
export function getApiUrl(packageEntry, apiName) {
  const packageName = packageEntry.normalizedModuleName
    // packages like `angular_core` should be `core`
    // packages like `angular_animation_browser` should be `animation/browser`
    .replace('angular_', '')
    .replaceAll('_', '/');
  return `${PAGE_PREFIX.API}/${packageName}/${apiName}`;
}
function getNormalizedFilename(manifestPackage, entry) {
  return `${manifestPackage.normalizedModuleName}_${entry.name}_${entry.type}.html`;
}
//# sourceMappingURL=manifest.helper.js.map
