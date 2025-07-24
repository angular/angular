/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TmplAstNode} from '@angular/compiler';
import {ResourceLoader} from '@angular/compiler-cli/src/ngtsc/annotations';
import {extractTemplate} from '@angular/compiler-cli/src/ngtsc/annotations/component/src/resources';
import {NgCompilerOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {PartialEvaluator} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {ClassDeclaration, ReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import {CompilationMode} from '@angular/compiler-cli/src/ngtsc/transform';
import {OptimizeFor, TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';
import {ProgramInfo, projectFile} from '../../../../../utils/tsurge';
import {TemplateReferenceVisitor} from './template_reference_visitor';
import {attemptExtractTemplateDefinition} from '../../utils/extract_template';
import {ReferenceResult} from './reference_result';
import {ClassFieldDescriptor, KnownFields} from './known_fields';
import {ReferenceKind} from './reference_kinds';

/**
 * Checks whether the given class has an Angular template, and resolves
 * all of the references to inputs.
 */
export function identifyTemplateReferences<D extends ClassFieldDescriptor>(
  programInfo: ProgramInfo,
  node: ts.ClassDeclaration,
  reflector: ReflectionHost,
  checker: ts.TypeChecker,
  evaluator: PartialEvaluator,
  templateTypeChecker: TemplateTypeChecker,
  resourceLoader: ResourceLoader,
  options: NgCompilerOptions,
  result: ReferenceResult<D>,
  knownFields: KnownFields<D>,
  fieldNamesToConsiderForReferenceLookup: Set<string> | null,
) {
  const template =
    templateTypeChecker.getTemplate(node, OptimizeFor.WholeProgram) ??
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
    );

  if (template !== null) {
    const visitor = new TemplateReferenceVisitor(
      checker,
      templateTypeChecker,
      node,
      knownFields,
      fieldNamesToConsiderForReferenceLookup,
    );
    template.forEach((node) => node.visit(visitor));

    for (const res of visitor.result) {
      const templateFilePath = res.context.sourceSpan.start.file.url;

      // Templates without an URL are non-mappable artifacts of e.g.
      // string concatenated templates. See the `indirect` template
      // source mapping concept in the compiler. We skip such references
      // as those cannot be migrated, but print an error for now.
      if (templateFilePath === '') {
        // TODO: Incorporate a TODO potentially.
        console.error(
          `Found reference to field ${res.targetField.key} that cannot be ` +
            `migrated because the template cannot be parsed with source map information ` +
            `(in file: ${node.getSourceFile().fileName}).`,
        );
        continue;
      }

      result.references.push({
        kind: ReferenceKind.InTemplate,
        from: {
          read: res.read,
          readAstPath: res.readAstPath,
          node: res.context,
          isObjectShorthandExpression: res.isObjectShorthandExpression,
          originatingTsFile: projectFile(node.getSourceFile(), programInfo),
          templateFile: projectFile(absoluteFrom(templateFilePath), programInfo),
          isLikelyPartOfNarrowing: res.isLikelyNarrowed,
          isWrite: res.isWrite,
        },
        target: res.targetField,
      });
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
): TmplAstNode[] | null {
  if (node.name === undefined) {
    return null;
  }
  const tmplDef = attemptExtractTemplateDefinition(node, checker, reflector, resourceLoader);
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
      enableSelectorless: false,
    },
    CompilationMode.FULL,
  ).nodes;
}
