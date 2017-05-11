/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, ASTWithSource, AstPath as AstPathBase, NullAstVisitor, visitAstChildren} from '@angular/compiler';
import {AstType} from '@angular/compiler-cli';

import {BuiltinType, Span, Symbol, SymbolQuery, SymbolTable} from './types';
import {inSpan} from './utils';

type AstPath = AstPathBase<AST>;

function findAstAt(ast: AST, position: number, excludeEmpty: boolean = false): AstPath {
  const path: AST[] = [];
  const visitor = new class extends NullAstVisitor {
    visit(ast: AST) {
      if ((!excludeEmpty || ast.span.start < ast.span.end) && inSpan(position, ast.span)) {
        path.push(ast);
        visitAstChildren(ast, this);
      }
    }
  };

  // We never care about the ASTWithSource node and its visit() method calls its ast's visit so
  // the visit() method above would never see it.
  if (ast instanceof ASTWithSource) {
    ast = ast.ast;
  }

  visitor.visit(ast);

  return new AstPathBase<AST>(path, position);
}

export function getExpressionCompletions(
    scope: SymbolTable, ast: AST, position: number, query: SymbolQuery): Symbol[]|undefined {
  const path = findAstAt(ast, position);
  if (path.empty) return undefined;
  const tail = path.tail !;
  let result: SymbolTable|undefined = scope;

  function getType(ast: AST): Symbol { return new AstType(scope, query, {}).getType(ast); }

  // If the completion request is in a not in a pipe or property access then the global scope
  // (that is the scope of the implicit receiver) is the right scope as the user is typing the
  // beginning of an expression.
  tail.visit({
    visitBinary(ast) {},
    visitChain(ast) {},
    visitConditional(ast) {},
    visitFunctionCall(ast) {},
    visitImplicitReceiver(ast) {},
    visitInterpolation(ast) { result = undefined; },
    visitKeyedRead(ast) {},
    visitKeyedWrite(ast) {},
    visitLiteralArray(ast) {},
    visitLiteralMap(ast) {},
    visitLiteralPrimitive(ast) {},
    visitMethodCall(ast) {},
    visitPipe(ast) {
      if (position >= ast.exp.span.end &&
          (!ast.args || !ast.args.length || position < (<AST>ast.args[0]).span.start)) {
        // We are in a position a pipe name is expected.
        result = query.getPipes();
      }
    },
    visitPrefixNot(ast) {},
    visitNonNullAssert(ast) {},
    visitPropertyRead(ast) {
      const receiverType = getType(ast.receiver);
      result = receiverType ? receiverType.members() : scope;
    },
    visitPropertyWrite(ast) {
      const receiverType = getType(ast.receiver);
      result = receiverType ? receiverType.members() : scope;
    },
    visitQuote(ast) {
      // For a quote, return the members of any (if there are any).
      result = query.getBuiltinType(BuiltinType.Any).members();
    },
    visitSafeMethodCall(ast) {
      const receiverType = getType(ast.receiver);
      result = receiverType ? receiverType.members() : scope;
    },
    visitSafePropertyRead(ast) {
      const receiverType = getType(ast.receiver);
      result = receiverType ? receiverType.members() : scope;
    },
  });

  return result && result.values();
}

export function getExpressionSymbol(
    scope: SymbolTable, ast: AST, position: number,
    query: SymbolQuery): {symbol: Symbol, span: Span}|undefined {
  const path = findAstAt(ast, position, /* excludeEmpty */ true);
  if (path.empty) return undefined;
  const tail = path.tail !;

  function getType(ast: AST): Symbol { return new AstType(scope, query, {}).getType(ast); }

  let symbol: Symbol|undefined = undefined;
  let span: Span|undefined = undefined;

  // If the completion request is in a not in a pipe or property access then the global scope
  // (that is the scope of the implicit receiver) is the right scope as the user is typing the
  // beginning of an expression.
  tail.visit({
    visitBinary(ast) {},
    visitChain(ast) {},
    visitConditional(ast) {},
    visitFunctionCall(ast) {},
    visitImplicitReceiver(ast) {},
    visitInterpolation(ast) {},
    visitKeyedRead(ast) {},
    visitKeyedWrite(ast) {},
    visitLiteralArray(ast) {},
    visitLiteralMap(ast) {},
    visitLiteralPrimitive(ast) {},
    visitMethodCall(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = ast.span;
    },
    visitPipe(ast) {
      if (position >= ast.exp.span.end &&
          (!ast.args || !ast.args.length || position < (<AST>ast.args[0]).span.start)) {
        // We are in a position a pipe name is expected.
        const pipes = query.getPipes();
        if (pipes) {
          symbol = pipes.get(ast.name);
          span = ast.span;
        }
      }
    },
    visitPrefixNot(ast) {},
    visitNonNullAssert(ast) {},
    visitPropertyRead(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = ast.span;
    },
    visitPropertyWrite(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = ast.span;
    },
    visitQuote(ast) {},
    visitSafeMethodCall(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = ast.span;
    },
    visitSafePropertyRead(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = ast.span;
    },
  });

  if (symbol && span) {
    return {symbol, span};
  }
}
