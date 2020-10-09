/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

import {findTightestNode, getClassDeclFromDecoratorProp, getPropertyAssignmentFromValue} from './ts_utils';

/**
 * Gets an Angular-specific definition in a TypeScript source file.
 */
export function getTsDefinitionAndBoundSpan(
    sf: ts.SourceFile, position: number,
    tsLsHost: Pick<ts.LanguageServiceHost, 'fileExists'>): ts.DefinitionInfoAndBoundSpan|undefined {
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
    tsLsHost: Pick<ts.LanguageServiceHost, 'fileExists'>): ts.DefinitionInfoAndBoundSpan|undefined {
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
