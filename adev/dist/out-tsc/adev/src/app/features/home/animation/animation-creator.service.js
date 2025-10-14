/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {inject, Injectable, Injector} from '@angular/core';
import {Animation} from './animation';
let AnimationCreatorService = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AnimationCreatorService = class {
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
      AnimationCreatorService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    injector = inject(Injector);
    /**
     * Create an `Animation` object
     *
     * @param layers Animation layers
     * @param config Animation config
     * @returns `Animation`
     */
    createAnimation(layers, config) {
      return new Animation(layers, this.injector, config);
    }
  };
  return (AnimationCreatorService = _classThis);
})();
export {AnimationCreatorService};
//# sourceMappingURL=animation-creator.service.js.map
