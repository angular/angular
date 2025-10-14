/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {DOCUMENT} from '@angular/common';
import {Injectable, inject} from '@angular/core';
const ANGULAR_DEV = 'https://angular.dev';
/**
 * Information about the deployment of this application.
 */
let HeaderService = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeaderService = class {
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
      HeaderService = _classThis = _classDescriptor.value;
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
    /**
     * Sets the canonical link in the header.
     * It supposes the header link is already present in the index.html
     *
     * The function behave invariably and will always point to angular.dev,
     * no matter if it's a specific version build
     */
    setCanonical(absolutePath) {
      const pathWithoutFragment = this.normalizePath(absolutePath).split('#')[0];
      const fullPath = `${ANGULAR_DEV}/${pathWithoutFragment}`;
      this.document.querySelector('link[rel=canonical]')?.setAttribute('href', fullPath);
    }
    normalizePath(path) {
      if (path[0] === '/') {
        return path.substring(1);
      }
      return path;
    }
  };
  return (HeaderService = _classThis);
})();
export {HeaderService};
//# sourceMappingURL=header.service.js.map
