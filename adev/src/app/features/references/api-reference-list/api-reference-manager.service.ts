/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, signal} from '@angular/core';
// This file is generated at build-time, error is expected here.
import API_MANIFEST_JSON from '../../../../../src/assets/api/manifest.json';
import {getApiUrl} from '../helpers/manifest.helper';
import {ApiItem} from '../interfaces/api-item';
import {ApiItemsGroup} from '../interfaces/api-items-group';
import {ApiManifest} from '../interfaces/api-manifest';

export const FEATURED_API_ITEMS_KEY = 'apiFeaturedItems';
export const FEATURED_GROUP_TITLE = 'Most Common';

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

const manifest = API_MANIFEST_JSON as ApiManifest;

@Injectable({
  providedIn: 'root',
})
export class ApiReferenceManager {
  // Represents group of the featured items.
  featuredGroup = signal<ApiItemsGroup>({
    title: FEATURED_GROUP_TITLE,
    id: 'featured',
    items: [],
    isFeatured: true,
  });

  apiGroups = signal<ApiItemsGroup[]>(this.mapManifestToApiGroups());

  private mapManifestToApiGroups(): ApiItemsGroup[] {
    const groups: ApiItemsGroup[] = [];

    for (const module of manifest) {
      groups.push({
        title: module.moduleLabel.replace('@angular/', ''),
        id: module.normalizedModuleName,
        items: module.entries
          .map((api) => {
            const url = getApiUrl(module, api.name);
            const isFeatured = FEATURED_ITEMS_URLS.some((featuredUrl) => featuredUrl === url);
            const apiItem = {
              itemType: api.type,
              title: api.name,
              isDeprecated: !!api.isDeprecated,
              isDeveloperPreview: !!api.isDeveloperPreview,
              isExperimental: !!api.isExperimental,
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
