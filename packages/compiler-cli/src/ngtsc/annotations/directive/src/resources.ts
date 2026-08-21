/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError} from '../../../diagnostics';
import {Resource} from '../../../metadata';
import {PartialEvaluator} from '../../../partial_evaluator';
import {Decorator} from '../../../reflection';
import {createValueHasWrongTypeError, isStringArray} from '../../common';

/**
 * Information about the origin of a resource in the application code. This is used for creating
 * diagnostics, so we can point to the root cause of an error in the application code.
 *
 * A template resource comes from the `templateUrl` property on the component decorator.
 *
 * Stylesheets resources can come from either the `styleUrls` property on the component/directive decorator,
 * or from inline `style` tags and style links on the external template.
 */
export const enum ResourceTypeForDiagnostics {
  Template,
  StylesheetFromTemplate,
  StylesheetFromDecorator,
}

/**
 * The literal style url extracted from the decorator, along with metadata for diagnostics.
 */
export interface StyleUrlMeta {
  url: string;
  expression: ts.Expression;
  source:
    | ResourceTypeForDiagnostics.StylesheetFromTemplate
    | ResourceTypeForDiagnostics.StylesheetFromDecorator;
}

export function makeResourceNotFoundError(
  file: string,
  nodeForError: ts.Node,
  resourceType: ResourceTypeForDiagnostics,
): FatalDiagnosticError {
  let errorText: string;
  switch (resourceType) {
    case ResourceTypeForDiagnostics.Template:
      errorText = `Could not find template file '${file}'.`;
      break;
    case ResourceTypeForDiagnostics.StylesheetFromTemplate:
      errorText = `Could not find stylesheet file '${file}' linked from the template.`;
      break;
    case ResourceTypeForDiagnostics.StylesheetFromDecorator:
      errorText = `Could not find stylesheet file '${file}'.`;
      break;
  }

  return new FatalDiagnosticError(ErrorCode.COMPONENT_RESOURCE_NOT_FOUND, nodeForError, errorText);
}

/**
 * Transforms the given decorator to inline external resources. i.e. if the decorator
 * resolves to `@Component` or `@Directive`, the `templateUrl` and `styleUrls` metadata fields will be
 * transformed to their semantically-equivalent inline variants.
 *
 * This method is used for serializing decorators into the class metadata. The emitted
 * class metadata should not refer to external resources as this would be inconsistent
 * with the component definitions/declarations which already inline external resources.
 *
 * Additionally, the references to external resources would require libraries to ship
 * external resources exclusively for the class metadata.
 */
export function transformDecoratorResources(
  dec: Decorator,
  metadataMap: Map<string, ts.Expression>,
  styles: string[],
  template: {content: string} | null,
): Decorator {
  if (dec.name !== 'Component' && dec.name !== 'Directive') {
    return dec;
  }

  // If no external resources are referenced, preserve the original decorator
  // for the best source map experience when the decorator is emitted in TS.
  if (
    !metadataMap.has('templateUrl') &&
    !metadataMap.has('styleUrls') &&
    !metadataMap.has('styleUrl') &&
    !metadataMap.has('styles')
  ) {
    return dec;
  }

  const metadata = new Map(metadataMap);

  // Set the `template` property if the `templateUrl` property is set.
  if (template && metadata.has('templateUrl')) {
    metadata.delete('templateUrl');
    metadata.set('template', ts.factory.createStringLiteral(template.content));
  }

  if (metadata.has('styleUrls') || metadata.has('styleUrl') || metadata.has('styles')) {
    metadata.delete('styles');
    metadata.delete('styleUrls');
    metadata.delete('styleUrl');

    if (styles.length > 0) {
      const styleNodes = styles.reduce((result, style) => {
        if (style.trim().length > 0) {
          result.push(ts.factory.createStringLiteral(style));
        }
        return result;
      }, [] as ts.StringLiteral[]);

      if (styleNodes.length > 0) {
        metadata.set('styles', ts.factory.createArrayLiteralExpression(styleNodes));
      }
    }
  }

  // Convert the metadata to TypeScript AST object literal element nodes.
  const newMetadataFields: ts.ObjectLiteralElementLike[] = [];
  for (const [name, value] of metadata.entries()) {
    newMetadataFields.push(ts.factory.createPropertyAssignment(name, value));
  }

  // Return the original decorator with the overridden metadata argument.
  return {...dec, args: [ts.factory.createObjectLiteralExpression(newMetadataFields)]};
}

