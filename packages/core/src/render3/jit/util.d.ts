/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ModuleWithProviders } from '../../di/interface/provider';
import { Type } from '../../interface/type';
import { NgModuleDef } from '../../metadata/ng_module_def';
import type { ComponentType, DirectiveType, PipeType } from '../interfaces/definition';
export declare function isModuleWithProviders(value: any): value is ModuleWithProviders<{}>;
export declare function isNgModule<T>(value: Type<T>): value is Type<T> & {
    ɵmod: NgModuleDef<T>;
};
export declare function isPipe<T>(value: Type<T>): value is PipeType<T>;
export declare function isDirective<T>(value: Type<T>): value is DirectiveType<T>;
export declare function isComponent<T>(value: Type<T>): value is ComponentType<T>;
export declare function verifyStandaloneImport(depType: Type<unknown>, importingType: Type<unknown>): void;
