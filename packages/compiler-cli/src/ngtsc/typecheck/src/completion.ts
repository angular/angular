/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  EmptyExpr,
  ImplicitReceiver,
  LiteralPrimitive,
  PropertyRead,
  PropertyWrite,
  SafePropertyRead,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstReference,
  TmplAstTemplate,
  TmplAstTextAttribute,
} from '@angular/compiler';
import ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';
import {
  CompletionKind,
  GlobalCompletion,
  ReferenceCompletion,
  TcbLocation,
  VariableCompletion,
  LetDeclarationCompletion,
} from '../api';

import {ExpressionIdentifier, findFirstMatchingNode} from './comments';
import {TypeCheckData} from './context';

/**
 * Powers autocompletion for a specific component.
 *
 * Internally caches autocompletion results, and must be discarded if the component template or
 * surrounding TS program have changed.
 */
export class CompletionEngine {
  private componentContext: TcbLocation | null;

  /**
   * Cache of completions for various levels of the template, including the root template (`null`).
   * Memoizes `getTemplateContextCompletions`.
   */
  private templateContextCache = new Map<
    TmplAstTemplate | null,
    Map<string, ReferenceCompletion | VariableCompletion | LetDeclarationCompletion>
  >();

  private expressionCompletionCache = new Map<
    PropertyRead | SafePropertyRead | LiteralPrimitive | TmplAstTextAttribute,
    TcbLocation
  >();

  constructor(
    private tcb: ts.Node,
    private data: TypeCheckData,
    private tcbPath: AbsoluteFsPath,
    private tcbIsShim: boolean,
  ) {
    // Find the component completion expression within the TCB. This looks like: `ctx. /* ... */;`
    const globalRead = findFirstMatchingNode(this.tcb, {
      filter: ts.isPropertyAccessExpression,
      withExpressionIdentifier: ExpressionIdentifier.COMPONENT_COMPLETION,
    });

    if (globalRead !== null) {
      this.componentContext = {
        tcbPath: this.tcbPath,
        isShimFile: this.tcbIsShim,
        // `globalRead.name` is an empty `ts.Identifier`, so its start position immediately follows
        // the `.` in `ctx.`. TS autocompletion APIs can then be used to access completion results
        // for the component context.
        positionInFile: globalRead.name.getStart(),
      };
    } else {
      this.componentContext = null;
    }
  }

  /**
   * Get global completions within the given template context and AST node.
   *
   * @param context the given template context - either a `TmplAstTemplate` embedded view, or `null`
   *     for the root
   * template context.
   * @param node the given AST node
   */
  getGlobalCompletions(
    context: TmplAstTemplate | null,
    node: AST | TmplAstNode,
  ): GlobalCompletion | null {
    if (this.componentContext === null) {
      return null;
    }

    const templateContext = this.getTemplateContextCompletions(context);
    if (templateContext === null) {
      return null;
    }

    let nodeContext: TcbLocation | null = null;
    if (node instanceof EmptyExpr) {
      const nodeLocation = findFirstMatchingNode(this.tcb, {
        filter: ts.isIdentifier,
        withSpan: node.sourceSpan,
      });
      if (nodeLocation !== null) {
        nodeContext = {
          tcbPath: this.tcbPath,
          isShimFile: this.tcbIsShim,
          positionInFile: nodeLocation.getStart(),
        };
      }
    }

    if (node instanceof PropertyRead && node.receiver instanceof ImplicitReceiver) {
      const nodeLocation = findFirstMatchingNode(this.tcb, {
        filter: ts.isPropertyAccessExpression,
        withSpan: node.sourceSpan,
      });
      if (nodeLocation) {
        nodeContext = {
          tcbPath: this.tcbPath,
          isShimFile: this.tcbIsShim,
          positionInFile: nodeLocation.getStart(),
        };
      }
    }

    return {
      componentContext: this.componentContext,
      templateContext,
      nodeContext,
    };
  }

