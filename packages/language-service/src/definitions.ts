/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript'; // used as value and is provided at runtime
import {AstResult} from './common';
import {locateSymbol} from './locate_symbol';
import {Span, TemplateSource} from './types';
import {findTightestNode} from './utils';

/**
 * Convert Angular Span to TypeScript TextSpan. Angular Span has 'start' and
 * 'end' whereas TS TextSpan has 'start' and 'length'.
 * @param span Angular Span
 */
function ngSpanToTsTextSpan(span: Span): ts.TextSpan {
  return {
    start: span.start,
    length: span.end - span.start,
  };
}

/**
 * Traverse the template AST and look for the symbol located at `position`, then
 * return its definition and span of bound text.
 * @param info
 * @param position
 */
export function getDefinitionAndBoundSpan(
    info: AstResult, position: number): ts.DefinitionInfoAndBoundSpan|undefined {
  const symbolInfo = locateSymbol(info, position);
  if (!symbolInfo) {
    return;
  }
  const textSpan = ngSpanToTsTextSpan(symbolInfo.span);
  const {symbol} = symbolInfo;
  const {container, definition: locations} = symbol;
  if (!locations || !locations.length) {
    // symbol.definition is really the locations of the symbol. There could be
    // more than one. No meaningful info could be provided without any location.
    return {textSpan};
  }
  const containerKind = container ? container.kind : ts.ScriptElementKind.unknown;
  const containerName = container ? container.name : '';
  const definitions = locations.map((location) => {
    return {
      kind: symbol.kind as ts.ScriptElementKind,
      name: symbol.name,
      containerKind: containerKind as ts.ScriptElementKind,
      containerName: containerName,
      textSpan: ngSpanToTsTextSpan(location.span),
      fileName: location.fileName,
    };
  });
  return {
      definitions, textSpan,
  };
}

/**
 * Gets an Angular-specific definition in a TypeScript source file.
 */
export function getTsDefinitionAndBoundSpan(
    sf: ts.SourceFile, position: number,
    readTemplate: (file: string) => TemplateSource[]): ts.DefinitionInfoAndBoundSpan|undefined {
  const node = findTightestNode(sf, position);
  if (!node) return;
  switch (node.kind) {
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
      // Attempt to extract definition of a URL in a property assignment.
      return getUrlFromProperty(node as ts.StringLiteralLike, readTemplate);
    default:
      return undefined;
  }
}

/**
 * Attempts to get the definition of a file whose URL is specified in a property assignment.
 * Currently applies to `templateUrl` properties.
 */
function getUrlFromProperty(
    urlNode: ts.StringLiteralLike,
    readTemplate: (file: string) => TemplateSource[]): ts.DefinitionInfoAndBoundSpan|undefined {
  const sf = urlNode.getSourceFile();
  const parent = urlNode.parent;
  if (!ts.isPropertyAssignment(parent)) return;

  switch (parent.name.getText()) {
    case 'templateUrl':
      // Extract definition of the template file specified by this `templateUrl` property.
      const url = path.join(path.dirname(sf.fileName), urlNode.text);
      const templates = readTemplate(url);
      const templateDefinitions = templates.map(tmpl => {
        return {
          kind: ts.ScriptElementKind.externalModuleName,
          name: url,
          containerKind: ts.ScriptElementKind.unknown,
          containerName: '',
          textSpan: ngSpanToTsTextSpan(tmpl.span),
          fileName: url,
        };
      });

      return {
        definitions: templateDefinitions,
        textSpan: {
          start: urlNode.getStart(),
          length: urlNode.getWidth(),
        },
      };
    default:
      return undefined;
  }
}
