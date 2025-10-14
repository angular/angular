/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { AbstractEmitterVisitor, EmitterVisitorContext } from './abstract_emitter';
import * as o from './output_ast';
export declare abstract class AbstractJsEmitterVisitor extends AbstractEmitterVisitor {
    constructor();
    visitWrappedNodeExpr(ast: o.WrappedNodeExpr<any>, ctx: EmitterVisitorContext): any;
    visitDeclareVarStmt(stmt: o.DeclareVarStmt, ctx: EmitterVisitorContext): any;
    visitTaggedTemplateLiteralExpr(ast: o.TaggedTemplateLiteralExpr, ctx: EmitterVisitorContext): any;
    visitTemplateLiteralExpr(expr: o.TemplateLiteralExpr, ctx: EmitterVisitorContext): any;
    visitTemplateLiteralElementExpr(expr: o.TemplateLiteralElementExpr, ctx: EmitterVisitorContext): any;
    visitFunctionExpr(ast: o.FunctionExpr, ctx: EmitterVisitorContext): any;
    visitArrowFunctionExpr(ast: o.ArrowFunctionExpr, ctx: EmitterVisitorContext): any;
    visitDeclareFunctionStmt(stmt: o.DeclareFunctionStmt, ctx: EmitterVisitorContext): any;
    visitLocalizedString(ast: o.LocalizedString, ctx: EmitterVisitorContext): any;
    private _visitParams;
}
