/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AbsoluteSourceSpan,
  ParseLocation,
  ParseSourceFile,
  ParseSourceSpan,
} from '@angular/compiler';
import ts from 'typescript';

import {TypeCheckId, SourceMapping} from '../api';
import {getTypeCheckId} from '../diagnostics';

import {computeLineStartsMap, getLineAndCharacterFromPosition} from './line_mappings';
import {TypeCheckSourceResolver} from './tcb_util';

/**
 * Represents the source of code processed during type-checking. This information is used when
 * translating parse offsets in diagnostics back to their original line/column location.
 */
class Source {
  private lineStarts: number[] | null = null;

  constructor(
    readonly mapping: SourceMapping,
    private file: ParseSourceFile,
  ) {}

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
 * Assigns IDs for type checking and keeps track of their origins.
 *
 * Implements `TypeCheckSourceResolver` to resolve the source of a template based on these IDs.
 */
export class DirectiveSourceManager implements TypeCheckSourceResolver {
  /**
   * This map keeps track of all template sources that have been type-checked by the id that is
   * attached to a TCB's function declaration as leading trivia. This enables translation of
   * diagnostics produced for TCB code to their source location in the template.
   */
  private templateSources = new Map<TypeCheckId, Source>();

  /** Keeps track of type check IDs and the source location of their host bindings. */
  private hostBindingSources = new Map<TypeCheckId, Source>();

  getTypeCheckId(node: ts.ClassDeclaration): TypeCheckId {
    return getTypeCheckId(node);
  }

  captureTemplateSource(id: TypeCheckId, mapping: SourceMapping, file: ParseSourceFile): void {
    this.templateSources.set(id, new Source(mapping, file));
  }

  captureHostBindingsMapping(id: TypeCheckId, mapping: SourceMapping, file: ParseSourceFile): void {
    this.hostBindingSources.set(id, new Source(mapping, file));
  }

  getTemplateSourceMapping(id: TypeCheckId): SourceMapping {
    if (!this.templateSources.has(id)) {
      throw new Error(`Unexpected unknown type check ID: ${id}`);
    }
    return this.templateSources.get(id)!.mapping;
  }

  getHostBindingsMapping(id: TypeCheckId): SourceMapping {
    if (!this.hostBindingSources.has(id)) {
      throw new Error(`Unexpected unknown type check ID: ${id}`);
    }
    return this.hostBindingSources.get(id)!.mapping;
  }

  toTemplateParseSourceSpan(id: TypeCheckId, span: AbsoluteSourceSpan): ParseSourceSpan | null {
    if (!this.templateSources.has(id)) {
      return null;
    }
    const templateSource = this.templateSources.get(id)!;
    return templateSource.toParseSourceSpan(span.start, span.end);
  }

  toHostParseSourceSpan(id: TypeCheckId, span: AbsoluteSourceSpan): ParseSourceSpan | null {
    if (!this.hostBindingSources.has(id)) {
      return null;
    }
    const source = this.hostBindingSources.get(id)!;
    return source.toParseSourceSpan(span.start, span.end);
  }
}
