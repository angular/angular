/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, AstPath as AstPathBase, ASTWithName, ASTWithSource, Interpolation, RecursiveAstVisitor} from '@angular/compiler';

import {AstType} from './expression_type';
import {BuiltinType, Span, Symbol, SymbolTable, TemplateSource} from './types';
import {inSpan, isNarrower} from './utils';

type AstPath = AstPathBase<AST>;

function findAstAt(ast: AST, position: number, excludeEmpty: boolean = false): AstPath {
  const path: AST[] = [];
  const visitor = new class extends RecursiveAstVisitor {
    visit(ast: AST) {
      if ((!excludeEmpty || ast.sourceSpan.start < ast.sourceSpan.end) &&
          inSpan(position, ast.sourceSpan)) {
        const isNotNarrower = path.length && !isNarrower(ast.span, path[path.length - 1].span);
        if (!isNotNarrower) {
          path.push(ast);
        }
        ast.visit(this);
      }
    }
  };

  // We never care about the ASTWithSource node and its visit() method calls its ast's visit so
  // the visit() method above would never see it.
  if (ast instanceof ASTWithSource) {
    ast = ast.ast;
  }

  // `Interpolation` is useless here except the `expressions` of it.
  if (ast instanceof Interpolation) {
    ast = ast.expressions.filter((_ast: AST) => inSpan(position, _ast.sourceSpan))[0];
  }

  if (ast) {
    visitor.visit(ast);
  }

  return new AstPathBase<AST>(path, position);
}

export function getExpressionCompletions(
    scope: SymbolTable, ast: AST, position: number, templateInfo: TemplateSource): Symbol[]|
    undefined {
  const path = findAstAt(ast, position);
  if (path.empty) return undefined;
  const tail = path.tail!;
  let result: SymbolTable|undefined = scope;

  function getType(ast: AST): Symbol {
    return new AstType(scope, templateInfo.query, {}, templateInfo.source).getType(ast);
  }

  // If the completion request is in a not in a pipe or property access then the global scope
  // (that is the scope of the implicit receiver) is the right scope as the user is typing the
  // beginning of an expression.
  tail.visit({
    visitUnary(_ast) {},
    visitBinary(_ast) {},
    visitChain(_ast) {},
    visitConditional(_ast) {},
    visitFunctionCall(_ast) {},
    visitImplicitReceiver(_ast) {},
    visitThisReceiver(_ast) {},
    visitInterpolation(_ast) {
      result = undefined;
    },
    visitKeyedRead(_ast) {},
    visitKeyedWrite(_ast) {},
    visitLiteralArray(_ast) {},
    visitLiteralMap(_ast) {},
    visitLiteralPrimitive(ast) {
      // The type `LiteralPrimitive` include the `ERROR`, and it's wrapped as `string`.
      // packages/compiler/src/template_parser/binding_parser.ts#L308
      // So exclude the `ERROR` here.
      if (typeof ast.value === 'string' &&
          ast.value ===
              templateInfo.source.slice(ast.sourceSpan.start + 1, ast.sourceSpan.end - 1)) {
        result = undefined;
      }
    },
    visitMethodCall(_ast) {},
    visitPipe(ast) {
      if (position >= ast.exp.span.end &&
          (!ast.args || !ast.args.length || position < (<AST>ast.args[0]).span.start)) {
        // We are in a position a pipe name is expected.
        result = templateInfo.query.getPipes();
      }
    },
    visitPrefixNot(_ast) {},
    visitNonNullAssert(_ast) {},
    visitPropertyRead(ast) {
      const receiverType = getType(ast.receiver);
      result = receiverType ? receiverType.members() : scope;
    },
    visitPropertyWrite(ast) {
      const receiverType = getType(ast.receiver);
      result = receiverType ? receiverType.members() : scope;
    },
    visitQuote(_ast) {
      // For a quote, return the members of any (if there are any).
      result = templateInfo.query.getBuiltinType(BuiltinType.Any).members();
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

/**
 * Retrieves the expression symbol at a particular position in a template.
 *
 * @param scope symbols in scope of the template
 * @param ast template AST
 * @param position absolute location in template to retrieve symbol at
 * @param query type symbol query for the template scope
 */
export function getExpressionSymbol(
    scope: SymbolTable, ast: AST, position: number,
    templateInfo: TemplateSource): {symbol: Symbol, span: Span}|undefined {
  const path = findAstAt(ast, position, /* excludeEmpty */ true);
  if (path.empty) return undefined;
  const tail = path.tail!;

  function getType(ast: AST): Symbol {
    return new AstType(scope, templateInfo.query, {}, templateInfo.source).getType(ast);
  }

  function spanFromName(ast: ASTWithName): Span {
    // `nameSpan` is an absolute span, but the span expected by the result of this method is
    // relative to the start of the expression.
    // TODO(ayazhafiz): migrate to only using absolute spans
    const offset = ast.sourceSpan.start - ast.span.start;
    return {
      start: ast.nameSpan.start - offset,
      end: ast.nameSpan.end - offset,
    };
  }

  let symbol: Symbol|undefined = undefined;
  let span: Span|undefined = undefined;

  // If the completion request is in a not in a pipe or property access then the global scope
  // (that is the scope of the implicit receiver) is the right scope as the user is typing the
  // beginning of an expression.
  tail.visit({
    visitUnary(_ast) {},
    visitBinary(_ast) {},
    visitChain(_ast) {},
    visitConditional(_ast) {},
    visitFunctionCall(_ast) {},
    visitImplicitReceiver(_ast) {},
    visitThisReceiver(_ast) {},
    visitInterpolation(_ast) {},
    visitKeyedRead(_ast) {},
    visitKeyedWrite(_ast) {},
    visitLiteralArray(_ast) {},
    visitLiteralMap(_ast) {},
    visitLiteralPrimitive(_ast) {},
    visitMethodCall(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = spanFromName(ast);
    },
    visitPipe(ast) {
      if (inSpan(position, ast.nameSpan, /* exclusive */ true)) {
        // We are in a position a pipe name is expected.
        const pipes = templateInfo.query.getPipes();
        symbol = pipes.get(ast.name);
        span = spanFromName(ast);
      }
    },
    visitPrefixNot(_ast) {},
    visitNonNullAssert(_ast) {},
    visitPropertyRead(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = spanFromName(ast);
    },
    visitPropertyWrite(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = spanFromName(ast);
    },
    visitQuote(_ast) {},
    visitSafeMethodCall(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = spanFromName(ast);
    },
    visitSafePropertyRead(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = spanFromName(ast);
    },
  });

  if (symbol && span) {
    return {symbol, span};
  }
}
