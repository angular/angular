/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Pipe} from '@angular/core';
let IsActiveNavigationItem = (() => {
  let _classDecorators = [
    Pipe({
      name: 'isActiveNavigationItem',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var IsActiveNavigationItem = class {
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
      IsActiveNavigationItem = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // Check whether provided item: `itemToCheck` should be marked as active, based on `activeItem`.
    // In addition to `activeItem`, we should mark all its parents, grandparents, etc. as active.
    transform(itemToCheck, activeItem) {
      let node = activeItem?.parent;
      while (node) {
        if (node === itemToCheck) {
          return true;
        }
        node = node.parent;
      }
      return false;
    }
  };
  return (IsActiveNavigationItem = _classThis);
})();
export {IsActiveNavigationItem};
//# sourceMappingURL=is-active-navigation-item.pipe.js.map
