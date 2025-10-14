/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable, signal} from '@angular/core';
// This file is generated at build-time, error is expected here.
import API_MANIFEST_JSON from '../../../../../src/assets/api/manifest.json';
import {getApiUrl} from '../helpers/manifest.helper';
const manifest = API_MANIFEST_JSON;
let ApiReferenceManager = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ApiReferenceManager = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ApiReferenceManager = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    apiGroups = signal(this.mapManifestToApiGroups());
    mapManifestToApiGroups() {
      const groups = [];
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
              category: api.category,
            };
            return apiItem;
          }),
        });
      }
      return groups;
    }
  };
  return (ApiReferenceManager = _classThis);
})();
export {ApiReferenceManager};
//# sourceMappingURL=api-reference-manager.service.js.map
