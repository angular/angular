import * as o from './output_ast';
export declare var CATCH_ERROR_VAR: o.ReadVarExpr;
export declare var CATCH_STACK_VAR: o.ReadVarExpr;
export declare abstract class OutputEmitter {
    abstract emitStatements(moduleUrl: string, stmts: o.Statement[], exportedVars: string[]): string;
}
export declare class EmitterVisitorContext {
    private _exportedVars;
    private _indent;
    static createRoot(exportedVars: string[]): EmitterVisitorContext;
    private _lines;
    private _classes;
    constructor(_exportedVars: string[], _indent: number);
    private _currentLine;
    isExportedVar(varName: string): boolean;
    println(lastPart?: string): void;
    lineIsEmpty(): boolean;
    print(part: string, newLine?: boolean): void;
    removeEmptyLastLine(): void;
    incIndent(): void;
    decIndent(): void;
    pushClass(clazz: o.ClassStmt): void;
    popClass(): o.ClassStmt;
    currentClass: o.ClassStmt;
    toSource(): any;
}
export declare abstract class AbstractEmitterVisitor implements o.StatementVisitor, o.ExpressionVisitor {
    private _escapeDollarInStrings;
    constructor(_escapeDollarInStrings: boolean);
    visitExpressionStmt(stmt: o.ExpressionStatement, ctx: EmitterVisitorContext): any;
    visitReturnStmt(stmt: o.ReturnStatement, ctx: EmitterVisitorContext): any;
    abstract visitCastExpr(ast: o.CastExpr, context: any): any;
    abstract visitDeclareClassStmt(stmt: o.ClassStmt, ctx: EmitterVisitorContext): any;
    visitIfStmt(stmt: o.IfStmt, ctx: EmitterVisitorContext): any;
    abstract visitTryCatchStmt(stmt: o.TryCatchStmt, ctx: EmitterVisitorContext): any;
    visitThrowStmt(stmt: o.ThrowStmt, ctx: EmitterVisitorContext): any;
    visitCommentStmt(stmt: o.CommentStmt, ctx: EmitterVisitorContext): any;
    abstract visitDeclareVarStmt(stmt: o.DeclareVarStmt, ctx: EmitterVisitorContext): any;
    visitWriteVarExpr(expr: o.WriteVarExpr, ctx: EmitterVisitorContext): any;
    visitWriteKeyExpr(expr: o.WriteKeyExpr, ctx: EmitterVisitorContext): any;
    visitWritePropExpr(expr: o.WritePropExpr, ctx: EmitterVisitorContext): any;
    visitInvokeMethodExpr(expr: o.InvokeMethodExpr, ctx: EmitterVisitorContext): any;
    abstract getBuiltinMethodName(method: o.BuiltinMethod): string;
    visitInvokeFunctionExpr(expr: o.InvokeFunctionExpr, ctx: EmitterVisitorContext): any;
    visitReadVarExpr(ast: o.ReadVarExpr, ctx: EmitterVisitorContext): any;
    visitInstantiateExpr(ast: o.InstantiateExpr, ctx: EmitterVisitorContext): any;
    visitLiteralExpr(ast: o.LiteralExpr, ctx: EmitterVisitorContext): any;
    abstract visitExternalExpr(ast: o.ExternalExpr, ctx: EmitterVisitorContext): any;
    visitConditionalExpr(ast: o.ConditionalExpr, ctx: EmitterVisitorContext): any;
    visitNotExpr(ast: o.NotExpr, ctx: EmitterVisitorContext): any;
    abstract visitFunctionExpr(ast: o.FunctionExpr, ctx: EmitterVisitorContext): any;
    abstract visitDeclareFunctionStmt(stmt: o.DeclareFunctionStmt, context: any): any;
    visitBinaryOperatorExpr(ast: o.BinaryOperatorExpr, ctx: EmitterVisitorContext): any;
    visitReadPropExpr(ast: o.ReadPropExpr, ctx: EmitterVisitorContext): any;
    visitReadKeyExpr(ast: o.ReadKeyExpr, ctx: EmitterVisitorContext): any;
    visitLiteralArrayExpr(ast: o.LiteralArrayExpr, ctx: EmitterVisitorContext): any;
    visitLiteralMapExpr(ast: o.LiteralMapExpr, ctx: EmitterVisitorContext): any;
    visitAllExpressions(expressions: o.Expression[], ctx: EmitterVisitorContext, separator: string, newLine?: boolean): void;
    visitAllObjects(handler: Function, expressions: any, ctx: EmitterVisitorContext, separator: string, newLine?: boolean): void;
    visitAllStatements(statements: o.Statement[], ctx: EmitterVisitorContext): void;
}
export declare function escapeSingleQuoteString(input: string, escapeDollar: boolean): any;
