/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as cdAst from '../expression_parser/ast';
import {BaseException} from '../facade/exceptions';
import {isArray, isBlank, isPresent} from '../facade/lang';
import {Identifiers} from '../identifiers';
import * as o from '../output/output_ast';

var IMPLICIT_RECEIVER = o.variable('#implicit');

export interface NameResolver {
  callPipe(name: string, input: o.Expression, args: o.Expression[]): o.Expression;
  getLocal(name: string): o.Expression;
  createLiteralArray(values: o.Expression[]): o.Expression;
  createLiteralMap(values: Array<Array<string|o.Expression>>): o.Expression;
}

export class ExpressionWithWrappedValueInfo {
  constructor(public expression: o.Expression, public needsValueUnwrapper: boolean) {}
}

export function convertCdExpressionToIr(
    nameResolver: NameResolver, implicitReceiver: o.Expression, expression: cdAst.AST,
    valueUnwrapper: o.ReadVarExpr): ExpressionWithWrappedValueInfo {
  const visitor = new _AstToIrVisitor(nameResolver, implicitReceiver, valueUnwrapper);
  const irAst: o.Expression = expression.visit(visitor, _Mode.Expression);
  return new ExpressionWithWrappedValueInfo(irAst, visitor.needsValueUnwrapper);
}

export function convertCdStatementToIr(
    nameResolver: NameResolver, implicitReceiver: o.Expression, stmt: cdAst.AST): o.Statement[] {
  const visitor = new _AstToIrVisitor(nameResolver, implicitReceiver, null);
  let statements: o.Statement[] = [];
  flattenStatements(stmt.visit(visitor, _Mode.Statement), statements);
  return statements;
}

enum _Mode {
  Statement,
  Expression
}

function ensureStatementMode(mode: _Mode, ast: cdAst.AST) {
  if (mode !== _Mode.Statement) {
    throw new BaseException(`Expected a statement, but saw ${ast}`);
  }
}

function ensureExpressionMode(mode: _Mode, ast: cdAst.AST) {
  if (mode !== _Mode.Expression) {
    throw new BaseException(`Expected an expression, but saw ${ast}`);
  }
}

function convertToStatementIfNeeded(mode: _Mode, expr: o.Expression): o.Expression|o.Statement {
  if (mode === _Mode.Statement) {
    return expr.toStmt();
  } else {
    return expr;
  }
}

class _AstToIrVisitor implements cdAst.AstVisitor {
  private _map = new Map<cdAst.AST, cdAst.AST>();

  public needsValueUnwrapper: boolean = false;

  constructor(
      private _nameResolver: NameResolver, private _implicitReceiver: o.Expression,
      private _valueUnwrapper: o.ReadVarExpr) {}

