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
import {getPropertyAssignmentFromValue, isClassDecoratorProperty} from './template';
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
  let asgn = getPropertyAssignmentFromValue(urlNode);
  if (!asgn || asgn.name.getText() !== 'templateUrl') {
    // `templateUrl` assignment not found; search for `styleUrls` array assignment.
    asgn = getPropertyAssignmentFromValue(urlNode.parent);
    if (!asgn || asgn.name.getText() !== 'styleUrls') {
      // Nothing found, bail.
      return;
    }
  }

  // If the property assignment is not a property of a class decorator, don't generate definitions
  // for it.
  if (!isClassDecoratorProperty(asgn)) return;

  const sf = urlNode.getSourceFile();
  // Extract url path specified by the url node, which is relative to the TypeScript source file
  // the url node is defined in.
  const url = path.join(path.dirname(sf.fileName), urlNode.text);

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
