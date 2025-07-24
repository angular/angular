/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstNode,
  TmplAstTemplate,
  TmplAstTextAttribute,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {isExternalResource, Resource} from '@angular/compiler-cli/src/ngtsc/metadata';
import {
  DirectiveSymbol,
  DomBindingSymbol,
  ElementSymbol,
  SelectorlessComponentSymbol,
  SelectorlessDirectiveSymbol,
  Symbol,
  SymbolKind,
  TcbLocation,
  TemplateSymbol,
  TemplateTypeChecker,
} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';

import {convertToTemplateDocumentSpan} from './references_and_rename_utils';
import {getTargetAtPosition, TargetNodeKind} from './template_target';
import {findTightestNode, getParentClassDeclaration} from './utils/ts_utils';
import {
  getDirectiveMatchesForAttribute,
  getDirectiveMatchesForElementTag,
  getTypeCheckInfoAtPosition,
  getTemplateLocationFromTcbLocation,
  getTextSpanOfNode,
  isDollarEvent,
  isTypeScriptFile,
  TypeCheckInfo,
  toTextSpan,
} from './utils';

interface DefinitionMeta {
  node: AST | TmplAstNode;
  parent: AST | TmplAstNode | null;
  symbol: Symbol;
}

interface HasTcbLocation {
  tcbLocation: TcbLocation;
}

export class DefinitionBuilder {
  private readonly ttc: TemplateTypeChecker;

  constructor(
    private readonly tsLS: ts.LanguageService,
    private readonly compiler: NgCompiler,
  ) {
    this.ttc = this.compiler.getTemplateTypeChecker();
  }

  getDefinitionAndBoundSpan(
    fileName: string,
    position: number,
  ): ts.DefinitionInfoAndBoundSpan | undefined {
    const typeCheckInfo = getTypeCheckInfoAtPosition(fileName, position, this.compiler);
    if (typeCheckInfo === undefined) {
      // We were unable to get a template at the given position. If we are in a TS file, instead
      // attempt to get an Angular definition at the location inside a TS file (examples of this
      // would be templateUrl or a url in styleUrls).
      if (!isTypeScriptFile(fileName)) {
        return;
      }
      return getDefinitionForExpressionAtPosition(fileName, position, this.compiler);
    }

    const definitionMetas = this.getDefinitionMetaAtPosition(typeCheckInfo, position);

    if (definitionMetas === undefined) {
      return undefined;
    }
    const definitions: ts.DefinitionInfo[] = [];
    for (const definitionMeta of definitionMetas) {
      // The `$event` of event handlers would point to the $event parameter in the shim file, as in
      // `_t3["x"].subscribe(function ($event): any { $event }) ;`
      // If we wanted to return something for this, it would be more appropriate for something like
      // `getTypeDefinition`.
      if (isDollarEvent(definitionMeta.node)) {
        continue;
      }

      definitions.push(
        ...(this.getDefinitionsForSymbol({...definitionMeta, ...typeCheckInfo}) ?? []),
      );
    }

    if (definitions.length === 0) {
      return undefined;
    }

    return {definitions, textSpan: getTextSpanOfNode(definitionMetas[0].node)};
  }

