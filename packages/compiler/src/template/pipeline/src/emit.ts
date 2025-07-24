/**
 *
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../src/output/output_ast';
import {ConstantPool} from '../../../constant_pool';
import * as ir from '../ir';

import {
  CompilationJob,
  CompilationJobKind as Kind,
  type ComponentCompilationJob,
  type HostBindingCompilationJob,
  type ViewCompilationUnit,
} from './compilation';

import {deleteAnyCasts} from './phases/any_cast';
import {applyI18nExpressions} from './phases/apply_i18n_expressions';
import {assignI18nSlotDependencies} from './phases/assign_i18n_slot_dependencies';
import {attachSourceLocations} from './phases/attach_source_locations';
import {extractAttributes} from './phases/attribute_extraction';
import {specializeBindings} from './phases/binding_specialization';
import {chain} from './phases/chaining';
import {collapseSingletonInterpolations} from './phases/collapse_singleton_interpolations';
import {generateConditionalExpressions} from './phases/conditionals';
import {collectElementConsts} from './phases/const_collection';
import {convertAnimations} from './phases/convert_animations';
import {convertI18nBindings} from './phases/convert_i18n_bindings';
import {createI18nContexts} from './phases/create_i18n_contexts';
import {deduplicateTextBindings} from './phases/deduplicate_text_bindings';
import {configureDeferInstructions} from './phases/defer_configs';
import {resolveDeferTargetNames} from './phases/defer_resolve_targets';
import {collapseEmptyInstructions} from './phases/empty_elements';
import {expandSafeReads} from './phases/expand_safe_reads';
import {extractI18nMessages} from './phases/extract_i18n_messages';
import {generateAdvance} from './phases/generate_advance';
import {generateLocalLetReferences} from './phases/generate_local_let_references';
import {generateProjectionDefs} from './phases/generate_projection_def';
import {generateVariables} from './phases/generate_variables';
import {collectConstExpressions} from './phases/has_const_expression_collection';
import {parseHostStyleProperties} from './phases/host_style_property_parsing';
import {collectI18nConsts} from './phases/i18n_const_collection';
import {convertI18nText} from './phases/i18n_text_extraction';
import {liftLocalRefs} from './phases/local_refs';
import {emitNamespaceChanges} from './phases/namespace';
import {nameFunctionsAndVariables} from './phases/naming';
import {mergeNextContextExpressions} from './phases/next_context_merging';
import {generateNgContainerOps} from './phases/ng_container';
import {disableBindings} from './phases/nonbindable';
import {orderOps} from './phases/ordering';
import {parseExtractedStyles} from './phases/parse_extracted_styles';
import {removeContentSelectors} from './phases/phase_remove_content_selectors';
import {createPipes} from './phases/pipe_creation';
import {createVariadicPipes} from './phases/pipe_variadic';
import {propagateI18nBlocks} from './phases/propagate_i18n_blocks';
import {extractPureFunctions} from './phases/pure_function_extraction';
import {generatePureLiteralStructures} from './phases/pure_literal_structures';
import {reify} from './phases/reify';
import {removeEmptyBindings} from './phases/remove_empty_bindings';
import {removeI18nContexts} from './phases/remove_i18n_contexts';
import {removeIllegalLetReferences} from './phases/remove_illegal_let_references';
import {removeUnusedI18nAttributesOps} from './phases/remove_unused_i18n_attrs';
import {resolveContexts} from './phases/resolve_contexts';
import {resolveDeferDepsFns} from './phases/resolve_defer_deps_fns';
import {resolveDollarEvent} from './phases/resolve_dollar_event';
import {resolveI18nElementPlaceholders} from './phases/resolve_i18n_element_placeholders';
import {resolveI18nExpressionPlaceholders} from './phases/resolve_i18n_expression_placeholders';
import {resolveNames} from './phases/resolve_names';
import {resolveSanitizers} from './phases/resolve_sanitizers';
import {saveAndRestoreView} from './phases/save_restore_view';
import {allocateSlots} from './phases/slot_allocation';
import {optimizeStoreLet} from './phases/store_let_optimization';
import {stripNonrequiredParentheses} from './phases/strip_nonrequired_parentheses';
import {specializeStyleBindings} from './phases/style_binding_specialization';
import {generateTemporaryVariables} from './phases/temporary_variables';
import {optimizeTrackFns} from './phases/track_fn_optimization';
import {generateTrackVariables} from './phases/track_variables';
import {transformTwoWayBindingSet} from './phases/transform_two_way_binding_set';
import {countVariables} from './phases/var_counting';
import {optimizeVariables} from './phases/variable_optimization';
import {wrapI18nIcus} from './phases/wrap_icus';

type Phase =
  | {
      fn: (job: CompilationJob) => void;
      kind: Kind.Both | Kind.Host | Kind.Tmpl;
    }
  | {
      fn: (job: ComponentCompilationJob) => void;
      kind: Kind.Tmpl;
    }
  | {
      fn: (job: HostBindingCompilationJob) => void;
      kind: Kind.Host;
    };

const phases: Phase[] = [
  {kind: Kind.Tmpl, fn: removeContentSelectors},
  {kind: Kind.Host, fn: parseHostStyleProperties},
  {kind: Kind.Tmpl, fn: emitNamespaceChanges},
  {kind: Kind.Tmpl, fn: propagateI18nBlocks},
  {kind: Kind.Tmpl, fn: wrapI18nIcus},
  {kind: Kind.Both, fn: deduplicateTextBindings},
  {kind: Kind.Both, fn: specializeStyleBindings},
  {kind: Kind.Both, fn: specializeBindings},
  {kind: Kind.Both, fn: convertAnimations},
  {kind: Kind.Both, fn: extractAttributes},
  {kind: Kind.Tmpl, fn: createI18nContexts},
  {kind: Kind.Both, fn: parseExtractedStyles},
  {kind: Kind.Tmpl, fn: removeEmptyBindings},
  {kind: Kind.Both, fn: collapseSingletonInterpolations},
  {kind: Kind.Both, fn: orderOps},
  {kind: Kind.Tmpl, fn: generateConditionalExpressions},
  {kind: Kind.Tmpl, fn: createPipes},
  {kind: Kind.Tmpl, fn: configureDeferInstructions},
  {kind: Kind.Tmpl, fn: createVariadicPipes},
  {kind: Kind.Both, fn: generatePureLiteralStructures},
  {kind: Kind.Tmpl, fn: generateProjectionDefs},
  {kind: Kind.Tmpl, fn: generateLocalLetReferences},
  {kind: Kind.Tmpl, fn: generateVariables},
  {kind: Kind.Tmpl, fn: saveAndRestoreView},
  {kind: Kind.Both, fn: deleteAnyCasts},
  {kind: Kind.Both, fn: resolveDollarEvent},
  {kind: Kind.Tmpl, fn: generateTrackVariables},
  {kind: Kind.Tmpl, fn: removeIllegalLetReferences},
  {kind: Kind.Both, fn: resolveNames},
  {kind: Kind.Tmpl, fn: resolveDeferTargetNames},
  {kind: Kind.Tmpl, fn: transformTwoWayBindingSet},
  {kind: Kind.Tmpl, fn: optimizeTrackFns},
  {kind: Kind.Both, fn: resolveContexts},
  {kind: Kind.Both, fn: resolveSanitizers},
  {kind: Kind.Tmpl, fn: liftLocalRefs},
  {kind: Kind.Both, fn: expandSafeReads},
  {kind: Kind.Both, fn: stripNonrequiredParentheses},
  {kind: Kind.Both, fn: generateTemporaryVariables},
  {kind: Kind.Both, fn: optimizeVariables},
  {kind: Kind.Both, fn: optimizeStoreLet},
  {kind: Kind.Tmpl, fn: convertI18nText},
  {kind: Kind.Tmpl, fn: convertI18nBindings},
  {kind: Kind.Tmpl, fn: removeUnusedI18nAttributesOps},
  {kind: Kind.Tmpl, fn: assignI18nSlotDependencies},
  {kind: Kind.Tmpl, fn: applyI18nExpressions},
  {kind: Kind.Tmpl, fn: allocateSlots},
  {kind: Kind.Tmpl, fn: resolveI18nElementPlaceholders},
  {kind: Kind.Tmpl, fn: resolveI18nExpressionPlaceholders},
  {kind: Kind.Tmpl, fn: extractI18nMessages},
  {kind: Kind.Tmpl, fn: collectI18nConsts},
  {kind: Kind.Tmpl, fn: collectConstExpressions},
  {kind: Kind.Both, fn: collectElementConsts},
  {kind: Kind.Tmpl, fn: removeI18nContexts},
  {kind: Kind.Both, fn: countVariables},
  {kind: Kind.Tmpl, fn: generateAdvance},
  {kind: Kind.Both, fn: nameFunctionsAndVariables},
  {kind: Kind.Tmpl, fn: resolveDeferDepsFns},
  {kind: Kind.Tmpl, fn: mergeNextContextExpressions},
  {kind: Kind.Tmpl, fn: generateNgContainerOps},
  {kind: Kind.Tmpl, fn: collapseEmptyInstructions},
  {kind: Kind.Tmpl, fn: attachSourceLocations},
  {kind: Kind.Tmpl, fn: disableBindings},
  {kind: Kind.Both, fn: extractPureFunctions},
  {kind: Kind.Both, fn: reify},
  {kind: Kind.Both, fn: chain},
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
      throw new Error(
        `AssertionError: expected all create ops to have been compiled, but got ${
          ir.OpKind[op.kind]
        }`,
      );
    }
    createStatements.push(op.statement);
  }
  const updateStatements: o.Statement[] = [];
  for (const op of view.update) {
    if (op.kind !== ir.OpKind.Statement) {
      throw new Error(
        `AssertionError: expected all update ops to have been compiled, but got ${
          ir.OpKind[op.kind]
        }`,
      );
    }
    updateStatements.push(op.statement);
  }

  const createCond = maybeGenerateRfBlock(1, createStatements);
  const updateCond = maybeGenerateRfBlock(2, updateStatements);
  return o.fn(
    [new o.FnParam('rf'), new o.FnParam('ctx')],
    [...createCond, ...updateCond],
    /* type */ undefined,
    /* sourceSpan */ undefined,
    view.fnName,
  );
}

