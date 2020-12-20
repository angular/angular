/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompileDirectiveSummary, CompilePipeSummary, CompileTokenMetadata, CompileTypeMetadata, identifierName} from '../compile_metadata';
import {CompileReflector} from '../compile_reflector';
import {CompilerConfig} from '../config';
import {SchemaMetadata} from '../core';
import {AST, ASTWithSource, EmptyExpr, ParsedEvent, ParsedProperty, ParsedVariable} from '../expression_parser/ast';
import {Parser} from '../expression_parser/parser';
import {createTokenForExternalReference, createTokenForReference, Identifiers} from '../identifiers';
import * as html from '../ml_parser/ast';
import {HtmlParser, ParseTreeResult} from '../ml_parser/html_parser';
import {removeWhitespaces, replaceNgsp} from '../ml_parser/html_whitespaces';
import {expandNodes} from '../ml_parser/icu_ast_expander';
import {InterpolationConfig} from '../ml_parser/interpolation_config';
import {isNgTemplate, splitNsName} from '../ml_parser/tags';
import {ParseError, ParseErrorLevel, ParseSourceSpan} from '../parse_util';
import {ProviderElementContext, ProviderViewContext} from '../provider_analyzer';
import {ElementSchemaRegistry} from '../schema/element_schema_registry';
import {CssSelector, SelectorMatcher} from '../selector';
import {isStyleUrlResolvable} from '../style_url_resolver';
import {Console, newArray, syntaxError} from '../util';

import {BindingParser} from './binding_parser';
import * as t from './template_ast';
import {PreparsedElementType, preparseElement} from './template_preparser';

