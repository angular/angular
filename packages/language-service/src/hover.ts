/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgAnalyzedModules} from '@angular/compiler';
import * as ts from 'typescript';

import {createQuickInfo} from '../common/quick_info';

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
