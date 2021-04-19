/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {throwProviderNotFoundError} from '../render3/errors_di';
import {assertNotEqual} from '../util/assert';
import {stringify} from '../util/stringify';

import {getInjectableDef, ɵɵInjectableDeclaration} from './interface/defs';
import {InjectFlags} from './interface/injector';
import {ProviderToken} from './provider_token';


/**
 * Current implementation of inject.
 *
 * By default, it is `injectInjectorOnly`, which makes it `Injector`-only aware. It can be changed
 * to `directiveInject`, which brings in the `NodeInjector` system of ivy. It is designed this
 * way for two reasons:
 *  1. `Injector` should not depend on ivy logic.
 *  2. To maintain tree shake-ability we don't want to bring in unnecessary code.
 */
let _injectImplementation: (<T>(token: ProviderToken<T>, flags?: InjectFlags) => T | null)|
    undefined;
export function getInjectImplementation() {
  return _injectImplementation;
}


/**
 * Sets the current inject implementation.
 */
export function setInjectImplementation(
    impl: (<T>(token: ProviderToken<T>, flags?: InjectFlags) => T | null)|
    undefined): (<T>(token: ProviderToken<T>, flags?: InjectFlags) => T | null)|undefined {
  const previous = _injectImplementation;
  _injectImplementation = impl;
  return previous;
}


/**
 * Injects `root` tokens in limp mode.
 *
 * If no injector exists, we can still inject tree-shakable providers which have `providedIn` set to
 * `"root"`. This is known as the limp mode injection. In such case the value is stored in the
 * injectable definition.
 */
export function injectRootLimpMode<T>(
    token: ProviderToken<T>, notFoundValue: T|undefined, flags: InjectFlags): T|null {
  const injectableDef: ɵɵInjectableDeclaration<T>|null = getInjectableDef(token);
  if (injectableDef && injectableDef.providedIn == 'root') {
    return injectableDef.value === undefined ? injectableDef.value = injectableDef.factory() :
                                               injectableDef.value;
  }
  if (flags & InjectFlags.Optional) return null;
  if (notFoundValue !== undefined) return notFoundValue;
  throwProviderNotFoundError(stringify(token), 'Injector');
}


/**
 * Assert that `_injectImplementation` is not `fn`.
 *
 * This is useful, to prevent infinite recursion.
 *
 * @param fn Function which it should not equal to
 */
export function assertInjectImplementationNotEqual(
    fn: (<T>(token: ProviderToken<T>, flags?: InjectFlags) => T | null)) {
  ngDevMode &&
      assertNotEqual(_injectImplementation, fn, 'Calling ɵɵinject would cause infinite recursion');
}
