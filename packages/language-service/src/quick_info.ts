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
  LiteralPrimitive,
  TmplAstBlockNode,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstDeferredTrigger,
  TmplAstElement,
  TmplAstNode,
  TmplAstTextAttribute,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {
  DirectiveSymbol,
  DomBindingSymbol,
  ElementSymbol,
  InputBindingSymbol,
  LetDeclarationSymbol,
  OutputBindingSymbol,
  PipeSymbol,
  ReferenceSymbol,
  SelectorlessComponentSymbol,
  SelectorlessDirectiveSymbol,
  Symbol,
  SymbolKind,
  TcbLocation,
  VariableSymbol,
} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
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
import {
  getCSSPropertyHover,
  getCSSValueHoverAtOffset,
  isValidCSSPropertyVSCode,
  kebabToCamelCase,
} from './css';
import {getDomEventType, isValidDomEvent, getDomEventDocumentation} from './events';
import {getHtmlAttributeInfo, domPropertyToHtmlAttribute} from './html/html_data_service';
import {BindingCollector, DirectiveSummary} from './element_inspector';

/**
 * Information about directive input/output shadowing when multiple directives
 * declare the same binding name.
 */
interface ShadowingInfo {
  /** True if this binding shadows another directive's binding */
  isShadowed: boolean;
  /** Names of directives that also declare this binding */
  shadowedBy: string[];
  /** Warning message to display to the user */
  warning?: string;
}

/**
 * Convert DisplayInfoKind to TypeScript ScriptElementKind for consistent UI.
 */
