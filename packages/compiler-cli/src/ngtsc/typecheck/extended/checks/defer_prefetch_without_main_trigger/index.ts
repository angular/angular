/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TmplAstNode, TmplAstDeferredBlock} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

class DeferPrefetchWithoutMainTriggerCheck extends TemplateCheckWithVisitor<ErrorCode.DEFER_PREFETCH_WITHOUT_MAIN_TRIGGER> {
  override code = ErrorCode.DEFER_PREFETCH_WITHOUT_MAIN_TRIGGER as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.DEFER_PREFETCH_WITHOUT_MAIN_TRIGGER>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | any,
  ): NgTemplateDiagnostic<ErrorCode.DEFER_PREFETCH_WITHOUT_MAIN_TRIGGER>[] {
    // Prefer inspecting the strongly-typed DeferredBlock node which the parser creates for `@defer`
    if (!(node instanceof TmplAstDeferredBlock)) {
      return [];
    }

    // The DeferredBlock exposes `prefetchTriggers` and `triggers` maps. If there are any
    // prefetch triggers configured but no main triggers, emit the diagnostic.
    const prefetchKeys = Object.keys(node.prefetchTriggers || {});
    const triggerKeys = Object.keys(node.triggers || {});
    const hasPrefetch = prefetchKeys.length > 0;
    const hasMainTrigger = triggerKeys.length > 0;

    const hasConflict = hasPrefetch && !hasMainTrigger;

    if (!hasConflict) {
      return [];
    }

    const diagnostic = ctx.makeTemplateDiagnostic(
      node.sourceSpan,
      `@defer block configures prefetching but does not define a main trigger (` +
        '`on …` or `when …`). The block will render using the default `on idle` trigger, which may be unintended. Add `on …` or `when …` to control when rendering occurs.',
    );

    return [diagnostic];
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.DEFER_PREFETCH_WITHOUT_MAIN_TRIGGER,
  ExtendedTemplateDiagnosticName.DEFER_PREFETCH_WITHOUT_MAIN_TRIGGER
> = {
  code: ErrorCode.DEFER_PREFETCH_WITHOUT_MAIN_TRIGGER,
  name: ExtendedTemplateDiagnosticName.DEFER_PREFETCH_WITHOUT_MAIN_TRIGGER,
  create: () => new DeferPrefetchWithoutMainTriggerCheck(),
};
