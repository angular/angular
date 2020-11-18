/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, EmptyExpr, ImplicitReceiver, LiteralPrimitive, MethodCall, PropertyRead, PropertyWrite, SafeMethodCall, SafePropertyRead, TmplAstNode, TmplAstReference, TmplAstTemplate, TmplAstVariable} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {CompletionKind, TemplateDeclarationSymbol} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import {BoundEvent} from '@angular/compiler/src/render3/r3_ast';
import * as ts from 'typescript';

import {DisplayInfoKind, getDisplayInfo, unsafeCastDisplayInfoKindToScriptElementKind} from './display_parts';
import {filterAliasImports} from './utils';

type PropertyExpressionCompletionBuilder =
    CompletionBuilder<PropertyRead|PropertyWrite|MethodCall|EmptyExpr|SafePropertyRead|
                      SafeMethodCall>;

/**
 * Performs autocompletion operations on a given node in the template.
 *
 * This class acts as a closure around all of the context required to perform the 3 autocompletion
 * operations (completions, get details, and get symbol) at a specific node.
 *
 * The generic `N` type for the template node is narrowed internally for certain operations, as the
 * compiler operations required to implement completion may be different for different node types.
 *
 * @param N type of the template node in question, narrowed accordingly.
 */
export class CompletionBuilder<N extends TmplAstNode|AST> {
  private readonly typeChecker = this.compiler.getNextProgram().getTypeChecker();
  private readonly templateTypeChecker = this.compiler.getTemplateTypeChecker();

  constructor(
      private readonly tsLS: ts.LanguageService, private readonly compiler: NgCompiler,
      private readonly component: ts.ClassDeclaration, private readonly node: N,
      private readonly nodeParent: TmplAstNode|AST|null,
      private readonly template: TmplAstTemplate|null) {}

  /**
   * Analogue for `ts.LanguageService.getCompletionsAtPosition`.
   */
  getCompletionsAtPosition(options: ts.GetCompletionsAtPositionOptions|
                           undefined): ts.WithMetadata<ts.CompletionInfo>|undefined {
    if (this.isPropertyExpressionCompletion()) {
      return this.getPropertyExpressionCompletion(options);
    } else {
      return undefined;
    }
  }

  /**
   * Analogue for `ts.LanguageService.getCompletionEntryDetails`.
   */
  getCompletionEntryDetails(
      entryName: string, formatOptions: ts.FormatCodeOptions|ts.FormatCodeSettings|undefined,
      preferences: ts.UserPreferences|undefined): ts.CompletionEntryDetails|undefined {
    if (this.isPropertyExpressionCompletion()) {
      return this.getPropertyExpressionCompletionDetails(entryName, formatOptions, preferences);
    } else {
      return undefined;
    }
  }

  /**
   * Analogue for `ts.LanguageService.getCompletionEntrySymbol`.
   */
  getCompletionEntrySymbol(name: string): ts.Symbol|undefined {
    if (this.isPropertyExpressionCompletion()) {
      return this.getPropertyExpressionCompletionSymbol(name);
    } else {
      return undefined;
    }
  }

  /**
   * Determine if the current node is the completion of a property expression, and narrow the type
   * of `this.node` if so.
   *
   * This narrowing gives access to additional methods related to completion of property
   * expressions.
   */
  private isPropertyExpressionCompletion(this: CompletionBuilder<TmplAstNode|AST>):
      this is PropertyExpressionCompletionBuilder {
    return this.node instanceof PropertyRead || this.node instanceof MethodCall ||
        this.node instanceof SafePropertyRead || this.node instanceof SafeMethodCall ||
        this.node instanceof PropertyWrite || this.node instanceof EmptyExpr ||
        isBrokenEmptyBoundEventExpression(this.node, this.nodeParent);
  }

