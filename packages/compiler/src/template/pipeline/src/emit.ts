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

import type {ComponentCompilationJob, HostBindingCompilationJob, ViewCompilationUnit} from './compilation';

import {phaseAlignPipeVariadicVarOffset} from './phases/align_pipe_variadic_var_offset';
import {phaseFindAnyCasts} from './phases/any_cast';
import {phaseAttributeExtraction} from './phases/attribute_extraction';
import {phaseBindingSpecialization} from './phases/binding_specialization';
import {phaseChaining} from './phases/chaining';
import {phaseConstCollection} from './phases/const_collection';
import {phaseEmptyElements} from './phases/empty_elements';
import {phaseExpandSafeReads} from './phases/expand_safe_reads';
import {phaseGenerateAdvance} from './phases/generate_advance';
import {phaseGenerateVariables} from './phases/generate_variables';
import {phaseHostStylePropertyParsing} from './phases/host_style_property_parsing';
import {phaseLocalRefs} from './phases/local_refs';
import {phaseNamespace} from './phases/namespace';
import {phaseNaming} from './phases/naming';
import {phaseMergeNextContext} from './phases/next_context_merging';
import {phaseNgContainer} from './phases/ng_container';
import {phaseNoListenersOnTemplates} from './phases/no_listeners_on_templates';
import {phaseNonbindable} from './phases/nonbindable';
import {phaseNullishCoalescing} from './phases/nullish_coalescing';
import {phasePipeCreation} from './phases/pipe_creation';
import {phasePipeVariadic} from './phases/pipe_variadic';
import {phasePropertyOrdering} from './phases/property_ordering';
import {phasePureFunctionExtraction} from './phases/pure_function_extraction';
import {phasePureLiteralStructures} from './phases/pure_literal_structures';
import {phaseReify} from './phases/reify';
import {phaseRemoveEmptyBindings} from './phases/remove_empty_bindings';
import {phaseResolveContexts} from './phases/resolve_contexts';
import {phaseResolveDollarEvent} from './phases/resolve_dollar_event';
import {phaseResolveNames} from './phases/resolve_names';
import {phaseResolveSanitizers} from './phases/resolve_sanitizers';
import {phaseSaveRestoreView} from './phases/save_restore_view';
import {phaseSlotAllocation} from './phases/slot_allocation';
import {phaseStyleBindingSpecialization} from './phases/style_binding_specialization';
import {phaseTemporaryVariables} from './phases/temporary_variables';
import {phaseVarCounting} from './phases/var_counting';
import {phaseVariableOptimization} from './phases/variable_optimization';

/**
 * Run all transformation phases in the correct order against a `ComponentCompilation`. After this
 * processing, the compilation should be in a state where it can be emitted.
 */
export function transformTemplate(job: ComponentCompilationJob): void {
  phaseNamespace(job);
  phaseStyleBindingSpecialization(job);
  phaseBindingSpecialization(job);
  phaseAttributeExtraction(job);
  phaseRemoveEmptyBindings(job);
  phaseNoListenersOnTemplates(job);
  phasePipeCreation(job);
  phasePipeVariadic(job);
  phasePureLiteralStructures(job);
  phaseGenerateVariables(job);
  phaseSaveRestoreView(job);
  phaseFindAnyCasts(job);
  phaseResolveDollarEvent(job);
  phaseResolveNames(job);
  phaseResolveContexts(job);
  phaseResolveSanitizers(job);
  phaseLocalRefs(job);
  phaseConstCollection(job);
  phaseNullishCoalescing(job);
  phaseExpandSafeReads(job);
  phaseTemporaryVariables(job);
  phaseSlotAllocation(job);
  phaseVarCounting(job);
  phaseGenerateAdvance(job);
  phaseVariableOptimization(job);
  phaseNaming(job);
  phaseMergeNextContext(job);
  phaseNgContainer(job);
  phaseEmptyElements(job);
  phaseNonbindable(job);
  phasePureFunctionExtraction(job);
  phaseAlignPipeVariadicVarOffset(job);
  phasePropertyOrdering(job);
  phaseReify(job);
  phaseChaining(job);
}

/**
 * Run all transformation phases in the correct order against a `HostBindingCompilationJob`. After
 * this processing, the compilation should be in a state where it can be emitted.
 */
export function transformHostBinding(job: HostBindingCompilationJob): void {
  phaseHostStylePropertyParsing(job);
  phaseStyleBindingSpecialization(job);
  phaseBindingSpecialization(job);
  phasePureLiteralStructures(job);
  phaseNullishCoalescing(job);
  phaseExpandSafeReads(job);
  phaseTemporaryVariables(job);
  phaseVarCounting(job);
  phaseVariableOptimization(job);
  phaseResolveNames(job);
  phaseResolveContexts(job);
  // TODO: Figure out how to make this work for host bindings.
  // phaseResolveSanitizers(job);
  phaseNaming(job);
  phasePureFunctionExtraction(job);
  phasePropertyOrdering(job);
  phaseReify(job);
  phaseChaining(job);
}

/**
 * Compile all views in the given `ComponentCompilation` into the final template function, which may
 * reference constants defined in a `ConstantPool`.
 */
export function emitTemplateFn(tpl: ComponentCompilationJob, pool: ConstantPool): o.FunctionExpr {
  const rootFn = emitView(tpl.root);
  emitChildViews(tpl.root, pool);
  return rootFn;
}

function emitChildViews(parent: ViewCompilationUnit, pool: ConstantPool): void {
  for (const view of parent.job.views.values()) {
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
function emitView(view: ViewCompilationUnit): o.FunctionExpr {
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

export function emitHostBindingFunction(job: HostBindingCompilationJob): o.FunctionExpr|null {
  if (job.fnName === null) {
    throw new Error(`AssertionError: host binding function is unnamed`);
  }

  const createStatements: o.Statement[] = [];
  for (const op of job.create) {
    if (op.kind !== ir.OpKind.Statement) {
      throw new Error(`AssertionError: expected all create ops to have been compiled, but got ${
          ir.OpKind[op.kind]}`);
    }
    createStatements.push(op.statement);
  }
  const updateStatements: o.Statement[] = [];
  for (const op of job.update) {
    if (op.kind !== ir.OpKind.Statement) {
      throw new Error(`AssertionError: expected all update ops to have been compiled, but got ${
          ir.OpKind[op.kind]}`);
    }
    updateStatements.push(op.statement);
  }

  if (createStatements.length === 0 && updateStatements.length === 0) {
    return null;
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
      /* type */ undefined, /* sourceSpan */ undefined, job.fnName);
}
