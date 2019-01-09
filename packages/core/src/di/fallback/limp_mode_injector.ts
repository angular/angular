/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {Type} from '../../interfaces/type';
import {stringify} from '../../utils/stringify';
import {InjectableDef, getInjectableDef} from '../interfaces/defs';
import {InjectionToken} from '../interfaces/injection_token';
import {InjectFlags} from '../interfaces/injector';


/**
 * Injects `root` tokens in limp mode.
 *
 * If no injector exists, we can still inject tree-shakable providers which have `providedIn` set to
 * `"root"`. This is known as the limp mode injection. In such case the value is stored in the
 * `InjectableDef`.
 */
export function injectRootLimpMode<T>(
    token: Type<T>| InjectionToken<T>, notFoundValue: T | undefined, flags: InjectFlags): T|null {
  const injectableDef: InjectableDef<T>|null = getInjectableDef(token);
  if (injectableDef && injectableDef.providedIn == 'root') {
    return injectableDef.value === undefined ? injectableDef.value = injectableDef.factory() :
                                               injectableDef.value;
  }
  if (flags & InjectFlags.Optional) return null;
  if (notFoundValue !== undefined) return notFoundValue;
  throw new Error(`Injector: NOT_FOUND [${stringify(token)}]`);
}
