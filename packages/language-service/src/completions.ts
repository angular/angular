/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ASTWithSource,
  BindingPipe,
  BindingType,
  EmptyExpr,
  ImplicitReceiver,
  LiteralPrimitive,
  ParsedEventType,
  ParseSourceSpan,
  PropertyRead,
  PropertyWrite,
  SafePropertyRead,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstBoundEvent as BoundEvent,
  TmplAstElement,
  TmplAstNode,
  TmplAstReference,
  TmplAstSwitchBlock as SwitchBlock,
  TmplAstTemplate,
  TmplAstText,
  TmplAstTextAttribute,
  TmplAstTextAttribute as TextAttribute,
  TmplAstUnknownBlock as UnknownBlock,
  TmplAstVariable,
  TmplAstLetDeclaration,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {
  CompletionKind,
  PotentialDirective,
  SymbolKind,
  TemplateDeclarationSymbol,
  TemplateTypeChecker,
} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';

import {
  addAttributeCompletionEntries,
  AsciiSortPriority,
  AttributeCompletionKind,
  buildAnimationCompletionEntries,
  buildAttributeCompletionTable,
  getAttributeCompletionSymbol,
} from './attribute_completions';
import {
  DisplayInfo,
  DisplayInfoKind,
  getDirectiveDisplayInfo,
  getSymbolDisplayInfo,
  getTsSymbolDisplayInfo,
  unsafeCastDisplayInfoKindToScriptElementKind,
} from './utils/display_parts';
import {TargetContext, TargetNodeKind, TemplateTarget} from './template_target';
import {
  getCodeActionToImportTheDirectiveDeclaration,
  standaloneTraitOrNgModule,
} from './utils/ts_utils';
import {filterAliasImports, isBoundEventWithSyntheticHandler, isWithin} from './utils';

type PropertyExpressionCompletionBuilder = CompletionBuilder<
  PropertyRead | PropertyWrite | EmptyExpr | SafePropertyRead | TmplAstBoundEvent
>;

type ElementAttributeCompletionBuilder = CompletionBuilder<
  TmplAstElement | TmplAstBoundAttribute | TmplAstTextAttribute | TmplAstBoundEvent
>;

type PipeCompletionBuilder = CompletionBuilder<BindingPipe>;

type LiteralCompletionBuilder = CompletionBuilder<LiteralPrimitive | TextAttribute>;

type ElementAnimationCompletionBuilder = CompletionBuilder<
  TmplAstBoundAttribute | TmplAstBoundEvent
>;

type BlockCompletionBuilder = CompletionBuilder<UnknownBlock>;

type LetCompletionBuilder = CompletionBuilder<TmplAstLetDeclaration>;

export enum CompletionNodeContext {
  None,
  ElementTag,
  ElementAttributeKey,
  ElementAttributeValue,
  EventValue,
  TwoWayBinding,
}

const ANIMATION_PHASES = ['start', 'done'];

