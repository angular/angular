/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '../di/injector';
import { Type } from '../interface/type';
import { CompilerOptions } from '../linker/compiler';
import { NgModuleFactory } from '../linker/ng_module_factory';
export declare function compileNgModuleFactory<M>(injector: Injector, options: CompilerOptions, moduleType: Type<M>): Promise<NgModuleFactory<M>>;
