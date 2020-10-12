/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgAnalyzedModules} from '@angular/compiler';
import * as ts from 'typescript';

import {locateSymbols} from './locate_symbol';
import * as ng from './types';
import {inSpan} from './utils';

/**
 * Traverse the template AST and look for the symbol located at `position`, then
 * return the corresponding quick info.
 * @param info template AST
 * @param position location of the symbol
 * @param analyzedModules all NgModules in the program.
 */
export function getTemplateHover(
    info: ng.AstResult, position: number, analyzedModules: NgAnalyzedModules): ts.QuickInfo|
    undefined {
  const symbolInfo = locateSymbols(info, position)[0];
  if (!symbolInfo) {
    return;
  }
  const {symbol, span, staticSymbol} = symbolInfo;

  // The container is either the symbol's container (for example, 'AppComponent'
  // is the container of the symbol 'title' in its template) or the NgModule
  // that the directive belongs to (the container of AppComponent is AppModule).
  let containerName: string|undefined = symbol.container?.name;
  if (!containerName && staticSymbol) {
    // If there is a static symbol then the target is a directive.
    const ngModule = analyzedModules.ngModuleByPipeOrDirective.get(staticSymbol);
    containerName = ngModule?.type.reference.name;
  }

  return createQuickInfo(
      symbol.name, symbol.kind, span, containerName, symbol.type?.name, symbol.documentation);
}

/**
 * Get quick info for Angular semantic entities in TypeScript files, like Directives.
 * @param position location of the symbol in the source file
 * @param declarations All Directive-like declarations in the source file.
 * @param analyzedModules all NgModules in the program.
 */
export function getTsHover(
    position: number, declarations: ng.Declaration[],
    analyzedModules: NgAnalyzedModules): ts.QuickInfo|undefined {
  for (const {declarationSpan, metadata} of declarations) {
    if (inSpan(position, declarationSpan)) {
      const staticSymbol: ng.StaticSymbol = metadata.type.reference;
      const directiveName = staticSymbol.name;
      const kind = metadata.isComponent ? 'component' : 'directive';
      const textSpan = ts.createTextSpanFromBounds(declarationSpan.start, declarationSpan.end);
      const ngModule = analyzedModules.ngModuleByPipeOrDirective.get(staticSymbol);
      const moduleName = ngModule?.type.reference.name;
      return createQuickInfo(
          directiveName, kind, textSpan, moduleName, ts.ScriptElementKind.classElement);
    }
  }
}



// Reverse mappings of enum would generate strings
const ALIAS_NAME = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.aliasName];
const SYMBOL_INTERFACE = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.interfaceName];
const SYMBOL_PUNC = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.punctuation];
const SYMBOL_SPACE = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.space];
const SYMBOL_TEXT = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.text];

/**
 * Construct a QuickInfo object taking into account its container and type.
 * @param name Name of the QuickInfo target
 * @param kind component, directive, pipe, etc.
 * @param textSpan span of the target
 * @param containerName either the Symbol's container or the NgModule that contains the directive
 * @param type user-friendly name of the type
 * @param documentation docstring or comment
 */
function createQuickInfo(
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
