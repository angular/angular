/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getClosureSafeProperty} from '../../util/property';

const TARGET = {} as any;

export const NG_COMPONENT_DEF = getClosureSafeProperty({ngComponentDef: TARGET}, TARGET);
export const NG_DIRECTIVE_DEF = getClosureSafeProperty({ngDirectiveDef: TARGET}, TARGET);
export const NG_INJECTABLE_DEF = getClosureSafeProperty({ngInjectableDef: TARGET}, TARGET);
export const NG_INJECTOR_DEF = getClosureSafeProperty({ngInjectorDef: TARGET}, TARGET);
export const NG_PIPE_DEF = getClosureSafeProperty({ngPipeDef: TARGET}, TARGET);
export const NG_MODULE_DEF = getClosureSafeProperty({ngModuleDef: TARGET}, TARGET);