const BIND_NAME_REGEXP =
    /^(?:(?:(?:(bind-)|(let-)|(ref-|#)|(on-)|(bindon-)|(@))(.*))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/;

// Group 1 = "bind-"
const KW_BIND_IDX = 1;
// Group 2 = "let-"
const KW_LET_IDX = 2;
// Group 3 = "ref-/#"
const KW_REF_IDX = 3;
// Group 4 = "on-"
const KW_ON_IDX = 4;
// Group 5 = "bindon-"
const KW_BINDON_IDX = 5;
// Group 6 = "@"
const KW_AT_IDX = 6;
// Group 7 = the identifier after "bind-", "let-", "ref-/#", "on-", "bindon-" or "@"
const IDENT_KW_IDX = 7;
// Group 8 = identifier inside [()]
const IDENT_BANANA_BOX_IDX = 8;
// Group 9 = identifier inside []
const IDENT_PROPERTY_IDX = 9;
// Group 10 = identifier inside ()
const IDENT_EVENT_IDX = 10;

const TEMPLATE_ATTR_PREFIX = '*';
const CLASS_ATTR = 'class';

let _TEXT_CSS_SELECTOR!: CssSelector;
function TEXT_CSS_SELECTOR(): CssSelector {
  if (!_TEXT_CSS_SELECTOR) {
    _TEXT_CSS_SELECTOR = CssSelector.parse('*')[0];
  }
  return _TEXT_CSS_SELECTOR;
}

export class TemplateParseError extends ParseError {
  constructor(message: string, span: ParseSourceSpan, level: ParseErrorLevel) {
    super(span, message, level);
  }
}

export class TemplateParseResult {
  constructor(
      public templateAst?: t.TemplateAst[], public usedPipes?: CompilePipeSummary[],
      public errors?: ParseError[]) {}
}

export class TemplateParser {
  constructor(
      private _config: CompilerConfig, private _reflector: CompileReflector,
      private _exprParser: Parser, private _schemaRegistry: ElementSchemaRegistry,
      private _htmlParser: HtmlParser, private _console: Console|null,
      public transforms: t.TemplateAstVisitor[]) {}

  public get expressionParser() {
    return this._exprParser;
  }

  parse(
      component: CompileDirectiveMetadata, template: string|ParseTreeResult,
      directives: CompileDirectiveSummary[], pipes: CompilePipeSummary[], schemas: SchemaMetadata[],
      templateUrl: string,
      preserveWhitespaces: boolean): {template: t.TemplateAst[], pipes: CompilePipeSummary[]} {
    const result = this.tryParse(
        component, template, directives, pipes, schemas, templateUrl, preserveWhitespaces);
    const warnings = result.errors!.filter(error => error.level === ParseErrorLevel.WARNING);

    const errors = result.errors!.filter(error => error.level === ParseErrorLevel.ERROR);

    if (warnings.length > 0) {
      this._console?.warn(`Template parse warnings:\n${warnings.join('\n')}`);
    }

    if (errors.length > 0) {
      const errorString = errors.join('\n');
      throw syntaxError(`Template parse errors:\n${errorString}`, errors);
    }

    return {template: result.templateAst!, pipes: result.usedPipes!};
  }

  tryParse(
      component: CompileDirectiveMetadata, template: string|ParseTreeResult,
      directives: CompileDirectiveSummary[], pipes: CompilePipeSummary[], schemas: SchemaMetadata[],
      templateUrl: string, preserveWhitespaces: boolean): TemplateParseResult {
    let htmlParseResult = typeof template === 'string' ?
        this._htmlParser!.parse(template, templateUrl, {
          tokenizeExpansionForms: true,
          interpolationConfig: this.getInterpolationConfig(component)
        }) :
        template;

    if (!preserveWhitespaces) {
      htmlParseResult = removeWhitespaces(htmlParseResult);
    }

    return this.tryParseHtml(
        this.expandHtml(htmlParseResult), component, directives, pipes, schemas);
  }

  tryParseHtml(
      htmlAstWithErrors: ParseTreeResult, component: CompileDirectiveMetadata,
      directives: CompileDirectiveSummary[], pipes: CompilePipeSummary[],
      schemas: SchemaMetadata[]): TemplateParseResult {
    let result: t.TemplateAst[];
    const errors = htmlAstWithErrors.errors;
    const usedPipes: CompilePipeSummary[] = [];
    if (htmlAstWithErrors.rootNodes.length > 0) {
      const uniqDirectives = removeSummaryDuplicates(directives);
      const uniqPipes = removeSummaryDuplicates(pipes);
      const providerViewContext = new ProviderViewContext(this._reflector, component);
      let interpolationConfig: InterpolationConfig = undefined!;
      if (component.template && component.template.interpolation) {
        interpolationConfig = {
          start: component.template.interpolation[0],
          end: component.template.interpolation[1]
        };
      }
      const bindingParser = new BindingParser(
          this._exprParser, interpolationConfig!, this._schemaRegistry, uniqPipes, errors);
      const parseVisitor = new TemplateParseVisitor(
          this._reflector, this._config, providerViewContext, uniqDirectives, bindingParser,
          this._schemaRegistry, schemas, errors);
      result = html.visitAll(parseVisitor, htmlAstWithErrors.rootNodes, EMPTY_ELEMENT_CONTEXT);
      errors.push(...providerViewContext.errors);
      usedPipes.push(...bindingParser.getUsedPipes());
    } else {
      result = [];
    }
    this._assertNoReferenceDuplicationOnTemplate(result, errors);

    if (errors.length > 0) {
      return new TemplateParseResult(result, usedPipes, errors);
    }

    if (this.transforms) {
      this.transforms.forEach((transform: t.TemplateAstVisitor) => {
        result = t.templateVisitAll(transform, result);
      });
    }

    return new TemplateParseResult(result, usedPipes, errors);
  }

  expandHtml(htmlAstWithErrors: ParseTreeResult, forced: boolean = false): ParseTreeResult {
    const errors: ParseError[] = htmlAstWithErrors.errors;

    if (errors.length == 0 || forced) {
      // Transform ICU messages to angular directives
      const expandedHtmlAst = expandNodes(htmlAstWithErrors.rootNodes);
      errors.push(...expandedHtmlAst.errors);
      htmlAstWithErrors = new ParseTreeResult(expandedHtmlAst.nodes, errors);
    }
    return htmlAstWithErrors;
  }

  getInterpolationConfig(component: CompileDirectiveMetadata): InterpolationConfig|undefined {
    if (component.template) {
      return InterpolationConfig.fromArray(component.template.interpolation);
    }
    return undefined;
  }

  /** @internal */
  _assertNoReferenceDuplicationOnTemplate(result: t.TemplateAst[], errors: TemplateParseError[]):
      void {
    const existingReferences: string[] = [];

    result.filter(element => !!(<any>element).references)
        .forEach(element => (<any>element).references.forEach((reference: t.ReferenceAst) => {
          const name = reference.name;
          if (existingReferences.indexOf(name) < 0) {
            existingReferences.push(name);
          } else {
            const error = new TemplateParseError(
                `Reference "#${name}" is defined several times`, reference.sourceSpan,
                ParseErrorLevel.ERROR);
            errors.push(error);
          }
        }));
  }
}

class TemplateParseVisitor implements html.Visitor {
  selectorMatcher = new SelectorMatcher();
  directivesIndex = new Map<CompileDirectiveSummary, number>();
  ngContentCount = 0;
  contentQueryStartId: number;

  constructor(
      private reflector: CompileReflector, private config: CompilerConfig,
      public providerViewContext: ProviderViewContext, directives: CompileDirectiveSummary[],
      private _bindingParser: BindingParser, private _schemaRegistry: ElementSchemaRegistry,
      private _schemas: SchemaMetadata[], private _targetErrors: TemplateParseError[]) {
    // Note: queries start with id 1 so we can use the number in a Bloom filter!
    this.contentQueryStartId = providerViewContext.component.viewQueries.length + 1;
    directives.forEach((directive, index) => {
      const selector = CssSelector.parse(directive.selector!);
      this.selectorMatcher.addSelectables(selector, directive);
      this.directivesIndex.set(directive, index);
    });
  }

  visitExpansion(expansion: html.Expansion, context: any): any {
    return null;
  }

  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any {
    return null;
  }

  visitText(text: html.Text, parent: ElementContext): any {
    const ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR())!;
    const valueNoNgsp = replaceNgsp(text.value);
    const expr = this._bindingParser.parseInterpolation(valueNoNgsp, text.sourceSpan);
    return expr ? new t.BoundTextAst(expr, ngContentIndex, text.sourceSpan) :
                  new t.TextAst(valueNoNgsp, ngContentIndex, text.sourceSpan);
  }

  visitAttribute(attribute: html.Attribute, context: any): any {
    return new t.AttrAst(attribute.name, attribute.value, attribute.sourceSpan);
  }

  visitComment(comment: html.Comment, context: any): any {
    return null;
  }

  visitElement(element: html.Element, parent: ElementContext): any {
    const queryStartIndex = this.contentQueryStartId;
    const elName = element.name;
    const preparsedElement = preparseElement(element);
    if (preparsedElement.type === PreparsedElementType.SCRIPT ||
        preparsedElement.type === PreparsedElementType.STYLE) {
      // Skipping <script> for security reasons
      // Skipping <style> as we already processed them
      // in the StyleCompiler
      return null;
    }
    if (preparsedElement.type === PreparsedElementType.STYLESHEET &&
        isStyleUrlResolvable(preparsedElement.hrefAttr)) {
      // Skipping stylesheets with either relative urls or package scheme as we already processed
      // them in the StyleCompiler
      return null;
    }

    const matchableAttrs: [string, string][] = [];
    const elementOrDirectiveProps: ParsedProperty[] = [];
    const elementOrDirectiveRefs: ElementOrDirectiveRef[] = [];
    const elementVars: t.VariableAst[] = [];
    const events: t.BoundEventAst[] = [];

    const templateElementOrDirectiveProps: ParsedProperty[] = [];
    const templateMatchableAttrs: [string, string][] = [];
    const templateElementVars: t.VariableAst[] = [];

    let hasInlineTemplates = false;
    const attrs: t.AttrAst[] = [];
    const isTemplateElement = isNgTemplate(element.name);

    element.attrs.forEach(attr => {
      const parsedVariables: ParsedVariable[] = [];
      const hasBinding = this._parseAttr(
          isTemplateElement, attr, matchableAttrs, elementOrDirectiveProps, events,
          elementOrDirectiveRefs, elementVars);
      elementVars.push(...parsedVariables.map(v => t.VariableAst.fromParsedVariable(v)));

      let templateValue: string|undefined;
      let templateKey: string|undefined;
      const normalizedName = this._normalizeAttributeName(attr.name);

      if (normalizedName.startsWith(TEMPLATE_ATTR_PREFIX)) {
        templateValue = attr.value;
        templateKey = normalizedName.substring(TEMPLATE_ATTR_PREFIX.length);
      }

      const hasTemplateBinding = templateValue != null;
      if (hasTemplateBinding) {
        if (hasInlineTemplates) {
          this._reportError(
              `Can't have multiple template bindings on one element. Use only one attribute prefixed with *`,
              attr.sourceSpan);
        }
        hasInlineTemplates = true;
        const parsedVariables: ParsedVariable[] = [];
        const absoluteOffset = (attr.valueSpan || attr.sourceSpan).start.offset;
        this._bindingParser.parseInlineTemplateBinding(
            templateKey!, templateValue!, attr.sourceSpan, absoluteOffset, templateMatchableAttrs,
            templateElementOrDirectiveProps, parsedVariables, false /* isIvyAst */);
        templateElementVars.push(...parsedVariables.map(v => t.VariableAst.fromParsedVariable(v)));
      }

      if (!hasBinding && !hasTemplateBinding) {
        // don't include the bindings as attributes as well in the AST
        attrs.push(this.visitAttribute(attr, null));
        matchableAttrs.push([attr.name, attr.value]);
      }
    });

    const elementCssSelector = createElementCssSelector(elName, matchableAttrs);
    const {directives: directiveMetas, matchElement} =
        this._parseDirectives(this.selectorMatcher, elementCssSelector);
    const references: t.ReferenceAst[] = [];
    const boundDirectivePropNames = new Set<string>();
    const directiveAsts = this._createDirectiveAsts(
        isTemplateElement, element.name, directiveMetas, elementOrDirectiveProps,
        elementOrDirectiveRefs, element.sourceSpan, references, boundDirectivePropNames);
    const elementProps: t.BoundElementPropertyAst[] = this._createElementPropertyAsts(
        element.name, elementOrDirectiveProps, boundDirectivePropNames);
    const isViewRoot = parent.isTemplateElement || hasInlineTemplates;

    const providerContext = new ProviderElementContext(
        this.providerViewContext, parent.providerContext!, isViewRoot, directiveAsts, attrs,
        references, isTemplateElement, queryStartIndex, element.sourceSpan);

    const children: t.TemplateAst[] = html.visitAll(
        preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children,
        ElementContext.create(
            isTemplateElement, directiveAsts,
            isTemplateElement ? parent.providerContext! : providerContext));
    providerContext.afterElement();
    // Override the actual selector when the `ngProjectAs` attribute is provided
    const projectionSelector = preparsedElement.projectAs != '' ?
        CssSelector.parse(preparsedElement.projectAs)[0] :
        elementCssSelector;
    const ngContentIndex = parent.findNgContentIndex(projectionSelector)!;
    let parsedElement: t.TemplateAst;

    if (preparsedElement.type === PreparsedElementType.NG_CONTENT) {
      // `<ng-content>` element
      if (element.children && !element.children.every(_isEmptyTextNode)) {
        this._reportError(`<ng-content> element cannot have content.`, element.sourceSpan);
      }

      parsedElement = new t.NgContentAst(
          this.ngContentCount++, hasInlineTemplates ? null! : ngContentIndex, element.sourceSpan);
    } else if (isTemplateElement) {
      // `<ng-template>` element
      this._assertAllEventsPublishedByDirectives(directiveAsts, events);
      this._assertNoComponentsNorElementBindingsOnTemplate(
          directiveAsts, elementProps, element.sourceSpan);

      parsedElement = new t.EmbeddedTemplateAst(
          attrs, events, references, elementVars, providerContext.transformedDirectiveAsts,
          providerContext.transformProviders, providerContext.transformedHasViewContainer,
          providerContext.queryMatches, children, hasInlineTemplates ? null! : ngContentIndex,
          element.sourceSpan);
    } else {
      // element other than `<ng-content>` and `<ng-template>`
      this._assertElementExists(matchElement, element);
      this._assertOnlyOneComponent(directiveAsts, element.sourceSpan);

      const ngContentIndex =
          hasInlineTemplates ? null : parent.findNgContentIndex(projectionSelector);
      parsedElement = new t.ElementAst(
          elName, attrs, elementProps, events, references, providerContext.transformedDirectiveAsts,
          providerContext.transformProviders, providerContext.transformedHasViewContainer,
          providerContext.queryMatches, children, hasInlineTemplates ? null : ngContentIndex,
          element.sourceSpan, element.endSourceSpan || null);
    }

    if (hasInlineTemplates) {
      // The element as a *-attribute
      const templateQueryStartIndex = this.contentQueryStartId;
      const templateSelector = createElementCssSelector('ng-template', templateMatchableAttrs);
      const {directives} = this._parseDirectives(this.selectorMatcher, templateSelector);
      const templateBoundDirectivePropNames = new Set<string>();
      const templateDirectiveAsts = this._createDirectiveAsts(
          true, elName, directives, templateElementOrDirectiveProps, [], element.sourceSpan, [],
          templateBoundDirectivePropNames);
      const templateElementProps: t.BoundElementPropertyAst[] = this._createElementPropertyAsts(
          elName, templateElementOrDirectiveProps, templateBoundDirectivePropNames);
      this._assertNoComponentsNorElementBindingsOnTemplate(
          templateDirectiveAsts, templateElementProps, element.sourceSpan);
      const templateProviderContext = new ProviderElementContext(
          this.providerViewContext, parent.providerContext!, parent.isTemplateElement,
          templateDirectiveAsts, [], [], true, templateQueryStartIndex, element.sourceSpan);
      templateProviderContext.afterElement();

      parsedElement = new t.EmbeddedTemplateAst(
          [], [], [], templateElementVars, templateProviderContext.transformedDirectiveAsts,
          templateProviderContext.transformProviders,
          templateProviderContext.transformedHasViewContainer, templateProviderContext.queryMatches,
          [parsedElement], ngContentIndex, element.sourceSpan);
    }

    return parsedElement;
  }

  private _parseAttr(
      isTemplateElement: boolean, attr: html.Attribute, targetMatchableAttrs: string[][],
      targetProps: ParsedProperty[], targetEvents: t.BoundEventAst[],
      targetRefs: ElementOrDirectiveRef[], targetVars: t.VariableAst[]): boolean {
    const name = this._normalizeAttributeName(attr.name);
    const value = attr.value;
    const srcSpan = attr.sourceSpan;
    const absoluteOffset = attr.valueSpan ? attr.valueSpan.start.offset : srcSpan.start.offset;

    const boundEvents: ParsedEvent[] = [];
    const bindParts = name.match(BIND_NAME_REGEXP);
    let hasBinding = false;

    if (bindParts !== null) {
      hasBinding = true;
      if (bindParts[KW_BIND_IDX] != null) {
        this._bindingParser.parsePropertyBinding(
            bindParts[IDENT_KW_IDX], value, false, srcSpan, absoluteOffset, attr.valueSpan,
            targetMatchableAttrs, targetProps);

      } else if (bindParts[KW_LET_IDX]) {
        if (isTemplateElement) {
          const identifier = bindParts[IDENT_KW_IDX];
          this._parseVariable(identifier, value, srcSpan, targetVars);
        } else {
          this._reportError(`"let-" is only supported on ng-template elements.`, srcSpan);
        }

      } else if (bindParts[KW_REF_IDX]) {
        const identifier = bindParts[IDENT_KW_IDX];
        this._parseReference(identifier, value, srcSpan, targetRefs);

      } else if (bindParts[KW_ON_IDX]) {
        this._bindingParser.parseEvent(
            bindParts[IDENT_KW_IDX], value, srcSpan, attr.valueSpan || srcSpan,
            targetMatchableAttrs, boundEvents);

      } else if (bindParts[KW_BINDON_IDX]) {
        this._bindingParser.parsePropertyBinding(
            bindParts[IDENT_KW_IDX], value, false, srcSpan, absoluteOffset, attr.valueSpan,
            targetMatchableAttrs, targetProps);
        this._parseAssignmentEvent(
            bindParts[IDENT_KW_IDX], value, srcSpan, attr.valueSpan || srcSpan,
            targetMatchableAttrs, boundEvents);

      } else if (bindParts[KW_AT_IDX]) {
        this._bindingParser.parseLiteralAttr(
            name, value, srcSpan, absoluteOffset, attr.valueSpan, targetMatchableAttrs,
            targetProps);

      } else if (bindParts[IDENT_BANANA_BOX_IDX]) {
        this._bindingParser.parsePropertyBinding(
            bindParts[IDENT_BANANA_BOX_IDX], value, false, srcSpan, absoluteOffset, attr.valueSpan,
            targetMatchableAttrs, targetProps);
        this._parseAssignmentEvent(
            bindParts[IDENT_BANANA_BOX_IDX], value, srcSpan, attr.valueSpan || srcSpan,
            targetMatchableAttrs, boundEvents);

      } else if (bindParts[IDENT_PROPERTY_IDX]) {
        this._bindingParser.parsePropertyBinding(
            bindParts[IDENT_PROPERTY_IDX], value, false, srcSpan, absoluteOffset, attr.valueSpan,
            targetMatchableAttrs, targetProps);

      } else if (bindParts[IDENT_EVENT_IDX]) {
        this._bindingParser.parseEvent(
            bindParts[IDENT_EVENT_IDX], value, srcSpan, attr.valueSpan || srcSpan,
            targetMatchableAttrs, boundEvents);
      }
    } else {
      hasBinding = this._bindingParser.parsePropertyInterpolation(
          name, value, srcSpan, attr.valueSpan, targetMatchableAttrs, targetProps);
    }

    if (!hasBinding) {
      this._bindingParser.parseLiteralAttr(
          name, value, srcSpan, absoluteOffset, attr.valueSpan, targetMatchableAttrs, targetProps);
    }

    targetEvents.push(...boundEvents.map(e => t.BoundEventAst.fromParsedEvent(e)));

    return hasBinding;
  }

  private _normalizeAttributeName(attrName: string): string {
    return /^data-/i.test(attrName) ? attrName.substring(5) : attrName;
  }

  private _parseVariable(
      identifier: string, value: string, sourceSpan: ParseSourceSpan, targetVars: t.VariableAst[]) {
    if (identifier.indexOf('-') > -1) {
      this._reportError(`"-" is not allowed in variable names`, sourceSpan);
    } else if (identifier.length === 0) {
      this._reportError(`Variable does not have a name`, sourceSpan);
    }

    targetVars.push(new t.VariableAst(identifier, value, sourceSpan));
  }

  private _parseReference(
      identifier: string, value: string, sourceSpan: ParseSourceSpan,
      targetRefs: ElementOrDirectiveRef[]) {
    if (identifier.indexOf('-') > -1) {
      this._reportError(`"-" is not allowed in reference names`, sourceSpan);
    } else if (identifier.length === 0) {
      this._reportError(`Reference does not have a name`, sourceSpan);
    }

    targetRefs.push(new ElementOrDirectiveRef(identifier, value, sourceSpan));
  }

  private _parseAssignmentEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan, valueSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetEvents: ParsedEvent[]) {
    this._bindingParser.parseEvent(
        `${name}Change`, `${expression}=$event`, sourceSpan, valueSpan, targetMatchableAttrs,
        targetEvents);
  }

  private _parseDirectives(selectorMatcher: SelectorMatcher, elementCssSelector: CssSelector):
      {directives: CompileDirectiveSummary[], matchElement: boolean} {
    // Need to sort the directives so that we get consistent results throughout,
    // as selectorMatcher uses Maps inside.
    // Also deduplicate directives as they might match more than one time!
    const directives = newArray(this.directivesIndex.size);
    // Whether any directive selector matches on the element name
    let matchElement = false;

    selectorMatcher.match(elementCssSelector, (selector, directive) => {
      directives[this.directivesIndex.get(directive)!] = directive;
      matchElement = matchElement || selector.hasElementSelector();
    });

    return {
      directives: directives.filter(dir => !!dir),
      matchElement,
    };
  }

  private _createDirectiveAsts(
      isTemplateElement: boolean, elementName: string, directives: CompileDirectiveSummary[],
      props: ParsedProperty[], elementOrDirectiveRefs: ElementOrDirectiveRef[],
      elementSourceSpan: ParseSourceSpan, targetReferences: t.ReferenceAst[],
      targetBoundDirectivePropNames: Set<string>): t.DirectiveAst[] {
    const matchedReferences = new Set<string>();
    let component: CompileDirectiveSummary = null!;

    const directiveAsts = directives.map((directive) => {
      const sourceSpan = new ParseSourceSpan(
          elementSourceSpan.start, elementSourceSpan.end, elementSourceSpan.fullStart,
          `Directive ${identifierName(directive.type)}`);

      if (directive.isComponent) {
        component = directive;
      }
      const directiveProperties: t.BoundDirectivePropertyAst[] = [];
      const boundProperties =
          this._bindingParser.createDirectiveHostPropertyAsts(directive, elementName, sourceSpan)!;

      let hostProperties =
          boundProperties.map(prop => t.BoundElementPropertyAst.fromBoundProperty(prop));
      // Note: We need to check the host properties here as well,
      // as we don't know the element name in the DirectiveWrapperCompiler yet.
      hostProperties = this._checkPropertiesInSchema(elementName, hostProperties);
      const parsedEvents = this._bindingParser.createDirectiveHostEventAsts(directive, sourceSpan)!;
      this._createDirectivePropertyAsts(
          directive.inputs, props, directiveProperties, targetBoundDirectivePropNames);
      elementOrDirectiveRefs.forEach((elOrDirRef) => {
        if ((elOrDirRef.value.length === 0 && directive.isComponent) ||
            (elOrDirRef.isReferenceToDirective(directive))) {
          targetReferences.push(new t.ReferenceAst(
              elOrDirRef.name, createTokenForReference(directive.type.reference), elOrDirRef.value,
              elOrDirRef.sourceSpan));
          matchedReferences.add(elOrDirRef.name);
        }
      });
      const hostEvents = parsedEvents.map(e => t.BoundEventAst.fromParsedEvent(e));
      const contentQueryStartId = this.contentQueryStartId;
      this.contentQueryStartId += directive.queries.length;
      return new t.DirectiveAst(
          directive, directiveProperties, hostProperties, hostEvents, contentQueryStartId,
          sourceSpan);
    });

    elementOrDirectiveRefs.forEach((elOrDirRef) => {
      if (elOrDirRef.value.length > 0) {
        if (!matchedReferences.has(elOrDirRef.name)) {
          this._reportError(
              `There is no directive with "exportAs" set to "${elOrDirRef.value}"`,
              elOrDirRef.sourceSpan);
        }
      } else if (!component) {
        let refToken: CompileTokenMetadata = null!;
        if (isTemplateElement) {
          refToken = createTokenForExternalReference(this.reflector, Identifiers.TemplateRef);
        }
        targetReferences.push(
            new t.ReferenceAst(elOrDirRef.name, refToken, elOrDirRef.value, elOrDirRef.sourceSpan));
      }
    });
    return directiveAsts;
  }

  private _createDirectivePropertyAsts(
      directiveProperties: {[key: string]: string}, boundProps: ParsedProperty[],
      targetBoundDirectiveProps: t.BoundDirectivePropertyAst[],
      targetBoundDirectivePropNames: Set<string>) {
    if (directiveProperties) {
      const boundPropsByName = new Map<string, ParsedProperty>();
      boundProps.forEach(boundProp => {
        const prevValue = boundPropsByName.get(boundProp.name);
        if (!prevValue || prevValue.isLiteral) {
          // give [a]="b" a higher precedence than a="b" on the same element
          boundPropsByName.set(boundProp.name, boundProp);
        }
      });

      Object.keys(directiveProperties).forEach(dirProp => {
        const elProp = directiveProperties[dirProp];
        const boundProp = boundPropsByName.get(elProp);

        // Bindings are optional, so this binding only needs to be set up if an expression is given.
        if (boundProp) {
          targetBoundDirectivePropNames.add(boundProp.name);
          if (!isEmptyExpression(boundProp.expression)) {
            targetBoundDirectiveProps.push(new t.BoundDirectivePropertyAst(
                dirProp, boundProp.name, boundProp.expression, boundProp.sourceSpan));
          }
        }
      });
    }
  }

  private _createElementPropertyAsts(
      elementName: string, props: ParsedProperty[],
      boundDirectivePropNames: Set<string>): t.BoundElementPropertyAst[] {
    const boundElementProps: t.BoundElementPropertyAst[] = [];

    props.forEach((prop: ParsedProperty) => {
      if (!prop.isLiteral && !boundDirectivePropNames.has(prop.name)) {
        const boundProp = this._bindingParser.createBoundElementProperty(elementName, prop);
        boundElementProps.push(t.BoundElementPropertyAst.fromBoundProperty(boundProp));
      }
    });
    return this._checkPropertiesInSchema(elementName, boundElementProps);
  }

  private _findComponentDirectives(directives: t.DirectiveAst[]): t.DirectiveAst[] {
    return directives.filter(directive => directive.directive.isComponent);
  }

  private _findComponentDirectiveNames(directives: t.DirectiveAst[]): string[] {
    return this._findComponentDirectives(directives)
        .map(directive => identifierName(directive.directive.type)!);
  }

  private _assertOnlyOneComponent(directives: t.DirectiveAst[], sourceSpan: ParseSourceSpan) {
    const componentTypeNames = this._findComponentDirectiveNames(directives);
    if (componentTypeNames.length > 1) {
      this._reportError(
          `More than one component matched on this element.\n` +
              `Make sure that only one component's selector can match a given element.\n` +
              `Conflicting components: ${componentTypeNames.join(',')}`,
          sourceSpan);
    }
  }

  /**
   * Make sure that non-angular tags conform to the schemas.
   *
   * Note: An element is considered an angular tag when at least one directive selector matches the
   * tag name.
   *
   * @param matchElement Whether any directive has matched on the tag name
   * @param element the html element
   */
  private _assertElementExists(matchElement: boolean, element: html.Element) {
    const elName = element.name.replace(/^:xhtml:/, '');

    if (!matchElement && !this._schemaRegistry.hasElement(elName, this._schemas)) {
      let errorMsg = `'${elName}' is not a known element:\n`;
      errorMsg += `1. If '${
          elName}' is an Angular component, then verify that it is part of this module.\n`;
      if (elName.indexOf('-') > -1) {
        errorMsg += `2. If '${
            elName}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.`;
      } else {
        errorMsg +=
            `2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`;
      }
      this._reportError(errorMsg, element.sourceSpan);
    }
  }

  private _assertNoComponentsNorElementBindingsOnTemplate(
      directives: t.DirectiveAst[], elementProps: t.BoundElementPropertyAst[],
      sourceSpan: ParseSourceSpan) {
    const componentTypeNames: string[] = this._findComponentDirectiveNames(directives);
    if (componentTypeNames.length > 0) {
      this._reportError(
          `Components on an embedded template: ${componentTypeNames.join(',')}`, sourceSpan);
    }
    elementProps.forEach(prop => {
      this._reportError(
          `Property binding ${
              prop.name} not used by any directive on an embedded template. Make sure that the property name is spelled correctly and all directives are listed in the "@NgModule.declarations".`,
          sourceSpan);
    });
  }

  private _assertAllEventsPublishedByDirectives(
      directives: t.DirectiveAst[], events: t.BoundEventAst[]) {
    const allDirectiveEvents = new Set<string>();

    directives.forEach(directive => {
      Object.keys(directive.directive.outputs).forEach(k => {
        const eventName = directive.directive.outputs[k];
        allDirectiveEvents.add(eventName);
      });
    });

    events.forEach(event => {
      if (event.target != null || !allDirectiveEvents.has(event.name)) {
        this._reportError(
            `Event binding ${
                event
                    .fullName} not emitted by any directive on an embedded template. Make sure that the event name is spelled correctly and all directives are listed in the "@NgModule.declarations".`,
            event.sourceSpan);
      }
    });
  }

  private _checkPropertiesInSchema(elementName: string, boundProps: t.BoundElementPropertyAst[]):
      t.BoundElementPropertyAst[] {
    // Note: We can't filter out empty expressions before this method,
    // as we still want to validate them!
    return boundProps.filter((boundProp) => {
      if (boundProp.type === t.PropertyBindingType.Property &&
          !this._schemaRegistry.hasProperty(elementName, boundProp.name, this._schemas)) {
        let errorMsg = `Can't bind to '${boundProp.name}' since it isn't a known property of '${
            elementName}'.`;
        if (elementName.startsWith('ng-')) {
          errorMsg +=
              `\n1. If '${
                  boundProp
                      .name}' is an Angular directive, then add 'CommonModule' to the '@NgModule.imports' of this component.` +
              `\n2. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`;
        } else if (elementName.indexOf('-') > -1) {
          errorMsg +=
              `\n1. If '${elementName}' is an Angular component and it has '${
                  boundProp.name}' input, then verify that it is part of this module.` +
              `\n2. If '${
                  elementName}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.` +
              `\n3. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`;
        }
        this._reportError(errorMsg, boundProp.sourceSpan);
      }
      return !isEmptyExpression(boundProp.value);
    });
  }

  private _reportError(
      message: string, sourceSpan: ParseSourceSpan,
      level: ParseErrorLevel = ParseErrorLevel.ERROR) {
    this._targetErrors.push(new ParseError(sourceSpan, message, level));
  }
}

class NonBindableVisitor implements html.Visitor {
  visitElement(ast: html.Element, parent: ElementContext): t.ElementAst|null {
    const preparsedElement = preparseElement(ast);
    if (preparsedElement.type === PreparsedElementType.SCRIPT ||
        preparsedElement.type === PreparsedElementType.STYLE ||
        preparsedElement.type === PreparsedElementType.STYLESHEET) {
      // Skipping <script> for security reasons
      // Skipping <style> and stylesheets as we already processed them
      // in the StyleCompiler
      return null;
    }

    const attrNameAndValues = ast.attrs.map((attr): [string, string] => [attr.name, attr.value]);
    const selector = createElementCssSelector(ast.name, attrNameAndValues);
    const ngContentIndex = parent.findNgContentIndex(selector);
    const children: t.TemplateAst[] = html.visitAll(this, ast.children, EMPTY_ELEMENT_CONTEXT);
    return new t.ElementAst(
        ast.name, html.visitAll(this, ast.attrs), [], [], [], [], [], false, [], children,
        ngContentIndex, ast.sourceSpan, ast.endSourceSpan);
  }
  visitComment(comment: html.Comment, context: any): any {
    return null;
  }

  visitAttribute(attribute: html.Attribute, context: any): t.AttrAst {
    return new t.AttrAst(attribute.name, attribute.value, attribute.sourceSpan);
  }

  visitText(text: html.Text, parent: ElementContext): t.TextAst {
    const ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR())!;
    return new t.TextAst(text.value, ngContentIndex, text.sourceSpan);
  }

  visitExpansion(expansion: html.Expansion, context: any): any {
    return expansion;
  }

  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any {
    return expansionCase;
  }
}

/**
 * A reference to an element or directive in a template. E.g., the reference in this template:
 *
 * <div #myMenu="coolMenu">
 *
 * would be {name: 'myMenu', value: 'coolMenu', sourceSpan: ...}
 */
class ElementOrDirectiveRef {
  constructor(public name: string, public value: string, public sourceSpan: ParseSourceSpan) {}

  /** Gets whether this is a reference to the given directive. */
  isReferenceToDirective(directive: CompileDirectiveSummary) {
    return splitExportAs(directive.exportAs).indexOf(this.value) !== -1;
  }
}

/** Splits a raw, potentially comma-delimited `exportAs` value into an array of names. */
function splitExportAs(exportAs: string|null): string[] {
  return exportAs ? exportAs.split(',').map(e => e.trim()) : [];
}

export function splitClasses(classAttrValue: string): string[] {
  return classAttrValue.trim().split(/\s+/g);
}

class ElementContext {
  static create(
      isTemplateElement: boolean, directives: t.DirectiveAst[],
      providerContext: ProviderElementContext): ElementContext {
    const matcher = new SelectorMatcher();
    let wildcardNgContentIndex: number = null!;
    const component = directives.find(directive => directive.directive.isComponent);
    if (component) {
      const ngContentSelectors = component.directive.template !.ngContentSelectors;
      for (let i = 0; i < ngContentSelectors.length; i++) {
        const selector = ngContentSelectors[i];
        if (selector === '*') {
          wildcardNgContentIndex = i;
        } else {
          matcher.addSelectables(CssSelector.parse(ngContentSelectors[i]), i);
        }
      }
    }
    return new ElementContext(isTemplateElement, matcher, wildcardNgContentIndex, providerContext);
  }
  constructor(
      public isTemplateElement: boolean, private _ngContentIndexMatcher: SelectorMatcher,
      private _wildcardNgContentIndex: number|null,
      public providerContext: ProviderElementContext|null) {}

  findNgContentIndex(selector: CssSelector): number|null {
    const ngContentIndices: number[] = [];
    this._ngContentIndexMatcher.match(selector, (selector, ngContentIndex) => {
      ngContentIndices.push(ngContentIndex);
    });
    ngContentIndices.sort();
    if (this._wildcardNgContentIndex != null) {
      ngContentIndices.push(this._wildcardNgContentIndex);
    }
    return ngContentIndices.length > 0 ? ngContentIndices[0] : null;
  }
}

export function createElementCssSelector(
    elementName: string, attributes: [string, string][]): CssSelector {
  const cssSelector = new CssSelector();
  const elNameNoNs = splitNsName(elementName)[1];

  cssSelector.setElement(elNameNoNs);

  for (let i = 0; i < attributes.length; i++) {
    const attrName = attributes[i][0];
    const attrNameNoNs = splitNsName(attrName)[1];
    const attrValue = attributes[i][1];

    cssSelector.addAttribute(attrNameNoNs, attrValue);
    if (attrName.toLowerCase() == CLASS_ATTR) {
      const classes = splitClasses(attrValue);
      classes.forEach(className => cssSelector.addClassName(className));
    }
  }
  return cssSelector;
}

const EMPTY_ELEMENT_CONTEXT = new ElementContext(true, new SelectorMatcher(), null, null);
const NON_BINDABLE_VISITOR = new NonBindableVisitor();

function _isEmptyTextNode(node: html.Node): boolean {
  return node instanceof html.Text && node.value.trim().length == 0;
}

export function removeSummaryDuplicates<T extends {type: CompileTypeMetadata}>(items: T[]): T[] {
  const map = new Map<any, T>();

  items.forEach((item) => {
    if (!map.get(item.type.reference)) {
      map.set(item.type.reference, item);
    }
  });

  return Array.from(map.values());
}

export function isEmptyExpression(ast: AST): boolean {
  if (ast instanceof ASTWithSource) {
    ast = ast.ast;
  }
  return ast instanceof EmptyExpr;
}
