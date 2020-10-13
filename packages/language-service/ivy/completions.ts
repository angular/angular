/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, ImplicitReceiver, MethodCall, PropertyRead, TmplAstNode, TmplAstReference, TmplAstTemplate, TmplAstVariable} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {CompletionKind, ReferenceSymbol, VariableSymbol} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as ts from 'typescript';

import {DisplayInfoKind, getDisplayInfo, unsafeCastDisplayInfoKindToScriptElementKind} from './display_parts';

type PropertyExpressionCompletionBuilder = CompletionBuilder<PropertyRead|MethodCall>;

/**
 * Closure around the context required to perform autocompletion operations regarding a given node
 * in the template.
 *
 * The generic `N` type for the template node is narrowed internally for certain operations, as not
 * all kinds of completions are possible for every input node.
 *
 * @param N type of the template node in question. Certain operations are only valid for specific
 *     node types.
 */
export class CompletionBuilder<N extends TmplAstNode|AST> {
  private readonly typeChecker = this.compiler.getNextProgram().getTypeChecker();

  constructor(
      private readonly tsLS: ts.LanguageService, private readonly compiler: NgCompiler,
      private readonly component: ts.ClassDeclaration, private readonly node: N,
      private readonly context: TmplAstTemplate|null) {}

  /**
   * Analogue for `ts.LanguageService.getCompletionsAtPosition`.
   */
  getCompletionsAtPosition(options: ts.GetCompletionsAtPositionOptions|
                           undefined): ts.WithMetadata<ts.CompletionInfo>|undefined {
    console.error('getCompletionsAtPosition()');
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
    console.error('getCompletionEntryDetails()', entryName);
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
    console.error('getCompletionEntrySymbol()', name);
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
    return this.node instanceof PropertyRead || this.node instanceof MethodCall;
  }

  /**
   * Get completions for property expressions.
   */
  private getPropertyExpressionCompletion(
      this: PropertyExpressionCompletionBuilder,
      options: ts.GetCompletionsAtPositionOptions|
      undefined): ts.WithMetadata<ts.CompletionInfo>|undefined {
    if (this.node.receiver instanceof ImplicitReceiver) {
      return this.getGlobalPropertyExpressionCompletion(options);
    } else {
      // TODO(alxhub): implement completion of non-global expressions.
      return undefined;
    }
  }

  /**
   * Get the details of a specific completion for a property expression.
   */
  private getPropertyExpressionCompletionDetails(
      this: PropertyExpressionCompletionBuilder, entryName: string,
      formatOptions: ts.FormatCodeOptions|ts.FormatCodeSettings|undefined,
      preferences: ts.UserPreferences|undefined): ts.CompletionEntryDetails|undefined {
    if (this.node.receiver instanceof ImplicitReceiver) {
      return this.getGlobalPropertyExpressionCompletionDetails(
          entryName, formatOptions, preferences);
    } else {
      // TODO(alxhub): implement completion of non-global expressions.
      return undefined;
    }
  }

  /**
   * Get the `ts.Symbol` for a specific completion for a property expression.
   */
  private getPropertyExpressionCompletionSymbol(
      this: PropertyExpressionCompletionBuilder, name: string): ts.Symbol|undefined {
    if (this.node.receiver instanceof ImplicitReceiver) {
      return this.getGlobalPropertyExpressionCompletionSymbol(name);
    } else {
      // TODO(alxhub): implement completion of non-global expressions.
      return undefined;
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
        this.compiler.getTemplateTypeChecker().getGlobalCompletions(this.context, this.component);
    if (completions === null) {
      return undefined;
    }

    const {componentContext, templateContext} = completions;

    const replacementSpan: ts.TextSpan = {
      start: this.node.nameSpan.start,
      length: this.node.nameSpan.end - this.node.nameSpan.start,
    };

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
    const templateTypeChecker = this.compiler.getTemplateTypeChecker();
    const completions = templateTypeChecker.getGlobalCompletions(this.context, this.component);
    if (completions === null) {
      return undefined;
    }
    const {componentContext, templateContext} = completions;

    if (templateContext.has(entryName)) {
      const entry = templateContext.get(entryName)!;
      const symbol =
          templateTypeChecker.getSymbolOfNode(entry.node, this.component) as ReferenceSymbol |
          VariableSymbol;
      const {kind, displayParts, documentation} =
          getDisplayInfo(this.tsLS, this.typeChecker, symbol);
      return {
        kind: kind as string as ts.ScriptElementKind,
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
    const templateTypeChecker = this.compiler.getTemplateTypeChecker();
    const completions = templateTypeChecker.getGlobalCompletions(this.context, this.component);
    if (completions === null) {
      return undefined;
    }
    const {componentContext, templateContext} = completions;
    if (templateContext.has(entryName)) {
      const node: TmplAstReference|TmplAstVariable = templateContext.get(entryName)!.node;
      const symbol = templateTypeChecker.getSymbolOfNode(node, this.component) as ReferenceSymbol |
          VariableSymbol;
      return symbol.tsSymbol ?? undefined;
    } else {
      return this.tsLS.getCompletionEntrySymbol(
          componentContext.shimPath, componentContext.positionInShimFile, name,
          /* source */ undefined);
    }
  }
}
