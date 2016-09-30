/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, OpaqueToken, Optional, SchemaMetadata, SecurityContext} from '@angular/core';

import {CompileDirectiveMetadata, CompilePipeMetadata, CompileTemplateMetadata, CompileTokenMetadata, removeIdentifierDuplicates} from '../compile_metadata';
import {AST, ASTWithSource, BindingPipe, EmptyExpr, Interpolation, ParserError, RecursiveAstVisitor, TemplateBinding} from '../expression_parser/ast';
import {Parser} from '../expression_parser/parser';
import {StringMapWrapper} from '../facade/collection';
import {isPresent, isString} from '../facade/lang';
import {I18NHtmlParser} from '../i18n/i18n_html_parser';
import {Identifiers, identifierToken, resolveIdentifierToken} from '../identifiers';
import * as html from '../ml_parser/ast';
import {ParseTreeResult} from '../ml_parser/html_parser';
import {expandNodes} from '../ml_parser/icu_ast_expander';
import {InterpolationConfig} from '../ml_parser/interpolation_config';
import {mergeNsAndName, splitNsName} from '../ml_parser/tags';
import {ParseError, ParseErrorLevel, ParseSourceSpan} from '../parse_util';
import {Console, MAX_INTERPOLATION_VALUES} from '../private_import_core';
import {ProviderElementContext, ProviderViewContext} from '../provider_analyzer';
import {ElementSchemaRegistry} from '../schema/element_schema_registry';
import {CssSelector, SelectorMatcher} from '../selector';
import {isStyleUrlResolvable} from '../style_url_resolver';
import {splitAtColon, splitAtPeriod} from '../util';

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

const ANIMATE_PROP_PREFIX = 'animate-';
const TEMPLATE_ELEMENT = 'template';
const TEMPLATE_ATTR = 'template';
const TEMPLATE_ATTR_PREFIX = '*';
const CLASS_ATTR = 'class';

