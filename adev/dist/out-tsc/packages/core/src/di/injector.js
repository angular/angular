/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {createInjector} from './create_injector';
import {THROW_IF_NOT_FOUND, ɵɵinject} from './injector_compatibility';
import {INJECTOR} from './injector_token';
import {ɵɵdefineInjectable} from './interface/defs';
import {NullInjector} from './null_injector';
/**
 * Concrete injectors implement this interface. Injectors are configured
 * with [providers](guide/di/dependency-injection-providers) that associate
 * dependencies of various types with [injection tokens](guide/di/dependency-injection-providers).
 *
 * @see [DI Providers](guide/di/dependency-injection-providers).
 * @see {@link StaticProvider}
 *
 * @usageNotes
 *
 *  The following example creates a service injector instance.
 *
 * {@example core/di/ts/provider_spec.ts region='ConstructorProvider'}
 *
 * ### Usage example
 *
 * {@example core/di/ts/injector_spec.ts region='Injector'}
 *
 * `Injector` returns itself when given `Injector` as a token:
 *
 * {@example core/di/ts/injector_spec.ts region='injectInjector'}
 *
 * @publicApi
 */
export class Injector {
  static THROW_IF_NOT_FOUND = THROW_IF_NOT_FOUND;
  static NULL = new NullInjector();
  static create(options, parent) {
    if (Array.isArray(options)) {
      return createInjector({name: ''}, parent, options, '');
    } else {
      const name = options.name ?? '';
      return createInjector({name}, options.parent, options.providers, name);
    }
  }
  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: Injector,
    providedIn: 'any',
    factory: () => ɵɵinject(INJECTOR),
  });
  /**
   * @internal
   * @nocollapse
   */
  static __NG_ELEMENT_ID__ = -1 /* InjectorMarkers.Injector */;
}
//# sourceMappingURL=injector.js.map
