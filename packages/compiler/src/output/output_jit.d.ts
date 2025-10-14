/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EmitterVisitorContext } from './abstract_emitter';
import { AbstractJsEmitterVisitor } from './abstract_js_emitter';
import * as o from './output_ast';
export interface ExternalReferenceResolver {
    resolveExternalReference(ref: o.ExternalReference): unknown;
}
/**
 * A helper class to manage the evaluation of JIT generated code.
 */
export declare class JitEvaluator {
    /**
     *
     * @param sourceUrl The URL of the generated code.
     * @param statements An array of Angular statement AST nodes to be evaluated.
     * @param refResolver Resolves `o.ExternalReference`s into values.
     * @param createSourceMaps If true then create a source-map for the generated code and include it
     * inline as a source-map comment.
     * @returns A map of all the variables in the generated code.
     */
    evaluateStatements(sourceUrl: string, statements: o.Statement[], refResolver: ExternalReferenceResolver, createSourceMaps: boolean): {
        [key: string]: any;
    };
    /**
     * Evaluate a piece of JIT generated code.
     * @param sourceUrl The URL of this generated code.
     * @param ctx A context object that contains an AST of the code to be evaluated.
     * @param vars A map containing the names and values of variables that the evaluated code might
     * reference.
     * @param createSourceMap If true then create a source-map for the generated code and include it
     * inline as a source-map comment.
     * @returns The result of evaluating the code.
     */
    evaluateCode(sourceUrl: string, ctx: EmitterVisitorContext, vars: {
        [key: string]: any;
    }, createSourceMap: boolean): any;
    /**
     * Execute a JIT generated function by calling it.
     *
     * This method can be overridden in tests to capture the functions that are generated
     * by this `JitEvaluator` class.
     *
     * @param fn A function to execute.
     * @param args The arguments to pass to the function being executed.
     * @returns The return value of the executed function.
     */
    executeFunction(fn: Function, args: any[]): any;
}
/**
 * An Angular AST visitor that converts AST nodes into executable JavaScript code.
 */
export declare class JitEmitterVisitor extends AbstractJsEmitterVisitor {
    private refResolver;
    private _evalArgNames;
    private _evalArgValues;
    private _evalExportedVars;
    constructor(refResolver: ExternalReferenceResolver);
    createReturnStmt(ctx: EmitterVisitorContext): void;
    getArgs(): {
        [key: string]: any;
    };
    visitExternalExpr(ast: o.ExternalExpr, ctx: EmitterVisitorContext): any;
    visitWrappedNodeExpr(ast: o.WrappedNodeExpr<any>, ctx: EmitterVisitorContext): any;
    visitDeclareVarStmt(stmt: o.DeclareVarStmt, ctx: EmitterVisitorContext): any;
    visitDeclareFunctionStmt(stmt: o.DeclareFunctionStmt, ctx: EmitterVisitorContext): any;
    private _emitReferenceToExternal;
}
