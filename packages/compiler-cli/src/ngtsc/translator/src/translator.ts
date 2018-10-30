/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ArrayType, AssertNotNull, BinaryOperator, BinaryOperatorExpr, BuiltinType, BuiltinTypeName, CastExpr, ClassStmt, CommaExpr, CommentStmt, ConditionalExpr, DeclareFunctionStmt, DeclareVarStmt, Expression, ExpressionStatement, ExpressionType, ExpressionVisitor, ExternalExpr, ExternalReference, FunctionExpr, IfStmt, InstantiateExpr, InvokeFunctionExpr, InvokeMethodExpr, JSDocCommentStmt, LiteralArrayExpr, LiteralExpr, LiteralMapExpr, MapType, NotExpr, ReadKeyExpr, ReadPropExpr, ReadVarExpr, ReturnStatement, Statement, StatementVisitor, StmtModifier, ThrowStmt, TryCatchStmt, Type, TypeVisitor, TypeofExpr, WrappedNodeExpr, WriteKeyExpr, WritePropExpr, WriteVarExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {relativePathBetween} from '../../util/src/path';

export class Context {
  constructor(readonly isStatement: boolean) {}

  get withExpressionMode(): Context { return this.isStatement ? new Context(false) : this; }

  get withStatementMode(): Context { return this.isStatement ? new Context(true) : this; }
}

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
  'ɵsetClassMetadata',
  'ɵInjectableDef',
  'ɵInjectorDef',
  'ɵNgModuleDefWithMeta',
  'ɵNgModuleFactory',
]);

export class ImportManager {
  private moduleToIndex = new Map<string, string>();
  private nextIndex = 0;

  constructor(protected isCore: boolean, private prefix = 'i') {}

  generateNamedImport(moduleName: string, symbol: string): string|null {
    if (!this.moduleToIndex.has(moduleName)) {
      this.moduleToIndex.set(moduleName, `${this.prefix}${this.nextIndex++}`);
    }
    if (this.isCore && moduleName === '@angular/core' && !CORE_SUPPORTED_SYMBOLS.has(symbol)) {
      throw new Error(`Importing unexpected symbol ${symbol} while compiling core`);
    }
    return this.moduleToIndex.get(moduleName) !;
  }

  getAllImports(contextPath: string, rewriteCoreImportsTo: ts.SourceFile|null):
      {name: string, as: string}[] {
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
  return expression.visitExpression(new ExpressionTranslatorVisitor(imports), new Context(false));
}

export function translateStatement(statement: Statement, imports: ImportManager): ts.Statement {
  return statement.visitStatement(new ExpressionTranslatorVisitor(imports), new Context(true));
}

export function translateType(type: Type, imports: ImportManager): string {
  return type.visitType(new TypeTranslatorVisitor(imports), new Context(false));
}

class ExpressionTranslatorVisitor implements ExpressionVisitor, StatementVisitor {
  constructor(private imports: ImportManager) {}

  visitDeclareVarStmt(stmt: DeclareVarStmt, context: Context): ts.VariableStatement {
    const nodeFlags = stmt.hasModifier(StmtModifier.Final) ? ts.NodeFlags.Const : ts.NodeFlags.None;
    return ts.createVariableStatement(
        undefined, ts.createVariableDeclarationList(
                       [ts.createVariableDeclaration(
                           stmt.name, undefined, stmt.value &&
                               stmt.value.visitExpression(this, context.withExpressionMode))],
                       nodeFlags));
  }

  visitDeclareFunctionStmt(stmt: DeclareFunctionStmt, context: Context): ts.FunctionDeclaration {
    return ts.createFunctionDeclaration(
        undefined, undefined, undefined, stmt.name, undefined,
        stmt.params.map(param => ts.createParameter(undefined, undefined, undefined, param.name)),
        undefined, ts.createBlock(stmt.statements.map(
                       child => child.visitStatement(this, context.withStatementMode))));
  }

  visitExpressionStmt(stmt: ExpressionStatement, context: Context): ts.ExpressionStatement {
    return ts.createStatement(stmt.expr.visitExpression(this, context.withStatementMode));
  }

  visitReturnStmt(stmt: ReturnStatement, context: Context): ts.ReturnStatement {
    return ts.createReturn(stmt.value.visitExpression(this, context.withExpressionMode));
  }

