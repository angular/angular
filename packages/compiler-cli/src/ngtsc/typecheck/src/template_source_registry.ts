/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan, ParseLocation, ParseSourceFile, ParseSourceSpan} from '@angular/compiler';
import * as ts from 'typescript';
import {ClassDeclaration, isNamedClassDeclaration} from '../../reflection';
import {TemplateSourceMapping, TemplateSourceRegistry} from '../../typecheck/api';

const LF_CHAR = 10;
const CR_CHAR = 13;
const LINE_SEP_CHAR = 8232;
const PARAGRAPH_CHAR = 8233;

/** Gets the line and character for the given position from the line starts map. */
function getLineAndCharacterFromPosition(lineStartsMap: number[], position: number) {
  const lineIndex = findClosestLineStartPosition(lineStartsMap, position);
  return {character: position - lineStartsMap[lineIndex], line: lineIndex};
}

/**
 * Computes the line start map of the given text. This can be used in order to
 * retrieve the line and character of a given text position index.
 */
function computeLineStartsMap(text: string): number[] {
  const result: number[] = [0];
  let pos = 0;
  while (pos < text.length) {
    const char = text.charCodeAt(pos++);
    // Handles the "CRLF" line break. In that case we peek the character
    // after the "CR" and check if it is a line feed.
    if (char === CR_CHAR) {
      if (text.charCodeAt(pos) === LF_CHAR) {
        pos++;
      }
      result.push(pos);
    } else if (char === LF_CHAR || char === LINE_SEP_CHAR || char === PARAGRAPH_CHAR) {
      result.push(pos);
    }
  }
  result.push(pos);
  return result;
}

/** Finds the closest line start for the given position. */
function findClosestLineStartPosition<T>(
    linesMap: T[], position: T, low = 0, high = linesMap.length - 1) {
  while (low <= high) {
    const pivotIdx = Math.floor((low + high) / 2);
    const pivotEl = linesMap[pivotIdx];

    if (pivotEl === position) {
      return pivotIdx;
    } else if (position > pivotEl) {
      low = pivotIdx + 1;
    } else {
      high = pivotIdx - 1;
    }
  }

  // In case there was no exact match, return the closest "lower" line index. We also
  // subtract the index by one because want the index of the previous line start.
  return low - 1;
}


/**
 * Represents the source of a template that was processed during type-checking. This information is
 * used when translating parse offsets in diagnostics back to their original line/column location.
 */
export class TemplateSource {
  private lineStarts: number[]|null = null;

  constructor(readonly mapping: TemplateSourceMapping, private file: ParseSourceFile) {}

  toParseSourceSpan(start: number, end: number): ParseSourceSpan {
    const startLoc = this.toParseLocation(start);
    const endLoc = this.toParseLocation(end);
    return new ParseSourceSpan(startLoc, endLoc);
  }

  private toParseLocation(position: number) {
    const lineStarts = this.acquireLineStarts();
    const {line, character} = getLineAndCharacterFromPosition(lineStarts, position);
    return new ParseLocation(this.file, position, line, character);
  }

  private acquireLineStarts(): number[] {
    if (this.lineStarts === null) {
      this.lineStarts = computeLineStartsMap(this.file.content);
    }
    return this.lineStarts;
  }
}


export class TemplateSourceRegistryImpl implements TemplateSourceRegistry {
  /**
   * This map keeps track of all template sources that have been type-checked by the id that is
   * attached to a TCB's function declaration as leading trivia. This enables translation of
   * diagnostics produced for TCB code to their source location in the template.
   */
  private templateSources = new Map<ClassDeclaration, TemplateSource>();

  captureSource(node: ClassDeclaration, mapping: TemplateSourceMapping, file: ParseSourceFile):
      ClassDeclaration {
    this.templateSources.set(node, new TemplateSource(mapping, file));
    return node;
  }

  getSourceMapping(node: ts.ClassDeclaration): TemplateSourceMapping|null {
    if (!isNamedClassDeclaration(node)) {
      return null;
    }
    if (!this.templateSources.has(node)) {
      return null;
    }
    return this.templateSources.get(node)!.mapping;
  }

  getSourceMappingOrThrow(node: ts.ClassDeclaration): TemplateSourceMapping {
    const sourceMapping = this.getSourceMapping(node);
    if (!sourceMapping) {
      throw new Error(`Unexpected unknown template class node: ${node.name}`);
    }
    return sourceMapping;
  }

  toParseSourceSpan(node: ts.ClassDeclaration, span: AbsoluteSourceSpan): ParseSourceSpan|null {
    if (!isNamedClassDeclaration(node)) {
      return null;
    }
    if (!this.templateSources.has(node)) {
      return null;
    }
    const templateSource = this.templateSources.get(node)!;
    return templateSource.toParseSourceSpan(span.start, span.end);
  }
}
