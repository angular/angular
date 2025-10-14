/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Directive, ElementRef, inject, input} from '@angular/core';
/**
 * Use on elements that are deemed to be animation layers.
 */
let AnimationLayerDirective = (() => {
  let _classDecorators = [
    Directive({
      selector: '[adevAnimationLayer]',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AnimationLayerDirective = class {
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
      AnimationLayerDirective = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    elementRef = inject(ElementRef);
    id = input.required({alias: 'layerId'});
  };
  return (AnimationLayerDirective = _classThis);
})();
export {AnimationLayerDirective};
//# sourceMappingURL=animation-layer.directive.js.map
