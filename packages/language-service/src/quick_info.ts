/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AST,
  TmplAstBlockNode,
  TmplAstBoundAttribute,
  TmplAstDeferredTrigger,
  TmplAstNode,
  TmplAstTextAttribute,
} from '@angular/compiler';
import {
  DirectiveSymbol,
  DomBindingSymbol,
  ElementSymbol,
  InputBindingSymbol,
  LetDeclarationSymbol,
  NgCompiler,
  OutputBindingSymbol,
  PipeSymbol,
  ReferenceSymbol,
  SelectorlessComponentSymbol,
  SelectorlessDirectiveSymbol,
  Symbol,
  SymbolKind,
  TcbLocation,
  VariableSymbol,
} from '@angular/compiler-cli';
import ts from 'typescript';

import {
  createDollarAnyQuickInfo,
  createNgTemplateQuickInfo,
  createQuickInfoForBuiltIn,
  isDollarAny,
} from './quick_info_built_ins';
import {TemplateTarget} from './template_target';
import {
  createQuickInfo,
  filterAliasImports,
  getDirectiveMatchesForAttribute,
  getDirectiveMatchesForElementTag,
  getTextSpanOfNode,
} from './utils';
import {DisplayInfoKind, SYMBOL_PUNC, SYMBOL_SPACE, SYMBOL_TEXT} from './utils/display_parts';

export class QuickInfoBuilder {
  private readonly typeChecker: ts.TypeChecker;
  private readonly parent: TmplAstNode | AST | null;

  constructor(
    private readonly tsLS: ts.LanguageService,
    private readonly compiler: NgCompiler,
    private readonly component: ts.ClassDeclaration,
    private node: TmplAstNode | AST,
    private readonly positionDetails: TemplateTarget,
  ) {
    this.typeChecker = this.compiler.getCurrentProgram().getTypeChecker();
    this.parent = this.positionDetails.parent;
  }

  get(): ts.QuickInfo | undefined {
    if (this.node instanceof TmplAstDeferredTrigger || this.node instanceof TmplAstBlockNode) {
      return createQuickInfoForBuiltIn(this.node, this.positionDetails.position);
    }

    const symbol = this.compiler
      .getTemplateTypeChecker()
      .getSymbolOfNode(this.node, this.component);
    if (symbol !== null) {
      return this.getQuickInfoForSymbol(symbol);
    }

    if (isDollarAny(this.node)) {
      return createDollarAnyQuickInfo(this.node);
    }

    // If the cursor lands on the receiver of a method call, we have to look
    // at the entire call in order to figure out if it's a call to `$any`.
    if (this.parent !== null && isDollarAny(this.parent) && this.parent.receiver === this.node) {
      return createDollarAnyQuickInfo(this.parent);
    }

    return undefined;
  }

