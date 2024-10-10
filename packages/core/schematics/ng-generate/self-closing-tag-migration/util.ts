/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HtmlParser, ParseTreeResult} from '@angular/compiler';
import ts from 'typescript';
import {dirname, join} from 'path';

type MigrateError = {
  type: string;
  error: unknown;
};

interface ParseResult {
  tree: ParseTreeResult | undefined;
  errors: MigrateError[];
}

export interface AnalyzedFile {
  start: number;
  end?: number;
  node: ts.ClassDeclaration;
  property: ts.PropertyAssignment;
  type: 'template' | 'templateUrl';
  template?: string;
  templateUrl?: string;
}

export function parseTemplate(template: string): ParseResult {
  let parsed: ParseTreeResult;
  try {
    // Note: we use the HtmlParser here, instead of the `parseTemplate` function, because the
    // latter returns an Ivy AST, not an HTML AST. The HTML AST has the advantage of preserving
    // interpolated text as text nodes containing a mixture of interpolation tokens and text tokens,
    // rather than turning them into `BoundText` nodes like the Ivy AST does. This allows us to
    // easily get the text-only ranges without having to reconstruct the original text.
    parsed = new HtmlParser().parse(template, '', {
      // Allows for ICUs to be parsed.
      tokenizeExpansionForms: true,
      // Explicitly disable blocks so that their characters are treated as plain text.
      tokenizeBlocks: true,
      preserveLineEndings: true,
    });

    // Don't migrate invalid templates.
    if (parsed.errors && parsed.errors.length > 0) {
      const errors = parsed.errors.map((e) => ({type: 'parse', error: e}));
      return {tree: undefined, errors};
    }
  } catch (e: any) {
    return {tree: undefined, errors: [{type: 'parse', error: e}]};
  }
  return {tree: parsed, errors: []};
}

export function analyzeDecorator(
  node: ts.ClassDeclaration,
  sourceFile: ts.SourceFile,
  analyzedFiles: Map<string, AnalyzedFile[]>,
) {
  const decorator = ts.getDecorators(node)?.find((dec) => {
    return (
      ts.isCallExpression(dec.expression) &&
      ts.isIdentifier(dec.expression.expression) &&
      dec.expression.expression.text === 'Component'
    );
  }) as (ts.Decorator & {expression: ts.CallExpression}) | undefined;

  const metadata =
    decorator &&
    decorator.expression.arguments.length > 0 &&
    ts.isObjectLiteralExpression(decorator.expression.arguments[0])
      ? decorator.expression.arguments[0]
      : null;

  if (!metadata) {
    return;
  }

  for (const prop of metadata.properties) {
    // All the properties we care about should have static
    // names and be initialized to a static string.
    if (
      !ts.isPropertyAssignment(prop) ||
      (!ts.isIdentifier(prop.name) && !ts.isStringLiteralLike(prop.name))
    ) {
      continue;
    }

    switch (prop.name.text) {
      case 'template': {
        const currentData = analyzedFiles.get(sourceFile.fileName) ?? [];
        analyzedFiles.set(sourceFile.fileName, [
          ...currentData,
          {
            // +1/-1 to exclude the opening/closing characters from the range.
            start: prop.initializer.getStart() + 1,
            end: prop.initializer.getEnd() - 1,
            node: node,
            type: 'template',
            property: prop,
            template: prop.initializer.getText(),
          },
        ]);
        break;
      }

      case 'templateUrl': {
        const path = join(dirname(sourceFile.fileName), prop.initializer.getText().slice(1, -1));
        const currentData = analyzedFiles.get(path) ?? [];
        analyzedFiles.set(path, [
          ...currentData,
          {
            // Leave the end as undefined which means that the range is until the end of the file.
            start: 0,
            node: node,
            type: 'templateUrl',
            property: prop,
            templateUrl: prop.initializer.getText(),
          },
        ]);
        break;
      }
    }
  }
}
