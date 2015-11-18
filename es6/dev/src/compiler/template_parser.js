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
import { ListWrapper, StringMapWrapper, SetWrapper } from 'angular2/src/facade/collection';
import { RegExpWrapper, isPresent, StringWrapper, isBlank } from 'angular2/src/facade/lang';
import { Injectable } from 'angular2/src/core/di';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Parser } from 'angular2/src/core/change_detection/change_detection';
import { HtmlParser } from './html_parser';
import { ElementAst, BoundElementPropertyAst, BoundEventAst, VariableAst, TextAst, BoundTextAst, EmbeddedTemplateAst, AttrAst, NgContentAst, PropertyBindingType, DirectiveAst, BoundDirectivePropertyAst } from './template_ast';
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
var BIND_NAME_REGEXP = /^(?:(?:(?:(bind-)|(var-|#)|(on-)|(bindon-))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/g;
const TEMPLATE_ELEMENT = 'template';
const TEMPLATE_ATTR = 'template';
const TEMPLATE_ATTR_PREFIX = '*';
const CLASS_ATTR = 'class';
var PROPERTY_PARTS_SEPARATOR = new RegExp('\\.');
const ATTRIBUTE_PREFIX = 'attr';
const CLASS_PREFIX = 'class';
const STYLE_PREFIX = 'style';
var TEXT_CSS_SELECTOR = CssSelector.parse('*')[0];
export let TemplateParser = class {
    constructor(_exprParser, _schemaRegistry, _htmlParser) {
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this._htmlParser = _htmlParser;
    }
    parse(template, directives, sourceInfo) {
        var parseVisitor = new TemplateParseVisitor(directives, this._exprParser, this._schemaRegistry);
        var result = htmlVisitAll(parseVisitor, this._htmlParser.parse(template, sourceInfo), EMPTY_COMPONENT);
        if (parseVisitor.errors.length > 0) {
            var errorString = parseVisitor.errors.join('\n');
            throw new BaseException(`Template parse errors:\n${errorString}`);
        }
        return result;
    }
};
TemplateParser = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Parser, ElementSchemaRegistry, HtmlParser])
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
    _reportError(message) { this.errors.push(message); }
    _parseInterpolation(value, sourceInfo) {
        try {
            return this._exprParser.parseInterpolation(value, sourceInfo);
        }
        catch (e) {
            this._reportError(`${e}`); // sourceInfo is already contained in the AST
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseAction(value, sourceInfo) {
        try {
            return this._exprParser.parseAction(value, sourceInfo);
        }
        catch (e) {
            this._reportError(`${e}`); // sourceInfo is already contained in the AST
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseBinding(value, sourceInfo) {
        try {
            return this._exprParser.parseBinding(value, sourceInfo);
        }
        catch (e) {
            this._reportError(`${e}`); // sourceInfo is already contained in the AST
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    }
    _parseTemplateBindings(value, sourceInfo) {
        try {
            return this._exprParser.parseTemplateBindings(value, sourceInfo);
        }
        catch (e) {
            this._reportError(`${e}`); // sourceInfo is already contained in the AST
            return [];
        }
    }
    visitText(ast, component) {
        var ngContentIndex = component.findNgContentIndex(TEXT_CSS_SELECTOR);
        var expr = this._parseInterpolation(ast.value, ast.sourceInfo);
        if (isPresent(expr)) {
            return new BoundTextAst(expr, ngContentIndex, ast.sourceInfo);
        }
        else {
            return new TextAst(ast.value, ngContentIndex, ast.sourceInfo);
        }
    }
    visitAttr(ast, contex) {
        return new AttrAst(ast.name, ast.value, ast.sourceInfo);
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
            // them
            // in the StyleCompiler
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
        var isTemplateElement = nodeName == TEMPLATE_ELEMENT;
        var elementCssSelector = createElementCssSelector(nodeName, matchableAttrs);
        var directives = this._createDirectiveAsts(element.name, this._parseDirectives(this.selectorMatcher, elementCssSelector), elementOrDirectiveProps, isTemplateElement ? [] : vars, element.sourceInfo);
        var elementProps = this._createElementPropertyAsts(element.name, elementOrDirectiveProps, directives);
        var children = htmlVisitAll(preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children, Component.create(directives));
        var elementNgContentIndex = hasInlineTemplates ? null : component.findNgContentIndex(elementCssSelector);
        var parsedElement;
        if (preparsedElement.type === PreparsedElementType.NG_CONTENT) {
            parsedElement =
                new NgContentAst(this.ngContentCount++, elementNgContentIndex, element.sourceInfo);
        }
        else if (isTemplateElement) {
            this._assertAllEventsPublishedByDirectives(directives, events, element.sourceInfo);
            this._assertNoComponentsNorElementBindingsOnTemplate(directives, elementProps, element.sourceInfo);
            parsedElement = new EmbeddedTemplateAst(attrs, events, vars, directives, children, elementNgContentIndex, element.sourceInfo);
        }
        else {
            this._assertOnlyOneComponent(directives, element.sourceInfo);
            var elementExportAsVars = vars.filter(varAst => varAst.value.length === 0);
            parsedElement =
                new ElementAst(nodeName, attrs, elementProps, events, elementExportAsVars, directives, children, elementNgContentIndex, element.sourceInfo);
        }
        if (hasInlineTemplates) {
            var templateCssSelector = createElementCssSelector(TEMPLATE_ELEMENT, templateMatchableAttrs);
            var templateDirectives = this._createDirectiveAsts(element.name, this._parseDirectives(this.selectorMatcher, templateCssSelector), templateElementOrDirectiveProps, [], element.sourceInfo);
            var templateElementProps = this._createElementPropertyAsts(element.name, templateElementOrDirectiveProps, templateDirectives);
            this._assertNoComponentsNorElementBindingsOnTemplate(templateDirectives, templateElementProps, element.sourceInfo);
            parsedElement = new EmbeddedTemplateAst([], [], templateVars, templateDirectives, [parsedElement], component.findNgContentIndex(templateCssSelector), element.sourceInfo);
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
            var bindings = this._parseTemplateBindings(templateBindingsSource, attr.sourceInfo);
            for (var i = 0; i < bindings.length; i++) {
                var binding = bindings[i];
                var dashCaseKey = camelCaseToDashCase(binding.key);
                if (binding.keyIsVar) {
                    targetVars.push(new VariableAst(dashCaseToCamelCase(binding.key), binding.name, attr.sourceInfo));
                    targetMatchableAttrs.push([dashCaseKey, binding.name]);
                }
                else if (isPresent(binding.expression)) {
                    this._parsePropertyAst(dashCaseKey, binding.expression, attr.sourceInfo, targetMatchableAttrs, targetProps);
                }
                else {
                    targetMatchableAttrs.push([dashCaseKey, '']);
                    this._parseLiteralAttr(dashCaseKey, null, attr.sourceInfo, targetProps);
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
                this._parseProperty(bindParts[5], attrValue, attr.sourceInfo, targetMatchableAttrs, targetProps);
            }
            else if (isPresent(bindParts[2])) {
                var identifier = bindParts[5];
                this._parseVariable(identifier, attrValue, attr.sourceInfo, targetVars);
            }
            else if (isPresent(bindParts[3])) {
                this._parseEvent(bindParts[5], attrValue, attr.sourceInfo, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[4])) {
                this._parseProperty(bindParts[5], attrValue, attr.sourceInfo, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[5], attrValue, attr.sourceInfo, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[6])) {
                this._parseProperty(bindParts[6], attrValue, attr.sourceInfo, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[6], attrValue, attr.sourceInfo, targetMatchableAttrs, targetEvents);
            }
            else if (isPresent(bindParts[7])) {
                this._parseProperty(bindParts[7], attrValue, attr.sourceInfo, targetMatchableAttrs, targetProps);
            }
            else if (isPresent(bindParts[8])) {
                this._parseEvent(bindParts[8], attrValue, attr.sourceInfo, targetMatchableAttrs, targetEvents);
            }
        }
        else {
            hasBinding = this._parsePropertyInterpolation(attrName, attrValue, attr.sourceInfo, targetMatchableAttrs, targetProps);
        }
        if (!hasBinding) {
            this._parseLiteralAttr(attrName, attrValue, attr.sourceInfo, targetProps);
        }
        return hasBinding;
    }
    _normalizeAttributeName(attrName) {
        return attrName.startsWith('data-') ? attrName.substring(5) : attrName;
    }
    _parseVariable(identifier, value, sourceInfo, targetVars) {
        targetVars.push(new VariableAst(dashCaseToCamelCase(identifier), value, sourceInfo));
    }
    _parseProperty(name, expression, sourceInfo, targetMatchableAttrs, targetProps) {
        this._parsePropertyAst(name, this._parseBinding(expression, sourceInfo), sourceInfo, targetMatchableAttrs, targetProps);
    }
    _parsePropertyInterpolation(name, value, sourceInfo, targetMatchableAttrs, targetProps) {
        var expr = this._parseInterpolation(value, sourceInfo);
        if (isPresent(expr)) {
            this._parsePropertyAst(name, expr, sourceInfo, targetMatchableAttrs, targetProps);
            return true;
        }
        return false;
    }
    _parsePropertyAst(name, ast, sourceInfo, targetMatchableAttrs, targetProps) {
        targetMatchableAttrs.push([name, ast.source]);
        targetProps.push(new BoundElementOrDirectiveProperty(name, ast, false, sourceInfo));
    }
    _parseAssignmentEvent(name, expression, sourceInfo, targetMatchableAttrs, targetEvents) {
        this._parseEvent(`${name}-change`, `${expression}=$event`, sourceInfo, targetMatchableAttrs, targetEvents);
    }
    _parseEvent(name, expression, sourceInfo, targetMatchableAttrs, targetEvents) {
        // long format: 'target: eventName'
        var parts = splitAtColon(name, [null, name]);
        var target = parts[0];
        var eventName = parts[1];
        targetEvents.push(new BoundEventAst(dashCaseToCamelCase(eventName), target, this._parseAction(expression, sourceInfo), sourceInfo));
        // Don't detect directives for event names for now,
        // so don't add the event name to the matchableAttrs
    }
    _parseLiteralAttr(name, value, sourceInfo, targetProps) {
        targetProps.push(new BoundElementOrDirectiveProperty(dashCaseToCamelCase(name), this._exprParser.wrapLiteralPrimitive(value, sourceInfo), true, sourceInfo));
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
    _createDirectiveAsts(elementName, directives, props, possibleExportAsVars, sourceInfo) {
        var matchedVariables = new Set();
        var directiveAsts = directives.map((directive) => {
            var hostProperties = [];
            var hostEvents = [];
            var directiveProperties = [];
            this._createDirectiveHostPropertyAsts(elementName, directive.hostProperties, sourceInfo, hostProperties);
            this._createDirectiveHostEventAsts(directive.hostListeners, sourceInfo, hostEvents);
            this._createDirectivePropertyAsts(directive.inputs, props, directiveProperties);
            var exportAsVars = [];
            possibleExportAsVars.forEach((varAst) => {
                if ((varAst.value.length === 0 && directive.isComponent) ||
                    (directive.exportAs == varAst.value)) {
                    exportAsVars.push(varAst);
                    matchedVariables.add(varAst.name);
                }
            });
            return new DirectiveAst(directive, directiveProperties, hostProperties, hostEvents, exportAsVars, sourceInfo);
        });
        possibleExportAsVars.forEach((varAst) => {
            if (varAst.value.length > 0 && !SetWrapper.has(matchedVariables, varAst.name)) {
                this._reportError(`There is no directive with "exportAs" set to "${varAst.value}" at ${varAst.sourceInfo}`);
            }
        });
        return directiveAsts;
    }
    _createDirectiveHostPropertyAsts(elementName, hostProps, sourceInfo, targetPropertyAsts) {
        if (isPresent(hostProps)) {
            StringMapWrapper.forEach(hostProps, (expression, propName) => {
                var exprAst = this._parseBinding(expression, sourceInfo);
                targetPropertyAsts.push(this._createElementPropertyAst(elementName, propName, exprAst, sourceInfo));
            });
        }
    }
    _createDirectiveHostEventAsts(hostListeners, sourceInfo, targetEventAsts) {
        if (isPresent(hostListeners)) {
            StringMapWrapper.forEach(hostListeners, (expression, propName) => {
                this._parseEvent(propName, expression, sourceInfo, [], targetEventAsts);
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
                    targetBoundDirectiveProps.push(new BoundDirectivePropertyAst(dirProp, boundProp.name, boundProp.expression, boundProp.sourceInfo));
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
                boundElementProps.push(this._createElementPropertyAst(elementName, prop.name, prop.expression, prop.sourceInfo));
            }
        });
        return boundElementProps;
    }
    _createElementPropertyAst(elementName, name, ast, sourceInfo) {
        var unit = null;
        var bindingType;
        var boundPropertyName;
        var parts = StringWrapper.split(name, PROPERTY_PARTS_SEPARATOR);
        if (parts.length === 1) {
            boundPropertyName = this._schemaRegistry.getMappedPropName(dashCaseToCamelCase(parts[0]));
            bindingType = PropertyBindingType.Property;
            if (!this._schemaRegistry.hasProperty(elementName, boundPropertyName)) {
                this._reportError(`Can't bind to '${boundPropertyName}' since it isn't a known native property in ${sourceInfo}`);
            }
        }
        else if (parts[0] == ATTRIBUTE_PREFIX) {
            boundPropertyName = dashCaseToCamelCase(parts[1]);
            bindingType = PropertyBindingType.Attribute;
        }
        else if (parts[0] == CLASS_PREFIX) {
            // keep original case!
            boundPropertyName = parts[1];
            bindingType = PropertyBindingType.Class;
        }
        else if (parts[0] == STYLE_PREFIX) {
            unit = parts.length > 2 ? parts[2] : null;
            boundPropertyName = dashCaseToCamelCase(parts[1]);
            bindingType = PropertyBindingType.Style;
        }
        else {
            this._reportError(`Invalid property name ${name} in ${sourceInfo}`);
            bindingType = null;
        }
        return new BoundElementPropertyAst(boundPropertyName, bindingType, ast, unit, sourceInfo);
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
    _assertOnlyOneComponent(directives, sourceInfo) {
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 1) {
            this._reportError(`More than one component: ${componentTypeNames.join(',')} in ${sourceInfo}`);
        }
    }
    _assertNoComponentsNorElementBindingsOnTemplate(directives, elementProps, sourceInfo) {
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 0) {
            this._reportError(`Components on an embedded template: ${componentTypeNames.join(',')} in ${sourceInfo}`);
        }
        elementProps.forEach(prop => {
            this._reportError(`Property binding ${prop.name} not used by any directive on an embedded template in ${prop.sourceInfo}`);
        });
    }
    _assertAllEventsPublishedByDirectives(directives, events, sourceInfo) {
        var allDirectiveEvents = new Set();
        directives.forEach(directive => {
            StringMapWrapper.forEach(directive.directive.outputs, (eventName, _) => { allDirectiveEvents.add(eventName); });
        });
        events.forEach(event => {
            if (isPresent(event.target) || !SetWrapper.has(allDirectiveEvents, event.name)) {
                this._reportError(`Event binding ${event.fullName} not emitted by any directive on an embedded template in ${sourceInfo}`);
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
        return new ElementAst(ast.name, htmlVisitAll(this, ast.attrs), [], [], [], [], children, ngContentIndex, ast.sourceInfo);
    }
    visitAttr(ast, context) {
        return new AttrAst(ast.name, ast.value, ast.sourceInfo);
    }
    visitText(ast, component) {
        var ngContentIndex = component.findNgContentIndex(TEXT_CSS_SELECTOR);
        return new TextAst(ast.value, ngContentIndex, ast.sourceInfo);
    }
}
class BoundElementOrDirectiveProperty {
    constructor(name, expression, isLiteral, sourceInfo) {
        this.name = name;
        this.expression = expression;
        this.isLiteral = isLiteral;
        this.sourceInfo = sourceInfo;
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
//# sourceMappingURL=template_parser.js.map