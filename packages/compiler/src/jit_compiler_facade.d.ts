/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { CompilerFacade, CoreEnvironment, FactoryTarget, R3ComponentMetadataFacade, R3DeclareComponentFacade, R3DeclareDirectiveFacade, R3DeclareFactoryFacade, R3DeclareInjectableFacade, R3DeclareInjectorFacade, R3DeclareNgModuleFacade, R3DeclarePipeFacade, R3DirectiveMetadataFacade, R3FactoryDefMetadataFacade, R3InjectableMetadataFacade, R3InjectorMetadataFacade, R3NgModuleMetadataFacade, R3PipeMetadataFacade } from './compiler_facade_interface';
import { JitEvaluator } from './output/output_jit';
import { ParseSourceSpan } from './parse_util';
import { ResourceLoader } from './resource_loader';
export declare class CompilerFacadeImpl implements CompilerFacade {
    private jitEvaluator;
    FactoryTarget: typeof FactoryTarget;
    ResourceLoader: typeof ResourceLoader;
    private elementSchemaRegistry;
    constructor(jitEvaluator?: JitEvaluator);
    compilePipe(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, facade: R3PipeMetadataFacade): any;
    compilePipeDeclaration(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, declaration: R3DeclarePipeFacade): any;
    compileInjectable(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, facade: R3InjectableMetadataFacade): any;
    compileInjectableDeclaration(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, facade: R3DeclareInjectableFacade): any;
    compileInjector(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, facade: R3InjectorMetadataFacade): any;
    compileInjectorDeclaration(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, declaration: R3DeclareInjectorFacade): any;
    compileNgModule(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, facade: R3NgModuleMetadataFacade): any;
    compileNgModuleDeclaration(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, declaration: R3DeclareNgModuleFacade): any;
    compileDirective(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, facade: R3DirectiveMetadataFacade): any;
    compileDirectiveDeclaration(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, declaration: R3DeclareDirectiveFacade): any;
    private compileDirectiveFromMeta;
    compileComponent(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, facade: R3ComponentMetadataFacade): any;
    compileComponentDeclaration(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, declaration: R3DeclareComponentFacade): any;
    private compileComponentFromMeta;
    compileFactory(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3FactoryDefMetadataFacade): any;
    compileFactoryDeclaration(angularCoreEnv: CoreEnvironment, sourceMapUrl: string, meta: R3DeclareFactoryFacade): any;
    createParseSourceSpan(kind: string, typeName: string, sourceUrl: string): ParseSourceSpan;
    /**
     * JIT compiles an expression and returns the result of executing that expression.
     *
     * @param def the definition which will be compiled and executed to get the value to patch
     * @param context an object map of @angular/core symbol names to symbols which will be available
     * in the context of the compiled expression
     * @param sourceUrl a URL to use for the source map of the compiled expression
     * @param preStatements a collection of statements that should be evaluated before the expression.
     */
    private jitExpression;
}
export declare function publishFacade(global: any): void;
