var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Parser } from 'angular2/src/core/change_detection/change_detection';
import { HtmlParser } from './html_parser';
import { splitHtmlTagNamespace } from './html_tags';
import { ParseError } from './parse_util';
import { ElementAst, BoundElementPropertyAst, BoundEventAst, VariableAst, templateVisitAll, TextAst, BoundTextAst, EmbeddedTemplateAst, AttrAst, NgContentAst, PropertyBindingType, DirectiveAst, BoundDirectivePropertyAst } from './template_ast';
import { CssSelector, SelectorMatcher } from 'angular2/src/compiler/selector';
import { ElementSchemaRegistry } from 'angular2/src/compiler/schema/element_schema_registry';
import { preparseElement, PreparsedElementType } from './template_preparser';
import { isStyleUrlResolvable } from './style_url_resolver';
import { htmlVisitAll } from './html_ast';
import { dashCaseToCamelCase, camelCaseToDashCase, splitAtColon } from './util';
// Group 1 = "bind-"
// Group 2 = "var-" or "#"
// Group 3 = "on-"
// Group 4 = "bindon-"
// Group 5 = the identifier after "bind-", "var-/#", or "on-"
// Group 6 = idenitifer inside [()]
// Group 7 = idenitifer inside []
// Group 8 = identifier inside ()
var BIND_NAME_REGEXP = /^(?:(?:(?:(bind-)|(var-|#)|(on-)|(bindon-))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/ig;
const TEMPLATE_ELEMENT = 'template';
const TEMPLATE_ATTR = 'template';
const TEMPLATE_ATTR_PREFIX = '*';
const CLASS_ATTR = 'class';
var PROPERTY_PARTS_SEPARATOR = '.';
const ATTRIBUTE_PREFIX = 'attr';
const CLASS_PREFIX = 'class';
const STYLE_PREFIX = 'style';
var TEXT_CSS_SELECTOR = CssSelector.parse('*')[0];
export const TEMPLATE_TRANSFORMS = CONST_EXPR(new OpaqueToken('TemplateTransforms'));
export class TemplateParseError extends ParseError {
    constructor(message, location) {
        super(location, message);
    }
}
export let TemplateParser = class {
    constructor(_exprParser, _schemaRegistry, _htmlParser, transforms) {
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this._htmlParser = _htmlParser;
        this.transforms = transforms;
    }
    parse(template, directives, templateUrl) {
        var parseVisitor = new TemplateParseVisitor(directives, this._exprParser, this._schemaRegistry);
        var htmlAstWithErrors = this._htmlParser.parse(template, templateUrl);
        var result = htmlVisitAll(parseVisitor, htmlAstWithErrors.rootNodes, EMPTY_COMPONENT);
        var errors = htmlAstWithErrors.errors.concat(parseVisitor.errors);
        if (errors.length > 0) {
            var errorString = errors.join('\n');
            throw new BaseException(`Template parse errors:\n${errorString}`);
        }
        if (isPresent(this.transforms)) {
            this.transforms.forEach((transform) => { result = templateVisitAll(transform, result); });
        }
        return result;
    }
};
TemplateParser = __decorate([
    Injectable(),
    __param(3, Optional()),
    __param(3, Inject(TEMPLATE_TRANSFORMS)), 
    __metadata('design:paramtypes', [Parser, ElementSchemaRegistry, HtmlParser, Array])
], TemplateParser);
class TemplateParseVisitor {
    constructor(directives, _exprParser, _schemaRegistry) {
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
    }
    _reportError(message, sourceSpan) {
        this.errors.push(new TemplateParseError(message, sourceSpan.start));
    }
    _parseInterpolation(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            return this._exprParser.parseInterpolation(value, sourceInfo);
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseAction(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            return this._exprParser.parseAction(value, sourceInfo);
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseBinding(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            return this._exprParser.parseBinding(value, sourceInfo);
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseTemplateBindings(value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            return this._exprParser.parseTemplateBindings(value, sourceInfo);
        }
        catch (e) {
            this._reportError(`${e}`, sourceSpan);
            return [];
        }
    }
    visitText(ast, component) {
        var ngContentIndex = component.findNgContentIndex(TEXT_CSS_SELECTOR);
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
    visitElement(element, component) {
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
        var vars = [];
        var events = [];
        var templateElementOrDirectiveProps = [];
        var templateVars = [];
        var templateMatchableAttrs = [];
        var hasInlineTemplates = false;
        var attrs = [];
        element.attrs.forEach(attr => {
            matchableAttrs.push([attr.name, attr.value]);
            var hasBinding = this._parseAttr(attr, matchableAttrs, elementOrDirectiveProps, events, vars);
            var hasTemplateBinding = this._parseInlineTemplateBinding(attr, templateMatchableAttrs, templateElementOrDirectiveProps, templateVars);
            if (!hasBinding && !hasTemplateBinding) {
                // don't include the bindings as attributes as well in the AST
                attrs.push(this.visitAttr(attr, null));
            }
            if (hasTemplateBinding) {
                hasInlineTemplates = true;
            }
        });
        var lcElName = splitHtmlTagNamespace(nodeName.toLowerCase())[1];
        var isTemplateElement = lcElName == TEMPLATE_ELEMENT;
        var elementCssSelector = createElementCssSelector(nodeName, matchableAttrs);
        var directives = this._createDirectiveAsts(element.name, this._parseDirectives(this.selectorMatcher, elementCssSelector), elementOrDirectiveProps, isTemplateElement ? [] : vars, element.sourceSpan);
        var elementProps = this._createElementPropertyAsts(element.name, elementOrDirectiveProps, directives);
        var children = htmlVisitAll(preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children, Component.create(directives));
        var elementNgContentIndex = hasInlineTemplates ? null : component.findNgContentIndex(elementCssSelector);
        var parsedElement;
        if (preparsedElement.type === PreparsedElementType.NG_CONTENT) {
            if (isPresent(element.children) && element.children.length > 0) {
                this._reportError(`<ng-content> element cannot have content. <ng-content> must be immediately followed by </ng-content>`, element.sourceSpan);
            }
            parsedElement =
                new NgContentAst(this.ngContentCount++, elementNgContentIndex, element.sourceSpan);
        }
        else if (isTemplateElement) {
            this._assertAllEventsPublishedByDirectives(directives, events);
            this._assertNoComponentsNorElementBindingsOnTemplate(directives, elementProps, element.sourceSpan);
            parsedElement = new EmbeddedTemplateAst(attrs, events, vars, directives, children, elementNgContentIndex, element.sourceSpan);
        }
        else {
            this._assertOnlyOneComponent(directives, element.sourceSpan);
            var elementExportAsVars = vars.filter(varAst => varAst.value.length === 0);
            parsedElement =
                new ElementAst(nodeName, attrs, elementProps, events, elementExportAsVars, directives, children, elementNgContentIndex, element.sourceSpan);
        }
        if (hasInlineTemplates) {
            var templateCssSelector = createElementCssSelector(TEMPLATE_ELEMENT, templateMatchableAttrs);
            var templateDirectives = this._createDirectiveAsts(element.name, this._parseDirectives(this.selectorMatcher, templateCssSelector), templateElementOrDirectiveProps, [], element.sourceSpan);
            var templateElementProps = this._createElementPropertyAsts(element.name, templateElementOrDirectiveProps, templateDirectives);
            this._assertNoComponentsNorElementBindingsOnTemplate(templateDirectives, templateElementProps, element.sourceSpan);
            parsedElement = new EmbeddedTemplateAst([], [], templateVars, templateDirectives, [parsedElement], component.findNgContentIndex(templateCssSelector), element.sourceSpan);
        }
        return parsedElement;
    }
    _parseInlineTemplateBinding(attr, targetMatchableAttrs, targetProps, targetVars) {
        var templateBindingsSource = null;
        if (attr.name.toLowerCase() == TEMPLATE_ATTR) {
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
                var dashCaseKey = camelCaseToDashCase(binding.key);
                if (binding.keyIsVar) {
                    targetVars.push(new VariableAst(dashCaseToCamelCase(binding.key), binding.name, attr.sourceSpan));
                    targetMatchableAttrs.push([dashCaseKey, binding.name]);
                }
                else if (isPresent(binding.expression)) {
                    this._parsePropertyAst(dashCaseKey, binding.expression, attr.sourceSpan, targetMatchableAttrs, targetProps);
                }
                else {
                    targetMatchableAttrs.push([dashCaseKey, '']);
                    this._parseLiteralAttr(dashCaseKey, null, attr.sourceSpan, targetProps);
                }
            }
            return true;
        }
        return false;
    }
    _parseAttr(attr, targetMatchableAttrs, targetProps, targetEvents, targetVars) {
        var attrName = this._normalizeAttributeName(attr.name);
        var attrValue = attr.value;
        var bindParts = RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
        var hasBinding = false;
        if (isPresent(bindParts)) {
            hasBinding = true;
            if (isPresent(bindParts[1])) {
                this._parseProperty(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
            }
            else if (isPresent(bindParts[2])) {
                var identifier = bindParts[5];
                this._parseVariable(identifier, attrValue, attr.sourceSpan, targetVars);
            }
            else if (isPresent(bindParts[3])) {
                this._parseEvent(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[4])) {
                this._parseProperty(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[6])) {
                this._parseProperty(bindParts[6], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[6], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[7])) {
                this._parseProperty(bindParts[7], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
            }
            else if (isPresent(bindParts[8])) {
                this._parseEvent(bindParts[8], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
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
        targetVars.push(new VariableAst(dashCaseToCamelCase(identifier), value, sourceSpan));
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
        this._parseEvent(`${name}-change`, `${expression}=$event`, sourceSpan, targetMatchableAttrs, targetEvents);
    }
    _parseEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents) {
        // long format: 'target: eventName'
        var parts = splitAtColon(name, [null, name]);
        var target = parts[0];
        var eventName = parts[1];
        targetEvents.push(new BoundEventAst(dashCaseToCamelCase(eventName), target, this._parseAction(expression, sourceSpan), sourceSpan));
        // Don't detect directives for event names for now,
        // so don't add the event name to the matchableAttrs
    }
    _parseLiteralAttr(name, value, sourceSpan, targetProps) {
        targetProps.push(new BoundElementOrDirectiveProperty(dashCaseToCamelCase(name), this._exprParser.wrapLiteralPrimitive(value, ''), true, sourceSpan));
    }
    _parseDirectives(selectorMatcher, elementCssSelector) {
        var directives = [];
        selectorMatcher.match(elementCssSelector, (selector, directive) => { directives.push(directive); });
        // Need to sort the directives so that we get consistent results throughout,
        // as selectorMatcher uses Maps inside.
        // Also need to make components the first directive in the array
        ListWrapper.sort(directives, (dir1, dir2) => {
            var dir1Comp = dir1.isComponent;
            var dir2Comp = dir2.isComponent;
            if (dir1Comp && !dir2Comp) {
                return -1;
            }
            else if (!dir1Comp && dir2Comp) {
                return 1;
            }
            else {
                return this.directivesIndex.get(dir1) - this.directivesIndex.get(dir2);
            }
        });
        return directives;
    }
    _createDirectiveAsts(elementName, directives, props, possibleExportAsVars, sourceSpan) {
        var matchedVariables = new Set();
        var directiveAsts = directives.map((directive) => {
            var hostProperties = [];
            var hostEvents = [];
            var directiveProperties = [];
            this._createDirectiveHostPropertyAsts(elementName, directive.hostProperties, sourceSpan, hostProperties);
            this._createDirectiveHostEventAsts(directive.hostListeners, sourceSpan, hostEvents);
            this._createDirectivePropertyAsts(directive.inputs, props, directiveProperties);
            var exportAsVars = [];
            possibleExportAsVars.forEach((varAst) => {
                if ((varAst.value.length === 0 && directive.isComponent) ||
                    (directive.exportAs == varAst.value)) {
                    exportAsVars.push(varAst);
                    matchedVariables.add(varAst.name);
                }
            });
            return new DirectiveAst(directive, directiveProperties, hostProperties, hostEvents, exportAsVars, sourceSpan);
        });
        possibleExportAsVars.forEach((varAst) => {
            if (varAst.value.length > 0 && !SetWrapper.has(matchedVariables, varAst.name)) {
                this._reportError(`There is no directive with "exportAs" set to "${varAst.value}"`, varAst.sourceSpan);
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
                var key = dashCaseToCamelCase(boundProp.name);
                var prevValue = boundPropsByName.get(boundProp.name);
                if (isBlank(prevValue) || prevValue.isLiteral) {
                    // give [a]="b" a higher precedence thatn a="b" on the same element
                    boundPropsByName.set(key, boundProp);
                }
            });
            StringMapWrapper.forEach(directiveProperties, (elProp, dirProp) => {
                elProp = dashCaseToCamelCase(elProp);
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
            boundPropertyName = this._schemaRegistry.getMappedPropName(dashCaseToCamelCase(parts[0]));
            bindingType = PropertyBindingType.Property;
            if (!this._schemaRegistry.hasProperty(elementName, boundPropertyName)) {
                this._reportError(`Can't bind to '${boundPropertyName}' since it isn't a known native property`, sourceSpan);
            }
        }
        else {
            let lcPrefix = parts[0].toLowerCase();
            if (lcPrefix == ATTRIBUTE_PREFIX) {
                boundPropertyName = dashCaseToCamelCase(parts[1]);
                bindingType = PropertyBindingType.Attribute;
            }
            else if (lcPrefix == CLASS_PREFIX) {
                // keep original case!
                boundPropertyName = parts[1];
                bindingType = PropertyBindingType.Class;
            }
            else if (lcPrefix == STYLE_PREFIX) {
                unit = parts.length > 2 ? parts[2] : null;
                boundPropertyName = dashCaseToCamelCase(parts[1]);
                bindingType = PropertyBindingType.Style;
            }
            else {
                this._reportError(`Invalid property name ${name}`, sourceSpan);
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
    visitElement(ast, component) {
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
        var ngContentIndex = component.findNgContentIndex(selector);
        var children = htmlVisitAll(this, ast.children, EMPTY_COMPONENT);
        return new ElementAst(ast.name, htmlVisitAll(this, ast.attrs), [], [], [], [], children, ngContentIndex, ast.sourceSpan);
    }
    visitAttr(ast, context) {
        return new AttrAst(ast.name, ast.value, ast.sourceSpan);
    }
    visitText(ast, component) {
        var ngContentIndex = component.findNgContentIndex(TEXT_CSS_SELECTOR);
        return new TextAst(ast.value, ngContentIndex, ast.sourceSpan);
    }
}
class BoundElementOrDirectiveProperty {
    constructor(name, expression, isLiteral, sourceSpan) {
        this.name = name;
        this.expression = expression;
        this.isLiteral = isLiteral;
        this.sourceSpan = sourceSpan;
    }
}
export function splitClasses(classAttrValue) {
    return StringWrapper.split(classAttrValue.trim(), /\s+/g);
}
class Component {
    constructor(ngContentIndexMatcher, wildcardNgContentIndex) {
        this.ngContentIndexMatcher = ngContentIndexMatcher;
        this.wildcardNgContentIndex = wildcardNgContentIndex;
    }
    static create(directives) {
        if (directives.length === 0 || !directives[0].directive.isComponent) {
            return EMPTY_COMPONENT;
        }
        var matcher = new SelectorMatcher();
        var ngContentSelectors = directives[0].directive.template.ngContentSelectors;
        var wildcardNgContentIndex = null;
        for (var i = 0; i < ngContentSelectors.length; i++) {
            var selector = ngContentSelectors[i];
            if (StringWrapper.equals(selector, '*')) {
                wildcardNgContentIndex = i;
            }
            else {
                matcher.addSelectables(CssSelector.parse(ngContentSelectors[i]), i);
            }
        }
        return new Component(matcher, wildcardNgContentIndex);
    }
    findNgContentIndex(selector) {
        var ngContentIndices = [];
        this.ngContentIndexMatcher.match(selector, (selector, ngContentIndex) => { ngContentIndices.push(ngContentIndex); });
        ListWrapper.sort(ngContentIndices);
        if (isPresent(this.wildcardNgContentIndex)) {
            ngContentIndices.push(this.wildcardNgContentIndex);
        }
        return ngContentIndices.length > 0 ? ngContentIndices[0] : null;
    }
}
function createElementCssSelector(elementName, matchableAttrs) {
    var cssSelector = new CssSelector();
    cssSelector.setElement(elementName);
    for (var i = 0; i < matchableAttrs.length; i++) {
        var attrName = matchableAttrs[i][0].toLowerCase();
        var attrValue = matchableAttrs[i][1];
        cssSelector.addAttribute(attrName, attrValue);
        if (attrName == CLASS_ATTR) {
            var classes = splitClasses(attrValue);
            classes.forEach(className => cssSelector.addClassName(className));
        }
    }
    return cssSelector;
}
var EMPTY_COMPONENT = new Component(new SelectorMatcher(), null);
var NON_BINDABLE_VISITOR = new NonBindableVisitor();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3RlbXBsYXRlX3BhcnNlci50cyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVBhcnNlRXJyb3IiLCJUZW1wbGF0ZVBhcnNlRXJyb3IuY29uc3RydWN0b3IiLCJUZW1wbGF0ZVBhcnNlciIsIlRlbXBsYXRlUGFyc2VyLmNvbnN0cnVjdG9yIiwiVGVtcGxhdGVQYXJzZXIucGFyc2UiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvciIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLmNvbnN0cnVjdG9yIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3JlcG9ydEVycm9yIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3BhcnNlSW50ZXJwb2xhdGlvbiIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9wYXJzZUFjdGlvbiIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9wYXJzZUJpbmRpbmciLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VUZW1wbGF0ZUJpbmRpbmdzIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IudmlzaXRUZXh0IiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IudmlzaXRBdHRyIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IudmlzaXRFbGVtZW50IiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3BhcnNlSW5saW5lVGVtcGxhdGVCaW5kaW5nIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3BhcnNlQXR0ciIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9ub3JtYWxpemVBdHRyaWJ1dGVOYW1lIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3BhcnNlVmFyaWFibGUiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VQcm9wZXJ0eSIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9wYXJzZVByb3BlcnR5SW50ZXJwb2xhdGlvbiIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9wYXJzZVByb3BlcnR5QXN0IiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3BhcnNlQXNzaWdubWVudEV2ZW50IiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3BhcnNlRXZlbnQiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VMaXRlcmFsQXR0ciIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9wYXJzZURpcmVjdGl2ZXMiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fY3JlYXRlRGlyZWN0aXZlQXN0cyIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9jcmVhdGVEaXJlY3RpdmVIb3N0UHJvcGVydHlBc3RzIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX2NyZWF0ZURpcmVjdGl2ZUhvc3RFdmVudEFzdHMiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fY3JlYXRlRGlyZWN0aXZlUHJvcGVydHlBc3RzIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX2NyZWF0ZUVsZW1lbnRQcm9wZXJ0eUFzdHMiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0IiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX2ZpbmRDb21wb25lbnREaXJlY3RpdmVOYW1lcyIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9hc3NlcnRPbmx5T25lQ29tcG9uZW50IiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX2Fzc2VydE5vQ29tcG9uZW50c05vckVsZW1lbnRCaW5kaW5nc09uVGVtcGxhdGUiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fYXNzZXJ0QWxsRXZlbnRzUHVibGlzaGVkQnlEaXJlY3RpdmVzIiwiTm9uQmluZGFibGVWaXNpdG9yIiwiTm9uQmluZGFibGVWaXNpdG9yLnZpc2l0RWxlbWVudCIsIk5vbkJpbmRhYmxlVmlzaXRvci52aXNpdEF0dHIiLCJOb25CaW5kYWJsZVZpc2l0b3IudmlzaXRUZXh0IiwiQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eSIsIkJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHkuY29uc3RydWN0b3IiLCJzcGxpdENsYXNzZXMiLCJDb21wb25lbnQiLCJDb21wb25lbnQuY29uc3RydWN0b3IiLCJDb21wb25lbnQuY3JlYXRlIiwiQ29tcG9uZW50LmZpbmROZ0NvbnRlbnRJbmRleCIsImNyZWF0ZUVsZW1lbnRDc3NTZWxlY3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDakYsRUFBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUMsTUFBTSwwQkFBMEI7T0FDbEYsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlO09BQ2hFLEVBQUMsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO09BQzVDLEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JELEVBQUMsTUFBTSxFQUFxQixNQUFNLHFEQUFxRDtPQUd2RixFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWU7T0FDakMsRUFBQyxxQkFBcUIsRUFBQyxNQUFNLGFBQWE7T0FDMUMsRUFBa0IsVUFBVSxFQUFnQixNQUFNLGNBQWM7T0FHaEUsRUFDTCxVQUFVLEVBQ1YsdUJBQXVCLEVBQ3ZCLGFBQWEsRUFDYixXQUFXLEVBR1gsZ0JBQWdCLEVBQ2hCLE9BQU8sRUFDUCxZQUFZLEVBQ1osbUJBQW1CLEVBQ25CLE9BQU8sRUFDUCxZQUFZLEVBQ1osbUJBQW1CLEVBQ25CLFlBQVksRUFDWix5QkFBeUIsRUFDMUIsTUFBTSxnQkFBZ0I7T0FDaEIsRUFBQyxXQUFXLEVBQUUsZUFBZSxFQUFDLE1BQU0sZ0NBQWdDO09BRXBFLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxzREFBc0Q7T0FDbkYsRUFBQyxlQUFlLEVBQW9CLG9CQUFvQixFQUFDLE1BQU0sc0JBQXNCO09BRXJGLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxzQkFBc0I7T0FFbEQsRUFNTCxZQUFZLEVBQ2IsTUFBTSxZQUFZO09BRVosRUFBQyxtQkFBbUIs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QSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxjQUFjQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtRQUMvQ0EsSUFBSUEsUUFBUUEsR0FBR0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDbERBLElBQUlBLFNBQVNBLEdBQUdBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3JDQSxXQUFXQSxDQUFDQSxZQUFZQSxDQUFDQSxRQUFRQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUM5Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsSUFBSUEsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLElBQUlBLE9BQU9BLEdBQUdBLFlBQVlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBQ3RDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxTQUFTQSxJQUFJQSxXQUFXQSxDQUFDQSxZQUFZQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNwRUEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFDREEsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7QUFDckJBLENBQUNBO0FBRUQsSUFBSSxlQUFlLEdBQUcsSUFBSSxTQUFTLENBQUMsSUFBSSxlQUFlLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqRSxJQUFJLG9CQUFvQixHQUFHLElBQUksa0JBQWtCLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXIsIFNldFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1JlZ0V4cFdyYXBwZXIsIGlzUHJlc2VudCwgU3RyaW5nV3JhcHBlciwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0LCBPcGFxdWVUb2tlbiwgT3B0aW9uYWx9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtQYXJzZXIsIEFTVCwgQVNUV2l0aFNvdXJjZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7VGVtcGxhdGVCaW5kaW5nfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL3BhcnNlci9hc3QnO1xuaW1wb3J0IHtDb21waWxlRGlyZWN0aXZlTWV0YWRhdGF9IGZyb20gJy4vZGlyZWN0aXZlX21ldGFkYXRhJztcbmltcG9ydCB7SHRtbFBhcnNlcn0gZnJvbSAnLi9odG1sX3BhcnNlcic7XG5pbXBvcnQge3NwbGl0SHRtbFRhZ05hbWVzcGFjZX0gZnJvbSAnLi9odG1sX3RhZ3MnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW4sIFBhcnNlRXJyb3IsIFBhcnNlTG9jYXRpb259IGZyb20gJy4vcGFyc2VfdXRpbCc7XG5cblxuaW1wb3J0IHtcbiAgRWxlbWVudEFzdCxcbiAgQm91bmRFbGVtZW50UHJvcGVydHlBc3QsXG4gIEJvdW5kRXZlbnRBc3QsXG4gIFZhcmlhYmxlQXN0LFxuICBUZW1wbGF0ZUFzdCxcbiAgVGVtcGxhdGVBc3RWaXNpdG9yLFxuICB0ZW1wbGF0ZVZpc2l0QWxsLFxuICBUZXh0QXN0LFxuICBCb3VuZFRleHRBc3QsXG4gIEVtYmVkZGVkVGVtcGxhdGVBc3QsXG4gIEF0dHJBc3QsXG4gIE5nQ29udGVudEFzdCxcbiAgUHJvcGVydHlCaW5kaW5nVHlwZSxcbiAgRGlyZWN0aXZlQXN0LFxuICBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0XG59IGZyb20gJy4vdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7Q3NzU2VsZWN0b3IsIFNlbGVjdG9yTWF0Y2hlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NlbGVjdG9yJztcblxuaW1wb3J0IHtFbGVtZW50U2NoZW1hUmVnaXN0cnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9zY2hlbWEvZWxlbWVudF9zY2hlbWFfcmVnaXN0cnknO1xuaW1wb3J0IHtwcmVwYXJzZUVsZW1lbnQsIFByZXBhcnNlZEVsZW1lbnQsIFByZXBhcnNlZEVsZW1lbnRUeXBlfSBmcm9tICcuL3RlbXBsYXRlX3ByZXBhcnNlcic7XG5cbmltcG9ydCB7aXNTdHlsZVVybFJlc29sdmFibGV9IGZyb20gJy4vc3R5bGVfdXJsX3Jlc29sdmVyJztcblxuaW1wb3J0IHtcbiAgSHRtbEFzdFZpc2l0b3IsXG4gIEh0bWxBc3QsXG4gIEh0bWxFbGVtZW50QXN0LFxuICBIdG1sQXR0ckFzdCxcbiAgSHRtbFRleHRBc3QsXG4gIGh0bWxWaXNpdEFsbFxufSBmcm9tICcuL2h0bWxfYXN0JztcblxuaW1wb3J0IHtkYXNoQ2FzZVRvQ2FtZWxDYXNlLCBjYW1lbENhc2VUb0Rhc2hDYXNlLCBzcGxpdEF0Q29sb259IGZyb20gJy4vdXRpbCc7XG5cbi8vIEdyb3VwIDEgPSBcImJpbmQtXCJcbi8vIEdyb3VwIDIgPSBcInZhci1cIiBvciBcIiNcIlxuLy8gR3JvdXAgMyA9IFwib24tXCJcbi8vIEdyb3VwIDQgPSBcImJpbmRvbi1cIlxuLy8gR3JvdXAgNSA9IHRoZSBpZGVudGlmaWVyIGFmdGVyIFwiYmluZC1cIiwgXCJ2YXItLyNcIiwgb3IgXCJvbi1cIlxuLy8gR3JvdXAgNiA9IGlkZW5pdGlmZXIgaW5zaWRlIFsoKV1cbi8vIEdyb3VwIDcgPSBpZGVuaXRpZmVyIGluc2lkZSBbXVxuLy8gR3JvdXAgOCA9IGlkZW50aWZpZXIgaW5zaWRlICgpXG52YXIgQklORF9OQU1FX1JFR0VYUCA9XG4gICAgL14oPzooPzooPzooYmluZC0pfCh2YXItfCMpfChvbi0pfChiaW5kb24tKSkoLispKXxcXFtcXCgoW15cXCldKylcXClcXF18XFxbKFteXFxdXSspXFxdfFxcKChbXlxcKV0rKVxcKSkkL2lnO1xuXG5jb25zdCBURU1QTEFURV9FTEVNRU5UID0gJ3RlbXBsYXRlJztcbmNvbnN0IFRFTVBMQVRFX0FUVFIgPSAndGVtcGxhdGUnO1xuY29uc3QgVEVNUExBVEVfQVRUUl9QUkVGSVggPSAnKic7XG5jb25zdCBDTEFTU19BVFRSID0gJ2NsYXNzJztcblxudmFyIFBST1BFUlRZX1BBUlRTX1NFUEFSQVRPUiA9ICcuJztcbmNvbnN0IEFUVFJJQlVURV9QUkVGSVggPSAnYXR0cic7XG5jb25zdCBDTEFTU19QUkVGSVggPSAnY2xhc3MnO1xuY29uc3QgU1RZTEVfUFJFRklYID0gJ3N0eWxlJztcblxudmFyIFRFWFRfQ1NTX1NFTEVDVE9SID0gQ3NzU2VsZWN0b3IucGFyc2UoJyonKVswXTtcblxuZXhwb3J0IGNvbnN0IFRFTVBMQVRFX1RSQU5TRk9STVMgPSBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbignVGVtcGxhdGVUcmFuc2Zvcm1zJykpO1xuXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVQYXJzZUVycm9yIGV4dGVuZHMgUGFyc2VFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgbG9jYXRpb246IFBhcnNlTG9jYXRpb24pIHsgc3VwZXIobG9jYXRpb24sIG1lc3NhZ2UpOyB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVBhcnNlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2V4cHJQYXJzZXI6IFBhcnNlciwgcHJpdmF0ZSBfc2NoZW1hUmVnaXN0cnk6IEVsZW1lbnRTY2hlbWFSZWdpc3RyeSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfaHRtbFBhcnNlcjogSHRtbFBhcnNlcixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChURU1QTEFURV9UUkFOU0ZPUk1TKSBwdWJsaWMgdHJhbnNmb3JtczogVGVtcGxhdGVBc3RWaXNpdG9yW10pIHt9XG5cbiAgcGFyc2UodGVtcGxhdGU6IHN0cmluZywgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sXG4gICAgICAgIHRlbXBsYXRlVXJsOiBzdHJpbmcpOiBUZW1wbGF0ZUFzdFtdIHtcbiAgICB2YXIgcGFyc2VWaXNpdG9yID0gbmV3IFRlbXBsYXRlUGFyc2VWaXNpdG9yKGRpcmVjdGl2ZXMsIHRoaXMuX2V4cHJQYXJzZXIsIHRoaXMuX3NjaGVtYVJlZ2lzdHJ5KTtcbiAgICB2YXIgaHRtbEFzdFdpdGhFcnJvcnMgPSB0aGlzLl9odG1sUGFyc2VyLnBhcnNlKHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCk7XG4gICAgdmFyIHJlc3VsdCA9IGh0bWxWaXNpdEFsbChwYXJzZVZpc2l0b3IsIGh0bWxBc3RXaXRoRXJyb3JzLnJvb3ROb2RlcywgRU1QVFlfQ09NUE9ORU5UKTtcbiAgICB2YXIgZXJyb3JzOiBQYXJzZUVycm9yW10gPSBodG1sQXN0V2l0aEVycm9ycy5lcnJvcnMuY29uY2F0KHBhcnNlVmlzaXRvci5lcnJvcnMpO1xuICAgIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGVycm9yU3RyaW5nID0gZXJyb3JzLmpvaW4oJ1xcbicpO1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFRlbXBsYXRlIHBhcnNlIGVycm9yczpcXG4ke2Vycm9yU3RyaW5nfWApO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMudHJhbnNmb3JtcykpIHtcbiAgICAgIHRoaXMudHJhbnNmb3Jtcy5mb3JFYWNoKFxuICAgICAgICAgICh0cmFuc2Zvcm06IFRlbXBsYXRlQXN0VmlzaXRvcikgPT4geyByZXN1bHQgPSB0ZW1wbGF0ZVZpc2l0QWxsKHRyYW5zZm9ybSwgcmVzdWx0KTsgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn1cblxuY2xhc3MgVGVtcGxhdGVQYXJzZVZpc2l0b3IgaW1wbGVtZW50cyBIdG1sQXN0VmlzaXRvciB7XG4gIHNlbGVjdG9yTWF0Y2hlcjogU2VsZWN0b3JNYXRjaGVyO1xuICBlcnJvcnM6IFRlbXBsYXRlUGFyc2VFcnJvcltdID0gW107XG4gIGRpcmVjdGl2ZXNJbmRleCA9IG5ldyBNYXA8Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBudW1iZXI+KCk7XG4gIG5nQ29udGVudENvdW50OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdLCBwcml2YXRlIF9leHByUGFyc2VyOiBQYXJzZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3NjaGVtYVJlZ2lzdHJ5OiBFbGVtZW50U2NoZW1hUmVnaXN0cnkpIHtcbiAgICB0aGlzLnNlbGVjdG9yTWF0Y2hlciA9IG5ldyBTZWxlY3Rvck1hdGNoZXIoKTtcbiAgICBMaXN0V3JhcHBlci5mb3JFYWNoV2l0aEluZGV4KGRpcmVjdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZGlyZWN0aXZlOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdG9yID0gQ3NzU2VsZWN0b3IucGFyc2UoZGlyZWN0aXZlLnNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rvck1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoc2VsZWN0b3IsIGRpcmVjdGl2ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aXZlc0luZGV4LnNldChkaXJlY3RpdmUsIGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVwb3J0RXJyb3IobWVzc2FnZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBUZW1wbGF0ZVBhcnNlRXJyb3IobWVzc2FnZSwgc291cmNlU3Bhbi5zdGFydCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VJbnRlcnBvbGF0aW9uKHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IEFTVFdpdGhTb3VyY2Uge1xuICAgIHZhciBzb3VyY2VJbmZvID0gc291cmNlU3Bhbi5zdGFydC50b1N0cmluZygpO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdGhpcy5fZXhwclBhcnNlci5wYXJzZUludGVycG9sYXRpb24odmFsdWUsIHNvdXJjZUluZm8pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGAke2V9YCwgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gdGhpcy5fZXhwclBhcnNlci53cmFwTGl0ZXJhbFByaW1pdGl2ZSgnRVJST1InLCBzb3VyY2VJbmZvKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUFjdGlvbih2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBBU1RXaXRoU291cmNlIHtcbiAgICB2YXIgc291cmNlSW5mbyA9IHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRoaXMuX2V4cHJQYXJzZXIucGFyc2VBY3Rpb24odmFsdWUsIHNvdXJjZUluZm8pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGAke2V9YCwgc291cmNlU3Bhbik7XG4gICAgICByZXR1cm4gdGhpcy5fZXhwclBhcnNlci53cmFwTGl0ZXJhbFByaW1pdGl2ZSgnRVJST1InLCBzb3VyY2VJbmZvKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUJpbmRpbmcodmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogQVNUV2l0aFNvdXJjZSB7XG4gICAgdmFyIHNvdXJjZUluZm8gPSBzb3VyY2VTcGFuLnN0YXJ0LnRvU3RyaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyLnBhcnNlQmluZGluZyh2YWx1ZSwgc291cmNlSW5mbyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKCdFUlJPUicsIHNvdXJjZUluZm8pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlVGVtcGxhdGVCaW5kaW5ncyh2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBUZW1wbGF0ZUJpbmRpbmdbXSB7XG4gICAgdmFyIHNvdXJjZUluZm8gPSBzb3VyY2VTcGFuLnN0YXJ0LnRvU3RyaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyLnBhcnNlVGVtcGxhdGVCaW5kaW5ncyh2YWx1ZSwgc291cmNlSW5mbyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH1cblxuICB2aXNpdFRleHQoYXN0OiBIdG1sVGV4dEFzdCwgY29tcG9uZW50OiBDb21wb25lbnQpOiBhbnkge1xuICAgIHZhciBuZ0NvbnRlbnRJbmRleCA9IGNvbXBvbmVudC5maW5kTmdDb250ZW50SW5kZXgoVEVYVF9DU1NfU0VMRUNUT1IpO1xuICAgIHZhciBleHByID0gdGhpcy5fcGFyc2VJbnRlcnBvbGF0aW9uKGFzdC52YWx1ZSwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIGlmIChpc1ByZXNlbnQoZXhwcikpIHtcbiAgICAgIHJldHVybiBuZXcgQm91bmRUZXh0QXN0KGV4cHIsIG5nQ29udGVudEluZGV4LCBhc3Quc291cmNlU3Bhbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgVGV4dEFzdChhc3QudmFsdWUsIG5nQ29udGVudEluZGV4LCBhc3Quc291cmNlU3Bhbik7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRBdHRyKGFzdDogSHRtbEF0dHJBc3QsIGNvbnRleDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbmV3IEF0dHJBc3QoYXN0Lm5hbWUsIGFzdC52YWx1ZSwgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEh0bWxFbGVtZW50QXN0LCBjb21wb25lbnQ6IENvbXBvbmVudCk6IGFueSB7XG4gICAgdmFyIG5vZGVOYW1lID0gZWxlbWVudC5uYW1lO1xuICAgIHZhciBwcmVwYXJzZWRFbGVtZW50ID0gcHJlcGFyc2VFbGVtZW50KGVsZW1lbnQpO1xuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNDUklQVCB8fFxuICAgICAgICBwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFKSB7XG4gICAgICAvLyBTa2lwcGluZyA8c2NyaXB0PiBmb3Igc2VjdXJpdHkgcmVhc29uc1xuICAgICAgLy8gU2tpcHBpbmcgPHN0eWxlPiBhcyB3ZSBhbHJlYWR5IHByb2Nlc3NlZCB0aGVtXG4gICAgICAvLyBpbiB0aGUgU3R5bGVDb21waWxlclxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFU0hFRVQgJiZcbiAgICAgICAgaXNTdHlsZVVybFJlc29sdmFibGUocHJlcGFyc2VkRWxlbWVudC5ocmVmQXR0cikpIHtcbiAgICAgIC8vIFNraXBwaW5nIHN0eWxlc2hlZXRzIHdpdGggZWl0aGVyIHJlbGF0aXZlIHVybHMgb3IgcGFja2FnZSBzY2hlbWUgYXMgd2UgYWxyZWFkeSBwcm9jZXNzZWRcbiAgICAgIC8vIHRoZW0gaW4gdGhlIFN0eWxlQ29tcGlsZXJcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBtYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSA9IFtdO1xuICAgIHZhciBlbGVtZW50T3JEaXJlY3RpdmVQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdID0gW107XG4gICAgdmFyIHZhcnM6IFZhcmlhYmxlQXN0W10gPSBbXTtcbiAgICB2YXIgZXZlbnRzOiBCb3VuZEV2ZW50QXN0W10gPSBbXTtcblxuICAgIHZhciB0ZW1wbGF0ZUVsZW1lbnRPckRpcmVjdGl2ZVByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10gPSBbXTtcbiAgICB2YXIgdGVtcGxhdGVWYXJzOiBWYXJpYWJsZUFzdFtdID0gW107XG4gICAgdmFyIHRlbXBsYXRlTWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10gPSBbXTtcbiAgICB2YXIgaGFzSW5saW5lVGVtcGxhdGVzID0gZmFsc2U7XG4gICAgdmFyIGF0dHJzID0gW107XG5cbiAgICBlbGVtZW50LmF0dHJzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBtYXRjaGFibGVBdHRycy5wdXNoKFthdHRyLm5hbWUsIGF0dHIudmFsdWVdKTtcbiAgICAgIHZhciBoYXNCaW5kaW5nID0gdGhpcy5fcGFyc2VBdHRyKGF0dHIsIG1hdGNoYWJsZUF0dHJzLCBlbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgZXZlbnRzLCB2YXJzKTtcbiAgICAgIHZhciBoYXNUZW1wbGF0ZUJpbmRpbmcgPSB0aGlzLl9wYXJzZUlubGluZVRlbXBsYXRlQmluZGluZyhcbiAgICAgICAgICBhdHRyLCB0ZW1wbGF0ZU1hdGNoYWJsZUF0dHJzLCB0ZW1wbGF0ZUVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCB0ZW1wbGF0ZVZhcnMpO1xuICAgICAgaWYgKCFoYXNCaW5kaW5nICYmICFoYXNUZW1wbGF0ZUJpbmRpbmcpIHtcbiAgICAgICAgLy8gZG9uJ3QgaW5jbHVkZSB0aGUgYmluZGluZ3MgYXMgYXR0cmlidXRlcyBhcyB3ZWxsIGluIHRoZSBBU1RcbiAgICAgICAgYXR0cnMucHVzaCh0aGlzLnZpc2l0QXR0cihhdHRyLCBudWxsKSk7XG4gICAgICB9XG4gICAgICBpZiAoaGFzVGVtcGxhdGVCaW5kaW5nKSB7XG4gICAgICAgIGhhc0lubGluZVRlbXBsYXRlcyA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgbGNFbE5hbWUgPSBzcGxpdEh0bWxUYWdOYW1lc3BhY2Uobm9kZU5hbWUudG9Mb3dlckNhc2UoKSlbMV07XG4gICAgdmFyIGlzVGVtcGxhdGVFbGVtZW50ID0gbGNFbE5hbWUgPT0gVEVNUExBVEVfRUxFTUVOVDtcbiAgICB2YXIgZWxlbWVudENzc1NlbGVjdG9yID0gY3JlYXRlRWxlbWVudENzc1NlbGVjdG9yKG5vZGVOYW1lLCBtYXRjaGFibGVBdHRycyk7XG4gICAgdmFyIGRpcmVjdGl2ZXMgPSB0aGlzLl9jcmVhdGVEaXJlY3RpdmVBc3RzKFxuICAgICAgICBlbGVtZW50Lm5hbWUsIHRoaXMuX3BhcnNlRGlyZWN0aXZlcyh0aGlzLnNlbGVjdG9yTWF0Y2hlciwgZWxlbWVudENzc1NlbGVjdG9yKSxcbiAgICAgICAgZWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsIGlzVGVtcGxhdGVFbGVtZW50ID8gW10gOiB2YXJzLCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgIHZhciBlbGVtZW50UHJvcHM6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10gPVxuICAgICAgICB0aGlzLl9jcmVhdGVFbGVtZW50UHJvcGVydHlBc3RzKGVsZW1lbnQubmFtZSwgZWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsIGRpcmVjdGl2ZXMpO1xuICAgIHZhciBjaGlsZHJlbiA9IGh0bWxWaXNpdEFsbChwcmVwYXJzZWRFbGVtZW50Lm5vbkJpbmRhYmxlID8gTk9OX0JJTkRBQkxFX1ZJU0lUT1IgOiB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNoaWxkcmVuLCBDb21wb25lbnQuY3JlYXRlKGRpcmVjdGl2ZXMpKTtcbiAgICB2YXIgZWxlbWVudE5nQ29udGVudEluZGV4ID1cbiAgICAgICAgaGFzSW5saW5lVGVtcGxhdGVzID8gbnVsbCA6IGNvbXBvbmVudC5maW5kTmdDb250ZW50SW5kZXgoZWxlbWVudENzc1NlbGVjdG9yKTtcbiAgICB2YXIgcGFyc2VkRWxlbWVudDtcbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5OR19DT05URU5UKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KGVsZW1lbnQuY2hpbGRyZW4pICYmIGVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgIGA8bmctY29udGVudD4gZWxlbWVudCBjYW5ub3QgaGF2ZSBjb250ZW50LiA8bmctY29udGVudD4gbXVzdCBiZSBpbW1lZGlhdGVseSBmb2xsb3dlZCBieSA8L25nLWNvbnRlbnQ+YCxcbiAgICAgICAgICAgIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICB9XG4gICAgICBwYXJzZWRFbGVtZW50ID1cbiAgICAgICAgICBuZXcgTmdDb250ZW50QXN0KHRoaXMubmdDb250ZW50Q291bnQrKywgZWxlbWVudE5nQ29udGVudEluZGV4LCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgIH0gZWxzZSBpZiAoaXNUZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuX2Fzc2VydEFsbEV2ZW50c1B1Ymxpc2hlZEJ5RGlyZWN0aXZlcyhkaXJlY3RpdmVzLCBldmVudHMpO1xuICAgICAgdGhpcy5fYXNzZXJ0Tm9Db21wb25lbnRzTm9yRWxlbWVudEJpbmRpbmdzT25UZW1wbGF0ZShkaXJlY3RpdmVzLCBlbGVtZW50UHJvcHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICBwYXJzZWRFbGVtZW50ID0gbmV3IEVtYmVkZGVkVGVtcGxhdGVBc3QoYXR0cnMsIGV2ZW50cywgdmFycywgZGlyZWN0aXZlcywgY2hpbGRyZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudE5nQ29udGVudEluZGV4LCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hc3NlcnRPbmx5T25lQ29tcG9uZW50KGRpcmVjdGl2ZXMsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICB2YXIgZWxlbWVudEV4cG9ydEFzVmFycyA9IHZhcnMuZmlsdGVyKHZhckFzdCA9PiB2YXJBc3QudmFsdWUubGVuZ3RoID09PSAwKTtcbiAgICAgIHBhcnNlZEVsZW1lbnQgPVxuICAgICAgICAgIG5ldyBFbGVtZW50QXN0KG5vZGVOYW1lLCBhdHRycywgZWxlbWVudFByb3BzLCBldmVudHMsIGVsZW1lbnRFeHBvcnRBc1ZhcnMsIGRpcmVjdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4sIGVsZW1lbnROZ0NvbnRlbnRJbmRleCwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB9XG4gICAgaWYgKGhhc0lubGluZVRlbXBsYXRlcykge1xuICAgICAgdmFyIHRlbXBsYXRlQ3NzU2VsZWN0b3IgPSBjcmVhdGVFbGVtZW50Q3NzU2VsZWN0b3IoVEVNUExBVEVfRUxFTUVOVCwgdGVtcGxhdGVNYXRjaGFibGVBdHRycyk7XG4gICAgICB2YXIgdGVtcGxhdGVEaXJlY3RpdmVzID0gdGhpcy5fY3JlYXRlRGlyZWN0aXZlQXN0cyhcbiAgICAgICAgICBlbGVtZW50Lm5hbWUsIHRoaXMuX3BhcnNlRGlyZWN0aXZlcyh0aGlzLnNlbGVjdG9yTWF0Y2hlciwgdGVtcGxhdGVDc3NTZWxlY3RvciksXG4gICAgICAgICAgdGVtcGxhdGVFbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgW10sIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICB2YXIgdGVtcGxhdGVFbGVtZW50UHJvcHM6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10gPSB0aGlzLl9jcmVhdGVFbGVtZW50UHJvcGVydHlBc3RzKFxuICAgICAgICAgIGVsZW1lbnQubmFtZSwgdGVtcGxhdGVFbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgdGVtcGxhdGVEaXJlY3RpdmVzKTtcbiAgICAgIHRoaXMuX2Fzc2VydE5vQ29tcG9uZW50c05vckVsZW1lbnRCaW5kaW5nc09uVGVtcGxhdGUodGVtcGxhdGVEaXJlY3RpdmVzLCB0ZW1wbGF0ZUVsZW1lbnRQcm9wcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgRW1iZWRkZWRUZW1wbGF0ZUFzdChcbiAgICAgICAgICBbXSwgW10sIHRlbXBsYXRlVmFycywgdGVtcGxhdGVEaXJlY3RpdmVzLCBbcGFyc2VkRWxlbWVudF0sXG4gICAgICAgICAgY29tcG9uZW50LmZpbmROZ0NvbnRlbnRJbmRleCh0ZW1wbGF0ZUNzc1NlbGVjdG9yKSwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlZEVsZW1lbnQ7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUlubGluZVRlbXBsYXRlQmluZGluZyhhdHRyOiBIdG1sQXR0ckFzdCwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFZhcnM6IFZhcmlhYmxlQXN0W10pOiBib29sZWFuIHtcbiAgICB2YXIgdGVtcGxhdGVCaW5kaW5nc1NvdXJjZSA9IG51bGw7XG4gICAgaWYgKGF0dHIubmFtZS50b0xvd2VyQ2FzZSgpID09IFRFTVBMQVRFX0FUVFIpIHtcbiAgICAgIHRlbXBsYXRlQmluZGluZ3NTb3VyY2UgPSBhdHRyLnZhbHVlO1xuICAgIH0gZWxzZSBpZiAoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoVEVNUExBVEVfQVRUUl9QUkVGSVgpKSB7XG4gICAgICB2YXIga2V5ID0gYXR0ci5uYW1lLnN1YnN0cmluZyhURU1QTEFURV9BVFRSX1BSRUZJWC5sZW5ndGgpOyAgLy8gcmVtb3ZlIHRoZSBzdGFyXG4gICAgICB0ZW1wbGF0ZUJpbmRpbmdzU291cmNlID0gKGF0dHIudmFsdWUubGVuZ3RoID09IDApID8ga2V5IDoga2V5ICsgJyAnICsgYXR0ci52YWx1ZTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0ZW1wbGF0ZUJpbmRpbmdzU291cmNlKSkge1xuICAgICAgdmFyIGJpbmRpbmdzID0gdGhpcy5fcGFyc2VUZW1wbGF0ZUJpbmRpbmdzKHRlbXBsYXRlQmluZGluZ3NTb3VyY2UsIGF0dHIuc291cmNlU3Bhbik7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJpbmRpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBiaW5kaW5nID0gYmluZGluZ3NbaV07XG4gICAgICAgIHZhciBkYXNoQ2FzZUtleSA9IGNhbWVsQ2FzZVRvRGFzaENhc2UoYmluZGluZy5rZXkpO1xuICAgICAgICBpZiAoYmluZGluZy5rZXlJc1Zhcikge1xuICAgICAgICAgIHRhcmdldFZhcnMucHVzaChcbiAgICAgICAgICAgICAgbmV3IFZhcmlhYmxlQXN0KGRhc2hDYXNlVG9DYW1lbENhc2UoYmluZGluZy5rZXkpLCBiaW5kaW5nLm5hbWUsIGF0dHIuc291cmNlU3BhbikpO1xuICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLnB1c2goW2Rhc2hDYXNlS2V5LCBiaW5kaW5nLm5hbWVdKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoYmluZGluZy5leHByZXNzaW9uKSkge1xuICAgICAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHlBc3QoZGFzaENhc2VLZXksIGJpbmRpbmcuZXhwcmVzc2lvbiwgYXR0ci5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIHRhcmdldFByb3BzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycy5wdXNoKFtkYXNoQ2FzZUtleSwgJyddKTtcbiAgICAgICAgICB0aGlzLl9wYXJzZUxpdGVyYWxBdHRyKGRhc2hDYXNlS2V5LCBudWxsLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldFByb3BzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlQXR0cihhdHRyOiBIdG1sQXR0ckFzdCwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdLCB0YXJnZXRFdmVudHM6IEJvdW5kRXZlbnRBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgIHRhcmdldFZhcnM6IFZhcmlhYmxlQXN0W10pOiBib29sZWFuIHtcbiAgICB2YXIgYXR0ck5hbWUgPSB0aGlzLl9ub3JtYWxpemVBdHRyaWJ1dGVOYW1lKGF0dHIubmFtZSk7XG4gICAgdmFyIGF0dHJWYWx1ZSA9IGF0dHIudmFsdWU7XG4gICAgdmFyIGJpbmRQYXJ0cyA9IFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChCSU5EX05BTUVfUkVHRVhQLCBhdHRyTmFtZSk7XG4gICAgdmFyIGhhc0JpbmRpbmcgPSBmYWxzZTtcbiAgICBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0cykpIHtcbiAgICAgIGhhc0JpbmRpbmcgPSB0cnVlO1xuICAgICAgaWYgKGlzUHJlc2VudChiaW5kUGFydHNbMV0pKSB7ICAvLyBtYXRjaDogYmluZC1wcm9wXG4gICAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHkoYmluZFBhcnRzWzVdLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChcbiAgICAgICAgICAgICAgICAgICAgIGJpbmRQYXJ0c1syXSkpIHsgIC8vIG1hdGNoOiB2YXItbmFtZSAvIHZhci1uYW1lPVwiaWRlblwiIC8gI25hbWUgLyAjbmFtZT1cImlkZW5cIlxuICAgICAgICB2YXIgaWRlbnRpZmllciA9IGJpbmRQYXJ0c1s1XTtcbiAgICAgICAgdGhpcy5fcGFyc2VWYXJpYWJsZShpZGVudGlmaWVyLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0VmFycyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1szXSkpIHsgIC8vIG1hdGNoOiBvbi1ldmVudFxuICAgICAgICB0aGlzLl9wYXJzZUV2ZW50KGJpbmRQYXJ0c1s1XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50cyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1s0XSkpIHsgIC8vIG1hdGNoOiBiaW5kb24tcHJvcFxuICAgICAgICB0aGlzLl9wYXJzZVByb3BlcnR5KGJpbmRQYXJ0c1s1XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzKTtcbiAgICAgICAgdGhpcy5fcGFyc2VBc3NpZ25tZW50RXZlbnQoYmluZFBhcnRzWzVdLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50cyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1s2XSkpIHsgIC8vIG1hdGNoOiBbKGV4cHIpXVxuICAgICAgICB0aGlzLl9wYXJzZVByb3BlcnR5KGJpbmRQYXJ0c1s2XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzKTtcbiAgICAgICAgdGhpcy5fcGFyc2VBc3NpZ25tZW50RXZlbnQoYmluZFBhcnRzWzZdLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50cyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1s3XSkpIHsgIC8vIG1hdGNoOiBbZXhwcl1cbiAgICAgICAgdGhpcy5fcGFyc2VQcm9wZXJ0eShiaW5kUGFydHNbN10sIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wcyk7XG5cbiAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRQYXJ0c1s4XSkpIHsgIC8vIG1hdGNoOiAoZXZlbnQpXG4gICAgICAgIHRoaXMuX3BhcnNlRXZlbnQoYmluZFBhcnRzWzhdLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RXZlbnRzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaGFzQmluZGluZyA9IHRoaXMuX3BhcnNlUHJvcGVydHlJbnRlcnBvbGF0aW9uKGF0dHJOYW1lLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycywgdGFyZ2V0UHJvcHMpO1xuICAgIH1cbiAgICBpZiAoIWhhc0JpbmRpbmcpIHtcbiAgICAgIHRoaXMuX3BhcnNlTGl0ZXJhbEF0dHIoYXR0ck5hbWUsIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRQcm9wcyk7XG4gICAgfVxuICAgIHJldHVybiBoYXNCaW5kaW5nO1xuICB9XG5cbiAgcHJpdmF0ZSBfbm9ybWFsaXplQXR0cmlidXRlTmFtZShhdHRyTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYXR0ck5hbWUudG9Mb3dlckNhc2UoKS5zdGFydHNXaXRoKCdkYXRhLScpID8gYXR0ck5hbWUuc3Vic3RyaW5nKDUpIDogYXR0ck5hbWU7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVZhcmlhYmxlKGlkZW50aWZpZXI6IHN0cmluZywgdmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFZhcnM6IFZhcmlhYmxlQXN0W10pIHtcbiAgICB0YXJnZXRWYXJzLnB1c2gobmV3IFZhcmlhYmxlQXN0KGRhc2hDYXNlVG9DYW1lbENhc2UoaWRlbnRpZmllciksIHZhbHVlLCBzb3VyY2VTcGFuKSk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVByb3BlcnR5KG5hbWU6IHN0cmluZywgZXhwcmVzc2lvbjogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSkge1xuICAgIHRoaXMuX3BhcnNlUHJvcGVydHlBc3QobmFtZSwgdGhpcy5fcGFyc2VCaW5kaW5nKGV4cHJlc3Npb24sIHNvdXJjZVNwYW4pLCBzb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIHRhcmdldFByb3BzKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlUHJvcGVydHlJbnRlcnBvbGF0aW9uKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSk6IGJvb2xlYW4ge1xuICAgIHZhciBleHByID0gdGhpcy5fcGFyc2VJbnRlcnBvbGF0aW9uKHZhbHVlLCBzb3VyY2VTcGFuKTtcbiAgICBpZiAoaXNQcmVzZW50KGV4cHIpKSB7XG4gICAgICB0aGlzLl9wYXJzZVByb3BlcnR5QXN0KG5hbWUsIGV4cHIsIHNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VQcm9wZXJ0eUFzdChuYW1lOiBzdHJpbmcsIGFzdDogQVNUV2l0aFNvdXJjZSwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10pIHtcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRycy5wdXNoKFtuYW1lLCBhc3Quc291cmNlXSk7XG4gICAgdGFyZ2V0UHJvcHMucHVzaChuZXcgQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eShuYW1lLCBhc3QsIGZhbHNlLCBzb3VyY2VTcGFuKSk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUFzc2lnbm1lbnRFdmVudChuYW1lOiBzdHJpbmcsIGV4cHJlc3Npb246IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSwgdGFyZ2V0RXZlbnRzOiBCb3VuZEV2ZW50QXN0W10pIHtcbiAgICB0aGlzLl9wYXJzZUV2ZW50KGAke25hbWV9LWNoYW5nZWAsIGAke2V4cHJlc3Npb259PSRldmVudGAsIHNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0RXZlbnRzKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlRXZlbnQobmFtZTogc3RyaW5nLCBleHByZXNzaW9uOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSwgdGFyZ2V0RXZlbnRzOiBCb3VuZEV2ZW50QXN0W10pIHtcbiAgICAvLyBsb25nIGZvcm1hdDogJ3RhcmdldDogZXZlbnROYW1lJ1xuICAgIHZhciBwYXJ0cyA9IHNwbGl0QXRDb2xvbihuYW1lLCBbbnVsbCwgbmFtZV0pO1xuICAgIHZhciB0YXJnZXQgPSBwYXJ0c1swXTtcbiAgICB2YXIgZXZlbnROYW1lID0gcGFydHNbMV07XG4gICAgdGFyZ2V0RXZlbnRzLnB1c2gobmV3IEJvdW5kRXZlbnRBc3QoZGFzaENhc2VUb0NhbWVsQ2FzZShldmVudE5hbWUpLCB0YXJnZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGFyc2VBY3Rpb24oZXhwcmVzc2lvbiwgc291cmNlU3BhbiksIHNvdXJjZVNwYW4pKTtcbiAgICAvLyBEb24ndCBkZXRlY3QgZGlyZWN0aXZlcyBmb3IgZXZlbnQgbmFtZXMgZm9yIG5vdyxcbiAgICAvLyBzbyBkb24ndCBhZGQgdGhlIGV2ZW50IG5hbWUgdG8gdGhlIG1hdGNoYWJsZUF0dHJzXG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUxpdGVyYWxBdHRyKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10pIHtcbiAgICB0YXJnZXRQcm9wcy5wdXNoKG5ldyBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5KFxuICAgICAgICBkYXNoQ2FzZVRvQ2FtZWxDYXNlKG5hbWUpLCB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKHZhbHVlLCAnJyksIHRydWUsXG4gICAgICAgIHNvdXJjZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlRGlyZWN0aXZlcyhzZWxlY3Rvck1hdGNoZXI6IFNlbGVjdG9yTWF0Y2hlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRDc3NTZWxlY3RvcjogQ3NzU2VsZWN0b3IpOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSB7XG4gICAgdmFyIGRpcmVjdGl2ZXMgPSBbXTtcbiAgICBzZWxlY3Rvck1hdGNoZXIubWF0Y2goZWxlbWVudENzc1NlbGVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAoc2VsZWN0b3IsIGRpcmVjdGl2ZSkgPT4geyBkaXJlY3RpdmVzLnB1c2goZGlyZWN0aXZlKTsgfSk7XG4gICAgLy8gTmVlZCB0byBzb3J0IHRoZSBkaXJlY3RpdmVzIHNvIHRoYXQgd2UgZ2V0IGNvbnNpc3RlbnQgcmVzdWx0cyB0aHJvdWdob3V0LFxuICAgIC8vIGFzIHNlbGVjdG9yTWF0Y2hlciB1c2VzIE1hcHMgaW5zaWRlLlxuICAgIC8vIEFsc28gbmVlZCB0byBtYWtlIGNvbXBvbmVudHMgdGhlIGZpcnN0IGRpcmVjdGl2ZSBpbiB0aGUgYXJyYXlcbiAgICBMaXN0V3JhcHBlci5zb3J0KGRpcmVjdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgICAoZGlyMTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBkaXIyOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpcjFDb21wID0gZGlyMS5pc0NvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpcjJDb21wID0gZGlyMi5pc0NvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpcjFDb21wICYmICFkaXIyQ29tcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghZGlyMUNvbXAgJiYgZGlyMkNvbXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kaXJlY3RpdmVzSW5kZXguZ2V0KGRpcjEpIC0gdGhpcy5kaXJlY3RpdmVzSW5kZXguZ2V0KGRpcjIpO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICByZXR1cm4gZGlyZWN0aXZlcztcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZURpcmVjdGl2ZUFzdHMoZWxlbWVudE5hbWU6IHN0cmluZywgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZUV4cG9ydEFzVmFyczogVmFyaWFibGVBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBEaXJlY3RpdmVBc3RbXSB7XG4gICAgdmFyIG1hdGNoZWRWYXJpYWJsZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICB2YXIgZGlyZWN0aXZlQXN0cyA9IGRpcmVjdGl2ZXMubWFwKChkaXJlY3RpdmU6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSkgPT4ge1xuICAgICAgdmFyIGhvc3RQcm9wZXJ0aWVzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID0gW107XG4gICAgICB2YXIgaG9zdEV2ZW50czogQm91bmRFdmVudEFzdFtdID0gW107XG4gICAgICB2YXIgZGlyZWN0aXZlUHJvcGVydGllczogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdFtdID0gW107XG4gICAgICB0aGlzLl9jcmVhdGVEaXJlY3RpdmVIb3N0UHJvcGVydHlBc3RzKGVsZW1lbnROYW1lLCBkaXJlY3RpdmUuaG9zdFByb3BlcnRpZXMsIHNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RQcm9wZXJ0aWVzKTtcbiAgICAgIHRoaXMuX2NyZWF0ZURpcmVjdGl2ZUhvc3RFdmVudEFzdHMoZGlyZWN0aXZlLmhvc3RMaXN0ZW5lcnMsIHNvdXJjZVNwYW4sIGhvc3RFdmVudHMpO1xuICAgICAgdGhpcy5fY3JlYXRlRGlyZWN0aXZlUHJvcGVydHlBc3RzKGRpcmVjdGl2ZS5pbnB1dHMsIHByb3BzLCBkaXJlY3RpdmVQcm9wZXJ0aWVzKTtcbiAgICAgIHZhciBleHBvcnRBc1ZhcnMgPSBbXTtcbiAgICAgIHBvc3NpYmxlRXhwb3J0QXNWYXJzLmZvckVhY2goKHZhckFzdCkgPT4ge1xuICAgICAgICBpZiAoKHZhckFzdC52YWx1ZS5sZW5ndGggPT09IDAgJiYgZGlyZWN0aXZlLmlzQ29tcG9uZW50KSB8fFxuICAgICAgICAgICAgKGRpcmVjdGl2ZS5leHBvcnRBcyA9PSB2YXJBc3QudmFsdWUpKSB7XG4gICAgICAgICAgZXhwb3J0QXNWYXJzLnB1c2godmFyQXN0KTtcbiAgICAgICAgICBtYXRjaGVkVmFyaWFibGVzLmFkZCh2YXJBc3QubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG5ldyBEaXJlY3RpdmVBc3QoZGlyZWN0aXZlLCBkaXJlY3RpdmVQcm9wZXJ0aWVzLCBob3N0UHJvcGVydGllcywgaG9zdEV2ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydEFzVmFycywgc291cmNlU3Bhbik7XG4gICAgfSk7XG4gICAgcG9zc2libGVFeHBvcnRBc1ZhcnMuZm9yRWFjaCgodmFyQXN0KSA9PiB7XG4gICAgICBpZiAodmFyQXN0LnZhbHVlLmxlbmd0aCA+IDAgJiYgIVNldFdyYXBwZXIuaGFzKG1hdGNoZWRWYXJpYWJsZXMsIHZhckFzdC5uYW1lKSkge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihgVGhlcmUgaXMgbm8gZGlyZWN0aXZlIHdpdGggXCJleHBvcnRBc1wiIHNldCB0byBcIiR7dmFyQXN0LnZhbHVlfVwiYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyQXN0LnNvdXJjZVNwYW4pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkaXJlY3RpdmVBc3RzO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRGlyZWN0aXZlSG9zdFByb3BlcnR5QXN0cyhlbGVtZW50TmFtZTogc3RyaW5nLCBob3N0UHJvcHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wZXJ0eUFzdHM6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10pIHtcbiAgICBpZiAoaXNQcmVzZW50KGhvc3RQcm9wcykpIHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChob3N0UHJvcHMsIChleHByZXNzaW9uLCBwcm9wTmFtZSkgPT4ge1xuICAgICAgICB2YXIgZXhwckFzdCA9IHRoaXMuX3BhcnNlQmluZGluZyhleHByZXNzaW9uLCBzb3VyY2VTcGFuKTtcbiAgICAgICAgdGFyZ2V0UHJvcGVydHlBc3RzLnB1c2goXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVFbGVtZW50UHJvcGVydHlBc3QoZWxlbWVudE5hbWUsIHByb3BOYW1lLCBleHByQXN0LCBzb3VyY2VTcGFuKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVIb3N0RXZlbnRBc3RzKGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudEFzdHM6IEJvdW5kRXZlbnRBc3RbXSkge1xuICAgIGlmIChpc1ByZXNlbnQoaG9zdExpc3RlbmVycykpIHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChob3N0TGlzdGVuZXJzLCAoZXhwcmVzc2lvbiwgcHJvcE5hbWUpID0+IHtcbiAgICAgICAgdGhpcy5fcGFyc2VFdmVudChwcm9wTmFtZSwgZXhwcmVzc2lvbiwgc291cmNlU3BhbiwgW10sIHRhcmdldEV2ZW50QXN0cyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVQcm9wZXJ0eUFzdHMoZGlyZWN0aXZlUHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3VuZFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCb3VuZERpcmVjdGl2ZVByb3BzOiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0W10pIHtcbiAgICBpZiAoaXNQcmVzZW50KGRpcmVjdGl2ZVByb3BlcnRpZXMpKSB7XG4gICAgICB2YXIgYm91bmRQcm9wc0J5TmFtZSA9IG5ldyBNYXA8c3RyaW5nLCBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5PigpO1xuICAgICAgYm91bmRQcm9wcy5mb3JFYWNoKGJvdW5kUHJvcCA9PiB7XG4gICAgICAgIHZhciBrZXkgPSBkYXNoQ2FzZVRvQ2FtZWxDYXNlKGJvdW5kUHJvcC5uYW1lKTtcbiAgICAgICAgdmFyIHByZXZWYWx1ZSA9IGJvdW5kUHJvcHNCeU5hbWUuZ2V0KGJvdW5kUHJvcC5uYW1lKTtcbiAgICAgICAgaWYgKGlzQmxhbmsocHJldlZhbHVlKSB8fCBwcmV2VmFsdWUuaXNMaXRlcmFsKSB7XG4gICAgICAgICAgLy8gZ2l2ZSBbYV09XCJiXCIgYSBoaWdoZXIgcHJlY2VkZW5jZSB0aGF0biBhPVwiYlwiIG9uIHRoZSBzYW1lIGVsZW1lbnRcbiAgICAgICAgICBib3VuZFByb3BzQnlOYW1lLnNldChrZXksIGJvdW5kUHJvcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZGlyZWN0aXZlUHJvcGVydGllcywgKGVsUHJvcDogc3RyaW5nLCBkaXJQcm9wOiBzdHJpbmcpID0+IHtcbiAgICAgICAgZWxQcm9wID0gZGFzaENhc2VUb0NhbWVsQ2FzZShlbFByb3ApO1xuICAgICAgICB2YXIgYm91bmRQcm9wID0gYm91bmRQcm9wc0J5TmFtZS5nZXQoZWxQcm9wKTtcblxuICAgICAgICAvLyBCaW5kaW5ncyBhcmUgb3B0aW9uYWwsIHNvIHRoaXMgYmluZGluZyBvbmx5IG5lZWRzIHRvIGJlIHNldCB1cCBpZiBhbiBleHByZXNzaW9uIGlzIGdpdmVuLlxuICAgICAgICBpZiAoaXNQcmVzZW50KGJvdW5kUHJvcCkpIHtcbiAgICAgICAgICB0YXJnZXRCb3VuZERpcmVjdGl2ZVByb3BzLnB1c2gobmV3IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QoXG4gICAgICAgICAgICAgIGRpclByb3AsIGJvdW5kUHJvcC5uYW1lLCBib3VuZFByb3AuZXhwcmVzc2lvbiwgYm91bmRQcm9wLnNvdXJjZVNwYW4pKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0cyhlbGVtZW50TmFtZTogc3RyaW5nLCBwcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdKTogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSB7XG4gICAgdmFyIGJvdW5kRWxlbWVudFByb3BzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID0gW107XG4gICAgdmFyIGJvdW5kRGlyZWN0aXZlUHJvcHNJbmRleCA9IG5ldyBNYXA8c3RyaW5nLCBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0PigpO1xuICAgIGRpcmVjdGl2ZXMuZm9yRWFjaCgoZGlyZWN0aXZlOiBEaXJlY3RpdmVBc3QpID0+IHtcbiAgICAgIGRpcmVjdGl2ZS5pbnB1dHMuZm9yRWFjaCgocHJvcDogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCkgPT4ge1xuICAgICAgICBib3VuZERpcmVjdGl2ZVByb3BzSW5kZXguc2V0KHByb3AudGVtcGxhdGVOYW1lLCBwcm9wKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHByb3BzLmZvckVhY2goKHByb3A6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHkpID0+IHtcbiAgICAgIGlmICghcHJvcC5pc0xpdGVyYWwgJiYgaXNCbGFuayhib3VuZERpcmVjdGl2ZVByb3BzSW5kZXguZ2V0KHByb3AubmFtZSkpKSB7XG4gICAgICAgIGJvdW5kRWxlbWVudFByb3BzLnB1c2godGhpcy5fY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0KGVsZW1lbnROYW1lLCBwcm9wLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3AuZXhwcmVzc2lvbiwgcHJvcC5zb3VyY2VTcGFuKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGJvdW5kRWxlbWVudFByb3BzO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0KGVsZW1lbnROYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgYXN0OiBBU1QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCB7XG4gICAgdmFyIHVuaXQgPSBudWxsO1xuICAgIHZhciBiaW5kaW5nVHlwZTtcbiAgICB2YXIgYm91bmRQcm9wZXJ0eU5hbWU7XG4gICAgdmFyIHBhcnRzID0gbmFtZS5zcGxpdChQUk9QRVJUWV9QQVJUU19TRVBBUkFUT1IpO1xuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gdGhpcy5fc2NoZW1hUmVnaXN0cnkuZ2V0TWFwcGVkUHJvcE5hbWUoZGFzaENhc2VUb0NhbWVsQ2FzZShwYXJ0c1swXSkpO1xuICAgICAgYmluZGluZ1R5cGUgPSBQcm9wZXJ0eUJpbmRpbmdUeXBlLlByb3BlcnR5O1xuICAgICAgaWYgKCF0aGlzLl9zY2hlbWFSZWdpc3RyeS5oYXNQcm9wZXJ0eShlbGVtZW50TmFtZSwgYm91bmRQcm9wZXJ0eU5hbWUpKSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgYENhbid0IGJpbmQgdG8gJyR7Ym91bmRQcm9wZXJ0eU5hbWV9JyBzaW5jZSBpdCBpc24ndCBhIGtub3duIG5hdGl2ZSBwcm9wZXJ0eWAsXG4gICAgICAgICAgICBzb3VyY2VTcGFuKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGxjUHJlZml4ID0gcGFydHNbMF0udG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChsY1ByZWZpeCA9PSBBVFRSSUJVVEVfUFJFRklYKSB7XG4gICAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gZGFzaENhc2VUb0NhbWVsQ2FzZShwYXJ0c1sxXSk7XG4gICAgICAgIGJpbmRpbmdUeXBlID0gUHJvcGVydHlCaW5kaW5nVHlwZS5BdHRyaWJ1dGU7XG4gICAgICB9IGVsc2UgaWYgKGxjUHJlZml4ID09IENMQVNTX1BSRUZJWCkge1xuICAgICAgICAvLyBrZWVwIG9yaWdpbmFsIGNhc2UhXG4gICAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gcGFydHNbMV07XG4gICAgICAgIGJpbmRpbmdUeXBlID0gUHJvcGVydHlCaW5kaW5nVHlwZS5DbGFzcztcbiAgICAgIH0gZWxzZSBpZiAobGNQcmVmaXggPT0gU1RZTEVfUFJFRklYKSB7XG4gICAgICAgIHVuaXQgPSBwYXJ0cy5sZW5ndGggPiAyID8gcGFydHNbMl0gOiBudWxsO1xuICAgICAgICBib3VuZFByb3BlcnR5TmFtZSA9IGRhc2hDYXNlVG9DYW1lbENhc2UocGFydHNbMV0pO1xuICAgICAgICBiaW5kaW5nVHlwZSA9IFByb3BlcnR5QmluZGluZ1R5cGUuU3R5bGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihgSW52YWxpZCBwcm9wZXJ0eSBuYW1lICR7bmFtZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgICAgYmluZGluZ1R5cGUgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgQm91bmRFbGVtZW50UHJvcGVydHlBc3QoYm91bmRQcm9wZXJ0eU5hbWUsIGJpbmRpbmdUeXBlLCBhc3QsIHVuaXQsIHNvdXJjZVNwYW4pO1xuICB9XG5cblxuICBwcml2YXRlIF9maW5kQ29tcG9uZW50RGlyZWN0aXZlTmFtZXMoZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10pOiBzdHJpbmdbXSB7XG4gICAgdmFyIGNvbXBvbmVudFR5cGVOYW1lczogc3RyaW5nW10gPSBbXTtcbiAgICBkaXJlY3RpdmVzLmZvckVhY2goZGlyZWN0aXZlID0+IHtcbiAgICAgIHZhciB0eXBlTmFtZSA9IGRpcmVjdGl2ZS5kaXJlY3RpdmUudHlwZS5uYW1lO1xuICAgICAgaWYgKGRpcmVjdGl2ZS5kaXJlY3RpdmUuaXNDb21wb25lbnQpIHtcbiAgICAgICAgY29tcG9uZW50VHlwZU5hbWVzLnB1c2godHlwZU5hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb21wb25lbnRUeXBlTmFtZXM7XG4gIH1cblxuICBwcml2YXRlIF9hc3NlcnRPbmx5T25lQ29tcG9uZW50KGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICB2YXIgY29tcG9uZW50VHlwZU5hbWVzID0gdGhpcy5fZmluZENvbXBvbmVudERpcmVjdGl2ZU5hbWVzKGRpcmVjdGl2ZXMpO1xuICAgIGlmIChjb21wb25lbnRUeXBlTmFtZXMubGVuZ3RoID4gMSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYE1vcmUgdGhhbiBvbmUgY29tcG9uZW50OiAke2NvbXBvbmVudFR5cGVOYW1lcy5qb2luKCcsJyl9YCwgc291cmNlU3Bhbik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXNzZXJ0Tm9Db21wb25lbnRzTm9yRWxlbWVudEJpbmRpbmdzT25UZW1wbGF0ZShkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50UHJvcHM6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7XG4gICAgdmFyIGNvbXBvbmVudFR5cGVOYW1lczogc3RyaW5nW10gPSB0aGlzLl9maW5kQ29tcG9uZW50RGlyZWN0aXZlTmFtZXMoZGlyZWN0aXZlcyk7XG4gICAgaWYgKGNvbXBvbmVudFR5cGVOYW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgQ29tcG9uZW50cyBvbiBhbiBlbWJlZGRlZCB0ZW1wbGF0ZTogJHtjb21wb25lbnRUeXBlTmFtZXMuam9pbignLCcpfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuKTtcbiAgICB9XG4gICAgZWxlbWVudFByb3BzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICBgUHJvcGVydHkgYmluZGluZyAke3Byb3AubmFtZX0gbm90IHVzZWQgYnkgYW55IGRpcmVjdGl2ZSBvbiBhbiBlbWJlZGRlZCB0ZW1wbGF0ZWAsXG4gICAgICAgICAgc291cmNlU3Bhbik7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9hc3NlcnRBbGxFdmVudHNQdWJsaXNoZWRCeURpcmVjdGl2ZXMoZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHM6IEJvdW5kRXZlbnRBc3RbXSkge1xuICAgIHZhciBhbGxEaXJlY3RpdmVFdmVudHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBkaXJlY3RpdmVzLmZvckVhY2goZGlyZWN0aXZlID0+IHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChkaXJlY3RpdmUuZGlyZWN0aXZlLm91dHB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGV2ZW50TmFtZSwgXykgPT4geyBhbGxEaXJlY3RpdmVFdmVudHMuYWRkKGV2ZW50TmFtZSk7IH0pO1xuICAgIH0pO1xuICAgIGV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgIGlmIChpc1ByZXNlbnQoZXZlbnQudGFyZ2V0KSB8fCAhU2V0V3JhcHBlci5oYXMoYWxsRGlyZWN0aXZlRXZlbnRzLCBldmVudC5uYW1lKSkge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihcbiAgICAgICAgICAgIGBFdmVudCBiaW5kaW5nICR7ZXZlbnQuZnVsbE5hbWV9IG5vdCBlbWl0dGVkIGJ5IGFueSBkaXJlY3RpdmUgb24gYW4gZW1iZWRkZWQgdGVtcGxhdGVgLFxuICAgICAgICAgICAgZXZlbnQuc291cmNlU3Bhbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuY2xhc3MgTm9uQmluZGFibGVWaXNpdG9yIGltcGxlbWVudHMgSHRtbEFzdFZpc2l0b3Ige1xuICB2aXNpdEVsZW1lbnQoYXN0OiBIdG1sRWxlbWVudEFzdCwgY29tcG9uZW50OiBDb21wb25lbnQpOiBFbGVtZW50QXN0IHtcbiAgICB2YXIgcHJlcGFyc2VkRWxlbWVudCA9IHByZXBhcnNlRWxlbWVudChhc3QpO1xuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNDUklQVCB8fFxuICAgICAgICBwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLlNUWUxFIHx8XG4gICAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEVTSEVFVCkge1xuICAgICAgLy8gU2tpcHBpbmcgPHNjcmlwdD4gZm9yIHNlY3VyaXR5IHJlYXNvbnNcbiAgICAgIC8vIFNraXBwaW5nIDxzdHlsZT4gYW5kIHN0eWxlc2hlZXRzIGFzIHdlIGFscmVhZHkgcHJvY2Vzc2VkIHRoZW1cbiAgICAgIC8vIGluIHRoZSBTdHlsZUNvbXBpbGVyXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgYXR0ck5hbWVBbmRWYWx1ZXMgPSBhc3QuYXR0cnMubWFwKGF0dHJBc3QgPT4gW2F0dHJBc3QubmFtZSwgYXR0ckFzdC52YWx1ZV0pO1xuICAgIHZhciBzZWxlY3RvciA9IGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3Rvcihhc3QubmFtZSwgYXR0ck5hbWVBbmRWYWx1ZXMpO1xuICAgIHZhciBuZ0NvbnRlbnRJbmRleCA9IGNvbXBvbmVudC5maW5kTmdDb250ZW50SW5kZXgoc2VsZWN0b3IpO1xuICAgIHZhciBjaGlsZHJlbiA9IGh0bWxWaXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4sIEVNUFRZX0NPTVBPTkVOVCk7XG4gICAgcmV0dXJuIG5ldyBFbGVtZW50QXN0KGFzdC5uYW1lLCBodG1sVmlzaXRBbGwodGhpcywgYXN0LmF0dHJzKSwgW10sIFtdLCBbXSwgW10sIGNoaWxkcmVuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuZ0NvbnRlbnRJbmRleCwgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0QXR0cihhc3Q6IEh0bWxBdHRyQXN0LCBjb250ZXh0OiBhbnkpOiBBdHRyQXN0IHtcbiAgICByZXR1cm4gbmV3IEF0dHJBc3QoYXN0Lm5hbWUsIGFzdC52YWx1ZSwgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0VGV4dChhc3Q6IEh0bWxUZXh0QXN0LCBjb21wb25lbnQ6IENvbXBvbmVudCk6IFRleHRBc3Qge1xuICAgIHZhciBuZ0NvbnRlbnRJbmRleCA9IGNvbXBvbmVudC5maW5kTmdDb250ZW50SW5kZXgoVEVYVF9DU1NfU0VMRUNUT1IpO1xuICAgIHJldHVybiBuZXcgVGV4dEFzdChhc3QudmFsdWUsIG5nQ29udGVudEluZGV4LCBhc3Quc291cmNlU3Bhbik7XG4gIH1cbn1cblxuY2xhc3MgQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBleHByZXNzaW9uOiBBU1QsIHB1YmxpYyBpc0xpdGVyYWw6IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdENsYXNzZXMoY2xhc3NBdHRyVmFsdWU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIFN0cmluZ1dyYXBwZXIuc3BsaXQoY2xhc3NBdHRyVmFsdWUudHJpbSgpLCAvXFxzKy9nKTtcbn1cblxuY2xhc3MgQ29tcG9uZW50IHtcbiAgc3RhdGljIGNyZWF0ZShkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSk6IENvbXBvbmVudCB7XG4gICAgaWYgKGRpcmVjdGl2ZXMubGVuZ3RoID09PSAwIHx8ICFkaXJlY3RpdmVzWzBdLmRpcmVjdGl2ZS5pc0NvbXBvbmVudCkge1xuICAgICAgcmV0dXJuIEVNUFRZX0NPTVBPTkVOVDtcbiAgICB9XG4gICAgdmFyIG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyKCk7XG4gICAgdmFyIG5nQ29udGVudFNlbGVjdG9ycyA9IGRpcmVjdGl2ZXNbMF0uZGlyZWN0aXZlLnRlbXBsYXRlLm5nQ29udGVudFNlbGVjdG9ycztcbiAgICB2YXIgd2lsZGNhcmROZ0NvbnRlbnRJbmRleCA9IG51bGw7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzZWxlY3RvciA9IG5nQ29udGVudFNlbGVjdG9yc1tpXTtcbiAgICAgIGlmIChTdHJpbmdXcmFwcGVyLmVxdWFscyhzZWxlY3RvciwgJyonKSkge1xuICAgICAgICB3aWxkY2FyZE5nQ29udGVudEluZGV4ID0gaTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2UobmdDb250ZW50U2VsZWN0b3JzW2ldKSwgaSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgQ29tcG9uZW50KG1hdGNoZXIsIHdpbGRjYXJkTmdDb250ZW50SW5kZXgpO1xuICB9XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuZ0NvbnRlbnRJbmRleE1hdGNoZXI6IFNlbGVjdG9yTWF0Y2hlcixcbiAgICAgICAgICAgICAgcHVibGljIHdpbGRjYXJkTmdDb250ZW50SW5kZXg6IG51bWJlcikge31cblxuICBmaW5kTmdDb250ZW50SW5kZXgoc2VsZWN0b3I6IENzc1NlbGVjdG9yKTogbnVtYmVyIHtcbiAgICB2YXIgbmdDb250ZW50SW5kaWNlcyA9IFtdO1xuICAgIHRoaXMubmdDb250ZW50SW5kZXhNYXRjaGVyLm1hdGNoKFxuICAgICAgICBzZWxlY3RvciwgKHNlbGVjdG9yLCBuZ0NvbnRlbnRJbmRleCkgPT4geyBuZ0NvbnRlbnRJbmRpY2VzLnB1c2gobmdDb250ZW50SW5kZXgpOyB9KTtcbiAgICBMaXN0V3JhcHBlci5zb3J0KG5nQ29udGVudEluZGljZXMpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy53aWxkY2FyZE5nQ29udGVudEluZGV4KSkge1xuICAgICAgbmdDb250ZW50SW5kaWNlcy5wdXNoKHRoaXMud2lsZGNhcmROZ0NvbnRlbnRJbmRleCk7XG4gICAgfVxuICAgIHJldHVybiBuZ0NvbnRlbnRJbmRpY2VzLmxlbmd0aCA+IDAgPyBuZ0NvbnRlbnRJbmRpY2VzWzBdIDogbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50Q3NzU2VsZWN0b3IoZWxlbWVudE5hbWU6IHN0cmluZywgbWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10pOiBDc3NTZWxlY3RvciB7XG4gIHZhciBjc3NTZWxlY3RvciA9IG5ldyBDc3NTZWxlY3RvcigpO1xuXG4gIGNzc1NlbGVjdG9yLnNldEVsZW1lbnQoZWxlbWVudE5hbWUpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG1hdGNoYWJsZUF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGF0dHJOYW1lID0gbWF0Y2hhYmxlQXR0cnNbaV1bMF0udG9Mb3dlckNhc2UoKTtcbiAgICB2YXIgYXR0clZhbHVlID0gbWF0Y2hhYmxlQXR0cnNbaV1bMV07XG4gICAgY3NzU2VsZWN0b3IuYWRkQXR0cmlidXRlKGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xuICAgIGlmIChhdHRyTmFtZSA9PSBDTEFTU19BVFRSKSB7XG4gICAgICB2YXIgY2xhc3NlcyA9IHNwbGl0Q2xhc3NlcyhhdHRyVmFsdWUpO1xuICAgICAgY2xhc3Nlcy5mb3JFYWNoKGNsYXNzTmFtZSA9PiBjc3NTZWxlY3Rvci5hZGRDbGFzc05hbWUoY2xhc3NOYW1lKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBjc3NTZWxlY3Rvcjtcbn1cblxudmFyIEVNUFRZX0NPTVBPTkVOVCA9IG5ldyBDb21wb25lbnQobmV3IFNlbGVjdG9yTWF0Y2hlcigpLCBudWxsKTtcbnZhciBOT05fQklOREFCTEVfVklTSVRPUiA9IG5ldyBOb25CaW5kYWJsZVZpc2l0b3IoKTtcbiJdfQ==