  private getQuickInfoForSymbol(symbol: Symbol): ts.QuickInfo | undefined {
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
      case SymbolKind.LetDeclaration:
        return this.getQuickInfoForLetDeclarationSymbol(symbol);
      case SymbolKind.Reference:
        return this.getQuickInfoForReferenceSymbol(symbol);
      case SymbolKind.DomBinding:
        return this.getQuickInfoForDomBinding(symbol);
      case SymbolKind.Pipe:
        return this.getQuickInfoForPipeSymbol(symbol);
      case SymbolKind.SelectorlessComponent:
      case SymbolKind.SelectorlessDirective:
        return this.getQuickInfoForSelectorlessSymbol(symbol);
      case SymbolKind.Expression:
      case SymbolKind.Directive:
        return this.getQuickInfoAtTcbLocation(symbol.tcbLocation);
    }
  }

  private getQuickInfoForBindingSymbol(
    symbol: InputBindingSymbol | OutputBindingSymbol,
  ): ts.QuickInfo | undefined {
    if (symbol.bindings.length === 0) {
      return undefined;
    }

    const kind =
      symbol.kind === SymbolKind.Input ? DisplayInfoKind.PROPERTY : DisplayInfoKind.EVENT;

    const quickInfo = this.getQuickInfoAtTcbLocation(symbol.bindings[0].tcbLocation);
    return quickInfo === undefined ? undefined : updateQuickInfoKind(quickInfo, kind);
  }

  private getQuickInfoForElementSymbol(symbol: ElementSymbol): ts.QuickInfo {
    const {templateNode} = symbol;
    const matches = getDirectiveMatchesForElementTag(templateNode, symbol.directives);
    const directiveSymbol = matches.size > 0 ? matches.values().next().value : null;

    if (directiveSymbol) {
      return this.getQuickInfoForDirectiveSymbol(directiveSymbol, templateNode);
    }

    return createQuickInfo(
      templateNode.name,
      DisplayInfoKind.ELEMENT,
      getTextSpanOfNode(templateNode),
      undefined /* containerName */,
      this.typeChecker.typeToString(symbol.tsType),
    );
  }

  private getQuickInfoForVariableSymbol(symbol: VariableSymbol): ts.QuickInfo {
    const info = this.getQuickInfoFromTypeDefAtLocation(symbol.initializerLocation);
    return createQuickInfo(
      symbol.declaration.name,
      DisplayInfoKind.VARIABLE,
      getTextSpanOfNode(this.node),
      undefined /* containerName */,
      this.typeChecker.typeToString(symbol.tsType),
      info?.documentation,
      info?.tags,
    );
  }

  private getQuickInfoForLetDeclarationSymbol(symbol: LetDeclarationSymbol): ts.QuickInfo {
    const info = this.getQuickInfoFromTypeDefAtLocation(symbol.initializerLocation);
    return createQuickInfo(
      symbol.declaration.name,
      DisplayInfoKind.LET,
      getTextSpanOfNode(this.node),
      undefined /* containerName */,
      this.typeChecker.typeToString(symbol.tsType),
      info?.documentation,
      info?.tags,
    );
  }

  private getQuickInfoForReferenceSymbol(symbol: ReferenceSymbol): ts.QuickInfo {
    const info = this.getQuickInfoFromTypeDefAtLocation(symbol.targetLocation);
    return createQuickInfo(
      symbol.declaration.name,
      DisplayInfoKind.REFERENCE,
      getTextSpanOfNode(this.node),
      undefined /* containerName */,
      this.typeChecker.typeToString(symbol.tsType),
      info?.documentation,
      info?.tags,
    );
  }

  private getQuickInfoForPipeSymbol(symbol: PipeSymbol): ts.QuickInfo | undefined {
    if (symbol.tsSymbol !== null) {
      const quickInfo = this.getQuickInfoAtTcbLocation(symbol.tcbLocation);
      return quickInfo === undefined
        ? undefined
        : updateQuickInfoKind(quickInfo, DisplayInfoKind.PIPE);
    } else {
      return createQuickInfo(
        this.typeChecker.typeToString(symbol.classSymbol.tsType),
        DisplayInfoKind.PIPE,
        getTextSpanOfNode(this.node),
      );
    }
  }

  private getQuickInfoForDomBinding(symbol: DomBindingSymbol) {
    if (
      !(this.node instanceof TmplAstTextAttribute) &&
      !(this.node instanceof TmplAstBoundAttribute)
    ) {
      return undefined;
    }
    const directives = getDirectiveMatchesForAttribute(
      this.node.name,
      symbol.host.templateNode,
      symbol.host.directives,
    );

    const directiveSymbol = directives.size > 0 ? directives.values().next().value : null;
    return directiveSymbol ? this.getQuickInfoForDirectiveSymbol(directiveSymbol) : undefined;
  }

  private getQuickInfoForDirectiveSymbol(
    dir: DirectiveSymbol,
    node: TmplAstNode | AST = this.node,
  ): ts.QuickInfo {
    const kind = dir.isComponent ? DisplayInfoKind.COMPONENT : DisplayInfoKind.DIRECTIVE;
    const info = this.getQuickInfoFromTypeDefAtLocation(dir.tcbLocation);
    let containerName: string | undefined;
    if (ts.isClassDeclaration(dir.tsSymbol.valueDeclaration) && dir.ngModule !== null) {
      containerName = dir.ngModule.name.getText();
    }

    return createQuickInfo(
      this.typeChecker.typeToString(dir.tsType),
      kind,
      getTextSpanOfNode(this.node),
      containerName,
      undefined,
      info?.documentation,
      info?.tags,
    );
  }

  private getQuickInfoForSelectorlessSymbol(
    symbol: SelectorlessComponentSymbol | SelectorlessDirectiveSymbol,
  ): ts.QuickInfo {
    const kind =
      symbol.kind === SymbolKind.SelectorlessComponent
        ? DisplayInfoKind.COMPONENT
        : DisplayInfoKind.DIRECTIVE;
    const info = this.getQuickInfoFromTypeDefAtLocation(symbol.tcbLocation);

    return createQuickInfo(
      this.typeChecker.typeToString(symbol.tsType),
      kind,
      getTextSpanOfNode(this.node),
      undefined,
      undefined,
      info?.documentation,
      info?.tags,
    );
  }

  private getQuickInfoFromTypeDefAtLocation(tcbLocation: TcbLocation): ts.QuickInfo | undefined {
    const typeDefs = this.tsLS.getTypeDefinitionAtPosition(
      tcbLocation.tcbPath,
      tcbLocation.positionInFile,
    );
    if (typeDefs === undefined || typeDefs.length === 0) {
      return undefined;
    }
    return this.tsLS.getQuickInfoAtPosition(typeDefs[0].fileName, typeDefs[0].textSpan.start);
  }

  private getQuickInfoAtTcbLocation(location: TcbLocation): ts.QuickInfo | undefined {
    const quickInfo = this.tsLS.getQuickInfoAtPosition(location.tcbPath, location.positionInFile);
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

  const startsWithKind =
    quickInfo.displayParts.length >= 3 &&
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

function displayPartsEqual(a: {text: string; kind: string}, b: {text: string; kind: string}) {
  return a.text === b.text && a.kind === b.kind;
}
