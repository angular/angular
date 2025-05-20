/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  AstVisitor,
  ASTWithSource,
  Binary,
  BindingPipe,
  Call,
  Chain,
  Conditional,
  EmptyExpr,
  ImplicitReceiver,
  Interpolation,
  KeyedRead,
  KeyedWrite,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  NonNullAssert,
  ParenthesizedExpression,
  PrefixNot,
  PropertyRead,
  PropertyWrite,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
  TaggedTemplateLiteral,
  TemplateLiteral,
  TemplateLiteralElement,
  ThisReceiver,
  TypeofExpression,
  Unary,
  VoidExpression,
} from '@angular/compiler';
import ts from 'typescript';
import {TypeCheckingConfig} from '../api';
import {addParseSpanInfo, wrapForDiagnostics, wrapForTypeChecker} from './diagnostics';
import {tsCastToAny, tsNumericExpression} from './ts_util';
/**
 * Expression that is cast to any. Currently represented as `0 as any`.
 *
 * Historically this expression was using `null as any`, but a newly-added check in TypeScript 5.6
 * (https://devblogs.microsoft.com/typescript/announcing-typescript-5-6-beta/#disallowed-nullish-and-truthy-checks)
 * started flagging it as always being nullish. Other options that were considered:
 * - `NaN as any` or `Infinity as any` - not used, because they don't work if the `noLib` compiler
 *   option is enabled. Also they require more characters.
 * - Some flavor of function call, like `isNan(0) as any` - requires even more characters than the
 *   NaN option and has the same issue with `noLib`.
 */
export const ANY_EXPRESSION: ts.AsExpression = ts.factory.createAsExpression(
  ts.factory.createNumericLiteral('0'),
  ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
);
const UNDEFINED = ts.factory.createIdentifier('undefined');

const UNARY_OPS = new Map<string, ts.PrefixUnaryOperator>([
  ['+', ts.SyntaxKind.PlusToken],
  ['-', ts.SyntaxKind.MinusToken],
]);

const BINARY_OPS = new Map<string, ts.BinaryOperator>([
  ['+', ts.SyntaxKind.PlusToken],
  ['-', ts.SyntaxKind.MinusToken],
  ['<', ts.SyntaxKind.LessThanToken],
  ['>', ts.SyntaxKind.GreaterThanToken],
  ['<=', ts.SyntaxKind.LessThanEqualsToken],
  ['>=', ts.SyntaxKind.GreaterThanEqualsToken],
  ['==', ts.SyntaxKind.EqualsEqualsToken],
  ['===', ts.SyntaxKind.EqualsEqualsEqualsToken],
  ['*', ts.SyntaxKind.AsteriskToken],
  ['**', ts.SyntaxKind.AsteriskAsteriskToken],
  ['/', ts.SyntaxKind.SlashToken],
  ['%', ts.SyntaxKind.PercentToken],
  ['!=', ts.SyntaxKind.ExclamationEqualsToken],
  ['!==', ts.SyntaxKind.ExclamationEqualsEqualsToken],
  ['||', ts.SyntaxKind.BarBarToken],
  ['&&', ts.SyntaxKind.AmpersandAmpersandToken],
  ['&', ts.SyntaxKind.AmpersandToken],
  ['|', ts.SyntaxKind.BarToken],
  ['??', ts.SyntaxKind.QuestionQuestionToken],
  ['in', ts.SyntaxKind.InKeyword],
]);

/**
 * Convert an `AST` to TypeScript code directly, without going through an intermediate `Expression`
 * AST.
 */
export function astToTypescript(
  ast: AST,
  maybeResolve: (ast: AST) => ts.Expression | null,
  config: TypeCheckingConfig,
): ts.Expression {
  const translator = new AstTranslator(maybeResolve, config);
  return translator.translate(ast);
}

class AstTranslator implements AstVisitor {
  constructor(
    private maybeResolve: (ast: AST) => ts.Expression | null,
    private config: TypeCheckingConfig,
  ) {}

  translate(ast: AST): ts.Expression {
    // Skip over an `ASTWithSource` as its `visit` method calls directly into its ast's `visit`,
    // which would prevent any custom resolution through `maybeResolve` for that node.
    if (ast instanceof ASTWithSource) {
      ast = ast.ast;
    }

    // The `EmptyExpr` doesn't have a dedicated method on `AstVisitor`, so it's special cased here.
    if (ast instanceof EmptyExpr) {
      const res = ts.factory.createIdentifier('undefined');
      addParseSpanInfo(res, ast.sourceSpan);
      return res;
    }

    // First attempt to let any custom resolution logic provide a translation for the given node.
    const resolved = this.maybeResolve(ast);
    if (resolved !== null) {
      return resolved;
    }

    return ast.visit(this);
  }

