/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript'; // used as value and is provided at runtime
import {TemplateInfo} from './common';
import {locateSymbol} from './locate_symbol';
import {Span} from './types';

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

export function getDefinitionAndBoundSpan(info: TemplateInfo): ts.DefinitionInfoAndBoundSpan|
    undefined {
  const symbolInfo = locateSymbol(info);
  if (!symbolInfo) {
    return;
  }
  const textSpan = ngSpanToTsTextSpan(symbolInfo.span);
  const {symbol} = symbolInfo;
  const {container, definition: locations} = symbol;
  if (!locations || !locations.length) {
    // symbol.definition is really the locations of the symbol. There could be
    // more than one. No meaningful info could be provided without any location.
    return {textSpan};
  }
  const containerKind = container ? container.kind : ts.ScriptElementKind.unknown;
  const containerName = container ? container.name : '';
  const definitions = locations.map((location) => {
    return {
      kind: symbol.kind as ts.ScriptElementKind,
      name: symbol.name,
      containerKind: containerKind as ts.ScriptElementKind,
      containerName: containerName,
      textSpan: ngSpanToTsTextSpan(location.span),
      fileName: location.fileName,
    };
  });
  return {
      definitions, textSpan,
  };
}