  private getDefinitionsForSymbol({
    symbol,
    node,
    parent,
    declaration,
  }: DefinitionMeta & TypeCheckInfo): readonly ts.DefinitionInfo[] | undefined {
    switch (symbol.kind) {
      case SymbolKind.Directive:
      case SymbolKind.Element:
      case SymbolKind.Template:
      case SymbolKind.DomBinding:
      case SymbolKind.SelectorlessComponent:
      case SymbolKind.SelectorlessDirective:
        // Though it is generally more appropriate for the above symbol definitions to be
        // associated with "type definitions" since the location in the template is the
        // actual definition location, the better user experience would be to allow
        // LS users to "go to definition" on an item in the template that maps to a class and be
        // taken to the directive or HTML class.
        return this.getTypeDefinitionsForTemplateInstance(symbol, node);
      case SymbolKind.Pipe: {
        if (symbol.tsSymbol !== null) {
          return this.getDefinitionsForSymbols(symbol);
        } else {
          // If there is no `ts.Symbol` for the pipe transform, we want to return the
          // type definition (the pipe class).
          return this.getTypeDefinitionsForSymbols(symbol.classSymbol);
        }
      }
      case SymbolKind.Output:
      case SymbolKind.Input: {
        const bindingDefs = this.getDefinitionsForSymbols(...symbol.bindings);
        // Also attempt to get directive matches for the input name. If there is a directive that
        // has the input name as part of the selector, we want to return that as well.
        const directiveDefs = this.getDirectiveTypeDefsForBindingNode(node, parent, declaration);
        return [...bindingDefs, ...directiveDefs];
      }
      case SymbolKind.LetDeclaration:
      case SymbolKind.Variable:
      case SymbolKind.Reference: {
        const definitions: ts.DefinitionInfo[] = [];
        if (symbol.declaration !== node) {
          const tcbLocation =
            symbol.kind === SymbolKind.Reference
              ? symbol.referenceVarLocation
              : symbol.localVarLocation;
          const mapping = getTemplateLocationFromTcbLocation(
            this.compiler.getTemplateTypeChecker(),
            tcbLocation.tcbPath,
            tcbLocation.isShimFile,
            tcbLocation.positionInFile,
          );
          if (mapping !== null) {
            definitions.push({
              name: symbol.declaration.name,
              containerName: '',
              containerKind: ts.ScriptElementKind.unknown,
              kind: ts.ScriptElementKind.variableElement,
              textSpan: getTextSpanOfNode(symbol.declaration),
              contextSpan: toTextSpan(symbol.declaration.sourceSpan),
              fileName: mapping.templateUrl,
            });
          }
        }
        if (symbol.kind === SymbolKind.Variable || symbol.kind === SymbolKind.LetDeclaration) {
          definitions.push(
            ...this.getDefinitionsForSymbols({tcbLocation: symbol.initializerLocation}),
          );
        }
        return definitions;
      }
      case SymbolKind.Expression: {
        return this.getDefinitionsForSymbols(symbol);
      }
    }
  }

  private getDefinitionsForSymbols(...symbols: HasTcbLocation[]): ts.DefinitionInfo[] {
    return symbols.flatMap(({tcbLocation}) => {
      const {tcbPath, positionInFile} = tcbLocation;
      const definitionInfos = this.tsLS.getDefinitionAtPosition(tcbPath, positionInFile);
      if (definitionInfos === undefined) {
        return [];
      }
      return this.mapShimResultsToTemplates(definitionInfos);
    });
  }

  /**
   * Converts and definition info result that points to a template typecheck file to a reference to
   * the corresponding location in the template.
   */
  private mapShimResultsToTemplates(
    definitionInfos: readonly ts.DefinitionInfo[],
  ): readonly ts.DefinitionInfo[] {
    const result: ts.DefinitionInfo[] = [];
    for (const info of definitionInfos) {
      if (this.ttc.isTrackedTypeCheckFile(absoluteFrom(info.fileName))) {
        const templateDefinitionInfo = convertToTemplateDocumentSpan(
          info,
          this.ttc,
          this.compiler.getCurrentProgram(),
        );
        if (templateDefinitionInfo === null) {
          continue;
        }
        result.push(templateDefinitionInfo);
      } else {
        result.push(info);
      }
    }
    return result;
  }

