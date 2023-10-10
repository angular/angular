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

import {CompilationJob, CompilationJobKind as Kind, type ComponentCompilationJob, type HostBindingCompilationJob, type ViewCompilationUnit} from './compilation';

import {phaseAlignPipeVariadicVarOffset} from './phases/align_pipe_variadic_var_offset';
import {phaseFindAnyCasts} from './phases/any_cast';
import {phaseApplyI18nExpressions} from './phases/apply_i18n_expressions';
import {phaseAssignI18nSlotDependencies} from './phases/assign_i18n_slot_dependencies';
import {phaseAttributeExtraction} from './phases/attribute_extraction';
import {phaseBindingSpecialization} from './phases/binding_specialization';
import {phaseChaining} from './phases/chaining';
import {phaseConditionals} from './phases/conditionals';
import {phaseConstCollection} from './phases/const_collection';
import {phaseEmptyElements} from './phases/empty_elements';
import {phaseExpandSafeReads} from './phases/expand_safe_reads';
import {phaseGenerateAdvance} from './phases/generate_advance';
import {phaseGenerateProjectionDef} from './phases/generate_projection_def';
import {phaseGenerateVariables} from './phases/generate_variables';
import {phaseConstTraitCollection} from './phases/has_const_trait_collection';
import {phaseHostStylePropertyParsing} from './phases/host_style_property_parsing';
import {phaseI18nConstCollection} from './phases/i18n_const_collection';
import {phaseI18nMessageExtraction} from './phases/i18n_message_extraction';
import {phaseI18nTextExtraction} from './phases/i18n_text_extraction';
import {phaseLocalRefs} from './phases/local_refs';
import {phaseNamespace} from './phases/namespace';
import {phaseNaming} from './phases/naming';
import {phaseMergeNextContext} from './phases/next_context_merging';
import {phaseNgContainer} from './phases/ng_container';
import {phaseNonbindable} from './phases/nonbindable';
import {phaseNullishCoalescing} from './phases/nullish_coalescing';
import {phaseOrdering} from './phases/ordering';
import {phaseParseExtractedStyles} from './phases/parse_extracted_styles';
import {phaseRemoveContentSelectors} from './phases/phase_remove_content_selectors';
import {phasePipeCreation} from './phases/pipe_creation';
import {phasePipeVariadic} from './phases/pipe_variadic';
import {phasePropagateI18nBlocks} from './phases/propagate_i18n_blocks';
import {phasePropagateI18nPlaceholders} from './phases/propagate_i18n_placeholders';
import {phasePureFunctionExtraction} from './phases/pure_function_extraction';
import {phasePureLiteralStructures} from './phases/pure_literal_structures';
import {phaseReify} from './phases/reify';
import {phaseRemoveEmptyBindings} from './phases/remove_empty_bindings';
import {phaseResolveContexts} from './phases/resolve_contexts';
import {phaseResolveDollarEvent} from './phases/resolve_dollar_event';
import {phaseResolveI18nPlaceholders} from './phases/resolve_i18n_placeholders';
import {phaseResolveNames} from './phases/resolve_names';
import {phaseResolveSanitizers} from './phases/resolve_sanitizers';
import {phaseSaveRestoreView} from './phases/save_restore_view';
import {phaseSlotAllocation} from './phases/slot_allocation';
import {phaseStyleBindingSpecialization} from './phases/style_binding_specialization';
import {phaseTemporaryVariables} from './phases/temporary_variables';
import {phaseVarCounting} from './phases/var_counting';
import {phaseVariableOptimization} from './phases/variable_optimization';

type Phase = {
  fn: (job: CompilationJob) => void; kind: Kind.Both | Kind.Host | Kind.Tmpl;
}|{
  fn: (job: ComponentCompilationJob) => void;
  kind: Kind.Tmpl;
}
|{
  fn: (job: HostBindingCompilationJob) => void;
  kind: Kind.Host;
};