export function extractDirectiveStyleUrls(
  evaluator: PartialEvaluator,
  directive: Map<string, ts.Expression>,
  decoratorName: string = '@Directive',
): StyleUrlMeta[] {
  const styleUrlsExpr = directive.get('styleUrls');
  const styleUrlExpr = directive.get('styleUrl');

  if (styleUrlsExpr !== undefined && styleUrlExpr !== undefined) {
    throw new FatalDiagnosticError(
      ErrorCode.COMPONENT_INVALID_STYLE_URLS,
      styleUrlExpr,
      `${decoratorName} cannot define both \`styleUrl\` and \`styleUrls\`. ` +
        `Use \`styleUrl\` if having one stylesheet, or \`styleUrls\` if having multiple`,
    );
  }

  if (styleUrlsExpr !== undefined) {
    return extractStyleUrlsFromExpression(evaluator, directive.get('styleUrls')!);
  }

  if (styleUrlExpr !== undefined) {
    const styleUrl = evaluator.evaluate(styleUrlExpr);

    if (typeof styleUrl !== 'string') {
      throw createValueHasWrongTypeError(styleUrlExpr, styleUrl, 'styleUrl must be a string');
    }

    return [
      {
        url: styleUrl,
        source: ResourceTypeForDiagnostics.StylesheetFromDecorator,
        expression: styleUrlExpr,
      },
    ];
  }

  return [];
}

export function extractStyleUrlsFromExpression(
  evaluator: PartialEvaluator,
  styleUrlsExpr: ts.Expression,
): StyleUrlMeta[] {
  const styleUrls: StyleUrlMeta[] = [];

  if (ts.isArrayLiteralExpression(styleUrlsExpr)) {
    for (const styleUrlExpr of styleUrlsExpr.elements) {
      if (ts.isSpreadElement(styleUrlExpr)) {
        styleUrls.push(...extractStyleUrlsFromExpression(evaluator, styleUrlExpr.expression));
      } else {
        const styleUrl = evaluator.evaluate(styleUrlExpr);

        if (typeof styleUrl !== 'string') {
          throw createValueHasWrongTypeError(styleUrlExpr, styleUrl, 'styleUrl must be a string');
        }

        styleUrls.push({
          url: styleUrl,
          source: ResourceTypeForDiagnostics.StylesheetFromDecorator,
          expression: styleUrlExpr,
        });
      }
    }
  } else {
    const evaluatedStyleUrls = evaluator.evaluate(styleUrlsExpr);
    if (!isStringArray(evaluatedStyleUrls)) {
      throw createValueHasWrongTypeError(
        styleUrlsExpr,
        evaluatedStyleUrls,
        'styleUrls must be an array of strings',
      );
    }

    for (const styleUrl of evaluatedStyleUrls) {
      styleUrls.push({
        url: styleUrl,
        source: ResourceTypeForDiagnostics.StylesheetFromDecorator,
        expression: styleUrlsExpr,
      });
    }
  }

  return styleUrls;
}

export function extractInlineStyleResources(directive: Map<string, ts.Expression>): Set<Resource> {
  const styles = new Set<Resource>();
  function stringLiteralElements(array: ts.ArrayLiteralExpression): ts.StringLiteralLike[] {
    return array.elements.filter((e): e is ts.StringLiteralLike => ts.isStringLiteralLike(e));
  }

  const stylesExpr = directive.get('styles');
  if (stylesExpr !== undefined) {
    if (ts.isArrayLiteralExpression(stylesExpr)) {
      for (const expression of stringLiteralElements(stylesExpr)) {
        styles.add({path: null, node: expression});
      }
    } else if (ts.isStringLiteralLike(stylesExpr)) {
      styles.add({path: null, node: stylesExpr});
    }
  }

  return styles;
}
