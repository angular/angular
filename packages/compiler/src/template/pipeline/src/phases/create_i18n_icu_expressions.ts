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
 * Replace the ICU update ops with i18n expression ops.
 */
export function createI18nIcuExpressions(job: CompilationJob) {
  const icus = new Map<ir.XrefId, ir.IcuOp>();
  const i18nContexts = new Map<ir.XrefId, ir.I18nContextOp>();
  const i18nBlocks = new Map<ir.XrefId, ir.I18nStartOp>();

  // Collect maps of ops that need to be referenced to create the I18nExpressionOps.
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.Icu:
          icus.set(op.xref, op);
          break;
        case ir.OpKind.I18nContext:
          i18nContexts.set(op.xref, op);
          break;
        case ir.OpKind.I18nStart:
          i18nBlocks.set(op.xref, op);
          break;
      }
    }

    // Replace each IcuUpdateOp with an I18nExpressionOp.
    for (const op of unit.update) {
      switch (op.kind) {
        case ir.OpKind.IcuUpdate:
          const icuOp = icus.get(op.xref);
          if (icuOp?.icu.expressionPlaceholder === undefined) {
            throw Error('ICU should have an i18n placeholder');
          }
          if (icuOp.context === null) {
            throw Error('ICU should have its i18n context set');
          }
          const i18nContext = i18nContexts.get(icuOp.context)!;
          const i18nBlock = i18nBlocks.get(i18nContext.i18nBlock)!;
          const expressionOp = ir.createI18nExpressionOp(
              i18nContext.xref, i18nBlock.xref, i18nBlock.handle,
              new ir.LexicalReadExpr(icuOp.icu.expression), icuOp.icu.expressionPlaceholder,
              // ICU-based i18n Expressions are resolved during post-processing.
              ir.I18nParamResolutionTime.Postproccessing, null!);
          ir.OpList.replace<ir.UpdateOp>(op, expressionOp);
          icuOp.icu.visit(new AddIcuExpressionVisitor(
              i18nContext.xref, i18nBlock.xref, i18nBlock.handle, expressionOp));
          break;
      }
    }
  }
}

/**
 * Visitor for i18n AST that adds i18nExpression ops for expressions nested in an ICU.
 */
class AddIcuExpressionVisitor extends i18n.RecurseVisitor {
  constructor(
      private contextId: ir.XrefId, private i18nBlockId: ir.XrefId,
      private i18nBlockHandle: ir.SlotHandle, private insertAfterOp: ir.UpdateOp) {
    super();
  }

  override visitPlaceholder(placeholder: i18n.Placeholder) {
    const expressionOp = ir.createI18nExpressionOp(
        this.contextId, this.i18nBlockId, this.i18nBlockHandle,
        new ir.LexicalReadExpr(placeholder.value), placeholder.name,
        ir.I18nParamResolutionTime.Postproccessing, null!);
    ir.OpList.insertAfter(expressionOp, this.insertAfterOp);
    super.visitPlaceholder(placeholder);
  }
}
