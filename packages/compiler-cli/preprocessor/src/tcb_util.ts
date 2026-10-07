/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {BoundTarget, TcbDirectiveMetadata} from '@angular/compiler';
import type {TcbTargetInput} from './tcb.js';
import * as nga from './types.js';

const lineStartsCache = new Map<string, number[]>();
const MAX_CACHE_SIZE = 10;

export function getLineStarts(content: string): number[] {
  let lineStarts = lineStartsCache.get(content);
  if (lineStarts) {
    // LRU: delete and re-set to move to end
    lineStartsCache.delete(content);
    lineStartsCache.set(content, lineStarts);
    return lineStarts;
  }

  lineStarts = [0];
  let pos = 0;
  while ((pos = content.indexOf('\n', pos)) !== -1) {
    pos++;
    lineStarts.push(pos);
  }

  if (lineStartsCache.size >= MAX_CACHE_SIZE) {
    const firstKey = lineStartsCache.keys().next().value;
    if (firstKey !== undefined) {
      lineStartsCache.delete(firstKey);
    }
  }
  lineStartsCache.set(content, lineStarts);

  return lineStarts;
}

export function positionToOffset(
  content: string,
  position: {line: number; character: number},
): number {
  const lineStarts = getLineStarts(content);
  const line = Math.max(0, position.line);
  if (line >= lineStarts.length) {
    return content.length; // Fallback
  }
  const lineStart = lineStarts[line];
  const nextLineStart = lineStarts[line + 1] ?? content.length;

  let lineLength = nextLineStart - lineStart;
  if (lineLength > 0 && content[nextLineStart - 1] === '\n') {
    lineLength--;
    if (lineLength > 0 && content[nextLineStart - 2] === '\r') {
      lineLength--;
    }
  }

  const character = Math.max(0, Math.min(position.character, lineLength)); // Clamp character

  return lineStart + character;
}

/**
 * Returns the 1-based line number containing `offset`, reusing the cached line-start index.
 */
export function lineNumberAtOffset(content: string, offset: number): number {
  return offsetToPosition(content, offset).line + 1;
}

export function offsetToPosition(
  content: string,
  offset: number,
): {line: number; character: number} {
  offset = Math.min(content.length, Math.max(0, offset)); // Clamp offset to content length
  const lineStarts = getLineStarts(content);
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const mid = (low + high) >>> 1; // Use bitwise shift
    if (lineStarts[mid] <= offset) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  const line = high;
  const lineStart = lineStarts[line];
  return {
    line,
    character: offset - lineStart,
  };
}

/**
 * Determines whether a declaration metadata requires inline handling due to not being exported
 * or having non-exported generic type parameter bounds.
 */
export function requiresInlineDeclaration(meta?: {
  isExported?: boolean;
  hasNonExportedBounds?: boolean;
}): boolean {
  if (!meta) return false;
  return meta.isExported === false || meta.hasNonExportedBounds === true;
}

/**
 * Determines whether a component target requires an inline Type Check Block (TCB).
 *
 * https://github.com/angular/angular/blob/18d899e31f3ef657e302dfe24aa305c9bf10e0af/packages/compiler-cli/src/ngtsc/typecheck/src/tcb_util.ts#L102-L127
 */
export function requiresInlineTypeCheckBlock(
  target: TcbTargetInput,
  boundTarget: BoundTarget<TcbDirectiveMetadata>,
  localClasses: Map<string, nga.ClassMetadata>,
): boolean {
  if (requiresInlineDeclaration(target.classMeta)) {
    return true;
  }

  if (target.pipeRegistry) {
    for (const pipeName of boundTarget.getUsedPipes()) {
      const pipeMeta = target.pipeRegistry.get(pipeName);
      if (pipeMeta && (requiresInlineDeclaration(pipeMeta) || !pipeMeta.importPath)) {
        return true;
      }
    }
  }

  for (const dir of boundTarget.getUsedDirectives()) {
    const dirClass = localClasses.get(dir.name);
    if (!dirClass && dir.ref.isLocal && dir.ref.moduleName === null) {
      return true;
    }
    if (requiresInlineDeclaration(dirClass)) {
      return true;
    }
  }

  return false;
}
