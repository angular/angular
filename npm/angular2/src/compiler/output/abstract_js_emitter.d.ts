import * as o from './output_ast';
import { EmitterVisitorContext, AbstractEmitterVisitor } from './abstract_emitter';
export declare abstract class AbstractJsEmitterVisitor extends AbstractEmitterVisitor {
    constructor();
    visitDeclareClassStmt(stmt: o.ClassStmt, ctx: EmitterVisitorContext): any;
    private _visitClassConstructor(stmt, ctx);
    private _visitClassGetter(stmt, getter, ctx);
    private _visitClassMethod(stmt, method, ctx);
    visitReadVarExpr(ast: o.ReadVarExpr, ctx: EmitterVisitorContext): string;
    visitDeclareVarStmt(stmt: o.DeclareVarStmt, ctx: EmitterVisitorContext): any;
    visitCastExpr(ast: o.CastExpr, ctx: EmitterVisitorContext): any;
    visitInvokeFunctionExpr(expr: o.InvokeFunctionExpr, ctx: EmitterVisitorContext): string;
    visitFunctionExpr(ast: o.FunctionExpr, ctx: EmitterVisitorContext): any;
    visitDeclareFunctionStmt(stmt: o.DeclareFunctionStmt, ctx: EmitterVisitorContext): any;
    visitTryCatchStmt(stmt: o.TryCatchStmt, ctx: EmitterVisitorContext): any;
    private _visitParams(params, ctx);
    getBuiltinMethodName(method: o.BuiltinMethod): string;
}