function buildBlockSnippet(insertSnippet: boolean, blockName: string, withParens: boolean): string {
  if (!insertSnippet) {
    return blockName;
  }
  if (blockName === 'for') {
    return `${blockName} (\${1:item} of \${2:items}; track \${3:\\$index}) {$4}`;
  }
  if (withParens) {
    return `${blockName} ($1) {$2}`;
  }
  return `${blockName} {$1}`;
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
export class CompletionBuilder<N extends TmplAstNode | AST> {
  private readonly typeChecker: ts.TypeChecker;
  private readonly templateTypeChecker: TemplateTypeChecker;
  private readonly nodeParent: TmplAstNode | AST | null;
  private readonly nodeContext: CompletionNodeContext;
  private readonly template: TmplAstTemplate | null;
  private readonly position: number;

  constructor(
    private readonly tsLS: ts.LanguageService,
    private readonly compiler: NgCompiler,
    private readonly component: ts.ClassDeclaration,
    private readonly node: N,
    private readonly targetDetails: TemplateTarget,
  ) {
    this.typeChecker = this.compiler.getCurrentProgram().getTypeChecker();
    this.templateTypeChecker = this.compiler.getTemplateTypeChecker();
    this.nodeParent = this.targetDetails.parent;
    this.nodeContext = nodeContextFromTarget(this.targetDetails.context);
    this.template = this.targetDetails.template;
    this.position = this.targetDetails.position;
  }

  /**
   * Analogue for `ts.LanguageService.getCompletionsAtPosition`.
   */
  getCompletionsAtPosition(
    options: ts.GetCompletionsAtPositionOptions | undefined,
  ): ts.WithMetadata<ts.CompletionInfo> | undefined {
    if (this.isPropertyExpressionCompletion()) {
      return this.getPropertyExpressionCompletion(options);
    } else if (this.isElementTagCompletion()) {
      return this.getElementTagCompletion();
    } else if (this.isElementAttributeCompletion()) {
      if (this.isAnimationCompletion()) {
        return this.getAnimationCompletions();
      } else {
        return this.getElementAttributeCompletions(options);
      }
    } else if (this.isPipeCompletion()) {
      return this.getPipeCompletions();
    } else if (this.isLiteralCompletion()) {
      return this.getLiteralCompletions(options);
    } else if (this.isBlockCompletion()) {
      return this.getBlockCompletions(options);
    } else if (this.isLetCompletion()) {
      return this.getGlobalPropertyExpressionCompletion(options);
    } else {
      return undefined;
    }
  }

  private isLetCompletion(): this is LetCompletionBuilder {
    return this.node instanceof TmplAstLetDeclaration;
  }

  private isBlockCompletion(): this is BlockCompletionBuilder {
    return this.node instanceof UnknownBlock;
  }

  private getBlockCompletions(
    this: BlockCompletionBuilder,
    options: ts.GetCompletionsAtPositionOptions | undefined,
  ): ts.WithMetadata<ts.CompletionInfo> | undefined {
    const blocksWithParens = ['if', 'else if', 'for', 'switch', 'case', 'defer'];
    const blocksWithoutParens = ['else', 'empty', 'placeholder', 'error', 'loading', 'default'];

    // Determine whether to provide a snippet, which includes parens and curly braces.
    // If the block has any expressions or a body, don't provide a snippet as the completion.
    // TODO: We can be smarter about this, e.g. include `default` in `switch` if it is missing.
    const incompleteBlockHasExpressionsOrBody =
      this.node.sourceSpan
        .toString()
        .substring(1 + this.node.name.length)
        .trim().length > 0;
    const useSnippet =
      (options?.includeCompletionsWithSnippetText ?? false) && !incompleteBlockHasExpressionsOrBody;

    // Generate the list of completions, one for each block.
    // TODO: Exclude connected blocks (e.g. `else` when the preceding block isn't `if` or `else
    // if`).
    const partialCompletionEntryWholeBlock = {
      kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.BLOCK),
      replacementSpan: {
        start: this.node.sourceSpan.start.offset + 1,
        length: this.node.name.length,
      },
    };
    let completionKeywords: string[] = [...blocksWithParens, ...blocksWithoutParens];
    if (this.nodeParent instanceof SwitchBlock) {
      completionKeywords = ['case', 'default'];
    }
    const completionEntries: ts.CompletionEntry[] = completionKeywords.map((name) => ({
      name,
      sortText: `${AsciiSortPriority.First}${name}`,
      insertText: buildBlockSnippet(useSnippet, name, blocksWithParens.includes(name)),
      isSnippet: useSnippet || undefined,
      ...partialCompletionEntryWholeBlock,
    }));

    // Return the completions.
    const completionInfo: ts.CompletionInfo = {
      flags: ts.CompletionInfoFlags.IsContinuation,
      isMemberCompletion: false,
      isGlobalCompletion: false,
      isNewIdentifierLocation: false,
      entries: completionEntries,
    };
    return completionInfo;
  }

  private isLiteralCompletion(): this is LiteralCompletionBuilder {
    return (
      this.node instanceof LiteralPrimitive ||
      (this.node instanceof TextAttribute &&
        this.nodeContext === CompletionNodeContext.ElementAttributeValue)
    );
  }

  private getLiteralCompletions(
    this: LiteralCompletionBuilder,
    options: ts.GetCompletionsAtPositionOptions | undefined,
  ): ts.WithMetadata<ts.CompletionInfo> | undefined {
    const location = this.compiler
      .getTemplateTypeChecker()
      .getLiteralCompletionLocation(this.node, this.component);
    if (location === null) {
      return undefined;
    }
    const tsResults = this.tsLS.getCompletionsAtPosition(
      location.tcbPath,
      location.positionInFile,
      options,
    );
    if (tsResults === undefined) {
      return undefined;
    }

    let replacementSpan: ts.TextSpan | undefined;
    if (this.node instanceof TextAttribute && this.node.value.length > 0 && this.node.valueSpan) {
      replacementSpan = {
        start: this.node.valueSpan.start.offset,
        length: this.node.value.length,
      };
    }
    if (this.node instanceof LiteralPrimitive) {
      if (typeof this.node.value === 'string' && this.node.value.length > 0) {
        replacementSpan = {
          // The sourceSpan of `LiteralPrimitive` includes the open quote and the completion
          // entries
          // don't, so skip the open quote here.
          start: this.node.sourceSpan.start + 1,
          length: this.node.value.length,
        };
      } else if (typeof this.node.value === 'number') {
        replacementSpan = {
          start: this.node.sourceSpan.start,
          length: this.node.value.toString().length,
        };
      }
    }

    let ngResults: ts.CompletionEntry[] = [];
    for (const result of tsResults.entries) {
      if (this.isValidNodeContextCompletion(result)) {
        ngResults.push({
          ...result,
          replacementSpan,
        });
      }
    }
    return {
      ...tsResults,
      entries: ngResults,
    };
  }

  /**
   * Analogue for `ts.LanguageService.getCompletionEntryDetails`.
   */
  getCompletionEntryDetails(
    entryName: string,
    formatOptions: ts.FormatCodeOptions | ts.FormatCodeSettings | undefined,
    preferences: ts.UserPreferences | undefined,
    data: ts.CompletionEntryData | undefined,
  ): ts.CompletionEntryDetails | undefined {
    if (this.isPropertyExpressionCompletion()) {
      return this.getPropertyExpressionCompletionDetails(
        entryName,
        formatOptions,
        preferences,
        data,
      );
    } else if (this.isElementTagCompletion()) {
      return this.getElementTagCompletionDetails(entryName);
    } else if (this.isElementAttributeCompletion()) {
      return this.getElementAttributeCompletionDetails(entryName);
    }
    return undefined;
  }

  /**
   * Analogue for `ts.LanguageService.getCompletionEntrySymbol`.
   */
  getCompletionEntrySymbol(name: string): ts.Symbol | undefined {
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
  private isPropertyExpressionCompletion(
    this: CompletionBuilder<TmplAstNode | AST>,
  ): this is PropertyExpressionCompletionBuilder {
    return (
      this.node instanceof PropertyRead ||
      this.node instanceof SafePropertyRead ||
      this.node instanceof PropertyWrite ||
      this.node instanceof EmptyExpr ||
      // BoundEvent nodes only count as property completions if in an EventValue context.
      (this.node instanceof BoundEvent && this.nodeContext === CompletionNodeContext.EventValue)
    );
  }

  /**
   * Get completions for property expressions.
   */
  private getPropertyExpressionCompletion(
    this: PropertyExpressionCompletionBuilder,
    options: ts.GetCompletionsAtPositionOptions | undefined,
  ): ts.WithMetadata<ts.CompletionInfo> | undefined {
    if (
      this.node instanceof EmptyExpr ||
      this.node instanceof BoundEvent ||
      this.node.receiver instanceof ImplicitReceiver
    ) {
      return this.getGlobalPropertyExpressionCompletion(options);
    } else {
      const location = this.templateTypeChecker.getExpressionCompletionLocation(
        this.node,
        this.component,
      );
      if (location === null) {
        return undefined;
      }
      const tsResults = this.tsLS.getCompletionsAtPosition(
        location.tcbPath,
        location.positionInFile,
        options,
      );
      if (tsResults === undefined) {
        return undefined;
      }

      const replacementSpan = makeReplacementSpanFromAst(this.node);

      if (
        !(this.node.receiver instanceof ImplicitReceiver) &&
        !(this.node instanceof SafePropertyRead) &&
        options?.includeCompletionsWithInsertText &&
        options.includeAutomaticOptionalChainCompletions !== false
      ) {
        const symbol = this.templateTypeChecker.getSymbolOfNode(this.node.receiver, this.component);
        if (symbol?.kind === SymbolKind.Expression) {
          const type = symbol.tsType;
          const nonNullableType = this.typeChecker.getNonNullableType(type);
          if (type !== nonNullableType && replacementSpan !== undefined) {
            // Shift the start location back one so it includes the `.` of the property access.
            // In combination with the options above, this will indicate to the TS LS to include
            // optional chaining completions `?.` for nullable types.
            replacementSpan.start--;
            replacementSpan.length++;
          }
        }
      }

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
    this: PropertyExpressionCompletionBuilder,
    entryName: string,
    formatOptions: ts.FormatCodeOptions | ts.FormatCodeSettings | undefined,
    preferences: ts.UserPreferences | undefined,
    data: ts.CompletionEntryData | undefined,
  ): ts.CompletionEntryDetails | undefined {
    let details: ts.CompletionEntryDetails | undefined = undefined;
    if (
      this.node instanceof EmptyExpr ||
      this.node instanceof BoundEvent ||
      this.node.receiver instanceof ImplicitReceiver
    ) {
      details = this.getGlobalPropertyExpressionCompletionDetails(
        entryName,
        formatOptions,
        preferences,
        data,
      );
    } else {
      const location = this.compiler
        .getTemplateTypeChecker()
        .getExpressionCompletionLocation(this.node, this.component);
      if (location === null) {
        return undefined;
      }
      details = this.tsLS.getCompletionEntryDetails(
        location.tcbPath,
        location.positionInFile,
        entryName,
        formatOptions,
        /* source */ undefined,
        preferences,
        data,
      );
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
    this: PropertyExpressionCompletionBuilder,
    name: string,
  ): ts.Symbol | undefined {
    if (
      this.node instanceof EmptyExpr ||
      this.node instanceof LiteralPrimitive ||
      this.node instanceof BoundEvent ||
      this.node.receiver instanceof ImplicitReceiver
    ) {
      return this.getGlobalPropertyExpressionCompletionSymbol(name);
    } else {
      const location = this.compiler
        .getTemplateTypeChecker()
        .getExpressionCompletionLocation(this.node, this.component);
      if (location === null) {
        return undefined;
      }
      return this.tsLS.getCompletionEntrySymbol(
        location.tcbPath,
        location.positionInFile,
        name,
        /* source */ undefined,
      );
    }
  }

  /**
   * Get completions for a property expression in a global context (e.g. `{{y|}}`).
   */
  private getGlobalPropertyExpressionCompletion(
    this: PropertyExpressionCompletionBuilder | LetCompletionBuilder,
    options: ts.GetCompletionsAtPositionOptions | undefined,
  ): ts.WithMetadata<ts.CompletionInfo> | undefined {
    const completions = this.templateTypeChecker.getGlobalCompletions(
      this.template,
      this.component,
      this.node,
    );
    if (completions === null) {
      return undefined;
    }

    const {componentContext, templateContext, nodeContext: astContext} = completions;

    const replacementSpan = makeReplacementSpanFromAst(this.node);

    // Merge TS completion results with results from the template scope.
    let entries: ts.CompletionEntry[] = [];
    const componentCompletions = this.tsLS.getCompletionsAtPosition(
      componentContext.tcbPath,
      componentContext.positionInFile,
      options,
    );
    if (componentCompletions !== undefined) {
      for (const tsCompletion of componentCompletions.entries) {
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

    // Merge TS completion results with results from the ast context.
    if (astContext !== null) {
      const nodeCompletions = this.tsLS.getCompletionsAtPosition(
        astContext.tcbPath,
        astContext.positionInFile,
        options,
      );
      if (nodeCompletions !== undefined) {
        for (const tsCompletion of nodeCompletions.entries) {
          if (this.isValidNodeContextCompletion(tsCompletion)) {
            entries.push({
              ...tsCompletion,
              // Substitute the TS completion's `replacementSpan` (which uses offsets within the
              // TCB) with the `replacementSpan` within the template source.
              replacementSpan,
            });
          }
        }
      }
    }

    for (const [name, entity] of templateContext) {
      let displayInfo: DisplayInfoKind;

      if (entity.kind === CompletionKind.Reference) {
        displayInfo = DisplayInfoKind.REFERENCE;
      } else if (entity.kind === CompletionKind.LetDeclaration) {
        displayInfo = DisplayInfoKind.LET;
      } else {
        displayInfo = DisplayInfoKind.VARIABLE;
      }

      entries.push({
        name,
        sortText: name,
        replacementSpan,
        kindModifiers: ts.ScriptElementKindModifier.none,
        kind: unsafeCastDisplayInfoKindToScriptElementKind(displayInfo),
      });
    }

    return {
      entries,
      // Although this completion is "global" in the sense of an Angular expression (there is no
      // explicit receiver), it is not "global" in a TypeScript sense since Angular expressions
      // have the component as an implicit receiver.
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
    this: PropertyExpressionCompletionBuilder,
    entryName: string,
    formatOptions: ts.FormatCodeOptions | ts.FormatCodeSettings | undefined,
    preferences: ts.UserPreferences | undefined,
    data: ts.CompletionEntryData | undefined,
  ): ts.CompletionEntryDetails | undefined {
    const completions = this.templateTypeChecker.getGlobalCompletions(
      this.template,
      this.component,
      this.node,
    );
    if (completions === null) {
      return undefined;
    }
    const {componentContext, templateContext} = completions;

    if (templateContext.has(entryName)) {
      const entry = templateContext.get(entryName)!;
      // Entries that reference a symbol in the template context refer either to local references
      // or variables.
      const symbol = this.templateTypeChecker.getSymbolOfNode(
        entry.node,
        this.component,
      ) as TemplateDeclarationSymbol | null;
      if (symbol === null) {
        return undefined;
      }

      const {kind, displayParts, documentation, tags} = getSymbolDisplayInfo(
        this.tsLS,
        this.typeChecker,
        symbol,
      );
      return {
        kind: unsafeCastDisplayInfoKindToScriptElementKind(kind),
        name: entryName,
        kindModifiers: ts.ScriptElementKindModifier.none,
        displayParts,
        documentation,
        tags,
      };
    } else {
      return this.tsLS.getCompletionEntryDetails(
        componentContext.tcbPath,
        componentContext.positionInFile,
        entryName,
        formatOptions,
        /* source */ undefined,
        preferences,
        data,
      );
    }
  }

  /**
   * Get the `ts.Symbol` of a specific completion for a property expression in a global context
   * (e.g. `{{y|}}`).
   */
  private getGlobalPropertyExpressionCompletionSymbol(
    this: PropertyExpressionCompletionBuilder,
    entryName: string,
  ): ts.Symbol | undefined {
    const completions = this.templateTypeChecker.getGlobalCompletions(
      this.template,
      this.component,
      this.node,
    );
    if (completions === null) {
      return undefined;
    }
    const {componentContext, templateContext} = completions;
    if (templateContext.has(entryName)) {
      const node: TmplAstReference | TmplAstVariable | TmplAstLetDeclaration =
        templateContext.get(entryName)!.node;
      const symbol = this.templateTypeChecker.getSymbolOfNode(
        node,
        this.component,
      ) as TemplateDeclarationSymbol | null;
      if (symbol === null || symbol.tsSymbol === null) {
        return undefined;
      }
      return symbol.tsSymbol;
    } else {
      return this.tsLS.getCompletionEntrySymbol(
        componentContext.tcbPath,
        componentContext.positionInFile,
        entryName,
        /* source */ undefined,
      );
    }
  }

  private isElementTagCompletion(): this is CompletionBuilder<TmplAstElement | TmplAstText> {
    if (this.node instanceof TmplAstText) {
      const positionInTextNode = this.position - this.node.sourceSpan.start.offset;
      // We only provide element completions in a text node when there is an open tag immediately
      // to the left of the position.
      return this.node.value.substring(0, positionInTextNode).endsWith('<');
    } else if (this.node instanceof TmplAstElement) {
      return this.nodeContext === CompletionNodeContext.ElementTag;
    }
    return false;
  }

  private getElementTagCompletion(
    this: CompletionBuilder<TmplAstElement | TmplAstText>,
  ): ts.WithMetadata<ts.CompletionInfo> | undefined {
    const templateTypeChecker = this.compiler.getTemplateTypeChecker();

    let start: number;
    let length: number;
    if (this.node instanceof TmplAstElement) {
      // The replacementSpan is the tag name.
      start = this.node.sourceSpan.start.offset + 1; // account for leading '<'
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
    // Don't provide non-Angular tags (directive === null) because we expect other extensions
    // (i.e. Emmet) to provide those for HTML files.
    potentialTags = potentialTags.filter(([_, directive]) => directive !== null);
    const entries: ts.CompletionEntry[] = potentialTags.map(([tag, directive]) => ({
      kind: tagCompletionKind(directive),
      name: tag,
      sortText: tag,
      replacementSpan,
      hasAction: directive?.isInScope === true ? undefined : true,
    }));

    return {
      entries,
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
    };
  }

  private getElementTagCompletionDetails(
    this: CompletionBuilder<TmplAstElement | TmplAstText>,
    entryName: string,
  ): ts.CompletionEntryDetails | undefined {
    const templateTypeChecker = this.compiler.getTemplateTypeChecker();

    const tagMap = templateTypeChecker.getPotentialElementTags(this.component);
    if (!tagMap.has(entryName)) {
      return undefined;
    }

    const directive = tagMap.get(entryName)!;
    let displayParts: ts.SymbolDisplayPart[];
    let documentation: ts.SymbolDisplayPart[] | undefined = undefined;
    let tags: ts.JSDocTagInfo[] | undefined = undefined;
    if (directive === null) {
      displayParts = [];
    } else {
      const displayInfo = getDirectiveDisplayInfo(this.tsLS, directive);
      displayParts = displayInfo.displayParts;
      documentation = displayInfo.documentation;
      tags = displayInfo.tags;
    }

    let codeActions: ts.CodeAction[] | undefined;

    if (!directive.isInScope) {
      const importOn = standaloneTraitOrNgModule(templateTypeChecker, this.component);

      codeActions =
        importOn !== null
          ? getCodeActionToImportTheDirectiveDeclaration(this.compiler, importOn, directive)
          : undefined;
    }

    return {
      kind: tagCompletionKind(directive),
      name: entryName,
      kindModifiers: ts.ScriptElementKindModifier.none,
      displayParts,
      documentation,
      tags,
      codeActions,
    };
  }

  private getElementTagCompletionSymbol(
    this: CompletionBuilder<TmplAstElement | TmplAstText>,
    entryName: string,
  ): ts.Symbol | undefined {
    const templateTypeChecker = this.compiler.getTemplateTypeChecker();

    const tagMap = templateTypeChecker.getPotentialElementTags(this.component);
    if (!tagMap.has(entryName)) {
      return undefined;
    }

    const directive = tagMap.get(entryName)!;
    return directive?.tsSymbol;
  }

  private isAnimationCompletion(): this is ElementAnimationCompletionBuilder {
    return (
      (this.node instanceof TmplAstBoundAttribute && this.node.type === BindingType.Animation) ||
      (this.node instanceof TmplAstBoundEvent && this.node.type === ParsedEventType.Animation)
    );
  }

  private getAnimationCompletions(
    this: ElementAnimationCompletionBuilder,
  ): ts.WithMetadata<ts.CompletionInfo> | undefined {
    if (this.node instanceof TmplAstBoundAttribute) {
      const animations = this.compiler.getTemplateTypeChecker().getDirectiveMetadata(this.component)
        ?.animationTriggerNames?.staticTriggerNames;
      const replacementSpan = makeReplacementSpanFromParseSourceSpan(this.node.keySpan);

      if (animations === undefined) {
        return undefined;
      }

      const entries = buildAnimationCompletionEntries(
        [...animations, '.disabled'],
        replacementSpan,
        DisplayInfoKind.ATTRIBUTE,
      );
      return {
        entries,
        isGlobalCompletion: false,
        isMemberCompletion: false,
        isNewIdentifierLocation: true,
      };
    } else {
      const animationNameSpan = buildAnimationNameSpan(this.node);
      const phaseSpan = buildAnimationPhaseSpan(this.node);
      if (isWithin(this.position, animationNameSpan)) {
        const animations = this.compiler
          .getTemplateTypeChecker()
          .getDirectiveMetadata(this.component)?.animationTriggerNames?.staticTriggerNames;
        const replacementSpan = makeReplacementSpanFromParseSourceSpan(animationNameSpan);

        if (animations === undefined) {
          return undefined;
        }

        const entries = buildAnimationCompletionEntries(
          animations,
          replacementSpan,
          DisplayInfoKind.EVENT,
        );
        return {
          entries,
          isGlobalCompletion: false,
          isMemberCompletion: false,
          isNewIdentifierLocation: true,
        };
      }
      if (phaseSpan !== null && isWithin(this.position, phaseSpan)) {
        const replacementSpan = makeReplacementSpanFromParseSourceSpan(phaseSpan);
        const entries = buildAnimationCompletionEntries(
          ANIMATION_PHASES,
          replacementSpan,
          DisplayInfoKind.EVENT,
        );
        return {
          entries,
          isGlobalCompletion: false,
          isMemberCompletion: false,
          isNewIdentifierLocation: true,
        };
      }
      return undefined;
    }
  }

  private isElementAttributeCompletion(): this is ElementAttributeCompletionBuilder {
    return (
      (this.nodeContext === CompletionNodeContext.ElementAttributeKey ||
        this.nodeContext === CompletionNodeContext.TwoWayBinding) &&
      (this.node instanceof TmplAstElement ||
        this.node instanceof TmplAstBoundAttribute ||
        this.node instanceof TmplAstTextAttribute ||
        this.node instanceof TmplAstBoundEvent)
    );
  }

  private getElementAttributeCompletions(
    this: ElementAttributeCompletionBuilder,
    options: ts.GetCompletionsAtPositionOptions | undefined,
  ): ts.WithMetadata<ts.CompletionInfo> | undefined {
    let element: TmplAstElement | TmplAstTemplate;
    if (this.node instanceof TmplAstElement) {
      element = this.node;
    } else if (
      this.nodeParent instanceof TmplAstElement ||
      this.nodeParent instanceof TmplAstTemplate
    ) {
      element = this.nodeParent;
    } else {
      // Nothing to do without an element to process.
      return undefined;
    }
    if (
      !element.isSelfClosing &&
      element.endSourceSpan !== null &&
      isWithin(this.position, element.endSourceSpan)
    ) {
      return undefined;
    }

    let replacementSpan: ts.TextSpan | undefined = undefined;
    if (
      (this.node instanceof TmplAstBoundAttribute ||
        this.node instanceof TmplAstBoundEvent ||
        this.node instanceof TmplAstTextAttribute) &&
      this.node.keySpan !== undefined
    ) {
      replacementSpan = makeReplacementSpanFromParseSourceSpan(this.node.keySpan);
    }

    let insertSnippet: true | undefined;
    if (options?.includeCompletionsWithSnippetText && options.includeCompletionsWithInsertText) {
      if (this.node instanceof TmplAstBoundEvent && isBoundEventWithSyntheticHandler(this.node)) {
        replacementSpan = makeReplacementSpanFromParseSourceSpan(this.node.sourceSpan);
        insertSnippet = true;
      }

      const isBoundAttributeValueEmpty =
        this.node instanceof TmplAstBoundAttribute &&
        (this.node.valueSpan === undefined ||
          (this.node.value instanceof ASTWithSource && this.node.value.ast instanceof EmptyExpr));
      if (isBoundAttributeValueEmpty) {
        replacementSpan = makeReplacementSpanFromParseSourceSpan(this.node.sourceSpan);
        insertSnippet = true;
      }

      if (this.node instanceof TmplAstTextAttribute && this.node.keySpan !== undefined) {
        // The `sourceSpan` only includes `ngFor` and the `valueSpan` is always empty even if
        // there is something there because we split this up into the desugared AST, `ngFor
        // ngForOf=""`.
        const nodeStart = this.node.keySpan.start.getContext(1, 1);
        if (nodeStart?.before[0] === '*') {
          const nodeEnd = this.node.keySpan.end.getContext(1, 1);
          if (nodeEnd?.after[0] !== '=') {
            // *ngFor -> *ngFor="¦"
            insertSnippet = true;
          }
        } else {
          if (this.node.value === '') {
            replacementSpan = makeReplacementSpanFromParseSourceSpan(this.node.sourceSpan);
            insertSnippet = true;
          }
        }
      }

      if (this.node instanceof TmplAstElement) {
        // <div ¦ />
        insertSnippet = true;
      }
    }

    const attrTable = buildAttributeCompletionTable(
      this.component,
      element,
      this.compiler.getTemplateTypeChecker(),
    );

    let entries: ts.CompletionEntry[] = [];

    for (const completion of attrTable.values()) {
      // First, filter out completions that don't make sense for the current node. For example, if
      // the user is completing on a property binding `[foo|]`, don't offer output event
      // completions.
      switch (completion.kind) {
        case AttributeCompletionKind.DomEvent:
          if (this.node instanceof TmplAstBoundAttribute) {
            continue;
          }
          break;
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
          if (
            !completion.twoWayBindingSupported &&
            this.nodeContext === CompletionNodeContext.TwoWayBinding
          ) {
            continue;
          }
          break;
        case AttributeCompletionKind.DirectiveOutput:
          if (this.node instanceof TmplAstBoundAttribute) {
            continue;
          }
          break;
        case AttributeCompletionKind.DirectiveAttribute:
          if (
            this.node instanceof TmplAstBoundAttribute ||
            this.node instanceof TmplAstBoundEvent
          ) {
            continue;
          }
          break;
      }

      // Is the completion in an attribute context (instead of a property context)?
      const isAttributeContext =
        this.node instanceof TmplAstElement || this.node instanceof TmplAstTextAttribute;
      // Is the completion for an element (not an <ng-template>)?
      const isElementContext =
        this.node instanceof TmplAstElement || this.nodeParent instanceof TmplAstElement;

      addAttributeCompletionEntries(
        entries,
        completion,
        isAttributeContext,
        isElementContext,
        replacementSpan,
        insertSnippet,
      );
    }

    return {
      entries,
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: true,
    };
  }

  private getElementAttributeCompletionDetails(
    this: ElementAttributeCompletionBuilder,
    entryName: string,
  ): ts.CompletionEntryDetails | undefined {
    // `entryName` here may be `foo` or `[foo]`, depending on which suggested completion the user
    // chose. Strip off any binding syntax to get the real attribute name.
    const {name, kind} = stripBindingSugar(entryName);

    let element: TmplAstElement | TmplAstTemplate;
    if (this.node instanceof TmplAstElement || this.node instanceof TmplAstTemplate) {
      element = this.node;
    } else if (
      this.nodeParent instanceof TmplAstElement ||
      this.nodeParent instanceof TmplAstTemplate
    ) {
      element = this.nodeParent;
    } else {
      // Nothing to do without an element to process.
      return undefined;
    }

    const attrTable = buildAttributeCompletionTable(
      this.component,
      element,
      this.compiler.getTemplateTypeChecker(),
    );

    if (!attrTable.has(name)) {
      return undefined;
    }

    const completion = attrTable.get(name)!;
    let displayParts: ts.SymbolDisplayPart[];
    let documentation: ts.SymbolDisplayPart[] | undefined = undefined;
    let tags: ts.JSDocTagInfo[] | undefined = undefined;
    let info: DisplayInfo | null;
    switch (completion.kind) {
      case AttributeCompletionKind.DomEvent:
      case AttributeCompletionKind.DomAttribute:
      case AttributeCompletionKind.DomProperty:
        // TODO(alxhub): ideally we would show the same documentation as quick info here. However,
        // since these bindings don't exist in the TCB, there is no straightforward way to
        // retrieve a `ts.Symbol` for the field in the TS DOM definition.
        displayParts = [];
        break;
      case AttributeCompletionKind.DirectiveAttribute:
        info = getDirectiveDisplayInfo(this.tsLS, completion.directive);
        displayParts = info.displayParts;
        documentation = info.documentation;
        tags = info.tags;
        break;
      case AttributeCompletionKind.StructuralDirectiveAttribute:
      case AttributeCompletionKind.DirectiveInput:
      case AttributeCompletionKind.DirectiveOutput:
        const propertySymbol = getAttributeCompletionSymbol(completion, this.typeChecker);
        if (propertySymbol === null) {
          return undefined;
        }

        let kind: DisplayInfoKind;
        if (completion.kind === AttributeCompletionKind.DirectiveInput) {
          kind = DisplayInfoKind.PROPERTY;
        } else if (completion.kind === AttributeCompletionKind.DirectiveOutput) {
          kind = DisplayInfoKind.EVENT;
        } else {
          kind = DisplayInfoKind.DIRECTIVE;
        }

        info = getTsSymbolDisplayInfo(
          this.tsLS,
          this.typeChecker,
          propertySymbol,
          kind,
          completion.directive.tsSymbol.name,
        );
        if (info === null) {
          return undefined;
        }
        displayParts = info.displayParts;
        documentation = info.documentation;
        tags = info.tags;
    }

    return {
      name: entryName,
      kind: unsafeCastDisplayInfoKindToScriptElementKind(kind),
      kindModifiers: ts.ScriptElementKindModifier.none,
      displayParts,
      documentation,
      tags,
    };
  }

  private getElementAttributeCompletionSymbol(
    this: ElementAttributeCompletionBuilder,
    attribute: string,
  ): ts.Symbol | undefined {
    const {name} = stripBindingSugar(attribute);

    let element: TmplAstElement | TmplAstTemplate;
    if (this.node instanceof TmplAstElement || this.node instanceof TmplAstTemplate) {
      element = this.node;
    } else if (
      this.nodeParent instanceof TmplAstElement ||
      this.nodeParent instanceof TmplAstTemplate
    ) {
      element = this.nodeParent;
    } else {
      // Nothing to do without an element to process.
      return undefined;
    }

    const attrTable = buildAttributeCompletionTable(
      this.component,
      element,
      this.compiler.getTemplateTypeChecker(),
    );

    if (!attrTable.has(name)) {
      return undefined;
    }

    const completion = attrTable.get(name)!;
    return getAttributeCompletionSymbol(completion, this.typeChecker) ?? undefined;
  }

  private isPipeCompletion(): this is PipeCompletionBuilder {
    return this.node instanceof BindingPipe;
  }

  private getPipeCompletions(
    this: PipeCompletionBuilder,
  ): ts.WithMetadata<ts.CompletionInfo> | undefined {
    const pipes = this.templateTypeChecker
      .getPotentialPipes(this.component)
      .filter((p) => p.isInScope);
    if (pipes === null) {
      return undefined;
    }

    const replacementSpan = makeReplacementSpanFromAst(this.node);
    const entries: ts.CompletionEntry[] = [];

    for (const pipe of pipes) {
      if (pipe.name !== null) {
        entries.push({
          name: pipe.name,
          sortText: pipe.name,
          kind: unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PIPE),
          replacementSpan,
        });
      }
    }

    return {
      entries,
      isGlobalCompletion: false,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
    };
  }

  /**
   * From the AST node of the cursor position, include completion of string literals, number
   * literals, `true`, `false`, `null`, and `undefined`.
   */
  private isValidNodeContextCompletion(completion: ts.CompletionEntry): boolean {
    if (completion.kind === ts.ScriptElementKind.string) {
      // 'string' kind includes both string literals and number literals
      return true;
    }
    if (completion.kind === ts.ScriptElementKind.keyword) {
      return (
        completion.name === 'true' || completion.name === 'false' || completion.name === 'null'
      );
    }
    if (completion.kind === ts.ScriptElementKind.variableElement) {
      return completion.name === 'undefined';
    }
    return false;
  }
}

function makeReplacementSpanFromParseSourceSpan(span: ParseSourceSpan): ts.TextSpan {
  return {
    start: span.start.offset,
    length: span.end.offset - span.start.offset,
  };
}

function makeReplacementSpanFromAst(
  node:
    | PropertyRead
    | PropertyWrite
    | SafePropertyRead
    | BindingPipe
    | EmptyExpr
    | LiteralPrimitive
    | BoundEvent
    | TmplAstLetDeclaration,
): ts.TextSpan | undefined {
  if (
    node instanceof EmptyExpr ||
    node instanceof LiteralPrimitive ||
    node instanceof BoundEvent ||
    node instanceof TmplAstLetDeclaration
  ) {
    // empty nodes do not replace any existing text
    return undefined;
  }

  return {
    start: node.nameSpan.start,
    length: node.nameSpan.end - node.nameSpan.start,
  };
}

function tagCompletionKind(directive: PotentialDirective | null): ts.ScriptElementKind {
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

function stripBindingSugar(binding: string): {name: string; kind: DisplayInfoKind} {
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
      } else if (target.node instanceof TextAttribute) {
        return CompletionNodeContext.ElementAttributeValue;
      } else {
        return CompletionNodeContext.None;
      }
    default:
      // No special context is available.
      return CompletionNodeContext.None;
  }
}

function buildAnimationNameSpan(node: TmplAstBoundEvent): ParseSourceSpan {
  return new ParseSourceSpan(node.keySpan.start, node.keySpan.start.moveBy(node.name.length));
}

function buildAnimationPhaseSpan(node: TmplAstBoundEvent): ParseSourceSpan | null {
  if (node.phase !== null) {
    return new ParseSourceSpan(node.keySpan.end.moveBy(-node.phase.length), node.keySpan.end);
  }
  return null;
}
