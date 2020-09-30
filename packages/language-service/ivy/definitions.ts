/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, TmplAstNode} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {ShimLocation, Symbol, SymbolKind} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript';

import {findNodeAtPosition} from './hybrid_visitor';
import {getTemplateInfoAtPosition, getTextSpanOfNode, isDollarEvent, toTextSpan} from './utils';

export class DefinitionBuilder {
  constructor(private readonly tsLS: ts.LanguageService, private readonly compiler: NgCompiler) {}

  // TODO(atscott): getTypeDefinitionAtPosition

  getDefinitionAndBoundSpan(fileName: string, position: number): ts.DefinitionInfoAndBoundSpan
      |undefined {
    const templateInfo = getTemplateInfoAtPosition(fileName, position, this.compiler);
    if (templateInfo === undefined) {
      return undefined;
    }
    const {template, component} = templateInfo;

    const node = findNodeAtPosition(template, position);
    // The `$event` of event handlers would point to the $event parameter in the shim file, as in
    // `_outputHelper(_t3["x"]).subscribe(function ($event): any { $event }) ;`
    // If we wanted to return something for this, it would be more appropriate for something like
    // `getTypeDefinition`.
    if (node === undefined || isDollarEvent(node)) {
      return undefined;
    }

    const symbol = this.compiler.getTemplateTypeChecker().getSymbolOfNode(node, component);
    if (symbol === null) {
      return undefined;
    }

    const definitions = this.getDefinitionsForSymbol(symbol, node);
    return {definitions, textSpan: getTextSpanOfNode(node)};
  }

  private getDefinitionsForSymbol(symbol: Symbol, node: TmplAstNode|AST):
      readonly ts.DefinitionInfo[]|undefined {
    switch (symbol.kind) {
      case SymbolKind.Directive:
      case SymbolKind.Element:
      case SymbolKind.Template:
      case SymbolKind.DomBinding:
        // `Template` and `Element` types should not return anything because their "definitions" are
        // the template locations themselves. Instead, `getTypeDefinitionAtPosition` should return
        // the directive class / native element interface. `Directive` would have similar reasoning,
        // though the `TemplateTypeChecker` only returns it as a list on `DomBinding`, `Element`, or
        // `Template` so it's really only here for switch case completeness (it wouldn't ever appear
        // here).
        //
        // `DomBinding` also does not return anything because the value assignment is internal to
        // the TCB. Again, `getTypeDefinitionAtPosition` could return a possible directive the
        // attribute binds to or the property in the native interface.
        return [];
      case SymbolKind.Input:
      case SymbolKind.Output:
        return this.getDefinitionsForSymbols(symbol.bindings);
      case SymbolKind.Variable:
      case SymbolKind.Reference: {
        const definitions: ts.DefinitionInfo[] = [];
        if (symbol.declaration !== node) {
          definitions.push({
            name: symbol.declaration.name,
            containerName: '',
            containerKind: ts.ScriptElementKind.unknown,
            kind: ts.ScriptElementKind.variableElement,
            textSpan: getTextSpanOfNode(symbol.declaration),
            contextSpan: toTextSpan(symbol.declaration.sourceSpan),
            fileName: symbol.declaration.sourceSpan.start.file.url,
          });
        }
        if (symbol.kind === SymbolKind.Variable) {
          definitions.push(...this.getDefinitionInfos(symbol.shimLocation));
        }
        return definitions;
      }
      case SymbolKind.Expression: {
        const {shimLocation} = symbol;
        return this.getDefinitionInfos(shimLocation);
      }
    }
  }

  private getDefinitionsForSymbols(symbols: {shimLocation: ShimLocation}[]) {
    const definitions: ts.DefinitionInfo[] = [];
    for (const {shimLocation} of symbols) {
      definitions.push(...this.getDefinitionInfos(shimLocation));
    }
    return definitions;
  }

  private getDefinitionInfos({shimPath, positionInShimFile}: ShimLocation):
      readonly ts.DefinitionInfo[] {
    return this.tsLS.getDefinitionAtPosition(shimPath, positionInShimFile) ?? [];
  }
}
