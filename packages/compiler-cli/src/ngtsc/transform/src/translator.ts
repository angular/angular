/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ArrayType, AssertNotNull, BinaryOperator, BinaryOperatorExpr, BuiltinType, BuiltinTypeName, CastExpr, ClassStmt, CommaExpr, CommentStmt, ConditionalExpr, DeclareFunctionStmt, DeclareVarStmt, Expression, ExpressionStatement, ExpressionType, ExpressionVisitor, ExternalExpr, ExternalReference, FunctionExpr, IfStmt, InstantiateExpr, InvokeFunctionExpr, InvokeMethodExpr, JSDocCommentStmt, LiteralArrayExpr, LiteralExpr, LiteralMapExpr, MapType, NotExpr, ReadKeyExpr, ReadPropExpr, ReadVarExpr, ReturnStatement, Statement, StatementVisitor, ThrowStmt, TryCatchStmt, Type, TypeVisitor, WrappedNodeExpr, WriteKeyExpr, WritePropExpr, WriteVarExpr} from '@angular/compiler';
import * as ts from 'typescript';
import {relativePathBetween} from '../../util/src/path';

const BINARY_OPERATORS = new Map<BinaryOperator, ts.BinaryOperator>([
  [BinaryOperator.And, ts.SyntaxKind.AmpersandAmpersandToken],
  [BinaryOperator.Bigger, ts.SyntaxKind.GreaterThanToken],
  [BinaryOperator.BiggerEquals, ts.SyntaxKind.GreaterThanEqualsToken],
  [BinaryOperator.BitwiseAnd, ts.SyntaxKind.AmpersandToken],
  [BinaryOperator.Divide, ts.SyntaxKind.SlashToken],
  [BinaryOperator.Equals, ts.SyntaxKind.EqualsEqualsToken],
  [BinaryOperator.Identical, ts.SyntaxKind.EqualsEqualsEqualsToken],
  [BinaryOperator.Lower, ts.SyntaxKind.LessThanToken],
  [BinaryOperator.LowerEquals, ts.SyntaxKind.LessThanEqualsToken],
  [BinaryOperator.Minus, ts.SyntaxKind.MinusToken],
  [BinaryOperator.Modulo, ts.SyntaxKind.PercentToken],
  [BinaryOperator.Multiply, ts.SyntaxKind.AsteriskToken],
  [BinaryOperator.NotEquals, ts.SyntaxKind.ExclamationEqualsToken],
  [BinaryOperator.NotIdentical, ts.SyntaxKind.ExclamationEqualsEqualsToken],
  [BinaryOperator.Or, ts.SyntaxKind.BarBarToken],
  [BinaryOperator.Plus, ts.SyntaxKind.PlusToken],
]);

const CORE_SUPPORTED_SYMBOLS = new Set<string>([
  'defineInjectable',
  'defineInjector',
  'ɵdefineNgModule',
  'inject',
  'InjectableDef',
  'InjectorDef',
  'NgModuleDef',
]);

export class ImportManager {
  private moduleToIndex = new Map<string, string>();
  private nextIndex = 0;

  constructor(private isCore: boolean) {}

  generateNamedImport(moduleName: string, symbol: string): string {
    if (!this.moduleToIndex.has(moduleName)) {
      this.moduleToIndex.set(moduleName, `ɵ${this.nextIndex++}`);
    }
    if (this.isCore && moduleName === '@angular/core' && !CORE_SUPPORTED_SYMBOLS.has(symbol)) {
      throw new Error(`Importing unexpected symbol ${symbol} while compiling core`);
    }
    return this.moduleToIndex.get(moduleName) !;
  }

  getAllImports(contextPath: string, rewriteCoreImportsTo: ts.SourceFile|null):
    { name: string, as: string }[] {
    return Array.from(this.moduleToIndex.keys()).map(name => {
      const as: string|null = this.moduleToIndex.get(name) !;
      if (rewriteCoreImportsTo !== null && name === '@angular/core') {
        const relative = relativePathBetween(contextPath, rewriteCoreImportsTo.fileName);
        if (relative === null) {
          throw new Error(
              `Failed to rewrite import inside core: ${contextPath} -> ${rewriteCoreImportsTo.fileName}`);
        }
        name = relative;
      }
      return {name, as};
    });
  }
}