  getTypeDefinitionsAtPosition(
    fileName: string,
    position: number,
  ): readonly ts.DefinitionInfo[] | undefined {
    const typeCheckInfo = getTypeCheckInfoAtPosition(fileName, position, this.compiler);
    if (typeCheckInfo === undefined) {
      return undefined;
    }
    const definitionMetas = this.getDefinitionMetaAtPosition(typeCheckInfo, position);
    if (definitionMetas === undefined) {
      return undefined;
    }

    const definitions: ts.DefinitionInfo[] = [];
    for (const {symbol, node, parent} of definitionMetas) {
      switch (symbol.kind) {
        case SymbolKind.Directive:
        case SymbolKind.DomBinding:
        case SymbolKind.Element:
        case SymbolKind.Template:
        case SymbolKind.SelectorlessComponent:
        case SymbolKind.SelectorlessDirective:
          definitions.push(...this.getTypeDefinitionsForTemplateInstance(symbol, node));
          break;
        case SymbolKind.Output:
        case SymbolKind.Input: {
          const bindingDefs = this.getTypeDefinitionsForSymbols(...symbol.bindings);
          definitions.push(...bindingDefs);
          // Also attempt to get directive matches for the input name. If there is a directive that
          // has the input name as part of the selector, we want to return that as well.
          const directiveDefs = this.getDirectiveTypeDefsForBindingNode(
            node,
            parent,
            typeCheckInfo.declaration,
          );
          definitions.push(...directiveDefs);
          break;
        }
        case SymbolKind.Pipe: {
          if (symbol.tsSymbol !== null) {
            definitions.push(...this.getTypeDefinitionsForSymbols(symbol));
          } else {
            // If there is no `ts.Symbol` for the pipe transform, we want to return the
            // type definition (the pipe class).
            definitions.push(...this.getTypeDefinitionsForSymbols(symbol.classSymbol));
          }
          break;
        }
        case SymbolKind.Reference:
          definitions.push(
            ...this.getTypeDefinitionsForSymbols({tcbLocation: symbol.targetLocation}),
          );
          break;
        case SymbolKind.Expression:
          definitions.push(...this.getTypeDefinitionsForSymbols(symbol));
          break;
        case SymbolKind.Variable:
        case SymbolKind.LetDeclaration: {
          definitions.push(
            ...this.getTypeDefinitionsForSymbols({tcbLocation: symbol.initializerLocation}),
          );
          break;
        }
      }
      return definitions;
    }
    return undefined;
  }

  private getTypeDefinitionsForTemplateInstance(
    symbol:
      | TemplateSymbol
      | ElementSymbol
      | DomBindingSymbol
      | DirectiveSymbol
      | SelectorlessComponentSymbol
      | SelectorlessDirectiveSymbol,
    node: AST | TmplAstNode,
  ): ts.DefinitionInfo[] {
    switch (symbol.kind) {
      case SymbolKind.Template: {
        const matches = getDirectiveMatchesForElementTag(symbol.templateNode, symbol.directives);
        return this.getTypeDefinitionsForSymbols(...matches);
      }
      case SymbolKind.Element: {
        const matches = getDirectiveMatchesForElementTag(symbol.templateNode, symbol.directives);
        // If one of the directive matches is a component, we should not include the native element
        // in the results because it is replaced by the component.
        return Array.from(matches).some((dir) => dir.isComponent)
          ? this.getTypeDefinitionsForSymbols(...matches)
          : this.getTypeDefinitionsForSymbols(...matches, symbol);
      }
      case SymbolKind.DomBinding: {
        if (!(node instanceof TmplAstTextAttribute)) {
          return [];
        }
        const dirs = getDirectiveMatchesForAttribute(
          node.name,
          symbol.host.templateNode,
          symbol.host.directives,
        );
        return this.getTypeDefinitionsForSymbols(...dirs);
      }
      case SymbolKind.SelectorlessComponent:
      case SymbolKind.SelectorlessDirective:
      case SymbolKind.Directive:
        return this.getTypeDefinitionsForSymbols(symbol);
    }
  }

