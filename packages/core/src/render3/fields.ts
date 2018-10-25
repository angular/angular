/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getClosureSafeProperty} from '../util/property';

export const NG_COMPONENT_DEF = getClosureSafeProperty({ngComponentDef: getClosureSafeProperty});
export const NG_DIRECTIVE_DEF = getClosureSafeProperty({ngDirectiveDef: getClosureSafeProperty});
export const NG_INJECTABLE_DEF = getClosureSafeProperty({ngInjectableDef: getClosureSafeProperty});
export const NG_INJECTOR_DEF = getClosureSafeProperty({ngInjectorDef: getClosureSafeProperty});
export const NG_PIPE_DEF = getClosureSafeProperty({ngPipeDef: getClosureSafeProperty});
export const NG_MODULE_DEF = getClosureSafeProperty({ngModuleDef: getClosureSafeProperty});
export const NG_BASE_DEF = getClosureSafeProperty({ngBaseDef: getClosureSafeProperty});

/**
 * If a directive is diPublic, bloomAdd sets a property on the type with this constant as
 * the key and the directive's unique ID as the value. This allows us to map directives to their
 * bloom filter bit for DI.
 */
export const NG_ELEMENT_ID = getClosureSafeProperty({__NG_ELEMENT_ID__: getClosureSafeProperty});
