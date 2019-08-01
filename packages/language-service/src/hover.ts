/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {TemplateInfo} from './common';
import {locateSymbol} from './locate_symbol';

// Reverse mappings of enum would generate strings
const SYMBOL_SPACE = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.space];
const SYMBOL_PUNC = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.punctuation];

export function getHover(info: TemplateInfo): ts.QuickInfo|undefined {
  const symbolInfo = locateSymbol(info);
  if (!symbolInfo) {
    return;
  }
  const {symbol, span} = symbolInfo;
  const containerDisplayParts: ts.SymbolDisplayPart[] = symbol.container ?
      [
        {text: symbol.container.name, kind: symbol.container.kind},
        {text: '.', kind: SYMBOL_PUNC},
      ] :
      [];
  return {
    kind: symbol.kind as ts.ScriptElementKind,
    kindModifiers: '',  // kindModifier info not available on 'ng.Symbol'
    textSpan: {
      start: span.start,
      length: span.end - span.start,
    },
    // this would generate a string like '(property) ClassX.propY'
    // 'kind' in displayParts does not really matter because it's dropped when
    // displayParts get converted to string.
    displayParts: [
      {text: '(', kind: SYMBOL_PUNC}, {text: symbol.kind, kind: symbol.kind},
      {text: ')', kind: SYMBOL_PUNC}, {text: ' ', kind: SYMBOL_SPACE}, ...containerDisplayParts,
      {text: symbol.name, kind: symbol.kind},
      // TODO: Append type info as well, but Symbol doesn't expose that!
      // Ideally hover text should be like '(property) ClassX.propY: string'
    ],
  };
}
