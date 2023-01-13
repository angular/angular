/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {assertLessThan} from '../util/assert';

import {ɵɵdefineInjectable} from './interface/defs';

/**
 * Creates a token that can be used in a DI Provider.
 *
 * Use an `InjectionToken` whenever the type you are injecting is not reified (does not have a
 * runtime representation) such as when injecting an interface, callable type, array or
 * parameterized type.
 *
 * `InjectionToken` is parameterized on `T` which is the type of object which will be returned by
 * the `Injector`. This provides an additional level of type safety.
 *
 * ```
 * interface MyInterface {...}
 * const myInterface = injector.get(new InjectionToken<MyInterface>('SomeToken'));
 * // myInterface is inferred to be MyInterface.
 * ```
 *
 * When creating an `InjectionToken`, you can optionally specify a factory function which returns
 * (possibly by creating) a default value of the parameterized type `T`. This sets up the
 * `InjectionToken` using this factory as a provider as if it was defined explicitly in the
 * application's root injector. If the factory function, which takes zero arguments, needs to inject
 * dependencies, it can do so using the `inject` function.
 * As you can see in the Tree-shakable InjectionToken example below.
 *
 * Additionally, if a `factory` is specified you can also specify the `providedIn` option, which
 * overrides the above behavior and marks the token as belonging to a particular `@NgModule` (note:
 * this option is now deprecated). As mentioned above, `'root'` is the default value for
 * `providedIn`.
 *
 * The `providedIn: NgModule` and `providedIn: 'any'` options are deprecated.
 *
 * @usageNotes
 * ### Basic Examples
 *
 * ### Plain InjectionToken
 *
 * {@example core/di/ts/injector_spec.ts region='InjectionToken'}
 *
 * ### Tree-shakable InjectionToken
 *
 * {@example core/di/ts/injector_spec.ts region='ShakableInjectionToken'}
 *
 *
 * @publicApi
 */
export class InjectionToken<T> {
  /** @internal */
  readonly ngMetadataName = 'InjectionToken';

  readonly ɵprov: unknown;

  /**
   * @param _desc   Description for the token,
   *                used only for debugging purposes,
   *                it should but does not need to be unique
   * @param options Options for the token's usage, as described above
   */
  constructor(protected _desc: string, options?: {
    providedIn?: Type<any>|'root'|'platform'|'any'|null, factory: () => T
  }) {
    this.ɵprov = undefined;
    if (typeof options == 'number') {
      (typeof ngDevMode === 'undefined' || ngDevMode) &&
          assertLessThan(options, 0, 'Only negative numbers are supported here');
      // This is a special hack to assign __NG_ELEMENT_ID__ to this instance.
      // See `InjectorMarkers`
      (this as any).__NG_ELEMENT_ID__ = options;
    } else if (options !== undefined) {
      this.ɵprov = ɵɵdefineInjectable({
        token: this,
        providedIn: options.providedIn || 'root',
        factory: options.factory,
      });
    }
  }

  /**
   * @internal
   */
  get multi(): InjectionToken<Array<T>> {
    return this as InjectionToken<Array<T>>;
  }

  toString(): string {
    return `InjectionToken ${this._desc}`;
  }
}

export interface InjectableDefToken<T> extends InjectionToken<T> {
  ɵprov: unknown;
}
