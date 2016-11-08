/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, OpaqueToken, Optional, SchemaMetadata, SecurityContext} from '@angular/core';

import {CompileDirectiveMetadata, CompileDirectiveSummary, CompilePipeSummary, CompileTemplateMetadata, CompileTemplateSummary, CompileTokenMetadata, CompileTypeMetadata, removeIdentifierDuplicates} from '../compile_metadata';
import {AST, ASTWithSource, BindingPipe, EmptyExpr, Interpolation, ParserError, RecursiveAstVisitor, TemplateBinding} from '../expression_parser/ast';
import {Parser} from '../expression_parser/parser';
import {isPresent} from '../facade/lang';
import {I18NHtmlParser} from '../i18n/i18n_html_parser';
import {Identifiers, identifierToken, resolveIdentifierToken} from '../identifiers';
import * as html from '../ml_parser/ast';
import {ParseTreeResult} from '../ml_parser/html_parser';
import {expandNodes} from '../ml_parser/icu_ast_expander';
import {InterpolationConfig} from '../ml_parser/interpolation_config';
import {mergeNsAndName, splitNsName} from '../ml_parser/tags';
import {ParseError, ParseErrorLevel, ParseSourceSpan} from '../parse_util';
import {Console, view_utils} from '../private_import_core';
import {ProviderElementContext, ProviderViewContext} from '../provider_analyzer';
import {ElementSchemaRegistry} from '../schema/element_schema_registry';
import {CssSelector, SelectorMatcher} from '../selector';
import {isStyleUrlResolvable} from '../style_url_resolver';

import {BindingParser, BoundProperty} from './binding_parser';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, PropertyBindingType, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from './template_ast';
import {PreparsedElementType, preparseElement} from './template_preparser';



