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

import {DisplayInfoKind, SYMBOL_PUNC, SYMBOL_SPACE, SYMBOL_TEXT} from './utils/display_parts';
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

    const binding = symbol.bindings[0];
    const tcbQuickInfo = this.getQuickInfoAtTcbLocation(binding.tcbLocation);

    const program = this.tsLS.getProgram();
    if (program && binding.target && binding.target.kind === SymbolKind.Directive) {
      const tcbFile = program.getSourceFile(binding.tcbLocation.tcbPath);
      if (tcbFile) {
        const node = findNodeAtPosition(tcbFile, binding.tcbLocation.positionInFile);
        let propertyName: string | undefined;

        if (node) {
          if (ts.isIdentifier(node)) {
            const varName = node.text;
            const declaration = findVariableDeclaration(tcbFile, varName);
            if (declaration) {
              const typeNode = getTcbVariableType(declaration);
              if (typeNode && ts.isTypeQueryNode(typeNode)) {
                const exprName = typeNode.exprName;
                let propName: string | undefined;
                if (ts.isQualifiedName(exprName)) {
                  propName = exprName.right.text;
                } else if (ts.isIdentifier(exprName)) {
                  propName = exprName.text;
                }
                if (propName && propName.startsWith('ngAcceptInputType_')) {
                  propertyName = propName.substring('ngAcceptInputType_'.length);
                }
              }
            }
          }

          if (!propertyName) {
            let curr: ts.Node | undefined = node;
            while (
              curr &&
              !ts.isPropertyAccessExpression(curr) &&
              !ts.isElementAccessExpression(curr)
            ) {
              curr = curr.parent;
            }
            if (curr) {
              if (ts.isPropertyAccessExpression(curr)) {
                propertyName = curr.name.text;
              } else if (
                ts.isElementAccessExpression(curr) &&
                ts.isStringLiteral(curr.argumentExpression)
              ) {
                propertyName = curr.argumentExpression.text;
              }
            }
          }

          if (!propertyName && 'name' in this.node && typeof this.node.name === 'string') {
            propertyName = this.node.name;
          }
        }

        if (propertyName) {
          // Check if TCB quick info is valid and contains the property name!
          if (tcbQuickInfo && tcbQuickInfo.displayParts) {
            const containsProp = tcbQuickInfo.displayParts.some((p) => p.text === propertyName);
            const isTemp = tcbQuickInfo.displayParts.some((p) => p.text.startsWith('_t'));

            if (containsProp && !isTemp) {
              const textSpan = getTextSpanOfNode(this.node);
              return updateQuickInfoKind({...tcbQuickInfo, textSpan}, kind);
            }
          }

          // Fallback to class property lookup!
          const classDecl = binding.target.ref.node;
          if (ts.isClassDeclaration(classDecl)) {
            const member = classDecl.members.find(
              (m: ts.ClassElement) =>
                m.name && ts.isIdentifier(m.name) && m.name.text === propertyName,
            );
            if (member && member.name) {
              const fileName = classDecl.getSourceFile().fileName;
              const position = member.name.getStart();
              const declInfo = this.tsLS.getQuickInfoAtPosition(fileName, position);
              if (declInfo) {
                if (declInfo.displayParts) {
                  declInfo.displayParts = filterAliasImports(declInfo.displayParts);
                }
                const textSpan = getTextSpanOfNode(this.node);
                return updateQuickInfoKind({...declInfo, textSpan}, kind);
              }
            }
          }
        }
      }
    }

    // Ultimate fallback to TCB QuickInfo!
    return tcbQuickInfo === undefined ? undefined : updateQuickInfoKind(tcbQuickInfo, kind);
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
      this.typeChecker.typeToString(
        this.compiler.getTemplateTypeChecker().getTypeOfSymbol(symbol)!,
      ),
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
    return directiveSymbol ? this.getQuickInfoForDirectiveSymbol(directiveSymbol) : undefined;
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

function findNodeAtPosition(sourceFile: ts.SourceFile, position: number): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (position >= node.getStart() && position <= node.getEnd()) {
      return ts.forEachChild(node, find) || node;
    }
    return undefined;
  }
  return find(sourceFile);
}

function getTcbVariableType(declaration: ts.VariableDeclaration): ts.TypeNode | undefined {
  if (declaration.type) {
    return declaration.type;
  }
  if (declaration.initializer && ts.isAsExpression(declaration.initializer)) {
    return declaration.initializer.type;
  }
  return undefined;
}

function findVariableDeclaration(
  sourceFile: ts.SourceFile,
  name: string,
): ts.VariableDeclaration | undefined {
  function find(node: ts.Node): ts.VariableDeclaration | undefined {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) {
      return node;
    }
    return ts.forEachChild(node, find);
  }
  return find(sourceFile);
}
