/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DEFAULT_INTERPOLATION_CONFIG} from '@angular/compiler';
import {
  ExternalTemplateDeclaration,
  getAngularDecorators,
  InlineTemplateDeclaration,
  PartialEvaluator,
  ReflectionHost,
  reflectObjectLiteral,
  ResourceLoader,
} from '@angular/compiler-cli';
import ts from 'typescript';

/**
 * Attempts to extract the `TemplateDefinition` for the given
 * class, if possible.
 *
 * The definition can then be used with the Angular compiler to
 * load/parse the given template.
 */
export function attemptExtractTemplateDefinition(
  node: ts.ClassDeclaration,
  checker: ts.TypeChecker,
  reflector: ReflectionHost,
  resourceLoader: ResourceLoader,
): InlineTemplateDeclaration | ExternalTemplateDeclaration | null {
  const classDecorators = reflector.getDecoratorsOfDeclaration(node);
  const evaluator = new PartialEvaluator(reflector, checker, null);

  const ngDecorators =
    classDecorators !== null
      ? getAngularDecorators(classDecorators, ['Component'], /* isAngularCore */ false)
      : [];

  if (
    ngDecorators.length === 0 ||
    ngDecorators[0].args === null ||
    ngDecorators[0].args.length === 0 ||
    !ts.isObjectLiteralExpression(ngDecorators[0].args[0])
  ) {
    return null;
  }

  const properties = reflectObjectLiteral(ngDecorators[0].args[0]);
  const templateProp = properties.get('template');
  const templateUrlProp = properties.get('templateUrl');
  const containingFile = node.getSourceFile().fileName;

  // inline template.
  if (templateProp !== undefined) {
    const templateStr = evaluator.evaluate(templateProp);
    if (typeof templateStr === 'string') {
      return {
        isInline: true,
        expression: templateProp,
        interpolationConfig: DEFAULT_INTERPOLATION_CONFIG,
        preserveWhitespaces: false,
        resolvedTemplateUrl: containingFile,
        templateUrl: containingFile,
      } as InlineTemplateDeclaration;
    }
  }

  try {
    // external template.
    if (templateUrlProp !== undefined) {
      const templateUrl = evaluator.evaluate(templateUrlProp);
      if (typeof templateUrl === 'string') {
        return {
          isInline: false,
          interpolationConfig: DEFAULT_INTERPOLATION_CONFIG,
          preserveWhitespaces: false,
          templateUrlExpression: templateUrlProp,
          templateUrl,
          resolvedTemplateUrl: resourceLoader.resolve(templateUrl, containingFile),
        };
      }
    }
  } catch (e) {
    console.error(`Could not parse external template: ${e}`);
  }

  return null;
}
