/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AST,
  BindingType,
  TmplAstBlockNode,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstDeferredTrigger,
  TmplAstElement,
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

import {getCustomElementsManifestDisplayInfo} from './attribute_completions';
import {DisplayInfoKind, SYMBOL_PUNC, SYMBOL_SPACE, SYMBOL_TEXT} from './utils/display_parts';
import {
  createDollarAnyQuickInfo,
  createDollarSafeNavigationMigration,
  createNgTemplateQuickInfo,
  createQuickInfoForBuiltIn,
  isDollarAny,
  isDollarSafeNavigationMigration,
} from './quick_info_built_ins';
import {TemplateTarget} from './template_target';
import {
  createQuickInfo,
  filterAliasImports,
  getDirectiveMatchesForAttribute,
  getDirectiveMatchesForElementTag,
  getTextSpanOfNode,
} from './utils';

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

    if (isDollarSafeNavigationMigration(this.node)) {
      return createDollarSafeNavigationMigration(this.node);
    }

    if (
      this.parent !== null &&
      isDollarSafeNavigationMigration(this.parent) &&
      this.parent.receiver === this.node
    ) {
      return createDollarSafeNavigationMigration(this.parent);
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
        return this.getQuickInfoAtTcbLocation(symbol.tcbLocation);
      case SymbolKind.Directive:
        return this.getQuickInfoForDirectiveSymbol(symbol);
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
    const result = quickInfo === undefined ? undefined : updateQuickInfoKind(quickInfo, kind);
    const target = symbol.bindings[0].target;
    if (symbol.kind !== SymbolKind.Output || target.kind !== SymbolKind.Element) {
      return result;
    }

    // Events declared in a Custom Elements Manifest carry documentation from the manifest,
    // whether or not the TCB has type information for `$event`.
    const eventName = this.node instanceof TmplAstBoundEvent ? this.node.name : null;
    const manifestEvent =
      eventName === null
        ? undefined
        : this.compiler
            .getTemplateTypeChecker()
            .getCustomElementsManifestSchema(target.templateNode.name)
            ?.events.find((event) => event.name === eventName);
    if (
      manifestEvent === undefined ||
      (manifestEvent.description === undefined &&
        manifestEvent.deprecated === undefined &&
        manifestEvent.typeText === undefined)
    ) {
      return result;
    }
    const manifestDisplayInfo = getCustomElementsManifestDisplayInfo(manifestEvent);
    if (result === undefined || manifestEvent.typeText !== undefined) {
      return createQuickInfo(
        eventName!,
        DisplayInfoKind.EVENT,
        getTextSpanOfNode(this.node),
        undefined /* containerName */,
        manifestEvent.typeText,
        manifestDisplayInfo.documentation,
        manifestDisplayInfo.tags,
      );
    }
    return {
      ...result,
      documentation: manifestDisplayInfo.documentation ?? result.documentation,
      tags: manifestDisplayInfo.tags ?? result.tags,
    };
  }

  private getQuickInfoForElementSymbol(symbol: ElementSymbol): ts.QuickInfo {
    const {templateNode} = symbol;
    const matches = getDirectiveMatchesForElementTag(templateNode, symbol.directives);
    const directiveSymbol = matches.size > 0 ? matches.values().next().value : null;

    if (directiveSymbol) {
      return this.getQuickInfoForDirectiveSymbol(directiveSymbol, templateNode);
    }

    // Elements declared in a Custom Elements Manifest carry documentation from the manifest.
    const manifestSchema = this.compiler
      .getTemplateTypeChecker()
      .getCustomElementsManifestSchema(templateNode.name);
    const manifestDisplayInfo = getCustomElementsManifestDisplayInfo(manifestSchema ?? undefined);

    return createQuickInfo(
      templateNode.name,
      DisplayInfoKind.ELEMENT,
      getTextSpanOfNode(templateNode),
      undefined /* containerName */,
      this.typeChecker.typeToString(
        this.compiler.getTemplateTypeChecker().getTypeOfSymbol(symbol)!,
      ),
      manifestDisplayInfo.documentation,
      manifestDisplayInfo.tags,
    );
  }

  private getQuickInfoForVariableSymbol(symbol: VariableSymbol): ts.QuickInfo | undefined {
    const quickInfo = this.getQuickInfoAtTcbLocation(symbol.localVarLocation);
    if (quickInfo === undefined || quickInfo.displayParts === undefined) {
      return quickInfo;
    }

    for (const part of quickInfo.displayParts) {
      if (part.kind === 'localName') {
        part.text = symbol.declaration.name;
        break;
      }
    }

    return updateQuickInfoKind(quickInfo, DisplayInfoKind.VARIABLE);
  }

  private getQuickInfoForLetDeclarationSymbol(symbol: LetDeclarationSymbol): ts.QuickInfo {
    const info = this.getQuickInfoAtTcbLocation(symbol.localVarLocation);
    return createQuickInfo(
      symbol.declaration.name,
      DisplayInfoKind.LET,
      getTextSpanOfNode(this.node),
      undefined /* containerName */,
      this.typeChecker.typeToString(
        this.compiler.getTemplateTypeChecker().getTypeOfSymbol(symbol)!,
      ),
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
      this.typeChecker.typeToString(
        this.compiler.getTemplateTypeChecker().getTypeOfSymbol(symbol)!,
      ),
      info?.documentation,
      info?.tags,
    );
  }

  private getQuickInfoForPipeSymbol(symbol: PipeSymbol): ts.QuickInfo | undefined {
    if (this.compiler.getTemplateTypeChecker().getTsSymbolOfSymbol(symbol) !== null) {
      const quickInfo = this.getQuickInfoAtTcbLocation(symbol.tcbLocation);
      return quickInfo === undefined
        ? undefined
        : updateQuickInfoKind(quickInfo, DisplayInfoKind.PIPE);
    } else {
      return createQuickInfo(
        this.typeChecker.typeToString(
          this.compiler.getTemplateTypeChecker().getTypeOfSymbol(symbol.classSymbol)!,
        ),
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
    if (directiveSymbol) {
      return this.getQuickInfoForDirectiveSymbol(directiveSymbol);
    }

    // Properties and attributes declared in a Custom Elements Manifest carry documentation from
    // the manifest even though there is no TypeScript declaration symbol for the DOM binding.
    // (Event bindings never produce a `DomBindingSymbol`; their manifest documentation is
    // attached in `getQuickInfoForBindingSymbol`.)
    const attributeName = this.node.name;
    const host = symbol.host.templateNode;
    const manifestSchema =
      host instanceof TmplAstElement
        ? this.compiler.getTemplateTypeChecker().getCustomElementsManifestSchema(host.name)
        : null;
    const manifestProperty = manifestSchema?.properties.find(
      (property) => property.name === attributeName,
    );
    const manifestAttribute = manifestSchema?.attributes?.find(
      (attribute) => attribute.name === attributeName,
    );
    const isAttributeBinding =
      this.node instanceof TmplAstTextAttribute ||
      (this.node instanceof TmplAstBoundAttribute && this.node.type === BindingType.Attribute);
    const manifestEntry = isAttributeBinding
      ? (manifestAttribute ?? manifestProperty)
      : (manifestProperty ?? manifestAttribute);
    if (
      manifestEntry === undefined ||
      (manifestEntry.description === undefined &&
        manifestEntry.deprecated === undefined &&
        manifestEntry.typeText === undefined &&
        manifestEntry.default === undefined)
    ) {
      return undefined;
    }
    const manifestDisplayInfo = getCustomElementsManifestDisplayInfo(manifestEntry);
    return createQuickInfo(
      this.node.name,
      DisplayInfoKind.PROPERTY,
      getTextSpanOfNode(this.node),
      undefined /* containerName */,
      manifestEntry.typeText,
      manifestDisplayInfo.documentation,
      manifestDisplayInfo.tags,
    );
  }

  private getQuickInfoForDirectiveSymbol(
    dir: DirectiveSymbol,
    node: TmplAstNode | AST = this.node,
  ): ts.QuickInfo {
    const kind = dir.isComponent ? DisplayInfoKind.COMPONENT : DisplayInfoKind.DIRECTIVE;
    const info = this.getQuickInfoFromTypeDefAtLocation(dir.tcbLocation);
    let containerName: string | undefined;
    const tsSymbol = this.compiler.getTemplateTypeChecker().getTsSymbolOfSymbol(dir);
    if (
      tsSymbol?.valueDeclaration &&
      ts.isClassDeclaration(tsSymbol.valueDeclaration) &&
      dir.ngModule !== null
    ) {
      containerName = dir.ngModule.name.getText();
    }

    return createQuickInfo(
      this.typeChecker.typeToString(this.compiler.getTemplateTypeChecker().getTypeOfSymbol(dir)!),
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
      this.typeChecker.typeToString(
        this.compiler.getTemplateTypeChecker().getTypeOfSymbol(symbol)!,
      ),
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
