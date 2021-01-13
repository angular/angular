/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';  // used as value and is provided at runtime

import {locateSymbols} from './locate_symbol';
import {findTightestNode, getClassDeclFromDecoratorProp, getPropertyAssignmentFromValue} from './ts_utils';
import {AstResult, Span} from './types';
import {extractAbsoluteFilePath} from './utils';

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
 * Attempts to get the definition of a file whose URL is specified in a property assignment in a
 * directive decorator.
 * Currently applies to `templateUrl` and `styleUrls` properties.
 */
function getUrlFromProperty(
    urlNode: ts.StringLiteralLike,
    tsLsHost: Readonly<ts.LanguageServiceHost>): ts.DefinitionInfoAndBoundSpan|undefined {
  // Get the property assignment node corresponding to the `templateUrl` or `styleUrls` assignment.
  // These assignments are specified differently; `templateUrl` is a string, and `styleUrls` is
  // an array of strings:
  //   {
  //        templateUrl: './template.ng.html',
  //        styleUrls: ['./style.css', './other-style.css']
  //   }
  // `templateUrl`'s property assignment can be found from the string literal node;
  // `styleUrls`'s property assignment can be found from the array (parent) node.
  //
  // First search for `templateUrl`.
  let asgn = getPropertyAssignmentFromValue(urlNode, 'templateUrl');
  if (!asgn) {
    // `templateUrl` assignment not found; search for `styleUrls` array assignment.
    asgn = getPropertyAssignmentFromValue(urlNode.parent, 'styleUrls');
    if (!asgn) {
      // Nothing found, bail.
      return;
    }
  }

  // If the property assignment is not a property of a class decorator, don't generate definitions
  // for it.
  if (!getClassDeclFromDecoratorProp(asgn)) {
    return;
  }

  // Extract url path specified by the url node, which is relative to the TypeScript source file
  // the url node is defined in.
  const url = extractAbsoluteFilePath(urlNode);

  // If the file does not exist, bail. It is possible that the TypeScript language service host
  // does not have a `fileExists` method, in which case optimistically assume the file exists.
  if (tsLsHost.fileExists && !tsLsHost.fileExists(url)) return;

  const templateDefinitions: ts.DefinitionInfo[] = [{
    kind: ts.ScriptElementKind.externalModuleName,
    name: url,
    containerKind: ts.ScriptElementKind.unknown,
    containerName: '',
    // Reading the template is expensive, so don't provide a preview.
    textSpan: {start: 0, length: 0},
    fileName: url,
  }];

  return {
    definitions: templateDefinitions,
    textSpan: {
      // Exclude opening and closing quotes in the url span.
      start: urlNode.getStart() + 1,
      length: urlNode.getWidth() - 2,
    },
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
  const symbols = locateSymbols(info, position);
  if (!symbols.length) {
    return;
  }

  const seen = new Set<string>();
  const definitions: ts.DefinitionInfo[] = [];
  for (const symbolInfo of symbols) {
    const {symbol} = symbolInfo;

    // symbol.definition is really the locations of the symbol. There could be
    // more than one. No meaningful info could be provided without any location.
    const {kind, name, container, definition: locations} = symbol;
    if (!locations || !locations.length) {
      continue;
    }

    const containerKind =
        container ? container.kind as ts.ScriptElementKind : ts.ScriptElementKind.unknown;
    const containerName = container ? container.name : '';

    for (const {fileName, span} of locations) {
      const textSpan = ngSpanToTsTextSpan(span);
      // In cases like two-way bindings, a request for the definitions of an expression may return
      // two of the same definition:
      //    [(ngModel)]="prop"
      //                 ^^^^  -- one definition for the property binding, one for the event binding
      // To prune duplicate definitions, tag definitions with unique location signatures and ignore
      // definitions whose locations have already been seen.
      const signature = `${textSpan.start}:${textSpan.length}@${fileName}`;
      if (seen.has(signature)) continue;

      definitions.push({
        kind: kind as ts.ScriptElementKind,
        name,
        containerKind,
        containerName,
        textSpan: ngSpanToTsTextSpan(span),
        fileName: fileName,
      });
      seen.add(signature);
    }
  }

  return {
    definitions,
    textSpan: symbols[0].span,
  };
}

/**
 * Gets an Angular-specific definition in a TypeScript source file.
 */
export function getTsDefinitionAndBoundSpan(
    sf: ts.SourceFile, position: number,
    tsLsHost: Readonly<ts.LanguageServiceHost>): ts.DefinitionInfoAndBoundSpan|undefined {
  const node = findTightestNode(sf, position);
  if (!node) return;
  switch (node.kind) {
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
      // Attempt to extract definition of a URL in a property assignment.
      return getUrlFromProperty(node as ts.StringLiteralLike, tsLsHost);
    default:
      return undefined;
  }
}
