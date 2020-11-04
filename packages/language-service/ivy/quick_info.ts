/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AST, ImplicitReceiver, MethodCall, ThisReceiver, TmplAstBoundAttribute, TmplAstNode, TmplAstTextAttribute} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {DirectiveSymbol, DomBindingSymbol, ElementSymbol, InputBindingSymbol, OutputBindingSymbol, PipeSymbol, ReferenceSymbol, ShimLocation, Symbol, SymbolKind, VariableSymbol} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript';

import {createDisplayParts, DisplayInfoKind, SYMBOL_PUNC, SYMBOL_SPACE, SYMBOL_TEXT, unsafeCastDisplayInfoKindToScriptElementKind} from './display_parts';
import {filterAliasImports, getDirectiveMatchesForAttribute, getDirectiveMatchesForElementTag, getTextSpanOfNode} from './utils';

export class QuickInfoBuilder {
  private readonly typeChecker = this.compiler.getNextProgram().getTypeChecker();

  constructor(
      private readonly tsLS: ts.LanguageService, private readonly compiler: NgCompiler,
      private readonly component: ts.ClassDeclaration, private node: TmplAstNode|AST) {}

  get(): ts.QuickInfo|undefined {
    const symbol =
        this.compiler.getTemplateTypeChecker().getSymbolOfNode(this.node, this.component);
    if (symbol === null) {
      return isDollarAny(this.node) ? createDollarAnyQuickInfo(this.node) : undefined;
    }

    return this.getQuickInfoForSymbol(symbol);
  }

  private getQuickInfoForSymbol(symbol: Symbol): ts.QuickInfo|undefined {
    switch (symbol.kind) {
      case SymbolKind.Input:
      case SymbolKind.Output:
        return this.getQuickInfoForBindingSymbol(symbol);
      case SymbolKind.Template:
        return createNgTemplateQuickInfo(this.node);
      case SymbolKind.Element:
        return this.getQuickInfoForElementSymbol(symbol);
      case SymbolKind.Variable:
        return this.getQuickInfoForVariableSymbol(symbol);
      case SymbolKind.Reference:
        return this.getQuickInfoForReferenceSymbol(symbol);
      case SymbolKind.DomBinding:
        return this.getQuickInfoForDomBinding(symbol);
      case SymbolKind.Directive:
        return this.getQuickInfoAtShimLocation(symbol.shimLocation);
      case SymbolKind.Pipe:
        return this.getQuickInfoForPipeSymbol(symbol);
      case SymbolKind.Expression:
        return this.getQuickInfoAtShimLocation(symbol.shimLocation);
    }
  }

  private getQuickInfoForBindingSymbol(symbol: InputBindingSymbol|OutputBindingSymbol): ts.QuickInfo
      |undefined {
    if (symbol.bindings.length === 0) {
      return undefined;
    }

    const kind =
        symbol.kind === SymbolKind.Input ? DisplayInfoKind.PROPERTY : DisplayInfoKind.EVENT;

    const quickInfo = this.getQuickInfoAtShimLocation(symbol.bindings[0].shimLocation);
    return quickInfo === undefined ? undefined : updateQuickInfoKind(quickInfo, kind);
  }

  private getQuickInfoForElementSymbol(symbol: ElementSymbol): ts.QuickInfo {
    const {templateNode} = symbol;
    const matches = getDirectiveMatchesForElementTag(templateNode, symbol.directives);
    if (matches.size > 0) {
      return this.getQuickInfoForDirectiveSymbol(matches.values().next().value, templateNode);
    }

    return createQuickInfo(
        templateNode.name, DisplayInfoKind.ELEMENT, getTextSpanOfNode(templateNode),
        undefined /* containerName */, this.typeChecker.typeToString(symbol.tsType));
  }

  private getQuickInfoForVariableSymbol(symbol: VariableSymbol): ts.QuickInfo {
    const documentation = this.getDocumentationFromTypeDefAtLocation(symbol.initializerLocation);
    return createQuickInfo(
        symbol.declaration.name, DisplayInfoKind.VARIABLE, getTextSpanOfNode(this.node),
        undefined /* containerName */, this.typeChecker.typeToString(symbol.tsType), documentation);
  }

  private getQuickInfoForReferenceSymbol(symbol: ReferenceSymbol): ts.QuickInfo {
    const documentation = this.getDocumentationFromTypeDefAtLocation(symbol.targetLocation);
    return createQuickInfo(
        symbol.declaration.name, DisplayInfoKind.REFERENCE, getTextSpanOfNode(this.node),
        undefined /* containerName */, this.typeChecker.typeToString(symbol.tsType), documentation);
  }

  private getQuickInfoForPipeSymbol(symbol: PipeSymbol): ts.QuickInfo|undefined {
    if (symbol.tsSymbol !== null) {
      const quickInfo = this.getQuickInfoAtShimLocation(symbol.shimLocation);
      return quickInfo === undefined ? undefined :
                                       updateQuickInfoKind(quickInfo, DisplayInfoKind.PIPE);
    } else {
      return createQuickInfo(
          this.typeChecker.typeToString(symbol.classSymbol.tsType), DisplayInfoKind.PIPE,
          getTextSpanOfNode(this.node));
    }
  }

