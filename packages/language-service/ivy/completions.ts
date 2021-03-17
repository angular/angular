/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, BindingPipe, EmptyExpr, ImplicitReceiver, LiteralPrimitive, MethodCall, ParseSourceSpan, PropertyRead, PropertyWrite, SafeMethodCall, SafePropertyRead, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstElement, TmplAstNode, TmplAstReference, TmplAstTemplate, TmplAstText, TmplAstTextAttribute, TmplAstVariable} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {CompletionKind, DirectiveInScope, TemplateDeclarationSymbol} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import {BoundEvent} from '@angular/compiler/src/render3/r3_ast';
import * as ts from 'typescript';

import {addAttributeCompletionEntries, AttributeCompletionKind, buildAttributeCompletionTable, getAttributeCompletionSymbol} from './attribute_completions';
import {DisplayInfo, DisplayInfoKind, getDirectiveDisplayInfo, getSymbolDisplayInfo, getTsSymbolDisplayInfo, unsafeCastDisplayInfoKindToScriptElementKind} from './display_parts';
import {TargetContext, TargetNodeKind, TemplateTarget} from './template_target';
import {filterAliasImports} from './utils';

type PropertyExpressionCompletionBuilder =
    CompletionBuilder<PropertyRead|PropertyWrite|MethodCall|EmptyExpr|SafePropertyRead|
                      SafeMethodCall|TmplAstBoundEvent>;

type ElementAttributeCompletionBuilder =
    CompletionBuilder<TmplAstElement|TmplAstBoundAttribute|TmplAstTextAttribute|TmplAstBoundEvent>;

type PipeCompletionBuilder = CompletionBuilder<BindingPipe>;