// Group 1 = "bind-"
// Group 2 = "let-"
// Group 3 = "ref-/#"
// Group 4 = "on-"
// Group 5 = "bindon-"
// Group 6 = "@"
// Group 7 = the identifier after "bind-", "let-", "ref-/#", "on-", "bindon-" or "@"
// Group 8 = identifier inside [()]
// Group 9 = identifier inside []
// Group 10 = identifier inside ()
const BIND_NAME_REGEXP =
    /^(?:(?:(?:(bind-)|(let-)|(ref-|#)|(on-)|(bindon-)|(@))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/;

const KW_BIND_IDX = 1;
const KW_LET_IDX = 2;
const KW_REF_IDX = 3;
const KW_ON_IDX = 4;
const KW_BINDON_IDX = 5;
const KW_AT_IDX = 6;
const IDENT_KW_IDX = 7;
const IDENT_BANANA_BOX_IDX = 8;
const IDENT_PROPERTY_IDX = 9;
const IDENT_EVENT_IDX = 10;

const TEMPLATE_ELEMENT = 'template';
const TEMPLATE_ATTR = 'template';
const TEMPLATE_ATTR_PREFIX = '*';
const CLASS_ATTR = 'class';

const TEXT_CSS_SELECTOR = CssSelector.parse('*')[0];

/**
 * Provides an array of {@link TemplateAstVisitor}s which will be used to transform
 * parsed templates before compilation is invoked, allowing custom expression syntax
 * and other advanced transformations.
 *
 * This is currently an internal-only feature and not meant for general use.
 */
export const TEMPLATE_TRANSFORMS = new OpaqueToken('TemplateTransforms');

export class TemplateParseError extends ParseError {
  constructor(message: string, span: ParseSourceSpan, level: ParseErrorLevel) {
    super(span, message, level);
  }
}

export class TemplateParseResult {
  constructor(public templateAst?: TemplateAst[], public errors?: ParseError[]) {}
}

@Injectable()
export class TemplateParser {
  constructor(
      private _exprParser: Parser, private _schemaRegistry: ElementSchemaRegistry,
      private _htmlParser: I18NHtmlParser, private _console: Console,
      @Optional() @Inject(TEMPLATE_TRANSFORMS) public transforms: TemplateAstVisitor[]) {}

  parse(
      component: CompileDirectiveMetadata, template: string, directives: CompileDirectiveSummary[],
      pipes: CompilePipeSummary[], schemas: SchemaMetadata[], templateUrl: string): TemplateAst[] {
    const result = this.tryParse(component, template, directives, pipes, schemas, templateUrl);
    const warnings = result.errors.filter(error => error.level === ParseErrorLevel.WARNING);
    const errors = result.errors.filter(error => error.level === ParseErrorLevel.FATAL);

    if (warnings.length > 0) {
      this._console.warn(`Template parse warnings:\n${warnings.join('\n')}`);
    }

    if (errors.length > 0) {
      const errorString = errors.join('\n');
      throw new Error(`Template parse errors:\n${errorString}`);
    }

    return result.templateAst;
  }

  tryParse(
      component: CompileDirectiveMetadata, template: string, directives: CompileDirectiveSummary[],
      pipes: CompilePipeSummary[], schemas: SchemaMetadata[],
      templateUrl: string): TemplateParseResult {
    return this.tryParseHtml(
        this.expandHtml(this._htmlParser.parse(
            template, templateUrl, true, this.getInterpolationConfig(component))),
        component, template, directives, pipes, schemas, templateUrl);
  }

  tryParseHtml(
      htmlAstWithErrors: ParseTreeResult, component: CompileDirectiveMetadata, template: string,
      directives: CompileDirectiveSummary[], pipes: CompilePipeSummary[], schemas: SchemaMetadata[],
      templateUrl: string): TemplateParseResult {
    var result: TemplateAst[];
    var errors = htmlAstWithErrors.errors;
    if (htmlAstWithErrors.rootNodes.length > 0) {
      const uniqDirectives = removeSummaryDuplicates(directives);
      const uniqPipes = removeSummaryDuplicates(pipes);
      const providerViewContext =
          new ProviderViewContext(component, htmlAstWithErrors.rootNodes[0].sourceSpan);
      let interpolationConfig: InterpolationConfig;
      if (component.template && component.template.interpolation) {
        interpolationConfig = {
          start: component.template.interpolation[0],
          end: component.template.interpolation[1]
        };
      }
      const bindingParser = new BindingParser(
          this._exprParser, interpolationConfig, this._schemaRegistry, uniqPipes, errors);
      const parseVisitor = new TemplateParseVisitor(
          providerViewContext, uniqDirectives, bindingParser, this._schemaRegistry, schemas,
          errors);
      result = html.visitAll(parseVisitor, htmlAstWithErrors.rootNodes, EMPTY_ELEMENT_CONTEXT);
      errors.push(...providerViewContext.errors);
    } else {
      result = [];
    }
    this._assertNoReferenceDuplicationOnTemplate(result, errors);

    if (errors.length > 0) {
      return new TemplateParseResult(result, errors);
    }

    if (isPresent(this.transforms)) {
      this.transforms.forEach(
          (transform: TemplateAstVisitor) => { result = templateVisitAll(transform, result); });
    }

    return new TemplateParseResult(result, errors);
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

  getInterpolationConfig(component: CompileDirectiveMetadata): InterpolationConfig {
    if (component.template) {
      return InterpolationConfig.fromArray(component.template.interpolation);
    }
  }

  /** @internal */
  _assertNoReferenceDuplicationOnTemplate(result: TemplateAst[], errors: TemplateParseError[]):
      void {
    const existingReferences: string[] = [];

    result.filter(element => !!(<any>element).references)
        .forEach(element => (<any>element).references.forEach((reference: ReferenceAst) => {
          const name = reference.name;
          if (existingReferences.indexOf(name) < 0) {
            existingReferences.push(name);
          } else {
            const error = new TemplateParseError(
                `Reference "#${name}" is defined several times`, reference.sourceSpan,
                ParseErrorLevel.FATAL);
            errors.push(error);
          }
        }));
  }
}

class TemplateParseVisitor implements html.Visitor {
  selectorMatcher = new SelectorMatcher();
  directivesIndex = new Map<CompileDirectiveSummary, number>();
  ngContentCount: number = 0;

  constructor(
      public providerViewContext: ProviderViewContext, directives: CompileDirectiveSummary[],
      private _bindingParser: BindingParser, private _schemaRegistry: ElementSchemaRegistry,
      private _schemas: SchemaMetadata[], private _targetErrors: TemplateParseError[]) {
    directives.forEach((directive, index) => {
      const selector = CssSelector.parse(directive.selector);
      this.selectorMatcher.addSelectables(selector, directive);
      this.directivesIndex.set(directive, index);
    });
  }

  visitExpansion(expansion: html.Expansion, context: any): any { return null; }

  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any { return null; }

  visitText(text: html.Text, parent: ElementContext): any {
    const ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR);
    const expr = this._bindingParser.parseInterpolation(text.value, text.sourceSpan);
    if (isPresent(expr)) {
      return new BoundTextAst(expr, ngContentIndex, text.sourceSpan);
    } else {
      return new TextAst(text.value, ngContentIndex, text.sourceSpan);
    }
  }

  visitAttribute(attribute: html.Attribute, context: any): any {
    return new AttrAst(attribute.name, attribute.value, attribute.sourceSpan);
  }

  visitComment(comment: html.Comment, context: any): any { return null; }

  visitElement(element: html.Element, parent: ElementContext): any {
    const nodeName = element.name;
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

    const matchableAttrs: string[][] = [];
    const elementOrDirectiveProps: BoundProperty[] = [];
    const elementOrDirectiveRefs: ElementOrDirectiveRef[] = [];
    const elementVars: VariableAst[] = [];
    const events: BoundEventAst[] = [];

    const templateElementOrDirectiveProps: BoundProperty[] = [];
    const templateMatchableAttrs: string[][] = [];
    const templateElementVars: VariableAst[] = [];

    let hasInlineTemplates = false;
    const attrs: AttrAst[] = [];
    const lcElName = splitNsName(nodeName.toLowerCase())[1];
    const isTemplateElement = lcElName == TEMPLATE_ELEMENT;

    element.attrs.forEach(attr => {
      const hasBinding = this._parseAttr(
          isTemplateElement, attr, matchableAttrs, elementOrDirectiveProps, events,
          elementOrDirectiveRefs, elementVars);

      let templateBindingsSource: string|undefined = undefined;
      let prefixToken: string|undefined = undefined;
      if (this._normalizeAttributeName(attr.name) == TEMPLATE_ATTR) {
        templateBindingsSource = attr.value;
      } else if (attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
        templateBindingsSource = attr.value;
        prefixToken = attr.name.substring(TEMPLATE_ATTR_PREFIX.length);  // remove the star
      }
      const hasTemplateBinding = isPresent(templateBindingsSource);
      if (hasTemplateBinding) {
        if (hasInlineTemplates) {
          this._reportError(
              `Can't have multiple template bindings on one element. Use only one attribute named 'template' or prefixed with *`,
              attr.sourceSpan);
        }
        hasInlineTemplates = true;
        this._bindingParser.parseInlineTemplateBinding(
            attr.name, prefixToken, templateBindingsSource, attr.sourceSpan, templateMatchableAttrs,
            templateElementOrDirectiveProps, templateElementVars);
      }

      if (!hasBinding && !hasTemplateBinding) {
        // don't include the bindings as attributes as well in the AST
        attrs.push(this.visitAttribute(attr, null));
        matchableAttrs.push([attr.name, attr.value]);
      }
    });

    const elementCssSelector = createElementCssSelector(nodeName, matchableAttrs);
    const {directives: directiveMetas, matchElement} =
        this._parseDirectives(this.selectorMatcher, elementCssSelector);
    const references: ReferenceAst[] = [];
    const directiveAsts = this._createDirectiveAsts(
        isTemplateElement, element.name, directiveMetas, elementOrDirectiveProps,
        elementOrDirectiveRefs, element.sourceSpan, references);
    const elementProps: BoundElementPropertyAst[] =
        this._createElementPropertyAsts(element.name, elementOrDirectiveProps, directiveAsts);
    const isViewRoot = parent.isTemplateElement || hasInlineTemplates;
    const providerContext = new ProviderElementContext(
        this.providerViewContext, parent.providerContext, isViewRoot, directiveAsts, attrs,
        references, element.sourceSpan);
    const children = html.visitAll(
        preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children,
        ElementContext.create(
            isTemplateElement, directiveAsts,
            isTemplateElement ? parent.providerContext : providerContext));
    providerContext.afterElement();
    // Override the actual selector when the `ngProjectAs` attribute is provided
    const projectionSelector = isPresent(preparsedElement.projectAs) ?
        CssSelector.parse(preparsedElement.projectAs)[0] :
        elementCssSelector;
    const ngContentIndex = parent.findNgContentIndex(projectionSelector);
    let parsedElement: TemplateAst;

    if (preparsedElement.type === PreparsedElementType.NG_CONTENT) {
      if (element.children && !element.children.every(_isEmptyTextNode)) {
        this._reportError(`<ng-content> element cannot have content.`, element.sourceSpan);
      }

      parsedElement = new NgContentAst(
          this.ngContentCount++, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
    } else if (isTemplateElement) {
      this._assertAllEventsPublishedByDirectives(directiveAsts, events);
      this._assertNoComponentsNorElementBindingsOnTemplate(
          directiveAsts, elementProps, element.sourceSpan);

      parsedElement = new EmbeddedTemplateAst(
          attrs, events, references, elementVars, providerContext.transformedDirectiveAsts,
          providerContext.transformProviders, providerContext.transformedHasViewContainer, children,
          hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
    } else {
      this._assertElementExists(matchElement, element);
      this._assertOnlyOneComponent(directiveAsts, element.sourceSpan);

      const ngContentIndex =
          hasInlineTemplates ? null : parent.findNgContentIndex(projectionSelector);
      parsedElement = new ElementAst(
          nodeName, attrs, elementProps, events, references,
          providerContext.transformedDirectiveAsts, providerContext.transformProviders,
          providerContext.transformedHasViewContainer, children,
          hasInlineTemplates ? null : ngContentIndex, element.sourceSpan, element.endSourceSpan);

      this._findComponentDirectives(directiveAsts)
          .forEach(
              componentDirectiveAst => this._validateElementAnimationInputOutputs(
                  componentDirectiveAst.hostProperties, componentDirectiveAst.hostEvents,
                  componentDirectiveAst.directive.template));

      const componentTemplate = providerContext.viewContext.component.template;
      this._validateElementAnimationInputOutputs(
          elementProps, events, componentTemplate.toSummary());
    }

    if (hasInlineTemplates) {
      const templateCssSelector =
          createElementCssSelector(TEMPLATE_ELEMENT, templateMatchableAttrs);
      const {directives: templateDirectiveMetas} =
          this._parseDirectives(this.selectorMatcher, templateCssSelector);
      const templateDirectiveAsts = this._createDirectiveAsts(
          true, element.name, templateDirectiveMetas, templateElementOrDirectiveProps, [],
          element.sourceSpan, []);
      const templateElementProps: BoundElementPropertyAst[] = this._createElementPropertyAsts(
          element.name, templateElementOrDirectiveProps, templateDirectiveAsts);
      this._assertNoComponentsNorElementBindingsOnTemplate(
          templateDirectiveAsts, templateElementProps, element.sourceSpan);
      const templateProviderContext = new ProviderElementContext(
          this.providerViewContext, parent.providerContext, parent.isTemplateElement,
          templateDirectiveAsts, [], [], element.sourceSpan);
      templateProviderContext.afterElement();

      parsedElement = new EmbeddedTemplateAst(
          [], [], [], templateElementVars, templateProviderContext.transformedDirectiveAsts,
          templateProviderContext.transformProviders,
          templateProviderContext.transformedHasViewContainer, [parsedElement], ngContentIndex,
          element.sourceSpan);
    }

    return parsedElement;
  }

  private _validateElementAnimationInputOutputs(
      inputs: BoundElementPropertyAst[], outputs: BoundEventAst[],
      template: CompileTemplateSummary) {
    const triggerLookup = new Set<string>();
    template.animations.forEach(entry => { triggerLookup.add(entry); });

    const animationInputs = inputs.filter(input => input.isAnimation);
    animationInputs.forEach(input => {
      const name = input.name;
      if (!triggerLookup.has(name)) {
        this._reportError(`Couldn't find an animation entry for "${name}"`, input.sourceSpan);
      }
    });

    outputs.forEach(output => {
      if (output.isAnimation) {
        const found = animationInputs.find(input => input.name == output.name);
        if (!found) {
          this._reportError(
              `Unable to listen on (@${output.name}.${output.phase}) because the animation trigger [@${output.name}] isn't being used on the same element`,
              output.sourceSpan);
        }
      }
    });
  }

  private _parseAttr(
      isTemplateElement: boolean, attr: html.Attribute, targetMatchableAttrs: string[][],
      targetProps: BoundProperty[], targetEvents: BoundEventAst[],
      targetRefs: ElementOrDirectiveRef[], targetVars: VariableAst[]): boolean {
    const name = this._normalizeAttributeName(attr.name);
    const value = attr.value;
    const srcSpan = attr.sourceSpan;

    const bindParts = name.match(BIND_NAME_REGEXP);
    let hasBinding = false;

    if (bindParts !== null) {
      hasBinding = true;
      if (isPresent(bindParts[KW_BIND_IDX])) {
        this._bindingParser.parsePropertyBinding(
            bindParts[IDENT_KW_IDX], value, false, srcSpan, targetMatchableAttrs, targetProps);

      } else if (bindParts[KW_LET_IDX]) {
        if (isTemplateElement) {
          const identifier = bindParts[IDENT_KW_IDX];
          this._parseVariable(identifier, value, srcSpan, targetVars);
        } else {
          this._reportError(`"let-" is only supported on template elements.`, srcSpan);
        }

      } else if (bindParts[KW_REF_IDX]) {
        const identifier = bindParts[IDENT_KW_IDX];
        this._parseReference(identifier, value, srcSpan, targetRefs);

      } else if (bindParts[KW_ON_IDX]) {
        this._bindingParser.parseEvent(
            bindParts[IDENT_KW_IDX], value, srcSpan, targetMatchableAttrs, targetEvents);

      } else if (bindParts[KW_BINDON_IDX]) {
        this._bindingParser.parsePropertyBinding(
            bindParts[IDENT_KW_IDX], value, false, srcSpan, targetMatchableAttrs, targetProps);
        this._parseAssignmentEvent(
            bindParts[IDENT_KW_IDX], value, srcSpan, targetMatchableAttrs, targetEvents);

      } else if (bindParts[KW_AT_IDX]) {
        this._bindingParser.parseLiteralAttr(
            name, value, srcSpan, targetMatchableAttrs, targetProps);

      } else if (bindParts[IDENT_BANANA_BOX_IDX]) {
        this._bindingParser.parsePropertyBinding(
            bindParts[IDENT_BANANA_BOX_IDX], value, false, srcSpan, targetMatchableAttrs,
            targetProps);
        this._parseAssignmentEvent(
            bindParts[IDENT_BANANA_BOX_IDX], value, srcSpan, targetMatchableAttrs, targetEvents);

      } else if (bindParts[IDENT_PROPERTY_IDX]) {
        this._bindingParser.parsePropertyBinding(
            bindParts[IDENT_PROPERTY_IDX], value, false, srcSpan, targetMatchableAttrs,
            targetProps);

      } else if (bindParts[IDENT_EVENT_IDX]) {
        this._bindingParser.parseEvent(
            bindParts[IDENT_EVENT_IDX], value, srcSpan, targetMatchableAttrs, targetEvents);
      }
    } else {
      hasBinding = this._bindingParser.parsePropertyInterpolation(
          name, value, srcSpan, targetMatchableAttrs, targetProps);
    }

    if (!hasBinding) {
      this._bindingParser.parseLiteralAttr(name, value, srcSpan, targetMatchableAttrs, targetProps);
    }

    return hasBinding;
  }

  private _normalizeAttributeName(attrName: string): string {
    return /^data-/i.test(attrName) ? attrName.substring(5) : attrName;
  }

  private _parseVariable(
      identifier: string, value: string, sourceSpan: ParseSourceSpan, targetVars: VariableAst[]) {
    if (identifier.indexOf('-') > -1) {
      this._reportError(`"-" is not allowed in variable names`, sourceSpan);
    }

    targetVars.push(new VariableAst(identifier, value, sourceSpan));
  }

  private _parseReference(
      identifier: string, value: string, sourceSpan: ParseSourceSpan,
      targetRefs: ElementOrDirectiveRef[]) {
    if (identifier.indexOf('-') > -1) {
      this._reportError(`"-" is not allowed in reference names`, sourceSpan);
    }

    targetRefs.push(new ElementOrDirectiveRef(identifier, value, sourceSpan));
  }

  private _parseAssignmentEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetEvents: BoundEventAst[]) {
    this._bindingParser.parseEvent(
        `${name}Change`, `${expression}=$event`, sourceSpan, targetMatchableAttrs, targetEvents);
  }

  private _parseDirectives(selectorMatcher: SelectorMatcher, elementCssSelector: CssSelector):
      {directives: CompileDirectiveSummary[], matchElement: boolean} {
    // Need to sort the directives so that we get consistent results throughout,
    // as selectorMatcher uses Maps inside.
    // Also deduplicate directives as they might match more than one time!
    const directives = new Array(this.directivesIndex.size);
    // Whether any directive selector matches on the element name
    let matchElement = false;

    selectorMatcher.match(elementCssSelector, (selector, directive) => {
      directives[this.directivesIndex.get(directive)] = directive;
      matchElement = matchElement || selector.hasElementSelector();
    });

    return {
      directives: directives.filter(dir => !!dir),
      matchElement,
    };
  }

  private _createDirectiveAsts(
      isTemplateElement: boolean, elementName: string, directives: CompileDirectiveSummary[],
      props: BoundProperty[], elementOrDirectiveRefs: ElementOrDirectiveRef[],
      elementSourceSpan: ParseSourceSpan, targetReferences: ReferenceAst[]): DirectiveAst[] {
    const matchedReferences = new Set<string>();
    let component: CompileDirectiveSummary = null;
    const directiveAsts = directives.map((directive) => {
      const sourceSpan = new ParseSourceSpan(
          elementSourceSpan.start, elementSourceSpan.end, `Directive ${directive.type.name}`);
      if (directive.isComponent) {
        component = directive;
      }
      const directiveProperties: BoundDirectivePropertyAst[] = [];
      const hostProperties =
          this._bindingParser.createDirectiveHostPropertyAsts(directive, sourceSpan);
      // Note: We need to check the host properties here as well,
      // as we don't know the element name in the DirectiveWrapperCompiler yet.
      this._checkPropertiesInSchema(elementName, hostProperties);
      const hostEvents = this._bindingParser.createDirectiveHostEventAsts(directive, sourceSpan);
      this._createDirectivePropertyAsts(directive.inputs, props, directiveProperties);
      elementOrDirectiveRefs.forEach((elOrDirRef) => {
        if ((elOrDirRef.value.length === 0 && directive.isComponent) ||
            (directive.exportAs == elOrDirRef.value)) {
          targetReferences.push(new ReferenceAst(
              elOrDirRef.name, identifierToken(directive.type), elOrDirRef.sourceSpan));
          matchedReferences.add(elOrDirRef.name);
        }
      });
      return new DirectiveAst(
          directive, directiveProperties, hostProperties, hostEvents, sourceSpan);
    });
    elementOrDirectiveRefs.forEach((elOrDirRef) => {
      if (elOrDirRef.value.length > 0) {
        if (!matchedReferences.has(elOrDirRef.name)) {
          this._reportError(
              `There is no directive with "exportAs" set to "${elOrDirRef.value}"`,
              elOrDirRef.sourceSpan);
        }
      } else if (!component) {
        let refToken: CompileTokenMetadata = null;
        if (isTemplateElement) {
          refToken = resolveIdentifierToken(Identifiers.TemplateRef);
        }
        targetReferences.push(new ReferenceAst(elOrDirRef.name, refToken, elOrDirRef.sourceSpan));
      }
    });  // fix syntax highlighting issue: `
    return directiveAsts;
  }

  private _createDirectivePropertyAsts(
      directiveProperties: {[key: string]: string}, boundProps: BoundProperty[],
      targetBoundDirectiveProps: BoundDirectivePropertyAst[]) {
    if (directiveProperties) {
      const boundPropsByName = new Map<string, BoundProperty>();
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
          targetBoundDirectiveProps.push(new BoundDirectivePropertyAst(
              dirProp, boundProp.name, boundProp.expression, boundProp.sourceSpan));
        }
      });
    }
  }

  private _createElementPropertyAsts(
      elementName: string, props: BoundProperty[],
      directives: DirectiveAst[]): BoundElementPropertyAst[] {
    const boundElementProps: BoundElementPropertyAst[] = [];
    const boundDirectivePropsIndex = new Map<string, BoundDirectivePropertyAst>();

    directives.forEach((directive: DirectiveAst) => {
      directive.inputs.forEach((prop: BoundDirectivePropertyAst) => {
        boundDirectivePropsIndex.set(prop.templateName, prop);
      });
    });

    props.forEach((prop: BoundProperty) => {
      if (!prop.isLiteral && !boundDirectivePropsIndex.get(prop.name)) {
        boundElementProps.push(this._bindingParser.createElementPropertyAst(elementName, prop));
      }
    });
    this._checkPropertiesInSchema(elementName, boundElementProps);
    return boundElementProps;
  }

  private _findComponentDirectives(directives: DirectiveAst[]): DirectiveAst[] {
    return directives.filter(directive => directive.directive.isComponent);
  }

  private _findComponentDirectiveNames(directives: DirectiveAst[]): string[] {
    return this._findComponentDirectives(directives)
        .map(directive => directive.directive.type.name);
  }

  private _assertOnlyOneComponent(directives: DirectiveAst[], sourceSpan: ParseSourceSpan) {
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
      const errorMsg = `'${elName}' is not a known element:\n` +
          `1. If '${elName}' is an Angular component, then verify that it is part of this module.\n` +
          `2. If '${elName}' is a Web Component then add "CUSTOM_ELEMENTS_SCHEMA" to the '@NgModule.schemas' of this component to suppress this message.`;
      this._reportError(errorMsg, element.sourceSpan);
    }
  }

  private _assertNoComponentsNorElementBindingsOnTemplate(
      directives: DirectiveAst[], elementProps: BoundElementPropertyAst[],
      sourceSpan: ParseSourceSpan) {
    const componentTypeNames: string[] = this._findComponentDirectiveNames(directives);
    if (componentTypeNames.length > 0) {
      this._reportError(
          `Components on an embedded template: ${componentTypeNames.join(',')}`, sourceSpan);
    }
    elementProps.forEach(prop => {
      this._reportError(
          `Property binding ${prop.name} not used by any directive on an embedded template. Make sure that the property name is spelled correctly and all directives are listed in the "directives" section.`,
          sourceSpan);
    });
  }

  private _assertAllEventsPublishedByDirectives(
      directives: DirectiveAst[], events: BoundEventAst[]) {
    const allDirectiveEvents = new Set<string>();

    directives.forEach(directive => {
      Object.keys(directive.directive.outputs).forEach(k => {
        const eventName = directive.directive.outputs[k];
        allDirectiveEvents.add(eventName);
      });
    });

    events.forEach(event => {
      if (isPresent(event.target) || !allDirectiveEvents.has(event.name)) {
        this._reportError(
            `Event binding ${event.fullName} not emitted by any directive on an embedded template. Make sure that the event name is spelled correctly and all directives are listed in the "directives" section.`,
            event.sourceSpan);
      }
    });
  }

  private _checkPropertiesInSchema(elementName: string, boundProps: BoundElementPropertyAst[]) {
    boundProps.forEach((boundProp) => {
      if (boundProp.type === PropertyBindingType.Property &&
          !this._schemaRegistry.hasProperty(elementName, boundProp.name, this._schemas)) {
        let errorMsg =
            `Can't bind to '${boundProp.name}' since it isn't a known property of '${elementName}'.`;
        if (elementName.indexOf('-') > -1) {
          errorMsg +=
              `\n1. If '${elementName}' is an Angular component and it has '${boundProp.name}' input, then verify that it is part of this module.` +
              `\n2. If '${elementName}' is a Web Component then add "CUSTOM_ELEMENTS_SCHEMA" to the '@NgModule.schemas' of this component to suppress this message.\n`;
        }
        this._reportError(errorMsg, boundProp.sourceSpan);
      }
    });
  }

  private _reportError(
      message: string, sourceSpan: ParseSourceSpan,
      level: ParseErrorLevel = ParseErrorLevel.FATAL) {
    this._targetErrors.push(new ParseError(sourceSpan, message, level));
  }
}

class NonBindableVisitor implements html.Visitor {
  visitElement(ast: html.Element, parent: ElementContext): ElementAst {
    const preparsedElement = preparseElement(ast);
    if (preparsedElement.type === PreparsedElementType.SCRIPT ||
        preparsedElement.type === PreparsedElementType.STYLE ||
        preparsedElement.type === PreparsedElementType.STYLESHEET) {
      // Skipping <script> for security reasons
      // Skipping <style> and stylesheets as we already processed them
      // in the StyleCompiler
      return null;
    }

    const attrNameAndValues = ast.attrs.map(attrAst => [attrAst.name, attrAst.value]);
    const selector = createElementCssSelector(ast.name, attrNameAndValues);
    const ngContentIndex = parent.findNgContentIndex(selector);
    const children = html.visitAll(this, ast.children, EMPTY_ELEMENT_CONTEXT);
    return new ElementAst(
        ast.name, html.visitAll(this, ast.attrs), [], [], [], [], [], false, children,
        ngContentIndex, ast.sourceSpan, ast.endSourceSpan);
  }
  visitComment(comment: html.Comment, context: any): any { return null; }

  visitAttribute(attribute: html.Attribute, context: any): AttrAst {
    return new AttrAst(attribute.name, attribute.value, attribute.sourceSpan);
  }

  visitText(text: html.Text, parent: ElementContext): TextAst {
    const ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR);
    return new TextAst(text.value, ngContentIndex, text.sourceSpan);
  }

  visitExpansion(expansion: html.Expansion, context: any): any { return expansion; }

  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any { return expansionCase; }
}

