/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TmplAstElement} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import tss from 'typescript';

import {LinkedEditingRanges} from '../api';
import {getTargetAtPosition, TargetNodeKind} from './template_target';
import {getTypeCheckInfoAtPosition} from './utils';

/**
 * Gets linked editing ranges for synchronized editing of HTML tag pairs.
 *
 * When the cursor is on an element tag name, returns both the opening and closing
 * tag name spans so they can be edited simultaneously.
 *
 * @param compiler The Angular compiler instance
 * @param fileName The file to check
 * @param position The cursor position in the file
 * @returns LinkedEditingRanges if on a tag name, null otherwise
 */
export function getLinkedEditingRangeAtPosition(
  compiler: NgCompiler,
  fileName: string,
  position: number,
): LinkedEditingRanges | null {
  const typeCheckInfo = getTypeCheckInfoAtPosition(fileName, position, compiler);
  if (typeCheckInfo === undefined) {
    return null;
  }

  // Get the target node at position
  const target = getTargetAtPosition(typeCheckInfo.nodes, position);
  if (target === null) {
    return null;
  }

  // Check if we're on an element tag (opening or closing)
  // For opening tag: context is ElementInTagContext
  // For closing tag: context may be ElementInBodyContext but we check explicitly
  let element: TmplAstElement | null = null;

  if (
    target.context.kind === TargetNodeKind.ElementInTagContext ||
    target.context.kind === TargetNodeKind.ComponentInTagContext
  ) {
    element = target.context.node as TmplAstElement;
  } else if (
    target.context.kind === TargetNodeKind.ElementInBodyContext ||
    target.context.kind === TargetNodeKind.ComponentInBodyContext
  ) {
    // When in body context, check if we're actually on the closing tag
    const potentialElement = target.context.node as TmplAstElement;
    if (isOnClosingTagName(potentialElement, position)) {
      element = potentialElement;
    }
  }

  if (element === null) {
    return null;
  }

  // Self-closing elements don't have linked ranges (e.g., <input />)
  if (element.isSelfClosing) {
    return null;
  }

  // Check if cursor is on the tag name (opening or closing)
  if (!isOnTagName(element, position)) {
    return null;
  }

  // Get the linked tag name ranges
  const ranges = getLinkedTagNameRanges(element);
  if (ranges.length !== 2) {
    // Void elements don't have linked ranges
    return null;
  }

  return {
    ranges,
    // Word pattern for valid tag names (letters, digits, hyphens)
    wordPattern: '[-\\w]+',
  };
}

/**
 * Checks if the position is on the tag name (opening or closing).
 */
function isOnTagName(element: TmplAstElement, position: number): boolean {
  return isOnOpeningTagName(element, position) || isOnClosingTagName(element, position);
}

/**
 * Checks if the position is on the opening tag name.
 */
function isOnOpeningTagName(element: TmplAstElement, position: number): boolean {
  const tagStart = element.startSourceSpan.start.offset + 1; // Skip '<'
  const tagEnd = tagStart + element.name.length;
  return position >= tagStart && position <= tagEnd;
}

/**
 * Checks if the position is on the closing tag name.
 */
function isOnClosingTagName(element: TmplAstElement, position: number): boolean {
  if (!element.endSourceSpan) {
    return false;
  }
  const tagStart = element.endSourceSpan.start.offset + 2; // Skip '</'
  const tagEnd = tagStart + element.name.length;
  return position >= tagStart && position <= tagEnd;
}

/**
 * Gets the text spans for both the opening and closing tag names.
 * The spans use absolute offsets that are already correct for the source file.
 */
function getLinkedTagNameRanges(element: TmplAstElement): tss.TextSpan[] {
  const ranges: tss.TextSpan[] = [];

  // Opening tag: <tagname ...>
  const openStart = element.startSourceSpan.start.offset + 1; // Skip '<'
  ranges.push({
    start: openStart,
    length: element.name.length,
  });

  // Closing tag: </tagname>
  if (element.endSourceSpan) {
    const closeStart = element.endSourceSpan.start.offset + 2; // Skip '</'
    ranges.push({
      start: closeStart,
      length: element.name.length,
    });
  }

  return ranges;
}