  visitBinary(ast: cdAst.Binary, mode: _Mode): any {
    var op: o.BinaryOperator;
    switch (ast.operation) {
      case '+':
        op = o.BinaryOperator.Plus;
        break;
      case '-':
        op = o.BinaryOperator.Minus;
        break;
      case '*':
        op = o.BinaryOperator.Multiply;
        break;
      case '/':
        op = o.BinaryOperator.Divide;
        break;
      case '%':
        op = o.BinaryOperator.Modulo;
        break;
      case '&&':
        op = o.BinaryOperator.And;
        break;
      case '||':
        op = o.BinaryOperator.Or;
        break;
      case '==':
        op = o.BinaryOperator.Equals;
        break;
      case '!=':
        op = o.BinaryOperator.NotEquals;
        break;
      case '===':
        op = o.BinaryOperator.Identical;
        break;
      case '!==':
        op = o.BinaryOperator.NotIdentical;
        break;
      case '<':
        op = o.BinaryOperator.Lower;
        break;
      case '>':
        op = o.BinaryOperator.Bigger;
        break;
      case '<=':
        op = o.BinaryOperator.LowerEquals;
        break;
      case '>=':
        op = o.BinaryOperator.BiggerEquals;
        break;
      default:
        throw new BaseException(`Unsupported operation ${ast.operation}`);
    }

    return convertToStatementIfNeeded(
        mode,
        new o.BinaryOperatorExpr(
            op, this.visit(ast.left, _Mode.Expression), this.visit(ast.right, _Mode.Expression)));
  }
  visitChain(ast: cdAst.Chain, mode: _Mode): any {
    ensureStatementMode(mode, ast);
    return this.visitAll(ast.expressions, mode);
  }
  visitConditional(ast: cdAst.Conditional, mode: _Mode): any {
    const value: o.Expression = this.visit(ast.condition, _Mode.Expression);
    return convertToStatementIfNeeded(
        mode,
        value.conditional(
            this.visit(ast.trueExp, _Mode.Expression), this.visit(ast.falseExp, _Mode.Expression)));
  }
  visitPipe(ast: cdAst.BindingPipe, mode: _Mode): any {
    const input = this.visit(ast.exp, _Mode.Expression);
    const args = this.visitAll(ast.args, _Mode.Expression);
    const value = this._nameResolver.callPipe(ast.name, input, args);
    this.needsValueUnwrapper = true;
    return convertToStatementIfNeeded(mode, this._valueUnwrapper.callMethod('unwrap', [value]));
  }
  visitFunctionCall(ast: cdAst.FunctionCall, mode: _Mode): any {
    return convertToStatementIfNeeded(
        mode,
        this.visit(ast.target, _Mode.Expression).callFn(this.visitAll(ast.args, _Mode.Expression)));
  }
  visitImplicitReceiver(ast: cdAst.ImplicitReceiver, mode: _Mode): any {
    ensureExpressionMode(mode, ast);
    return IMPLICIT_RECEIVER;
  }
  visitInterpolation(ast: cdAst.Interpolation, mode: _Mode): any {
    ensureExpressionMode(mode, ast);
    const args = [o.literal(ast.expressions.length)];
    for (let i = 0; i < ast.strings.length - 1; i++) {
      args.push(o.literal(ast.strings[i]));
      args.push(this.visit(ast.expressions[i], _Mode.Expression));
    }
    args.push(o.literal(ast.strings[ast.strings.length - 1]));
    return o.importExpr(Identifiers.interpolate).callFn(args);
  }
  visitKeyedRead(ast: cdAst.KeyedRead, mode: _Mode): any {
    return convertToStatementIfNeeded(
        mode, this.visit(ast.obj, _Mode.Expression).key(this.visit(ast.key, _Mode.Expression)));
  }
  visitKeyedWrite(ast: cdAst.KeyedWrite, mode: _Mode): any {
    const obj: o.Expression = this.visit(ast.obj, _Mode.Expression);
    const key: o.Expression = this.visit(ast.key, _Mode.Expression);
    const value: o.Expression = this.visit(ast.value, _Mode.Expression);
    return convertToStatementIfNeeded(mode, obj.key(key).set(value));
  }
  visitLiteralArray(ast: cdAst.LiteralArray, mode: _Mode): any {
    return convertToStatementIfNeeded(
        mode, this._nameResolver.createLiteralArray(this.visitAll(ast.expressions, mode)));
  }
  visitLiteralMap(ast: cdAst.LiteralMap, mode: _Mode): any {
    let parts: any[] = [];
    for (let i = 0; i < ast.keys.length; i++) {
      parts.push([ast.keys[i], this.visit(ast.values[i], _Mode.Expression)]);
    }
    return convertToStatementIfNeeded(mode, this._nameResolver.createLiteralMap(parts));
  }
  visitLiteralPrimitive(ast: cdAst.LiteralPrimitive, mode: _Mode): any {
    return convertToStatementIfNeeded(mode, o.literal(ast.value));
  }
  visitMethodCall(ast: cdAst.MethodCall, mode: _Mode): any {
    const leftMostSafe = this.leftMostSafeNode(ast);
    if (leftMostSafe) {
      return this.convertSafeAccess(ast, leftMostSafe, mode);
    } else {
      const args = this.visitAll(ast.args, _Mode.Expression);
      let result: any = null;
      let receiver = this.visit(ast.receiver, _Mode.Expression);
      if (receiver === IMPLICIT_RECEIVER) {
        var varExpr = this._nameResolver.getLocal(ast.name);
        if (isPresent(varExpr)) {
          result = varExpr.callFn(args);
        } else {
          receiver = this._implicitReceiver;
        }
      }
      if (isBlank(result)) {
        result = receiver.callMethod(ast.name, args);
      }
      return convertToStatementIfNeeded(mode, result);
    }
  }
  visitPrefixNot(ast: cdAst.PrefixNot, mode: _Mode): any {
    return convertToStatementIfNeeded(mode, o.not(this.visit(ast.expression, _Mode.Expression)));
  }
  visitPropertyRead(ast: cdAst.PropertyRead, mode: _Mode): any {
    const leftMostSafe = this.leftMostSafeNode(ast);
    if (leftMostSafe) {
      return this.convertSafeAccess(ast, leftMostSafe, mode);
    } else {
      let result: any = null;
      var receiver = this.visit(ast.receiver, _Mode.Expression);
      if (receiver === IMPLICIT_RECEIVER) {
        result = this._nameResolver.getLocal(ast.name);
        if (isBlank(result)) {
          receiver = this._implicitReceiver;
        }
      }
      if (isBlank(result)) {
        result = receiver.prop(ast.name);
      }
      return convertToStatementIfNeeded(mode, result);
    }
  }
  visitPropertyWrite(ast: cdAst.PropertyWrite, mode: _Mode): any {
    let receiver: o.Expression = this.visit(ast.receiver, _Mode.Expression);
    if (receiver === IMPLICIT_RECEIVER) {
      var varExpr = this._nameResolver.getLocal(ast.name);
      if (isPresent(varExpr)) {
        throw new BaseException('Cannot assign to a reference or variable!');
      }
      receiver = this._implicitReceiver;
    }
    return convertToStatementIfNeeded(
        mode, receiver.prop(ast.name).set(this.visit(ast.value, _Mode.Expression)));
  }
  visitSafePropertyRead(ast: cdAst.SafePropertyRead, mode: _Mode): any {
    return this.convertSafeAccess(ast, this.leftMostSafeNode(ast), mode);
  }
  visitSafeMethodCall(ast: cdAst.SafeMethodCall, mode: _Mode): any {
    return this.convertSafeAccess(ast, this.leftMostSafeNode(ast), mode);
  }
  visitAll(asts: cdAst.AST[], mode: _Mode): any { return asts.map(ast => this.visit(ast, mode)); }
  visitQuote(ast: cdAst.Quote, mode: _Mode): any {
    throw new BaseException('Quotes are not supported for evaluation!');
  }

