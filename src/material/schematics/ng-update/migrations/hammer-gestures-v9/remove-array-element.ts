/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UpdateRecorder} from '@angular-devkit/schematics';
import * as ts from 'typescript';

/**
 * Retrieves the parent syntax list of the given node. A syntax list node is usually
 * hidden from the default AST node hierarchy because it only contains information that
 * is need when printing a node. e.g. it contains information about comma positions in
 * an array literal expression.
 */
export function getParentSyntaxList(node: ts.Node): ts.SyntaxList|null {
  if (!node.parent) {
    return null;
  }
  const parent = node.parent;
  const {pos, end} = node;
  for (const child of parent.getChildren()) {
    if (child.pos > end || child === node) {
      return null;
    }

    if (child.kind === ts.SyntaxKind.SyntaxList && child.pos <= pos && child.end >= end) {
      return child as ts.SyntaxList;
    }
  }
  return null;
}

/** Looks for the trailing comma of the given element within the syntax list. */
function findTrailingCommaToken(list: ts.SyntaxList, element: ts.Node): ts.Node|null {
  let foundElement = false;
  for (let child of list.getChildren()) {
    if (!foundElement && child === element) {
      foundElement = true;
    } else if (foundElement) {
      if (child.kind === ts.SyntaxKind.CommaToken) {
        return child;
      }
      break;
    }
  }
  return null;
}

/** Removes a given element from its parent array literal expression. */
export function removeElementFromArrayExpression(element: ts.Node, recorder: UpdateRecorder) {
  recorder.remove(element.getFullStart(), element.getFullWidth());

  const syntaxList = getParentSyntaxList(element);
  if (!syntaxList) {
    return;
  }

  // if there is a trailing comma token for the element, we need to remove it
  // because otherwise the array literal expression will have syntax failures.
  const trailingComma = findTrailingCommaToken(syntaxList, element);
  if (trailingComma !== null) {
    recorder.remove(trailingComma.getFullStart(), trailingComma.getFullWidth());
  }
}
