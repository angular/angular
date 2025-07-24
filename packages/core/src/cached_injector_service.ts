/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵɵdefineInjectable as defineInjectable} from './di/interface/defs';
import {Provider} from './di/interface/provider';
import {EnvironmentInjector} from './di/r3_injector';
import {OnDestroy} from './interface/lifecycle_hooks';
import {createEnvironmentInjector} from './render3/ng_module_ref';

/**
 * A service used by the framework to create and cache injector instances.
 *
 * This service is used to create a single injector instance for each defer
 * block definition, to avoid creating an injector for each defer block instance
 * of a certain type.
 */
export class CachedInjectorService implements OnDestroy {
  private cachedInjectors = new Map<unknown, EnvironmentInjector | null>();

  getOrCreateInjector(
    key: unknown,
    parentInjector: EnvironmentInjector,
    providers: Provider[],
    debugName?: string,
  ) {
    if (!this.cachedInjectors.has(key)) {
      const injector =
        providers.length > 0
          ? createEnvironmentInjector(providers, parentInjector, debugName)
          : null;
      this.cachedInjectors.set(key, injector);
    }
    return this.cachedInjectors.get(key)!;
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