export function translateExpression(expression: Expression, imports: ImportManager): ts.Expression {
  return expression.visitExpression(new ExpressionTranslatorVisitor(imports), null);
}

export function translateStatement(statement: Statement, imports: ImportManager): ts.Statement {
  return statement.visitStatement(new ExpressionTranslatorVisitor(imports), null);
}

export function translateType(type: Type, imports: ImportManager): string {
  return type.visitType(new TypeTranslatorVisitor(imports), null);
}

class ExpressionTranslatorVisitor implements ExpressionVisitor, StatementVisitor {
  constructor(private imports: ImportManager) {}

  visitDeclareVarStmt(stmt: DeclareVarStmt, context: any): ts.VariableStatement {
    return ts.createVariableStatement(
        undefined,
        ts.createVariableDeclarationList([ts.createVariableDeclaration(
            stmt.name, undefined, stmt.value && stmt.value.visitExpression(this, context))]));
  }

  visitDeclareFunctionStmt(stmt: DeclareFunctionStmt, context: any): ts.FunctionDeclaration {
    return ts.createFunctionDeclaration(
        undefined, undefined, undefined, stmt.name, undefined,
        stmt.params.map(param => ts.createParameter(undefined, undefined, undefined, param.name)),
        undefined,
        ts.createBlock(stmt.statements.map(child => child.visitStatement(this, context))));
  }

  visitExpressionStmt(stmt: ExpressionStatement, context: any): ts.ExpressionStatement {
    return ts.createStatement(stmt.expr.visitExpression(this, context));
  }

  visitReturnStmt(stmt: ReturnStatement, context: any): ts.ReturnStatement {
    return ts.createReturn(stmt.value.visitExpression(this, context));
  }

  visitDeclareClassStmt(stmt: ClassStmt, context: any) {
    throw new Error('Method not implemented.');
  }

  visitIfStmt(stmt: IfStmt, context: any): ts.IfStatement {
    return ts.createIf(
        stmt.condition.visitExpression(this, context),
        ts.createBlock(stmt.trueCase.map(child => child.visitStatement(this, context))),
        stmt.falseCase.length > 0 ?
            ts.createBlock(stmt.falseCase.map(child => child.visitStatement(this, context))) :
            undefined);
  }

  visitTryCatchStmt(stmt: TryCatchStmt, context: any) {
    throw new Error('Method not implemented.');
  }

  visitThrowStmt(stmt: ThrowStmt, context: any) { throw new Error('Method not implemented.'); }