  visitDeclareClassStmt(stmt: ClassStmt, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitIfStmt(stmt: IfStmt, context: Context): ts.IfStatement {
    return ts.createIf(
        stmt.condition.visitExpression(this, context),
        ts.createBlock(
            stmt.trueCase.map(child => child.visitStatement(this, context.withStatementMode))),
        stmt.falseCase.length > 0 ?
            ts.createBlock(stmt.falseCase.map(
                child => child.visitStatement(this, context.withStatementMode))) :
            undefined);
  }

  visitTryCatchStmt(stmt: TryCatchStmt, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitThrowStmt(stmt: ThrowStmt, context: Context) { throw new Error('Method not implemented.'); }

  visitCommentStmt(stmt: CommentStmt, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitJSDocCommentStmt(stmt: JSDocCommentStmt, context: Context): ts.NotEmittedStatement {
    const commentStmt = ts.createNotEmittedStatement(ts.createLiteral(''));
    const text = stmt.toString();
    const kind = ts.SyntaxKind.MultiLineCommentTrivia;
    ts.setSyntheticLeadingComments(commentStmt, [{kind, text, pos: -1, end: -1}]);
    return commentStmt;
  }

  visitReadVarExpr(ast: ReadVarExpr, context: Context): ts.Identifier {
    return ts.createIdentifier(ast.name !);
  }

  visitWriteVarExpr(expr: WriteVarExpr, context: Context): ts.Expression {
    const result: ts.Expression = ts.createBinary(
        ts.createIdentifier(expr.name), ts.SyntaxKind.EqualsToken,
        expr.value.visitExpression(this, context));
    return context.isStatement ? result : ts.createParen(result);
  }

  visitWriteKeyExpr(expr: WriteKeyExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitWritePropExpr(expr: WritePropExpr, context: Context): ts.BinaryExpression {
    return ts.createBinary(
        ts.createPropertyAccess(expr.receiver.visitExpression(this, context), expr.name),
        ts.SyntaxKind.EqualsToken, expr.value.visitExpression(this, context));
  }

  visitInvokeMethodExpr(ast: InvokeMethodExpr, context: Context): ts.CallExpression {
    const target = ast.receiver.visitExpression(this, context);
    return ts.createCall(
        ast.name !== null ? ts.createPropertyAccess(target, ast.name) : target, undefined,
        ast.args.map(arg => arg.visitExpression(this, context)));
  }

  visitInvokeFunctionExpr(ast: InvokeFunctionExpr, context: Context): ts.CallExpression {
    const expr = ts.createCall(
        ast.fn.visitExpression(this, context), undefined,
        ast.args.map(arg => arg.visitExpression(this, context)));
    if (ast.pure) {
      ts.addSyntheticLeadingComment(expr, ts.SyntaxKind.MultiLineCommentTrivia, '@__PURE__', false);
    }
    return expr;
  }

  visitInstantiateExpr(ast: InstantiateExpr, context: Context): ts.NewExpression {
    return ts.createNew(
        ast.classExpr.visitExpression(this, context), undefined,
        ast.args.map(arg => arg.visitExpression(this, context)));
  }

  visitLiteralExpr(ast: LiteralExpr, context: Context): ts.Expression {
    if (ast.value === undefined) {
      return ts.createIdentifier('undefined');
    } else if (ast.value === null) {
      return ts.createNull();
    } else {
      return ts.createLiteral(ast.value);
    }
  }

  visitExternalExpr(ast: ExternalExpr, context: Context): ts.PropertyAccessExpression
      |ts.Identifier {
    if (ast.value.moduleName === null || ast.value.name === null) {
      throw new Error(`Import unknown module or symbol ${ast.value}`);
    }
    const importIdentifier = this.imports.generateNamedImport(ast.value.moduleName, ast.value.name);
    if (importIdentifier === null) {
      return ts.createIdentifier(ast.value.name);
    } else {
      return ts.createPropertyAccess(
          ts.createIdentifier(importIdentifier), ts.createIdentifier(ast.value.name));
    }
  }

  visitConditionalExpr(ast: ConditionalExpr, context: Context): ts.ParenthesizedExpression {
    return ts.createParen(ts.createConditional(
        ast.condition.visitExpression(this, context), ast.trueCase.visitExpression(this, context),
        ast.falseCase !.visitExpression(this, context)));
  }

  visitNotExpr(ast: NotExpr, context: Context): ts.PrefixUnaryExpression {
    return ts.createPrefix(
        ts.SyntaxKind.ExclamationToken, ast.condition.visitExpression(this, context));
  }

  visitAssertNotNullExpr(ast: AssertNotNull, context: Context): ts.NonNullExpression {
    return ts.createNonNullExpression(ast.condition.visitExpression(this, context));
  }

  visitCastExpr(ast: CastExpr, context: Context): ts.Expression {
    return ast.value.visitExpression(this, context);
  }

  visitFunctionExpr(ast: FunctionExpr, context: Context): ts.FunctionExpression {
    return ts.createFunctionExpression(
        undefined, undefined, ast.name || undefined, undefined,
        ast.params.map(
            param => ts.createParameter(
                undefined, undefined, undefined, param.name, undefined, undefined, undefined)),
        undefined, ts.createBlock(ast.statements.map(stmt => stmt.visitStatement(this, context))));
  }

  visitBinaryOperatorExpr(ast: BinaryOperatorExpr, context: Context): ts.Expression {
    if (!BINARY_OPERATORS.has(ast.operator)) {
      throw new Error(`Unknown binary operator: ${BinaryOperator[ast.operator]}`);
    }
    const binEx = ts.createBinary(
        ast.lhs.visitExpression(this, context), BINARY_OPERATORS.get(ast.operator) !,
        ast.rhs.visitExpression(this, context));
    return ast.parens ? ts.createParen(binEx) : binEx;
  }

  visitReadPropExpr(ast: ReadPropExpr, context: Context): ts.PropertyAccessExpression {
    return ts.createPropertyAccess(ast.receiver.visitExpression(this, context), ast.name);
  }

  visitReadKeyExpr(ast: ReadKeyExpr, context: Context): ts.ElementAccessExpression {
    return ts.createElementAccess(
        ast.receiver.visitExpression(this, context), ast.index.visitExpression(this, context));
  }

  visitLiteralArrayExpr(ast: LiteralArrayExpr, context: Context): ts.ArrayLiteralExpression {
    return ts.createArrayLiteral(ast.entries.map(expr => expr.visitExpression(this, context)));
  }

  visitLiteralMapExpr(ast: LiteralMapExpr, context: Context): ts.ObjectLiteralExpression {
    const entries = ast.entries.map(
        entry => ts.createPropertyAssignment(
            entry.quoted ? ts.createLiteral(entry.key) : ts.createIdentifier(entry.key),
            entry.value.visitExpression(this, context)));
    return ts.createObjectLiteral(entries);
  }

  visitCommaExpr(ast: CommaExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitWrappedNodeExpr(ast: WrappedNodeExpr<any>, context: Context): any { return ast.node; }

  visitTypeofExpr(ast: TypeofExpr, context: Context): ts.TypeOfExpression {
    return ts.createTypeOf(ast.expr.visitExpression(this, context));
  }
}

export class TypeTranslatorVisitor implements ExpressionVisitor, TypeVisitor {
  constructor(private imports: ImportManager) {}

  visitBuiltinType(type: BuiltinType, context: Context): string {
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
      case BuiltinTypeName.None:
        return 'never';
      default:
        throw new Error(`Unsupported builtin type: ${BuiltinTypeName[type.name]}`);
    }
  }

  visitExpressionType(type: ExpressionType, context: Context): string {
    const exprStr = type.value.visitExpression(this, context);
    if (type.typeParams !== null) {
      const typeSegments = type.typeParams.map(param => param.visitType(this, context));
      return `${exprStr}<${typeSegments.join(', ')}>`;
    } else {
      return exprStr;
    }
  }

  visitArrayType(type: ArrayType, context: Context): string {
    return `Array<${type.visitType(this, context)}>`;
  }

  visitMapType(type: MapType, context: Context): string {
    if (type.valueType !== null) {
      return `{[key: string]: ${type.valueType.visitType(this, context)}}`;
    } else {
      return '{[key: string]: any}';
    }
  }

  visitReadVarExpr(ast: ReadVarExpr, context: Context): string {
    if (ast.name === null) {
      throw new Error(`ReadVarExpr with no variable name in type`);
    }
    return ast.name;
  }

  visitWriteVarExpr(expr: WriteVarExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitWriteKeyExpr(expr: WriteKeyExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitWritePropExpr(expr: WritePropExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitInvokeMethodExpr(ast: InvokeMethodExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitInvokeFunctionExpr(ast: InvokeFunctionExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitInstantiateExpr(ast: InstantiateExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitLiteralExpr(ast: LiteralExpr, context: Context): string {
    if (typeof ast.value === 'string') {
      const escaped = ast.value.replace(/\'/g, '\\\'');
      return `'${escaped}'`;
    } else {
      return `${ast.value}`;
    }
  }

  visitExternalExpr(ast: ExternalExpr, context: Context): string {
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

  visitConditionalExpr(ast: ConditionalExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitNotExpr(ast: NotExpr, context: Context) { throw new Error('Method not implemented.'); }

  visitAssertNotNullExpr(ast: AssertNotNull, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitCastExpr(ast: CastExpr, context: Context) { throw new Error('Method not implemented.'); }

  visitFunctionExpr(ast: FunctionExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitBinaryOperatorExpr(ast: BinaryOperatorExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitReadPropExpr(ast: ReadPropExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitReadKeyExpr(ast: ReadKeyExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitLiteralArrayExpr(ast: LiteralArrayExpr, context: Context): string {
    const values = ast.entries.map(expr => expr.visitExpression(this, context));
    return `[${values.join(', ')}]`;
  }

  visitLiteralMapExpr(ast: LiteralMapExpr, context: Context) {
    const entries = ast.entries.map(entry => {
      const {key, quoted} = entry;
      const value = entry.value.visitExpression(this, context);
      if (quoted) {
        return `'${key}': ${value}`;
      } else {
        return `${key}: ${value}`;
      }
    });
    return `{${entries.join(', ')}}`;
  }

  visitCommaExpr(ast: CommaExpr, context: Context) { throw new Error('Method not implemented.'); }

  visitWrappedNodeExpr(ast: WrappedNodeExpr<any>, context: Context) {
    const node: ts.Node = ast.node;
    if (ts.isIdentifier(node)) {
      return node.text;
    } else {
      throw new Error(
          `Unsupported WrappedNodeExpr in TypeTranslatorVisitor: ${ts.SyntaxKind[node.kind]}`);
    }
  }

  visitTypeofExpr(ast: TypeofExpr, context: Context): string {
    return `typeof ${ast.expr.visitExpression(this, context)}`;
  }
}
