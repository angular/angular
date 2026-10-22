/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
export {getLineStarts, positionToOffset, lineNumberAtOffset, offsetToPosition} from './tcb_util.js';

const SPAN_COMMENT_REGEX = /\/\*(\d+),(\d+)\*\//g;

export function getTemplateLocationFromTcbLocation(
  tcbCode: string,
  targetPos: number,
): {start: number; end: number} | null {
  // Find the closest span comment to targetPos using matchAll (stateless)
  let closestMatch = null;
  let minDistance = Infinity;

  for (const match of tcbCode.matchAll(SPAN_COMMENT_REGEX)) {
    const commentPos = match.index!;
    const distance = Math.abs(commentPos - targetPos);

    if (distance < minDistance) {
      minDistance = distance;
      closestMatch = match;
    } else {
      // Matches are yielded in strictly increasing index order.
      // Once the distance stops decreasing, we have reached the absolute minimum.
      break;
    }
  }

  if (!closestMatch) {
    return null;
  }

  return {
    start: parseInt(closestMatch[1], 10),
    end: parseInt(closestMatch[2], 10),
  };
}

export function getTcbPath(tsFilePath: string): string {
  return `${tsFilePath.replace(/\.ts$/, '')}.ngtypecheck.ts`;
}

export function isTcbFunction(
  node: ts.Node,
  expectedId?: string,
): node is ts.FunctionDeclaration & {name: ts.Identifier} {
  if (!ts.isFunctionDeclaration(node) || !node.name) {
    return false;
  }
  const isMatch = expectedId
    ? node.name.text === `_${expectedId}`
    : node.name.text.startsWith('_tcb');
  return isMatch && node.parameters.length === 1 && node.parameters[0].name.getText() === 'this';
}
