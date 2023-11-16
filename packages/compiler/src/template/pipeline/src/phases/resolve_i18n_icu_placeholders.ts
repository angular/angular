/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '../../../../i18n/i18n_ast';
import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Resolves placeholders for element tags inside of an ICU.
 */
export function resolveI18nIcuPlaceholders(job: CompilationJob) {
  const contextOps = new Map<ir.XrefId, ir.I18nContextOp>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nContext:
          contextOps.set(op.xref, op);
          break;
      }
    }
  }

  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.IcuStart:
          if (op.context === null) {
            throw Error('Icu should have its i18n context set.');
          }
          const i18nContext = contextOps.get(op.context)!;
          for (const node of op.message.nodes) {
            node.visit(new ResolveIcuPlaceholdersVisitor(i18nContext.postprocessingParams));
          }
          break;
      }
    }
  }
}

/**
 * Visitor for i18n AST that resolves ICU params into the given map.
 */
class ResolveIcuPlaceholdersVisitor extends i18n.RecurseVisitor {
  constructor(private readonly params: Map<string, ir.I18nParamValue[]>) {
    super();
  }

  private visitContainerPlaceholder(placeholder: i18n.TagPlaceholder|i18n.BlockPlaceholder) {
    // Add the start and end source span for container placeholders. These need to be recorded for
    // elements inside ICUs. The slots for the nodes were recorded separately under the i18n
    // block's context as part of the `resolveI18nElementPlaceholders` phase.
    if (placeholder.startName && placeholder.startSourceSpan &&
        !this.params.has(placeholder.startName)) {
      this.params.set(placeholder.startName, [{
                        value: placeholder.startSourceSpan?.toString(),
                        subTemplateIndex: null,
                        flags: ir.I18nParamValueFlags.None
                      }]);
    }
    if (placeholder.closeName && placeholder.endSourceSpan &&
        !this.params.has(placeholder.closeName)) {
      this.params.set(placeholder.closeName, [{
                        value: placeholder.endSourceSpan?.toString(),
                        subTemplateIndex: null,
                        flags: ir.I18nParamValueFlags.None
                      }]);
    }
  }

  override visitTagPlaceholder(placeholder: i18n.TagPlaceholder) {
    super.visitTagPlaceholder(placeholder);
    this.visitContainerPlaceholder(placeholder);
  }

  override visitBlockPlaceholder(placeholder: i18n.BlockPlaceholder) {
    super.visitBlockPlaceholder(placeholder);
    this.visitContainerPlaceholder(placeholder);
  }
}
