/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable} from '@angular/core';
/**
 * This class wraps the platform Navigation API which allows server-specific and test
 * implementations.
 *
 * Browser support is limited, so this API may not be available in all environments,
 * may contain bugs, and is experimental.
 *
 * @experimental 21.0.0
 */
let PlatformNavigation = (() => {
  let _classDecorators = [
    Injectable({providedIn: 'platform', useFactory: () => window.navigation}),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var PlatformNavigation = class {
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
      PlatformNavigation = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (PlatformNavigation = _classThis);
})();
export {PlatformNavigation};
//# sourceMappingURL=platform_navigation.js.map
