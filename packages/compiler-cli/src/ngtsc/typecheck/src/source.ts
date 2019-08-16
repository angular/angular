/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseLocation, ParseSourceFile, ParseSourceSpan} from '@angular/compiler';

import {TemplateSourceMapping} from './api';
import {SourceLocation, TcbSourceResolver} from './diagnostics';
import {computeLineStartsMap, getLineAndCharacterFromPosition} from './line_mappings';

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

/**
 * Assigns IDs to templates and keeps track of their origins.
 *
 * Implements `TcbSourceResolver` to resolve the source of a template based on these IDs.
 */
export class TcbSourceManager implements TcbSourceResolver {
  private nextTcbId: number = 1;
  /**
   * This map keeps track of all template sources that have been type-checked by the id that is
   * attached to a TCB's function declaration as leading trivia. This enables translation of
   * diagnostics produced for TCB code to their source location in the template.
   */
  private templateSources = new Map<string, TemplateSource>();

  captureSource(mapping: TemplateSourceMapping, file: ParseSourceFile): string {
    const id = `tcb${this.nextTcbId++}`;
    this.templateSources.set(id, new TemplateSource(mapping, file));
    return id;
  }

  getSourceMapping(id: string): TemplateSourceMapping {
    if (!this.templateSources.has(id)) {
      throw new Error(`Unexpected unknown TCB ID: ${id}`);
    }
    return this.templateSources.get(id) !.mapping;
  }

  sourceLocationToSpan(location: SourceLocation): ParseSourceSpan|null {
    if (!this.templateSources.has(location.id)) {
      return null;
    }
    const templateSource = this.templateSources.get(location.id) !;
    return templateSource.toParseSourceSpan(location.start, location.end);
  }
}
