/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '../../interface/type';
import type { NgModule } from '../../metadata/ng_module';
import type { NgModuleTransitiveScopes, NgModuleType } from '../../metadata/ng_module_def';
import type { ComponentDef } from '../interfaces/definition';
/**
 * Loops over queued module definitions, if a given module definition has all of its
 * declarations resolved, it dequeues that module definition and sets the scope on
 * its declarations.
 */
export declare function flushModuleScopingQueueAsMuchAsPossible(): void;
/**
 * Compiles a module in JIT mode.
 *
 * This function automatically gets called when a class has a `@NgModule` decorator.
 */
export declare function compileNgModule(moduleType: Type<any>, ngModule?: NgModule): void;
/**
 * Compiles and adds the `ɵmod`, `ɵfac` and `ɵinj` properties to the module class.
 *
 * It's possible to compile a module via this API which will allow duplicate declarations in its
 * root.
 */
export declare function compileNgModuleDefs(moduleType: NgModuleType, ngModule: NgModule, allowDuplicateDeclarationsInRoot?: boolean): void;
export declare function generateStandaloneInDeclarationsError(type: Type<any>, location: string): string;
export declare function resetCompiledComponents(): void;
/**
 * Patch the definition of a component with directives and pipes from the compilation scope of
 * a given module.
 */
export declare function patchComponentDefWithScope<C>(componentDef: ComponentDef<C>, transitiveScopes: NgModuleTransitiveScopes): void;
/**
 * Compute the pair of transitive scopes (compilation scope and exported scope) for a given type
 * (either a NgModule or a standalone component / directive / pipe).
 */
export declare function transitiveScopesFor<T>(type: Type<T>): NgModuleTransitiveScopes;
/**
 * Compute the pair of transitive scopes (compilation scope and exported scope) for a given module.
 *
 * This operation is memoized and the result is cached on the module's definition. This function can
 * be called on modules with components that have not fully compiled yet, but the result should not
 * be used until they have.
 *
 * @param moduleType module that transitive scope should be calculated for.
 */
export declare function transitiveScopesForNgModule<T>(moduleType: Type<T>): NgModuleTransitiveScopes;
