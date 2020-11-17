/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstReference, TmplAstTemplate} from '@angular/compiler';
import {MethodCall, PropertyRead, PropertyWrite, SafeMethodCall, SafePropertyRead} from '@angular/compiler/src/compiler';
import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';
import {CompletionKind, GlobalCompletion, ReferenceCompletion, ShimLocation, VariableCompletion} from '../api';

import {ExpressionIdentifier, findFirstMatchingNode} from './comments';
import {TemplateData} from './context';

/**
 * Powers autocompletion for a specific component.
 *
 * Internally caches autocompletion results, and must be discarded if the component template or
 * surrounding TS program have changed.
 */
export class CompletionEngine {
  /**
   * Cache of `GlobalCompletion`s for various levels of the template, including the root template
   * (`null`).
   */
  private globalCompletionCache = new Map<TmplAstTemplate|null, GlobalCompletion>();

  private expressionCompletionCache =
      new Map<PropertyRead|SafePropertyRead|MethodCall|SafeMethodCall, ShimLocation>();

  constructor(private tcb: ts.Node, private data: TemplateData, private shimPath: AbsoluteFsPath) {}

  /**
   * Get global completions within the given template context - either a `TmplAstTemplate` embedded
   * view, or `null` for the root template context.
   */
  getGlobalCompletions(context: TmplAstTemplate|null): GlobalCompletion|null {
    if (this.globalCompletionCache.has(context)) {
      return this.globalCompletionCache.get(context)!;
    }

    // Find the component completion expression within the TCB. This looks like: `ctx. /* ... */;`
    const globalRead = findFirstMatchingNode(this.tcb, {
      filter: ts.isPropertyAccessExpression,
      withExpressionIdentifier: ExpressionIdentifier.COMPONENT_COMPLETION
    });

    if (globalRead === null) {
      return null;
    }

    const completion: GlobalCompletion = {
      componentContext: {
        shimPath: this.shimPath,
        // `globalRead.name` is an empty `ts.Identifier`, so its start position immediately follows
        // the `.` in `ctx.`. TS autocompletion APIs can then be used to access completion results
        // for the component context.
        positionInShimFile: globalRead.name.getStart(),
      },
      templateContext: new Map<string, ReferenceCompletion|VariableCompletion>(),
    };

    // The bound template already has details about the references and variables in scope in the
    // `context` template - they just need to be converted to `Completion`s.
    for (const node of this.data.boundTarget.getEntitiesInTemplateScope(context)) {
      if (node instanceof TmplAstReference) {
        completion.templateContext.set(node.name, {
          kind: CompletionKind.Reference,
          node,
        });
      } else {
        completion.templateContext.set(node.name, {
          kind: CompletionKind.Variable,
          node,
        });
      }
    }

    this.globalCompletionCache.set(context, completion);
    return completion;
  }

  getExpressionCompletionLocation(expr: PropertyRead|PropertyWrite|MethodCall|
                                  SafeMethodCall): ShimLocation|null {
    if (this.expressionCompletionCache.has(expr)) {
      return this.expressionCompletionCache.get(expr)!;
    }

    // Completion works inside property reads and method calls.
    let tsExpr: ts.PropertyAccessExpression|null = null;
    if (expr instanceof PropertyRead || expr instanceof MethodCall ||
        expr instanceof PropertyWrite) {
      // Non-safe navigation operations are trivial: `foo.bar` or `foo.bar()`
      tsExpr = findFirstMatchingNode(this.tcb, {
        filter: ts.isPropertyAccessExpression,
        withSpan: expr.nameSpan,
      });
    } else if (expr instanceof SafePropertyRead || expr instanceof SafeMethodCall) {
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

      if (expr instanceof SafePropertyRead && ts.isPropertyAccessExpression(whenTrue)) {
        tsExpr = whenTrue;
      } else if (
          expr instanceof SafeMethodCall && ts.isCallExpression(whenTrue) &&
          ts.isPropertyAccessExpression(whenTrue.expression)) {
        tsExpr = whenTrue.expression;
      }
    }

    if (tsExpr === null) {
      return null;
    }

    const res: ShimLocation = {
      shimPath: this.shimPath,
      positionInShimFile: tsExpr.name.getEnd(),
    };
    this.expressionCompletionCache.set(expr, res);
    return res;
  }
}
