/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {compileComponent, compileDirective} from '../../render3/jit/directive';
import {compileInjectable} from '../../render3/jit/injectable';
import {compileNgModule, compileNgModuleDefs, patchComponentDefWithScope} from '../../render3/jit/module';
import {compilePipe} from '../../render3/jit/pipe';

export const ivyEnabled = true;
export const R3_COMPILE_COMPONENT = compileComponent;
export const R3_COMPILE_DIRECTIVE = compileDirective;
export const R3_COMPILE_INJECTABLE = compileInjectable;
export const R3_COMPILE_NGMODULE = compileNgModule;
export const R3_COMPILE_PIPE = compilePipe;
export const R3_COMPILE_NGMODULE_DEFS = compileNgModuleDefs;
export const R3_PATCH_COMPONENT_DEF_WTIH_SCOPE = patchComponentDefWithScope;