  visitUnary(ast: Unary): ts.Expression {
    const expr = this.translate(ast.expr);
    const op = UNARY_OPS.get(ast.operator);
    if (op === undefined) {
      throw new Error(`Unsupported Unary.operator: ${ast.operator}`);
    }
    const node = wrapForDiagnostics(ts.factory.createPrefixUnaryExpression(op, expr));
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitBinary(ast: Binary): ts.Expression {
    const lhs = wrapForDiagnostics(this.translate(ast.left));
    const rhs = wrapForDiagnostics(this.translate(ast.right));
    const op = BINARY_OPS.get(ast.operation);
    if (op === undefined) {
      throw new Error(`Unsupported Binary.operation: ${ast.operation}`);
    }
    const node = ts.factory.createBinaryExpression(lhs, op, rhs);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitChain(ast: Chain): ts.Expression {
    const elements = ast.expressions.map((expr) => this.translate(expr));
    const node = wrapForDiagnostics(ts.factory.createCommaListExpression(elements));
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitConditional(ast: Conditional): ts.Expression {
    const condExpr = this.translate(ast.condition);
    const trueExpr = this.translate(ast.trueExp);
    // Wrap `falseExpr` in parens so that the trailing parse span info is not attributed to the
    // whole conditional.
    // In the following example, the last source span comment (5,6) could be seen as the
    // trailing comment for _either_ the whole conditional expression _or_ just the `falseExpr` that
    // is immediately before it:
    // `conditional /*1,2*/ ? trueExpr /*3,4*/ : falseExpr /*5,6*/`
    // This should be instead be `conditional /*1,2*/ ? trueExpr /*3,4*/ : (falseExpr /*5,6*/)`
    const falseExpr = wrapForTypeChecker(this.translate(ast.falseExp));
    const node = ts.factory.createParenthesizedExpression(
      ts.factory.createConditionalExpression(condExpr, undefined, trueExpr, undefined, falseExpr),
    );
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitImplicitReceiver(ast: ImplicitReceiver): never {
    throw new Error('Method not implemented.');
  }

  visitThisReceiver(ast: ThisReceiver): never {
    throw new Error('Method not implemented.');
  }

  visitInterpolation(ast: Interpolation): ts.Expression {
    // Build up a chain of binary + operations to simulate the string concatenation of the
    // interpolation's expressions. The chain is started using an actual string literal to ensure
    // the type is inferred as 'string'.
    return ast.expressions.reduce(
      (lhs: ts.Expression, ast: AST) =>
        ts.factory.createBinaryExpression(
          lhs,
          ts.SyntaxKind.PlusToken,
          wrapForTypeChecker(this.translate(ast)),
        ),
      ts.factory.createStringLiteral(''),
    );
  }

  visitKeyedRead(ast: KeyedRead): ts.Expression {
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const key = this.translate(ast.key);
    const node = ts.factory.createElementAccessExpression(receiver, key);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitKeyedWrite(ast: KeyedWrite): ts.Expression {
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const left = ts.factory.createElementAccessExpression(receiver, this.translate(ast.key));
    // TODO(joost): annotate `left` with the span of the element access, which is not currently
    //  available on `ast`.
    const right = wrapForTypeChecker(this.translate(ast.value));
    const node = wrapForDiagnostics(
      ts.factory.createBinaryExpression(left, ts.SyntaxKind.EqualsToken, right),
    );
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitLiteralArray(ast: LiteralArray): ts.Expression {
    const elements = ast.expressions.map((expr) => this.translate(expr));
    const literal = ts.factory.createArrayLiteralExpression(elements);
    // If strictLiteralTypes is disabled, array literals are cast to `any`.
    const node = this.config.strictLiteralTypes ? literal : tsCastToAny(literal);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitLiteralMap(ast: LiteralMap): ts.Expression {
    const properties = ast.keys.map(({key}, idx) => {
      const value = this.translate(ast.values[idx]);
      return ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(key), value);
    });
    const literal = ts.factory.createObjectLiteralExpression(properties, true);
    // If strictLiteralTypes is disabled, object literals are cast to `any`.
    const node = this.config.strictLiteralTypes ? literal : tsCastToAny(literal);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitLiteralPrimitive(ast: LiteralPrimitive): ts.Expression {
    let node: ts.Expression;
    if (ast.value === undefined) {
      node = ts.factory.createIdentifier('undefined');
    } else if (ast.value === null) {
      node = ts.factory.createNull();
    } else if (typeof ast.value === 'string') {
      node = ts.factory.createStringLiteral(ast.value);
    } else if (typeof ast.value === 'number') {
      node = tsNumericExpression(ast.value);
    } else if (typeof ast.value === 'boolean') {
      node = ast.value ? ts.factory.createTrue() : ts.factory.createFalse();
    } else {
      throw Error(`Unsupported AST value of type ${typeof ast.value}`);
    }
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitNonNullAssert(ast: NonNullAssert): ts.Expression {
    const expr = wrapForDiagnostics(this.translate(ast.expression));
    const node = ts.factory.createNonNullExpression(expr);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitPipe(ast: BindingPipe): never {
    throw new Error('Method not implemented.');
  }

  visitPrefixNot(ast: PrefixNot): ts.Expression {
    const expression = wrapForDiagnostics(this.translate(ast.expression));
    const node = ts.factory.createLogicalNot(expression);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitTypeofExpression(ast: TypeofExpression): ts.Expression {
    const expression = wrapForDiagnostics(this.translate(ast.expression));
    const node = ts.factory.createTypeOfExpression(expression);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitVoidExpression(ast: VoidExpression): ts.Expression {
    const expression = wrapForDiagnostics(this.translate(ast.expression));
    const node = ts.factory.createVoidExpression(expression);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitPropertyRead(ast: PropertyRead): ts.Expression {
    // This is a normal property read - convert the receiver to an expression and emit the correct
    // TypeScript expression to read the property.
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const name = ts.factory.createPropertyAccessExpression(receiver, ast.name);
    addParseSpanInfo(name, ast.nameSpan);
    const node = wrapForDiagnostics(name);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitPropertyWrite(ast: PropertyWrite): ts.Expression {
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const left = ts.factory.createPropertyAccessExpression(receiver, ast.name);
    addParseSpanInfo(left, ast.nameSpan);
    // TypeScript reports assignment errors on the entire lvalue expression. Annotate the lvalue of
    // the assignment with the sourceSpan, which includes receivers, rather than nameSpan for
    // consistency of the diagnostic location.
    // a.b.c = 1
    // ^^^^^^^^^ sourceSpan
    //     ^     nameSpan
    const leftWithPath = wrapForDiagnostics(left);
    addParseSpanInfo(leftWithPath, ast.sourceSpan);
    // The right needs to be wrapped in parens as well or we cannot accurately match its
    // span to just the RHS. For example, the span in `e = $event /*0,10*/` is ambiguous.
    // It could refer to either the whole binary expression or just the RHS.
    // We should instead generate `e = ($event /*0,10*/)` so we know the span 0,10 matches RHS.
    const right = wrapForTypeChecker(this.translate(ast.value));
    const node = wrapForDiagnostics(
      ts.factory.createBinaryExpression(leftWithPath, ts.SyntaxKind.EqualsToken, right),
    );
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitSafePropertyRead(ast: SafePropertyRead): ts.Expression {
    let node: ts.Expression;
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    // The form of safe property reads depends on whether strictness is in use.
    if (this.config.strictSafeNavigationTypes) {
      // Basically, the return here is either the type of the complete expression with a null-safe
      // property read, or `undefined`. So a ternary is used to create an "or" type:
      // "a?.b" becomes (0 as any ? a!.b : undefined)
      // The type of this expression is (typeof a!.b) | undefined, which is exactly as desired.
      const expr = ts.factory.createPropertyAccessExpression(
        ts.factory.createNonNullExpression(receiver),
        ast.name,
      );
      addParseSpanInfo(expr, ast.nameSpan);
      node = ts.factory.createParenthesizedExpression(
        ts.factory.createConditionalExpression(
          ANY_EXPRESSION,
          undefined,
          expr,
          undefined,
          UNDEFINED,
        ),
      );
    } else if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
      // Emulate a View Engine bug where 'any' is inferred for the left-hand side of the safe
      // navigation operation. With this bug, the type of the left-hand side is regarded as any.
      // Therefore, the left-hand side only needs repeating in the output (to validate it), and then
      // 'any' is used for the rest of the expression. This is done using a comma operator:
      // "a?.b" becomes (a as any).b, which will of course have type 'any'.
      node = ts.factory.createPropertyAccessExpression(tsCastToAny(receiver), ast.name);
    } else {
      // The View Engine bug isn't active, so check the entire type of the expression, but the final
      // result is still inferred as `any`.
      // "a?.b" becomes (a!.b as any)
      const expr = ts.factory.createPropertyAccessExpression(
        ts.factory.createNonNullExpression(receiver),
        ast.name,
      );
      addParseSpanInfo(expr, ast.nameSpan);
      node = tsCastToAny(expr);
    }
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitSafeKeyedRead(ast: SafeKeyedRead): ts.Expression {
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const key = this.translate(ast.key);
    let node: ts.Expression;

    // The form of safe property reads depends on whether strictness is in use.
    if (this.config.strictSafeNavigationTypes) {
      // "a?.[...]" becomes (0 as any ? a![...] : undefined)
      const expr = ts.factory.createElementAccessExpression(
        ts.factory.createNonNullExpression(receiver),
        key,
      );
      addParseSpanInfo(expr, ast.sourceSpan);
      node = ts.factory.createParenthesizedExpression(
        ts.factory.createConditionalExpression(
          ANY_EXPRESSION,
          undefined,
          expr,
          undefined,
          UNDEFINED,
        ),
      );
    } else if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
      // "a?.[...]" becomes (a as any)[...]
      node = ts.factory.createElementAccessExpression(tsCastToAny(receiver), key);
    } else {
      // "a?.[...]" becomes (a!.[...] as any)
      const expr = ts.factory.createElementAccessExpression(
        ts.factory.createNonNullExpression(receiver),
        key,
      );
      addParseSpanInfo(expr, ast.sourceSpan);
      node = tsCastToAny(expr);
    }
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitCall(ast: Call): ts.Expression {
    const args = ast.args.map((expr) => this.translate(expr));

    let expr: ts.Expression;
    const receiver = ast.receiver;

    // For calls that have a property read as receiver, we have to special-case their emit to avoid
    // inserting superfluous parenthesis as they prevent TypeScript from applying a narrowing effect
    // if the method acts as a type guard.
    if (receiver instanceof PropertyRead) {
      const resolved = this.maybeResolve(receiver);
      if (resolved !== null) {
        expr = resolved;
      } else {
        const propertyReceiver = wrapForDiagnostics(this.translate(receiver.receiver));
        expr = ts.factory.createPropertyAccessExpression(propertyReceiver, receiver.name);
        addParseSpanInfo(expr, receiver.nameSpan);
      }
    } else {
      expr = this.translate(receiver);
    }

    let node: ts.Expression;

    // Safe property/keyed reads will produce a ternary whose value is nullable.
    // We have to generate a similar ternary around the call.
    if (ast.receiver instanceof SafePropertyRead || ast.receiver instanceof SafeKeyedRead) {
      node = this.convertToSafeCall(ast, expr, args);
    } else {
      node = ts.factory.createCallExpression(expr, undefined, args);
    }

    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitSafeCall(ast: SafeCall): ts.Expression {
    const args = ast.args.map((expr) => this.translate(expr));
    const expr = wrapForDiagnostics(this.translate(ast.receiver));
    const node = this.convertToSafeCall(ast, expr, args);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitTemplateLiteral(ast: TemplateLiteral): ts.TemplateLiteral {
    const length = ast.elements.length;
    const head = ast.elements[0];
    let result: ts.TemplateLiteral;

    if (length === 1) {
      result = ts.factory.createNoSubstitutionTemplateLiteral(head.text);
    } else {
      const spans: ts.TemplateSpan[] = [];
      const tailIndex = length - 1;

      for (let i = 1; i < tailIndex; i++) {
        const middle = ts.factory.createTemplateMiddle(ast.elements[i].text);
        spans.push(ts.factory.createTemplateSpan(this.translate(ast.expressions[i - 1]), middle));
      }
      const resolvedExpression = this.translate(ast.expressions[tailIndex - 1]);
      const templateTail = ts.factory.createTemplateTail(ast.elements[tailIndex].text);
      spans.push(ts.factory.createTemplateSpan(resolvedExpression, templateTail));
      result = ts.factory.createTemplateExpression(ts.factory.createTemplateHead(head.text), spans);
    }

    return result;
  }

  visitTemplateLiteralElement(ast: TemplateLiteralElement, context: any) {
    throw new Error('Method not implemented');
  }

  visitTaggedTemplateLiteral(ast: TaggedTemplateLiteral): ts.TaggedTemplateExpression {
    return ts.factory.createTaggedTemplateExpression(
      this.translate(ast.tag),
      undefined,
      this.visitTemplateLiteral(ast.template),
    );
  }

  visitParenthesizedExpression(ast: ParenthesizedExpression): ts.ParenthesizedExpression {
    return ts.factory.createParenthesizedExpression(this.translate(ast.expression));
  }

  private convertToSafeCall(
    ast: Call | SafeCall,
    expr: ts.Expression,
    args: ts.Expression[],
  ): ts.Expression {
    if (this.config.strictSafeNavigationTypes) {
      // "a?.method(...)" becomes (0 as any ? a!.method(...) : undefined)
      const call = ts.factory.createCallExpression(
        ts.factory.createNonNullExpression(expr),
        undefined,
        args,
      );
      return ts.factory.createParenthesizedExpression(
        ts.factory.createConditionalExpression(
          ANY_EXPRESSION,
          undefined,
          call,
          undefined,
          UNDEFINED,
        ),
      );
    }

    if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
      // "a?.method(...)" becomes (a as any).method(...)
      return ts.factory.createCallExpression(tsCastToAny(expr), undefined, args);
    }

    // "a?.method(...)" becomes (a!.method(...) as any)
    return tsCastToAny(
      ts.factory.createCallExpression(ts.factory.createNonNullExpression(expr), undefined, args),
    );
  }
}

/**
 * Checks whether View Engine will infer a type of 'any' for the left-hand side of a safe navigation
 * operation.
 *
 * In View Engine's template type-checker, certain receivers of safe navigation operations will
 * cause a temporary variable to be allocated as part of the checking expression, to save the value
 * of the receiver and use it more than once in the expression. This temporary variable has type
 * 'any'. In practice, this means certain receivers cause View Engine to not check the full
 * expression, and other receivers will receive more complete checking.
 *
 * For compatibility, this logic is adapted from View Engine's expression_converter.ts so that the
 * Ivy checker can emulate this bug when needed.
 */
class VeSafeLhsInferenceBugDetector implements AstVisitor {
  private static SINGLETON = new VeSafeLhsInferenceBugDetector();

  static veWillInferAnyFor(ast: Call | SafeCall | SafePropertyRead | SafeKeyedRead) {
    const visitor = VeSafeLhsInferenceBugDetector.SINGLETON;
    return ast instanceof Call ? ast.visit(visitor) : ast.receiver.visit(visitor);
  }

  visitUnary(ast: Unary): boolean {
    return ast.expr.visit(this);
  }
  visitBinary(ast: Binary): boolean {
    return ast.left.visit(this) || ast.right.visit(this);
  }
  visitChain(ast: Chain): boolean {
    return false;
  }
  visitConditional(ast: Conditional): boolean {
    return ast.condition.visit(this) || ast.trueExp.visit(this) || ast.falseExp.visit(this);
  }
  visitCall(ast: Call): boolean {
    return true;
  }
  visitSafeCall(ast: SafeCall): boolean {
    return false;
  }
  visitImplicitReceiver(ast: ImplicitReceiver): boolean {
    return false;
  }
  visitThisReceiver(ast: ThisReceiver): boolean {
    return false;
  }
  visitInterpolation(ast: Interpolation): boolean {
    return ast.expressions.some((exp) => exp.visit(this));
  }
  visitKeyedRead(ast: KeyedRead): boolean {
    return false;
  }
  visitKeyedWrite(ast: KeyedWrite): boolean {
    return false;
  }
  visitLiteralArray(ast: LiteralArray): boolean {
    return true;
  }
  visitLiteralMap(ast: LiteralMap): boolean {
    return true;
  }
  visitLiteralPrimitive(ast: LiteralPrimitive): boolean {
    return false;
  }
  visitPipe(ast: BindingPipe): boolean {
    return true;
  }
  visitPrefixNot(ast: PrefixNot): boolean {
    return ast.expression.visit(this);
  }
  visitTypeofExpression(ast: TypeofExpression): boolean {
    return ast.expression.visit(this);
  }
  visitVoidExpression(ast: VoidExpression): boolean {
    return ast.expression.visit(this);
  }
  visitNonNullAssert(ast: NonNullAssert): boolean {
    return ast.expression.visit(this);
  }
  visitPropertyRead(ast: PropertyRead): boolean {
    return false;
  }
  visitPropertyWrite(ast: PropertyWrite): boolean {
    return false;
  }
  visitSafePropertyRead(ast: SafePropertyRead): boolean {
    return false;
  }
  visitSafeKeyedRead(ast: SafeKeyedRead): boolean {
    return false;
  }
  visitTemplateLiteral(ast: TemplateLiteral, context: any) {
    return false;
  }
  visitTemplateLiteralElement(ast: TemplateLiteralElement, context: any) {
    return false;
  }
  visitTaggedTemplateLiteral(ast: TaggedTemplateLiteral, context: any) {
    return false;
  }
  visitParenthesizedExpression(ast: ParenthesizedExpression, context: any) {
    return ast.expression.visit(this);
  }
}