  /**
   * Get completions for property expressions.
   */
  private getPropertyExpressionCompletion(
      this: PropertyExpressionCompletionBuilder,
      options: ts.GetCompletionsAtPositionOptions|
      undefined): ts.WithMetadata<ts.CompletionInfo>|undefined {
    if (this.node instanceof EmptyExpr ||
        isBrokenEmptyBoundEventExpression(this.node, this.nodeParent) ||
        this.node.receiver instanceof ImplicitReceiver) {
      return this.getGlobalPropertyExpressionCompletion(options);
    } else {
      const location = this.compiler.getTemplateTypeChecker().getExpressionCompletionLocation(
          this.node, this.component);
      if (location === null) {
        return undefined;
      }
      const tsResults = this.tsLS.getCompletionsAtPosition(
          location.shimPath, location.positionInShimFile, options);
      if (tsResults === undefined) {
        return undefined;
      }

      const replacementSpan = makeReplacementSpan(this.node);

      let ngResults: ts.CompletionEntry[] = [];
      for (const result of tsResults.entries) {
        ngResults.push({
          ...result,
          replacementSpan,
        });
      }
      return {
        ...tsResults,
        entries: ngResults,
      };
    }
  }

  /**
   * Get the details of a specific completion for a property expression.
   */
  private getPropertyExpressionCompletionDetails(
      this: PropertyExpressionCompletionBuilder, entryName: string,
      formatOptions: ts.FormatCodeOptions|ts.FormatCodeSettings|undefined,
      preferences: ts.UserPreferences|undefined): ts.CompletionEntryDetails|undefined {
    let details: ts.CompletionEntryDetails|undefined = undefined;
    if (this.node instanceof EmptyExpr ||
        isBrokenEmptyBoundEventExpression(this.node, this.nodeParent) ||
        this.node.receiver instanceof ImplicitReceiver) {
      details =
          this.getGlobalPropertyExpressionCompletionDetails(entryName, formatOptions, preferences);
    } else {
      const location = this.compiler.getTemplateTypeChecker().getExpressionCompletionLocation(
          this.node, this.component);
      if (location === null) {
        return undefined;
      }
      details = this.tsLS.getCompletionEntryDetails(
          location.shimPath, location.positionInShimFile, entryName, formatOptions,
          /* source */ undefined, preferences);
    }
    if (details !== undefined) {
      details.displayParts = filterAliasImports(details.displayParts);
    }
    return details;
  }

  /**
   * Get the `ts.Symbol` for a specific completion for a property expression.
   */
  private getPropertyExpressionCompletionSymbol(
      this: PropertyExpressionCompletionBuilder, name: string): ts.Symbol|undefined {
    if (this.node instanceof EmptyExpr || this.node instanceof LiteralPrimitive ||
        this.node.receiver instanceof ImplicitReceiver) {
      return this.getGlobalPropertyExpressionCompletionSymbol(name);
    } else {
      const location = this.compiler.getTemplateTypeChecker().getExpressionCompletionLocation(
          this.node, this.component);
      if (location === null) {
        return undefined;
      }
      return this.tsLS.getCompletionEntrySymbol(
          location.shimPath, location.positionInShimFile, name, /* source */ undefined);
    }
  }

  /**
   * Get completions for a property expression in a global context (e.g. `{{y|}}`).
   */
  private getGlobalPropertyExpressionCompletion(
      this: PropertyExpressionCompletionBuilder,
      options: ts.GetCompletionsAtPositionOptions|
      undefined): ts.WithMetadata<ts.CompletionInfo>|undefined {
    const completions =
        this.templateTypeChecker.getGlobalCompletions(this.template, this.component);
    if (completions === null) {
      return undefined;
    }

    const {componentContext, templateContext} = completions;

    let replacementSpan: ts.TextSpan|undefined = undefined;
    // Non-empty nodes get replaced with the completion.
    if (!(this.node instanceof EmptyExpr || this.node instanceof LiteralPrimitive)) {
      replacementSpan = makeReplacementSpan(this.node);
    }

    // Merge TS completion results with results from the template scope.
    let entries: ts.CompletionEntry[] = [];
    const tsLsCompletions = this.tsLS.getCompletionsAtPosition(
        componentContext.shimPath, componentContext.positionInShimFile, options);
    if (tsLsCompletions !== undefined) {
      for (const tsCompletion of tsLsCompletions.entries) {
        // Skip completions that are shadowed by a template entity definition.
        if (templateContext.has(tsCompletion.name)) {
          continue;
        }
        entries.push({
          ...tsCompletion,
          // Substitute the TS completion's `replacementSpan` (which uses offsets within the TCB)
          // with the `replacementSpan` within the template source.
          replacementSpan,
        });
      }
    }

    for (const [name, entity] of templateContext) {
      entries.push({
        name,
        sortText: name,
        replacementSpan,
        kindModifiers: ts.ScriptElementKindModifier.none,
        kind: unsafeCastDisplayInfoKindToScriptElementKind(
            entity.kind === CompletionKind.Reference ? DisplayInfoKind.REFERENCE :
                                                       DisplayInfoKind.VARIABLE),
      });
    }

    return {
      entries,
      // Although this completion is "global" in the sense of an Angular expression (there is no
      // explicit receiver), it is not "global" in a TypeScript sense since Angular expressions have
      // the component as an implicit receiver.
      isGlobalCompletion: false,
      isMemberCompletion: true,
      isNewIdentifierLocation: false,
    };
  }

