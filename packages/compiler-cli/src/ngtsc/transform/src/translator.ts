/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ArrayType, AssertNotNull, BinaryOperatorExpr, BuiltinType, BuiltinTypeName, CastExpr, ClassStmt, CommaExpr, CommentStmt, ConditionalExpr, DeclareFunctionStmt, DeclareVarStmt, Expression, ExpressionStatement, ExpressionType, ExpressionVisitor, ExternalExpr, ExternalReference, FunctionExpr, IfStmt, InstantiateExpr, InvokeFunctionExpr, InvokeMethodExpr, JSDocCommentStmt, LiteralArrayExpr, LiteralExpr, LiteralMapExpr, MapType, NotExpr, ReadKeyExpr, ReadPropExpr, ReadVarExpr, ReturnStatement, StatementVisitor, ThrowStmt, TryCatchStmt, Type, TypeVisitor, WrappedNodeExpr, WriteKeyExpr, WritePropExpr, WriteVarExpr} from '@angular/compiler';
import * as ts from 'typescript';

export class ImportManager {
  private moduleToIndex = new Map<string, string>();
  private nextIndex = 0;

  generateNamedImport(moduleName: string): string {
    if (!this.moduleToIndex.has(moduleName)) {
      this.moduleToIndex.set(moduleName, `i${this.nextIndex++}`);
    }
    return this.moduleToIndex.get(moduleName) !;
  }

  getAllImports(): {name: string, as: string}[] {
    return Array.from(this.moduleToIndex.keys()).map(name => {
      const as = this.moduleToIndex.get(name) !;
      return {name, as};
    });
  }
}

export function translateExpression(expression: Expression, imports: ImportManager): ts.Expression {
  return expression.visitExpression(new ExpressionTranslatorVisitor(imports), null);
}

export function translateType(type: Type, imports: ImportManager): string {
  return type.visitType(new TypeTranslatorVisitor(imports), null);
}

class ExpressionTranslatorVisitor implements ExpressionVisitor, StatementVisitor {
  constructor(private imports: ImportManager) {}

  visitDeclareVarStmt(stmt: DeclareVarStmt, context: any) {
    throw new Error('Method not implemented.');
  }

  visitDeclareFunctionStmt(stmt: DeclareFunctionStmt, context: any) {
    throw new Error('Method not implemented.');
  }

  visitExpressionStmt(stmt: ExpressionStatement, context: any) {
    throw new Error('Method not implemented.');
  }

  visitReturnStmt(stmt: ReturnStatement, context: any): ts.ReturnStatement {
    return ts.createReturn(stmt.value.visitExpression(this, context));
  }

  visitDeclareClassStmt(stmt: ClassStmt, context: any) {
    throw new Error('Method not implemented.');
  }

  visitIfStmt(stmt: IfStmt, context: any) { throw new Error('Method not implemented.'); }

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

  visitWritePropExpr(expr: WritePropExpr, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitInvokeMethodExpr(ast: InvokeMethodExpr, context: any): never {
    throw new Error('Method not implemented.');
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
        ts.createIdentifier(this.imports.generateNamedImport(ast.value.moduleName)),
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

  visitBinaryOperatorExpr(ast: BinaryOperatorExpr, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitReadPropExpr(ast: ReadPropExpr, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitReadKeyExpr(ast: ReadKeyExpr, context: any): never {
    throw new Error('Method not implemented.');
  }

  visitLiteralArrayExpr(ast: LiteralArrayExpr, context: any): never {
    throw new Error('Method not implemented.');
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
    const base = `${this.imports.generateNamedImport(ast.value.moduleName)}.${ast.value.name}`;
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

  visitLiteralArrayExpr(ast: LiteralArrayExpr, context: any) {
    throw new Error('Method not implemented.');
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