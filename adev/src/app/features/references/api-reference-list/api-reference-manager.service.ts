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
import {ApiItemsGroup} from '../interfaces/api-items-group';
import {ApiManifest} from '../interfaces/api-manifest';

const manifest = API_MANIFEST_JSON as ApiManifest;

@Injectable({
  providedIn: 'root',
})
export class ApiReferenceManager {
  apiGroups = signal<ApiItemsGroup[]>(this.mapManifestToApiGroups());

  private mapManifestToApiGroups(): ApiItemsGroup[] {
    const groups: ApiItemsGroup[] = [];

    for (const module of manifest) {
      groups.push({
        title: module.moduleLabel.replace('@angular/', ''),
        id: module.normalizedModuleName,
        items: module.entries.map((api) => {
          const url = getApiUrl(module, api.name);
          const apiItem = {
            itemType: api.type,
            title: api.name,
            deprecated: api.deprecated,
            developerPreview: api.developerPreview,
            experimental: api.experimental,
            stable: api.stable,
            url,
          };

          return apiItem;
        }),
      });
    }

    return groups;
  }
}
