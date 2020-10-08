/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstReference, TmplAstTemplate} from '@angular/compiler';
import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';
import {CompletionKind, GlobalCompletion, ReferenceCompletion, VariableCompletion} from '../api';

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
}