  private visit(ast: cdAst.AST, mode: _Mode): any {
    return (this._map.get(ast) || ast).visit(this, mode);
  }

  private convertSafeAccess(
      ast: cdAst.AST, leftMostSafe: cdAst.SafeMethodCall|cdAst.SafePropertyRead, mode: _Mode): any {
    // If the expression contains a safe access node on the left it needs to be converted to
    // an expression that guards the access to the member by checking the receiver for blank. As
    // execution proceeds from left to right, the left most part of the expression must be guarded
    // first but, because member access is left associative, the right side of the expression is at
    // the top of the AST. The desired result requires lifting a copy of the the left part of the
    // expression up to test it for blank before generating the unguarded version.

    // Consider, for example the following expression: a?.b.c?.d.e

    // This results in the ast:
    //         .
    //        / \
    //       ?.   e
    //      /  \
    //     .    d
    //    / \
    //   ?.  c
    //  /  \
    // a    b

    // The following tree should be generated:
    //
    //        /---- ? ----\
    //       /      |      \
    //     a   /--- ? ---\  null
    //        /     |     \
    //       .      .     null
    //      / \    / \
    //     .  c   .   e
    //    / \    / \
    //   a   b  ,   d
    //         / \
    //        .   c
    //       / \
    //      a   b
    //
    // Notice that the first guard condition is the left hand of the left most safe access node
    // which comes in as leftMostSafe to this routine.

    const condition = this.visit(leftMostSafe.receiver, mode).isBlank();

    // Convert the ast to an unguarded access to the receiver's member. The map will substitute
    // leftMostNode with its unguarded version in the call to `this.visit()`.
    if (leftMostSafe instanceof cdAst.SafeMethodCall) {
      this._map.set(
          leftMostSafe,
          new cdAst.MethodCall(
              leftMostSafe.span, leftMostSafe.receiver, leftMostSafe.name, leftMostSafe.args));
    } else {
      this._map.set(
          leftMostSafe,
          new cdAst.PropertyRead(leftMostSafe.span, leftMostSafe.receiver, leftMostSafe.name));
    }

    // Recursively convert the node now without the guarded member access.
    const access = this.visit(ast, mode);

    // Remove the mapping. This is not strictly required as the converter only traverses each node
    // once but is safer if the conversion is changed to traverse the nodes more than once.
    this._map.delete(leftMostSafe);

    // Produce the conditional
    return condition.conditional(o.literal(null), access);
  }

