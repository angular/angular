/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';  // used as value and is provided at runtime

import {locateSymbols} from './locate_symbol';
import {AstResult, Span} from './types';

/**
 * Convert Angular Span to TypeScript TextSpan. Angular Span has 'start' and
 * 'end' whereas TS TextSpan has 'start' and 'length'.
 * @param span Angular Span
 */
function ngSpanToTsTextSpan(span: Span): ts.TextSpan {
  return {
    start: span.start,
    length: span.end - span.start,
  };
}

/**
 * Traverse the template AST and look for the symbol located at `position`, then
 * return its definition and span of bound text.
 * @param info
 * @param position
 */
export function getDefinitionAndBoundSpan(
    info: AstResult, position: number): ts.DefinitionInfoAndBoundSpan|undefined {
  const symbols = locateSymbols(info, position);
  if (!symbols.length) {
    return;
  }

  const seen = new Set<string>();
  const definitions: ts.DefinitionInfo[] = [];
  for (const symbolInfo of symbols) {
    const {symbol} = symbolInfo;

    // symbol.definition is really the locations of the symbol. There could be
    // more than one. No meaningful info could be provided without any location.
    const {kind, name, container, definition: locations} = symbol;
    if (!locations || !locations.length) {
      continue;
    }

    const containerKind =
        container ? container.kind as ts.ScriptElementKind : ts.ScriptElementKind.unknown;
    const containerName = container ? container.name : '';

    for (const {fileName, span} of locations) {
      const textSpan = ngSpanToTsTextSpan(span);
      // In cases like two-way bindings, a request for the definitions of an expression may return
      // two of the same definition:
      //    [(ngModel)]="prop"
      //                 ^^^^  -- one definition for the property binding, one for the event binding
      // To prune duplicate definitions, tag definitions with unique location signatures and ignore
      // definitions whose locations have already been seen.
      const signature = `${textSpan.start}:${textSpan.length}@${fileName}`;
      if (seen.has(signature)) continue;

      definitions.push({
        kind: kind as ts.ScriptElementKind,
        name,
        containerKind,
        containerName,
        textSpan: ngSpanToTsTextSpan(span),
        fileName: fileName,
      });
      seen.add(signature);
    }
  }

  return {
    definitions,
    textSpan: symbols[0].span,
  };
}
