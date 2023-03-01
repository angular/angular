/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan, ParseLocation, ParseSourceFile, ParseSourceSpan} from '@angular/compiler';
import ts from 'typescript';

import {TemplateId, TemplateSourceMapping} from '../api';
import {getTemplateId} from '../diagnostics';

import {computeLineStartsMap, getLineAndCharacterFromPosition} from './line_mappings';
import {TemplateSourceResolver} from './tcb_util';

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
 * Implements `TemplateSourceResolver` to resolve the source of a template based on these IDs.
 */
export class TemplateSourceManager implements TemplateSourceResolver {
  /**
   * This map keeps track of all template sources that have been type-checked by the id that is
   * attached to a TCB's function declaration as leading trivia. This enables translation of
   * diagnostics produced for TCB code to their source location in the template.
   */
  private templateSources = new Map<TemplateId, TemplateSource>();

  getTemplateId(node: ts.ClassDeclaration): TemplateId {
    return getTemplateId(node);
  }

  captureSource(node: ts.ClassDeclaration, mapping: TemplateSourceMapping, file: ParseSourceFile):
      TemplateId {
    const id = getTemplateId(node);
    this.templateSources.set(id, new TemplateSource(mapping, file));
    return id;
  }

  getSourceMapping(id: TemplateId): TemplateSourceMapping {
    if (!this.templateSources.has(id)) {
      throw new Error(`Unexpected unknown template ID: ${id}`);
    }
    return this.templateSources.get(id)!.mapping;
  }

  toParseSourceSpan(id: TemplateId, span: AbsoluteSourceSpan): ParseSourceSpan|null {
    if (!this.templateSources.has(id)) {
      return null;
    }
    const templateSource = this.templateSources.get(id)!;
    return templateSource.toParseSourceSpan(span.start, span.end);
  }
}
