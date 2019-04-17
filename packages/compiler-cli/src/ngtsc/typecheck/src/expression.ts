/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, ASTWithSource, AstVisitor, Binary, BindingPipe, Chain, Conditional, FunctionCall, ImplicitReceiver, Interpolation, KeyedRead, KeyedWrite, LiteralArray, LiteralMap, LiteralPrimitive, MethodCall, NonNullAssert, ParseSpan, PrefixNot, PropertyRead, PropertyWrite, Quote, SafeMethodCall, SafePropertyRead} from '@angular/compiler';
import * as ts from 'typescript';

import {TypeCheckingConfig} from './api';
import {AbsoluteSpan, addParseSpanInfo, wrapForDiagnostics} from './diagnostics';

const NULL_AS_ANY =
    ts.createAsExpression(ts.createNull(), ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
const UNDEFINED = ts.createIdentifier('undefined');

const BINARY_OPS = new Map<string, ts.SyntaxKind>([
  ['+', ts.SyntaxKind.PlusToken],
  ['-', ts.SyntaxKind.MinusToken],
  ['<', ts.SyntaxKind.LessThanToken],
  ['>', ts.SyntaxKind.GreaterThanToken],
  ['<=', ts.SyntaxKind.LessThanEqualsToken],
  ['>=', ts.SyntaxKind.GreaterThanEqualsToken],
  ['==', ts.SyntaxKind.EqualsEqualsToken],
  ['===', ts.SyntaxKind.EqualsEqualsEqualsToken],
  ['*', ts.SyntaxKind.AsteriskToken],
  ['/', ts.SyntaxKind.SlashToken],
  ['%', ts.SyntaxKind.PercentToken],
  ['!=', ts.SyntaxKind.ExclamationEqualsToken],
  ['!==', ts.SyntaxKind.ExclamationEqualsEqualsToken],
  ['||', ts.SyntaxKind.BarBarToken],
  ['&&', ts.SyntaxKind.AmpersandAmpersandToken],
  ['&', ts.SyntaxKind.AmpersandToken],
  ['|', ts.SyntaxKind.BarToken],
]);

/**
 * Convert an `AST` to TypeScript code directly, without going through an intermediate `Expression`
 * AST.
 */
export function astToTypescript(
    ast: AST, maybeResolve: (ast: AST) => (ts.Expression | null), config: TypeCheckingConfig,
    translateSpan: (span: ParseSpan) => AbsoluteSpan): ts.Expression {
  const translator = new AstTranslator(maybeResolve, config, translateSpan);
  return translator.translate(ast);
}

class AstTranslator implements AstVisitor {
  constructor(
      private maybeResolve: (ast: AST) => (ts.Expression | null),
      private config: TypeCheckingConfig,
      private translateSpan: (span: ParseSpan) => AbsoluteSpan) {}

  translate(ast: AST): ts.Expression {
    // Skip over an `ASTWithSource` as its `visit` method calls directly into its ast's `visit`,
    // which would prevent any custom resolution through `maybeResolve` for that node.
    if (ast instanceof ASTWithSource) {
      ast = ast.ast;
    }

    // First attempt to let any custom resolution logic provide a translation for the given node.
    const resolved = this.maybeResolve(ast);
    if (resolved !== null) {
      return resolved;
    }

    return ast.visit(this);
  }

  visitBinary(ast: Binary): ts.Expression {
    const lhs = wrapForDiagnostics(this.translate(ast.left));
    const rhs = wrapForDiagnostics(this.translate(ast.right));
    const op = BINARY_OPS.get(ast.operation);
    if (op === undefined) {
      throw new Error(`Unsupported Binary.operation: ${ast.operation}`);
    }
    const node = ts.createBinary(lhs, op as any, rhs);
    addParseSpanInfo(node, this.translateSpan(ast.span));
    return node;
  }

  visitChain(ast: Chain): never { throw new Error('Method not implemented.'); }

  visitConditional(ast: Conditional): ts.Expression {
    const condExpr = this.translate(ast.condition);
    const trueExpr = this.translate(ast.trueExp);
    const falseExpr = this.translate(ast.falseExp);
    const node = ts.createParen(ts.createConditional(condExpr, trueExpr, falseExpr));
    addParseSpanInfo(node, this.translateSpan(ast.span));
    return node;
  }

  visitFunctionCall(ast: FunctionCall): never { throw new Error('Method not implemented.'); }

  visitImplicitReceiver(ast: ImplicitReceiver): never {
    throw new Error('Method not implemented.');
  }

  visitInterpolation(ast: Interpolation): ts.Expression {
    // Build up a chain of binary + operations to simulate the string concatenation of the
    // interpolation's expressions. The chain is started using an actual string literal to ensure
    // the type is inferred as 'string'.
    return ast.expressions.reduce(
        (lhs, ast) => ts.createBinary(lhs, ts.SyntaxKind.PlusToken, this.translate(ast)),
        ts.createLiteral(''));
  }

  visitKeyedRead(ast: KeyedRead): ts.Expression {
    const receiver = wrapForDiagnostics(this.translate(ast.obj));
    const key = this.translate(ast.key);
    const node = ts.createElementAccess(receiver, key);
    addParseSpanInfo(node, this.translateSpan(ast.span));
    return node;
  }

  visitKeyedWrite(ast: KeyedWrite): never { throw new Error('Method not implemented.'); }

  visitLiteralArray(ast: LiteralArray): ts.Expression {
    const elements = ast.expressions.map(expr => this.translate(expr));
    const node = ts.createArrayLiteral(elements);
    addParseSpanInfo(node, this.translateSpan(ast.span));
    return node;
  }

  visitLiteralMap(ast: LiteralMap): ts.Expression {
    const properties = ast.keys.map(({key}, idx) => {
      const value = this.translate(ast.values[idx]);
      return ts.createPropertyAssignment(ts.createStringLiteral(key), value);
    });
    const node = ts.createObjectLiteral(properties, true);
    addParseSpanInfo(node, this.translateSpan(ast.span));
    return node;
  }

  visitLiteralPrimitive(ast: LiteralPrimitive): ts.Expression {
    let node: ts.Expression;
    if (ast.value === undefined) {
      node = ts.createIdentifier('undefined');
    } else if (ast.value === null) {
      node = ts.createNull();
    } else {
      node = ts.createLiteral(ast.value);
    }
    addParseSpanInfo(node, this.translateSpan(ast.span));
    return node;
  }

  visitMethodCall(ast: MethodCall): ts.Expression {
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const method = ts.createPropertyAccess(receiver, ast.name);
    const args = ast.args.map(expr => this.translate(expr));
    const node = ts.createCall(method, undefined, args);
    addParseSpanInfo(node, this.translateSpan(ast.span));
    return node;
  }

  visitNonNullAssert(ast: NonNullAssert): ts.Expression {
    const expr = wrapForDiagnostics(this.translate(ast.expression));
    const node = ts.createNonNullExpression(expr);
    addParseSpanInfo(node, this.translateSpan(ast.span));
    return node;
  }

  visitPipe(ast: BindingPipe): never { throw new Error('Method not implemented.'); }

  visitPrefixNot(ast: PrefixNot): ts.Expression {
    const expression = wrapForDiagnostics(this.translate(ast.expression));
    const node = ts.createLogicalNot(expression);
    addParseSpanInfo(node, this.translateSpan(ast.span));
    return node;
  }

  visitPropertyRead(ast: PropertyRead): ts.Expression {
    // This is a normal property read - convert the receiver to an expression and emit the correct
    // TypeScript expression to read the property.
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const node = ts.createPropertyAccess(receiver, ast.name);
    addParseSpanInfo(node, this.translateSpan(ast.span));
    return node;
  }

  visitPropertyWrite(ast: PropertyWrite): never { throw new Error('Method not implemented.'); }

  visitQuote(ast: Quote): never { throw new Error('Method not implemented.'); }

  visitSafeMethodCall(ast: SafeMethodCall): ts.Expression {
    // See the comment in SafePropertyRead above for an explanation of the need for the non-null
    // assertion here.
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const method = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
    const args = ast.args.map(expr => this.translate(expr));
    const expr = ts.createCall(method, undefined, args);
    const whenNull = this.config.strictSafeNavigationTypes ? UNDEFINED : NULL_AS_ANY;
    const node = safeTernary(receiver, expr, whenNull);
    addParseSpanInfo(node, this.translateSpan(ast.span));
    return node;
  }

  visitSafePropertyRead(ast: SafePropertyRead): ts.Expression {
    // A safe property expression a?.b takes the form `(a != null ? a!.b : whenNull)`, where
    // whenNull is either of type 'any' or or 'undefined' depending on strictness. The non-null
    // assertion is necessary because in practice 'a' may be a method call expression, which won't
    // have a narrowed type when repeated in the ternary true branch.
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const expr = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
    const whenNull = this.config.strictSafeNavigationTypes ? UNDEFINED : NULL_AS_ANY;
    const node = safeTernary(receiver, expr, whenNull);
    addParseSpanInfo(node, this.translateSpan(ast.span));
    return node;
  }
}

function safeTernary(
    lhs: ts.Expression, whenNotNull: ts.Expression, whenNull: ts.Expression): ts.Expression {
  const notNullComp = ts.createBinary(lhs, ts.SyntaxKind.ExclamationEqualsToken, ts.createNull());
  const ternary = ts.createConditional(notNullComp, whenNotNull, whenNull);
  return ts.createParen(ternary);
}
