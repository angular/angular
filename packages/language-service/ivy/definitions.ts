/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstElement, TmplAstNode, TmplAstTemplate, TmplAstTextAttribute} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {isExternalResource} from '@angular/compiler-cli/src/ngtsc/metadata';
import {ProgramDriver} from '@angular/compiler-cli/src/ngtsc/program_driver';
import {DirectiveSymbol, DomBindingSymbol, ElementSymbol, ShimLocation, Symbol, SymbolKind, TemplateSymbol} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript';

import {convertToTemplateDocumentSpan} from './references_and_rename_utils';
import {getTargetAtPosition, TargetNodeKind} from './template_target';
import {findTightestNode, getParentClassDeclaration} from './ts_utils';
import {flatMap, getDirectiveMatchesForAttribute, getDirectiveMatchesForElementTag, getTemplateInfoAtPosition, getTemplateLocationFromShimLocation, getTextSpanOfNode, isDollarEvent, isTypeScriptFile, TemplateInfo, toTextSpan} from './utils';

interface DefinitionMeta {
  node: AST|TmplAstNode;
  parent: AST|TmplAstNode|null;
  symbol: Symbol;
}

interface HasShimLocation {
  shimLocation: ShimLocation;
}

export class DefinitionBuilder {
  private readonly ttc = this.compiler.getTemplateTypeChecker();

  constructor(
      private readonly tsLS: ts.LanguageService, private readonly compiler: NgCompiler,
      private readonly driver: ProgramDriver) {}