const PROPERTY_PARTS_SEPARATOR = '.';
const ATTRIBUTE_PREFIX = 'attr';
const CLASS_PREFIX = 'class';
const STYLE_PREFIX = 'style';

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
      component: CompileDirectiveMetadata, template: string, directives: CompileDirectiveMetadata[],
      pipes: CompilePipeMetadata[], schemas: SchemaMetadata[], templateUrl: string): TemplateAst[] {
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
      component: CompileDirectiveMetadata, template: string, directives: CompileDirectiveMetadata[],
      pipes: CompilePipeMetadata[], schemas: SchemaMetadata[],
      templateUrl: string): TemplateParseResult {
    let interpolationConfig: any;
    if (component.template) {
      interpolationConfig = InterpolationConfig.fromArray(component.template.interpolation);
    }
    let htmlAstWithErrors =
        this._htmlParser.parse(template, templateUrl, true, interpolationConfig);
    const errors: ParseError[] = htmlAstWithErrors.errors;
    let result: TemplateAst[];

    if (errors.length == 0) {
      // Transform ICU messages to angular directives
      const expandedHtmlAst = expandNodes(htmlAstWithErrors.rootNodes);
      errors.push(...expandedHtmlAst.errors);
      htmlAstWithErrors = new ParseTreeResult(expandedHtmlAst.nodes, errors);
    }

    if (htmlAstWithErrors.rootNodes.length > 0) {
      const uniqDirectives = removeIdentifierDuplicates(directives);
      const uniqPipes = removeIdentifierDuplicates(pipes);
      const providerViewContext =
          new ProviderViewContext(component, htmlAstWithErrors.rootNodes[0].sourceSpan);
      const parseVisitor = new TemplateParseVisitor(
          providerViewContext, uniqDirectives, uniqPipes, schemas, this._exprParser,
          this._schemaRegistry);
      result = html.visitAll(parseVisitor, htmlAstWithErrors.rootNodes, EMPTY_ELEMENT_CONTEXT);
      errors.push(...parseVisitor.errors, ...providerViewContext.errors);
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
  errors: TemplateParseError[] = [];
  directivesIndex = new Map<CompileDirectiveMetadata, number>();
  ngContentCount: number = 0;
  pipesByName: Map<string, CompilePipeMetadata> = new Map();

  private _interpolationConfig: InterpolationConfig;

  constructor(
      public providerViewContext: ProviderViewContext, directives: CompileDirectiveMetadata[],
      pipes: CompilePipeMetadata[], private _schemas: SchemaMetadata[], private _exprParser: Parser,
      private _schemaRegistry: ElementSchemaRegistry) {
    const tempMeta = providerViewContext.component.template;

    if (tempMeta && tempMeta.interpolation) {
      this._interpolationConfig = {
        start: tempMeta.interpolation[0],
        end: tempMeta.interpolation[1]
      };
    }

    directives.forEach((directive: CompileDirectiveMetadata, index: number) => {
      const selector = CssSelector.parse(directive.selector);
      this.selectorMatcher.addSelectables(selector, directive);
      this.directivesIndex.set(directive, index);
    });

    pipes.forEach(pipe => this.pipesByName.set(pipe.name, pipe));
  }

  private _reportError(
      message: string, sourceSpan: ParseSourceSpan,
      level: ParseErrorLevel = ParseErrorLevel.FATAL) {
    this.errors.push(new TemplateParseError(message, sourceSpan, level));
  }

  private _reportParserErrors(errors: ParserError[], sourceSpan: ParseSourceSpan) {
    for (const error of errors) {
      this._reportError(error.message, sourceSpan);
    }
  }

  private _parseInterpolation(value: string, sourceSpan: ParseSourceSpan): ASTWithSource {
    const sourceInfo = sourceSpan.start.toString();

    try {
      const ast = this._exprParser.parseInterpolation(value, sourceInfo, this._interpolationConfig);
      if (ast) this._reportParserErrors(ast.errors, sourceSpan);
      this._checkPipes(ast, sourceSpan);
      if (isPresent(ast) &&
          (<Interpolation>ast.ast).expressions.length > MAX_INTERPOLATION_VALUES) {
        throw new Error(`Only support at most ${MAX_INTERPOLATION_VALUES} interpolation values!`);
      }
      return ast;
    } catch (e) {
      this._reportError(`${e}`, sourceSpan);
      return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
    }
  }

  private _parseAction(value: string, sourceSpan: ParseSourceSpan): ASTWithSource {
    const sourceInfo = sourceSpan.start.toString();

    try {
      const ast = this._exprParser.parseAction(value, sourceInfo, this._interpolationConfig);
      if (ast) {
        this._reportParserErrors(ast.errors, sourceSpan);
      }
      if (!ast || ast.ast instanceof EmptyExpr) {
        this._reportError(`Empty expressions are not allowed`, sourceSpan);
        return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
      }
      this._checkPipes(ast, sourceSpan);
      return ast;
    } catch (e) {
      this._reportError(`${e}`, sourceSpan);
      return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
    }
  }

  private _parseBinding(value: string, sourceSpan: ParseSourceSpan): ASTWithSource {
    const sourceInfo = sourceSpan.start.toString();

    try {
      const ast = this._exprParser.parseBinding(value, sourceInfo, this._interpolationConfig);
      if (ast) this._reportParserErrors(ast.errors, sourceSpan);
      this._checkPipes(ast, sourceSpan);
      return ast;
    } catch (e) {
      this._reportError(`${e}`, sourceSpan);
      return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
    }
  }

  private _parseTemplateBindings(value: string, sourceSpan: ParseSourceSpan): TemplateBinding[] {
    const sourceInfo = sourceSpan.start.toString();

    try {
      const bindingsResult = this._exprParser.parseTemplateBindings(value, sourceInfo);
      this._reportParserErrors(bindingsResult.errors, sourceSpan);
      bindingsResult.templateBindings.forEach((binding) => {
        if (isPresent(binding.expression)) {
          this._checkPipes(binding.expression, sourceSpan);
        }
      });
      bindingsResult.warnings.forEach(
          (warning) => { this._reportError(warning, sourceSpan, ParseErrorLevel.WARNING); });
      return bindingsResult.templateBindings;
    } catch (e) {
      this._reportError(`${e}`, sourceSpan);
      return [];
    }
  }

  private _checkPipes(ast: ASTWithSource, sourceSpan: ParseSourceSpan) {
    if (isPresent(ast)) {
      const collector = new PipeCollector();
      ast.visit(collector);
      collector.pipes.forEach((pipeName) => {
        if (!this.pipesByName.has(pipeName)) {
          this._reportError(`The pipe '${pipeName}' could not be found`, sourceSpan);
        }
      });
    }
  }

  visitExpansion(expansion: html.Expansion, context: any): any { return null; }

  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any { return null; }

  visitText(text: html.Text, parent: ElementContext): any {
    const ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR);
    const expr = this._parseInterpolation(text.value, text.sourceSpan);
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
    const elementOrDirectiveProps: BoundElementOrDirectiveProperty[] = [];
    const elementOrDirectiveRefs: ElementOrDirectiveRef[] = [];
    const elementVars: VariableAst[] = [];
    const animationProps: BoundElementPropertyAst[] = [];
    const events: BoundEventAst[] = [];

    const templateElementOrDirectiveProps: BoundElementOrDirectiveProperty[] = [];
    const templateMatchableAttrs: string[][] = [];
    const templateElementVars: VariableAst[] = [];

    let hasInlineTemplates = false;
    const attrs: AttrAst[] = [];
    const lcElName = splitNsName(nodeName.toLowerCase())[1];
    const isTemplateElement = lcElName == TEMPLATE_ELEMENT;

    element.attrs.forEach(attr => {
      const hasBinding = this._parseAttr(
          isTemplateElement, attr, matchableAttrs, elementOrDirectiveProps, animationProps, events,
          elementOrDirectiveRefs, elementVars);

      const hasTemplateBinding = this._parseInlineTemplateBinding(
          attr, templateMatchableAttrs, templateElementOrDirectiveProps, templateElementVars);

      if (hasTemplateBinding && hasInlineTemplates) {
        this._reportError(
            `Can't have multiple template bindings on one element. Use only one attribute named 'template' or prefixed with *`,
            attr.sourceSpan);
      }

      if (!hasBinding && !hasTemplateBinding) {
        // don't include the bindings as attributes as well in the AST
        attrs.push(this.visitAttribute(attr, null));
        matchableAttrs.push([attr.name, attr.value]);
      }

      if (hasTemplateBinding) {
        hasInlineTemplates = true;
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
        this._createElementPropertyAsts(element.name, elementOrDirectiveProps, directiveAsts)
            .concat(animationProps);
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
      if (isPresent(element.children) && element.children.length > 0) {
        this._reportError(
            `<ng-content> element cannot have content. <ng-content> must be immediately followed by </ng-content>`,
            element.sourceSpan);
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
          hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);

      this._findComponentDirectives(directiveAsts)
          .forEach(
              componentDirectiveAst => this._validateElementAnimationInputOutputs(
                  componentDirectiveAst.hostProperties, componentDirectiveAst.hostEvents,
                  componentDirectiveAst.directive.template));

      const componentTemplate = providerContext.viewContext.component.template;
      this._validateElementAnimationInputOutputs(elementProps, events, componentTemplate);
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
      template: CompileTemplateMetadata) {
    const triggerLookup = new Set<string>();
    template.animations.forEach(entry => { triggerLookup.add(entry.name); });

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

  private _parseInlineTemplateBinding(
      attr: html.Attribute, targetMatchableAttrs: string[][],
      targetProps: BoundElementOrDirectiveProperty[], targetVars: VariableAst[]): boolean {
    let templateBindingsSource: string = null;
    if (this._normalizeAttributeName(attr.name) == TEMPLATE_ATTR) {
      templateBindingsSource = attr.value;
    } else if (attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
      const key = attr.name.substring(TEMPLATE_ATTR_PREFIX.length);  // remove the star
      templateBindingsSource = (attr.value.length == 0) ? key : key + ' ' + attr.value;
    }
    if (isPresent(templateBindingsSource)) {
      const bindings = this._parseTemplateBindings(templateBindingsSource, attr.sourceSpan);
      for (let i = 0; i < bindings.length; i++) {
        const binding = bindings[i];
        if (binding.keyIsVar) {
          targetVars.push(new VariableAst(binding.key, binding.name, attr.sourceSpan));
        } else if (isPresent(binding.expression)) {
          this._parsePropertyAst(
              binding.key, binding.expression, attr.sourceSpan, targetMatchableAttrs, targetProps);
        } else {
          targetMatchableAttrs.push([binding.key, '']);
          this._parseLiteralAttr(binding.key, null, attr.sourceSpan, targetProps);
        }
      }
      return true;
    }
    return false;
  }

  private _parseAttr(
      isTemplateElement: boolean, attr: html.Attribute, targetMatchableAttrs: string[][],
      targetProps: BoundElementOrDirectiveProperty[],
      targetAnimationProps: BoundElementPropertyAst[], targetEvents: BoundEventAst[],
      targetRefs: ElementOrDirectiveRef[], targetVars: VariableAst[]): boolean {
    const name = this._normalizeAttributeName(attr.name);
    const value = attr.value;
    const srcSpan = attr.sourceSpan;

    const bindParts = name.match(BIND_NAME_REGEXP);
    let hasBinding = false;

    if (bindParts !== null) {
      hasBinding = true;
      if (isPresent(bindParts[KW_BIND_IDX])) {
        this._parsePropertyOrAnimation(
            bindParts[IDENT_KW_IDX], value, srcSpan, targetMatchableAttrs, targetProps,
            targetAnimationProps);

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
        this._parseEventOrAnimationEvent(
            bindParts[IDENT_KW_IDX], value, srcSpan, targetMatchableAttrs, targetEvents);

      } else if (bindParts[KW_BINDON_IDX]) {
        this._parsePropertyOrAnimation(
            bindParts[IDENT_KW_IDX], value, srcSpan, targetMatchableAttrs, targetProps,
            targetAnimationProps);
        this._parseAssignmentEvent(
            bindParts[IDENT_KW_IDX], value, srcSpan, targetMatchableAttrs, targetEvents);

      } else if (bindParts[KW_AT_IDX]) {
        if (_isAnimationLabel(name) && isPresent(value) && value.length > 0) {
          this._reportError(
              `Assigning animation triggers via @prop="exp" attributes with an expression is invalid.` +
                  ` Use property bindings (e.g. [@prop]="exp") or use an attribute without a value (e.g. @prop) instead.`,
              srcSpan, ParseErrorLevel.FATAL);
        }
        this._parseAnimation(
            bindParts[IDENT_KW_IDX], value, srcSpan, targetMatchableAttrs, targetAnimationProps);
      } else if (bindParts[IDENT_BANANA_BOX_IDX]) {
        this._parsePropertyOrAnimation(
            bindParts[IDENT_BANANA_BOX_IDX], value, srcSpan, targetMatchableAttrs, targetProps,
            targetAnimationProps);
        this._parseAssignmentEvent(
            bindParts[IDENT_BANANA_BOX_IDX], value, srcSpan, targetMatchableAttrs, targetEvents);

      } else if (bindParts[IDENT_PROPERTY_IDX]) {
        this._parsePropertyOrAnimation(
            bindParts[IDENT_PROPERTY_IDX], value, srcSpan, targetMatchableAttrs, targetProps,
            targetAnimationProps);

      } else if (bindParts[IDENT_EVENT_IDX]) {
        this._parseEventOrAnimationEvent(
            bindParts[IDENT_EVENT_IDX], value, srcSpan, targetMatchableAttrs, targetEvents);
      }
    } else {
      hasBinding =
          this._parsePropertyInterpolation(name, value, srcSpan, targetMatchableAttrs, targetProps);
    }

    if (!hasBinding) {
      this._parseLiteralAttr(name, value, srcSpan, targetProps);
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

  private _parsePropertyOrAnimation(
      name: string, expression: string, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetProps: BoundElementOrDirectiveProperty[],
      targetAnimationProps: BoundElementPropertyAst[]) {
    const animatePropLength = ANIMATE_PROP_PREFIX.length;
    var isAnimationProp = _isAnimationLabel(name);
    var animationPrefixLength = 1;
    if (name.substring(0, animatePropLength) == ANIMATE_PROP_PREFIX) {
      isAnimationProp = true;
      animationPrefixLength = animatePropLength;
    }

    if (isAnimationProp) {
      this._parseAnimation(
          name.substr(animationPrefixLength), expression, sourceSpan, targetMatchableAttrs,
          targetAnimationProps);
    } else {
      this._parsePropertyAst(
          name, this._parseBinding(expression, sourceSpan), sourceSpan, targetMatchableAttrs,
          targetProps);
    }
  }

  private _parseAnimation(
      name: string, expression: string, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetAnimationProps: BoundElementPropertyAst[]) {
    // This will occur when a @trigger is not paired with an expression.
    // For animations it is valid to not have an expression since */void
    // states will be applied by angular when the element is attached/detached
    if (!isPresent(expression) || expression.length == 0) {
      expression = 'null';
    }

    const ast = this._parseBinding(expression, sourceSpan);
    targetMatchableAttrs.push([name, ast.source]);
    targetAnimationProps.push(new BoundElementPropertyAst(
        name, PropertyBindingType.Animation, SecurityContext.NONE, ast, null, sourceSpan));
  }

  private _parsePropertyInterpolation(
      name: string, value: string, sourceSpan: ParseSourceSpan, targetMatchableAttrs: string[][],
      targetProps: BoundElementOrDirectiveProperty[]): boolean {
    const expr = this._parseInterpolation(value, sourceSpan);
    if (isPresent(expr)) {
      this._parsePropertyAst(name, expr, sourceSpan, targetMatchableAttrs, targetProps);
      return true;
    }
    return false;
  }

  private _parsePropertyAst(
      name: string, ast: ASTWithSource, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetProps: BoundElementOrDirectiveProperty[]) {
    targetMatchableAttrs.push([name, ast.source]);
    targetProps.push(new BoundElementOrDirectiveProperty(name, ast, false, sourceSpan));
  }

  private _parseAssignmentEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetEvents: BoundEventAst[]) {
    this._parseEventOrAnimationEvent(
        `${name}Change`, `${expression}=$event`, sourceSpan, targetMatchableAttrs, targetEvents);
  }

  private _parseEventOrAnimationEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetEvents: BoundEventAst[]) {
    if (_isAnimationLabel(name)) {
      name = name.substr(1);
      this._parseAnimationEvent(name, expression, sourceSpan, targetEvents);
    } else {
      this._parseEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents);
    }
  }

  private _parseAnimationEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan,
      targetEvents: BoundEventAst[]) {
    const matches = splitAtPeriod(name, [name, '']);
    const eventName = matches[0];
    const phase = matches[1].toLowerCase();
    if (phase) {
      switch (phase) {
        case 'start':
        case 'done':
          const ast = this._parseAction(expression, sourceSpan);
          targetEvents.push(new BoundEventAst(eventName, null, phase, ast, sourceSpan));
          break;

        default:
          this._reportError(
              `The provided animation output phase value "${phase}" for "@${eventName}" is not supported (use start or done)`,
              sourceSpan);
          break;
      }
    } else {
      this._reportError(
          `The animation trigger output event (@${eventName}) is missing its phase value name (start or done are currently supported)`,
          sourceSpan);
    }
  }

  private _parseEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan,
      targetMatchableAttrs: string[][], targetEvents: BoundEventAst[]) {
    // long format: 'target: eventName'
    const [target, eventName] = splitAtColon(name, [null, name]);
    const ast = this._parseAction(expression, sourceSpan);
    targetMatchableAttrs.push([name, ast.source]);
    targetEvents.push(new BoundEventAst(eventName, target, null, ast, sourceSpan));
    // Don't detect directives for event names for now,
    // so don't add the event name to the matchableAttrs
  }

  private _parseLiteralAttr(
      name: string, value: string, sourceSpan: ParseSourceSpan,
      targetProps: BoundElementOrDirectiveProperty[]) {
    targetProps.push(new BoundElementOrDirectiveProperty(
        name, this._exprParser.wrapLiteralPrimitive(value, ''), true, sourceSpan));
  }

  private _parseDirectives(selectorMatcher: SelectorMatcher, elementCssSelector: CssSelector):
      {directives: CompileDirectiveMetadata[], matchElement: boolean} {
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
      isTemplateElement: boolean, elementName: string, directives: CompileDirectiveMetadata[],
      props: BoundElementOrDirectiveProperty[], elementOrDirectiveRefs: ElementOrDirectiveRef[],
      elementSourceSpan: ParseSourceSpan, targetReferences: ReferenceAst[]): DirectiveAst[] {
    const matchedReferences = new Set<string>();
    let component: CompileDirectiveMetadata = null;
    const directiveAsts = directives.map((directive: CompileDirectiveMetadata) => {
      const sourceSpan = new ParseSourceSpan(
          elementSourceSpan.start, elementSourceSpan.end, `Directive ${directive.type.name}`);
      if (directive.isComponent) {
        component = directive;
      }
      const hostProperties: BoundElementPropertyAst[] = [];
      const hostEvents: BoundEventAst[] = [];
      const directiveProperties: BoundDirectivePropertyAst[] = [];
      this._createDirectiveHostPropertyAsts(
          elementName, directive.hostProperties, sourceSpan, hostProperties);
      this._createDirectiveHostEventAsts(directive.hostListeners, sourceSpan, hostEvents);
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

  private _createDirectiveHostPropertyAsts(
      elementName: string, hostProps: {[key: string]: string}, sourceSpan: ParseSourceSpan,
      targetPropertyAsts: BoundElementPropertyAst[]) {
    if (hostProps) {
      StringMapWrapper.forEach(hostProps, (expression: string, propName: string) => {
        if (isString(expression)) {
          const exprAst = this._parseBinding(expression, sourceSpan);
          targetPropertyAsts.push(
              this._createElementPropertyAst(elementName, propName, exprAst, sourceSpan));
        } else {
          this._reportError(
              `Value of the host property binding "${propName}" needs to be a string representing an expression but got "${expression}" (${typeof expression})`,
              sourceSpan);
        }
      });
    }
  }

  private _createDirectiveHostEventAsts(
      hostListeners: {[key: string]: string}, sourceSpan: ParseSourceSpan,
      targetEventAsts: BoundEventAst[]) {
    if (hostListeners) {
      StringMapWrapper.forEach(hostListeners, (expression: string, propName: string) => {
        if (isString(expression)) {
          this._parseEventOrAnimationEvent(propName, expression, sourceSpan, [], targetEventAsts);
        } else {
          this._reportError(
              `Value of the host listener "${propName}" needs to be a string representing an expression but got "${expression}" (${typeof expression})`,
              sourceSpan);
        }
      });
    }
  }

  private _createDirectivePropertyAsts(
      directiveProperties: {[key: string]: string}, boundProps: BoundElementOrDirectiveProperty[],
      targetBoundDirectiveProps: BoundDirectivePropertyAst[]) {
    if (directiveProperties) {
      const boundPropsByName = new Map<string, BoundElementOrDirectiveProperty>();
      boundProps.forEach(boundProp => {
        const prevValue = boundPropsByName.get(boundProp.name);
        if (!prevValue || prevValue.isLiteral) {
          // give [a]="b" a higher precedence than a="b" on the same element
          boundPropsByName.set(boundProp.name, boundProp);
        }
      });

      StringMapWrapper.forEach(directiveProperties, (elProp: string, dirProp: string) => {
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
      elementName: string, props: BoundElementOrDirectiveProperty[],
      directives: DirectiveAst[]): BoundElementPropertyAst[] {
    const boundElementProps: BoundElementPropertyAst[] = [];
    const boundDirectivePropsIndex = new Map<string, BoundDirectivePropertyAst>();

    directives.forEach((directive: DirectiveAst) => {
      directive.inputs.forEach((prop: BoundDirectivePropertyAst) => {
        boundDirectivePropsIndex.set(prop.templateName, prop);
      });
    });

    props.forEach((prop: BoundElementOrDirectiveProperty) => {
      if (!prop.isLiteral && !boundDirectivePropsIndex.get(prop.name)) {
        boundElementProps.push(this._createElementPropertyAst(
            elementName, prop.name, prop.expression, prop.sourceSpan));
      }
    });
    return boundElementProps;
  }

  private _createElementPropertyAst(
      elementName: string, name: string, ast: AST,
      sourceSpan: ParseSourceSpan): BoundElementPropertyAst {
    let unit: string = null;
    let bindingType: PropertyBindingType;
    let boundPropertyName: string;
    const parts = name.split(PROPERTY_PARTS_SEPARATOR);
    let securityContext: SecurityContext;

    if (parts.length === 1) {
      var partValue = parts[0];
      if (_isAnimationLabel(partValue)) {
        boundPropertyName = partValue.substr(1);
        bindingType = PropertyBindingType.Animation;
        securityContext = SecurityContext.NONE;
      } else {
        boundPropertyName = this._schemaRegistry.getMappedPropName(partValue);
        securityContext = this._schemaRegistry.securityContext(elementName, boundPropertyName);
        bindingType = PropertyBindingType.Property;
        this._validatePropertyOrAttributeName(boundPropertyName, sourceSpan, false);
        if (!this._schemaRegistry.hasProperty(elementName, boundPropertyName, this._schemas)) {
          let errorMsg =
              `Can't bind to '${boundPropertyName}' since it isn't a known property of '${elementName}'.`;
          if (elementName.indexOf('-') > -1) {
            errorMsg +=
                `\n1. If '${elementName}' is an Angular component and it has '${boundPropertyName}' input, then verify that it is part of this module.` +
                `\n2. If '${elementName}' is a Web Component then add "CUSTOM_ELEMENTS_SCHEMA" to the '@NgModule.schemas' of this component to suppress this message.\n`;
          }
          this._reportError(errorMsg, sourceSpan);
        }
      }
    } else {
      if (parts[0] == ATTRIBUTE_PREFIX) {
        boundPropertyName = parts[1];
        this._validatePropertyOrAttributeName(boundPropertyName, sourceSpan, true);
        // NB: For security purposes, use the mapped property name, not the attribute name.
        const mapPropName = this._schemaRegistry.getMappedPropName(boundPropertyName);
        securityContext = this._schemaRegistry.securityContext(elementName, mapPropName);

        const nsSeparatorIdx = boundPropertyName.indexOf(':');
        if (nsSeparatorIdx > -1) {
          const ns = boundPropertyName.substring(0, nsSeparatorIdx);
          const name = boundPropertyName.substring(nsSeparatorIdx + 1);
          boundPropertyName = mergeNsAndName(ns, name);
        }

        bindingType = PropertyBindingType.Attribute;
      } else if (parts[0] == CLASS_PREFIX) {
        boundPropertyName = parts[1];
        bindingType = PropertyBindingType.Class;
        securityContext = SecurityContext.NONE;
      } else if (parts[0] == STYLE_PREFIX) {
        unit = parts.length > 2 ? parts[2] : null;
        boundPropertyName = parts[1];
        bindingType = PropertyBindingType.Style;
        securityContext = SecurityContext.STYLE;
      } else {
        this._reportError(`Invalid property name '${name}'`, sourceSpan);
        bindingType = null;
        securityContext = null;
      }
    }

    return new BoundElementPropertyAst(
        boundPropertyName, bindingType, securityContext, ast, unit, sourceSpan);
  }


  /**
   * @param propName the name of the property / attribute
   * @param sourceSpan
   * @param isAttr true when binding to an attribute
   * @private
   */
  private _validatePropertyOrAttributeName(
      propName: string, sourceSpan: ParseSourceSpan, isAttr: boolean): void {
    const report = isAttr ? this._schemaRegistry.validateAttribute(propName) :
                            this._schemaRegistry.validateProperty(propName);
    if (report.error) {
      this._reportError(report.msg, sourceSpan, ParseErrorLevel.FATAL);
    }
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
      this._reportError(`More than one component: ${componentTypeNames.join(',')}`, sourceSpan);
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
      StringMapWrapper.forEach(directive.directive.outputs, (eventName: string) => {
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
        ngContentIndex, ast.sourceSpan);
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

class BoundElementOrDirectiveProperty {
  constructor(
      public name: string, public expression: AST, public isLiteral: boolean,
      public sourceSpan: ParseSourceSpan) {}
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


export class PipeCollector extends RecursiveAstVisitor {
  pipes: Set<string> = new Set<string>();
  visitPipe(ast: BindingPipe, context: any): any {
    this.pipes.add(ast.name);
    ast.exp.visit(this);
    this.visitAll(ast.args, context);
    return null;
  }
}

function _isAnimationLabel(name: string): boolean {
  return name[0] == '@';
}
