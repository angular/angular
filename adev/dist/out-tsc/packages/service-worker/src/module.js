/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {NgModule} from '@angular/core';
import {provideServiceWorker} from './provider';
import {SwPush} from './push';
import {SwUpdate} from './update';
/**
 * @publicApi
 */
let ServiceWorkerModule = (() => {
  let _classDecorators = [NgModule({providers: [SwPush, SwUpdate]})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ServiceWorkerModule = class {
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
      ServiceWorkerModule = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /**
     * Register the given Angular Service Worker script.
     *
     * If `enabled` is set to `false` in the given options, the module will behave as if service
     * workers are not supported by the browser, and the service worker will not be registered.
     */
    static register(script, options = {}) {
      return {
        ngModule: ServiceWorkerModule,
        providers: [provideServiceWorker(script, options)],
      };
    }
  };
  return (ServiceWorkerModule = _classThis);
})();
export {ServiceWorkerModule};
//# sourceMappingURL=module.js.map
