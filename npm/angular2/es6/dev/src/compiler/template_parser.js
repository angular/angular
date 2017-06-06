var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ListWrapper, StringMapWrapper, SetWrapper } from 'angular2/src/facade/collection';
import { RegExpWrapper, isPresent, StringWrapper, isBlank } from 'angular2/src/facade/lang';
import { Injectable, Inject, OpaqueToken, Optional } from 'angular2/core';
import { Console } from 'angular2/src/core/console';
import { BaseException } from 'angular2/src/facade/exceptions';
import { RecursiveAstVisitor } from './expression_parser/ast';
import { Parser } from './expression_parser/parser';
import { HtmlParser } from './html_parser';
import { splitNsName, mergeNsAndName } from './html_tags';
import { ParseError, ParseErrorLevel } from './parse_util';
import { MAX_INTERPOLATION_VALUES } from 'angular2/src/core/linker/view_utils';
import { ElementAst, BoundElementPropertyAst, BoundEventAst, ReferenceAst, templateVisitAll, TextAst, BoundTextAst, EmbeddedTemplateAst, AttrAst, NgContentAst, PropertyBindingType, DirectiveAst, BoundDirectivePropertyAst, VariableAst } from './template_ast';
import { CssSelector, SelectorMatcher } from 'angular2/src/compiler/selector';
import { ElementSchemaRegistry } from 'angular2/src/compiler/schema/element_schema_registry';
import { preparseElement, PreparsedElementType } from './template_preparser';
import { isStyleUrlResolvable } from './style_url_resolver';
import { htmlVisitAll } from './html_ast';
import { splitAtColon } from './util';
import { identifierToken, Identifiers } from './identifiers';
import { ProviderElementContext, ProviderViewContext } from './provider_parser';
// Group 1 = "bind-"
// Group 2 = "var-"
// Group 3 = "let-"
// Group 4 = "ref-/#"
// Group 5 = "on-"
// Group 6 = "bindon-"
// Group 7 = the identifier after "bind-", "var-/#", or "on-"
// Group 8 = identifier inside [()]
// Group 9 = identifier inside []
// Group 10 = identifier inside ()
var BIND_NAME_REGEXP = /^(?:(?:(?:(bind-)|(var-)|(let-)|(ref-|#)|(on-)|(bindon-))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/g;
const TEMPLATE_ELEMENT = 'template';
const TEMPLATE_ATTR = 'template';
const TEMPLATE_ATTR_PREFIX = '*';
const CLASS_ATTR = 'class';
var PROPERTY_PARTS_SEPARATOR = '.';
const ATTRIBUTE_PREFIX = 'attr';
const CLASS_PREFIX = 'class';
const STYLE_PREFIX = 'style';
var TEXT_CSS_SELECTOR = CssSelector.parse('*')[0];
/**
 * Provides an array of {@link TemplateAstVisitor}s which will be used to transform
 * parsed templates before compilation is invoked, allowing custom expression syntax
 * and other advanced transformations.
 *
 * This is currently an internal-only feature and not meant for general use.
 */
export const TEMPLATE_TRANSFORMS = new OpaqueToken('TemplateTransforms');
export class TemplateParseError extends ParseError {
    constructor(message, span, level) {
        super(span, message, level);
    }
}
export class TemplateParseResult {
    constructor(templateAst, errors) {
        this.templateAst = templateAst;
        this.errors = errors;
    }
}
export let TemplateParser = class TemplateParser {
    constructor(_exprParser, _schemaRegistry, _htmlParser, _console, transforms) {
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this._htmlParser = _htmlParser;
        this._console = _console;
        this.transforms = transforms;
    }
    parse(component, template, directives, pipes, templateUrl) {
        var result = this.tryParse(component, template, directives, pipes, templateUrl);
        var warnings = result.errors.filter(error => error.level === ParseErrorLevel.WARNING);
        var errors = result.errors.filter(error => error.level === ParseErrorLevel.FATAL);
        if (warnings.length > 0) {
            this._console.warn(`Template parse warnings:\n${warnings.join('\n')}`);
        }
        if (errors.length > 0) {
            var errorString = errors.join('\n');
            throw new BaseException(`Template parse errors:\n${errorString}`);
        }
        return result.templateAst;
    }
    tryParse(component, template, directives, pipes, templateUrl) {
        var htmlAstWithErrors = this._htmlParser.parse(template, templateUrl);
        var errors = htmlAstWithErrors.errors;
        var result;
        if (htmlAstWithErrors.rootNodes.length > 0) {
            var uniqDirectives = removeDuplicates(directives);
            var uniqPipes = removeDuplicates(pipes);
            var providerViewContext = new ProviderViewContext(component, htmlAstWithErrors.rootNodes[0].sourceSpan);
            var parseVisitor = new TemplateParseVisitor(providerViewContext, uniqDirectives, uniqPipes, this._exprParser, this._schemaRegistry);
            result = htmlVisitAll(parseVisitor, htmlAstWithErrors.rootNodes, EMPTY_ELEMENT_CONTEXT);
            errors = errors.concat(parseVisitor.errors).concat(providerViewContext.errors);
        }
        else {
            result = [];
        }
        if (errors.length > 0) {
            return new TemplateParseResult(result, errors);
        }
        if (isPresent(this.transforms)) {
            this.transforms.forEach((transform) => { result = templateVisitAll(transform, result); });
        }
        return new TemplateParseResult(result, errors);
    }
};
TemplateParser = __decorate([
    Injectable(),
    __param(4, Optional()),
    __param(4, Inject(TEMPLATE_TRANSFORMS)), 
    __metadata('design:paramtypes', [Parser, ElementSchemaRegistry, HtmlParser, Console, Array])
], TemplateParser);
class TemplateParseVisitor {
    constructor(providerViewContext, directives, pipes, _exprParser, _schemaRegistry) {
        this.providerViewContext = providerViewContext;
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this.errors = [];
        this.directivesIndex = new Map();
        this.ngContentCount = 0;
        this.selectorMatcher = new SelectorMatcher();
        ListWrapper.forEachWithIndex(directives, (directive, index) => {
            var selector = CssSelector.parse(directive.selector);
            this.selectorMatcher.addSelectables(selector, directive);
            this.directivesIndex.set(directive, index);
        });
        this.pipesByName = new Map();
        pipes.forEach(pipe => this.pipesByName.set(pipe.name, pipe));
    }
    _reportError(message, sourceSpan, level = ParseErrorLevel.FATAL) {
        this.errors.push(new TemplateParseError(message, sourceSpan, level));
    }
    _parseInterpolation(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseInterpolation(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            if (isPresent(ast) &&
                ast.ast.expressions.length > MAX_INTERPOLATION_VALUES) {
                throw new BaseException(`Only support at most ${MAX_INTERPOLATION_VALUES} interpolation values!`);
            }
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseAction(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseAction(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseBinding(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseBinding(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseTemplateBindings(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var bindingsResult = this._exprParser.parseTemplateBindings(value, sourceInfo);
            bindingsResult.templateBindings.forEach((binding) => {
                if (isPresent(binding.expression)) {
                    this._checkPipes(binding.expression, sourceSpan);
                }
            });
            bindingsResult.warnings.forEach((warning) => { this._reportError(warning, sourceSpan, ParseErrorLevel.WARNING); });
            return bindingsResult.templateBindings;
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return [];
        }
    }
    _checkPipes(ast, sourceSpan) {
        if (isPresent(ast)) {
            var collector = new PipeCollector();
            ast.visit(collector);
            collector.pipes.forEach((pipeName) => {
                if (!this.pipesByName.has(pipeName)) {
                    this._reportError(`The pipe '${pipeName}' could not be found`, sourceSpan);
                }
            });
        }
    }
    visitExpansion(ast, context) { return null; }
    visitExpansionCase(ast, context) { return null; }
    visitText(ast, parent) {
        var ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR);
        var expr = this._parseInterpolation(ast.value, ast.sourceSpan);
        if (isPresent(expr)) {
            return new BoundTextAst(expr, ngContentIndex, ast.sourceSpan);
        }
        else {
            return new TextAst(ast.value, ngContentIndex, ast.sourceSpan);
        }
    }
    visitAttr(ast, contex) {
        return new AttrAst(ast.name, ast.value, ast.sourceSpan);
    }
    visitComment(ast, context) { return null; }
    visitElement(element, parent) {
        var nodeName = element.name;
        var preparsedElement = preparseElement(element);
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
        var matchableAttrs = [];
        var elementOrDirectiveProps = [];
        var elementOrDirectiveRefs = [];
        var elementVars = [];
        var events = [];
        var templateElementOrDirectiveProps = [];
        var templateMatchableAttrs = [];
        var templateElementVars = [];
        var hasInlineTemplates = false;
        var attrs = [];
        var lcElName = splitNsName(nodeName.toLowerCase())[1];
        var isTemplateElement = lcElName == TEMPLATE_ELEMENT;
        element.attrs.forEach(attr => {
            var hasBinding = this._parseAttr(isTemplateElement, attr, matchableAttrs, elementOrDirectiveProps, events, elementOrDirectiveRefs, elementVars);
            var hasTemplateBinding = this._parseInlineTemplateBinding(attr, templateMatchableAttrs, templateElementOrDirectiveProps, templateElementVars);
            if (!hasBinding && !hasTemplateBinding) {
                // don't include the bindings as attributes as well in the AST
                attrs.push(this.visitAttr(attr, null));
                matchableAttrs.push([attr.name, attr.value]);
            }
            if (hasTemplateBinding) {
                hasInlineTemplates = true;
            }
        });
        var elementCssSelector = createElementCssSelector(nodeName, matchableAttrs);
        var directiveMetas = this._parseDirectives(this.selectorMatcher, elementCssSelector);
        var references = [];
        var directiveAsts = this._createDirectiveAsts(isTemplateElement, element.name, directiveMetas, elementOrDirectiveProps, elementOrDirectiveRefs, element.sourceSpan, references);
        var elementProps = this._createElementPropertyAsts(element.name, elementOrDirectiveProps, directiveAsts);
        var isViewRoot = parent.isTemplateElement || hasInlineTemplates;
        var providerContext = new ProviderElementContext(this.providerViewContext, parent.providerContext, isViewRoot, directiveAsts, attrs, references, element.sourceSpan);
        var children = htmlVisitAll(preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children, ElementContext.create(isTemplateElement, directiveAsts, isTemplateElement ? parent.providerContext : providerContext));
        providerContext.afterElement();
        // Override the actual selector when the `ngProjectAs` attribute is provided
        var projectionSelector = isPresent(preparsedElement.projectAs) ?
            CssSelector.parse(preparsedElement.projectAs)[0] :
            elementCssSelector;
        var ngContentIndex = parent.findNgContentIndex(projectionSelector);
        var parsedElement;
        if (preparsedElement.type === PreparsedElementType.NG_CONTENT) {
            if (isPresent(element.children) && element.children.length > 0) {
                this._reportError(`<ng-content> element cannot have content. <ng-content> must be immediately followed by </ng-content>`, element.sourceSpan);
            }
            parsedElement = new NgContentAst(this.ngContentCount++, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
        }
        else if (isTemplateElement) {
            this._assertAllEventsPublishedByDirectives(directiveAsts, events);
            this._assertNoComponentsNorElementBindingsOnTemplate(directiveAsts, elementProps, element.sourceSpan);
            parsedElement = new EmbeddedTemplateAst(attrs, events, references, elementVars, providerContext.transformedDirectiveAsts, providerContext.transformProviders, providerContext.transformedHasViewContainer, children, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
        }
        else {
            this._assertOnlyOneComponent(directiveAsts, element.sourceSpan);
            let ngContentIndex = hasInlineTemplates ? null : parent.findNgContentIndex(projectionSelector);
            parsedElement = new ElementAst(nodeName, attrs, elementProps, events, references, providerContext.transformedDirectiveAsts, providerContext.transformProviders, providerContext.transformedHasViewContainer, children, hasInlineTemplates ? null : ngContentIndex, element.sourceSpan);
        }
        if (hasInlineTemplates) {
            var templateCssSelector = createElementCssSelector(TEMPLATE_ELEMENT, templateMatchableAttrs);
            var templateDirectiveMetas = this._parseDirectives(this.selectorMatcher, templateCssSelector);
            var templateDirectiveAsts = this._createDirectiveAsts(true, element.name, templateDirectiveMetas, templateElementOrDirectiveProps, [], element.sourceSpan, []);
            var templateElementProps = this._createElementPropertyAsts(element.name, templateElementOrDirectiveProps, templateDirectiveAsts);
            this._assertNoComponentsNorElementBindingsOnTemplate(templateDirectiveAsts, templateElementProps, element.sourceSpan);
            var templateProviderContext = new ProviderElementContext(this.providerViewContext, parent.providerContext, parent.isTemplateElement, templateDirectiveAsts, [], [], element.sourceSpan);
            templateProviderContext.afterElement();
            parsedElement = new EmbeddedTemplateAst([], [], [], templateElementVars, templateProviderContext.transformedDirectiveAsts, templateProviderContext.transformProviders, templateProviderContext.transformedHasViewContainer, [parsedElement], ngContentIndex, element.sourceSpan);
        }
        return parsedElement;
    }
    _parseInlineTemplateBinding(attr, targetMatchableAttrs, targetProps, targetVars) {
        var templateBindingsSource = null;
        if (attr.name == TEMPLATE_ATTR) {
            templateBindingsSource = attr.value;
        }
        else if (attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
            var key = attr.name.substring(TEMPLATE_ATTR_PREFIX.length); // remove the star
            templateBindingsSource = (attr.value.length == 0) ? key : key + ' ' + attr.value;
        }
        if (isPresent(templateBindingsSource)) {
            var bindings = this._parseTemplateBindings(templateBindingsSource, attr.sourceSpan);
            for (var i = 0; i < bindings.length; i++) {
                var binding = bindings[i];
                if (binding.keyIsVar) {
                    targetVars.push(new VariableAst(binding.key, binding.name, attr.sourceSpan));
                }
                else if (isPresent(binding.expression)) {
                    this._parsePropertyAst(binding.key, binding.expression, attr.sourceSpan, targetMatchableAttrs, targetProps);
                }
                else {
                    targetMatchableAttrs.push([binding.key, '']);
                    this._parseLiteralAttr(binding.key, null, attr.sourceSpan, targetProps);
                }
            }
            return true;
        }
        return false;
    }
    _parseAttr(isTemplateElement, attr, targetMatchableAttrs, targetProps, targetEvents, targetRefs, targetVars) {
        var attrName = this._normalizeAttributeName(attr.name);
        var attrValue = attr.value;
        var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
        var hasBinding = false;
        if (isPresent(bindParts)) {
            hasBinding = true;
            if (isPresent(bindParts[1])) {
                this._parseProperty(bindParts[7], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
            }
            else if (isPresent(bindParts[2])) {
                var identifier = bindParts[7];
                if (isTemplateElement) {
                    this._reportError(`"var-" on <template> elements is deprecated. Use "let-" instead!`, attr.sourceSpan, ParseErrorLevel.WARNING);
                    this._parseVariable(identifier, attrValue, attr.sourceSpan, targetVars);
                }
                else {
                    this._reportError(`"var-" on non <template> elements is deprecated. Use "ref-" instead!`, attr.sourceSpan, ParseErrorLevel.WARNING);
                    this._parseReference(identifier, attrValue, attr.sourceSpan, targetRefs);
                }
            }
            else if (isPresent(bindParts[3])) {
                if (isTemplateElement) {
                    var identifier = bindParts[7];
                    this._parseVariable(identifier, attrValue, attr.sourceSpan, targetVars);
                }
                else {
                    this._reportError(`"let-" is only supported on template elements.`, attr.sourceSpan);
                }
            }
            else if (isPresent(bindParts[4])) {
                var identifier = bindParts[7];
                this._parseReference(identifier, attrValue, attr.sourceSpan, targetRefs);
            }
            else if (isPresent(bindParts[5])) {
                this._parseEvent(bindParts[7], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[6])) {
                this._parseProperty(bindParts[7], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[7], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[8])) {
                this._parseProperty(bindParts[8], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[8], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[9])) {
                this._parseProperty(bindParts[9], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
            }
            else if (isPresent(bindParts[10])) {
                this._parseEvent(bindParts[10], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
        }
        else {
            hasBinding = this._parsePropertyInterpolation(attrName, attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
        }
        if (!hasBinding) {
            this._parseLiteralAttr(attrName, attrValue, attr.sourceSpan, targetProps);
        }
        return hasBinding;
    }
    _normalizeAttributeName(attrName) {
        return attrName.toLowerCase().startsWith('data-') ? attrName.substring(5) : attrName;
    }
    _parseVariable(identifier, value, sourceSpan, targetVars) {
        if (identifier.indexOf('-') > -1) {
            this._reportError(`"-" is not allowed in variable names`, sourceSpan);
        }
        targetVars.push(new VariableAst(identifier, value, sourceSpan));
    }
    _parseReference(identifier, value, sourceSpan, targetRefs) {
        if (identifier.indexOf('-') > -1) {
            this._reportError(`"-" is not allowed in reference names`, sourceSpan);
        }
        targetRefs.push(new ElementOrDirectiveRef(identifier, value, sourceSpan));
    }
    _parseProperty(name, expression, sourceSpan, targetMatchableAttrs, targetProps) {
        this._parsePropertyAst(name, this._parseBinding(expression, sourceSpan), sourceSpan, targetMatchableAttrs, targetProps);
    }
    _parsePropertyInterpolation(name, value, sourceSpan, targetMatchableAttrs, targetProps) {
        var expr = this._parseInterpolation(value, sourceSpan);
        if (isPresent(expr)) {
            this._parsePropertyAst(name, expr, sourceSpan, targetMatchableAttrs, targetProps);
            return true;
        }
        return false;
    }
    _parsePropertyAst(name, ast, sourceSpan, targetMatchableAttrs, targetProps) {
        targetMatchableAttrs.push([name, ast.source]);
        targetProps.push(new BoundElementOrDirectiveProperty(name, ast, false, sourceSpan));
    }
    _parseAssignmentEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents) {
        this._parseEvent(`${name}Change`, `${expression}=$event`, sourceSpan, targetMatchableAttrs, targetEvents);
    }
    _parseEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents) {
        // long format: 'target: eventName'
        var parts = splitAtColon(name, [null, name]);
        var target = parts[0];
        var eventName = parts[1];
        var ast = this._parseAction(expression, sourceSpan);
        targetMatchableAttrs.push([name, ast.source]);
        targetEvents.push(new BoundEventAst(eventName, target, ast, sourceSpan));
        // Don't detect directives for event names for now,
        // so don't add the event name to the matchableAttrs
    }
    _parseLiteralAttr(name, value, sourceSpan, targetProps) {
        targetProps.push(new BoundElementOrDirectiveProperty(name, this._exprParser.wrapLiteralPrimitive(value, ''), true, sourceSpan));
    }
    _parseDirectives(selectorMatcher, elementCssSelector) {
        // Need to sort the directives so that we get consistent results throughout,
        // as selectorMatcher uses Maps inside.
        // Also dedupe directives as they might match more than one time!
        var directives = ListWrapper.createFixedSize(this.directivesIndex.size);
        selectorMatcher.match(elementCssSelector, (selector, directive) => {
            directives[this.directivesIndex.get(directive)] = directive;
        });
        return directives.filter(dir => isPresent(dir));
    }
    _createDirectiveAsts(isTemplateElement, elementName, directives, props, elementOrDirectiveRefs, sourceSpan, targetReferences) {
        var matchedReferences = new Set();
        var component = null;
        var directiveAsts = directives.map((directive) => {
            if (directive.isComponent) {
                component = directive;
            }
            var hostProperties = [];
            var hostEvents = [];
            var directiveProperties = [];
            this._createDirectiveHostPropertyAsts(elementName, directive.hostProperties, sourceSpan, hostProperties);
            this._createDirectiveHostEventAsts(directive.hostListeners, sourceSpan, hostEvents);
            this._createDirectivePropertyAsts(directive.inputs, props, directiveProperties);
            elementOrDirectiveRefs.forEach((elOrDirRef) => {
                if ((elOrDirRef.value.length === 0 && directive.isComponent) ||
                    (directive.exportAs == elOrDirRef.value)) {
                    targetReferences.push(new ReferenceAst(elOrDirRef.name, identifierToken(directive.type), elOrDirRef.sourceSpan));
                    matchedReferences.add(elOrDirRef.name);
                }
            });
            return new DirectiveAst(directive, directiveProperties, hostProperties, hostEvents, sourceSpan);
        });
        elementOrDirectiveRefs.forEach((elOrDirRef) => {
            if (elOrDirRef.value.length > 0) {
                if (!SetWrapper.has(matchedReferences, elOrDirRef.name)) {
                    this._reportError(`There is no directive with "exportAs" set to "${elOrDirRef.value}"`, elOrDirRef.sourceSpan);
                }
                ;
            }
            else if (isBlank(component)) {
                var refToken = null;
                if (isTemplateElement) {
                    refToken = identifierToken(Identifiers.TemplateRef);
                }
                targetReferences.push(new ReferenceAst(elOrDirRef.name, refToken, elOrDirRef.sourceSpan));
            }
        });
        return directiveAsts;
    }
    _createDirectiveHostPropertyAsts(elementName, hostProps, sourceSpan, targetPropertyAsts) {
        if (isPresent(hostProps)) {
            StringMapWrapper.forEach(hostProps, (expression, propName) => {
                var exprAst = this._parseBinding(expression, sourceSpan);
                targetPropertyAsts.push(this._createElementPropertyAst(elementName, propName, exprAst, sourceSpan));
            });
        }
    }
    _createDirectiveHostEventAsts(hostListeners, sourceSpan, targetEventAsts) {
        if (isPresent(hostListeners)) {
            StringMapWrapper.forEach(hostListeners, (expression, propName) => {
                this._parseEvent(propName, expression, sourceSpan, [], targetEventAsts);
            });
        }
    }
    _createDirectivePropertyAsts(directiveProperties, boundProps, targetBoundDirectiveProps) {
        if (isPresent(directiveProperties)) {
            var boundPropsByName = new Map();
            boundProps.forEach(boundProp => {
                var prevValue = boundPropsByName.get(boundProp.name);
                if (isBlank(prevValue) || prevValue.isLiteral) {
                    // give [a]="b" a higher precedence than a="b" on the same element
                    boundPropsByName.set(boundProp.name, boundProp);
                }
            });
            StringMapWrapper.forEach(directiveProperties, (elProp, dirProp) => {
                var boundProp = boundPropsByName.get(elProp);
                // Bindings are optional, so this binding only needs to be set up if an expression is given.
                if (isPresent(boundProp)) {
                    targetBoundDirectiveProps.push(new BoundDirectivePropertyAst(dirProp, boundProp.name, boundProp.expression, boundProp.sourceSpan));
                }
            });
        }
    }
    _createElementPropertyAsts(elementName, props, directives) {
        var boundElementProps = [];
        var boundDirectivePropsIndex = new Map();
        directives.forEach((directive) => {
            directive.inputs.forEach((prop) => {
                boundDirectivePropsIndex.set(prop.templateName, prop);
            });
        });
        props.forEach((prop) => {
            if (!prop.isLiteral && isBlank(boundDirectivePropsIndex.get(prop.name))) {
                boundElementProps.push(this._createElementPropertyAst(elementName, prop.name, prop.expression, prop.sourceSpan));
            }
        });
        return boundElementProps;
    }
    _createElementPropertyAst(elementName, name, ast, sourceSpan) {
        var unit = null;
        var bindingType;
        var boundPropertyName;
        var parts = name.split(PROPERTY_PARTS_SEPARATOR);
        if (parts.length === 1) {
            boundPropertyName = this._schemaRegistry.getMappedPropName(parts[0]);
            bindingType = PropertyBindingType.Property;
            if (!this._schemaRegistry.hasProperty(elementName, boundPropertyName)) {
                this._reportError(`Can't bind to '${boundPropertyName}' since it isn't a known native property`, sourceSpan);
            }
        }
        else {
            if (parts[0] == ATTRIBUTE_PREFIX) {
                boundPropertyName = parts[1];
                let nsSeparatorIdx = boundPropertyName.indexOf(':');
                if (nsSeparatorIdx > -1) {
                    let ns = boundPropertyName.substring(0, nsSeparatorIdx);
                    let name = boundPropertyName.substring(nsSeparatorIdx + 1);
                    boundPropertyName = mergeNsAndName(ns, name);
                }
                bindingType = PropertyBindingType.Attribute;
            }
            else if (parts[0] == CLASS_PREFIX) {
                boundPropertyName = parts[1];
                bindingType = PropertyBindingType.Class;
            }
            else if (parts[0] == STYLE_PREFIX) {
                unit = parts.length > 2 ? parts[2] : null;
                boundPropertyName = parts[1];
                bindingType = PropertyBindingType.Style;
            }
            else {
                this._reportError(`Invalid property name '${name}'`, sourceSpan);
                bindingType = null;
            }
        }
        return new BoundElementPropertyAst(boundPropertyName, bindingType, ast, unit, sourceSpan);
    }
    _findComponentDirectiveNames(directives) {
        var componentTypeNames = [];
        directives.forEach(directive => {
            var typeName = directive.directive.type.name;
            if (directive.directive.isComponent) {
                componentTypeNames.push(typeName);
            }
        });
        return componentTypeNames;
    }
    _assertOnlyOneComponent(directives, sourceSpan) {
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 1) {
            this._reportError(`More than one component: ${componentTypeNames.join(',')}`, sourceSpan);
        }
    }
    _assertNoComponentsNorElementBindingsOnTemplate(directives, elementProps, sourceSpan) {
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 0) {
            this._reportError(`Components on an embedded template: ${componentTypeNames.join(',')}`, sourceSpan);
        }
        elementProps.forEach(prop => {
            this._reportError(`Property binding ${prop.name} not used by any directive on an embedded template`, sourceSpan);
        });
    }
    _assertAllEventsPublishedByDirectives(directives, events) {
        var allDirectiveEvents = new Set();
        directives.forEach(directive => {
            StringMapWrapper.forEach(directive.directive.outputs, (eventName, _) => { allDirectiveEvents.add(eventName); });
        });
        events.forEach(event => {
            if (isPresent(event.target) || !SetWrapper.has(allDirectiveEvents, event.name)) {
                this._reportError(`Event binding ${event.fullName} not emitted by any directive on an embedded template`, event.sourceSpan);
            }
        });
    }
}
class NonBindableVisitor {
    visitElement(ast, parent) {
        var preparsedElement = preparseElement(ast);
        if (preparsedElement.type === PreparsedElementType.SCRIPT ||
            preparsedElement.type === PreparsedElementType.STYLE ||
            preparsedElement.type === PreparsedElementType.STYLESHEET) {
            // Skipping <script> for security reasons
            // Skipping <style> and stylesheets as we already processed them
            // in the StyleCompiler
            return null;
        }
        var attrNameAndValues = ast.attrs.map(attrAst => [attrAst.name, attrAst.value]);
        var selector = createElementCssSelector(ast.name, attrNameAndValues);
        var ngContentIndex = parent.findNgContentIndex(selector);
        var children = htmlVisitAll(this, ast.children, EMPTY_ELEMENT_CONTEXT);
        return new ElementAst(ast.name, htmlVisitAll(this, ast.attrs), [], [], [], [], [], false, children, ngContentIndex, ast.sourceSpan);
    }
    visitComment(ast, context) { return null; }
    visitAttr(ast, context) {
        return new AttrAst(ast.name, ast.value, ast.sourceSpan);
    }
    visitText(ast, parent) {
        var ngContentIndex = parent.findNgContentIndex(TEXT_CSS_SELECTOR);
        return new TextAst(ast.value, ngContentIndex, ast.sourceSpan);
    }
    visitExpansion(ast, context) { return ast; }
    visitExpansionCase(ast, context) { return ast; }
}
class BoundElementOrDirectiveProperty {
    constructor(name, expression, isLiteral, sourceSpan) {
        this.name = name;
        this.expression = expression;
        this.isLiteral = isLiteral;
        this.sourceSpan = sourceSpan;
    }
}
class ElementOrDirectiveRef {
    constructor(name, value, sourceSpan) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
}
export function splitClasses(classAttrValue) {
    return StringWrapper.split(classAttrValue.trim(), /\s+/g);
}
class ElementContext {
    constructor(isTemplateElement, _ngContentIndexMatcher, _wildcardNgContentIndex, providerContext) {
        this.isTemplateElement = isTemplateElement;
        this._ngContentIndexMatcher = _ngContentIndexMatcher;
        this._wildcardNgContentIndex = _wildcardNgContentIndex;
        this.providerContext = providerContext;
    }
    static create(isTemplateElement, directives, providerContext) {
        var matcher = new SelectorMatcher();
        var wildcardNgContentIndex = null;
        var component = directives.find(directive => directive.directive.isComponent);
        if (isPresent(component)) {
            var ngContentSelectors = component.directive.template.ngContentSelectors;
            for (var i = 0; i < ngContentSelectors.length; i++) {
                var selector = ngContentSelectors[i];
                if (StringWrapper.equals(selector, '*')) {
                    wildcardNgContentIndex = i;
                }
                else {
                    matcher.addSelectables(CssSelector.parse(ngContentSelectors[i]), i);
                }
            }
        }
        return new ElementContext(isTemplateElement, matcher, wildcardNgContentIndex, providerContext);
    }
    findNgContentIndex(selector) {
        var ngContentIndices = [];
        this._ngContentIndexMatcher.match(selector, (selector, ngContentIndex) => { ngContentIndices.push(ngContentIndex); });
        ListWrapper.sort(ngContentIndices);
        if (isPresent(this._wildcardNgContentIndex)) {
            ngContentIndices.push(this._wildcardNgContentIndex);
        }
        return ngContentIndices.length > 0 ? ngContentIndices[0] : null;
    }
}
function createElementCssSelector(elementName, matchableAttrs) {
    var cssSelector = new CssSelector();
    let elNameNoNs = splitNsName(elementName)[1];
    cssSelector.setElement(elNameNoNs);
    for (var i = 0; i < matchableAttrs.length; i++) {
        let attrName = matchableAttrs[i][0];
        let attrNameNoNs = splitNsName(attrName)[1];
        let attrValue = matchableAttrs[i][1];
        cssSelector.addAttribute(attrNameNoNs, attrValue);
        if (attrName.toLowerCase() == CLASS_ATTR) {
            var classes = splitClasses(attrValue);
            classes.forEach(className => cssSelector.addClassName(className));
        }
    }
    return cssSelector;
}
var EMPTY_ELEMENT_CONTEXT = new ElementContext(true, new SelectorMatcher(), null, null);
var NON_BINDABLE_VISITOR = new NonBindableVisitor();
export class PipeCollector extends RecursiveAstVisitor {
    constructor(...args) {
        super(...args);
        this.pipes = new Set();
    }
    visitPipe(ast, context) {
        this.pipes.add(ast.name);
        ast.exp.visit(this);
        this.visitAll(ast.args, context);
        return null;
    }
}
function removeDuplicates(items) {
    let res = [];
    items.forEach(item => {
        let hasMatch = res.filter(r => r.type.name == item.type.name && r.type.moduleUrl == item.type.moduleUrl &&
            r.type.runtime == item.type.runtime)
            .length > 0;
        if (!hasMatch) {
            res.push(item);
        }
    });
    return res;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3RlbXBsYXRlX3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUNMLFdBQVcsRUFDWCxnQkFBZ0IsRUFDaEIsVUFBVSxFQUVYLE1BQU0sZ0NBQWdDO09BQ2hDLEVBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFVLE1BQU0sMEJBQTBCO09BQzNGLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZTtPQUNoRSxFQUFDLE9BQU8sRUFBQyxNQUFNLDJCQUEyQjtPQUMxQyxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUtMLG1CQUFtQixFQUVwQixNQUFNLHlCQUF5QjtPQUN6QixFQUFDLE1BQU0sRUFBQyxNQUFNLDRCQUE0QjtPQVUxQyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWU7T0FDakMsRUFBQyxXQUFXLEVBQUUsY0FBYyxFQUFDLE1BQU0sYUFBYTtPQUNoRCxFQUFrQixVQUFVLEVBQWlCLGVBQWUsRUFBQyxNQUFNLGNBQWM7T0FDakYsRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHFDQUFxQztPQUVyRSxFQUNMLFVBQVUsRUFDVix1QkFBdUIsRUFDdkIsYUFBYSxFQUNiLFlBQVksRUFHWixnQkFBZ0IsRUFDaEIsT0FBTyxFQUNQLFlBQVksRUFDWixtQkFBbUIsRUFDbkIsT0FBTyxFQUNQLFlBQVksRUFDWixtQkFBbUIsRUFDbkIsWUFBWSxFQUNaLHlCQUF5QixFQUd6QixXQUFXLEVBQ1osTUFBTSxnQkFBZ0I7T0FDaEIsRUFBQyxXQUFXLEVBQUUsZUFBZSxFQUFDLE1BQU0sZ0NBQWdDO09BRXBFLEVBQUMscUJBQXFCLEVB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VUFBSyxHQUFnQixJQUFJLEdBQUcsRUFBVSxDQUFDO0lBT3pDLENBQUM7SUFOQyxTQUFTLENBQUMsR0FBZ0IsRUFBRSxPQUFZO1FBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QixHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7QUFDSCxDQUFDO0FBRUQsMEJBQTBCLEtBQWdDO0lBQ3hELElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNiLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSTtRQUNoQixJQUFJLFFBQVEsR0FDUixHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVM7WUFDeEUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDL0MsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNwQixFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDZCxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pCLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFDYixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgTGlzdFdyYXBwZXIsXG4gIFN0cmluZ01hcFdyYXBwZXIsXG4gIFNldFdyYXBwZXIsXG4gIE1hcFdyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7UmVnRXhwV3JhcHBlciwgaXNQcmVzZW50LCBTdHJpbmdXcmFwcGVyLCBpc0JsYW5rLCBpc0FycmF5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE9wYXF1ZVRva2VuLCBPcHRpb25hbH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0NvbnNvbGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NvbnNvbGUnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtcbiAgQVNULFxuICBJbnRlcnBvbGF0aW9uLFxuICBBU1RXaXRoU291cmNlLFxuICBUZW1wbGF0ZUJpbmRpbmcsXG4gIFJlY3Vyc2l2ZUFzdFZpc2l0b3IsXG4gIEJpbmRpbmdQaXBlXG59IGZyb20gJy4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCB7UGFyc2VyfSBmcm9tICcuL2V4cHJlc3Npb25fcGFyc2VyL3BhcnNlcic7XG5pbXBvcnQge1xuICBDb21waWxlVG9rZW5NYXAsXG4gIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgQ29tcGlsZVBpcGVNZXRhZGF0YSxcbiAgQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGUsXG4gIENvbXBpbGVQcm92aWRlck1ldGFkYXRhLFxuICBDb21waWxlVG9rZW5NZXRhZGF0YSxcbiAgQ29tcGlsZVR5cGVNZXRhZGF0YVxufSBmcm9tICcuL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtIdG1sUGFyc2VyfSBmcm9tICcuL2h0bWxfcGFyc2VyJztcbmltcG9ydCB7c3BsaXROc05hbWUsIG1lcmdlTnNBbmROYW1lfSBmcm9tICcuL2h0bWxfdGFncyc7XG5pbXBvcnQge1BhcnNlU291cmNlU3BhbiwgUGFyc2VFcnJvciwgUGFyc2VMb2NhdGlvbiwgUGFyc2VFcnJvckxldmVsfSBmcm9tICcuL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtNQVhfSU5URVJQT0xBVElPTl9WQUxVRVN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3V0aWxzJztcblxuaW1wb3J0IHtcbiAgRWxlbWVudEFzdCxcbiAgQm91bmRFbGVtZW50UHJvcGVydHlBc3QsXG4gIEJvdW5kRXZlbnRBc3QsXG4gIFJlZmVyZW5jZUFzdCxcbiAgVGVtcGxhdGVBc3QsXG4gIFRlbXBsYXRlQXN0VmlzaXRvcixcbiAgdGVtcGxhdGVWaXNpdEFsbCxcbiAgVGV4dEFzdCxcbiAgQm91bmRUZXh0QXN0LFxuICBFbWJlZGRlZFRlbXBsYXRlQXN0LFxuICBBdHRyQXN0LFxuICBOZ0NvbnRlbnRBc3QsXG4gIFByb3BlcnR5QmluZGluZ1R5cGUsXG4gIERpcmVjdGl2ZUFzdCxcbiAgQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCxcbiAgUHJvdmlkZXJBc3QsXG4gIFByb3ZpZGVyQXN0VHlwZSxcbiAgVmFyaWFibGVBc3Rcbn0gZnJvbSAnLi90ZW1wbGF0ZV9hc3QnO1xuaW1wb3J0IHtDc3NTZWxlY3RvciwgU2VsZWN0b3JNYXRjaGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvc2VsZWN0b3InO1xuXG5pbXBvcnQge0VsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NjaGVtYS9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5pbXBvcnQge3ByZXBhcnNlRWxlbWVudCwgUHJlcGFyc2VkRWxlbWVudCwgUHJlcGFyc2VkRWxlbWVudFR5cGV9IGZyb20gJy4vdGVtcGxhdGVfcHJlcGFyc2VyJztcblxuaW1wb3J0IHtpc1N0eWxlVXJsUmVzb2x2YWJsZX0gZnJvbSAnLi9zdHlsZV91cmxfcmVzb2x2ZXInO1xuXG5pbXBvcnQge1xuICBIdG1sQXN0VmlzaXRvcixcbiAgSHRtbEFzdCxcbiAgSHRtbEVsZW1lbnRBc3QsXG4gIEh0bWxBdHRyQXN0LFxuICBIdG1sVGV4dEFzdCxcbiAgSHRtbENvbW1lbnRBc3QsXG4gIEh0bWxFeHBhbnNpb25Bc3QsXG4gIEh0bWxFeHBhbnNpb25DYXNlQXN0LFxuICBodG1sVmlzaXRBbGxcbn0gZnJvbSAnLi9odG1sX2FzdCc7XG5cbmltcG9ydCB7c3BsaXRBdENvbG9ufSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtpZGVudGlmaWVyVG9rZW4sIElkZW50aWZpZXJzfSBmcm9tICcuL2lkZW50aWZpZXJzJztcblxuaW1wb3J0IHtQcm92aWRlckVsZW1lbnRDb250ZXh0LCBQcm92aWRlclZpZXdDb250ZXh0fSBmcm9tICcuL3Byb3ZpZGVyX3BhcnNlcic7XG5cbi8vIEdyb3VwIDEgPSBcImJpbmQtXCJcbi8vIEdyb3VwIDIgPSBcInZhci1cIlxuLy8gR3JvdXAgMyA9IFwibGV0LVwiXG4vLyBHcm91cCA0ID0gXCJyZWYtLyNcIlxuLy8gR3JvdXAgNSA9IFwib24tXCJcbi8vIEdyb3VwIDYgPSBcImJpbmRvbi1cIlxuLy8gR3JvdXAgNyA9IHRoZSBpZGVudGlmaWVyIGFmdGVyIFwiYmluZC1cIiwgXCJ2YXItLyNcIiwgb3IgXCJvbi1cIlxuLy8gR3JvdXAgOCA9IGlkZW50aWZpZXIgaW5zaWRlIFsoKV1cbi8vIEdyb3VwIDkgPSBpZGVudGlmaWVyIGluc2lkZSBbXVxuLy8gR3JvdXAgMTAgPSBpZGVudGlmaWVyIGluc2lkZSAoKVxudmFyIEJJTkRfTkFNRV9SRUdFWFAgPVxuICAgIC9eKD86KD86KD86KGJpbmQtKXwodmFyLSl8KGxldC0pfChyZWYtfCMpfChvbi0pfChiaW5kb24tKSkoLispKXxcXFtcXCgoW15cXCldKylcXClcXF18XFxbKFteXFxdXSspXFxdfFxcKChbXlxcKV0rKVxcKSkkL2c7XG5cbmNvbnN0IFRFTVBMQVRFX0VMRU1FTlQgPSAndGVtcGxhdGUnO1xuY29uc3QgVEVNUExBVEVfQVRUUiA9ICd0ZW1wbGF0ZSc7XG5jb25zdCBURU1QTEFURV9BVFRSX1BSRUZJWCA9ICcqJztcbmNvbnN0IENMQVNTX0FUVFIgPSAnY2xhc3MnO1xuXG52YXIgUFJPUEVSVFlfUEFSVFNfU0VQQVJBVE9SID0gJy4nO1xuY29uc3QgQVRUUklCVVRFX1BSRUZJWCA9ICdhdHRyJztcbmNvbnN0IENMQVNTX1BSRUZJWCA9ICdjbGFzcyc7XG5jb25zdCBTVFlMRV9QUkVGSVggPSAnc3R5bGUnO1xuXG52YXIgVEVYVF9DU1NfU0VMRUNUT1IgPSBDc3NTZWxlY3Rvci5wYXJzZSgnKicpWzBdO1xuXG4vKipcbiAqIFByb3ZpZGVzIGFuIGFycmF5IG9mIHtAbGluayBUZW1wbGF0ZUFzdFZpc2l0b3J9cyB3aGljaCB3aWxsIGJlIHVzZWQgdG8gdHJhbnNmb3JtXG4gKiBwYXJzZWQgdGVtcGxhdGVzIGJlZm9yZSBjb21waWxhdGlvbiBpcyBpbnZva2VkLCBhbGxvd2luZyBjdXN0b20gZXhwcmVzc2lvbiBzeW50YXhcbiAqIGFuZCBvdGhlciBhZHZhbmNlZCB0cmFuc2Zvcm1hdGlvbnMuXG4gKlxuICogVGhpcyBpcyBjdXJyZW50bHkgYW4gaW50ZXJuYWwtb25seSBmZWF0dXJlIGFuZCBub3QgbWVhbnQgZm9yIGdlbmVyYWwgdXNlLlxuICovXG5leHBvcnQgY29uc3QgVEVNUExBVEVfVFJBTlNGT1JNUzogYW55ID0gLypAdHMyZGFydF9jb25zdCovIG5ldyBPcGFxdWVUb2tlbignVGVtcGxhdGVUcmFuc2Zvcm1zJyk7XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVBhcnNlRXJyb3IgZXh0ZW5kcyBQYXJzZUVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBzcGFuOiBQYXJzZVNvdXJjZVNwYW4sIGxldmVsOiBQYXJzZUVycm9yTGV2ZWwpIHtcbiAgICBzdXBlcihzcGFuLCBtZXNzYWdlLCBsZXZlbCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUGFyc2VSZXN1bHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdGVtcGxhdGVBc3Q/OiBUZW1wbGF0ZUFzdFtdLCBwdWJsaWMgZXJyb3JzPzogUGFyc2VFcnJvcltdKSB7fVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVQYXJzZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9leHByUGFyc2VyOiBQYXJzZXIsIHByaXZhdGUgX3NjaGVtYVJlZ2lzdHJ5OiBFbGVtZW50U2NoZW1hUmVnaXN0cnksXG4gICAgICAgICAgICAgIHByaXZhdGUgX2h0bWxQYXJzZXI6IEh0bWxQYXJzZXIsIHByaXZhdGUgX2NvbnNvbGU6IENvbnNvbGUsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVEVNUExBVEVfVFJBTlNGT1JNUykgcHVibGljIHRyYW5zZm9ybXM6IFRlbXBsYXRlQXN0VmlzaXRvcltdKSB7fVxuXG4gIHBhcnNlKGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCB0ZW1wbGF0ZTogc3RyaW5nLFxuICAgICAgICBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSwgcGlwZXM6IENvbXBpbGVQaXBlTWV0YWRhdGFbXSxcbiAgICAgICAgdGVtcGxhdGVVcmw6IHN0cmluZyk6IFRlbXBsYXRlQXN0W10ge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLnRyeVBhcnNlKGNvbXBvbmVudCwgdGVtcGxhdGUsIGRpcmVjdGl2ZXMsIHBpcGVzLCB0ZW1wbGF0ZVVybCk7XG4gICAgdmFyIHdhcm5pbmdzID0gcmVzdWx0LmVycm9ycy5maWx0ZXIoZXJyb3IgPT4gZXJyb3IubGV2ZWwgPT09IFBhcnNlRXJyb3JMZXZlbC5XQVJOSU5HKTtcbiAgICB2YXIgZXJyb3JzID0gcmVzdWx0LmVycm9ycy5maWx0ZXIoZXJyb3IgPT4gZXJyb3IubGV2ZWwgPT09IFBhcnNlRXJyb3JMZXZlbC5GQVRBTCk7XG4gICAgaWYgKHdhcm5pbmdzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX2NvbnNvbGUud2FybihgVGVtcGxhdGUgcGFyc2Ugd2FybmluZ3M6XFxuJHt3YXJuaW5ncy5qb2luKCdcXG4nKX1gKTtcbiAgICB9XG4gICAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgZXJyb3JTdHJpbmcgPSBlcnJvcnMuam9pbignXFxuJyk7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVGVtcGxhdGUgcGFyc2UgZXJyb3JzOlxcbiR7ZXJyb3JTdHJpbmd9YCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQudGVtcGxhdGVBc3Q7XG4gIH1cblxuICB0cnlQYXJzZShjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgdGVtcGxhdGU6IHN0cmluZyxcbiAgICAgICAgICAgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sIHBpcGVzOiBDb21waWxlUGlwZU1ldGFkYXRhW10sXG4gICAgICAgICAgIHRlbXBsYXRlVXJsOiBzdHJpbmcpOiBUZW1wbGF0ZVBhcnNlUmVzdWx0IHtcbiAgICB2YXIgaHRtbEFzdFdpdGhFcnJvcnMgPSB0aGlzLl9odG1sUGFyc2VyLnBhcnNlKHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCk7XG4gICAgdmFyIGVycm9yczogUGFyc2VFcnJvcltdID0gaHRtbEFzdFdpdGhFcnJvcnMuZXJyb3JzO1xuICAgIHZhciByZXN1bHQ7XG4gICAgaWYgKGh0bWxBc3RXaXRoRXJyb3JzLnJvb3ROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgdW5pcURpcmVjdGl2ZXMgPSA8Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10+cmVtb3ZlRHVwbGljYXRlcyhkaXJlY3RpdmVzKTtcbiAgICAgIHZhciB1bmlxUGlwZXMgPSA8Q29tcGlsZVBpcGVNZXRhZGF0YVtdPnJlbW92ZUR1cGxpY2F0ZXMocGlwZXMpO1xuICAgICAgdmFyIHByb3ZpZGVyVmlld0NvbnRleHQgPVxuICAgICAgICAgIG5ldyBQcm92aWRlclZpZXdDb250ZXh0KGNvbXBvbmVudCwgaHRtbEFzdFdpdGhFcnJvcnMucm9vdE5vZGVzWzBdLnNvdXJjZVNwYW4pO1xuICAgICAgdmFyIHBhcnNlVmlzaXRvciA9IG5ldyBUZW1wbGF0ZVBhcnNlVmlzaXRvcihwcm92aWRlclZpZXdDb250ZXh0LCB1bmlxRGlyZWN0aXZlcywgdW5pcVBpcGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9leHByUGFyc2VyLCB0aGlzLl9zY2hlbWFSZWdpc3RyeSk7XG5cbiAgICAgIHJlc3VsdCA9IGh0bWxWaXNpdEFsbChwYXJzZVZpc2l0b3IsIGh0bWxBc3RXaXRoRXJyb3JzLnJvb3ROb2RlcywgRU1QVFlfRUxFTUVOVF9DT05URVhUKTtcbiAgICAgIGVycm9ycyA9IGVycm9ycy5jb25jYXQocGFyc2VWaXNpdG9yLmVycm9ycykuY29uY2F0KHByb3ZpZGVyVmlld0NvbnRleHQuZXJyb3JzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gW107XG4gICAgfVxuICAgIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIG5ldyBUZW1wbGF0ZVBhcnNlUmVzdWx0KHJlc3VsdCwgZXJyb3JzKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnRyYW5zZm9ybXMpKSB7XG4gICAgICB0aGlzLnRyYW5zZm9ybXMuZm9yRWFjaChcbiAgICAgICAgICAodHJhbnNmb3JtOiBUZW1wbGF0ZUFzdFZpc2l0b3IpID0+IHsgcmVzdWx0ID0gdGVtcGxhdGVWaXNpdEFsbCh0cmFuc2Zvcm0sIHJlc3VsdCk7IH0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlbXBsYXRlUGFyc2VSZXN1bHQocmVzdWx0LCBlcnJvcnMpO1xuICB9XG59XG5cbmNsYXNzIFRlbXBsYXRlUGFyc2VWaXNpdG9yIGltcGxlbWVudHMgSHRtbEFzdFZpc2l0b3Ige1xuICBzZWxlY3Rvck1hdGNoZXI6IFNlbGVjdG9yTWF0Y2hlcjtcbiAgZXJyb3JzOiBUZW1wbGF0ZVBhcnNlRXJyb3JbXSA9IFtdO1xuICBkaXJlY3RpdmVzSW5kZXggPSBuZXcgTWFwPENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgbnVtYmVyPigpO1xuICBuZ0NvbnRlbnRDb3VudDogbnVtYmVyID0gMDtcbiAgcGlwZXNCeU5hbWU6IE1hcDxzdHJpbmcsIENvbXBpbGVQaXBlTWV0YWRhdGE+O1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwcm92aWRlclZpZXdDb250ZXh0OiBQcm92aWRlclZpZXdDb250ZXh0LFxuICAgICAgICAgICAgICBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSwgcGlwZXM6IENvbXBpbGVQaXBlTWV0YWRhdGFbXSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfZXhwclBhcnNlcjogUGFyc2VyLCBwcml2YXRlIF9zY2hlbWFSZWdpc3RyeTogRWxlbWVudFNjaGVtYVJlZ2lzdHJ5KSB7XG4gICAgdGhpcy5zZWxlY3Rvck1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyKCk7XG4gICAgTGlzdFdyYXBwZXIuZm9yRWFjaFdpdGhJbmRleChkaXJlY3RpdmVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGRpcmVjdGl2ZTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RvciA9IENzc1NlbGVjdG9yLnBhcnNlKGRpcmVjdGl2ZS5zZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3JNYXRjaGVyLmFkZFNlbGVjdGFibGVzKHNlbGVjdG9yLCBkaXJlY3RpdmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXNJbmRleC5zZXQoZGlyZWN0aXZlLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICB0aGlzLnBpcGVzQnlOYW1lID0gbmV3IE1hcDxzdHJpbmcsIENvbXBpbGVQaXBlTWV0YWRhdGE+KCk7XG4gICAgcGlwZXMuZm9yRWFjaChwaXBlID0+IHRoaXMucGlwZXNCeU5hbWUuc2V0KHBpcGUubmFtZSwgcGlwZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVwb3J0RXJyb3IobWVzc2FnZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgIGxldmVsOiBQYXJzZUVycm9yTGV2ZWwgPSBQYXJzZUVycm9yTGV2ZWwuRkFUQUwpIHtcbiAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBUZW1wbGF0ZVBhcnNlRXJyb3IobWVzc2FnZSwgc291cmNlU3BhbiwgbGV2ZWwpKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlSW50ZXJwb2xhdGlvbih2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBBU1RXaXRoU291cmNlIHtcbiAgICB2YXIgc291cmNlSW5mbyA9IHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKTtcbiAgICB0cnkge1xuICAgICAgdmFyIGFzdCA9IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VJbnRlcnBvbGF0aW9uKHZhbHVlLCBzb3VyY2VJbmZvKTtcbiAgICAgIHRoaXMuX2NoZWNrUGlwZXMoYXN0LCBzb3VyY2VTcGFuKTtcbiAgICAgIGlmIChpc1ByZXNlbnQoYXN0KSAmJlxuICAgICAgICAgICg8SW50ZXJwb2xhdGlvbj5hc3QuYXN0KS5leHByZXNzaW9ucy5sZW5ndGggPiBNQVhfSU5URVJQT0xBVElPTl9WQUxVRVMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICBgT25seSBzdXBwb3J0IGF0IG1vc3QgJHtNQVhfSU5URVJQT0xBVElPTl9WQUxVRVN9IGludGVycG9sYXRpb24gdmFsdWVzIWApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFzdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgJHtlfWAsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIHRoaXMuX2V4cHJQYXJzZXIud3JhcExpdGVyYWxQcmltaXRpdmUoJ0VSUk9SJywgc291cmNlSW5mbyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VBY3Rpb24odmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogQVNUV2l0aFNvdXJjZSB7XG4gICAgdmFyIHNvdXJjZUluZm8gPSBzb3VyY2VTcGFuLnN0YXJ0LnRvU3RyaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBhc3QgPSB0aGlzLl9leHByUGFyc2VyLnBhcnNlQWN0aW9uKHZhbHVlLCBzb3VyY2VJbmZvKTtcbiAgICAgIHRoaXMuX2NoZWNrUGlwZXMoYXN0LCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiBhc3Q7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKCdFUlJPUicsIHNvdXJjZUluZm8pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlQmluZGluZyh2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBBU1RXaXRoU291cmNlIHtcbiAgICB2YXIgc291cmNlSW5mbyA9IHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKTtcbiAgICB0cnkge1xuICAgICAgdmFyIGFzdCA9IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VCaW5kaW5nKHZhbHVlLCBzb3VyY2VJbmZvKTtcbiAgICAgIHRoaXMuX2NoZWNrUGlwZXMoYXN0LCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiBhc3Q7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKCdFUlJPUicsIHNvdXJjZUluZm8pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlVGVtcGxhdGVCaW5kaW5ncyh2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBUZW1wbGF0ZUJpbmRpbmdbXSB7XG4gICAgdmFyIHNvdXJjZUluZm8gPSBzb3VyY2VTcGFuLnN0YXJ0LnRvU3RyaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBiaW5kaW5nc1Jlc3VsdCA9IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VUZW1wbGF0ZUJpbmRpbmdzKHZhbHVlLCBzb3VyY2VJbmZvKTtcbiAgICAgIGJpbmRpbmdzUmVzdWx0LnRlbXBsYXRlQmluZGluZ3MuZm9yRWFjaCgoYmluZGluZykgPT4ge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGJpbmRpbmcuZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICB0aGlzLl9jaGVja1BpcGVzKGJpbmRpbmcuZXhwcmVzc2lvbiwgc291cmNlU3Bhbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYmluZGluZ3NSZXN1bHQud2FybmluZ3MuZm9yRWFjaChcbiAgICAgICAgICAod2FybmluZykgPT4geyB0aGlzLl9yZXBvcnRFcnJvcih3YXJuaW5nLCBzb3VyY2VTcGFuLCBQYXJzZUVycm9yTGV2ZWwuV0FSTklORyk7IH0pO1xuICAgICAgcmV0dXJuIGJpbmRpbmdzUmVzdWx0LnRlbXBsYXRlQmluZGluZ3M7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jaGVja1BpcGVzKGFzdDogQVNUV2l0aFNvdXJjZSwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgaWYgKGlzUHJlc2VudChhc3QpKSB7XG4gICAgICB2YXIgY29sbGVjdG9yID0gbmV3IFBpcGVDb2xsZWN0b3IoKTtcbiAgICAgIGFzdC52aXNpdChjb2xsZWN0b3IpO1xuICAgICAgY29sbGVjdG9yLnBpcGVzLmZvckVhY2goKHBpcGVOYW1lKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5waXBlc0J5TmFtZS5oYXMocGlwZU5hbWUpKSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYFRoZSBwaXBlICcke3BpcGVOYW1lfScgY291bGQgbm90IGJlIGZvdW5kYCwgc291cmNlU3Bhbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uKGFzdDogSHRtbEV4cGFuc2lvbkFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cblxuICB2aXNpdEV4cGFuc2lvbkNhc2UoYXN0OiBIdG1sRXhwYW5zaW9uQ2FzZUFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cblxuICB2aXNpdFRleHQoYXN0OiBIdG1sVGV4dEFzdCwgcGFyZW50OiBFbGVtZW50Q29udGV4dCk6IGFueSB7XG4gICAgdmFyIG5nQ29udGVudEluZGV4ID0gcGFyZW50LmZpbmROZ0NvbnRlbnRJbmRleChURVhUX0NTU19TRUxFQ1RPUik7XG4gICAgdmFyIGV4cHIgPSB0aGlzLl9wYXJzZUludGVycG9sYXRpb24oYXN0LnZhbHVlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgaWYgKGlzUHJlc2VudChleHByKSkge1xuICAgICAgcmV0dXJuIG5ldyBCb3VuZFRleHRBc3QoZXhwciwgbmdDb250ZW50SW5kZXgsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBUZXh0QXN0KGFzdC52YWx1ZSwgbmdDb250ZW50SW5kZXgsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICB9XG4gIH1cblxuICB2aXNpdEF0dHIoYXN0OiBIdG1sQXR0ckFzdCwgY29udGV4OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgQXR0ckFzdChhc3QubmFtZSwgYXN0LnZhbHVlLCBhc3Quc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdENvbW1lbnQoYXN0OiBIdG1sQ29tbWVudEFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cblxuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogSHRtbEVsZW1lbnRBc3QsIHBhcmVudDogRWxlbWVudENvbnRleHQpOiBhbnkge1xuICAgIHZhciBub2RlTmFtZSA9IGVsZW1lbnQubmFtZTtcbiAgICB2YXIgcHJlcGFyc2VkRWxlbWVudCA9IHByZXBhcnNlRWxlbWVudChlbGVtZW50KTtcbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TQ1JJUFQgfHxcbiAgICAgICAgcHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRSkge1xuICAgICAgLy8gU2tpcHBpbmcgPHNjcmlwdD4gZm9yIHNlY3VyaXR5IHJlYXNvbnNcbiAgICAgIC8vIFNraXBwaW5nIDxzdHlsZT4gYXMgd2UgYWxyZWFkeSBwcm9jZXNzZWQgdGhlbVxuICAgICAgLy8gaW4gdGhlIFN0eWxlQ29tcGlsZXJcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRVNIRUVUICYmXG4gICAgICAgIGlzU3R5bGVVcmxSZXNvbHZhYmxlKHByZXBhcnNlZEVsZW1lbnQuaHJlZkF0dHIpKSB7XG4gICAgICAvLyBTa2lwcGluZyBzdHlsZXNoZWV0cyB3aXRoIGVpdGhlciByZWxhdGl2ZSB1cmxzIG9yIHBhY2thZ2Ugc2NoZW1lIGFzIHdlIGFscmVhZHkgcHJvY2Vzc2VkXG4gICAgICAvLyB0aGVtIGluIHRoZSBTdHlsZUNvbXBpbGVyXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10gPSBbXTtcbiAgICB2YXIgZWxlbWVudE9yRGlyZWN0aXZlUHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSA9IFtdO1xuICAgIHZhciBlbGVtZW50T3JEaXJlY3RpdmVSZWZzOiBFbGVtZW50T3JEaXJlY3RpdmVSZWZbXSA9IFtdO1xuICAgIHZhciBlbGVtZW50VmFyczogVmFyaWFibGVBc3RbXSA9IFtdO1xuICAgIHZhciBldmVudHM6IEJvdW5kRXZlbnRBc3RbXSA9IFtdO1xuXG4gICAgdmFyIHRlbXBsYXRlRWxlbWVudE9yRGlyZWN0aXZlUHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSA9IFtdO1xuICAgIHZhciB0ZW1wbGF0ZU1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdID0gW107XG4gICAgdmFyIHRlbXBsYXRlRWxlbWVudFZhcnM6IFZhcmlhYmxlQXN0W10gPSBbXTtcblxuICAgIHZhciBoYXNJbmxpbmVUZW1wbGF0ZXMgPSBmYWxzZTtcbiAgICB2YXIgYXR0cnMgPSBbXTtcbiAgICB2YXIgbGNFbE5hbWUgPSBzcGxpdE5zTmFtZShub2RlTmFtZS50b0xvd2VyQ2FzZSgpKVsxXTtcbiAgICB2YXIgaXNUZW1wbGF0ZUVsZW1lbnQgPSBsY0VsTmFtZSA9PSBURU1QTEFURV9FTEVNRU5UO1xuXG4gICAgZWxlbWVudC5hdHRycy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgdmFyIGhhc0JpbmRpbmcgPVxuICAgICAgICAgIHRoaXMuX3BhcnNlQXR0cihpc1RlbXBsYXRlRWxlbWVudCwgYXR0ciwgbWF0Y2hhYmxlQXR0cnMsIGVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCBldmVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRPckRpcmVjdGl2ZVJlZnMsIGVsZW1lbnRWYXJzKTtcbiAgICAgIHZhciBoYXNUZW1wbGF0ZUJpbmRpbmcgPSB0aGlzLl9wYXJzZUlubGluZVRlbXBsYXRlQmluZGluZyhcbiAgICAgICAgICBhdHRyLCB0ZW1wbGF0ZU1hdGNoYWJsZUF0dHJzLCB0ZW1wbGF0ZUVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCB0ZW1wbGF0ZUVsZW1lbnRWYXJzKTtcbiAgICAgIGlmICghaGFzQmluZGluZyAmJiAhaGFzVGVtcGxhdGVCaW5kaW5nKSB7XG4gICAgICAgIC8vIGRvbid0IGluY2x1ZGUgdGhlIGJpbmRpbmdzIGFzIGF0dHJpYnV0ZXMgYXMgd2VsbCBpbiB0aGUgQVNUXG4gICAgICAgIGF0dHJzLnB1c2godGhpcy52aXNpdEF0dHIoYXR0ciwgbnVsbCkpO1xuICAgICAgICBtYXRjaGFibGVBdHRycy5wdXNoKFthdHRyLm5hbWUsIGF0dHIudmFsdWVdKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXNUZW1wbGF0ZUJpbmRpbmcpIHtcbiAgICAgICAgaGFzSW5saW5lVGVtcGxhdGVzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBlbGVtZW50Q3NzU2VsZWN0b3IgPSBjcmVhdGVFbGVtZW50Q3NzU2VsZWN0b3Iobm9kZU5hbWUsIG1hdGNoYWJsZUF0dHJzKTtcbiAgICB2YXIgZGlyZWN0aXZlTWV0YXMgPSB0aGlzLl9wYXJzZURpcmVjdGl2ZXModGhpcy5zZWxlY3Rvck1hdGNoZXIsIGVsZW1lbnRDc3NTZWxlY3Rvcik7XG4gICAgdmFyIHJlZmVyZW5jZXM6IFJlZmVyZW5jZUFzdFtdID0gW107XG4gICAgdmFyIGRpcmVjdGl2ZUFzdHMgPSB0aGlzLl9jcmVhdGVEaXJlY3RpdmVBc3RzKGlzVGVtcGxhdGVFbGVtZW50LCBlbGVtZW50Lm5hbWUsIGRpcmVjdGl2ZU1ldGFzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgZWxlbWVudE9yRGlyZWN0aXZlUmVmcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuLCByZWZlcmVuY2VzKTtcbiAgICB2YXIgZWxlbWVudFByb3BzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID1cbiAgICAgICAgdGhpcy5fY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0cyhlbGVtZW50Lm5hbWUsIGVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCBkaXJlY3RpdmVBc3RzKTtcbiAgICB2YXIgaXNWaWV3Um9vdCA9IHBhcmVudC5pc1RlbXBsYXRlRWxlbWVudCB8fCBoYXNJbmxpbmVUZW1wbGF0ZXM7XG4gICAgdmFyIHByb3ZpZGVyQ29udGV4dCA9XG4gICAgICAgIG5ldyBQcm92aWRlckVsZW1lbnRDb250ZXh0KHRoaXMucHJvdmlkZXJWaWV3Q29udGV4dCwgcGFyZW50LnByb3ZpZGVyQ29udGV4dCwgaXNWaWV3Um9vdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlQXN0cywgYXR0cnMsIHJlZmVyZW5jZXMsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgdmFyIGNoaWxkcmVuID0gaHRtbFZpc2l0QWxsKFxuICAgICAgICBwcmVwYXJzZWRFbGVtZW50Lm5vbkJpbmRhYmxlID8gTk9OX0JJTkRBQkxFX1ZJU0lUT1IgOiB0aGlzLCBlbGVtZW50LmNoaWxkcmVuLFxuICAgICAgICBFbGVtZW50Q29udGV4dC5jcmVhdGUoaXNUZW1wbGF0ZUVsZW1lbnQsIGRpcmVjdGl2ZUFzdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1RlbXBsYXRlRWxlbWVudCA/IHBhcmVudC5wcm92aWRlckNvbnRleHQgOiBwcm92aWRlckNvbnRleHQpKTtcbiAgICBwcm92aWRlckNvbnRleHQuYWZ0ZXJFbGVtZW50KCk7XG4gICAgLy8gT3ZlcnJpZGUgdGhlIGFjdHVhbCBzZWxlY3RvciB3aGVuIHRoZSBgbmdQcm9qZWN0QXNgIGF0dHJpYnV0ZSBpcyBwcm92aWRlZFxuICAgIHZhciBwcm9qZWN0aW9uU2VsZWN0b3IgPSBpc1ByZXNlbnQocHJlcGFyc2VkRWxlbWVudC5wcm9qZWN0QXMpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENzc1NlbGVjdG9yLnBhcnNlKHByZXBhcnNlZEVsZW1lbnQucHJvamVjdEFzKVswXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Q3NzU2VsZWN0b3I7XG4gICAgdmFyIG5nQ29udGVudEluZGV4ID0gcGFyZW50LmZpbmROZ0NvbnRlbnRJbmRleChwcm9qZWN0aW9uU2VsZWN0b3IpO1xuICAgIHZhciBwYXJzZWRFbGVtZW50O1xuXG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuTkdfQ09OVEVOVCkge1xuICAgICAgaWYgKGlzUHJlc2VudChlbGVtZW50LmNoaWxkcmVuKSAmJiBlbGVtZW50LmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICBgPG5nLWNvbnRlbnQ+IGVsZW1lbnQgY2Fubm90IGhhdmUgY29udGVudC4gPG5nLWNvbnRlbnQ+IG11c3QgYmUgaW1tZWRpYXRlbHkgZm9sbG93ZWQgYnkgPC9uZy1jb250ZW50PmAsXG4gICAgICAgICAgICBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgICAgfVxuXG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IE5nQ29udGVudEFzdChcbiAgICAgICAgICB0aGlzLm5nQ29udGVudENvdW50KyssIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwgOiBuZ0NvbnRlbnRJbmRleCwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB9IGVsc2UgaWYgKGlzVGVtcGxhdGVFbGVtZW50KSB7XG4gICAgICB0aGlzLl9hc3NlcnRBbGxFdmVudHNQdWJsaXNoZWRCeURpcmVjdGl2ZXMoZGlyZWN0aXZlQXN0cywgZXZlbnRzKTtcbiAgICAgIHRoaXMuX2Fzc2VydE5vQ29tcG9uZW50c05vckVsZW1lbnRCaW5kaW5nc09uVGVtcGxhdGUoZGlyZWN0aXZlQXN0cywgZWxlbWVudFByb3BzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNvdXJjZVNwYW4pO1xuXG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IEVtYmVkZGVkVGVtcGxhdGVBc3QoXG4gICAgICAgICAgYXR0cnMsIGV2ZW50cywgcmVmZXJlbmNlcywgZWxlbWVudFZhcnMsIHByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1lZERpcmVjdGl2ZUFzdHMsXG4gICAgICAgICAgcHJvdmlkZXJDb250ZXh0LnRyYW5zZm9ybVByb3ZpZGVycywgcHJvdmlkZXJDb250ZXh0LnRyYW5zZm9ybWVkSGFzVmlld0NvbnRhaW5lciwgY2hpbGRyZW4sXG4gICAgICAgICAgaGFzSW5saW5lVGVtcGxhdGVzID8gbnVsbCA6IG5nQ29udGVudEluZGV4LCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hc3NlcnRPbmx5T25lQ29tcG9uZW50KGRpcmVjdGl2ZUFzdHMsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICBsZXQgbmdDb250ZW50SW5kZXggPVxuICAgICAgICAgIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwgOiBwYXJlbnQuZmluZE5nQ29udGVudEluZGV4KHByb2plY3Rpb25TZWxlY3Rvcik7XG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IEVsZW1lbnRBc3QoXG4gICAgICAgICAgbm9kZU5hbWUsIGF0dHJzLCBlbGVtZW50UHJvcHMsIGV2ZW50cywgcmVmZXJlbmNlcyxcbiAgICAgICAgICBwcm92aWRlckNvbnRleHQudHJhbnNmb3JtZWREaXJlY3RpdmVBc3RzLCBwcm92aWRlckNvbnRleHQudHJhbnNmb3JtUHJvdmlkZXJzLFxuICAgICAgICAgIHByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1lZEhhc1ZpZXdDb250YWluZXIsIGNoaWxkcmVuLFxuICAgICAgICAgIGhhc0lubGluZVRlbXBsYXRlcyA/IG51bGwgOiBuZ0NvbnRlbnRJbmRleCwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB9XG4gICAgaWYgKGhhc0lubGluZVRlbXBsYXRlcykge1xuICAgICAgdmFyIHRlbXBsYXRlQ3NzU2VsZWN0b3IgPSBjcmVhdGVFbGVtZW50Q3NzU2VsZWN0b3IoVEVNUExBVEVfRUxFTUVOVCwgdGVtcGxhdGVNYXRjaGFibGVBdHRycyk7XG4gICAgICB2YXIgdGVtcGxhdGVEaXJlY3RpdmVNZXRhcyA9IHRoaXMuX3BhcnNlRGlyZWN0aXZlcyh0aGlzLnNlbGVjdG9yTWF0Y2hlciwgdGVtcGxhdGVDc3NTZWxlY3Rvcik7XG4gICAgICB2YXIgdGVtcGxhdGVEaXJlY3RpdmVBc3RzID1cbiAgICAgICAgICB0aGlzLl9jcmVhdGVEaXJlY3RpdmVBc3RzKHRydWUsIGVsZW1lbnQubmFtZSwgdGVtcGxhdGVEaXJlY3RpdmVNZXRhcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlRWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsIFtdLCBlbGVtZW50LnNvdXJjZVNwYW4sIFtdKTtcbiAgICAgIHZhciB0ZW1wbGF0ZUVsZW1lbnRQcm9wczogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSA9IHRoaXMuX2NyZWF0ZUVsZW1lbnRQcm9wZXJ0eUFzdHMoXG4gICAgICAgICAgZWxlbWVudC5uYW1lLCB0ZW1wbGF0ZUVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCB0ZW1wbGF0ZURpcmVjdGl2ZUFzdHMpO1xuICAgICAgdGhpcy5fYXNzZXJ0Tm9Db21wb25lbnRzTm9yRWxlbWVudEJpbmRpbmdzT25UZW1wbGF0ZShcbiAgICAgICAgICB0ZW1wbGF0ZURpcmVjdGl2ZUFzdHMsIHRlbXBsYXRlRWxlbWVudFByb3BzLCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgICAgdmFyIHRlbXBsYXRlUHJvdmlkZXJDb250ZXh0ID0gbmV3IFByb3ZpZGVyRWxlbWVudENvbnRleHQoXG4gICAgICAgICAgdGhpcy5wcm92aWRlclZpZXdDb250ZXh0LCBwYXJlbnQucHJvdmlkZXJDb250ZXh0LCBwYXJlbnQuaXNUZW1wbGF0ZUVsZW1lbnQsXG4gICAgICAgICAgdGVtcGxhdGVEaXJlY3RpdmVBc3RzLCBbXSwgW10sIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICB0ZW1wbGF0ZVByb3ZpZGVyQ29udGV4dC5hZnRlckVsZW1lbnQoKTtcblxuICAgICAgcGFyc2VkRWxlbWVudCA9IG5ldyBFbWJlZGRlZFRlbXBsYXRlQXN0KFtdLCBbXSwgW10sIHRlbXBsYXRlRWxlbWVudFZhcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVQcm92aWRlckNvbnRleHQudHJhbnNmb3JtZWREaXJlY3RpdmVBc3RzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlUHJvdmlkZXJDb250ZXh0LnRyYW5zZm9ybVByb3ZpZGVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVByb3ZpZGVyQ29udGV4dC50cmFuc2Zvcm1lZEhhc1ZpZXdDb250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3BhcnNlZEVsZW1lbnRdLCBuZ0NvbnRlbnRJbmRleCwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlZEVsZW1lbnQ7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUlubGluZVRlbXBsYXRlQmluZGluZyhhdHRyOiBIdG1sQXR0ckFzdCwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFZhcnM6IFZhcmlhYmxlQXN0W10pOiBib29sZWFuIHtcbiAgICB2YXIgdGVtcGxhdGVCaW5kaW5nc1NvdXJjZSA9IG51bGw7XG4gICAgaWYgKGF0dHIubmFtZSA9PSBURU1QTEFURV9BVFRSKSB7XG4gICAgICB0ZW1wbGF0ZUJpbmRpbmdzU291cmNlID0gYXR0ci52YWx1ZTtcbiAgICB9IGVsc2UgaWYgKGF0dHIubmFtZS5zdGFydHNXaXRoKFRFTVBMQVRFX0FUVFJfUFJFRklYKSkge1xuICAgICAgdmFyIGtleSA9IGF0dHIubmFtZS5zdWJzdHJpbmcoVEVNUExBVEVfQVRUUl9QUkVGSVgubGVuZ3RoKTsgIC8vIHJlbW92ZSB0aGUgc3RhclxuICAgICAgdGVtcGxhdGVCaW5kaW5nc1NvdXJjZSA9IChhdHRyLnZhbHVlLmxlbmd0aCA9PSAwKSA/IGtleSA6IGtleSArICcgJyArIGF0dHIudmFsdWU7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGVtcGxhdGVCaW5kaW5nc1NvdXJjZSkpIHtcbiAgICAgIHZhciBiaW5kaW5ncyA9IHRoaXMuX3BhcnNlVGVtcGxhdGVCaW5kaW5ncyh0ZW1wbGF0ZUJpbmRpbmdzU291cmNlLCBhdHRyLnNvdXJjZVNwYW4pO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBiaW5kaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYmluZGluZyA9IGJpbmRpbmdzW2ldO1xuICAgICAgICBpZiAoYmluZGluZy5rZXlJc1Zhcikge1xuICAgICAgICAgIHRhcmdldFZhcnMucHVzaChuZXcgVmFyaWFibGVBc3QoYmluZGluZy5rZXksIGJpbmRpbmcubmFtZSwgYXR0ci5zb3VyY2VTcGFuKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRpbmcuZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICB0aGlzLl9wYXJzZVByb3BlcnR5QXN0KGJpbmRpbmcua2V5LCBiaW5kaW5nLmV4cHJlc3Npb24sIGF0dHIuc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMucHVzaChbYmluZGluZy5rZXksICcnXSk7XG4gICAgICAgICAgdGhpcy5fcGFyc2VMaXRlcmFsQXR0cihiaW5kaW5nLmtleSwgbnVsbCwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRQcm9wcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUF0dHIoaXNUZW1wbGF0ZUVsZW1lbnQ6IGJvb2xlYW4sIGF0dHI6IEh0bWxBdHRyQXN0LFxuICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdLCB0YXJnZXRFdmVudHM6IEJvdW5kRXZlbnRBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgIHRhcmdldFJlZnM6IEVsZW1lbnRPckRpcmVjdGl2ZVJlZltdLCB0YXJnZXRWYXJzOiBWYXJpYWJsZUFzdFtdKTogYm9vbGVhbiB7XG4gICAgdmFyIGF0dHJOYW1lID0gdGhpcy5fbm9ybWFsaXplQXR0cmlidXRlTmFtZShhdHRyLm5hbWUpO1xuICAgIHZhciBhdHRyVmFsdWUgPSBhdHRyLnZhbHVlO1xuICAgIHZhciBiaW5kUGFydHMgPSBSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2goQklORF9OQU1FX1JFR0VYUCwgYXR0ck5hbWUpO1xuICAgIHZhciBoYXNCaW5kaW5nID0gZmFsc2U7XG4gICAgaWYgKGlzUHJlc2VudChiaW5kUGFydHMpKSB7XG4gICAgICBoYXNCaW5kaW5nID0gdHJ1ZTtcbiAgICAgIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzWzFdKSkgeyAgLy8gbWF0Y2g6IGJpbmQtcHJvcFxuICAgICAgICB0aGlzLl9wYXJzZVByb3BlcnR5KGJpbmRQYXJ0c1s3XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzKTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzWzJdKSkgeyAgLy8gbWF0Y2g6IHZhci1uYW1lIC8gdmFyLW5hbWU9XCJpZGVuXCJcbiAgICAgICAgdmFyIGlkZW50aWZpZXIgPSBiaW5kUGFydHNbN107XG4gICAgICAgIGlmIChpc1RlbXBsYXRlRWxlbWVudCkge1xuICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBcInZhci1cIiBvbiA8dGVtcGxhdGU+IGVsZW1lbnRzIGlzIGRlcHJlY2F0ZWQuIFVzZSBcImxldC1cIiBpbnN0ZWFkIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0ci5zb3VyY2VTcGFuLCBQYXJzZUVycm9yTGV2ZWwuV0FSTklORyk7XG4gICAgICAgICAgdGhpcy5fcGFyc2VWYXJpYWJsZShpZGVudGlmaWVyLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0VmFycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYFwidmFyLVwiIG9uIG5vbiA8dGVtcGxhdGU+IGVsZW1lbnRzIGlzIGRlcHJlY2F0ZWQuIFVzZSBcInJlZi1cIiBpbnN0ZWFkIWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0ci5zb3VyY2VTcGFuLCBQYXJzZUVycm9yTGV2ZWwuV0FSTklORyk7XG4gICAgICAgICAgdGhpcy5fcGFyc2VSZWZlcmVuY2UoaWRlbnRpZmllciwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldFJlZnMpO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1szXSkpIHsgIC8vIG1hdGNoOiBsZXQtbmFtZVxuICAgICAgICBpZiAoaXNUZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICAgICAgICB2YXIgaWRlbnRpZmllciA9IGJpbmRQYXJ0c1s3XTtcbiAgICAgICAgICB0aGlzLl9wYXJzZVZhcmlhYmxlKGlkZW50aWZpZXIsIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRWYXJzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihgXCJsZXQtXCIgaXMgb25seSBzdXBwb3J0ZWQgb24gdGVtcGxhdGUgZWxlbWVudHMuYCwgYXR0ci5zb3VyY2VTcGFuKTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChiaW5kUGFydHNbNF0pKSB7ICAvLyBtYXRjaDogcmVmLSAvICNpZGVuXG4gICAgICAgIHZhciBpZGVudGlmaWVyID0gYmluZFBhcnRzWzddO1xuICAgICAgICB0aGlzLl9wYXJzZVJlZmVyZW5jZShpZGVudGlmaWVyLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0UmVmcyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1s1XSkpIHsgIC8vIG1hdGNoOiBvbi1ldmVudFxuICAgICAgICB0aGlzLl9wYXJzZUV2ZW50KGJpbmRQYXJ0c1s3XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50cyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1s2XSkpIHsgIC8vIG1hdGNoOiBiaW5kb24tcHJvcFxuICAgICAgICB0aGlzLl9wYXJzZVByb3BlcnR5KGJpbmRQYXJ0c1s3XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzKTtcbiAgICAgICAgdGhpcy5fcGFyc2VBc3NpZ25tZW50RXZlbnQoYmluZFBhcnRzWzddLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50cyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1s4XSkpIHsgIC8vIG1hdGNoOiBbKGV4cHIpXVxuICAgICAgICB0aGlzLl9wYXJzZVByb3BlcnR5KGJpbmRQYXJ0c1s4XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzKTtcbiAgICAgICAgdGhpcy5fcGFyc2VBc3NpZ25tZW50RXZlbnQoYmluZFBhcnRzWzhdLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50cyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1s5XSkpIHsgIC8vIG1hdGNoOiBbZXhwcl1cbiAgICAgICAgdGhpcy5fcGFyc2VQcm9wZXJ0eShiaW5kUGFydHNbOV0sIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wcyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1sxMF0pKSB7ICAvLyBtYXRjaDogKGV2ZW50KVxuICAgICAgICB0aGlzLl9wYXJzZUV2ZW50KGJpbmRQYXJ0c1sxMF0sIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudHMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBoYXNCaW5kaW5nID0gdGhpcy5fcGFyc2VQcm9wZXJ0eUludGVycG9sYXRpb24oYXR0ck5hbWUsIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gICAgfVxuICAgIGlmICghaGFzQmluZGluZykge1xuICAgICAgdGhpcy5fcGFyc2VMaXRlcmFsQXR0cihhdHRyTmFtZSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldFByb3BzKTtcbiAgICB9XG4gICAgcmV0dXJuIGhhc0JpbmRpbmc7XG4gIH1cblxuICBwcml2YXRlIF9ub3JtYWxpemVBdHRyaWJ1dGVOYW1lKGF0dHJOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBhdHRyTmFtZS50b0xvd2VyQ2FzZSgpLnN0YXJ0c1dpdGgoJ2RhdGEtJykgPyBhdHRyTmFtZS5zdWJzdHJpbmcoNSkgOiBhdHRyTmFtZTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlVmFyaWFibGUoaWRlbnRpZmllcjogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0VmFyczogVmFyaWFibGVBc3RbXSkge1xuICAgIGlmIChpZGVudGlmaWVyLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgXCItXCIgaXMgbm90IGFsbG93ZWQgaW4gdmFyaWFibGUgbmFtZXNgLCBzb3VyY2VTcGFuKTtcbiAgICB9XG4gICAgdGFyZ2V0VmFycy5wdXNoKG5ldyBWYXJpYWJsZUFzdChpZGVudGlmaWVyLCB2YWx1ZSwgc291cmNlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VSZWZlcmVuY2UoaWRlbnRpZmllcjogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFJlZnM6IEVsZW1lbnRPckRpcmVjdGl2ZVJlZltdKSB7XG4gICAgaWYgKGlkZW50aWZpZXIuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBcIi1cIiBpcyBub3QgYWxsb3dlZCBpbiByZWZlcmVuY2UgbmFtZXNgLCBzb3VyY2VTcGFuKTtcbiAgICB9XG4gICAgdGFyZ2V0UmVmcy5wdXNoKG5ldyBFbGVtZW50T3JEaXJlY3RpdmVSZWYoaWRlbnRpZmllciwgdmFsdWUsIHNvdXJjZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlUHJvcGVydHkobmFtZTogc3RyaW5nLCBleHByZXNzaW9uOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdKSB7XG4gICAgdGhpcy5fcGFyc2VQcm9wZXJ0eUFzdChuYW1lLCB0aGlzLl9wYXJzZUJpbmRpbmcoZXhwcmVzc2lvbiwgc291cmNlU3BhbiksIHNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycywgdGFyZ2V0UHJvcHMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VQcm9wZXJ0eUludGVycG9sYXRpb24obmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdKTogYm9vbGVhbiB7XG4gICAgdmFyIGV4cHIgPSB0aGlzLl9wYXJzZUludGVycG9sYXRpb24odmFsdWUsIHNvdXJjZVNwYW4pO1xuICAgIGlmIChpc1ByZXNlbnQoZXhwcikpIHtcbiAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHlBc3QobmFtZSwgZXhwciwgc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIHRhcmdldFByb3BzKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVByb3BlcnR5QXN0KG5hbWU6IHN0cmluZywgYXN0OiBBU1RXaXRoU291cmNlLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSkge1xuICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLnB1c2goW25hbWUsIGFzdC5zb3VyY2VdKTtcbiAgICB0YXJnZXRQcm9wcy5wdXNoKG5ldyBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5KG5hbWUsIGFzdCwgZmFsc2UsIHNvdXJjZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlQXNzaWdubWVudEV2ZW50KG5hbWU6IHN0cmluZywgZXhwcmVzc2lvbjogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLCB0YXJnZXRFdmVudHM6IEJvdW5kRXZlbnRBc3RbXSkge1xuICAgIHRoaXMuX3BhcnNlRXZlbnQoYCR7bmFtZX1DaGFuZ2VgLCBgJHtleHByZXNzaW9ufT0kZXZlbnRgLCBzb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50cyk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUV2ZW50KG5hbWU6IHN0cmluZywgZXhwcmVzc2lvbjogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sIHRhcmdldEV2ZW50czogQm91bmRFdmVudEFzdFtdKSB7XG4gICAgLy8gbG9uZyBmb3JtYXQ6ICd0YXJnZXQ6IGV2ZW50TmFtZSdcbiAgICB2YXIgcGFydHMgPSBzcGxpdEF0Q29sb24obmFtZSwgW251bGwsIG5hbWVdKTtcbiAgICB2YXIgdGFyZ2V0ID0gcGFydHNbMF07XG4gICAgdmFyIGV2ZW50TmFtZSA9IHBhcnRzWzFdO1xuICAgIHZhciBhc3QgPSB0aGlzLl9wYXJzZUFjdGlvbihleHByZXNzaW9uLCBzb3VyY2VTcGFuKTtcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRycy5wdXNoKFtuYW1lLCBhc3Quc291cmNlXSk7XG4gICAgdGFyZ2V0RXZlbnRzLnB1c2gobmV3IEJvdW5kRXZlbnRBc3QoZXZlbnROYW1lLCB0YXJnZXQsIGFzdCwgc291cmNlU3BhbikpO1xuICAgIC8vIERvbid0IGRldGVjdCBkaXJlY3RpdmVzIGZvciBldmVudCBuYW1lcyBmb3Igbm93LFxuICAgIC8vIHNvIGRvbid0IGFkZCB0aGUgZXZlbnQgbmFtZSB0byB0aGUgbWF0Y2hhYmxlQXR0cnNcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlTGl0ZXJhbEF0dHIobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSkge1xuICAgIHRhcmdldFByb3BzLnB1c2gobmV3IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHkoXG4gICAgICAgIG5hbWUsIHRoaXMuX2V4cHJQYXJzZXIud3JhcExpdGVyYWxQcmltaXRpdmUodmFsdWUsICcnKSwgdHJ1ZSwgc291cmNlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VEaXJlY3RpdmVzKHNlbGVjdG9yTWF0Y2hlcjogU2VsZWN0b3JNYXRjaGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudENzc1NlbGVjdG9yOiBDc3NTZWxlY3Rvcik6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdIHtcbiAgICAvLyBOZWVkIHRvIHNvcnQgdGhlIGRpcmVjdGl2ZXMgc28gdGhhdCB3ZSBnZXQgY29uc2lzdGVudCByZXN1bHRzIHRocm91Z2hvdXQsXG4gICAgLy8gYXMgc2VsZWN0b3JNYXRjaGVyIHVzZXMgTWFwcyBpbnNpZGUuXG4gICAgLy8gQWxzbyBkZWR1cGUgZGlyZWN0aXZlcyBhcyB0aGV5IG1pZ2h0IG1hdGNoIG1vcmUgdGhhbiBvbmUgdGltZSFcbiAgICB2YXIgZGlyZWN0aXZlcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZSh0aGlzLmRpcmVjdGl2ZXNJbmRleC5zaXplKTtcbiAgICBzZWxlY3Rvck1hdGNoZXIubWF0Y2goZWxlbWVudENzc1NlbGVjdG9yLCAoc2VsZWN0b3IsIGRpcmVjdGl2ZSkgPT4ge1xuICAgICAgZGlyZWN0aXZlc1t0aGlzLmRpcmVjdGl2ZXNJbmRleC5nZXQoZGlyZWN0aXZlKV0gPSBkaXJlY3RpdmU7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRpcmVjdGl2ZXMuZmlsdGVyKGRpciA9PiBpc1ByZXNlbnQoZGlyKSk7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVBc3RzKGlzVGVtcGxhdGVFbGVtZW50OiBib29sZWFuLCBlbGVtZW50TmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudE9yRGlyZWN0aXZlUmVmczogRWxlbWVudE9yRGlyZWN0aXZlUmVmW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFJlZmVyZW5jZXM6IFJlZmVyZW5jZUFzdFtdKTogRGlyZWN0aXZlQXN0W10ge1xuICAgIHZhciBtYXRjaGVkUmVmZXJlbmNlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIHZhciBjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSA9IG51bGw7XG4gICAgdmFyIGRpcmVjdGl2ZUFzdHMgPSBkaXJlY3RpdmVzLm1hcCgoZGlyZWN0aXZlOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEpID0+IHtcbiAgICAgIGlmIChkaXJlY3RpdmUuaXNDb21wb25lbnQpIHtcbiAgICAgICAgY29tcG9uZW50ID0gZGlyZWN0aXZlO1xuICAgICAgfVxuICAgICAgdmFyIGhvc3RQcm9wZXJ0aWVzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID0gW107XG4gICAgICB2YXIgaG9zdEV2ZW50czogQm91bmRFdmVudEFzdFtdID0gW107XG4gICAgICB2YXIgZGlyZWN0aXZlUHJvcGVydGllczogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdFtdID0gW107XG4gICAgICB0aGlzLl9jcmVhdGVEaXJlY3RpdmVIb3N0UHJvcGVydHlBc3RzKGVsZW1lbnROYW1lLCBkaXJlY3RpdmUuaG9zdFByb3BlcnRpZXMsIHNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RQcm9wZXJ0aWVzKTtcbiAgICAgIHRoaXMuX2NyZWF0ZURpcmVjdGl2ZUhvc3RFdmVudEFzdHMoZGlyZWN0aXZlLmhvc3RMaXN0ZW5lcnMsIHNvdXJjZVNwYW4sIGhvc3RFdmVudHMpO1xuICAgICAgdGhpcy5fY3JlYXRlRGlyZWN0aXZlUHJvcGVydHlBc3RzKGRpcmVjdGl2ZS5pbnB1dHMsIHByb3BzLCBkaXJlY3RpdmVQcm9wZXJ0aWVzKTtcbiAgICAgIGVsZW1lbnRPckRpcmVjdGl2ZVJlZnMuZm9yRWFjaCgoZWxPckRpclJlZikgPT4ge1xuICAgICAgICBpZiAoKGVsT3JEaXJSZWYudmFsdWUubGVuZ3RoID09PSAwICYmIGRpcmVjdGl2ZS5pc0NvbXBvbmVudCkgfHxcbiAgICAgICAgICAgIChkaXJlY3RpdmUuZXhwb3J0QXMgPT0gZWxPckRpclJlZi52YWx1ZSkpIHtcbiAgICAgICAgICB0YXJnZXRSZWZlcmVuY2VzLnB1c2gobmV3IFJlZmVyZW5jZUFzdChlbE9yRGlyUmVmLm5hbWUsIGlkZW50aWZpZXJUb2tlbihkaXJlY3RpdmUudHlwZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxPckRpclJlZi5zb3VyY2VTcGFuKSk7XG4gICAgICAgICAgbWF0Y2hlZFJlZmVyZW5jZXMuYWRkKGVsT3JEaXJSZWYubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG5ldyBEaXJlY3RpdmVBc3QoZGlyZWN0aXZlLCBkaXJlY3RpdmVQcm9wZXJ0aWVzLCBob3N0UHJvcGVydGllcywgaG9zdEV2ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW4pO1xuICAgIH0pO1xuICAgIGVsZW1lbnRPckRpcmVjdGl2ZVJlZnMuZm9yRWFjaCgoZWxPckRpclJlZikgPT4ge1xuICAgICAgaWYgKGVsT3JEaXJSZWYudmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoIVNldFdyYXBwZXIuaGFzKG1hdGNoZWRSZWZlcmVuY2VzLCBlbE9yRGlyUmVmLm5hbWUpKSB7XG4gICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYFRoZXJlIGlzIG5vIGRpcmVjdGl2ZSB3aXRoIFwiZXhwb3J0QXNcIiBzZXQgdG8gXCIke2VsT3JEaXJSZWYudmFsdWV9XCJgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsT3JEaXJSZWYuc291cmNlU3Bhbik7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKGlzQmxhbmsoY29tcG9uZW50KSkge1xuICAgICAgICB2YXIgcmVmVG9rZW4gPSBudWxsO1xuICAgICAgICBpZiAoaXNUZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICAgICAgICByZWZUb2tlbiA9IGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5UZW1wbGF0ZVJlZik7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0UmVmZXJlbmNlcy5wdXNoKG5ldyBSZWZlcmVuY2VBc3QoZWxPckRpclJlZi5uYW1lLCByZWZUb2tlbiwgZWxPckRpclJlZi5zb3VyY2VTcGFuKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRpcmVjdGl2ZUFzdHM7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVIb3N0UHJvcGVydHlBc3RzKGVsZW1lbnROYW1lOiBzdHJpbmcsIGhvc3RQcm9wczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BlcnR5QXN0czogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSkge1xuICAgIGlmIChpc1ByZXNlbnQoaG9zdFByb3BzKSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGhvc3RQcm9wcywgKGV4cHJlc3Npb246IHN0cmluZywgcHJvcE5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICB2YXIgZXhwckFzdCA9IHRoaXMuX3BhcnNlQmluZGluZyhleHByZXNzaW9uLCBzb3VyY2VTcGFuKTtcbiAgICAgICAgdGFyZ2V0UHJvcGVydHlBc3RzLnB1c2goXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVFbGVtZW50UHJvcGVydHlBc3QoZWxlbWVudE5hbWUsIHByb3BOYW1lLCBleHByQXN0LCBzb3VyY2VTcGFuKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVIb3N0RXZlbnRBc3RzKGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudEFzdHM6IEJvdW5kRXZlbnRBc3RbXSkge1xuICAgIGlmIChpc1ByZXNlbnQoaG9zdExpc3RlbmVycykpIHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChob3N0TGlzdGVuZXJzLCAoZXhwcmVzc2lvbjogc3RyaW5nLCBwcm9wTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIHRoaXMuX3BhcnNlRXZlbnQocHJvcE5hbWUsIGV4cHJlc3Npb24sIHNvdXJjZVNwYW4sIFtdLCB0YXJnZXRFdmVudEFzdHMpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRGlyZWN0aXZlUHJvcGVydHlBc3RzKGRpcmVjdGl2ZVByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm91bmRQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0Qm91bmREaXJlY3RpdmVQcm9wczogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdFtdKSB7XG4gICAgaWYgKGlzUHJlc2VudChkaXJlY3RpdmVQcm9wZXJ0aWVzKSkge1xuICAgICAgdmFyIGJvdW5kUHJvcHNCeU5hbWUgPSBuZXcgTWFwPHN0cmluZywgQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eT4oKTtcbiAgICAgIGJvdW5kUHJvcHMuZm9yRWFjaChib3VuZFByb3AgPT4ge1xuICAgICAgICB2YXIgcHJldlZhbHVlID0gYm91bmRQcm9wc0J5TmFtZS5nZXQoYm91bmRQcm9wLm5hbWUpO1xuICAgICAgICBpZiAoaXNCbGFuayhwcmV2VmFsdWUpIHx8IHByZXZWYWx1ZS5pc0xpdGVyYWwpIHtcbiAgICAgICAgICAvLyBnaXZlIFthXT1cImJcIiBhIGhpZ2hlciBwcmVjZWRlbmNlIHRoYW4gYT1cImJcIiBvbiB0aGUgc2FtZSBlbGVtZW50XG4gICAgICAgICAgYm91bmRQcm9wc0J5TmFtZS5zZXQoYm91bmRQcm9wLm5hbWUsIGJvdW5kUHJvcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZGlyZWN0aXZlUHJvcGVydGllcywgKGVsUHJvcDogc3RyaW5nLCBkaXJQcm9wOiBzdHJpbmcpID0+IHtcbiAgICAgICAgdmFyIGJvdW5kUHJvcCA9IGJvdW5kUHJvcHNCeU5hbWUuZ2V0KGVsUHJvcCk7XG5cbiAgICAgICAgLy8gQmluZGluZ3MgYXJlIG9wdGlvbmFsLCBzbyB0aGlzIGJpbmRpbmcgb25seSBuZWVkcyB0byBiZSBzZXQgdXAgaWYgYW4gZXhwcmVzc2lvbiBpcyBnaXZlbi5cbiAgICAgICAgaWYgKGlzUHJlc2VudChib3VuZFByb3ApKSB7XG4gICAgICAgICAgdGFyZ2V0Qm91bmREaXJlY3RpdmVQcm9wcy5wdXNoKG5ldyBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0KFxuICAgICAgICAgICAgICBkaXJQcm9wLCBib3VuZFByb3AubmFtZSwgYm91bmRQcm9wLmV4cHJlc3Npb24sIGJvdW5kUHJvcC5zb3VyY2VTcGFuKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUVsZW1lbnRQcm9wZXJ0eUFzdHMoZWxlbWVudE5hbWU6IHN0cmluZywgcHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSk6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10ge1xuICAgIHZhciBib3VuZEVsZW1lbnRQcm9wczogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSA9IFtdO1xuICAgIHZhciBib3VuZERpcmVjdGl2ZVByb3BzSW5kZXggPSBuZXcgTWFwPHN0cmluZywgQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdD4oKTtcbiAgICBkaXJlY3RpdmVzLmZvckVhY2goKGRpcmVjdGl2ZTogRGlyZWN0aXZlQXN0KSA9PiB7XG4gICAgICBkaXJlY3RpdmUuaW5wdXRzLmZvckVhY2goKHByb3A6IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QpID0+IHtcbiAgICAgICAgYm91bmREaXJlY3RpdmVQcm9wc0luZGV4LnNldChwcm9wLnRlbXBsYXRlTmFtZSwgcHJvcCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBwcm9wcy5mb3JFYWNoKChwcm9wOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5KSA9PiB7XG4gICAgICBpZiAoIXByb3AuaXNMaXRlcmFsICYmIGlzQmxhbmsoYm91bmREaXJlY3RpdmVQcm9wc0luZGV4LmdldChwcm9wLm5hbWUpKSkge1xuICAgICAgICBib3VuZEVsZW1lbnRQcm9wcy5wdXNoKHRoaXMuX2NyZWF0ZUVsZW1lbnRQcm9wZXJ0eUFzdChlbGVtZW50TmFtZSwgcHJvcC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wLmV4cHJlc3Npb24sIHByb3Auc291cmNlU3BhbikpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBib3VuZEVsZW1lbnRQcm9wcztcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUVsZW1lbnRQcm9wZXJ0eUFzdChlbGVtZW50TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGFzdDogQVNULFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogQm91bmRFbGVtZW50UHJvcGVydHlBc3Qge1xuICAgIHZhciB1bml0ID0gbnVsbDtcbiAgICB2YXIgYmluZGluZ1R5cGU7XG4gICAgdmFyIGJvdW5kUHJvcGVydHlOYW1lO1xuICAgIHZhciBwYXJ0cyA9IG5hbWUuc3BsaXQoUFJPUEVSVFlfUEFSVFNfU0VQQVJBVE9SKTtcbiAgICBpZiAocGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICBib3VuZFByb3BlcnR5TmFtZSA9IHRoaXMuX3NjaGVtYVJlZ2lzdHJ5LmdldE1hcHBlZFByb3BOYW1lKHBhcnRzWzBdKTtcbiAgICAgIGJpbmRpbmdUeXBlID0gUHJvcGVydHlCaW5kaW5nVHlwZS5Qcm9wZXJ0eTtcbiAgICAgIGlmICghdGhpcy5fc2NoZW1hUmVnaXN0cnkuaGFzUHJvcGVydHkoZWxlbWVudE5hbWUsIGJvdW5kUHJvcGVydHlOYW1lKSkge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgIGBDYW4ndCBiaW5kIHRvICcke2JvdW5kUHJvcGVydHlOYW1lfScgc2luY2UgaXQgaXNuJ3QgYSBrbm93biBuYXRpdmUgcHJvcGVydHlgLFxuICAgICAgICAgICAgc291cmNlU3Bhbik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwYXJ0c1swXSA9PSBBVFRSSUJVVEVfUFJFRklYKSB7XG4gICAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gcGFydHNbMV07XG4gICAgICAgIGxldCBuc1NlcGFyYXRvcklkeCA9IGJvdW5kUHJvcGVydHlOYW1lLmluZGV4T2YoJzonKTtcbiAgICAgICAgaWYgKG5zU2VwYXJhdG9ySWR4ID4gLTEpIHtcbiAgICAgICAgICBsZXQgbnMgPSBib3VuZFByb3BlcnR5TmFtZS5zdWJzdHJpbmcoMCwgbnNTZXBhcmF0b3JJZHgpO1xuICAgICAgICAgIGxldCBuYW1lID0gYm91bmRQcm9wZXJ0eU5hbWUuc3Vic3RyaW5nKG5zU2VwYXJhdG9ySWR4ICsgMSk7XG4gICAgICAgICAgYm91bmRQcm9wZXJ0eU5hbWUgPSBtZXJnZU5zQW5kTmFtZShucywgbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgYmluZGluZ1R5cGUgPSBQcm9wZXJ0eUJpbmRpbmdUeXBlLkF0dHJpYnV0ZTtcbiAgICAgIH0gZWxzZSBpZiAocGFydHNbMF0gPT0gQ0xBU1NfUFJFRklYKSB7XG4gICAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gcGFydHNbMV07XG4gICAgICAgIGJpbmRpbmdUeXBlID0gUHJvcGVydHlCaW5kaW5nVHlwZS5DbGFzcztcbiAgICAgIH0gZWxzZSBpZiAocGFydHNbMF0gPT0gU1RZTEVfUFJFRklYKSB7XG4gICAgICAgIHVuaXQgPSBwYXJ0cy5sZW5ndGggPiAyID8gcGFydHNbMl0gOiBudWxsO1xuICAgICAgICBib3VuZFByb3BlcnR5TmFtZSA9IHBhcnRzWzFdO1xuICAgICAgICBiaW5kaW5nVHlwZSA9IFByb3BlcnR5QmluZGluZ1R5cGUuU3R5bGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihgSW52YWxpZCBwcm9wZXJ0eSBuYW1lICcke25hbWV9J2AsIHNvdXJjZVNwYW4pO1xuICAgICAgICBiaW5kaW5nVHlwZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdChib3VuZFByb3BlcnR5TmFtZSwgYmluZGluZ1R5cGUsIGFzdCwgdW5pdCwgc291cmNlU3Bhbik7XG4gIH1cblxuXG4gIHByaXZhdGUgX2ZpbmRDb21wb25lbnREaXJlY3RpdmVOYW1lcyhkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSk6IHN0cmluZ1tdIHtcbiAgICB2YXIgY29tcG9uZW50VHlwZU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGRpcmVjdGl2ZXMuZm9yRWFjaChkaXJlY3RpdmUgPT4ge1xuICAgICAgdmFyIHR5cGVOYW1lID0gZGlyZWN0aXZlLmRpcmVjdGl2ZS50eXBlLm5hbWU7XG4gICAgICBpZiAoZGlyZWN0aXZlLmRpcmVjdGl2ZS5pc0NvbXBvbmVudCkge1xuICAgICAgICBjb21wb25lbnRUeXBlTmFtZXMucHVzaCh0eXBlTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbXBvbmVudFR5cGVOYW1lcztcbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2VydE9ubHlPbmVDb21wb25lbnQoZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10sIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIHZhciBjb21wb25lbnRUeXBlTmFtZXMgPSB0aGlzLl9maW5kQ29tcG9uZW50RGlyZWN0aXZlTmFtZXMoZGlyZWN0aXZlcyk7XG4gICAgaWYgKGNvbXBvbmVudFR5cGVOYW1lcy5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgTW9yZSB0aGFuIG9uZSBjb21wb25lbnQ6ICR7Y29tcG9uZW50VHlwZU5hbWVzLmpvaW4oJywnKX1gLCBzb3VyY2VTcGFuKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hc3NlcnROb0NvbXBvbmVudHNOb3JFbGVtZW50QmluZGluZ3NPblRlbXBsYXRlKGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRQcm9wczogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICB2YXIgY29tcG9uZW50VHlwZU5hbWVzOiBzdHJpbmdbXSA9IHRoaXMuX2ZpbmRDb21wb25lbnREaXJlY3RpdmVOYW1lcyhkaXJlY3RpdmVzKTtcbiAgICBpZiAoY29tcG9uZW50VHlwZU5hbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBDb21wb25lbnRzIG9uIGFuIGVtYmVkZGVkIHRlbXBsYXRlOiAke2NvbXBvbmVudFR5cGVOYW1lcy5qb2luKCcsJyl9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW4pO1xuICAgIH1cbiAgICBlbGVtZW50UHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgIGBQcm9wZXJ0eSBiaW5kaW5nICR7cHJvcC5uYW1lfSBub3QgdXNlZCBieSBhbnkgZGlyZWN0aXZlIG9uIGFuIGVtYmVkZGVkIHRlbXBsYXRlYCxcbiAgICAgICAgICBzb3VyY2VTcGFuKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2VydEFsbEV2ZW50c1B1Ymxpc2hlZEJ5RGlyZWN0aXZlcyhkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50czogQm91bmRFdmVudEFzdFtdKSB7XG4gICAgdmFyIGFsbERpcmVjdGl2ZUV2ZW50cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGRpcmVjdGl2ZXMuZm9yRWFjaChkaXJlY3RpdmUgPT4ge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGRpcmVjdGl2ZS5kaXJlY3RpdmUub3V0cHV0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZXZlbnROYW1lOiBzdHJpbmcsIF8pID0+IHsgYWxsRGlyZWN0aXZlRXZlbnRzLmFkZChldmVudE5hbWUpOyB9KTtcbiAgICB9KTtcbiAgICBldmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KGV2ZW50LnRhcmdldCkgfHwgIVNldFdyYXBwZXIuaGFzKGFsbERpcmVjdGl2ZUV2ZW50cywgZXZlbnQubmFtZSkpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICBgRXZlbnQgYmluZGluZyAke2V2ZW50LmZ1bGxOYW1lfSBub3QgZW1pdHRlZCBieSBhbnkgZGlyZWN0aXZlIG9uIGFuIGVtYmVkZGVkIHRlbXBsYXRlYCxcbiAgICAgICAgICAgIGV2ZW50LnNvdXJjZVNwYW4pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmNsYXNzIE5vbkJpbmRhYmxlVmlzaXRvciBpbXBsZW1lbnRzIEh0bWxBc3RWaXNpdG9yIHtcbiAgdmlzaXRFbGVtZW50KGFzdDogSHRtbEVsZW1lbnRBc3QsIHBhcmVudDogRWxlbWVudENvbnRleHQpOiBFbGVtZW50QXN0IHtcbiAgICB2YXIgcHJlcGFyc2VkRWxlbWVudCA9IHByZXBhcnNlRWxlbWVudChhc3QpO1xuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNDUklQVCB8fFxuICAgICAgICBwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFIHx8XG4gICAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEVTSEVFVCkge1xuICAgICAgLy8gU2tpcHBpbmcgPHNjcmlwdD4gZm9yIHNlY3VyaXR5IHJlYXNvbnNcbiAgICAgIC8vIFNraXBwaW5nIDxzdHlsZT4gYW5kIHN0eWxlc2hlZXRzIGFzIHdlIGFscmVhZHkgcHJvY2Vzc2VkIHRoZW1cbiAgICAgIC8vIGluIHRoZSBTdHlsZUNvbXBpbGVyXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgYXR0ck5hbWVBbmRWYWx1ZXMgPSBhc3QuYXR0cnMubWFwKGF0dHJBc3QgPT4gW2F0dHJBc3QubmFtZSwgYXR0ckFzdC52YWx1ZV0pO1xuICAgIHZhciBzZWxlY3RvciA9IGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3Rvcihhc3QubmFtZSwgYXR0ck5hbWVBbmRWYWx1ZXMpO1xuICAgIHZhciBuZ0NvbnRlbnRJbmRleCA9IHBhcmVudC5maW5kTmdDb250ZW50SW5kZXgoc2VsZWN0b3IpO1xuICAgIHZhciBjaGlsZHJlbiA9IGh0bWxWaXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4sIEVNUFRZX0VMRU1FTlRfQ09OVEVYVCk7XG4gICAgcmV0dXJuIG5ldyBFbGVtZW50QXN0KGFzdC5uYW1lLCBodG1sVmlzaXRBbGwodGhpcywgYXN0LmF0dHJzKSwgW10sIFtdLCBbXSwgW10sIFtdLCBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4sIG5nQ29udGVudEluZGV4LCBhc3Quc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXRDb21tZW50KGFzdDogSHRtbENvbW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0QXR0cihhc3Q6IEh0bWxBdHRyQXN0LCBjb250ZXh0OiBhbnkpOiBBdHRyQXN0IHtcbiAgICByZXR1cm4gbmV3IEF0dHJBc3QoYXN0Lm5hbWUsIGFzdC52YWx1ZSwgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0VGV4dChhc3Q6IEh0bWxUZXh0QXN0LCBwYXJlbnQ6IEVsZW1lbnRDb250ZXh0KTogVGV4dEFzdCB7XG4gICAgdmFyIG5nQ29udGVudEluZGV4ID0gcGFyZW50LmZpbmROZ0NvbnRlbnRJbmRleChURVhUX0NTU19TRUxFQ1RPUik7XG4gICAgcmV0dXJuIG5ldyBUZXh0QXN0KGFzdC52YWx1ZSwgbmdDb250ZW50SW5kZXgsIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdEV4cGFuc2lvbihhc3Q6IEh0bWxFeHBhbnNpb25Bc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cbiAgdmlzaXRFeHBhbnNpb25DYXNlKGFzdDogSHRtbEV4cGFuc2lvbkNhc2VBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cbn1cblxuY2xhc3MgQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBleHByZXNzaW9uOiBBU1QsIHB1YmxpYyBpc0xpdGVyYWw6IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG59XG5cbmNsYXNzIEVsZW1lbnRPckRpcmVjdGl2ZVJlZiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB2YWx1ZTogc3RyaW5nLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3BsaXRDbGFzc2VzKGNsYXNzQXR0clZhbHVlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIHJldHVybiBTdHJpbmdXcmFwcGVyLnNwbGl0KGNsYXNzQXR0clZhbHVlLnRyaW0oKSwgL1xccysvZyk7XG59XG5cbmNsYXNzIEVsZW1lbnRDb250ZXh0IHtcbiAgc3RhdGljIGNyZWF0ZShpc1RlbXBsYXRlRWxlbWVudDogYm9vbGVhbiwgZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10sXG4gICAgICAgICAgICAgICAgcHJvdmlkZXJDb250ZXh0OiBQcm92aWRlckVsZW1lbnRDb250ZXh0KTogRWxlbWVudENvbnRleHQge1xuICAgIHZhciBtYXRjaGVyID0gbmV3IFNlbGVjdG9yTWF0Y2hlcigpO1xuICAgIHZhciB3aWxkY2FyZE5nQ29udGVudEluZGV4ID0gbnVsbDtcbiAgICB2YXIgY29tcG9uZW50ID0gZGlyZWN0aXZlcy5maW5kKGRpcmVjdGl2ZSA9PiBkaXJlY3RpdmUuZGlyZWN0aXZlLmlzQ29tcG9uZW50KTtcbiAgICBpZiAoaXNQcmVzZW50KGNvbXBvbmVudCkpIHtcbiAgICAgIHZhciBuZ0NvbnRlbnRTZWxlY3RvcnMgPSBjb21wb25lbnQuZGlyZWN0aXZlLnRlbXBsYXRlLm5nQ29udGVudFNlbGVjdG9ycztcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzZWxlY3RvciA9IG5nQ29udGVudFNlbGVjdG9yc1tpXTtcbiAgICAgICAgaWYgKFN0cmluZ1dyYXBwZXIuZXF1YWxzKHNlbGVjdG9yLCAnKicpKSB7XG4gICAgICAgICAgd2lsZGNhcmROZ0NvbnRlbnRJbmRleCA9IGk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0Y2hlci5hZGRTZWxlY3RhYmxlcyhDc3NTZWxlY3Rvci5wYXJzZShuZ0NvbnRlbnRTZWxlY3RvcnNbaV0pLCBpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IEVsZW1lbnRDb250ZXh0KGlzVGVtcGxhdGVFbGVtZW50LCBtYXRjaGVyLCB3aWxkY2FyZE5nQ29udGVudEluZGV4LCBwcm92aWRlckNvbnRleHQpO1xuICB9XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpc1RlbXBsYXRlRWxlbWVudDogYm9vbGVhbiwgcHJpdmF0ZSBfbmdDb250ZW50SW5kZXhNYXRjaGVyOiBTZWxlY3Rvck1hdGNoZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3dpbGRjYXJkTmdDb250ZW50SW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgcHVibGljIHByb3ZpZGVyQ29udGV4dDogUHJvdmlkZXJFbGVtZW50Q29udGV4dCkge31cblxuICBmaW5kTmdDb250ZW50SW5kZXgoc2VsZWN0b3I6IENzc1NlbGVjdG9yKTogbnVtYmVyIHtcbiAgICB2YXIgbmdDb250ZW50SW5kaWNlcyA9IFtdO1xuICAgIHRoaXMuX25nQ29udGVudEluZGV4TWF0Y2hlci5tYXRjaChcbiAgICAgICAgc2VsZWN0b3IsIChzZWxlY3RvciwgbmdDb250ZW50SW5kZXgpID0+IHsgbmdDb250ZW50SW5kaWNlcy5wdXNoKG5nQ29udGVudEluZGV4KTsgfSk7XG4gICAgTGlzdFdyYXBwZXIuc29ydChuZ0NvbnRlbnRJbmRpY2VzKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3dpbGRjYXJkTmdDb250ZW50SW5kZXgpKSB7XG4gICAgICBuZ0NvbnRlbnRJbmRpY2VzLnB1c2godGhpcy5fd2lsZGNhcmROZ0NvbnRlbnRJbmRleCk7XG4gICAgfVxuICAgIHJldHVybiBuZ0NvbnRlbnRJbmRpY2VzLmxlbmd0aCA+IDAgPyBuZ0NvbnRlbnRJbmRpY2VzWzBdIDogbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50Q3NzU2VsZWN0b3IoZWxlbWVudE5hbWU6IHN0cmluZywgbWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10pOiBDc3NTZWxlY3RvciB7XG4gIHZhciBjc3NTZWxlY3RvciA9IG5ldyBDc3NTZWxlY3RvcigpO1xuICBsZXQgZWxOYW1lTm9OcyA9IHNwbGl0TnNOYW1lKGVsZW1lbnROYW1lKVsxXTtcblxuICBjc3NTZWxlY3Rvci5zZXRFbGVtZW50KGVsTmFtZU5vTnMpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbWF0Y2hhYmxlQXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgYXR0ck5hbWUgPSBtYXRjaGFibGVBdHRyc1tpXVswXTtcbiAgICBsZXQgYXR0ck5hbWVOb05zID0gc3BsaXROc05hbWUoYXR0ck5hbWUpWzFdO1xuICAgIGxldCBhdHRyVmFsdWUgPSBtYXRjaGFibGVBdHRyc1tpXVsxXTtcblxuICAgIGNzc1NlbGVjdG9yLmFkZEF0dHJpYnV0ZShhdHRyTmFtZU5vTnMsIGF0dHJWYWx1ZSk7XG4gICAgaWYgKGF0dHJOYW1lLnRvTG93ZXJDYXNlKCkgPT0gQ0xBU1NfQVRUUikge1xuICAgICAgdmFyIGNsYXNzZXMgPSBzcGxpdENsYXNzZXMoYXR0clZhbHVlKTtcbiAgICAgIGNsYXNzZXMuZm9yRWFjaChjbGFzc05hbWUgPT4gY3NzU2VsZWN0b3IuYWRkQ2xhc3NOYW1lKGNsYXNzTmFtZSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY3NzU2VsZWN0b3I7XG59XG5cbnZhciBFTVBUWV9FTEVNRU5UX0NPTlRFWFQgPSBuZXcgRWxlbWVudENvbnRleHQodHJ1ZSwgbmV3IFNlbGVjdG9yTWF0Y2hlcigpLCBudWxsLCBudWxsKTtcbnZhciBOT05fQklOREFCTEVfVklTSVRPUiA9IG5ldyBOb25CaW5kYWJsZVZpc2l0b3IoKTtcblxuXG5leHBvcnQgY2xhc3MgUGlwZUNvbGxlY3RvciBleHRlbmRzIFJlY3Vyc2l2ZUFzdFZpc2l0b3Ige1xuICBwaXBlczogU2V0PHN0cmluZz4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgdmlzaXRQaXBlKGFzdDogQmluZGluZ1BpcGUsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy5waXBlcy5hZGQoYXN0Lm5hbWUpO1xuICAgIGFzdC5leHAudmlzaXQodGhpcyk7XG4gICAgdGhpcy52aXNpdEFsbChhc3QuYXJncywgY29udGV4dCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlRHVwbGljYXRlcyhpdGVtczogQ29tcGlsZU1ldGFkYXRhV2l0aFR5cGVbXSk6IENvbXBpbGVNZXRhZGF0YVdpdGhUeXBlW10ge1xuICBsZXQgcmVzID0gW107XG4gIGl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgbGV0IGhhc01hdGNoID1cbiAgICAgICAgcmVzLmZpbHRlcihyID0+IHIudHlwZS5uYW1lID09IGl0ZW0udHlwZS5uYW1lICYmIHIudHlwZS5tb2R1bGVVcmwgPT0gaXRlbS50eXBlLm1vZHVsZVVybCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgci50eXBlLnJ1bnRpbWUgPT0gaXRlbS50eXBlLnJ1bnRpbWUpXG4gICAgICAgICAgICAubGVuZ3RoID4gMDtcbiAgICBpZiAoIWhhc01hdGNoKSB7XG4gICAgICByZXMucHVzaChpdGVtKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzO1xufVxuIl19