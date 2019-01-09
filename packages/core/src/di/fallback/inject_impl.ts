/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../interfaces/type';
import {InjectionToken} from '../interfaces/injection_token';
import {InjectFlags} from '../interfaces/injector';

/**
* Current implementation of inject.
*
* By default, it is `injectInjectorOnly`, which makes it `Injector`-only aware. It can be changed
* to `directiveInject`, which brings in the `NodeInjector` system of ivy. It is designed this
* way for two reasons:
*  1. `Injector` should not depend on ivy logic.
*  2. To maintain tree shake-ability we don't want to bring in unnecessary code.
*/
let _injectImplementation: (<T>(token: Type<T>| InjectionToken<T>, flags: InjectFlags) => T | null)|
    undefined;

/**
 * Sets the current inject implementation.
 */
export function setInjectImplementation(
    impl: (<T>(token: Type<T>| InjectionToken<T>, flags?: InjectFlags) => T | null) | undefined):
    (<T>(token: Type<T>| InjectionToken<T>, flags?: InjectFlags) => T | null)|undefined {
  const previous = _injectImplementation;
  _injectImplementation = impl;
  return previous;
}

export function getInjectImplementation():
    (<T>(token: Type<T>| InjectionToken<T>, flags: InjectFlags) => T | null)|undefined {
  return _injectImplementation;
}