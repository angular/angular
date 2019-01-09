/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleDef} from '../../decorators/ng_module';
import {getClosureSafeProperty} from '../../utils/property';
import {stringify} from '../../utils/stringify';

import {ComponentDef, DirectiveDef, PipeDef} from './definition';

export const NG_COMPONENT_DEF = getClosureSafeProperty({ngComponentDef: getClosureSafeProperty});
export const NG_DIRECTIVE_DEF = getClosureSafeProperty({ngDirectiveDef: getClosureSafeProperty});
export const NG_PIPE_DEF = getClosureSafeProperty({ngPipeDef: getClosureSafeProperty});
export const NG_MODULE_DEF = getClosureSafeProperty({ngModuleDef: getClosureSafeProperty});
export const NG_BASE_DEF = getClosureSafeProperty({ngBaseDef: getClosureSafeProperty});

/**
 * If a directive is diPublic, bloomAdd sets a property on the type with this constant as
 * the key and the directive's unique ID as the value. This allows us to map directives to their
 * bloom filter bit for DI.
 */
export const NG_ELEMENT_ID = getClosureSafeProperty({__NG_ELEMENT_ID__: getClosureSafeProperty});

/**
 * The following getter methods retrieve the definition form the type. Currently the retrieval
 * honors inheritance, but in the future we may change the rule to require that definitions are
 * explicit. This would require some sort of migration strategy.
 */

export function getComponentDef<T>(type: any): ComponentDef<T>|null {
  return (type as any)[NG_COMPONENT_DEF] || null;
}

export function getDirectiveDef<T>(type: any): DirectiveDef<T>|null {
  return (type as any)[NG_DIRECTIVE_DEF] || null;
}

export function getPipeDef<T>(type: any): PipeDef<T>|null {
  return (type as any)[NG_PIPE_DEF] || null;
}

export function getNgModuleDef<T>(type: any, throwNotFound: true): NgModuleDef<T>;
export function getNgModuleDef<T>(type: any): NgModuleDef<T>|null;
export function getNgModuleDef<T>(type: any, throwNotFound?: boolean): NgModuleDef<T>|null {
  const ngModuleDef = (type as any)[NG_MODULE_DEF] || null;
  if (!ngModuleDef && throwNotFound === true) {
    throw new Error(`Type ${stringify(type)} does not have 'ngModuleDef' property.`);
  }
  return ngModuleDef;
}
