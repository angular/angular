/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '../interface/type';
import type { NgModuleDef } from '../r3_symbols';
import type { ComponentDef, DirectiveDef, PipeDef } from './interfaces/definition';
export declare function getNgModuleDef<T>(type: any): NgModuleDef<T> | null;
export declare function getNgModuleDefOrThrow<T>(type: any): NgModuleDef<T> | never;
/**
 * The following getter methods retrieve the definition from the type. Currently the retrieval
 * honors inheritance, but in the future we may change the rule to require that definitions are
 * explicit. This would require some sort of migration strategy.
 */
export declare function getComponentDef<T>(type: any): ComponentDef<T> | null;
export declare function getDirectiveDefOrThrow<T>(type: any): DirectiveDef<T> | never;
export declare function getDirectiveDef<T>(type: any): DirectiveDef<T> | null;
export declare function getPipeDef<T>(type: any): PipeDef<T> | null;
/**
 * Checks whether a given Component, Directive or Pipe is marked as standalone.
 * This will return false if passed anything other than a Component, Directive, or Pipe class
 * See [this guide](guide/components/importing) for additional information:
 *
 * @param type A reference to a Component, Directive or Pipe.
 * @publicApi
 */
export declare function isStandalone(type: Type<unknown>): boolean;