  private getDirectiveTypeDefsForBindingNode(
    node: TmplAstNode | AST,
    parent: TmplAstNode | AST | null,
    component: ts.ClassDeclaration,
  ) {
    if (
      !(node instanceof TmplAstBoundAttribute) &&
      !(node instanceof TmplAstTextAttribute) &&
      !(node instanceof TmplAstBoundEvent)
    ) {
      return [];
    }
    if (
      parent === null ||
      !(parent instanceof TmplAstTemplate || parent instanceof TmplAstElement)
    ) {
      return [];
    }
    const templateOrElementSymbol = this.compiler
      .getTemplateTypeChecker()
      .getSymbolOfNode(parent, component);
    if (
      templateOrElementSymbol === null ||
      (templateOrElementSymbol.kind !== SymbolKind.Template &&
        templateOrElementSymbol.kind !== SymbolKind.Element)
    ) {
      return [];
    }
    const dirs = getDirectiveMatchesForAttribute(
      node.name,
      parent,
      templateOrElementSymbol.directives,
    );
    return this.getTypeDefinitionsForSymbols(...dirs);
  }

  private getTypeDefinitionsForSymbols(...symbols: HasTcbLocation[]): ts.DefinitionInfo[] {
    return symbols.flatMap(({tcbLocation}) => {
      const {tcbPath, positionInFile} = tcbLocation;
      return this.tsLS.getTypeDefinitionAtPosition(tcbPath, positionInFile) ?? [];
    });
  }

  private getDefinitionMetaAtPosition(
    info: TypeCheckInfo,
    position: number,
  ): DefinitionMeta[] | undefined {
    const target = getTargetAtPosition(info.nodes, position);
    if (target === null) {
      return undefined;
    }
    const {context, parent} = target;

    const nodes =
      context.kind === TargetNodeKind.TwoWayBindingContext ? context.nodes : [context.node];

    const definitionMetas: DefinitionMeta[] = [];
    for (const node of nodes) {
      const symbol = this.compiler.getTemplateTypeChecker().getSymbolOfNode(node, info.declaration);
      if (symbol === null) {
        continue;
      }
      definitionMetas.push({node, parent, symbol});
    }
    return definitionMetas.length > 0 ? definitionMetas : undefined;
  }
}

/**
 * Gets an Angular-specific definition in a TypeScript source file.
 */
function getDefinitionForExpressionAtPosition(
  fileName: string,
  position: number,
  compiler: NgCompiler,
): ts.DefinitionInfoAndBoundSpan | undefined {
  const sf = compiler.getCurrentProgram().getSourceFile(fileName);
  if (sf === undefined) {
    return;
  }

  const expression = findTightestNode(sf, position);
  if (expression === undefined) {
    return;
  }
  const classDeclaration = getParentClassDeclaration(expression);
  if (classDeclaration === undefined) {
    return;
  }
  const resource = compiler.getDirectiveResources(classDeclaration);
  if (resource === null) {
    return;
  }

  let resourceForExpression: Resource | null = null;

  if (resource.template?.node === expression) {
    resourceForExpression = resource.template;
  }

  if (resourceForExpression === null && resource.styles !== null) {
    for (const style of resource.styles) {
      if (style.node === expression) {
        resourceForExpression = style;
        break;
      }
    }
  }

  if (resourceForExpression === null && resource.hostBindings !== null) {
    for (const binding of resource.hostBindings) {
      if (binding.node === expression) {
        resourceForExpression = binding;
        break;
      }
    }
  }

  if (resourceForExpression === null || !isExternalResource(resourceForExpression)) {
    return;
  }

  const templateDefinitions: ts.DefinitionInfo[] = [
    {
      kind: ts.ScriptElementKind.externalModuleName,
      name: resourceForExpression.path,
      containerKind: ts.ScriptElementKind.unknown,
      containerName: '',
      // Reading the template is expensive, so don't provide a preview.
      // TODO(ayazhafiz): Consider providing an actual span:
      //  1. We're likely to read the template anyway
      //  2. We could show just the first 100 chars or so
      textSpan: {start: 0, length: 0},
      fileName: resourceForExpression.path,
    },
  ];

  return {
    definitions: templateDefinitions,
    textSpan: {
      // Exclude opening and closing quotes in the url span.
      start: expression.getStart() + 1,
      length: expression.getWidth() - 2,
    },
  };
}