function maybeGenerateRfBlock(flag: number, statements: o.Statement[]): o.Statement[] {
  if (statements.length === 0) {
    return [];
  }

  return [
    o.ifStmt(
      new o.BinaryOperatorExpr(o.BinaryOperator.BitwiseAnd, o.variable('rf'), o.literal(flag)),
      statements,
    ),
  ];
}

export function emitHostBindingFunction(job: HostBindingCompilationJob): o.FunctionExpr | null {
  if (job.root.fnName === null) {
    throw new Error(`AssertionError: host binding function is unnamed`);
  }

  const createStatements: o.Statement[] = [];
  for (const op of job.root.create) {
    if (op.kind !== ir.OpKind.Statement) {
      throw new Error(
        `AssertionError: expected all create ops to have been compiled, but got ${
          ir.OpKind[op.kind]
        }`,
      );
    }
    createStatements.push(op.statement);
  }
  const updateStatements: o.Statement[] = [];
  for (const op of job.root.update) {
    if (op.kind !== ir.OpKind.Statement) {
      throw new Error(
        `AssertionError: expected all update ops to have been compiled, but got ${
          ir.OpKind[op.kind]
        }`,
      );
    }
    updateStatements.push(op.statement);
  }

  if (createStatements.length === 0 && updateStatements.length === 0) {
    return null;
  }

  const createCond = maybeGenerateRfBlock(1, createStatements);
  const updateCond = maybeGenerateRfBlock(2, updateStatements);
  return o.fn(
    [new o.FnParam('rf'), new o.FnParam('ctx')],
    [...createCond, ...updateCond],
    /* type */ undefined,
    /* sourceSpan */ undefined,
    job.root.fnName,
  );
}
