/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵinject as inject} from '../../di/injector_compatibility';
import {ɵɵdefineInjectable as defineInjectable} from '../../di/interface/defs';
import {internalImportProvidersFrom} from '../../di/provider_collection';
import {EnvironmentInjector} from '../../di/r3_injector';
import {OnDestroy} from '../../interface/lifecycle_hooks';
import {ComponentDef} from '../interfaces/definition';
import {createEnvironmentInjector} from '../ng_module_ref';

/**
 * A service used by the framework to create instances of standalone injectors. Those injectors are
 * created on demand in case of dynamic component instantiation and contain ambient providers
 * collected from the imports graph rooted at a given standalone component.
 */
class StandaloneService implements OnDestroy {
  cachedInjectors = new Map<string, EnvironmentInjector|null>();

  constructor(private _injector: EnvironmentInjector) {}

  getOrCreateStandaloneInjector(componentDef: ComponentDef<unknown>): EnvironmentInjector|null {
    if (!componentDef.standalone) {
      return null;
    }

    if (!this.cachedInjectors.has(componentDef.id)) {
      const providers = internalImportProvidersFrom(false, componentDef.type);
      const standaloneInjector = providers.length > 0 ?
          createEnvironmentInjector(
              [providers], this._injector, `Standalone[${componentDef.type.name}]`) :
          null;
      this.cachedInjectors.set(componentDef.id, standaloneInjector);
    }

    return this.cachedInjectors.get(componentDef.id)!;
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
  static ɵprov = /** @pureOrBreakMyCode */ defineInjectable({
    token: StandaloneService,
    providedIn: 'environment',
    factory: () => new StandaloneService(inject(EnvironmentInjector)),
  });
}

/**
 * A feature that acts as a setup code for the {@link StandaloneService}.
 *
 * The most important responsibility of this feature is to expose the "getStandaloneInjector"
 * function (an entry points to a standalone injector creation) on a component definition object. We
 * go through the features infrastructure to make sure that the standalone injector creation logic
 * is tree-shakable and not included in applications that don't use standalone components.
 *
 * @codeGenApi
 */
export function ɵɵStandaloneFeature(definition: ComponentDef<unknown>) {
  definition.getStandaloneInjector = (parentInjector: EnvironmentInjector) => {
    return parentInjector.get(StandaloneService).getOrCreateStandaloneInjector(definition);
  };
}
