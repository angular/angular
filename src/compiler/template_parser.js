'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var di_1 = require('angular2/src/core/di');
var exceptions_1 = require('angular2/src/facade/exceptions');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var html_parser_1 = require('./html_parser');
var template_ast_1 = require('./template_ast');
var selector_1 = require('angular2/src/compiler/selector');
var element_schema_registry_1 = require('angular2/src/compiler/schema/element_schema_registry');
var template_preparser_1 = require('./template_preparser');
var style_url_resolver_1 = require('./style_url_resolver');
var html_ast_1 = require('./html_ast');
var util_1 = require('./util');
// Group 1 = "bind-"
// Group 2 = "var-" or "#"
// Group 3 = "on-"
// Group 4 = "bindon-"
// Group 5 = the identifier after "bind-", "var-/#", or "on-"
// Group 6 = idenitifer inside [()]
// Group 7 = idenitifer inside []
// Group 8 = identifier inside ()
var BIND_NAME_REGEXP = /^(?:(?:(?:(bind-)|(var-|#)|(on-)|(bindon-))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/g;
var TEMPLATE_ELEMENT = 'template';
var TEMPLATE_ATTR = 'template';
var TEMPLATE_ATTR_PREFIX = '*';
var CLASS_ATTR = 'class';
var PROPERTY_PARTS_SEPARATOR = new RegExp('\\.');
var ATTRIBUTE_PREFIX = 'attr';
var CLASS_PREFIX = 'class';
var STYLE_PREFIX = 'style';
var TEXT_CSS_SELECTOR = selector_1.CssSelector.parse('*')[0];
var TemplateParser = (function () {
    function TemplateParser(_exprParser, _schemaRegistry, _htmlParser) {
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this._htmlParser = _htmlParser;
    }
    TemplateParser.prototype.parse = function (template, directives, sourceInfo) {
        var parseVisitor = new TemplateParseVisitor(directives, this._exprParser, this._schemaRegistry);
        var result = html_ast_1.htmlVisitAll(parseVisitor, this._htmlParser.parse(template, sourceInfo), EMPTY_COMPONENT);
        if (parseVisitor.errors.length > 0) {
            var errorString = parseVisitor.errors.join('\n');
            throw new exceptions_1.BaseException("Template parse errors:\n" + errorString);
        }
        return result;
    };
    TemplateParser = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [change_detection_1.Parser, element_schema_registry_1.ElementSchemaRegistry, html_parser_1.HtmlParser])
    ], TemplateParser);
    return TemplateParser;
})();
exports.TemplateParser = TemplateParser;
var TemplateParseVisitor = (function () {
    function TemplateParseVisitor(directives, _exprParser, _schemaRegistry) {
        var _this = this;
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this.errors = [];
        this.directivesIndex = new Map();
        this.ngContentCount = 0;
        this.selectorMatcher = new selector_1.SelectorMatcher();
        collection_1.ListWrapper.forEachWithIndex(directives, function (directive, index) {
            var selector = selector_1.CssSelector.parse(directive.selector);
            _this.selectorMatcher.addSelectables(selector, directive);
            _this.directivesIndex.set(directive, index);
        });
    }
    TemplateParseVisitor.prototype._reportError = function (message) { this.errors.push(message); };
    TemplateParseVisitor.prototype._parseInterpolation = function (value, sourceInfo) {
        try {
            return this._exprParser.parseInterpolation(value, sourceInfo);
        }
        catch (e) {
            this._reportError("" + e); // sourceInfo is already contained in the AST
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    };
    TemplateParseVisitor.prototype._parseAction = function (value, sourceInfo) {
        try {
            return this._exprParser.parseAction(value, sourceInfo);
        }
        catch (e) {
            this._reportError("" + e); // sourceInfo is already contained in the AST
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    };
    TemplateParseVisitor.prototype._parseBinding = function (value, sourceInfo) {
        try {
            return this._exprParser.parseBinding(value, sourceInfo);
        }
        catch (e) {
            this._reportError("" + e); // sourceInfo is already contained in the AST
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    };
    TemplateParseVisitor.prototype._parseTemplateBindings = function (value, sourceInfo) {
        try {
            return this._exprParser.parseTemplateBindings(value, sourceInfo);
        }
        catch (e) {
            this._reportError("" + e); // sourceInfo is already contained in the AST
            return [];
        }
    };
    TemplateParseVisitor.prototype.visitText = function (ast, component) {
        var ngContentIndex = component.findNgContentIndex(TEXT_CSS_SELECTOR);
        var expr = this._parseInterpolation(ast.value, ast.sourceInfo);
        if (lang_1.isPresent(expr)) {
            return new template_ast_1.BoundTextAst(expr, ngContentIndex, ast.sourceInfo);
        }
        else {
            return new template_ast_1.TextAst(ast.value, ngContentIndex, ast.sourceInfo);
        }
    };
    TemplateParseVisitor.prototype.visitAttr = function (ast, contex) {
        return new template_ast_1.AttrAst(ast.name, ast.value, ast.sourceInfo);
    };
    TemplateParseVisitor.prototype.visitElement = function (element, component) {
        var _this = this;
        var nodeName = element.name;
        var preparsedElement = template_preparser_1.preparseElement(element);
        if (preparsedElement.type === template_preparser_1.PreparsedElementType.SCRIPT ||
            preparsedElement.type === template_preparser_1.PreparsedElementType.STYLE) {
            // Skipping <script> for security reasons
            // Skipping <style> as we already processed them
            // in the StyleCompiler
            return null;
        }
        if (preparsedElement.type === template_preparser_1.PreparsedElementType.STYLESHEET &&
            style_url_resolver_1.isStyleUrlResolvable(preparsedElement.hrefAttr)) {
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
        element.attrs.forEach(function (attr) {
            matchableAttrs.push([attr.name, attr.value]);
            var hasBinding = _this._parseAttr(attr, matchableAttrs, elementOrDirectiveProps, events, vars);
            var hasTemplateBinding = _this._parseInlineTemplateBinding(attr, templateMatchableAttrs, templateElementOrDirectiveProps, templateVars);
            if (!hasBinding && !hasTemplateBinding) {
                // don't include the bindings as attributes as well in the AST
                attrs.push(_this.visitAttr(attr, null));
            }
            if (hasTemplateBinding) {
                hasInlineTemplates = true;
            }
        });
        var isTemplateElement = nodeName == TEMPLATE_ELEMENT;
        var elementCssSelector = createElementCssSelector(nodeName, matchableAttrs);
        var directives = this._createDirectiveAsts(element.name, this._parseDirectives(this.selectorMatcher, elementCssSelector), elementOrDirectiveProps, isTemplateElement ? [] : vars, element.sourceInfo);
        var elementProps = this._createElementPropertyAsts(element.name, elementOrDirectiveProps, directives);
        var children = html_ast_1.htmlVisitAll(preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children, Component.create(directives));
        var elementNgContentIndex = hasInlineTemplates ? null : component.findNgContentIndex(elementCssSelector);
        var parsedElement;
        if (preparsedElement.type === template_preparser_1.PreparsedElementType.NG_CONTENT) {
            parsedElement =
                new template_ast_1.NgContentAst(this.ngContentCount++, elementNgContentIndex, element.sourceInfo);
        }
        else if (isTemplateElement) {
            this._assertAllEventsPublishedByDirectives(directives, events, element.sourceInfo);
            this._assertNoComponentsNorElementBindingsOnTemplate(directives, elementProps, element.sourceInfo);
            parsedElement = new template_ast_1.EmbeddedTemplateAst(attrs, events, vars, directives, children, elementNgContentIndex, element.sourceInfo);
        }
        else {
            this._assertOnlyOneComponent(directives, element.sourceInfo);
            var elementExportAsVars = vars.filter(function (varAst) { return varAst.value.length === 0; });
            parsedElement =
                new template_ast_1.ElementAst(nodeName, attrs, elementProps, events, elementExportAsVars, directives, children, elementNgContentIndex, element.sourceInfo);
        }
        if (hasInlineTemplates) {
            var templateCssSelector = createElementCssSelector(TEMPLATE_ELEMENT, templateMatchableAttrs);
            var templateDirectives = this._createDirectiveAsts(element.name, this._parseDirectives(this.selectorMatcher, templateCssSelector), templateElementOrDirectiveProps, [], element.sourceInfo);
            var templateElementProps = this._createElementPropertyAsts(element.name, templateElementOrDirectiveProps, templateDirectives);
            this._assertNoComponentsNorElementBindingsOnTemplate(templateDirectives, templateElementProps, element.sourceInfo);
            parsedElement = new template_ast_1.EmbeddedTemplateAst([], [], templateVars, templateDirectives, [parsedElement], component.findNgContentIndex(templateCssSelector), element.sourceInfo);
        }
        return parsedElement;
    };
    TemplateParseVisitor.prototype._parseInlineTemplateBinding = function (attr, targetMatchableAttrs, targetProps, targetVars) {
        var templateBindingsSource = null;
        if (attr.name == TEMPLATE_ATTR) {
            templateBindingsSource = attr.value;
        }
        else if (attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
            var key = attr.name.substring(TEMPLATE_ATTR_PREFIX.length); // remove the star
            templateBindingsSource = (attr.value.length == 0) ? key : key + ' ' + attr.value;
        }
        if (lang_1.isPresent(templateBindingsSource)) {
            var bindings = this._parseTemplateBindings(templateBindingsSource, attr.sourceInfo);
            for (var i = 0; i < bindings.length; i++) {
                var binding = bindings[i];
                var dashCaseKey = util_1.camelCaseToDashCase(binding.key);
                if (binding.keyIsVar) {
                    targetVars.push(new template_ast_1.VariableAst(util_1.dashCaseToCamelCase(binding.key), binding.name, attr.sourceInfo));
                    targetMatchableAttrs.push([dashCaseKey, binding.name]);
                }
                else if (lang_1.isPresent(binding.expression)) {
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
    };
    TemplateParseVisitor.prototype._parseAttr = function (attr, targetMatchableAttrs, targetProps, targetEvents, targetVars) {
        var attrName = this._normalizeAttributeName(attr.name);
        var attrValue = attr.value;
        var bindParts = lang_1.RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
        var hasBinding = false;
        if (lang_1.isPresent(bindParts)) {
            hasBinding = true;
            if (lang_1.isPresent(bindParts[1])) {
                this._parseProperty(bindParts[5], attrValue, attr.sourceInfo, targetMatchableAttrs, targetProps);
            }
            else if (lang_1.isPresent(bindParts[2])) {
                var identifier = bindParts[5];
                this._parseVariable(identifier, attrValue, attr.sourceInfo, targetVars);
            }
            else if (lang_1.isPresent(bindParts[3])) {
                this._parseEvent(bindParts[5], attrValue, attr.sourceInfo, targetMatchableAttrs, targetEvents);
            }
            else if (lang_1.isPresent(bindParts[4])) {
                this._parseProperty(bindParts[5], attrValue, attr.sourceInfo, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[5], attrValue, attr.sourceInfo, targetMatchableAttrs, targetEvents);
            }
            else if (lang_1.isPresent(bindParts[6])) {
                this._parseProperty(bindParts[6], attrValue, attr.sourceInfo, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[6], attrValue, attr.sourceInfo, targetMatchableAttrs, targetEvents);
            }
            else if (lang_1.isPresent(bindParts[7])) {
                this._parseProperty(bindParts[7], attrValue, attr.sourceInfo, targetMatchableAttrs, targetProps);
            }
            else if (lang_1.isPresent(bindParts[8])) {
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
    };
    TemplateParseVisitor.prototype._normalizeAttributeName = function (attrName) {
        return attrName.startsWith('data-') ? attrName.substring(5) : attrName;
    };
    TemplateParseVisitor.prototype._parseVariable = function (identifier, value, sourceInfo, targetVars) {
        targetVars.push(new template_ast_1.VariableAst(util_1.dashCaseToCamelCase(identifier), value, sourceInfo));
    };
    TemplateParseVisitor.prototype._parseProperty = function (name, expression, sourceInfo, targetMatchableAttrs, targetProps) {
        this._parsePropertyAst(name, this._parseBinding(expression, sourceInfo), sourceInfo, targetMatchableAttrs, targetProps);
    };
    TemplateParseVisitor.prototype._parsePropertyInterpolation = function (name, value, sourceInfo, targetMatchableAttrs, targetProps) {
        var expr = this._parseInterpolation(value, sourceInfo);
        if (lang_1.isPresent(expr)) {
            this._parsePropertyAst(name, expr, sourceInfo, targetMatchableAttrs, targetProps);
            return true;
        }
        return false;
    };
    TemplateParseVisitor.prototype._parsePropertyAst = function (name, ast, sourceInfo, targetMatchableAttrs, targetProps) {
        targetMatchableAttrs.push([name, ast.source]);
        targetProps.push(new BoundElementOrDirectiveProperty(name, ast, false, sourceInfo));
    };
    TemplateParseVisitor.prototype._parseAssignmentEvent = function (name, expression, sourceInfo, targetMatchableAttrs, targetEvents) {
        this._parseEvent(name + "-change", expression + "=$event", sourceInfo, targetMatchableAttrs, targetEvents);
    };
    TemplateParseVisitor.prototype._parseEvent = function (name, expression, sourceInfo, targetMatchableAttrs, targetEvents) {
        // long format: 'target: eventName'
        var parts = util_1.splitAtColon(name, [null, name]);
        var target = parts[0];
        var eventName = parts[1];
        targetEvents.push(new template_ast_1.BoundEventAst(util_1.dashCaseToCamelCase(eventName), target, this._parseAction(expression, sourceInfo), sourceInfo));
        // Don't detect directives for event names for now,
        // so don't add the event name to the matchableAttrs
    };
    TemplateParseVisitor.prototype._parseLiteralAttr = function (name, value, sourceInfo, targetProps) {
        targetProps.push(new BoundElementOrDirectiveProperty(util_1.dashCaseToCamelCase(name), this._exprParser.wrapLiteralPrimitive(value, sourceInfo), true, sourceInfo));
    };
    TemplateParseVisitor.prototype._parseDirectives = function (selectorMatcher, elementCssSelector) {
        var _this = this;
        var directives = [];
        selectorMatcher.match(elementCssSelector, function (selector, directive) { directives.push(directive); });
        // Need to sort the directives so that we get consistent results throughout,
        // as selectorMatcher uses Maps inside.
        // Also need to make components the first directive in the array
        collection_1.ListWrapper.sort(directives, function (dir1, dir2) {
            var dir1Comp = dir1.isComponent;
            var dir2Comp = dir2.isComponent;
            if (dir1Comp && !dir2Comp) {
                return -1;
            }
            else if (!dir1Comp && dir2Comp) {
                return 1;
            }
            else {
                return _this.directivesIndex.get(dir1) - _this.directivesIndex.get(dir2);
            }
        });
        return directives;
    };
    TemplateParseVisitor.prototype._createDirectiveAsts = function (elementName, directives, props, possibleExportAsVars, sourceInfo) {
        var _this = this;
        var matchedVariables = new Set();
        var directiveAsts = directives.map(function (directive) {
            var hostProperties = [];
            var hostEvents = [];
            var directiveProperties = [];
            _this._createDirectiveHostPropertyAsts(elementName, directive.hostProperties, sourceInfo, hostProperties);
            _this._createDirectiveHostEventAsts(directive.hostListeners, sourceInfo, hostEvents);
            _this._createDirectivePropertyAsts(directive.inputs, props, directiveProperties);
            var exportAsVars = [];
            possibleExportAsVars.forEach(function (varAst) {
                if ((varAst.value.length === 0 && directive.isComponent) ||
                    (directive.exportAs == varAst.value)) {
                    exportAsVars.push(varAst);
                    matchedVariables.add(varAst.name);
                }
            });
            return new template_ast_1.DirectiveAst(directive, directiveProperties, hostProperties, hostEvents, exportAsVars, sourceInfo);
        });
        possibleExportAsVars.forEach(function (varAst) {
            if (varAst.value.length > 0 && !collection_1.SetWrapper.has(matchedVariables, varAst.name)) {
                _this._reportError("There is no directive with \"exportAs\" set to \"" + varAst.value + "\" at " + varAst.sourceInfo);
            }
        });
        return directiveAsts;
    };
    TemplateParseVisitor.prototype._createDirectiveHostPropertyAsts = function (elementName, hostProps, sourceInfo, targetPropertyAsts) {
        var _this = this;
        if (lang_1.isPresent(hostProps)) {
            collection_1.StringMapWrapper.forEach(hostProps, function (expression, propName) {
                var exprAst = _this._parseBinding(expression, sourceInfo);
                targetPropertyAsts.push(_this._createElementPropertyAst(elementName, propName, exprAst, sourceInfo));
            });
        }
    };
    TemplateParseVisitor.prototype._createDirectiveHostEventAsts = function (hostListeners, sourceInfo, targetEventAsts) {
        var _this = this;
        if (lang_1.isPresent(hostListeners)) {
            collection_1.StringMapWrapper.forEach(hostListeners, function (expression, propName) {
                _this._parseEvent(propName, expression, sourceInfo, [], targetEventAsts);
            });
        }
    };
    TemplateParseVisitor.prototype._createDirectivePropertyAsts = function (directiveProperties, boundProps, targetBoundDirectiveProps) {
        if (lang_1.isPresent(directiveProperties)) {
            var boundPropsByName = new Map();
            boundProps.forEach(function (boundProp) {
                var key = util_1.dashCaseToCamelCase(boundProp.name);
                var prevValue = boundPropsByName.get(boundProp.name);
                if (lang_1.isBlank(prevValue) || prevValue.isLiteral) {
                    // give [a]="b" a higher precedence thatn a="b" on the same element
                    boundPropsByName.set(key, boundProp);
                }
            });
            collection_1.StringMapWrapper.forEach(directiveProperties, function (elProp, dirProp) {
                elProp = util_1.dashCaseToCamelCase(elProp);
                var boundProp = boundPropsByName.get(elProp);
                // Bindings are optional, so this binding only needs to be set up if an expression is given.
                if (lang_1.isPresent(boundProp)) {
                    targetBoundDirectiveProps.push(new template_ast_1.BoundDirectivePropertyAst(dirProp, boundProp.name, boundProp.expression, boundProp.sourceInfo));
                }
            });
        }
    };
    TemplateParseVisitor.prototype._createElementPropertyAsts = function (elementName, props, directives) {
        var _this = this;
        var boundElementProps = [];
        var boundDirectivePropsIndex = new Map();
        directives.forEach(function (directive) {
            directive.inputs.forEach(function (prop) {
                boundDirectivePropsIndex.set(prop.templateName, prop);
            });
        });
        props.forEach(function (prop) {
            if (!prop.isLiteral && lang_1.isBlank(boundDirectivePropsIndex.get(prop.name))) {
                boundElementProps.push(_this._createElementPropertyAst(elementName, prop.name, prop.expression, prop.sourceInfo));
            }
        });
        return boundElementProps;
    };
    TemplateParseVisitor.prototype._createElementPropertyAst = function (elementName, name, ast, sourceInfo) {
        var unit = null;
        var bindingType;
        var boundPropertyName;
        var parts = lang_1.StringWrapper.split(name, PROPERTY_PARTS_SEPARATOR);
        if (parts.length === 1) {
            boundPropertyName = this._schemaRegistry.getMappedPropName(util_1.dashCaseToCamelCase(parts[0]));
            bindingType = template_ast_1.PropertyBindingType.Property;
            if (!this._schemaRegistry.hasProperty(elementName, boundPropertyName)) {
                this._reportError("Can't bind to '" + boundPropertyName + "' since it isn't a known native property in " + sourceInfo);
            }
        }
        else if (parts[0] == ATTRIBUTE_PREFIX) {
            boundPropertyName = util_1.dashCaseToCamelCase(parts[1]);
            bindingType = template_ast_1.PropertyBindingType.Attribute;
        }
        else if (parts[0] == CLASS_PREFIX) {
            // keep original case!
            boundPropertyName = parts[1];
            bindingType = template_ast_1.PropertyBindingType.Class;
        }
        else if (parts[0] == STYLE_PREFIX) {
            unit = parts.length > 2 ? parts[2] : null;
            boundPropertyName = util_1.dashCaseToCamelCase(parts[1]);
            bindingType = template_ast_1.PropertyBindingType.Style;
        }
        else {
            this._reportError("Invalid property name " + name + " in " + sourceInfo);
            bindingType = null;
        }
        return new template_ast_1.BoundElementPropertyAst(boundPropertyName, bindingType, ast, unit, sourceInfo);
    };
    TemplateParseVisitor.prototype._findComponentDirectiveNames = function (directives) {
        var componentTypeNames = [];
        directives.forEach(function (directive) {
            var typeName = directive.directive.type.name;
            if (directive.directive.isComponent) {
                componentTypeNames.push(typeName);
            }
        });
        return componentTypeNames;
    };
    TemplateParseVisitor.prototype._assertOnlyOneComponent = function (directives, sourceInfo) {
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 1) {
            this._reportError("More than one component: " + componentTypeNames.join(',') + " in " + sourceInfo);
        }
    };
    TemplateParseVisitor.prototype._assertNoComponentsNorElementBindingsOnTemplate = function (directives, elementProps, sourceInfo) {
        var _this = this;
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 0) {
            this._reportError("Components on an embedded template: " + componentTypeNames.join(',') + " in " + sourceInfo);
        }
        elementProps.forEach(function (prop) {
            _this._reportError("Property binding " + prop.name + " not used by any directive on an embedded template in " + prop.sourceInfo);
        });
    };
    TemplateParseVisitor.prototype._assertAllEventsPublishedByDirectives = function (directives, events, sourceInfo) {
        var _this = this;
        var allDirectiveEvents = new Set();
        directives.forEach(function (directive) {
            collection_1.StringMapWrapper.forEach(directive.directive.outputs, function (eventName, _) { allDirectiveEvents.add(eventName); });
        });
        events.forEach(function (event) {
            if (lang_1.isPresent(event.target) || !collection_1.SetWrapper.has(allDirectiveEvents, event.name)) {
                _this._reportError("Event binding " + event.fullName + " not emitted by any directive on an embedded template in " + sourceInfo);
            }
        });
    };
    return TemplateParseVisitor;
})();
var NonBindableVisitor = (function () {
    function NonBindableVisitor() {
    }
    NonBindableVisitor.prototype.visitElement = function (ast, component) {
        var preparsedElement = template_preparser_1.preparseElement(ast);
        if (preparsedElement.type === template_preparser_1.PreparsedElementType.SCRIPT ||
            preparsedElement.type === template_preparser_1.PreparsedElementType.STYLE ||
            preparsedElement.type === template_preparser_1.PreparsedElementType.STYLESHEET) {
            // Skipping <script> for security reasons
            // Skipping <style> and stylesheets as we already processed them
            // in the StyleCompiler
            return null;
        }
        var attrNameAndValues = ast.attrs.map(function (attrAst) { return [attrAst.name, attrAst.value]; });
        var selector = createElementCssSelector(ast.name, attrNameAndValues);
        var ngContentIndex = component.findNgContentIndex(selector);
        var children = html_ast_1.htmlVisitAll(this, ast.children, EMPTY_COMPONENT);
        return new template_ast_1.ElementAst(ast.name, html_ast_1.htmlVisitAll(this, ast.attrs), [], [], [], [], children, ngContentIndex, ast.sourceInfo);
    };
    NonBindableVisitor.prototype.visitAttr = function (ast, context) {
        return new template_ast_1.AttrAst(ast.name, ast.value, ast.sourceInfo);
    };
    NonBindableVisitor.prototype.visitText = function (ast, component) {
        var ngContentIndex = component.findNgContentIndex(TEXT_CSS_SELECTOR);
        return new template_ast_1.TextAst(ast.value, ngContentIndex, ast.sourceInfo);
    };
    return NonBindableVisitor;
})();
var BoundElementOrDirectiveProperty = (function () {
    function BoundElementOrDirectiveProperty(name, expression, isLiteral, sourceInfo) {
        this.name = name;
        this.expression = expression;
        this.isLiteral = isLiteral;
        this.sourceInfo = sourceInfo;
    }
    return BoundElementOrDirectiveProperty;
})();
function splitClasses(classAttrValue) {
    return lang_1.StringWrapper.split(classAttrValue.trim(), /\s+/g);
}
exports.splitClasses = splitClasses;
var Component = (function () {
    function Component(ngContentIndexMatcher, wildcardNgContentIndex) {
        this.ngContentIndexMatcher = ngContentIndexMatcher;
        this.wildcardNgContentIndex = wildcardNgContentIndex;
    }
    Component.create = function (directives) {
        if (directives.length === 0 || !directives[0].directive.isComponent) {
            return EMPTY_COMPONENT;
        }
        var matcher = new selector_1.SelectorMatcher();
        var ngContentSelectors = directives[0].directive.template.ngContentSelectors;
        var wildcardNgContentIndex = null;
        for (var i = 0; i < ngContentSelectors.length; i++) {
            var selector = ngContentSelectors[i];
            if (lang_1.StringWrapper.equals(selector, '*')) {
                wildcardNgContentIndex = i;
            }
            else {
                matcher.addSelectables(selector_1.CssSelector.parse(ngContentSelectors[i]), i);
            }
        }
        return new Component(matcher, wildcardNgContentIndex);
    };
    Component.prototype.findNgContentIndex = function (selector) {
        var ngContentIndices = [];
        this.ngContentIndexMatcher.match(selector, function (selector, ngContentIndex) { ngContentIndices.push(ngContentIndex); });
        collection_1.ListWrapper.sort(ngContentIndices);
        if (lang_1.isPresent(this.wildcardNgContentIndex)) {
            ngContentIndices.push(this.wildcardNgContentIndex);
        }
        return ngContentIndices.length > 0 ? ngContentIndices[0] : null;
    };
    return Component;
})();
function createElementCssSelector(elementName, matchableAttrs) {
    var cssSelector = new selector_1.CssSelector();
    cssSelector.setElement(elementName);
    for (var i = 0; i < matchableAttrs.length; i++) {
        var attrName = matchableAttrs[i][0].toLowerCase();
        var attrValue = matchableAttrs[i][1];
        cssSelector.addAttribute(attrName, attrValue);
        if (attrName == CLASS_ATTR) {
            var classes = splitClasses(attrValue);
            classes.forEach(function (className) { return cssSelector.addClassName(className); });
        }
    }
    return cssSelector;
}
var EMPTY_COMPONENT = new Component(new selector_1.SelectorMatcher(), null);
var NON_BINDABLE_VISITOR = new NonBindableVisitor();
//# sourceMappingURL=template_parser.js.map