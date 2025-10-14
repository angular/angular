/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ParseSourceSpan } from '../parse_util';
import * as o from './output_ast';
import { SourceMapGenerator } from './source_map';
export declare class EmitterVisitorContext {
    private _indent;
    static createRoot(): EmitterVisitorContext;
    private _lines;
    constructor(_indent: number);
    /**
     * @internal strip this from published d.ts files due to
     * https://github.com/microsoft/TypeScript/issues/36216
     */
    private get _currentLine();
    println(from?: {
        sourceSpan: ParseSourceSpan | null;
    } | null, lastPart?: string): void;
    lineIsEmpty(): boolean;
    lineLength(): number;
    print(from: {
        sourceSpan: ParseSourceSpan | null;
    } | null, part: string, newLine?: boolean): void;
    removeEmptyLastLine(): void;
    incIndent(): void;
    decIndent(): void;
    toSource(): string;
    toSourceMapGenerator(genFilePath: string, startsAtLine?: number): SourceMapGenerator;
    spanOf(line: number, column: number): ParseSourceSpan | null;
    /**
     * @internal strip this from published d.ts files due to
     * https://github.com/microsoft/TypeScript/issues/36216
     */
    private get sourceLines();
}
export declare abstract class AbstractEmitterVisitor implements o.StatementVisitor, o.ExpressionVisitor {
    private _escapeDollarInStrings;
    private lastIfCondition;
    constructor(_escapeDollarInStrings: boolean);
    protected printLeadingComments(stmt: o.Statement, ctx: EmitterVisitorContext): void;
    visitExpressionStmt(stmt: o.ExpressionStatement, ctx: EmitterVisitorContext): any;
    visitReturnStmt(stmt: o.ReturnStatement, ctx: EmitterVisitorContext): any;
    visitIfStmt(stmt: o.IfStmt, ctx: EmitterVisitorContext): any;
    abstract visitDeclareVarStmt(stmt: o.DeclareVarStmt, ctx: EmitterVisitorContext): any;
    visitInvokeFunctionExpr(expr: o.InvokeFunctionExpr, ctx: EmitterVisitorContext): any;
    visitTaggedTemplateLiteralExpr(expr: o.TaggedTemplateLiteralExpr, ctx: EmitterVisitorContext): any;
    visitTemplateLiteralExpr(expr: o.TemplateLiteralExpr, ctx: EmitterVisitorContext): void;
    visitTemplateLiteralElementExpr(expr: o.TemplateLiteralElementExpr, ctx: EmitterVisitorContext): void;
    visitWrappedNodeExpr(ast: o.WrappedNodeExpr<any>, ctx: EmitterVisitorContext): any;
    visitTypeofExpr(expr: o.TypeofExpr, ctx: EmitterVisitorContext): any;
    visitVoidExpr(expr: o.VoidExpr, ctx: EmitterVisitorContext): any;
    visitReadVarExpr(ast: o.ReadVarExpr, ctx: EmitterVisitorContext): any;
    visitInstantiateExpr(ast: o.InstantiateExpr, ctx: EmitterVisitorContext): any;
    visitLiteralExpr(ast: o.LiteralExpr, ctx: EmitterVisitorContext): any;
    visitRegularExpressionLiteral(ast: o.RegularExpressionLiteral, ctx: EmitterVisitorContext): any;
    visitLocalizedString(ast: o.LocalizedString, ctx: EmitterVisitorContext): any;
    abstract visitExternalExpr(ast: o.ExternalExpr, ctx: EmitterVisitorContext): any;
    visitConditionalExpr(ast: o.ConditionalExpr, ctx: EmitterVisitorContext): any;
    visitDynamicImportExpr(ast: o.DynamicImportExpr, ctx: EmitterVisitorContext): void;
    visitNotExpr(ast: o.NotExpr, ctx: EmitterVisitorContext): any;
    abstract visitFunctionExpr(ast: o.FunctionExpr, ctx: EmitterVisitorContext): any;
    abstract visitArrowFunctionExpr(ast: o.ArrowFunctionExpr, context: any): any;
    abstract visitDeclareFunctionStmt(stmt: o.DeclareFunctionStmt, context: any): any;
    visitUnaryOperatorExpr(ast: o.UnaryOperatorExpr, ctx: EmitterVisitorContext): any;
    visitBinaryOperatorExpr(ast: o.BinaryOperatorExpr, ctx: EmitterVisitorContext): any;
    visitReadPropExpr(ast: o.ReadPropExpr, ctx: EmitterVisitorContext): any;
    visitReadKeyExpr(ast: o.ReadKeyExpr, ctx: EmitterVisitorContext): any;
    visitLiteralArrayExpr(ast: o.LiteralArrayExpr, ctx: EmitterVisitorContext): any;
    visitLiteralMapExpr(ast: o.LiteralMapExpr, ctx: EmitterVisitorContext): any;
    visitCommaExpr(ast: o.CommaExpr, ctx: EmitterVisitorContext): any;
    visitParenthesizedExpr(ast: o.ParenthesizedExpr, ctx: EmitterVisitorContext): any;
    visitAllExpressions(expressions: o.Expression[], ctx: EmitterVisitorContext, separator: string): void;
    visitAllObjects<T>(handler: (t: T) => void, expressions: T[], ctx: EmitterVisitorContext, separator: string): void;
    visitAllStatements(statements: o.Statement[], ctx: EmitterVisitorContext): void;
}
export declare function escapeIdentifier(input: string, escapeDollar: boolean, alwaysQuote?: boolean): any;
