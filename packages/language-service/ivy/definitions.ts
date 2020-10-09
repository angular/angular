/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, TmplAstNode, TmplAstTextAttribute} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {DirectiveSymbol, DomBindingSymbol, ElementSymbol, ShimLocation, Symbol, SymbolKind, TemplateSymbol} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript';

import {findNodeAtPosition} from './hybrid_visitor';
import {flatMap, getDirectiveMatchesForAttribute, getDirectiveMatchesForElementTag, getTemplateInfoAtPosition, getTextSpanOfNode, isDollarEvent, TemplateInfo, toTextSpan} from './utils';

interface DefinitionMeta {
  node: AST|TmplAstNode;
  symbol: Symbol;
}

interface HasShimLocation {
  shimLocation: ShimLocation;
}

export class DefinitionBuilder {
  constructor(private readonly tsLS: ts.LanguageService, private readonly compiler: NgCompiler) {}

  getDefinitionAndBoundSpan(fileName: string, position: number): ts.DefinitionInfoAndBoundSpan
      |undefined {
    const templateInfo = getTemplateInfoAtPosition(fileName, position, this.compiler);
    if (templateInfo === undefined) {
      return;
    }
    const definitionMeta = this.getDefinitionMetaAtPosition(templateInfo, position);
    // The `$event` of event handlers would point to the $event parameter in the shim file, as in
    // `_outputHelper(_t3["x"]).subscribe(function ($event): any { $event }) ;`
    // If we wanted to return something for this, it would be more appropriate for something like
    // `getTypeDefinition`.
    if (definitionMeta === undefined || isDollarEvent(definitionMeta.node)) {
      return undefined;
    }

    const definitions = this.getDefinitionsForSymbol(definitionMeta.symbol, definitionMeta.node);
    return {definitions, textSpan: getTextSpanOfNode(definitionMeta.node)};
  }

  private getDefinitionsForSymbol(symbol: Symbol, node: TmplAstNode|AST):
      readonly ts.DefinitionInfo[]|undefined {
    switch (symbol.kind) {
      case SymbolKind.Directive:
      case SymbolKind.Element:
      case SymbolKind.Template:
      case SymbolKind.DomBinding:
        // Though it is generally more appropriate for the above symbol definitions to be
        // associated with "type definitions" since the location in the template is the
        // actual definition location, the better user experience would be to allow
        // LS users to "go to definition" on an item in the template that maps to a class and be
        // taken to the directive or HTML class.
        return this.getTypeDefinitionsForTemplateInstance(symbol, node);
      case SymbolKind.Input:
      case SymbolKind.Output:
        return this.getDefinitionsForSymbols(...symbol.bindings);
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
          definitions.push(...this.getDefinitionsForSymbols(symbol));
        }
        return definitions;
      }
      case SymbolKind.Expression: {
        return this.getDefinitionsForSymbols(symbol);
      }
    }
  }

  private getDefinitionsForSymbols(...symbols: HasShimLocation[]): ts.DefinitionInfo[] {
    return flatMap(symbols, ({shimLocation}) => {
      const {shimPath, positionInShimFile} = shimLocation;
      return this.tsLS.getDefinitionAtPosition(shimPath, positionInShimFile) ?? [];
    });
  }

  getTypeDefinitionsAtPosition(fileName: string, position: number):
      readonly ts.DefinitionInfo[]|undefined {
    const templateInfo = getTemplateInfoAtPosition(fileName, position, this.compiler);
    if (templateInfo === undefined) {
      return;
    }
    const definitionMeta = this.getDefinitionMetaAtPosition(templateInfo, position);
    if (definitionMeta === undefined) {
      return undefined;
    }

    const {symbol, node} = definitionMeta;
    switch (symbol.kind) {
      case SymbolKind.Directive:
      case SymbolKind.DomBinding:
      case SymbolKind.Element:
      case SymbolKind.Template:
        return this.getTypeDefinitionsForTemplateInstance(symbol, node);
      case SymbolKind.Output:
      case SymbolKind.Input:
        return this.getTypeDefinitionsForSymbols(...symbol.bindings);
      case SymbolKind.Reference:
      case SymbolKind.Expression:
      case SymbolKind.Variable:
        return this.getTypeDefinitionsForSymbols(symbol);
    }
  }

  private getTypeDefinitionsForTemplateInstance(
      symbol: TemplateSymbol|ElementSymbol|DomBindingSymbol|DirectiveSymbol,
      node: AST|TmplAstNode): ts.DefinitionInfo[] {
    switch (symbol.kind) {
      case SymbolKind.Template: {
        const matches = getDirectiveMatchesForElementTag(symbol.templateNode, symbol.directives);
        return this.getTypeDefinitionsForSymbols(...matches);
      }
      case SymbolKind.Element: {
        const matches = getDirectiveMatchesForElementTag(symbol.templateNode, symbol.directives);
        // If one of the directive matches is a component, we should not include the native element
        // in the results because it is replaced by the component.
        return Array.from(matches).some(dir => dir.isComponent) ?
            this.getTypeDefinitionsForSymbols(...matches) :
            this.getTypeDefinitionsForSymbols(...matches, symbol);
      }
      case SymbolKind.DomBinding: {
        if (!(node instanceof TmplAstTextAttribute)) {
          return [];
        }
        const dirs = getDirectiveMatchesForAttribute(
            node.name, symbol.host.templateNode, symbol.host.directives);
        return this.getTypeDefinitionsForSymbols(...dirs);
      }
      case SymbolKind.Directive:
        return this.getTypeDefinitionsForSymbols(symbol);
    }
  }

  private getTypeDefinitionsForSymbols(...symbols: HasShimLocation[]): ts.DefinitionInfo[] {
    return flatMap(symbols, ({shimLocation}) => {
      const {shimPath, positionInShimFile} = shimLocation;
      return this.tsLS.getTypeDefinitionAtPosition(shimPath, positionInShimFile) ?? [];
    });
  }

  private getDefinitionMetaAtPosition({template, component}: TemplateInfo, position: number):
      DefinitionMeta|undefined {
    const node = findNodeAtPosition(template, position);
    if (node === undefined) {
      return;
    }

    const symbol = this.compiler.getTemplateTypeChecker().getSymbolOfNode(node, component);
    if (symbol === null) {
      return;
    }
    return {node, symbol};
  }
}
