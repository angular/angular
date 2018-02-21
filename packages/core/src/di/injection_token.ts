/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../type';

import {Injectable, defineInjectable} from './injectable';

/**
 * Creates a token that can be used in a DI Provider.
 *
 * Use an `InjectionToken` whenever the type you are injecting is not reified (does not have a
 * runtime representation) such as when injecting an interface, callable type, array or
 * parametrized type.
 *
 * `InjectionToken` is parameterized on `T` which is the type of object which will be returned by
 * the `Injector`. This provides additional level of type safety.
 *
 * ```
 * interface MyInterface {...}
 * var myInterface = injector.get(new InjectionToken<MyInterface>('SomeToken'));
 * // myInterface is inferred to be MyInterface.
 * ```
 *
 * ### Example
 *
 * {@example core/di/ts/injector_spec.ts region='InjectionToken'}
 *
 * @stable
 */
export class InjectionToken<T> {
  /** @internal */
  readonly ngMetadataName = 'InjectionToken';

  readonly ngInjectableDef: Injectable|undefined;

  constructor(protected _desc: string, options?: {scope: Type<any>, factory: () => T}) {
    if (options !== undefined) {
      this.ngInjectableDef = defineInjectable({
        scope: options.scope,
        factory: options.factory,
      });
    } else {
      this.ngInjectableDef = undefined;
    }
  }

  toString(): string { return `InjectionToken ${this._desc}`; }
}