const phases: Phase[] = [
  {kind: Kind.Tmpl, fn: phaseRemoveContentSelectors},
  {kind: Kind.Host, fn: phaseHostStylePropertyParsing},
  {kind: Kind.Tmpl, fn: phaseNamespace},
  {kind: Kind.Both, fn: phaseStyleBindingSpecialization},
  {kind: Kind.Both, fn: phaseBindingSpecialization},
  {kind: Kind.Tmpl, fn: phasePropagateI18nBlocks},
  {kind: Kind.Both, fn: phaseAttributeExtraction},
  {kind: Kind.Both, fn: phaseParseExtractedStyles},
  {kind: Kind.Tmpl, fn: phaseRemoveEmptyBindings},
  {kind: Kind.Tmpl, fn: phaseConditionals},
  {kind: Kind.Tmpl, fn: phasePipeCreation},
  {kind: Kind.Tmpl, fn: phaseI18nTextExtraction},
  {kind: Kind.Tmpl, fn: phaseApplyI18nExpressions},
  {kind: Kind.Tmpl, fn: phasePipeVariadic},
  {kind: Kind.Both, fn: phasePureLiteralStructures},
  {kind: Kind.Tmpl, fn: phaseGenerateProjectionDef},
  {kind: Kind.Tmpl, fn: phaseGenerateVariables},
  {kind: Kind.Tmpl, fn: phaseSaveRestoreView},
  {kind: Kind.Tmpl, fn: phaseFindAnyCasts},
  {kind: Kind.Both, fn: phaseResolveDollarEvent},
  {kind: Kind.Both, fn: phaseResolveNames},
  {kind: Kind.Both, fn: phaseResolveContexts},
  {kind: Kind.Tmpl, fn: phaseResolveSanitizers},  // TODO: run in both
  {kind: Kind.Tmpl, fn: phaseLocalRefs},
  {kind: Kind.Both, fn: phaseNullishCoalescing},
  {kind: Kind.Both, fn: phaseExpandSafeReads},
  {kind: Kind.Both, fn: phaseTemporaryVariables},
  {kind: Kind.Tmpl, fn: phaseSlotAllocation},
  {kind: Kind.Tmpl, fn: phaseResolveI18nPlaceholders},
  {kind: Kind.Tmpl, fn: phasePropagateI18nPlaceholders},
  {kind: Kind.Tmpl, fn: phaseI18nMessageExtraction},
  {kind: Kind.Tmpl, fn: phaseI18nConstCollection},
  {kind: Kind.Tmpl, fn: phaseConstTraitCollection},
  {kind: Kind.Both, fn: phaseConstCollection},
  {kind: Kind.Tmpl, fn: phaseAssignI18nSlotDependencies},
  {kind: Kind.Both, fn: phaseVarCounting},
  {kind: Kind.Tmpl, fn: phaseGenerateAdvance},
  {kind: Kind.Both, fn: phaseVariableOptimization},
  {kind: Kind.Both, fn: phaseNaming},
  {kind: Kind.Tmpl, fn: phaseMergeNextContext},
  {kind: Kind.Tmpl, fn: phaseNgContainer},
  {kind: Kind.Tmpl, fn: phaseEmptyElements},
  {kind: Kind.Tmpl, fn: phaseNonbindable},
  {kind: Kind.Both, fn: phasePureFunctionExtraction},
  {kind: Kind.Tmpl, fn: phaseAlignPipeVariadicVarOffset},
  {kind: Kind.Both, fn: phaseOrdering},
  {kind: Kind.Both, fn: phaseReify},
  {kind: Kind.Both, fn: phaseChaining},
];

/**
 * Run all transformation phases in the correct order against a compilation job. After this
 * processing, the compilation should be in a state where it can be emitted.
 */
export function transform(job: CompilationJob, kind: Kind): void {
  for (const phase of phases) {
    if (phase.kind === kind || phase.kind === Kind.Both) {
      // The type of `Phase` above ensures it is impossible to call a phase that doesn't support the
      // job kind.
      phase.fn(job as CompilationJob & ComponentCompilationJob & HostBindingCompilationJob);
    }
  }
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
  for (const unit of parent.job.units) {
    if (unit.parent !== parent.xref) {
      continue;
    }

    // Child views are emitted depth-first.
    emitChildViews(unit, pool);

    const viewFn = emitView(unit);
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
  if (job.root.fnName === null) {
    throw new Error(`AssertionError: host binding function is unnamed`);
  }

  const createStatements: o.Statement[] = [];
  for (const op of job.root.create) {
    if (op.kind !== ir.OpKind.Statement) {
      throw new Error(`AssertionError: expected all create ops to have been compiled, but got ${
          ir.OpKind[op.kind]}`);
    }
    createStatements.push(op.statement);
  }
  const updateStatements: o.Statement[] = [];
  for (const op of job.root.update) {
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
      /* type */ undefined, /* sourceSpan */ undefined, job.root.fnName);
}
