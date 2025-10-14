/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {DOCUMENT, Injectable, VERSION, computed, inject} from '@angular/core';
import {httpResource} from '@angular/common/http';
import versionJson from '../../../assets/others/versions.json';
export const INITIAL_ADEV_DOCS_VERSION = 18;
export const VERSION_PLACEHOLDER = '{{version}}';
export const MODE_PLACEHOLDER = '{{prefix}}';
/**
 * This service will rely on 2 sources of data for the list of versions.
 *
 * To have an up-to-date list of versions, it will fetch a json from the deployed website.
 * As fallback it will use a local json file that is bundled with the app.
 */
let VersionManager = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var VersionManager = class {
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
      VersionManager = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    document = inject(DOCUMENT);
    get currentDocsVersionMode() {
      const hostname = this.document.location.hostname;
      if (hostname.startsWith('v')) return 'deprecated';
      if (hostname.startsWith('rc')) return 'rc';
      if (hostname.startsWith('next')) return 'next';
      return 'stable';
    }
    localVersions = versionJson.map((v) => {
      return {
        displayName: v.version,
        url: v.url,
      };
    });
    // This handle the fallback if the resource fails.
    versions = computed(() => {
      return this.remoteVersions.hasValue() ? this.remoteVersions.value() : this.localVersions;
    });
    // Yes this will trigger a cors error on localhost
    // but this is fine as we'll fallback to the local versions.json
    // which is the most up-to-date anyway.
    remoteVersions = httpResource(
      () => ({
        url: 'https://angular.dev/assets/others/versions.json',
        transferCache: false,
        cache: 'no-cache',
      }),
      {
        parse: (json) => {
          if (!Array.isArray(json)) {
            throw new Error('Invalid version data');
          }
          return json.map((v) => {
            if (
              v === undefined ||
              v === null ||
              typeof v !== 'object' ||
              !('version' in v) ||
              !('url' in v) ||
              typeof v.version !== 'string' ||
              typeof v.url !== 'string'
            ) {
              throw new Error('Invalid version data');
            }
            return {
              displayName: v.version,
              url: v.url,
            };
          });
        },
      },
    );
    currentDocsVersion = computed(() => {
      // In devmode the version is 0, so we'll target next (which is first on the list)
      if (VERSION.major === '0') {
        return this.versions()[0];
      }
      return (
        this.versions().find((v) => v.displayName.includes(VERSION.major)) ?? this.versions()[0]
      );
    });
  };
  return (VersionManager = _classThis);
})();
export {VersionManager};
//# sourceMappingURL=version-manager.service.js.map