  visitCommentStmt(stmt: CommentStmt, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitJSDocCommentStmt(stmt: JSDocCommentStmt, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitReadVarExpr(ast: ReadVarExpr, context: any): ts.Identifier {
    return ts.createIdentifier(ast.name !);
  }

  visitWriteVarExpr(expr: WriteVarExpr, context: any): ts.BinaryExpression {
    return ts.createBinary(
        ts.createIdentifier(expr.name), ts.SyntaxKind.EqualsToken,
        expr.value.visitExpression(this, context));
  }

  visitWriteKeyExpr(expr: WriteKeyExpr, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitWritePropExpr(expr: WritePropExpr, context: any): ts.BinaryExpression {
    return ts.createBinary(
        ts.createPropertyAccess(expr.receiver.visitExpression(this, context), expr.name),
        ts.SyntaxKind.EqualsToken, expr.value.visitExpression(this, context));
  }

  visitInvokeMethodExpr(ast: InvokeMethodExpr, context: any): ts.CallExpression {
    const target = ast.receiver.visitExpression(this, context);
    return ts.createCall(
        ast.name !== null ? ts.createPropertyAccess(target, ast.name) : target, undefined,
        ast.args.map(arg => arg.visitExpression(this, context)));
  }

  visitInvokeFunctionExpr(ast: InvokeFunctionExpr, context: any): ts.CallExpression {
    return ts.createCall(
        ast.fn.visitExpression(this, context), undefined,
        ast.args.map(arg => arg.visitExpression(this, context)));
  }

  visitInstantiateExpr(ast: InstantiateExpr, context: any): ts.NewExpression {
    return ts.createNew(
        ast.classExpr.visitExpression(this, context), undefined,
        ast.args.map(arg => arg.visitExpression(this, context)));
  }

  visitLiteralExpr(ast: LiteralExpr, context: any): ts.Expression {
    if (ast.value === undefined) {
      return ts.createIdentifier('undefined');
    } else if (ast.value === null) {
      return ts.createNull();
    } else {
      return ts.createLiteral(ast.value);
    }
  }

  visitExternalExpr(ast: ExternalExpr, context: any): ts.PropertyAccessExpression {
    if (ast.value.moduleName === null || ast.value.name === null) {
      throw new Error(`Import unknown module or symbol ${ast.value}`);
    }
    return ts.createPropertyAccess(
        ts.createIdentifier(this.imports.generateNamedImport(ast.value.moduleName, ast.value.name)),
        ts.createIdentifier(ast.value.name));
  }

  visitConditionalExpr(ast: ConditionalExpr, context: any): ts.ParenthesizedExpression {
    return ts.createParen(ts.createConditional(
        ast.condition.visitExpression(this, context), ast.trueCase.visitExpression(this, context),
        ast.falseCase !.visitExpression(this, context)));
  }

  visitNotExpr(ast: NotExpr, context: any): ts.PrefixUnaryExpression {
    return ts.createPrefix(
        ts.SyntaxKind.ExclamationToken, ast.condition.visitExpression(this, context));
  }

  visitAssertNotNullExpr(ast: AssertNotNull, context: any): ts.NonNullExpression {
    return ts.createNonNullExpression(ast.condition.visitExpression(this, context));
  }

  visitCastExpr(ast: CastExpr, context: any): ts.Expression {
    return ast.value.visitExpression(this, context);
  }

  visitFunctionExpr(ast: FunctionExpr, context: any): ts.FunctionExpression {
    return ts.createFunctionExpression(
        undefined, undefined, ast.name || undefined, undefined,
        ast.params.map(
            param => ts.createParameter(
                undefined, undefined, undefined, param.name, undefined, undefined, undefined)),
        undefined, ts.createBlock(ast.statements.map(stmt => stmt.visitStatement(this, context))));
  }

  visitBinaryOperatorExpr(ast: BinaryOperatorExpr, context: any): ts.Expression {
    if (!BINARY_OPERATORS.has(ast.operator)) {
      throw new Error(`Unknown binary operator: ${BinaryOperator[ast.operator]}`);
    }
    const binEx = ts.createBinary(
        ast.lhs.visitExpression(this, context), BINARY_OPERATORS.get(ast.operator) !,
        ast.rhs.visitExpression(this, context));
    return ast.parens ? ts.createParen(binEx) : binEx;
  }

  visitReadPropExpr(ast: ReadPropExpr, context: any): ts.PropertyAccessExpression {
    return ts.createPropertyAccess(ast.receiver.visitExpression(this, context), ast.name);
  }

  visitReadKeyExpr(ast: ReadKeyExpr, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitLiteralArrayExpr(ast: LiteralArrayExpr, context: any): ts.ArrayLiteralExpression {
    return ts.createArrayLiteral(ast.entries.map(expr => expr.visitExpression(this, context)));
  }

  visitLiteralMapExpr(ast: LiteralMapExpr, context: any): ts.ObjectLiteralExpression {
    const entries = ast.entries.map(
        entry => ts.createPropertyAssignment(
            entry.quoted ? ts.createLiteral(entry.key) : ts.createIdentifier(entry.key),
            entry.value.visitExpression(this, context)));
    return ts.createObjectLiteral(entries);
  }

  visitCommaExpr(ast: CommaExpr, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitWrappedNodeExpr(ast: WrappedNodeExpr<any>, context: any): any { return ast.node; }
}

export class TypeTranslatorVisitor implements ExpressionVisitor, TypeVisitor {
  constructor(private imports: ImportManager) {}

  visitBuiltinType(type: BuiltinType, context: any): string {
    switch (type.name) {
      case BuiltinTypeName.Bool:
        return 'boolean';
      case BuiltinTypeName.Dynamic:
        return 'any';
      case BuiltinTypeName.Int:
      case BuiltinTypeName.Number:
        return 'number';
      case BuiltinTypeName.String:
        return 'string';
      default:
        throw new Error(`Unsupported builtin type: ${BuiltinTypeName[type.name]}`);
    }
  }

  visitExpressionType(type: ExpressionType, context: any): any {
    return type.value.visitExpression(this, context);
  }

  visitArrayType(type: ArrayType, context: any): string {
    return `Array<${type.visitType(this, context)}>`;
  }

  visitMapType(type: MapType, context: any): string {
    if (type.valueType !== null) {
      return `{[key: string]: ${type.valueType.visitType(this, context)}}`;
    } else {
      return '{[key: string]: any}';
    }
  }

  visitReadVarExpr(ast: ReadVarExpr, context: any): string {
    if (ast.name === null) {
      throw new Error(`ReadVarExpr with no variable name in type`);
    }
    return ast.name;
  }

  visitWriteVarExpr(expr: WriteVarExpr, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitWriteKeyExpr(expr: WriteKeyExpr, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitWritePropExpr(expr: WritePropExpr, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitInvokeMethodExpr(ast: InvokeMethodExpr, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitInvokeFunctionExpr(ast: InvokeFunctionExpr, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitInstantiateExpr(ast: InstantiateExpr, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitLiteralExpr(ast: LiteralExpr, context: any): string {
    if (typeof ast.value === 'string') {
      const escaped = ast.value.replace(/\'/g, '\\\'');
      return `'${escaped}'`;
    } else {
      return `${ast.value}`;
    }
  }

  visitExternalExpr(ast: ExternalExpr, context: any): string {
    if (ast.value.moduleName === null || ast.value.name === null) {
      throw new Error(`Import unknown module or symbol`);
    }
    const moduleSymbol = this.imports.generateNamedImport(ast.value.moduleName, ast.value.name);
    const base = `${moduleSymbol}.${ast.value.name}`;
    if (ast.typeParams !== null) {
      const generics = ast.typeParams.map(type => type.visitType(this, context)).join(', ');
      return `${base}<${generics}>`;
    } else {
      return base;
    }
  }

  visitConditionalExpr(ast: ConditionalExpr, context: any) {
    throw new Error('Method not implemented.');
  }

  visitNotExpr(ast: NotExpr, context: any) { throw new Error('Method not implemented.'); }

  visitAssertNotNullExpr(ast: AssertNotNull, context: any) {
    throw new Error('Method not implemented.');
  }

  visitCastExpr(ast: CastExpr, context: any) { throw new Error('Method not implemented.'); }

  visitFunctionExpr(ast: FunctionExpr, context: any) { throw new Error('Method not implemented.'); }

  visitBinaryOperatorExpr(ast: BinaryOperatorExpr, context: any) {
    throw new Error('Method not implemented.');
  }

  visitReadPropExpr(ast: ReadPropExpr, context: any) { throw new Error('Method not implemented.'); }

  visitReadKeyExpr(ast: ReadKeyExpr, context: any) { throw new Error('Method not implemented.'); }

  visitLiteralArrayExpr(ast: LiteralArrayExpr, context: any): string {
    const values = ast.entries.map(expr => expr.visitExpression(this, context));
    return `[${values.join(',')}]`;
  }

  visitLiteralMapExpr(ast: LiteralMapExpr, context: any) {
    throw new Error('Method not implemented.');
  }

  visitCommaExpr(ast: CommaExpr, context: any) { throw new Error('Method not implemented.'); }

  visitWrappedNodeExpr(ast: WrappedNodeExpr<any>, context: any) {
    const node: ts.Node = ast.node;
    if (ts.isIdentifier(node)) {
      return node.text;
    } else {
      throw new Error(
          `Unsupported WrappedNodeExpr in TypeTranslatorVisitor: ${ts.SyntaxKind[node.kind]}`);
    }
  }
}