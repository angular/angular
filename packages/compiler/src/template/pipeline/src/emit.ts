/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../src/output/output_ast';
import {ConstantPool} from '../../../constant_pool';
import * as ir from '../ir';

import type {ComponentCompilation, ViewCompilation} from './compilation';

import {phaseAlignPipeVariadicVarOffset} from './phases/align_pipe_variadic_var_offset';
import {phaseAttributeExtraction} from './phases/attribute_extraction';
import {phaseChaining} from './phases/chaining';
import {phaseConstCollection} from './phases/const_collection';
import {phaseEmptyElements} from './phases/empty_elements';
import {phaseGenerateAdvance} from './phases/generate_advance';
import {phaseNullishCoalescing} from './phases/nullish_coalescing';
import {phaseGenerateVariables} from './phases/generate_variables';
import {phaseLocalRefs} from './phases/local_refs';
import {phaseNaming} from './phases/naming';
import {phaseMergeNextContext} from './phases/next_context_merging';
import {phaseNgContainer} from './phases/ng_container';
import {phasePipeCreation} from './phases/pipe_creation';
import {phasePipeVariadic} from './phases/pipe_variadic';
import {phasePureFunctionExtraction} from './phases/pure_function_extraction';
import {phasePureLiteralStructures} from './phases/pure_literal_structures';
import {phaseReify} from './phases/reify';
import {phaseResolveContexts} from './phases/resolve_contexts';
import {phaseResolveNames} from './phases/resolve_names';
import {phaseSaveRestoreView} from './phases/save_restore_view';
import {phaseSlotAllocation} from './phases/slot_allocation';
import {phaseVarCounting} from './phases/var_counting';
import {phaseVariableOptimization} from './phases/variable_optimization';
import {phaseExpandSafeReads} from './phases/expand_safe_reads';
import {phaseTemporaryVariables} from './phases/temporary_variables';

/**
 * Run all transformation phases in the correct order against a `ComponentCompilation`. After this
 * processing, the compilation should be in a state where it can be emitted via `emitTemplateFn`.s
 */
export function transformTemplate(cpl: ComponentCompilation): void {
  phaseAttributeExtraction(cpl, true);
  phasePipeCreation(cpl);
  phasePipeVariadic(cpl);
  phasePureLiteralStructures(cpl);
  phaseGenerateVariables(cpl);
  phaseSaveRestoreView(cpl);
  phaseResolveNames(cpl);
  phaseResolveContexts(cpl);
  phaseLocalRefs(cpl);
  phaseConstCollection(cpl);
  phaseNullishCoalescing(cpl);
  phaseExpandSafeReads(cpl, true);
  phaseTemporaryVariables(cpl);
  phaseSlotAllocation(cpl);
  phaseVarCounting(cpl);
  phaseGenerateAdvance(cpl);
  phaseNaming(cpl);
  phaseVariableOptimization(cpl, {conservative: true});
  phaseMergeNextContext(cpl);
  phaseNgContainer(cpl);
  phaseEmptyElements(cpl);
  phasePureFunctionExtraction(cpl);
  phaseAlignPipeVariadicVarOffset(cpl);
  phaseReify(cpl);
  phaseChaining(cpl);
}

/**
 * Compile all views in the given `ComponentCompilation` into the final template function, which may
 * reference constants defined in a `ConstantPool`.
 */
export function emitTemplateFn(tpl: ComponentCompilation, pool: ConstantPool): o.FunctionExpr {
  const rootFn = emitView(tpl.root);
  emitChildViews(tpl.root, pool);
  return rootFn;
}

function emitChildViews(parent: ViewCompilation, pool: ConstantPool): void {
  for (const view of parent.tpl.views.values()) {
    if (view.parent !== parent.xref) {
      continue;
    }

    // Child views are emitted depth-first.
    emitChildViews(view, pool);

    const viewFn = emitView(view);
    pool.statements.push(viewFn.toDeclStmt(viewFn.name!));
  }
}

/**
 * Emit a template function for an individual `ViewCompilation` (which may be either the root view
 * or an embedded view).
 */
function emitView(view: ViewCompilation): o.FunctionExpr {
  if (view.fnName === null) {
    throw new Error(`AssertionError: view ${view.xref} is unnamed`);
  }

  const createStatements: o.Statement[] = [];
  for (const op of view.create) {
    if (op.kind !== ir.OpKind.Statement) {
      throw new Error(`AssertionError: expected all create ops to have been compiled, but got ${
          ir.OpKind[op.kind]}`);
    }
    createStatements.push(op.statement);
  }
  const updateStatements: o.Statement[] = [];
  for (const op of view.update) {
    if (op.kind !== ir.OpKind.Statement) {
      throw new Error(`AssertionError: expected all update ops to have been compiled, but got ${
          ir.OpKind[op.kind]}`);
    }
    updateStatements.push(op.statement);
  }

  const createCond = maybeGenerateRfBlock(1, createStatements);
  const updateCond = maybeGenerateRfBlock(2, updateStatements);
  return o.fn(
      [
        new o.FnParam('rf'),
        new o.FnParam('ctx'),
      ],
      [
        ...createCond,
        ...updateCond,
      ],
      /* type */ undefined, /* sourceSpan */ undefined, view.fnName);
}

function maybeGenerateRfBlock(flag: number, statements: o.Statement[]): o.Statement[] {
  if (statements.length === 0) {
    return [];
  }

  return [
    o.ifStmt(
        new o.BinaryOperatorExpr(o.BinaryOperator.BitwiseAnd, o.variable('rf'), o.literal(flag)),
        statements),
  ];
}
