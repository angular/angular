/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {AstResult} from './common';
import {locateSymbol} from './locate_symbol';
import {TypeScriptServiceHost} from './typescript_host';
import {findTightestNode} from './utils';

// Reverse mappings of enum would generate strings
const SYMBOL_SPACE = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.space];
const SYMBOL_PUNC = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.punctuation];
const SYMBOL_CLASS = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.className];
const SYMBOL_TEXT = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.text];

/**
 * Traverse the template AST and look for the symbol located at `position`, then
 * return the corresponding quick info.
 * @param info template AST
 * @param position location of the symbol
 */
export function getHover(info: AstResult, position: number): ts.QuickInfo|undefined {
  const symbolInfo = locateSymbol(info, position);
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

/**
 * Get quick info for Angular semantic entities in TypeScript files, like Directives.
 * @param sf TypeScript source file an Angular symbol is in
 * @param position location of the symbol in the source file
 * @param host Language Service host to query
 */
export function getTsHover(
    sf: ts.SourceFile, position: number, host: Readonly<TypeScriptServiceHost>): ts.QuickInfo|
    undefined {
  const node = findTightestNode(sf, position);
  if (!node) return;
  switch (node.kind) {
    case ts.SyntaxKind.Identifier:
      return getDirectiveModule(node as ts.Identifier, host);
    default:
      break;
  }
  return undefined;
}

/**
 * Attempts to get quick info for the NgModule a Directive is declared in.
 * @param directive identifier on a potential Directive class declaration
 * @param host Language Service host to query
 */
function getDirectiveModule(
    directive: ts.Identifier, host: Readonly<TypeScriptServiceHost>): ts.QuickInfo|undefined {
  if (!ts.isClassDeclaration(directive.parent)) return;
  const directiveName = directive.text;
  const directiveSymbol = host.getStaticSymbol(directive.getSourceFile().fileName, directiveName);
  if (!directiveSymbol) return;

  const ngModule = host.getAnalyzedModules().ngModuleByPipeOrDirective.get(directiveSymbol);
  if (!ngModule) return;

  const moduleName = ngModule.type.reference.name;
  return {
    kind: ts.ScriptElementKind.classElement,
    kindModifiers:
        ts.ScriptElementKindModifier.none,  // kindModifier info not available on 'ng.Symbol'
    textSpan: {
      start: directive.getStart(),
      length: directive.end - directive.getStart(),
    },
    // This generates a string like '(directive) NgModule.Directive: class'
    // 'kind' in displayParts does not really matter because it's dropped when
    // displayParts get converted to string.
    displayParts: [
      {text: '(', kind: SYMBOL_PUNC},
      {text: 'directive', kind: SYMBOL_TEXT},
      {text: ')', kind: SYMBOL_PUNC},
      {text: ' ', kind: SYMBOL_SPACE},
      {text: moduleName, kind: SYMBOL_CLASS},
      {text: '.', kind: SYMBOL_PUNC},
      {text: directiveName, kind: SYMBOL_CLASS},
      {text: ':', kind: SYMBOL_PUNC},
      {text: ' ', kind: SYMBOL_SPACE},
      {text: ts.ScriptElementKind.classElement, kind: SYMBOL_TEXT},
    ],
  };
}
