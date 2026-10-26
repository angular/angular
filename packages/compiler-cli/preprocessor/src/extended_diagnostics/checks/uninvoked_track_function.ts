/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  Call,
  ImplicitReceiver,
  PropertyRead,
  SafeCall,
  SafePropertyRead,
  ThisReceiver,
  TmplAstForLoopBlock,
  TmplAstNode,
} from '@angular/compiler';
import type {Diagnostic} from '../../diagnostic.js';
import type {TcbTargetInput} from '../../tcb.js';
import {
  formatExtendedError,
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
} from '../api.js';

/**
 * Ensures that track functions in `@for` loops are invoked.
 *
 * Mirrors `UninvokedTrackFunctionCheck` in
 * `ngtsc/typecheck/extended/checks/uninvoked_track_function/index.ts`.
 *
 * TODO: 0-parameter method declarations on non-component receivers (e.g. `track item.getId` where
 * `item: {getId(): string}`) share the exact same TypeScript type `() => string` as 0-parameter
 * callable value properties (such as Signal Forms `Field<T>`, where `track field` is valid by
 * identity). Distinguishing a method declaration from a callable property on an arbitrary item type
 * requires symbol flags (`ts.SymbolFlags.Method`) rather than type-level assignability alone.
 */
class UninvokedTrackFunctionCheck extends TemplateCheckWithVisitor<8115> {
  override code = 8115 as const;

  override visitNode(
    ctx: TemplateContext<8115>,
    component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
    if (!(node instanceof TmplAstForLoopBlock) || !node.trackBy) {
      return [];
    }

    const ast = node.trackBy.ast;
    if (ast instanceof Call || ast instanceof SafeCall) {
      return [];
    }

    if (!(ast instanceof PropertyRead) && !(ast instanceof SafePropertyRead)) {
      return [];
    }

    if (ctx.boundTarget.getExpressionTarget(ast) !== null) {
      return [];
    }

    const isComponentMethod =
      (ast.receiver instanceof ImplicitReceiver || ast.receiver instanceof ThisReceiver) &&
      (component.ownDeclaration.publicMethods.includes(ast.name) ||
        component.classMeta.publicMethods.includes(ast.name));

    const source = node.trackBy.source || '';
    const fullExpressionText = source.substring(ast.span.start, ast.span.end);
    const errorString = formatExtendedError(
      8115,
      `The track function in the @for block should be invoked: ${fullExpressionText}(/* arguments */)`,
    );

    ctx.addExtendedCheckCandidate?.({
      kind: isComponentMethod ? 'notCallable' : 'notTrackCallable',
      expr: ast,
      sourceSpan: node.sourceSpan,
      message: errorString,
    });

    return [];
  }
}

export const factory: TemplateCheckFactory<8115, 'uninvokedTrackFunction'> = {
  code: 8115,
  name: 'uninvokedTrackFunction',
  create: () => new UninvokedTrackFunctionCheck(),
};