  // Given a expression of the form a?.b.c?.d.e the the left most safe node is
  // the (a?.b). The . and ?. are left associative thus can be rewritten as:
  // ((((a?.c).b).c)?.d).e. This returns the most deeply nested safe read or
  // safe method call as this needs be transform initially to:
  //   a == null ? null : a.c.b.c?.d.e
  // then to:
  //   a == null ? null : a.b.c == null ? null : a.b.c.d.e
  private leftMostSafeNode(ast: cdAst.AST): cdAst.SafePropertyRead|cdAst.SafeMethodCall {
    let visit = (visitor: cdAst.AstVisitor, ast: cdAst.AST): any => {
      return (this._map.get(ast) || ast).visit(visitor);
    };
    return ast.visit({
      visitBinary(ast: cdAst.Binary) { return null; },
      visitChain(ast: cdAst.Chain) { return null; },
      visitConditional(ast: cdAst.Conditional) { return null; },
      visitFunctionCall(ast: cdAst.FunctionCall) { return null; },
      visitImplicitReceiver(ast: cdAst.ImplicitReceiver) { return null; },
      visitInterpolation(ast: cdAst.Interpolation) { return null; },
      visitKeyedRead(ast: cdAst.KeyedRead) { return visit(this, ast.obj); },
      visitKeyedWrite(ast: cdAst.KeyedWrite) { return null; },
      visitLiteralArray(ast: cdAst.LiteralArray) { return null; },
      visitLiteralMap(ast: cdAst.LiteralMap) { return null; },
      visitLiteralPrimitive(ast: cdAst.LiteralPrimitive) { return null; },
      visitMethodCall(ast: cdAst.MethodCall) { return visit(this, ast.receiver); },
      visitPipe(ast: cdAst.BindingPipe) { return null; },
      visitPrefixNot(ast: cdAst.PrefixNot) { return null; },
      visitPropertyRead(ast: cdAst.PropertyRead) { return visit(this, ast.receiver); },
      visitPropertyWrite(ast: cdAst.PropertyWrite) { return null; },
      visitQuote(ast: cdAst.Quote) { return null; },
      visitSafeMethodCall(ast: cdAst.SafeMethodCall) { return visit(this, ast.receiver) || ast; },
      visitSafePropertyRead(ast: cdAst.SafePropertyRead) {
        return visit(this, ast.receiver) || ast;
      }
    });
  }
}

function flattenStatements(arg: any, output: o.Statement[]) {
  if (isArray(arg)) {
    (<any[]>arg).forEach((entry) => flattenStatements(entry, output));
  } else {
    output.push(arg);
  }
}
