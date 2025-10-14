/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵɵdefineInjectable as defineInjectable} from './di/interface/defs';
import {createEnvironmentInjector} from './render3/ng_module_ref';
/**
 * A service used by the framework to create and cache injector instances.
 *
 * This service is used to create a single injector instance for each defer
 * block definition, to avoid creating an injector for each defer block instance
 * of a certain type.
 */
export class CachedInjectorService {
  cachedInjectors = new Map();
  getOrCreateInjector(key, parentInjector, providers, debugName) {
    if (!this.cachedInjectors.has(key)) {
      const injector =
        providers.length > 0
          ? createEnvironmentInjector(providers, parentInjector, debugName)
          : null;
      this.cachedInjectors.set(key, injector);
    }
    return this.cachedInjectors.get(key);
  }
  ngOnDestroy() {
    try {
      for (const injector of this.cachedInjectors.values()) {
        if (injector !== null) {
          injector.destroy();
        }
      }
    } finally {
      this.cachedInjectors.clear();
    }
  }
  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ defineInjectable({
    token: CachedInjectorService,
    providedIn: 'environment',
    factory: () => new CachedInjectorService(),
  });
}
//# sourceMappingURL=cached_injector_service.js.map
