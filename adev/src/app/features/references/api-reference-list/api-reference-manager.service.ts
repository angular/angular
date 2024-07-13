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
import {ANGULAR_PACKAGE_PREFIX, getApiUrl} from '../helpers/manifest.helper';
import {ApiItem} from '../interfaces/api-item';
import {ApiItemsGroup} from '../interfaces/api-items-group';
import {ApiManifest} from '../interfaces/api-manifest';

export const FEATURED_API_ITEMS_KEY = 'apiFeaturedItems';

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
        id: packageNameWithoutPrefix.replaceAll('/', '-'),
        items: packageApis
          .map((api) => {
            const url = getApiUrl(packageNameWithoutPrefix, api.name);
            const apiItem = {
              itemType: api.type,
              title: api.name,
              isDeprecated: !!api.isDeprecated,
              url,
            };

            return apiItem;
          })
          .sort((a, b) => a.title.localeCompare(b.title)),
      });
    }

    return groups;
  }
}