  getExpressionCompletionLocation(
    expr: PropertyRead | PropertyWrite | SafePropertyRead,
  ): TcbLocation | null {
    if (this.expressionCompletionCache.has(expr)) {
      return this.expressionCompletionCache.get(expr)!;
    }

    // Completion works inside property reads and method calls.
    let tsExpr: ts.PropertyAccessExpression | null = null;
    if (expr instanceof PropertyRead || expr instanceof PropertyWrite) {
      // Non-safe navigation operations are trivial: `foo.bar` or `foo.bar()`
      tsExpr = findFirstMatchingNode(this.tcb, {
        filter: ts.isPropertyAccessExpression,
        withSpan: expr.nameSpan,
      });
    } else if (expr instanceof SafePropertyRead) {
      // Safe navigation operations are a little more complex, and involve a ternary. Completion
      // happens in the "true" case of the ternary.
      const ternaryExpr = findFirstMatchingNode(this.tcb, {
        filter: ts.isParenthesizedExpression,
        withSpan: expr.sourceSpan,
      });
      if (ternaryExpr === null || !ts.isConditionalExpression(ternaryExpr.expression)) {
        return null;
      }
      const whenTrue = ternaryExpr.expression.whenTrue;

      if (ts.isPropertyAccessExpression(whenTrue)) {
        tsExpr = whenTrue;
      } else if (
        ts.isCallExpression(whenTrue) &&
        ts.isPropertyAccessExpression(whenTrue.expression)
      ) {
        tsExpr = whenTrue.expression;
      }
    }

    if (tsExpr === null) {
      return null;
    }

    const res: TcbLocation = {
      tcbPath: this.tcbPath,
      isShimFile: this.tcbIsShim,
      positionInFile: tsExpr.name.getEnd(),
    };
    this.expressionCompletionCache.set(expr, res);
    return res;
  }

  getLiteralCompletionLocation(expr: LiteralPrimitive | TmplAstTextAttribute): TcbLocation | null {
    if (this.expressionCompletionCache.has(expr)) {
      return this.expressionCompletionCache.get(expr)!;
    }

    let tsExpr: ts.StringLiteral | ts.NumericLiteral | null = null;

    if (expr instanceof TmplAstTextAttribute) {
      const strNode = findFirstMatchingNode(this.tcb, {
        filter: ts.isParenthesizedExpression,
        withSpan: expr.sourceSpan,
      });
      if (strNode !== null && ts.isStringLiteral(strNode.expression)) {
        tsExpr = strNode.expression;
      }
    } else {
      tsExpr = findFirstMatchingNode(this.tcb, {
        filter: (n: ts.Node): n is ts.NumericLiteral | ts.StringLiteral =>
          ts.isStringLiteral(n) || ts.isNumericLiteral(n),
        withSpan: expr.sourceSpan,
      });
    }

    if (tsExpr === null) {
      return null;
    }

    let positionInShimFile = tsExpr.getEnd();
    if (ts.isStringLiteral(tsExpr)) {
      // In the shimFile, if `tsExpr` is a string, the position should be in the quotes.
      positionInShimFile -= 1;
    }
    const res: TcbLocation = {
      tcbPath: this.tcbPath,
      isShimFile: this.tcbIsShim,
      positionInFile: positionInShimFile,
    };
    this.expressionCompletionCache.set(expr, res);
    return res;
  }

  /**
   * Get global completions within the given template context - either a `TmplAstTemplate` embedded
   * view, or `null` for the root context.
   */
  private getTemplateContextCompletions(
    context: TmplAstTemplate | null,
  ): Map<string, ReferenceCompletion | VariableCompletion | LetDeclarationCompletion> | null {
    if (this.templateContextCache.has(context)) {
      return this.templateContextCache.get(context)!;
    }

    const templateContext = new Map<
      string,
      ReferenceCompletion | VariableCompletion | LetDeclarationCompletion
    >();

    // The bound template already has details about the references and variables in scope in the
    // `context` template - they just need to be converted to `Completion`s.
    for (const node of this.data.boundTarget.getEntitiesInScope(context)) {
      if (node instanceof TmplAstReference) {
        templateContext.set(node.name, {
          kind: CompletionKind.Reference,
          node,
        });
      } else if (node instanceof TmplAstLetDeclaration) {
        templateContext.set(node.name, {
          kind: CompletionKind.LetDeclaration,
          node,
        });
      } else {
        templateContext.set(node.name, {
          kind: CompletionKind.Variable,
          node,
        });
      }
    }

    this.templateContextCache.set(context, templateContext);
    return templateContext;
  }
}
