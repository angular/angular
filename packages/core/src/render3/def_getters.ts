/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '../interface/type';
import type {NgModuleDef} from '../r3_symbols';
import {stringify} from '../util/stringify';
import {NG_COMP_DEF, NG_DIR_DEF, NG_MOD_DEF, NG_PIPE_DEF} from './fields';
import type {ComponentDef, DirectiveDef, PipeDef} from './interfaces/definition';

export function getNgModuleDef<T>(type: any, throwNotFound: true): NgModuleDef<T>;
export function getNgModuleDef<T>(type: any): NgModuleDef<T> | null;
export function getNgModuleDef<T>(type: any, throwNotFound?: boolean): NgModuleDef<T> | null {
  const ngModuleDef = type[NG_MOD_DEF] || null;
  if (!ngModuleDef && throwNotFound === true) {
    throw new Error(`Type ${stringify(type)} does not have 'ɵmod' property.`);
  }
  return ngModuleDef;
}

/**
 * The following getter methods retrieve the definition from the type. Currently the retrieval
 * honors inheritance, but in the future we may change the rule to require that definitions are
 * explicit. This would require some sort of migration strategy.
 */

export function getComponentDef<T>(type: any): ComponentDef<T> | null {
  return type[NG_COMP_DEF] || null;
}

export function getDirectiveDef<T>(type: any): DirectiveDef<T> | null {
  return type[NG_DIR_DEF] || null;
}

export function getPipeDef<T>(type: any): PipeDef<T> | null {
  return type[NG_PIPE_DEF] || null;
}

/**
 * Checks whether a given Component, Directive or Pipe is marked as standalone.
 * This will return false if passed anything other than a Component, Directive, or Pipe class
 * See [this guide](guide/components/importing) for additional information:
 *
 * @param type A reference to a Component, Directive or Pipe.
 * @publicApi
 */
export function isStandalone(type: Type<unknown>): boolean {
  const def = getComponentDef(type) || getDirectiveDef(type) || getPipeDef(type);
  return def !== null && def.standalone;
}