export enum CompletionNodeContext {
  None,
  ElementTag,
  ElementAttributeKey,
  ElementAttributeValue,
  EventValue,
  TwoWayBinding,
}

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
  private readonly nodeParent = this.targetDetails.parent;
  private readonly nodeContext = nodeContextFromTarget(this.targetDetails.context);
  private readonly template = this.targetDetails.template;
  private readonly position = this.targetDetails.position;

  constructor(
      private readonly tsLS: ts.LanguageService, private readonly compiler: NgCompiler,
      private readonly component: ts.ClassDeclaration, private readonly node: N,
      private readonly targetDetails: TemplateTarget) {}

  /**
   * Analogue for `ts.LanguageService.getCompletionsAtPosition`.
   */
  getCompletionsAtPosition(options: ts.GetCompletionsAtPositionOptions|
                           undefined): ts.WithMetadata<ts.CompletionInfo>|undefined {
    if (this.isPropertyExpressionCompletion()) {
      return this.getPropertyExpressionCompletion(options);
    } else if (this.isElementTagCompletion()) {
      return this.getElementTagCompletion();
    } else if (this.isElementAttributeCompletion()) {
      return this.getElementAttributeCompletions();
    } else if (this.isPipeCompletion()) {
      return this.getPipeCompletions();
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
    } else if (this.isElementTagCompletion()) {
      return this.getElementTagCompletionDetails(entryName);
    } else if (this.isElementAttributeCompletion()) {
      return this.getElementAttributeCompletionDetails(entryName);
    }
  }

  /**
   * Analogue for `ts.LanguageService.getCompletionEntrySymbol`.
   */
  getCompletionEntrySymbol(name: string): ts.Symbol|undefined {
    if (this.isPropertyExpressionCompletion()) {
      return this.getPropertyExpressionCompletionSymbol(name);
    } else if (this.isElementTagCompletion()) {
      return this.getElementTagCompletionSymbol(name);
    } else if (this.isElementAttributeCompletion()) {
      return this.getElementAttributeCompletionSymbol(name);
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
        // BoundEvent nodes only count as property completions if in an EventValue context.
        (this.node instanceof BoundEvent && this.nodeContext === CompletionNodeContext.EventValue);
  }

  /**
   * Get completions for property expressions.
   */
  private getPropertyExpressionCompletion(
      this: PropertyExpressionCompletionBuilder,
      options: ts.GetCompletionsAtPositionOptions|
      undefined): ts.WithMetadata<ts.CompletionInfo>|undefined {
    if (this.node instanceof EmptyExpr || this.node instanceof BoundEvent ||
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

      const replacementSpan = makeReplacementSpanFromAst(this.node);

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
    if (this.node instanceof EmptyExpr || this.node instanceof BoundEvent ||
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
        this.node instanceof BoundEvent || this.node.receiver instanceof ImplicitReceiver) {
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

    const replacementSpan = makeReplacementSpanFromAst(this.node);

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
          getSymbolDisplayInfo(this.tsLS, this.typeChecker, symbol);
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

  private isElementTagCompletion(): this is CompletionBuilder<TmplAstElement|TmplAstText> {
    if (this.node instanceof TmplAstText) {
      const positionInTextNode = this.position - this.node.sourceSpan.start.offset;
      // We only provide element completions in a text node when there is an open tag immediately to
      // the left of the position.
      return this.node.value.substring(0, positionInTextNode).endsWith('<');
    } else if (this.node instanceof TmplAstElement) {
      return this.nodeContext === CompletionNodeContext.ElementTag;
    }
    return false;
  }

  private getElementTagCompletion(this: CompletionBuilder<TmplAstElement|TmplAstText>):
      ts.WithMetadata<ts.CompletionInfo>|undefined {
    const templateTypeChecker = this.compiler.getTemplateTypeChecker();

    let start: number;
    let length: number;
    if (this.node instanceof TmplAstElement) {
      // The replacementSpan is the tag name.
      start = this.node.sourceSpan.start.offset + 1;  // account for leading '<'
      length = this.node.name.length;
    } else {
      const positionInTextNode = this.position - this.node.sourceSpan.start.offset;
      const textToLeftOfPosition = this.node.value.substring(0, positionInTextNode);
      start = this.node.sourceSpan.start.offset + textToLeftOfPosition.lastIndexOf('<') + 1;
      // We only autocomplete immediately after the < so we don't replace any existing text
      length = 0;
    }

    const replacementSpan: ts.TextSpan = {start, length};

    let potentialTags = Array.from(templateTypeChecker.getPotentialElementTags(this.component));
    // Don't provide non-Angular tags (directive === null) because we expect other extensions (i.e.
    // Emmet) to provide those for HTML files.
    potentialTags = potentialTags.filter(([_, directive]) => directive !== null);
    const entries: ts.CompletionEntry[] = potentialTags.map(([tag, directive]) => ({
                                                              kind: tagCompletionKind(directive),
                                                              name: tag,
                                                              sortText: tag,
                                                              replacementSpan,
                                                            }));

    return {
      entries,
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
    };
  }

  private getElementTagCompletionDetails(
      this: CompletionBuilder<TmplAstElement|TmplAstText>,
      entryName: string): ts.CompletionEntryDetails|undefined {
    const templateTypeChecker = this.compiler.getTemplateTypeChecker();

    const tagMap = templateTypeChecker.getPotentialElementTags(this.component);
    if (!tagMap.has(entryName)) {
      return undefined;
    }

    const directive = tagMap.get(entryName)!;
    let displayParts: ts.SymbolDisplayPart[];
    let documentation: ts.SymbolDisplayPart[]|undefined = undefined;
    if (directive === null) {
      displayParts = [];
    } else {
      const displayInfo = getDirectiveDisplayInfo(this.tsLS, directive);
      displayParts = displayInfo.displayParts;
      documentation = displayInfo.documentation;
    }

    return {
      kind: tagCompletionKind(directive),
      name: entryName,
      kindModifiers: ts.ScriptElementKindModifier.none,
      displayParts,
      documentation,
    };
  }

  private getElementTagCompletionSymbol(
      this: CompletionBuilder<TmplAstElement|TmplAstText>, entryName: string): ts.Symbol|undefined {
    const templateTypeChecker = this.compiler.getTemplateTypeChecker();

    const tagMap = templateTypeChecker.getPotentialElementTags(this.component);
    if (!tagMap.has(entryName)) {
      return undefined;
    }

    const directive = tagMap.get(entryName)!;
    return directive?.tsSymbol;
  }

  private isElementAttributeCompletion(): this is ElementAttributeCompletionBuilder {
    return (this.nodeContext === CompletionNodeContext.ElementAttributeKey ||
            this.nodeContext === CompletionNodeContext.TwoWayBinding) &&
        (this.node instanceof TmplAstElement || this.node instanceof TmplAstBoundAttribute ||
         this.node instanceof TmplAstTextAttribute || this.node instanceof TmplAstBoundEvent);
  }

  private getElementAttributeCompletions(this: ElementAttributeCompletionBuilder):
      ts.WithMetadata<ts.CompletionInfo>|undefined {
    let element: TmplAstElement|TmplAstTemplate;
    if (this.node instanceof TmplAstElement) {
      element = this.node;
    } else if (
        this.nodeParent instanceof TmplAstElement || this.nodeParent instanceof TmplAstTemplate) {
      element = this.nodeParent;
    } else {
      // Nothing to do without an element to process.
      return undefined;
    }

    let replacementSpan: ts.TextSpan|undefined = undefined;
    if ((this.node instanceof TmplAstBoundAttribute || this.node instanceof TmplAstBoundEvent ||
         this.node instanceof TmplAstTextAttribute) &&
        this.node.keySpan !== undefined) {
      replacementSpan = makeReplacementSpanFromParseSourceSpan(this.node.keySpan);
    }

    const attrTable = buildAttributeCompletionTable(
        this.component, element, this.compiler.getTemplateTypeChecker());

    let entries: ts.CompletionEntry[] = [];

    for (const completion of attrTable.values()) {
      // First, filter out completions that don't make sense for the current node. For example, if
      // the user is completing on a property binding `[foo|]`, don't offer output event
      // completions.
      switch (completion.kind) {
        case AttributeCompletionKind.DomAttribute:
        case AttributeCompletionKind.DomProperty:
          if (this.node instanceof TmplAstBoundEvent) {
            continue;
          }
          break;
        case AttributeCompletionKind.DirectiveInput:
          if (this.node instanceof TmplAstBoundEvent) {
            continue;
          }
          if (!completion.twoWayBindingSupported &&
              this.nodeContext === CompletionNodeContext.TwoWayBinding) {
            continue;
          }
          break;
        case AttributeCompletionKind.DirectiveOutput:
          if (this.node instanceof TmplAstBoundAttribute) {
            continue;
          }
          break;
        case AttributeCompletionKind.DirectiveAttribute:
          if (this.node instanceof TmplAstBoundAttribute ||
              this.node instanceof TmplAstBoundEvent) {
            continue;
          }
          break;
      }

      // Is the completion in an attribute context (instead of a property context)?
      const isAttributeContext =
          (this.node instanceof TmplAstElement || this.node instanceof TmplAstTextAttribute);
      // Is the completion for an element (not an <ng-template>)?
      const isElementContext =
          this.node instanceof TmplAstElement || this.nodeParent instanceof TmplAstElement;
      addAttributeCompletionEntries(
          entries, completion, isAttributeContext, isElementContext, replacementSpan);
    }

    return {
      entries,
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: true,
    };
  }

  private getElementAttributeCompletionDetails(
      this: ElementAttributeCompletionBuilder, entryName: string): ts.CompletionEntryDetails
      |undefined {
    // `entryName` here may be `foo` or `[foo]`, depending on which suggested completion the user
    // chose. Strip off any binding syntax to get the real attribute name.
    const {name, kind} = stripBindingSugar(entryName);

    let element: TmplAstElement|TmplAstTemplate;
    if (this.node instanceof TmplAstElement || this.node instanceof TmplAstTemplate) {
      element = this.node;
    } else if (
        this.nodeParent instanceof TmplAstElement || this.nodeParent instanceof TmplAstTemplate) {
      element = this.nodeParent;
    } else {
      // Nothing to do without an element to process.
      return undefined;
    }

    const attrTable = buildAttributeCompletionTable(
        this.component, element, this.compiler.getTemplateTypeChecker());

    if (!attrTable.has(name)) {
      return undefined;
    }

    const completion = attrTable.get(name)!;
    let displayParts: ts.SymbolDisplayPart[];
    let documentation: ts.SymbolDisplayPart[]|undefined = undefined;
    let info: DisplayInfo|null;
    switch (completion.kind) {
      case AttributeCompletionKind.DomAttribute:
      case AttributeCompletionKind.DomProperty:
        // TODO(alxhub): ideally we would show the same documentation as quick info here. However,
        // since these bindings don't exist in the TCB, there is no straightforward way to retrieve
        // a `ts.Symbol` for the field in the TS DOM definition.
        displayParts = [];
        break;
      case AttributeCompletionKind.DirectiveAttribute:
        info = getDirectiveDisplayInfo(this.tsLS, completion.directive);
        displayParts = info.displayParts;
        documentation = info.documentation;
        break;
      case AttributeCompletionKind.DirectiveInput:
      case AttributeCompletionKind.DirectiveOutput:
        const propertySymbol = getAttributeCompletionSymbol(completion, this.typeChecker);
        if (propertySymbol === null) {
          return undefined;
        }

        info = getTsSymbolDisplayInfo(
            this.tsLS, this.typeChecker, propertySymbol,
            completion.kind === AttributeCompletionKind.DirectiveInput ? DisplayInfoKind.PROPERTY :
                                                                         DisplayInfoKind.EVENT,
            completion.directive.tsSymbol.name);
        if (info === null) {
          return undefined;
        }
        displayParts = info.displayParts;
        documentation = info.documentation;
    }

    return {
      name: entryName,
      kind: unsafeCastDisplayInfoKindToScriptElementKind(kind),
      kindModifiers: ts.ScriptElementKindModifier.none,
      displayParts: [],
      documentation,
    };
  }

  private getElementAttributeCompletionSymbol(
      this: ElementAttributeCompletionBuilder, attribute: string): ts.Symbol|undefined {
    const {name} = stripBindingSugar(attribute);

    let element: TmplAstElement|TmplAstTemplate;
    if (this.node instanceof TmplAstElement || this.node instanceof TmplAstTemplate) {
      element = this.node;
    } else if (
        this.nodeParent instanceof TmplAstElement || this.nodeParent instanceof TmplAstTemplate) {
      element = this.nodeParent;
    } else {
      // Nothing to do without an element to process.
      return undefined;
    }

    const attrTable = buildAttributeCompletionTable(
        this.component, element, this.compiler.getTemplateTypeChecker());

    if (!attrTable.has(name)) {
      return undefined;
    }

    const completion = attrTable.get(name)!;
    return getAttributeCompletionSymbol(completion, this.typeChecker) ?? undefined;
  }

  private isPipeCompletion(): this is PipeCompletionBuilder {
    return this.node instanceof BindingPipe;
  }

  private getPipeCompletions(this: PipeCompletionBuilder):
      ts.WithMetadata<ts.CompletionInfo>|undefined {
    const pipes = this.templateTypeChecker.getPipesInScope(this.component);
    if (pipes === null) {
      return undefined;
    }

    const replacementSpan = makeReplacementSpanFromAst(this.node);

    const entries: ts.CompletionEntry[] =
        pipes.map(pipe => ({
                    name: pipe.name,
                    sortText: pipe.name,
                    kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PIPE),
                    replacementSpan,
                  }));
    return {
      entries,
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
    };
  }
}

function makeReplacementSpanFromParseSourceSpan(span: ParseSourceSpan): ts.TextSpan {
  return {
    start: span.start.offset,
    length: span.end.offset - span.start.offset,
  };
}

function makeReplacementSpanFromAst(node: PropertyRead|PropertyWrite|MethodCall|SafePropertyRead|
                                    SafeMethodCall|BindingPipe|EmptyExpr|LiteralPrimitive|
                                    BoundEvent): ts.TextSpan|undefined {
  if ((node instanceof EmptyExpr || node instanceof LiteralPrimitive ||
       node instanceof BoundEvent)) {
    // empty nodes do not replace any existing text
    return undefined;
  }

  return {
    start: node.nameSpan.start,
    length: node.nameSpan.end - node.nameSpan.start,
  };
}

function tagCompletionKind(directive: DirectiveInScope|null): ts.ScriptElementKind {
  let kind: DisplayInfoKind;
  if (directive === null) {
    kind = DisplayInfoKind.ELEMENT;
  } else if (directive.isComponent) {
    kind = DisplayInfoKind.COMPONENT;
  } else {
    kind = DisplayInfoKind.DIRECTIVE;
  }
  return unsafeCastDisplayInfoKindToScriptElementKind(kind);
}

const BINDING_SUGAR = /[\[\(\)\]]/g;

function stripBindingSugar(binding: string): {name: string, kind: DisplayInfoKind} {
  const name = binding.replace(BINDING_SUGAR, '');
  if (binding.startsWith('[')) {
    return {name, kind: DisplayInfoKind.PROPERTY};
  } else if (binding.startsWith('(')) {
    return {name, kind: DisplayInfoKind.EVENT};
  } else {
    return {name, kind: DisplayInfoKind.ATTRIBUTE};
  }
}

function nodeContextFromTarget(target: TargetContext): CompletionNodeContext {
  switch (target.kind) {
    case TargetNodeKind.ElementInTagContext:
      return CompletionNodeContext.ElementTag;
    case TargetNodeKind.ElementInBodyContext:
      // Completions in element bodies are for new attributes.
      return CompletionNodeContext.ElementAttributeKey;
    case TargetNodeKind.TwoWayBindingContext:
      return CompletionNodeContext.TwoWayBinding;
    case TargetNodeKind.AttributeInKeyContext:
      return CompletionNodeContext.ElementAttributeKey;
    case TargetNodeKind.AttributeInValueContext:
      if (target.node instanceof TmplAstBoundEvent) {
        return CompletionNodeContext.EventValue;
      } else {
        return CompletionNodeContext.None;
      }
    default:
      // No special context is available.
      return CompletionNodeContext.None;
  }
}
