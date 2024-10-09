/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as i18n from '../../../../i18n/i18n_ast';
import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Create one helper context op per i18n block (including generate descending blocks).
 *
 * Also, if an ICU exists inside an i18n block that also contains other localizable content (such as
 * string), create an additional helper context op for the ICU.
 *
 * These context ops are later used for generating i18n messages. (Although we generate at least one
 * context op per nested view, we will collect them up the tree later, to generate a top-level
 * message.)
 */
export function createI18nContexts(job: CompilationJob) {
  // Create i18n context ops for i18n attrs.
  const attrContextByMessage = new Map<i18n.Message, ir.XrefId>();
  for (const unit of job.units) {
    for (const op of unit.ops()) {
      switch (op.kind) {
        case ir.OpKind.Binding:
        case ir.OpKind.Property:
        case ir.OpKind.Attribute:
        case ir.OpKind.ExtractedAttribute:
          if (op.i18nMessage === null) {
            continue;
          }
          if (!attrContextByMessage.has(op.i18nMessage)) {
            const i18nContext = ir.createI18nContextOp(
              ir.I18nContextKind.Attr,
              job.allocateXrefId(),
              null,
              op.i18nMessage,
              null!,
            );
            unit.create.push(i18nContext);
            attrContextByMessage.set(op.i18nMessage, i18nContext.xref);
          }
          op.i18nContext = attrContextByMessage.get(op.i18nMessage)!;
          break;
      }
    }
  }

  // Create i18n context ops for root i18n blocks.
  const blockContextByI18nBlock = new Map<ir.XrefId, ir.I18nContextOp>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          if (op.xref === op.root) {
            const contextOp = ir.createI18nContextOp(
              ir.I18nContextKind.RootI18n,
              job.allocateXrefId(),
              op.xref,
              op.message,
              null!,
            );
            unit.create.push(contextOp);
            op.context = contextOp.xref;
            blockContextByI18nBlock.set(op.xref, contextOp);
          }
          break;
      }
    }
  }

  // Assign i18n contexts for child i18n blocks. These don't need their own conext, instead they
  // should inherit from their root i18n block.
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.I18nStart && op.xref !== op.root) {
        const rootContext = blockContextByI18nBlock.get(op.root);
        if (rootContext === undefined) {
          throw Error('AssertionError: Root i18n block i18n context should have been created.');
        }
        op.context = rootContext.xref;
        blockContextByI18nBlock.set(op.xref, rootContext);
      }
    }
  }

  // Create or assign i18n contexts for ICUs.
  let currentI18nOp: ir.I18nStartOp | null = null;
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          currentI18nOp = op;
          break;
        case ir.OpKind.I18nEnd:
          currentI18nOp = null;
          break;
        case ir.OpKind.IcuStart:
          if (currentI18nOp === null) {
            throw Error('AssertionError: Unexpected ICU outside of an i18n block.');
          }
          if (op.message.id !== currentI18nOp.message.id) {
            // This ICU is a sub-message inside its parent i18n block message. We need to give it
            // its own context.
            const contextOp = ir.createI18nContextOp(
              ir.I18nContextKind.Icu,
              job.allocateXrefId(),
              currentI18nOp.root,
              op.message,
              null!,
            );
            unit.create.push(contextOp);
            op.context = contextOp.xref;
          } else {
            // This ICU is the only translatable content in its parent i18n block. We need to
            // convert the parent's context into an ICU context.
            op.context = currentI18nOp.context;
            blockContextByI18nBlock.get(currentI18nOp.xref)!.contextKind = ir.I18nContextKind.Icu;
          }
          break;
      }
    }
  }
}
