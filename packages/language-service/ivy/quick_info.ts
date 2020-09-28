/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AST, BindingPipe, ImplicitReceiver, MethodCall, TmplAstBoundAttribute, TmplAstNode, TmplAstTextAttribute} from '@angular/compiler';
import {DirectiveSymbol, DomBindingSymbol, ElementSymbol, ExpressionSymbol, InputBindingSymbol, OutputBindingSymbol, ReferenceSymbol, ShimLocation, Symbol, SymbolKind, TemplateTypeChecker, VariableSymbol} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript';

import {createQuickInfo, SYMBOL_PUNC, SYMBOL_SPACE, SYMBOL_TEXT} from '../src/hover';

import {findNodeAtPosition} from './hybrid_visitor';
import {filterAliasImports, getDirectiveMatches, getDirectiveMatchesForAttribute, getTemplateInfoAtPosition, getTextSpanOfNode} from './utils';


export class QuickInfoBuilder {
  readonly typeChecker = this.program.getTypeChecker();
  constructor(
      private readonly program: ts.Program,
      private readonly templateTypeChecker: TemplateTypeChecker,
      private readonly tsLS: ts.LanguageService) {}

  getQuickInfoAtPosition(fileName: string, position: number): ts.QuickInfo|undefined {
    const templateInfo =
        getTemplateInfoAtPosition(fileName, position, this.program, this.templateTypeChecker);
    if (templateInfo === undefined) {
      return undefined;
    }
    const {template, component} = templateInfo;

    const node = findNodeAtPosition(template, position);
    if (node === undefined) {
      return undefined;
    }

    const symbol = this.templateTypeChecker.getSymbolOfNode(node, component) ?? undefined;
    if (symbol === undefined) {
      return isDollarAny(node) ? createDollarAnyQuickInfo(node) : undefined;
    }

    return this.getQuickInfoForSymbol(symbol, node);
  }

  private getQuickInfoForSymbol(symbol: Symbol, node: TmplAstNode|AST): ts.QuickInfo|undefined {
    if (symbol.kind === SymbolKind.Input || symbol.kind === SymbolKind.Output) {
      return this.getQuickInfoForBindingSymbol(symbol, node);
    } else if (symbol.kind === SymbolKind.Template) {
      return undefined;
    } else if (symbol.kind === SymbolKind.Element) {
      return this.getQuickInfoForElementSymbol(symbol);
    } else if (symbol.kind === SymbolKind.Variable) {
      return this.getQuickInfoForVariableSymbol(symbol, node);
    } else if (symbol.kind === SymbolKind.Reference) {
      return this.getQuickInfoForReferenceSymbol(symbol, node);
    } else if (symbol.kind === SymbolKind.Expression && node instanceof BindingPipe) {
      return this.getQuickInfoForPipeSymbol(symbol, node);
    } else if (symbol.kind === SymbolKind.DomBinding) {
      return this.getQuickInfoForDomBinding(node, symbol);
    } else {
      return this.getQuickInfoAtShimLocation(symbol.shimLocation, node);
    }
  }

  private getQuickInfoForBindingSymbol(
      symbol: InputBindingSymbol|OutputBindingSymbol, node: TmplAstNode|AST) {
    if (symbol.bindings.length === 0) {
      return undefined;
    }

    const kind = symbol.kind === SymbolKind.Input ? 'property' : 'event';

    const quickInfo = this.getQuickInfoAtShimLocation(symbol.bindings[0].shimLocation, node);
    return quickInfo === undefined ? undefined : updateQuickInfoKind(quickInfo, kind);
  }

  private getQuickInfoForElementSymbol(symbol: ElementSymbol) {
    const {templateNode} = symbol;
    const matches = getDirectiveMatches(symbol.directives, templateNode.name);
    if (matches.length > 0) {
      return this.getQuickInfoForDirectiveSymbol(matches[0], templateNode);
    }

    return createQuickInfo(
        templateNode.name, 'element', getTextSpanOfNode(templateNode), undefined,
        this.typeChecker.typeToString(symbol.tsType));
  }

