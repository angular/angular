/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../interface/type';
import {inject} from '../injector_compatibility';
import {defineInjectable, defineInjector, getInjectableDef, getInjectorDef} from '../interface/defs';


/**
 * A mapping of the @angular/core API surface used in generated expressions to the actual symbols.
 *
 * This should be kept up to date with the public exports of @angular/core.
 */
export const angularCoreDiEnv: {[name: string]: Function} = {
  'defineInjectable': defineInjectable,
  'defineInjector': defineInjector,
  'inject': inject,
  'ɵgetFactoryOf': getFactoryOf,
};

function getFactoryOf<T>(type: Type<any>): ((type: Type<T>| null) => T)|null {
  const typeAny = type as any;
  const def = getInjectableDef<T>(typeAny) || getInjectorDef<T>(typeAny);
  if (!def || def.factory === undefined) {
    return null;
  }
  return def.factory;
}
