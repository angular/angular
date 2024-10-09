/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import type {ComponentCompilationJob, ViewCompilationUnit} from '../compilation';

/**
 * Some `defer` conditions can reference other elements in the template, using their local reference
 * names. However, the semantics are quite different from the normal local reference system: in
 * particular, we need to look at local reference names in enclosing views. This phase resolves
 * all such references to actual xrefs.
 */
export function resolveDeferTargetNames(job: ComponentCompilationJob): void {
  const scopes = new Map<ir.XrefId, Scope>();

  function getScopeForView(view: ViewCompilationUnit): Scope {
    if (scopes.has(view.xref)) {
      return scopes.get(view.xref)!;
    }

    const scope = new Scope();
    for (const op of view.create) {
      // add everything that can be referenced.
      if (!ir.isElementOrContainerOp(op) || op.localRefs === null) {
        continue;
      }
      if (!Array.isArray(op.localRefs)) {
        throw new Error(
          'LocalRefs were already processed, but were needed to resolve defer targets.',
        );
      }

      for (const ref of op.localRefs) {
        if (ref.target !== '') {
          continue;
        }
        scope.targets.set(ref.name, {xref: op.xref, slot: op.handle});
      }
    }

    scopes.set(view.xref, scope);
    return scope;
  }

  function resolveTrigger(
    deferOwnerView: ViewCompilationUnit,
    op: ir.DeferOnOp,
    placeholderView: ir.XrefId | null,
  ): void {
    switch (op.trigger.kind) {
      case ir.DeferTriggerKind.Idle:
      case ir.DeferTriggerKind.Never:
      case ir.DeferTriggerKind.Immediate:
      case ir.DeferTriggerKind.Timer:
        return;
      case ir.DeferTriggerKind.Hover:
      case ir.DeferTriggerKind.Interaction:
      case ir.DeferTriggerKind.Viewport:
        if (op.trigger.targetName === null) {
          // A `null` target name indicates we should default to the first element in the
          // placeholder block.
          if (placeholderView === null) {
            throw new Error('defer on trigger with no target name must have a placeholder block');
          }
          const placeholder = job.views.get(placeholderView);
          if (placeholder == undefined) {
            throw new Error('AssertionError: could not find placeholder view for defer on trigger');
          }
          for (const placeholderOp of placeholder.create) {
            if (
              ir.hasConsumesSlotTrait(placeholderOp) &&
              (ir.isElementOrContainerOp(placeholderOp) ||
                placeholderOp.kind === ir.OpKind.Projection)
            ) {
              op.trigger.targetXref = placeholderOp.xref;
              op.trigger.targetView = placeholderView;
              op.trigger.targetSlotViewSteps = -1;
              op.trigger.targetSlot = placeholderOp.handle;
              return;
            }
          }
          return;
        }
        let view: ViewCompilationUnit | null =
          placeholderView !== null ? job.views.get(placeholderView)! : deferOwnerView;
        let step = placeholderView !== null ? -1 : 0;

        while (view !== null) {
          const scope = getScopeForView(view);
          if (scope.targets.has(op.trigger.targetName)) {
            const {xref, slot} = scope.targets.get(op.trigger.targetName)!;

            op.trigger.targetXref = xref;
            op.trigger.targetView = view.xref;
            op.trigger.targetSlotViewSteps = step;
            op.trigger.targetSlot = slot;
            return;
          }

          view = view.parent !== null ? job.views.get(view.parent)! : null;
          step++;
        }
        break;
      default:
        throw new Error(`Trigger kind ${(op.trigger as any).kind} not handled`);
    }
  }

  // Find the defer ops, and assign the data about their targets.
  for (const unit of job.units) {
    const defers = new Map<ir.XrefId, ir.DeferOp>();
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.Defer:
          defers.set(op.xref, op);
          break;
        case ir.OpKind.DeferOn:
          const deferOp = defers.get(op.defer)!;
          resolveTrigger(
            unit,
            op,
            op.modifier === ir.DeferOpModifierKind.HYDRATE
              ? deferOp.mainView
              : deferOp.placeholderView,
          );
          break;
      }
    }
  }
}

class Scope {
  targets = new Map<string, {xref: ir.XrefId; slot: ir.SlotHandle}>();
}