  private getQuickInfoForVariableSymbol(symbol: VariableSymbol, node: TmplAstNode|AST) {
    const documentation = this.getDocumentationFromTypeDefAtLocation(symbol.shimLocation);
    return createQuickInfo(
        symbol.declaration.name, 'variable', getTextSpanOfNode(node), undefined,
        this.typeChecker.typeToString(symbol.tsType), documentation);
  }

  private getQuickInfoForReferenceSymbol(symbol: ReferenceSymbol, node: TmplAstNode|AST) {
    const documentation = this.getDocumentationFromTypeDefAtLocation(symbol.shimLocation);
    return createQuickInfo(
        symbol.declaration.name, 'local var', getTextSpanOfNode(node), undefined,
        this.typeChecker.typeToString(symbol.tsType), documentation);
  }

  private getQuickInfoForPipeSymbol(symbol: ExpressionSymbol, node: TmplAstNode|AST) {
    const quickInfo = this.getQuickInfoAtShimLocation(symbol.shimLocation, node);
    return quickInfo === undefined ? undefined : updateQuickInfoKind(quickInfo, 'pipe');
  }

  private getQuickInfoForDomBinding(node: TmplAstNode|AST, symbol: DomBindingSymbol) {
    if (!(node instanceof TmplAstTextAttribute) && !(node instanceof TmplAstBoundAttribute)) {
      return undefined;
    }
    const directives = getDirectiveMatchesForAttribute(
        node.name, symbol.host.templateNode, symbol.host.directives);
    if (directives.length === 0) {
      return undefined;
    }

    return this.getQuickInfoForDirectiveSymbol(directives[0], node);
  }

  private getQuickInfoForDirectiveSymbol(dir: DirectiveSymbol, node: TmplAstNode|AST) {
    const kind = dir.isComponent ? 'component' : 'directive';
    const documentation = this.getDocumentationFromTypeDefAtLocation(dir.shimLocation);
    return createQuickInfo(
        this.typeChecker.typeToString(dir.tsType), kind, getTextSpanOfNode(node), undefined,
        undefined, documentation);
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

  private getQuickInfoAtShimLocation(location: ShimLocation, node: TmplAstNode|AST): ts.QuickInfo
      |undefined {
    const quickInfo =
        this.tsLS.getQuickInfoAtPosition(location.shimPath, location.positionInShimFile);
    if (quickInfo === undefined || quickInfo.displayParts === undefined) {
      return quickInfo;
    }

    quickInfo.displayParts = filterAliasImports(quickInfo.displayParts);

    const textSpan = getTextSpanOfNode(node);
    return {...quickInfo, textSpan};
  }
}

function updateQuickInfoKind(quickInfo: ts.QuickInfo, kind: string) {
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
      {text: '(', kind: SYMBOL_PUNC}, {text: kind, kind: SYMBOL_TEXT},
      {text: ')', kind: SYMBOL_PUNC}, {text: ' ', kind: SYMBOL_SPACE}, ...quickInfo.displayParts
    ];
  }
  return quickInfo;
}

function displayPartsEqual(a: {text: string, kind: string}, b: {text: string, kind: string}) {
  return a.text === b.text && a.kind === b.kind;
}

function isDollarAny(node: TmplAstNode|AST): node is MethodCall {
  return node instanceof MethodCall && node.receiver instanceof ImplicitReceiver &&
      node.name === '$any' && node.args.length === 1;
}

function createDollarAnyQuickInfo(node: MethodCall) {
  return createQuickInfo(
      '$any',
      'method',
      getTextSpanOfNode(node),
      undefined,
      'any',
      [{
        kind: 'text',
        text: 'function to cast an expression to the `any` type',
      }],
  );
}
