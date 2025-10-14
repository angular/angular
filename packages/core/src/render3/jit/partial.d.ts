/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { R3DeclareComponentFacade, R3DeclareDirectiveFacade, R3DeclareFactoryFacade, R3DeclareInjectableFacade, R3DeclareInjectorFacade, R3DeclareNgModuleFacade, R3DeclarePipeFacade } from '../../compiler/compiler_facade';
import { Type } from '../../interface/type';
/**
 * Compiles a partial directive declaration object into a full directive definition object.
 *
 * @codeGenApi
 */
export declare function ɵɵngDeclareDirective(decl: R3DeclareDirectiveFacade): unknown;
/**
 * Evaluates the class metadata declaration.
 *
 * @codeGenApi
 */
export declare function ɵɵngDeclareClassMetadata(decl: {
    type: Type<any>;
    decorators: any[];
    ctorParameters?: () => any[];
    propDecorators?: {
        [field: string]: any;
    };
}): void;
/**
 * Evaluates the class metadata of a component that contains deferred blocks.
 *
 * @codeGenApi
 */
export declare function ɵɵngDeclareClassMetadataAsync(decl: {
    type: Type<any>;
    resolveDeferredDeps: () => Promise<Type<unknown>>[];
    resolveMetadata: (...types: Type<unknown>[]) => {
        decorators: any[];
        ctorParameters: (() => any[]) | null;
        propDecorators: {
            [field: string]: any;
        } | null;
    };
}): void;
/**
 * Compiles a partial component declaration object into a full component definition object.
 *
 * @codeGenApi
 */
export declare function ɵɵngDeclareComponent(decl: R3DeclareComponentFacade): unknown;
/**
 * Compiles a partial pipe declaration object into a full pipe definition object.
 *
 * @codeGenApi
 */
export declare function ɵɵngDeclareFactory(decl: R3DeclareFactoryFacade): unknown;
/**
 * Compiles a partial injectable declaration object into a full injectable definition object.
 *
 * @codeGenApi
 */
export declare function ɵɵngDeclareInjectable(decl: R3DeclareInjectableFacade): unknown;
/**
 * These enums are used in the partial factory declaration calls.
 */
export { FactoryTarget } from '../../compiler/compiler_facade';
/**
 * Compiles a partial injector declaration object into a full injector definition object.
 *
 * @codeGenApi
 */
export declare function ɵɵngDeclareInjector(decl: R3DeclareInjectorFacade): unknown;
/**
 * Compiles a partial NgModule declaration object into a full NgModule definition object.
 *
 * @codeGenApi
 */
export declare function ɵɵngDeclareNgModule(decl: R3DeclareNgModuleFacade): unknown;
/**
 * Compiles a partial pipe declaration object into a full pipe definition object.
 *
 * @codeGenApi
 */
export declare function ɵɵngDeclarePipe(decl: R3DeclarePipeFacade): unknown;