function getScriptElementKindFromDisplayInfoKind(kind: DisplayInfoKind): ts.ScriptElementKind {
  switch (kind) {
    case DisplayInfoKind.COMPONENT:
      return ts.ScriptElementKind.classElement;
    case DisplayInfoKind.DIRECTIVE:
      return ts.ScriptElementKind.classElement;
    case DisplayInfoKind.ELEMENT:
      return ts.ScriptElementKind.memberVariableElement;
    case DisplayInfoKind.EVENT:
      return ts.ScriptElementKind.memberFunctionElement;
    case DisplayInfoKind.PROPERTY:
      return ts.ScriptElementKind.memberVariableElement;
    default:
      return ts.ScriptElementKind.unknown;
  }
}

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
      case SymbolKind.Expression: {
        // Check if this expression is inside a style binding's value
        const cssValueInfo = this.getQuickInfoForStyleBindingValue();
        if (cssValueInfo) {
          return cssValueInfo;
        }
        return this.getQuickInfoAtTcbLocation(symbol.tcbLocation);
      }
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

    // Check if this is a DOM event binding - provide enhanced documentation
    if (
      symbol.kind === SymbolKind.Output &&
      this.node instanceof TmplAstBoundEvent &&
      this.isDomEventBinding(symbol)
    ) {
      return this.getQuickInfoForDomEvent(this.node, symbol);
    }

    let quickInfo = this.getQuickInfoAtTcbLocation(symbol.bindings[0].tcbLocation);
    if (quickInfo === undefined) {
      return undefined;
    }

    quickInfo = updateQuickInfoKind(quickInfo, kind);

    // Check for shadowing when multiple directives have the same input/output
    const bindingName =
      this.node instanceof TmplAstBoundAttribute
        ? this.node.name
        : this.node instanceof TmplAstBoundEvent
          ? this.node.name
          : undefined;

    if (bindingName && symbol.bindings.length > 1) {
      const shadowingInfo =
        symbol.kind === SymbolKind.Input
          ? this.getInputShadowingInfo(symbol, bindingName)
          : this.getOutputShadowingInfo(symbol, bindingName);

      if (shadowingInfo.isShadowed) {
        quickInfo = this.appendShadowingWarningToQuickInfo(quickInfo, shadowingInfo);
      }
    }

    return quickInfo;
  }

  /**
   * Get shadowing information for an input binding.
   */
  private getInputShadowingInfo(symbol: InputBindingSymbol, bindingName: string): ShadowingInfo {
    const directiveNames: string[] = [];

    for (const binding of symbol.bindings) {
      if (binding.target.kind === SymbolKind.Directive) {
        const name = this.typeChecker.typeToString(binding.target.tsType);
        if (!directiveNames.includes(name)) {
          directiveNames.push(name);
        }
      }
    }

    if (directiveNames.length > 1) {
      return {
        isShadowed: true,
        shadowedBy: directiveNames,
        warning: `⚠️ **Shadowing Warning:** Multiple directives declare input \`${bindingName}\`:\n${directiveNames.map((n) => `- ${n}`).join('\n')}\n\nThe first matching directive receives the value.`,
      };
    }

    return {isShadowed: false, shadowedBy: []};
  }

  /**
   * Get shadowing information for an output binding.
   */
  private getOutputShadowingInfo(symbol: OutputBindingSymbol, bindingName: string): ShadowingInfo {
    const directiveNames: string[] = [];

    for (const binding of symbol.bindings) {
      if (binding.target.kind === SymbolKind.Directive) {
        const name = this.typeChecker.typeToString(binding.target.tsType);
        if (!directiveNames.includes(name)) {
          directiveNames.push(name);
        }
      }
    }

    if (directiveNames.length > 1) {
      return {
        isShadowed: true,
        shadowedBy: directiveNames,
        warning: `⚠️ **Shadowing Warning:** Multiple directives declare output \`${bindingName}\`:\n${directiveNames.map((n) => `- ${n}`).join('\n')}\n\nAll outputs will emit events.`,
      };
    }

    return {isShadowed: false, shadowedBy: []};
  }

  /**
   * Append a shadowing warning to existing quick info.
   */
  private appendShadowingWarningToQuickInfo(
    quickInfo: ts.QuickInfo,
    shadowingInfo: ShadowingInfo,
  ): ts.QuickInfo {
    if (!shadowingInfo.warning) {
      return quickInfo;
    }

    const existingDocs = quickInfo.documentation || [];
    const newDocs: ts.SymbolDisplayPart[] = [
      ...existingDocs,
      {kind: 'markdown', text: '\n\n---\n\n' + shadowingInfo.warning},
    ];

    return {...quickInfo, documentation: newDocs};
  }

  /**
   * Checks if an output binding symbol represents a DOM event (not a directive output).
   */
  private isDomEventBinding(symbol: OutputBindingSymbol): boolean {
    // Check if all bindings target elements (not directives)
    return symbol.bindings.every((binding) => binding.target.kind === SymbolKind.Element);
  }

  /**
   * Gets enhanced quick info for a DOM event binding like (click) or (keydown.enter).
   * Provides documentation about the event type and behavior.
   */
  private getQuickInfoForDomEvent(
    node: TmplAstBoundEvent,
    symbol: OutputBindingSymbol,
  ): ts.QuickInfo | undefined {
    const eventName = node.name;
    const eventDoc = getDomEventDocumentation(eventName);

    if (!eventDoc) {
      // Fall back to default behavior for unknown events
      const quickInfo = this.getQuickInfoAtTcbLocation(symbol.bindings[0].tcbLocation);
      return quickInfo === undefined
        ? undefined
        : updateQuickInfoKind(quickInfo, DisplayInfoKind.EVENT);
    }

    // Build display parts showing the event signature
    const displayParts: ts.SymbolDisplayPart[] = [
      {kind: 'punctuation', text: '('},
      {kind: 'keyword', text: 'event'},
      {kind: 'punctuation', text: ')'},
      {kind: 'space', text: ' '},
      {kind: 'propertyName', text: eventName},
      {kind: 'punctuation', text: ': '},
      {kind: 'interfaceName', text: eventDoc.eventType},
    ];

    // Build documentation with description and MDN link
    let documentation = eventDoc.description;

    // Add keyboard modifier hint for keyboard events
    if (
      eventDoc.eventType === 'KeyboardEvent' &&
      !eventName.includes('.') &&
      (eventName === 'keydown' || eventName === 'keyup' || eventName === 'keypress')
    ) {
      documentation += `\n\n**Tip:** You can filter by key using dot notation, e.g., \`(${eventName}.enter)\`, \`(${eventName}.escape)\`, \`(${eventName}.space)\`.`;
    }

    documentation += `\n\n[MDN Documentation](${eventDoc.mdnUrl})`;

    return {
      kind: ts.ScriptElementKind.memberVariableElement,
      kindModifiers: '',
      textSpan: {
        start: node.keySpan.start.offset,
        length: node.keySpan.end.offset - node.keySpan.start.offset,
      },
      displayParts,
      documentation: [{kind: 'markdown', text: documentation}],
    };
  }

  private getQuickInfoForElementSymbol(symbol: ElementSymbol): ts.QuickInfo {
    const {templateNode} = symbol;
    const matches = getDirectiveMatchesForElementTag(templateNode, symbol.directives);
    const directiveSymbol = matches.size > 0 ? matches.values().next().value : null;

    // Get element inspector documentation for directives and bindings
    const inspectorDoc = this.getElementInspectorDocumentation(symbol);

    if (directiveSymbol) {
      const quickInfo = this.getQuickInfoForDirectiveSymbol(directiveSymbol, templateNode);
      // Append inspector documentation if available
      if (inspectorDoc) {
        const existingDocs = quickInfo.documentation || [];
        return {
          ...quickInfo,
          documentation: [...existingDocs, {kind: 'markdown', text: '\n\n---\n\n' + inspectorDoc}],
        };
      }
      return quickInfo;
    }

    // For plain HTML elements, still show directive/binding info
    return createQuickInfo(
      templateNode.name,
      DisplayInfoKind.ELEMENT,
      getTextSpanOfNode(templateNode),
      undefined /* containerName */,
      this.typeChecker.typeToString(symbol.tsType),
      inspectorDoc ? [{kind: 'markdown', text: inspectorDoc}] : undefined,
    );
  }

  /**
   * Get element inspector documentation showing directives and bindings summary.
   */
  private getElementInspectorDocumentation(symbol: ElementSymbol): string | undefined {
    const {templateNode} = symbol;
    if (!(templateNode instanceof TmplAstElement)) {
      return undefined;
    }

    const ttc = this.compiler.getTemplateTypeChecker();
    const collector = new BindingCollector(
      templateNode,
      symbol,
      ttc,
      this.typeChecker,
      this.component,
    );
    const bindings = collector.collect();

    // Build documentation sections
    const sections: string[] = [];

    // Directives section
    if (bindings.directives.length > 0) {
      const directiveList = bindings.directives
        .map((d: DirectiveSummary) => {
          const icon = d.isComponent ? '🧩' : '📌';
          return `${icon} **${d.name}**`;
        })
        .join('\n');
      sections.push(`**Applied Directives:**\n${directiveList}`);
    }

    // Bindings summary
    const bindingParts: string[] = [];
    const inputCount = bindings.templateBindings.inputs.length;
    const outputCount = bindings.templateBindings.outputs.length;
    const styleCount = bindings.templateBindings.styles.length;
    const classCount = bindings.templateBindings.classes.length;
    const attributeCount = bindings.templateBindings.attributes.length;

    if (inputCount > 0) {
      bindingParts.push(`${inputCount} input${inputCount > 1 ? 's' : ''}`);
    }
    if (outputCount > 0) {
      bindingParts.push(`${outputCount} output${outputCount > 1 ? 's' : ''}`);
    }
    if (styleCount > 0) {
      bindingParts.push(`${styleCount} style binding${styleCount > 1 ? 's' : ''}`);
    }
    if (classCount > 0) {
      bindingParts.push(`${classCount} class binding${classCount > 1 ? 's' : ''}`);
    }
    if (attributeCount > 0) {
      bindingParts.push(`${attributeCount} attribute${attributeCount > 1 ? 's' : ''}`);
    }

    if (bindingParts.length > 0) {
      sections.push(`**Bindings:** ${bindingParts.join(', ')}`);
    }

    // Issues section
    if (bindings.issues.length > 0) {
      const issueList = bindings.issues.map((i) => `⚠️ ${i.message}`).join('\n');
      sections.push(`**Issues:**\n${issueList}`);
    }

    return sections.length > 0 ? sections.join('\n\n') : undefined;
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

    // Check if this is a style binding - provide CSS documentation
    if (
      this.node instanceof TmplAstBoundAttribute &&
      this.node.type === BindingType.Style &&
      this.node.keySpan
    ) {
      return this.getQuickInfoForStyleBinding(this.node);
    }

    // For text attributes and property bindings, first check if this matches a directive selector.
    // Directives take precedence over HTML attribute documentation.
    const directives = getDirectiveMatchesForAttribute(
      this.node.name,
      symbol.host.templateNode,
      symbol.host.directives,
    );
    if (directives.size > 0) {
      const directiveSymbol = directives.values().next().value!;
      return this.getQuickInfoForDirectiveSymbol(directiveSymbol);
    }

    // Check if this is an [attr.*] binding - provide HTML attribute documentation
    if (this.node instanceof TmplAstBoundAttribute && this.node.type === BindingType.Attribute) {
      return this.getQuickInfoForHtmlAttribute(this.node.name, symbol);
    }

    // Check if this is a property binding [property] - provide HTML attribute documentation
    if (this.node instanceof TmplAstBoundAttribute && this.node.type === BindingType.Property) {
      return this.getQuickInfoForDomProperty(this.node.name, symbol);
    }

    // Check for static text attributes - provide HTML attribute documentation
    if (this.node instanceof TmplAstTextAttribute) {
      return this.getQuickInfoForHtmlAttribute(this.node.name, symbol);
    }

    return undefined;
  }

  /**
   * Get quick info for an HTML attribute binding like [attr.tabindex] or static tabindex.
   * Provides documentation from vscode-html-languageservice (same as VS Code).
   */
  private getQuickInfoForHtmlAttribute(
    attributeName: string,
    symbol: DomBindingSymbol,
  ): ts.QuickInfo | undefined {
    // Get the tag name from the host element
    const tagName =
      symbol.host.templateNode && 'name' in symbol.host.templateNode
        ? symbol.host.templateNode.name
        : 'div';

    const attrInfo = getHtmlAttributeInfo(attributeName, tagName);
    if (!attrInfo) {
      return undefined;
    }

    let documentation = attrInfo.description;
    if (attrInfo.reference) {
      documentation += `\n\n[MDN Reference](${attrInfo.reference})`;
    }

    return {
      kind: ts.ScriptElementKind.memberVariableElement,
      kindModifiers: '',
      textSpan: getTextSpanOfNode(this.node),
      displayParts: [
        {kind: 'keyword', text: 'attribute'},
        {kind: 'space', text: ' '},
        {kind: 'propertyName', text: attributeName},
      ],
      documentation: [{kind: 'markdown', text: documentation}],
    };
  }

  /**
   * Get quick info for a DOM property binding like [tabindex] or [hidden].
   * Maps the property to its HTML attribute and provides documentation.
   */
  private getQuickInfoForDomProperty(
    propertyName: string,
    symbol: DomBindingSymbol,
  ): ts.QuickInfo | undefined {
    // Convert DOM property to HTML attribute name
    const attributeName = domPropertyToHtmlAttribute(propertyName);

    // Get the tag name from the host element
    const tagName =
      symbol.host.templateNode && 'name' in symbol.host.templateNode
        ? symbol.host.templateNode.name
        : 'div';

    const attrInfo = getHtmlAttributeInfo(attributeName, tagName);
    if (!attrInfo) {
      return undefined;
    }

    const displayParts: ts.SymbolDisplayPart[] = [
      {kind: 'keyword', text: 'property'},
      {kind: 'space', text: ' '},
      {kind: 'propertyName', text: propertyName},
    ];

    // If property name differs from attribute, show the mapping
    if (propertyName !== attributeName) {
      displayParts.push(
        {kind: 'space', text: ' '},
        {kind: 'punctuation', text: '('},
        {kind: 'text', text: 'maps to '},
        {kind: 'propertyName', text: attributeName},
        {kind: 'punctuation', text: ')'},
      );
    }

    let documentation = attrInfo.description;
    if (attrInfo.reference) {
      documentation += `\n\n[MDN Reference](${attrInfo.reference})`;
    }

    return {
      kind: ts.ScriptElementKind.memberVariableElement,
      kindModifiers: '',
      textSpan: getTextSpanOfNode(this.node),
      displayParts,
      documentation: [{kind: 'markdown', text: documentation}],
    };
  }

  /**
   * Get quick info for a style binding like [style.backgroundColor].
   * Provides CSS documentation from MDN via vscode-css-languageservice.
   */
  private getQuickInfoForStyleBinding(node: TmplAstBoundAttribute): ts.QuickInfo | undefined {
    const propertyName = node.name;
    const unit = node.unit;

    // Convert kebab-case to camelCase for our CSS functions
    const camelCaseProperty = kebabToCamelCase(propertyName);

    // Check if this is a valid CSS property
    if (!isValidCSSPropertyVSCode(camelCaseProperty)) {
      return undefined;
    }

    // Get hover info from vscode-css-languageservice
    const hoverInfo = getCSSPropertyHover(camelCaseProperty);

    const displayParts: ts.SymbolDisplayPart[] = [
      {kind: 'keyword', text: 'style'},
      {kind: 'punctuation', text: '.'},
      {kind: 'propertyName', text: propertyName},
    ];

    if (unit) {
      displayParts.push({kind: 'punctuation', text: '.'}, {kind: 'keyword', text: unit});
    }

    // Add type info
    const expectedType = unit ? 'number' : 'string | number';
    displayParts.push({kind: 'punctuation', text: ': '}, {kind: 'keyword', text: expectedType});

    let documentation: string;
    if (hoverInfo) {
      documentation = hoverInfo.documentation;
      if (hoverInfo.syntax) {
        documentation += `\n\n**Syntax:** \`${hoverInfo.syntax}\``;
      }
    } else {
      documentation = `CSS style binding for the \`${propertyName}\` property.`;
      if (unit) {
        documentation += `\nValue will have '${unit}' suffix appended.`;
      }
    }

    return {
      kind: ts.ScriptElementKind.memberVariableElement,
      kindModifiers: '',
      textSpan: {
        start: node.keySpan!.start.offset,
        length: node.keySpan!.end.offset - node.keySpan!.start.offset,
      },
      displayParts,
      documentation: [{kind: 'markdown', text: documentation}],
    };
  }

  /**
   * Get quick info for a CSS value inside a style binding expression.
   * For example, hovering over 'red' in [style.color]="'red'" will show
   * documentation for the CSS color value.
   */
  private getQuickInfoForStyleBindingValue(): ts.QuickInfo | undefined {
    // Only handle LiteralPrimitive nodes (string/number literals)
    if (!(this.node instanceof LiteralPrimitive)) {
      return undefined;
    }

    // Find the style binding CSS property name using text-based matching
    const propertyName = this.findStyleBindingProperty();
    if (!propertyName) {
      return undefined;
    }

    const value = this.node.value;

    // Only handle string values for CSS documentation
    if (typeof value !== 'string') {
      return undefined;
    }

    // Calculate cursor offset within the value
    const position = this.positionDetails.position;
    const valueStart = this.node.sourceSpan.start + 1; // Skip opening quote
    const offsetInValue = position - valueStart;

    // Get CSS value documentation at the cursor position
    const tokenInfo = getCSSValueHoverAtOffset(
      kebabToCamelCase(propertyName),
      value,
      offsetInValue,
    );

    if (!tokenInfo) {
      return undefined;
    }

    // Build display parts showing the CSS value token
    const displayParts: ts.SymbolDisplayPart[] = [
      {kind: 'keyword', text: propertyName},
      {kind: 'punctuation', text: ': '},
      {kind: 'stringLiteral', text: tokenInfo.token},
    ];

    // Build documentation
    let documentation = tokenInfo.description;
    if (tokenInfo.semanticType && tokenInfo.semanticType !== 'string') {
      documentation += `\n\n**Type:** ${tokenInfo.semanticType}`;
    }

    return {
      kind: ts.ScriptElementKind.string,
      kindModifiers: '',
      textSpan: {
        start: this.node.sourceSpan.start,
        length: this.node.sourceSpan.end - this.node.sourceSpan.start,
      },
      displayParts,
      documentation: [{kind: 'markdown', text: documentation}],
    };
  }

  /**
   * Find the CSS property name if this node is inside a style binding's value.
   * Uses text-based matching to find [style.propertyName]=" patterns.
   * @returns The CSS property name if inside a style binding, undefined otherwise.
   */
  private findStyleBindingProperty(): string | undefined {
    if (!(this.node instanceof LiteralPrimitive)) {
      return undefined;
    }

    // Get the template source text
    const program = this.compiler.getCurrentProgram();
    const templateNodes = this.compiler.getTemplateTypeChecker().getTemplate(this.component);
    const templateUrl = templateNodes?.[0]?.sourceSpan?.start?.file?.url;

    if (!templateUrl) {
      return undefined;
    }

    const templateSourceFile = program.getSourceFile(templateUrl);
    if (!templateSourceFile) {
      return undefined;
    }

    const text = templateSourceFile.text;
    const literalStart = this.node.sourceSpan.start;

    // Look backwards from the literal position to find [style.propertyName]="
    const searchStart = Math.max(0, literalStart - 100);
    const textBefore = text.substring(searchStart, literalStart);

    // Match patterns like:
    // [style.display]="'
    // [style.width.px]="'
    const styleBindingMatch = textBefore.match(/\[style\.([a-zA-Z-]+)(?:\.([a-zA-Z]+))?\]=["']$/);

    if (!styleBindingMatch) {
      return undefined;
    }

    return styleBindingMatch[1];
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
