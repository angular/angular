/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  DestroyRef,
  ENVIRONMENT_INITIALIZER,
  EnvironmentInjector,
  Injectable,
  createEnvironmentInjector,
  inject,
} from '@angular/core';
/**
 * inject a service asynchronously
 *
 * @param: injector. If the injector is a NodeInjector the loaded module will be destroyed alonside its injector
 */
export async function injectAsync(injector, providerLoader) {
  const injectImpl = injector.get(InjectAsyncImpl);
  return injectImpl.get(injector, providerLoader);
}
let InjectAsyncImpl = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var InjectAsyncImpl = class {
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
      InjectAsyncImpl = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    overrides = new WeakMap(); // no need to cleanup
    override(type, mock) {
      this.overrides.set(type, mock);
    }
    async get(injector, providerLoader) {
      const type = await providerLoader();
      // Check if we have overrides, O(1), low overhead
      if (this.overrides.has(type)) {
        const override = this.overrides.get(type);
        return new override();
      }
      if (!(injector instanceof EnvironmentInjector)) {
        // this is the DestroyRef of the component
        const destroyRef = injector.get(DestroyRef);
        // This is the parent injector of the injector we're creating
        const environmentInjector = injector.get(EnvironmentInjector);
        // Creating an environment injector to destroy it afterwards
        const newInjector = createEnvironmentInjector([type], environmentInjector);
        // Destroy the injector to trigger DestroyRef.onDestroy on our service
        destroyRef.onDestroy(() => {
          newInjector.destroy();
        });
        // We want to create the new instance of our service with our new injector
        injector = newInjector;
      }
      return injector.get(type);
    }
  };
  return (InjectAsyncImpl = _classThis);
})();
/**
 * Helper function to mock the lazy loaded module in `injectAsync`
 *
 * @usage
 * TestBed.configureTestingModule({
 *     providers: [
 *     mockAsyncProvider(SandboxService, fakeSandboxService)
 *   ]
 * });
 */
export function mockAsyncProvider(type, mock) {
  return [
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        inject(InjectAsyncImpl).override(type, mock);
      },
    },
  ];
}
//# sourceMappingURL=inject-async.js.map
