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
