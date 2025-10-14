/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  AnimationDriver,
  NoopAnimationDriver,
  ɵAnimationEngine as AnimationEngine,
  ɵAnimationRendererFactory as AnimationRendererFactory,
  ɵAnimationStyleNormalizer as AnimationStyleNormalizer,
  ɵWebAnimationsDriver as WebAnimationsDriver,
  ɵWebAnimationsStyleNormalizer as WebAnimationsStyleNormalizer,
} from '@angular/animations/browser';
import {ANIMATION_MODULE_TYPE, inject, Injectable, NgZone, RendererFactory2} from '@angular/core';
import {ɵDomRendererFactory2 as DomRendererFactory2} from '../../index';
let InjectableAnimationEngine = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = AnimationEngine;
  var InjectableAnimationEngine = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      InjectableAnimationEngine = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // The `ApplicationRef` is injected here explicitly to force the dependency ordering.
    // Since the `ApplicationRef` should be created earlier before the `AnimationEngine`, they
    // both have `ngOnDestroy` hooks and `flush()` must be called after all views are destroyed.
    constructor(doc, driver, normalizer) {
      super(doc, driver, normalizer);
    }
    ngOnDestroy() {
      this.flush();
    }
  };
  return (InjectableAnimationEngine = _classThis);
})();
export {InjectableAnimationEngine};
export function instantiateDefaultStyleNormalizer() {
  return new WebAnimationsStyleNormalizer();
}
export function instantiateRendererFactory() {
  return new AnimationRendererFactory(
    inject(DomRendererFactory2),
    inject(AnimationEngine),
    inject(NgZone),
  );
}
const SHARED_ANIMATION_PROVIDERS = [
  {provide: AnimationStyleNormalizer, useFactory: instantiateDefaultStyleNormalizer},
  {provide: AnimationEngine, useClass: InjectableAnimationEngine},
  {
    provide: RendererFactory2,
    useFactory: instantiateRendererFactory,
  },
];
/**
 * Separate providers from the actual module so that we can do a local modification in Google3 to
 * include them in the BrowserTestingModule.
 */
export const BROWSER_NOOP_ANIMATIONS_PROVIDERS = [
  {provide: AnimationDriver, useClass: NoopAnimationDriver},
  {provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations'},
  ...SHARED_ANIMATION_PROVIDERS,
];
/**
 * Separate providers from the actual module so that we can do a local modification in Google3 to
 * include them in the BrowserModule.
 */
export const BROWSER_ANIMATIONS_PROVIDERS = [
  // Note: the `ngServerMode` happen inside factories to give the variable time to initialize.
  {
    provide: AnimationDriver,
    useFactory: () =>
      typeof ngServerMode !== 'undefined' && ngServerMode
        ? new NoopAnimationDriver()
        : new WebAnimationsDriver(),
  },
  {
    provide: ANIMATION_MODULE_TYPE,
    useFactory: () =>
      typeof ngServerMode !== 'undefined' && ngServerMode ? 'NoopAnimations' : 'BrowserAnimations',
  },
  ...SHARED_ANIMATION_PROVIDERS,
];
//# sourceMappingURL=providers.js.map