class ElementOrDirectiveRef {
  constructor(public name: string, public value: string, public sourceSpan: ParseSourceSpan) {}
}

export function splitClasses(classAttrValue: string): string[] {
  return classAttrValue.trim().split(/\s+/g);
}

class ElementContext {
  static create(
      isTemplateElement: boolean, directives: DirectiveAst[],
      providerContext: ProviderElementContext): ElementContext {
    const matcher = new SelectorMatcher();
    let wildcardNgContentIndex: number = null;
    const component = directives.find(directive => directive.directive.isComponent);
    if (component) {
      const ngContentSelectors = component.directive.template.ngContentSelectors;
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
      private _wildcardNgContentIndex: number, public providerContext: ProviderElementContext) {}

  findNgContentIndex(selector: CssSelector): number {
    const ngContentIndices: number[] = [];
    this._ngContentIndexMatcher.match(
        selector, (selector, ngContentIndex) => { ngContentIndices.push(ngContentIndex); });
    ngContentIndices.sort();
    if (isPresent(this._wildcardNgContentIndex)) {
      ngContentIndices.push(this._wildcardNgContentIndex);
    }
    return ngContentIndices.length > 0 ? ngContentIndices[0] : null;
  }
}

function createElementCssSelector(elementName: string, matchableAttrs: string[][]): CssSelector {
  const cssSelector = new CssSelector();
  const elNameNoNs = splitNsName(elementName)[1];

  cssSelector.setElement(elNameNoNs);

  for (let i = 0; i < matchableAttrs.length; i++) {
    let attrName = matchableAttrs[i][0];
    let attrNameNoNs = splitNsName(attrName)[1];
    let attrValue = matchableAttrs[i][1];

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

export function removeSummaryDuplicates<T extends{type: CompileTypeMetadata}>(items: T[]): T[] {
  const map = new Map<any, T>();

  items.forEach((item) => {
    if (!map.get(item.type.reference)) {
      map.set(item.type.reference, item);
    }
  });

  return Array.from(map.values());
}
