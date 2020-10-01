/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

// Reverse mappings of enum would generate strings
export const ALIAS_NAME = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.aliasName];
export const SYMBOL_INTERFACE = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.interfaceName];
export const SYMBOL_PUNC = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.punctuation];
export const SYMBOL_SPACE = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.space];
export const SYMBOL_TEXT = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.text];

/**
 * Construct a QuickInfo object taking into account its container and type.
 * @param name Name of the QuickInfo target
 * @param kind component, directive, pipe, etc.
 * @param textSpan span of the target
 * @param containerName either the Symbol's container or the NgModule that contains the directive
 * @param type user-friendly name of the type
 * @param documentation docstring or comment
 */
export function createQuickInfo(
    name: string, kind: string, textSpan: ts.TextSpan, containerName?: string, type?: string,
    documentation?: ts.SymbolDisplayPart[]): ts.QuickInfo {
  const containerDisplayParts = containerName ?
      [
        {text: containerName, kind: SYMBOL_INTERFACE},
        {text: '.', kind: SYMBOL_PUNC},
      ] :
      [];

  const typeDisplayParts = type ?
      [
        {text: ':', kind: SYMBOL_PUNC},
        {text: ' ', kind: SYMBOL_SPACE},
        {text: type, kind: SYMBOL_INTERFACE},
      ] :
      [];

  return {
    kind: kind as ts.ScriptElementKind,
    kindModifiers: ts.ScriptElementKindModifier.none,
    textSpan: textSpan,
    displayParts: [
      {text: '(', kind: SYMBOL_PUNC},
      {text: kind, kind: SYMBOL_TEXT},
      {text: ')', kind: SYMBOL_PUNC},
      {text: ' ', kind: SYMBOL_SPACE},
      ...containerDisplayParts,
      {text: name, kind: SYMBOL_INTERFACE},
      ...typeDisplayParts,
    ],
    documentation,
  };
}
