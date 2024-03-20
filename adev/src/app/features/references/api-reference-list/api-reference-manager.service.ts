/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, signal} from '@angular/core';
import API_MANIFEST_JSON from '../../../../../src/assets/api/manifest.json';
import {ANGULAR_PACKAGE_PREFIX, getApiUrl} from '../helpers/manifest.helper';
import {ApiItem} from '../interfaces/api-item';
import {ApiItemsGroup} from '../interfaces/api-items-group';
import {ApiManifest} from '../interfaces/api-manifest';

export const FEATURED_API_ITEMS_KEY = 'apiFeaturedItems';
export const FEATURED_GROUP_TITLE = 'Featured';

export type FeaturedItemsByGroup = Record<string, ApiItem[]>;

export const FEATURED_ITEMS_URLS = [
  'api/common/DatePipe',
  'api/common/NgIf',
  'api/common/NgFor',
  'api/common/NgClass',
  'api/core/ViewChild',
  'api/forms/NgModel',
  'api/router/RouterLink',
  'api/forms/FormControl',
  'api/common/http/HttpClient',
  'api/core/OnChanges',
  'api/forms/FormGroup',
  'api/router/CanActivate',
];

@Injectable({
  providedIn: 'root',
})
export class ApiReferenceManager {
  // Represents group of the featured items.
  featuredGroup = signal<ApiItemsGroup>({
    title: FEATURED_GROUP_TITLE,
    items: [],
    isFeatured: true,
  });

  apiGroups = signal<ApiItemsGroup[]>(this.mapManifestToApiGroups());

  private mapManifestToApiGroups(): ApiItemsGroup[] {
    const groups: ApiItemsGroup[] = [];
    const manifest = API_MANIFEST_JSON as ApiManifest;

    const packageNames = Object.keys(API_MANIFEST_JSON);

    for (const packageName of packageNames) {
      const packageNameWithoutPrefix = packageName.replace(ANGULAR_PACKAGE_PREFIX, '');
      const packageApis = manifest[packageName];

      groups.push({
        title: packageNameWithoutPrefix,
        items: packageApis
          .map((api) => {
            const url = getApiUrl(packageNameWithoutPrefix, api.name);
            const isFeatured = FEATURED_ITEMS_URLS.some((featuredUrl) => featuredUrl === url);
            const apiItem = {
              itemType: api.type,
              title: api.name,
              isDeprecated: !!api.isDeprecated,
              isFeatured,
              url,
            };

            if (isFeatured) {
              this.featuredGroup.update((group) => {
                group.items.push(apiItem);
                return group;
              });
            }

            return apiItem;
          })
          .sort((a, b) => a.title.localeCompare(b.title)),
      });
    }

    return groups;
  }
}