  private getQuickInfoForDomBinding(symbol: DomBindingSymbol) {
    if (!(this.node instanceof TmplAstTextAttribute) &&
        !(this.node instanceof TmplAstBoundAttribute)) {
      return undefined;
    }
    const directives = getDirectiveMatchesForAttribute(
        this.node.name, symbol.host.templateNode, symbol.host.directives);
    if (directives.size === 0) {
      return undefined;
    }

    return this.getQuickInfoForDirectiveSymbol(directives.values().next().value);
  }

  private getQuickInfoForDirectiveSymbol(dir: DirectiveSymbol, node: TmplAstNode|AST = this.node):
      ts.QuickInfo {
    const kind = dir.isComponent ? DisplayInfoKind.COMPONENT : DisplayInfoKind.DIRECTIVE;
    const documentation = this.getDocumentationFromTypeDefAtLocation(dir.shimLocation);
    let containerName: string|undefined;
    if (ts.isClassDeclaration(dir.tsSymbol.valueDeclaration) && dir.ngModule !== null) {
      containerName = dir.ngModule.name.getText();
    }

    return createQuickInfo(
        this.typeChecker.typeToString(dir.tsType), kind, getTextSpanOfNode(this.node),
        containerName, undefined, documentation);
  }

  private getDocumentationFromTypeDefAtLocation(shimLocation: ShimLocation):
      ts.SymbolDisplayPart[]|undefined {
    const typeDefs = this.tsLS.getTypeDefinitionAtPosition(
        shimLocation.shimPath, shimLocation.positionInShimFile);
    if (typeDefs === undefined || typeDefs.length === 0) {
      return undefined;
    }
    return this.tsLS.getQuickInfoAtPosition(typeDefs[0].fileName, typeDefs[0].textSpan.start)
        ?.documentation;
  }

  private getQuickInfoAtShimLocation(location: ShimLocation): ts.QuickInfo|undefined {
    const quickInfo =
        this.tsLS.getQuickInfoAtPosition(location.shimPath, location.positionInShimFile);
    if (quickInfo === undefined || quickInfo.displayParts === undefined) {
      return quickInfo;
    }

    quickInfo.displayParts = filterAliasImports(quickInfo.displayParts);

    const textSpan = getTextSpanOfNode(this.node);
    return {...quickInfo, textSpan};
  }
}

function updateQuickInfoKind(quickInfo: ts.QuickInfo, kind: DisplayInfoKind): ts.QuickInfo {
  if (quickInfo.displayParts === undefined) {
    return quickInfo;
  }

  const startsWithKind = quickInfo.displayParts.length >= 3 &&
      displayPartsEqual(quickInfo.displayParts[0], {text: '(', kind: SYMBOL_PUNC}) &&
      quickInfo.displayParts[1].kind === SYMBOL_TEXT &&
      displayPartsEqual(quickInfo.displayParts[2], {text: ')', kind: SYMBOL_PUNC});
  if (startsWithKind) {
    quickInfo.displayParts[1].text = kind;
  } else {
    quickInfo.displayParts = [
      {text: '(', kind: SYMBOL_PUNC},
      {text: kind, kind: SYMBOL_TEXT},
      {text: ')', kind: SYMBOL_PUNC},
      {text: ' ', kind: SYMBOL_SPACE},
      ...quickInfo.displayParts,
    ];
  }
  return quickInfo;
}

function displayPartsEqual(a: {text: string, kind: string}, b: {text: string, kind: string}) {
  return a.text === b.text && a.kind === b.kind;
}

function isDollarAny(node: TmplAstNode|AST): node is MethodCall {
  return node instanceof MethodCall && node.receiver instanceof ImplicitReceiver &&
      !(node.receiver instanceof ThisReceiver) && node.name === '$any' && node.args.length === 1;
}

function createDollarAnyQuickInfo(node: MethodCall): ts.QuickInfo {
  return createQuickInfo(
      '$any',
      DisplayInfoKind.METHOD,
      getTextSpanOfNode(node),
      /** containerName */ undefined,
      'any',
      [{
        kind: SYMBOL_TEXT,
        text: 'function to cast an expression to the `any` type',
      }],
  );
}

// TODO(atscott): Create special `ts.QuickInfo` for `ng-template` and `ng-container` as well.
function createNgTemplateQuickInfo(node: TmplAstNode|AST): ts.QuickInfo {
  return createQuickInfo(
      'ng-template',
      DisplayInfoKind.TEMPLATE,
      getTextSpanOfNode(node),
      /** containerName */ undefined,
      /** type */ undefined,
      [{
        kind: SYMBOL_TEXT,
        text:
            'The `<ng-template>` is an Angular element for rendering HTML. It is never displayed directly.',
      }],
  );
}

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
    name: string, kind: DisplayInfoKind, textSpan: ts.TextSpan, containerName?: string,
    type?: string, documentation?: ts.SymbolDisplayPart[]): ts.QuickInfo {
  const displayParts = createDisplayParts(name, kind, containerName, type);

  return {
    kind: unsafeCastDisplayInfoKindToScriptElementKind(kind),
    kindModifiers: ts.ScriptElementKindModifier.none,
    textSpan: textSpan,
    displayParts,
    documentation,
  };
}
