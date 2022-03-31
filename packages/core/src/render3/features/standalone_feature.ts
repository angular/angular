/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵinject as inject} from '../../di/injector_compatibility';
import {ɵɵdefineInjectable as defineInjectable} from '../../di/interface/defs';
import {importProvidersFrom} from '../../di/provider_collection';
import {EnvironmentInjector} from '../../di/r3_injector';
import {OnDestroy} from '../../interface/lifecycle_hooks';
import {ComponentDef} from '../interfaces/definition';
import {createEnvironmentInjector} from '../ng_module_ref';

// TODO(pk): document
class StandaloneService implements OnDestroy {
  cachedInjectors = new Map<ComponentDef<unknown>, EnvironmentInjector|null>();

  constructor(private _injector: EnvironmentInjector) {}

  setInjector(componentDef: ComponentDef<unknown>, injector: EnvironmentInjector) {
    this.cachedInjectors.set(componentDef, injector);
  }

  getOrCreateStandaloneInjector(componentDef: ComponentDef<unknown>): EnvironmentInjector|null {
    if (!componentDef.standalone) {
      return null;
    }

    if (!this.cachedInjectors.has(componentDef)) {
      const providers = importProvidersFrom(componentDef.type);
      const standaloneInjector = providers.length > 0 ?
          createEnvironmentInjector(
              providers, this._injector, `Standalone[${componentDef.type.name}]`) :
          null;
      this.cachedInjectors.set(componentDef, standaloneInjector);
    }

    return this.cachedInjectors.get(componentDef)!;
  }

  ngOnDestroy() {
    try {
      for (const injector of this.cachedInjectors.values()) {
        if (injector !== null && injector !== this._injector) {
          injector.destroy();
        }
      }
    } finally {
      this.cachedInjectors.clear();
    }
  }

  static ɵprov = /** @pureOrBreakMyCode */ defineInjectable({
    token: StandaloneService,
    providedIn: 'environment',
    factory: () => new StandaloneService(inject(EnvironmentInjector)),
  });
}

/**
 * TODO(pk): documentation
 *
 * @codeGenApi
 */
export function ɵɵStandaloneFeature(definition: ComponentDef<unknown>) {
  definition.getStandaloneInjector = (parentInjector: EnvironmentInjector) => {
    return parentInjector.get(StandaloneService).getOrCreateStandaloneInjector(definition);
  };
}
