/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ResourceLoader} from '@angular/compiler-cli/src/ngtsc/annotations';
import {TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import {InputIncompatibilityReason} from '../../input_detection/incompatibility';
import {KnownInputs} from '../../input_detection/known_inputs';
import {TemplateReferenceVisitor} from '../../input_detection/template_reference_visitor';
import {MigrationHost} from '../../migration_host';
import {MigrationResult} from '../../result';
import {InputReferenceKind} from '../../utils/input_reference';
import {ClassDeclaration, ReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import {PartialEvaluator} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {extractTemplate} from '@angular/compiler-cli/src/ngtsc/annotations/component/src/resources';
import {attemptExtractTemplateDefinition} from '../../utils/extract_template';
import {NgCompilerOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {CompilationMode} from '@angular/compiler-cli/src/ngtsc/transform';
import {TmplAstNode} from '@angular/compiler';

/**
 * Checks whether the given class has an Angular template, and resolves
 * all of the references to inputs.
 */
export function identifyTemplateReferences(
  node: ts.ClassDeclaration,
  host: MigrationHost,
  reflector: ReflectionHost,
  checker: ts.TypeChecker,
  evaluator: PartialEvaluator,
  templateTypeChecker: TemplateTypeChecker,
  resourceLoader: ResourceLoader,
  options: NgCompilerOptions,
  result: MigrationResult,
  knownInputs: KnownInputs,
) {
  const template =
    templateTypeChecker.getTemplate(node) ??
    // If there is no template registered in the TCB or compiler, the template may
    // be skipped due to an explicit `jit: true` setting. We try to detect this case
    // and parse the template manually.
    extractTemplateWithoutCompilerAnalysis(
      node,
      checker,
      reflector,
      resourceLoader,
      evaluator,
      options,
      host,
    );

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
      if (process.env['MIGRATE_NARROWED_NARROWED_IN_TEMPLATES'] !== '1' && res.isLikelyNarrowed) {
        knownInputs.markInputAsIncompatible(res.targetInput, {
          reason: InputIncompatibilityReason.PotentiallyNarrowedInTemplateButNoSupportYet,
          context: null,
        });
      }
    }
  }
}

/**
 * Attempts to extract a `@Component` template from the given class,
 * without relying on the `NgCompiler` program analysis.
 *
 * This is useful for JIT components using `jit: true` which were not
 * processed by the Angular compiler, but may still have templates that
 * contain references to inputs that we can resolve via the fallback
 * reference resolutions (that does not use the type check block).
 */
function extractTemplateWithoutCompilerAnalysis(
  node: ts.ClassDeclaration,
  checker: ts.TypeChecker,
  reflector: ReflectionHost,
  resourceLoader: ResourceLoader,
  evaluator: PartialEvaluator,
  options: NgCompilerOptions,
  host: MigrationHost,
): TmplAstNode[] | null {
  if (node.name === undefined) {
    return null;
  }
  const tmplDef = attemptExtractTemplateDefinition(node, checker, reflector, host);
  if (tmplDef === null) {
    return null;
  }
  return extractTemplate(
    node as ClassDeclaration,
    tmplDef,
    evaluator,
    null,
    resourceLoader,
    {
      enableBlockSyntax: true,
      enableLetSyntax: true,
      usePoisonedData: true,
      enableI18nLegacyMessageIdFormat: options.enableI18nLegacyMessageIdFormat !== false,
      i18nNormalizeLineEndingsInICUs: options.i18nNormalizeLineEndingsInICUs === true,
    },
    CompilationMode.FULL,
  ).nodes;
}
