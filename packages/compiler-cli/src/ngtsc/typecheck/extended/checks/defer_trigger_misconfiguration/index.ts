/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {
  TmplAstDeferredBlock,
  TmplAstDeferredTrigger,
  TmplAstHoverDeferredTrigger,
  TmplAstImmediateDeferredTrigger,
  TmplAstInteractionDeferredTrigger,
  TmplAstTimerDeferredTrigger,
  TmplAstViewportDeferredTrigger,
} from '@angular/compiler';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {
  formatExtendedError,
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
} from '../../api';

/**
 * This check implements warnings for unreachable or redundant @defer triggers.
 * Emits ErrorCode.DEFER_TRIGGER_MISCONFIGURATION with messages matching the project's
 * expected text.
 */
class DeferTriggerMisconfiguration extends TemplateCheckWithVisitor<ErrorCode.DEFER_TRIGGER_MISCONFIGURATION> {
  override code = ErrorCode.DEFER_TRIGGER_MISCONFIGURATION as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.DEFER_TRIGGER_MISCONFIGURATION>,
    component: ts.ClassDeclaration,
    node: any,
  ): NgTemplateDiagnostic<ErrorCode.DEFER_TRIGGER_MISCONFIGURATION>[] {
    if (!(node instanceof TmplAstDeferredBlock)) return [];

    const mainKeys = Object.keys(node.triggers) as Array<keyof typeof node.triggers>;
    const prefetchKeys = Object.keys(node.prefetchTriggers) as Array<
      keyof typeof node.prefetchTriggers
    >;

    // Gather actual trigger objects for mains and prefetch (only defined ones)
    const mains = mainKeys
      .map((k) => node.triggers[k])
      .filter((t): t is TmplAstDeferredTrigger => t !== undefined && t !== null);

    const prefetches = prefetchKeys
      .map((k) => node.prefetchTriggers[k])
      .filter((t): t is TmplAstDeferredTrigger => t !== undefined && t !== null);

    const diags: NgTemplateDiagnostic<ErrorCode.DEFER_TRIGGER_MISCONFIGURATION>[] = [];

    //  'on immediate' dominance
    const hasImmediateMain = mains.some((t) => t instanceof TmplAstImmediateDeferredTrigger);
    if (hasImmediateMain) {
      if (mains.length > 1) {
        const msg = `The 'immediate' trigger makes additional triggers redundant.`;
        diags.push(
          ctx.makeTemplateDiagnostic(
            node.sourceSpan,
            formatExtendedError(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION, msg),
          ),
        );
      }
      if (prefetches.length > 0) {
        const msg = `Prefetch triggers have no effect because 'immediate' executes earlier.`;
        diags.push(
          ctx.makeTemplateDiagnostic(
            node.sourceSpan,
            formatExtendedError(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION, msg),
          ),
        );
      }
    }

    // If there is exactly one main and at least one prefetch, compare them.
    if (mains.length === 1 && prefetches.length > 0) {
      const main = mains[0];

      for (const pre of prefetches) {
        // Timer vs Timer: warn when prefetch delay >= main delay
        const isTimerTriggger =
          main instanceof TmplAstTimerDeferredTrigger && pre instanceof TmplAstTimerDeferredTrigger;
        if (isTimerTriggger) {
          const mainDelay = main.delay;
          const preDelay = pre.delay;
          if (preDelay >= mainDelay) {
            const msg = `The Prefetch 'timer(${preDelay}ms)' is not scheduled before the main 'timer(${mainDelay}ms)', so it won’t run prior to rendering. Lower the prefetch delay or remove it.`;
            diags.push(
              ctx.makeTemplateDiagnostic(
                pre.sourceSpan ?? node.sourceSpan,
                formatExtendedError(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION, msg),
              ),
            );
          }
        }

        // Reference-based triggers (hover/interaction/viewport): only warn if both
        // have a reference and the references are identical. If references differ
        // (or one is missing), the prefetch targets a different element and
        // provides potential value.

        const isHoverTrigger =
          main instanceof TmplAstHoverDeferredTrigger && pre instanceof TmplAstHoverDeferredTrigger;

        const isInteractionTrigger =
          main instanceof TmplAstInteractionDeferredTrigger &&
          pre instanceof TmplAstInteractionDeferredTrigger;

        const isViewportTrigger =
          main instanceof TmplAstViewportDeferredTrigger &&
          pre instanceof TmplAstViewportDeferredTrigger;

        if (isHoverTrigger || isInteractionTrigger || isViewportTrigger) {
          const mainRef = main.reference;
          const preRef = pre.reference;
          if (mainRef && preRef && mainRef === preRef) {
            const kindName = main.constructor.name.replace('DeferredTrigger', '').toLowerCase();
            const msg = `Prefetch '${kindName}' matches the main trigger and provides no benefit. Remove the prefetch modifier.`;
            diags.push(
              ctx.makeTemplateDiagnostic(
                pre.sourceSpan ?? node.sourceSpan,
                formatExtendedError(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION, msg),
              ),
            );
          }
          // otherwise, different references or missing reference => no warning
          continue;
        }

        // Syntactic identical: same class for immediate/idle/never etc. (timers handled above)
        if (
          main.constructor === pre.constructor &&
          !(main instanceof TmplAstTimerDeferredTrigger)
        ) {
          const kind =
            main instanceof TmplAstImmediateDeferredTrigger
              ? 'immediate'
              : main.constructor.name.replace('DeferredTrigger', '').toLowerCase();
          const msg = `Prefetch '${kind}' matches the main trigger and provides no benefit. Remove the prefetch modifier.`;
          diags.push(
            ctx.makeTemplateDiagnostic(
              pre.sourceSpan ?? node.sourceSpan,
              formatExtendedError(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION, msg),
            ),
          );
        }
      }
    }

    return diags;
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.DEFER_TRIGGER_MISCONFIGURATION,
  ExtendedTemplateDiagnosticName.DEFER_TRIGGER_MISCONFIGURATION
> = {
  code: ErrorCode.DEFER_TRIGGER_MISCONFIGURATION,
  name: ExtendedTemplateDiagnosticName.DEFER_TRIGGER_MISCONFIGURATION,
  create: () => new DeferTriggerMisconfiguration(),
};