  /**
   * Get the details of a specific completion for a property expression in a global context (e.g.
   * `{{y|}}`).
   */
  private getGlobalPropertyExpressionCompletionDetails(
      this: PropertyExpressionCompletionBuilder, entryName: string,
      formatOptions: ts.FormatCodeOptions|ts.FormatCodeSettings|undefined,
      preferences: ts.UserPreferences|undefined): ts.CompletionEntryDetails|undefined {
    const completions =
        this.templateTypeChecker.getGlobalCompletions(this.template, this.component);
    if (completions === null) {
      return undefined;
    }
    const {componentContext, templateContext} = completions;

    if (templateContext.has(entryName)) {
      const entry = templateContext.get(entryName)!;
      // Entries that reference a symbol in the template context refer either to local references or
      // variables.
      const symbol = this.templateTypeChecker.getSymbolOfNode(entry.node, this.component) as
              TemplateDeclarationSymbol |
          null;
      if (symbol === null) {
        return undefined;
      }

      const {kind, displayParts, documentation} =
          getDisplayInfo(this.tsLS, this.typeChecker, symbol);
      return {
        kind: unsafeCastDisplayInfoKindToScriptElementKind(kind),
        name: entryName,
        kindModifiers: ts.ScriptElementKindModifier.none,
        displayParts,
        documentation,
      };
    } else {
      return this.tsLS.getCompletionEntryDetails(
          componentContext.shimPath, componentContext.positionInShimFile, entryName, formatOptions,
          /* source */ undefined, preferences);
    }
  }

  /**
   * Get the `ts.Symbol` of a specific completion for a property expression in a global context
   * (e.g.
   * `{{y|}}`).
   */
  private getGlobalPropertyExpressionCompletionSymbol(
      this: PropertyExpressionCompletionBuilder, entryName: string): ts.Symbol|undefined {
    const completions =
        this.templateTypeChecker.getGlobalCompletions(this.template, this.component);
    if (completions === null) {
      return undefined;
    }
    const {componentContext, templateContext} = completions;
    if (templateContext.has(entryName)) {
      const node: TmplAstReference|TmplAstVariable = templateContext.get(entryName)!.node;
      const symbol = this.templateTypeChecker.getSymbolOfNode(node, this.component) as
              TemplateDeclarationSymbol |
          null;
      if (symbol === null || symbol.tsSymbol === null) {
        return undefined;
      }
      return symbol.tsSymbol;
    } else {
      return this.tsLS.getCompletionEntrySymbol(
          componentContext.shimPath, componentContext.positionInShimFile, entryName,
          /* source */ undefined);
    }
  }
}

/**
 * Checks whether the given `node` is (most likely) a synthetic node created by the template parser
 * for an empty event binding `(event)=""`.
 *
 * When parsing such an expression, a synthetic `LiteralPrimitive` node is generated for the
 * `BoundEvent`'s handler with the literal text value 'ERROR'. Detecting this case is crucial to
 * supporting completions within empty event bindings.
 */
function isBrokenEmptyBoundEventExpression(
    node: TmplAstNode|AST, parent: TmplAstNode|AST|null): node is LiteralPrimitive {
  return node instanceof LiteralPrimitive && parent !== null && parent instanceof BoundEvent &&
      node.value === 'ERROR';
}

function makeReplacementSpan(node: PropertyRead|PropertyWrite|MethodCall|SafePropertyRead|
                             SafeMethodCall): ts.TextSpan {
  return {
    start: node.nameSpan.start,
    length: node.nameSpan.end - node.nameSpan.start,
  };
}