  getDefinitionAndBoundSpan(fileName: string, position: number): ts.DefinitionInfoAndBoundSpan
      |undefined {
    const templateInfo = getTemplateInfoAtPosition(fileName, position, this.compiler);
    if (templateInfo === undefined) {
      // We were unable to get a template at the given position. If we are in a TS file, instead
      // attempt to get an Angular definition at the location inside a TS file (examples of this
      // would be templateUrl or a url in styleUrls).
      if (!isTypeScriptFile(fileName)) {
        return;
      }
      return getDefinitionForExpressionAtPosition(fileName, position, this.compiler);
    }
    const definitionMetas = this.getDefinitionMetaAtPosition(templateInfo, position);
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
          ...(this.getDefinitionsForSymbol({...definitionMeta, ...templateInfo}) ?? []));
    }

    if (definitions.length === 0) {
      return undefined;
    }

    return {definitions, textSpan: getTextSpanOfNode(definitionMetas[0].node)};
  }

  private getDefinitionsForSymbol({symbol, node, parent, component}: DefinitionMeta&
                                  TemplateInfo): readonly ts.DefinitionInfo[]|undefined {
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
        const directiveDefs = this.getDirectiveTypeDefsForBindingNode(node, parent, component);
        return [...bindingDefs, ...directiveDefs];
      }
      case SymbolKind.Variable:
      case SymbolKind.Reference: {
        const definitions: ts.DefinitionInfo[] = [];
        if (symbol.declaration !== node) {
          const shimLocation = symbol.kind === SymbolKind.Variable ? symbol.localVarLocation :
                                                                     symbol.referenceVarLocation;
          const mapping = getTemplateLocationFromShimLocation(
              this.compiler.getTemplateTypeChecker(), shimLocation.shimPath,
              shimLocation.positionInShimFile);
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
        if (symbol.kind === SymbolKind.Variable) {
          definitions.push(
              ...this.getDefinitionsForSymbols({shimLocation: symbol.initializerLocation}));
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
      const definitionInfos = this.tsLS.getDefinitionAtPosition(shimPath, positionInShimFile);
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
  private mapShimResultsToTemplates(definitionInfos: readonly ts.DefinitionInfo[]):
      readonly ts.DefinitionInfo[] {
    const result: ts.DefinitionInfo[] = [];
    for (const info of definitionInfos) {
      if (this.ttc.isTrackedTypeCheckFile(absoluteFrom(info.fileName))) {
        const templateDefinitionInfo =
            convertToTemplateDocumentSpan(info, this.ttc, this.driver.getProgram());
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

  getTypeDefinitionsAtPosition(fileName: string, position: number):
      readonly ts.DefinitionInfo[]|undefined {
    const templateInfo = getTemplateInfoAtPosition(fileName, position, this.compiler);
    if (templateInfo === undefined) {
      return;
    }
    const definitionMetas = this.getDefinitionMetaAtPosition(templateInfo, position);
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
          definitions.push(...this.getTypeDefinitionsForTemplateInstance(symbol, node));
          break;
        case SymbolKind.Output:
        case SymbolKind.Input: {
          const bindingDefs = this.getTypeDefinitionsForSymbols(...symbol.bindings);
          definitions.push(...bindingDefs);
          // Also attempt to get directive matches for the input name. If there is a directive that
          // has the input name as part of the selector, we want to return that as well.
          const directiveDefs =
              this.getDirectiveTypeDefsForBindingNode(node, parent, templateInfo.component);
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
              ...this.getTypeDefinitionsForSymbols({shimLocation: symbol.targetLocation}));
          break;
        case SymbolKind.Expression:
          definitions.push(...this.getTypeDefinitionsForSymbols(symbol));
          break;
        case SymbolKind.Variable: {
          definitions.push(
              ...this.getTypeDefinitionsForSymbols({shimLocation: symbol.initializerLocation}));
          break;
        }
      }
      return definitions;
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

  private getDirectiveTypeDefsForBindingNode(
      node: TmplAstNode|AST, parent: TmplAstNode|AST|null, component: ts.ClassDeclaration) {
    if (!(node instanceof TmplAstBoundAttribute) && !(node instanceof TmplAstTextAttribute) &&
        !(node instanceof TmplAstBoundEvent)) {
      return [];
    }
    if (parent === null ||
        !(parent instanceof TmplAstTemplate || parent instanceof TmplAstElement)) {
      return [];
    }
    const templateOrElementSymbol =
        this.compiler.getTemplateTypeChecker().getSymbolOfNode(parent, component);
    if (templateOrElementSymbol === null ||
        (templateOrElementSymbol.kind !== SymbolKind.Template &&
         templateOrElementSymbol.kind !== SymbolKind.Element)) {
      return [];
    }
    const dirs =
        getDirectiveMatchesForAttribute(node.name, parent, templateOrElementSymbol.directives);
    return this.getTypeDefinitionsForSymbols(...dirs);
  }

  private getTypeDefinitionsForSymbols(...symbols: HasShimLocation[]): ts.DefinitionInfo[] {
    return flatMap(symbols, ({shimLocation}) => {
      const {shimPath, positionInShimFile} = shimLocation;
      return this.tsLS.getTypeDefinitionAtPosition(shimPath, positionInShimFile) ?? [];
    });
  }

  private getDefinitionMetaAtPosition({template, component}: TemplateInfo, position: number):
      DefinitionMeta[]|undefined {
    const target = getTargetAtPosition(template, position);
    if (target === null) {
      return undefined;
    }
    const {context, parent} = target;

    const nodes =
        context.kind === TargetNodeKind.TwoWayBindingContext ? context.nodes : [context.node];


    const definitionMetas: DefinitionMeta[] = [];
    for (const node of nodes) {
      const symbol = this.compiler.getTemplateTypeChecker().getSymbolOfNode(node, component);
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
    fileName: string, position: number, compiler: NgCompiler): ts.DefinitionInfoAndBoundSpan|
    undefined {
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
  const componentResources = compiler.getComponentResources(classDeclaration);
  if (componentResources === null) {
    return;
  }

  const allResources = [...componentResources.styles, componentResources.template];

  const resourceForExpression = allResources.find(resource => resource.expression === expression);
  if (resourceForExpression === undefined || !isExternalResource(resourceForExpression)) {
    return;
  }

  const templateDefinitions: ts.DefinitionInfo[] = [{
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
  }];

  return {
    definitions: templateDefinitions,
    textSpan: {
      // Exclude opening and closing quotes in the url span.
      start: expression.getStart() + 1,
      length: expression.getWidth() - 2,
    },
  };
}
