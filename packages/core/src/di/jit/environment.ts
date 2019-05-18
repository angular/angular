/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../interface/type';
import {isForwardRef, resolveForwardRef} from '../forward_ref';
import {ɵɵinject} from '../injector_compatibility';
import {getInjectableDef, getInjectorDef, ɵɵdefineInjectable, ɵɵdefineInjector} from '../interface/defs';



/**
 * A mapping of the @angular/core API surface used in generated expressions to the actual symbols.
 *
 * This should be kept up to date with the public exports of @angular/core.
 */
export const angularCoreDiEnv: {[name: string]: Function} = {
  'ɵɵdefineInjectable': ɵɵdefineInjectable,
  'ɵɵdefineInjector': ɵɵdefineInjector,
  'ɵɵinject': ɵɵinject,
  'ɵɵgetFactoryOf': getFactoryOf,
};

function getFactoryOf<T>(type: Type<any>): ((type?: Type<T>) => T)|null {
  const typeAny = type as any;

  if (isForwardRef(type)) {
    return (() => {
      const factory = getFactoryOf<T>(resolveForwardRef(typeAny));
      return factory ? factory() : null;
    }) as any;
  }

  const def = getInjectableDef<T>(typeAny) || getInjectorDef<T>(typeAny);
  if (!def || def.factory === undefined) {
    return null;
  }
  return def.factory;
}
