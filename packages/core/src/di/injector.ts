/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createInjector} from './create_injector';
import {THROW_IF_NOT_FOUND, ɵɵinject} from './injector_compatibility';
import {InjectorMarkers} from './injector_marker';
import {INJECTOR} from './injector_token';
import {ɵɵdefineInjectable} from './interface/defs';
import {InjectOptions} from './interface/injector';
import {Provider, StaticProvider} from './interface/provider';
import {NullInjector} from './null_injector';
import {ProviderToken} from './provider_token';

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
export abstract class Injector {
  static THROW_IF_NOT_FOUND = THROW_IF_NOT_FOUND;
  static NULL: Injector = /* @__PURE__ */ new NullInjector();

  /**
   * Retrieves an instance from the injector based on the provided token.
   * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
   * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
   */
  abstract get<T>(
    token: ProviderToken<T>,
    notFoundValue: undefined,
    options: InjectOptions & {
      optional?: false;
    },
  ): T;
  /**
   * Retrieves an instance from the injector based on the provided token.
   * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
   * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
   */
  abstract get<T>(
    token: ProviderToken<T>,
    notFoundValue: null | undefined,
    options: InjectOptions,
  ): T | null;
  /**
   * Retrieves an instance from the injector based on the provided token.
   * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
   * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
   */
  abstract get<T>(token: ProviderToken<T>, notFoundValue?: T, options?: InjectOptions): T;
  /**
   * @deprecated from v4.0.0 use ProviderToken<T>
   * @suppress {duplicate}
   */
  abstract get<T>(token: string | ProviderToken<T>, notFoundValue?: any): any;

  /**
   * @deprecated from v5 use the new signature Injector.create(options)
   */
  static create(providers: StaticProvider[], parent?: Injector): Injector;

  /**
   * Creates a new injector instance that provides one or more dependencies,
   * according to a given type or types of `StaticProvider`.
   *
   * @param options An object with the following properties:
   * * `providers`: An array of providers of the [StaticProvider type](api/core/StaticProvider).
   * * `parent`: (optional) A parent injector.
   * * `name`: (optional) A developer-defined identifying name for the new injector.
   *
   * @returns The new injector instance.
   *
   */
  static create(options: {
    providers: Array<Provider | StaticProvider>;
    parent?: Injector;
    name?: string;
  }): DestroyableInjector;

  static create(
    options:
      | StaticProvider[]
      | {providers: Array<Provider | StaticProvider>; parent?: Injector; name?: string},
    parent?: Injector,
  ): Injector {
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
  static __NG_ELEMENT_ID__ = InjectorMarkers.Injector;
}

/**
 * An Injector that the owner can destroy and trigger the DestroyRef.destroy hooks.
 *
 * @publicApi
 */
export interface DestroyableInjector extends Injector {
  destroy(): void;
}
