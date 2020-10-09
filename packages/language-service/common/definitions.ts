/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {findTightestNode, getClassDeclFromDecoratorProp, getPropertyAssignmentFromValue} from './ts_utils';

export interface ResourceResolver {
  /**
   * Resolve the url of a resource relative to the file that contains the reference to it.
   *
   * @param file The, possibly relative, url of the resource.
   * @param basePath The path to the file that contains the URL of the resource.
   * @returns A resolved url of resource.
   * @throws An error if the resource cannot be resolved.
   */
  resolve(file: string, basePath: string): string;
}

/**
 * Gets an Angular-specific definition in a TypeScript source file.
 */
export function getTsDefinitionAndBoundSpan(
    sf: ts.SourceFile, position: number,
    resourceResolver: ResourceResolver): ts.DefinitionInfoAndBoundSpan|undefined {
  const node = findTightestNode(sf, position);
  if (!node) return;
  switch (node.kind) {
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
      // Attempt to extract definition of a URL in a property assignment.
      return getUrlFromProperty(node as ts.StringLiteralLike, resourceResolver);
    default:
      return undefined;
  }
}

/**
 * Attempts to get the definition of a file whose URL is specified in a property assignment in a
 * directive decorator.
 * Currently applies to `templateUrl` and `styleUrls` properties.
 */
function getUrlFromProperty(urlNode: ts.StringLiteralLike, resourceResolver: ResourceResolver):
    ts.DefinitionInfoAndBoundSpan|undefined {
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
  let url: string;
  try {
    url = resourceResolver.resolve(urlNode.text, sf.fileName);
  } catch {
    // If the file does not exist, bail.
    return;
  }

  const templateDefinitions: ts.DefinitionInfo[] = [{
    kind: ts.ScriptElementKind.externalModuleName,
    name: url,
    containerKind: ts.ScriptElementKind.unknown,
    containerName: '',
    // Reading the template is expensive, so don't provide a preview.
    // TODO(ayazhafiz): Consider providing an actual span:
    //  1. We're likely to read the template anyway
    //  2. We could show just the first 100 chars or so
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
