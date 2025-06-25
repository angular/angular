/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from './type';
/**
 * Information about how a type or `InjectionToken` interfaces with the DI
 * system. This describes:
 *
 * 1. *How* the type is provided
 *    The declaration must specify only one of the following:
 *    - A `value` which is a predefined instance of the type.
 *    - A `factory` which defines how to create the given type `T`, possibly
 *      requesting injection of other types if necessary.
 *    - Neither, in which case the type is expected to already be present in the
 *      injector hierarchy. This is used for internal use cases.
 *
 * 2. *Where* the type is stored (if it is stored)
 *    - The `providedIn` parameter specifies which injector the type belongs to.
 *    - The `token` is used as the key to store the type in the injector.
 */
export interface ɵɵInjectableDeclaration<T> {
  /**
   * Specifies that the given type belongs to a particular `Injector`,
   * `NgModule`, or a special scope (e.g. `'root'`).
   *
   * `any` is deprecated and will be removed soon.
   *
   * A value of `null` indicates that the injectable does not belong to any
   * scope, and won't be stored in any injector. For declarations with a
   * factory, this will create a new instance of the type each time it is
   * requested.
   */
  providedIn: Type<any> | 'root' | 'platform' | 'any' | null;

  /**
   * The token to which this definition belongs.
   *
   * Note that this may not be the same as the type that the `factory` will create.
   */
  token: unknown;

  /**
   * Factory method to execute to create an instance of the injectable.
   */
  factory?: (t?: Type<any>) => T;

  /**
   * In a case of no explicit injector, a location where the instance of the injectable is stored.
   */
  value?: T;
}

/**
 * A `Type` which has a `ɵprov: ɵɵInjectableDeclaration` static field.
 *
 * `InjectableType`s contain their own Dependency Injection metadata and are usable in an
 * `InjectorDef`-based `StaticInjector`.
 *
 * @publicApi
 */
export interface InjectionToken<T> {
  ɵprov: ɵɵInjectableDeclaration<T>;
}

export function defineInjectable<T>(opts: {
  token: unknown;
  providedIn?: Type<any> | 'root' | 'platform' | 'any' | 'environment' | null;
  factory: () => T;
}): unknown {
  return {
    token: opts.token,
    providedIn: (opts.providedIn as any) || null,
    factory: opts.factory,
    value: undefined,
  } as ɵɵInjectableDeclaration<T>;
}

export type Constructor<T> = Function & {prototype: T};

export function registerInjectable<T>(
  ctor: unknown,
  declaration: ɵɵInjectableDeclaration<T>,
): InjectionToken<T> {
  (ctor as unknown as InjectionToken<T>).ɵprov = declaration;
  return ctor as Constructor<T> & InjectionToken<T>;
}
