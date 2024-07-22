/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {InputIncompatibilityReason} from '../../input_detection/incompatibility';
import {KnownInputs} from '../../input_detection/known_inputs';
import {MigrationHost} from '../../migration_host';
import {MigrationResult} from '../../result';
import {InputReferenceKind} from '../../utils/input_reference';
import {TemplateTypeChecker} from '../../../../../../../compiler-cli/src/ngtsc/typecheck/api';
import {TemplateReferenceVisitor} from '../../input_detection/template_reference_visitor';

/**
 * Checks whether the given class has an Angular template, and resolves
 * all of the references to inputs.
 */
export function identifyTemplateReferences(
  node: ts.ClassDeclaration,
  host: MigrationHost,
  checker: ts.TypeChecker,
  templateTypeChecker: TemplateTypeChecker,
  result: MigrationResult,
  knownInputs: KnownInputs,
) {
  const template = templateTypeChecker.getTemplate(node);
  if (template !== null) {
    const visitor = new TemplateReferenceVisitor(
      host,
      checker,
      templateTypeChecker,
      node,
      knownInputs,
    );
    template.forEach((node) => node.visit(visitor));

    for (const res of visitor.result) {
      const templateFilePath = res.context.sourceSpan.start.file.url;

      result.references.push({
        kind: InputReferenceKind.InTemplate,
        from: {
          read: res.read,
          node: res.context,
          isObjectShorthandExpression: res.isObjectShorthandExpression,
          originatingTsFileId: host.fileToId(node.getSourceFile()),
          templateFileId: host.fileToId(templateFilePath),
        },
        target: res.targetInput,
      });

      // TODO: Remove this when we support signal narrowing in templates.
      // https://github.com/angular/angular/pull/55456.
      if (
        process.env['MIGRATE_NARROWED_NARROWED_IN_TEMPLATES'] !== '1' &&
        res.isInsideNarrowingExpression
      ) {
        knownInputs.markInputAsIncompatible(res.targetInput, {
          reason: InputIncompatibilityReason.NarrowedInTemplateButNotSupportedYetTODO,
          context: null,
        });
      }
    }
  }
}
