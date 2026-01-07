/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, signal} from '@angular/core';
import {Manifest as ApiManifest} from '@angular/docs';
// @ts-ignore This file is generated at build-time, error is expected here.
import API_MANIFEST_JSON from '../../../../../src/assets/api/manifest.json';
import {getApiUrl} from '../helpers/manifest.helper';
import {ApiItemsGroup} from '../interfaces/api-items-group';
import {ApiItem} from '../interfaces/api-item';
import {ApiItemType} from '../interfaces/api-item-type';

const manifest = API_MANIFEST_JSON as ApiManifest;

@Injectable({
  providedIn: 'root',
})
export class ApiReferenceManager {
  apiGroups = signal<ApiItemsGroup[]>(this.mapManifestToApiGroups());

  private mapManifestToApiGroups(): ApiItemsGroup[] {
    const groups: ApiItemsGroup[] = [];

    Object.entries(manifest).map(([_, packageSubEntries]) => {
      for (const module of packageSubEntries) {
        groups.push({
          title: module.moduleLabel.replace('@angular/', ''),
          id: module.normalizedModuleName,
          items: module.entries.map((api) => {
            const url = getApiUrl(module, api.name);
            const apiItem: ApiItem = {
              itemType: api.type as ApiItemType,
              title: api.name,
              deprecated: api.deprecated,
              developerPreview: api.developerPreview,
              experimental: api.experimental,
              stable: api.stable,
              url,
              category: api.category,
            };

            return apiItem;
          }),
        });
      }
    });
    return groups;
  }
}
