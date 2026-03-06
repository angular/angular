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
  TmplAstIdleDeferredTrigger,
  TmplAstImmediateDeferredTrigger,
  TmplAstInteractionDeferredTrigger,
  TmplAstTimerDeferredTrigger,
  TmplAstViewportDeferredTrigger,
  LiteralMap,
  LiteralPrimitive,
} from '@angular/compiler';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {
  formatExtendedError,
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
} from '../../api';

function areLiteralMapsEqual(a: LiteralMap | null, b: LiteralMap | null): boolean {
  // Treat null and empty LiteralMaps as equivalent
  const aIsEmpty = a === null || a.keys.length === 0;
  const bIsEmpty = b === null || b.keys.length === 0;

  if (aIsEmpty && bIsEmpty) return true;
  if (aIsEmpty || bIsEmpty) return false;
  if (a.keys.length !== b.keys.length) return false;

  const bMap = new Map<string, unknown>();

  for (let i = 0; i < b.keys.length; i++) {
    const bKey = b.keys[i];
    if (bKey.kind !== 'property') continue;
    const bVal = b.values[i];
    bMap.set(bKey.key, bVal instanceof LiteralPrimitive ? bVal.value : null);
  }

  for (let i = 0; i < a.keys.length; i++) {
    const aKey = a.keys[i];
    if (aKey.kind !== 'property') continue;
    const aVal = a.values[i];
    const aValue = aVal instanceof LiteralPrimitive ? aVal.value : null;

    if (!bMap.has(aKey.key)) return false;
    if (bMap.get(aKey.key) !== aValue) return false;
  }

  return true;
}

function getTimedTriggerValue(
  trigger: TmplAstTimerDeferredTrigger | TmplAstIdleDeferredTrigger,
): number | null {
  if (trigger instanceof TmplAstTimerDeferredTrigger) {
    return trigger.delay;
  }

  return trigger.timeout;
}

function formatTimedTrigger(
  trigger: TmplAstTimerDeferredTrigger | TmplAstIdleDeferredTrigger,
): string {
  if (trigger instanceof TmplAstTimerDeferredTrigger) {
    return `timer(${trigger.delay}ms)`;
  }

  return trigger.timeout === null ? 'idle' : `idle(${trigger.timeout}ms)`;
}

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

    // `prefetch` without an explicit main trigger defaults the main trigger to `idle`,
    if (mains.length === 0 && prefetches.length > 0) {
      const msg =
        `Define a main trigger when using 'prefetch' triggers. ` +
        `Without an explicit main trigger, @defer defaults to 'idle' and prefetch may have no effect.`;
      diags.push(
        ctx.makeTemplateDiagnostic(
          node.sourceSpan,
          formatExtendedError(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION, msg),
        ),
      );
    }

    // If there is exactly one main and at least one prefetch, compare them.
    if (mains.length === 1 && prefetches.length > 0) {
      const main = mains[0];

      for (const pre of prefetches) {
        // Delay-based pairs (timer/idle): warn when prefetch fires no sooner than main.

        const isTimerPair =
          main instanceof TmplAstTimerDeferredTrigger && pre instanceof TmplAstTimerDeferredTrigger;

        const isIdlePair =
          main instanceof TmplAstIdleDeferredTrigger && pre instanceof TmplAstIdleDeferredTrigger;

        if (isTimerPair || isIdlePair) {
          const mainVal = getTimedTriggerValue(main);
          const preVal = getTimedTriggerValue(pre);
          const sameUntimedIdle = mainVal == null && preVal == null;
          const comparableTimedPair = mainVal != null && preVal != null && preVal >= mainVal;

          if (!sameUntimedIdle && !comparableTimedPair) {
            continue;
          }

          const msg =
            `The Prefetch '${formatTimedTrigger(pre)}' is not scheduled before the main '${formatTimedTrigger(main)}',` +
            ` so it won't run prior to rendering. Lower the prefetch timing or remove it.`;

          diags.push(
            ctx.makeTemplateDiagnostic(
              pre.sourceSpan ?? node.sourceSpan,
              formatExtendedError(ErrorCode.DEFER_TRIGGER_MISCONFIGURATION, msg),
            ),
          );

          continue;
        }

        // Reference-based triggers (hover/interaction/viewport): warn if both
        // have identical configurations - same reference (or both null) and
        // same options (for viewport triggers).

        const isHoverTrigger =
          main instanceof TmplAstHoverDeferredTrigger && pre instanceof TmplAstHoverDeferredTrigger;

        const isInteractionTrigger =
          main instanceof TmplAstInteractionDeferredTrigger &&
          pre instanceof TmplAstInteractionDeferredTrigger;

        const isViewportTrigger =
          main instanceof TmplAstViewportDeferredTrigger &&
          pre instanceof TmplAstViewportDeferredTrigger;

        if (isHoverTrigger || isInteractionTrigger || isViewportTrigger) {
          const referencesMatch = main.reference === pre.reference;
          const optionsMatch = isViewportTrigger
            ? areLiteralMapsEqual(main.options, pre.options)
            : true;

          if (referencesMatch && optionsMatch) {
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
