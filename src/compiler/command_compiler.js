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
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var template_commands_1 = require('angular2/src/core/linker/template_commands');
var template_ast_1 = require('./template_ast');
var source_module_1 = require('./source_module');
var util_1 = require('./util');
var di_1 = require('angular2/src/core/di');
exports.TEMPLATE_COMMANDS_MODULE_REF = source_module_1.moduleRef("package:angular2/src/core/linker/template_commands" + util_1.MODULE_SUFFIX);
var IMPLICIT_TEMPLATE_VAR = '\$implicit';
var CLASS_ATTR = 'class';
var STYLE_ATTR = 'style';
var CommandCompiler = (function () {
    function CommandCompiler() {
    }
    CommandCompiler.prototype.compileComponentRuntime = function (component, template, changeDetectorFactories, componentTemplateFactory) {
        var visitor = new CommandBuilderVisitor(new RuntimeCommandFactory(component, componentTemplateFactory, changeDetectorFactories), 0);
        template_ast_1.templateVisitAll(visitor, template);
        return visitor.result;
    };
    CommandCompiler.prototype.compileComponentCodeGen = function (component, template, changeDetectorFactoryExpressions, componentTemplateFactory) {
        var visitor = new CommandBuilderVisitor(new CodegenCommandFactory(component, componentTemplateFactory, changeDetectorFactoryExpressions), 0);
        template_ast_1.templateVisitAll(visitor, template);
        return new source_module_1.SourceExpression([], codeGenArray(visitor.result));
    };
    CommandCompiler = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], CommandCompiler);
    return CommandCompiler;
})();
exports.CommandCompiler = CommandCompiler;
var RuntimeCommandFactory = (function () {
    function RuntimeCommandFactory(component, componentTemplateFactory, changeDetectorFactories) {
        this.component = component;
        this.componentTemplateFactory = componentTemplateFactory;
        this.changeDetectorFactories = changeDetectorFactories;
    }
    RuntimeCommandFactory.prototype._mapDirectives = function (directives) {
        return directives.map(function (directive) { return directive.type.runtime; });
    };
    RuntimeCommandFactory.prototype.createText = function (value, isBound, ngContentIndex) {
        return new template_commands_1.TextCmd(value, isBound, ngContentIndex);
    };
    RuntimeCommandFactory.prototype.createNgContent = function (index, ngContentIndex) {
        return new template_commands_1.NgContentCmd(index, ngContentIndex);
    };
    RuntimeCommandFactory.prototype.createBeginElement = function (name, attrNameAndValues, eventTargetAndNames, variableNameAndValues, directives, isBound, ngContentIndex) {
        return new template_commands_1.BeginElementCmd(name, attrNameAndValues, eventTargetAndNames, variableNameAndValues, this._mapDirectives(directives), isBound, ngContentIndex);
    };
    RuntimeCommandFactory.prototype.createEndElement = function () { return new template_commands_1.EndElementCmd(); };
    RuntimeCommandFactory.prototype.createBeginComponent = function (name, attrNameAndValues, eventTargetAndNames, variableNameAndValues, directives, encapsulation, ngContentIndex) {
        var nestedTemplateAccessor = this.componentTemplateFactory(directives[0]);
        return new template_commands_1.BeginComponentCmd(name, attrNameAndValues, eventTargetAndNames, variableNameAndValues, this._mapDirectives(directives), encapsulation, ngContentIndex, nestedTemplateAccessor);
    };
    RuntimeCommandFactory.prototype.createEndComponent = function () { return new template_commands_1.EndComponentCmd(); };
    RuntimeCommandFactory.prototype.createEmbeddedTemplate = function (embeddedTemplateIndex, attrNameAndValues, variableNameAndValues, directives, isMerged, ngContentIndex, children) {
        return new template_commands_1.EmbeddedTemplateCmd(attrNameAndValues, variableNameAndValues, this._mapDirectives(directives), isMerged, ngContentIndex, this.changeDetectorFactories[embeddedTemplateIndex], children);
    };
    return RuntimeCommandFactory;
})();
var CodegenCommandFactory = (function () {
    function CodegenCommandFactory(component, componentTemplateFactory, changeDetectorFactoryExpressions) {
        this.component = component;
        this.componentTemplateFactory = componentTemplateFactory;
        this.changeDetectorFactoryExpressions = changeDetectorFactoryExpressions;
    }
    CodegenCommandFactory.prototype.createText = function (value, isBound, ngContentIndex) {
        return new Expression(util_1.codeGenConstConstructorCall(exports.TEMPLATE_COMMANDS_MODULE_REF + 'TextCmd') + "(" + util_1.escapeSingleQuoteString(value) + ", " + isBound + ", " + ngContentIndex + ")");
    };
    CodegenCommandFactory.prototype.createNgContent = function (index, ngContentIndex) {
        return new Expression(util_1.codeGenConstConstructorCall(exports.TEMPLATE_COMMANDS_MODULE_REF + 'NgContentCmd') + "(" + index + ", " + ngContentIndex + ")");
    };
    CodegenCommandFactory.prototype.createBeginElement = function (name, attrNameAndValues, eventTargetAndNames, variableNameAndValues, directives, isBound, ngContentIndex) {
        var attrsExpression = codeGenArray(attrNameAndValues);
        return new Expression((util_1.codeGenConstConstructorCall(exports.TEMPLATE_COMMANDS_MODULE_REF + 'BeginElementCmd') + "(" + util_1.escapeSingleQuoteString(name) + ", " + attrsExpression + ", ") +
            (codeGenArray(eventTargetAndNames) + ", " + codeGenArray(variableNameAndValues) + ", " + codeGenDirectivesArray(directives) + ", " + isBound + ", " + ngContentIndex + ")"));
    };
    CodegenCommandFactory.prototype.createEndElement = function () {
        return new Expression(util_1.codeGenConstConstructorCall(exports.TEMPLATE_COMMANDS_MODULE_REF + 'EndElementCmd') + "()");
    };
    CodegenCommandFactory.prototype.createBeginComponent = function (name, attrNameAndValues, eventTargetAndNames, variableNameAndValues, directives, encapsulation, ngContentIndex) {
        var attrsExpression = codeGenArray(attrNameAndValues);
        return new Expression((util_1.codeGenConstConstructorCall(exports.TEMPLATE_COMMANDS_MODULE_REF + 'BeginComponentCmd') + "(" + util_1.escapeSingleQuoteString(name) + ", " + attrsExpression + ", ") +
            (codeGenArray(eventTargetAndNames) + ", " + codeGenArray(variableNameAndValues) + ", " + codeGenDirectivesArray(directives) + ", " + codeGenViewEncapsulation(encapsulation) + ", " + ngContentIndex + ", " + this.componentTemplateFactory(directives[0]) + ")"));
    };
    CodegenCommandFactory.prototype.createEndComponent = function () {
        return new Expression(util_1.codeGenConstConstructorCall(exports.TEMPLATE_COMMANDS_MODULE_REF + 'EndComponentCmd') + "()");
    };
    CodegenCommandFactory.prototype.createEmbeddedTemplate = function (embeddedTemplateIndex, attrNameAndValues, variableNameAndValues, directives, isMerged, ngContentIndex, children) {
        return new Expression((util_1.codeGenConstConstructorCall(exports.TEMPLATE_COMMANDS_MODULE_REF + 'EmbeddedTemplateCmd') + "(" + codeGenArray(attrNameAndValues) + ", " + codeGenArray(variableNameAndValues) + ", ") +
            (codeGenDirectivesArray(directives) + ", " + isMerged + ", " + ngContentIndex + ", " + this.changeDetectorFactoryExpressions[embeddedTemplateIndex] + ", " + codeGenArray(children) + ")"));
    };
    return CodegenCommandFactory;
})();
function visitAndReturnContext(visitor, asts, context) {
    template_ast_1.templateVisitAll(visitor, asts, context);
    return context;
}
var CommandBuilderVisitor = (function () {
    function CommandBuilderVisitor(commandFactory, embeddedTemplateIndex) {
        this.commandFactory = commandFactory;
        this.embeddedTemplateIndex = embeddedTemplateIndex;
        this.result = [];
        this.transitiveNgContentCount = 0;
    }
    CommandBuilderVisitor.prototype._readAttrNameAndValues = function (directives, attrAsts) {
        var attrs = keyValueArrayToMap(visitAndReturnContext(this, attrAsts, []));
        directives.forEach(function (directiveMeta) {
            collection_1.StringMapWrapper.forEach(directiveMeta.hostAttributes, function (value, name) {
                var prevValue = attrs[name];
                attrs[name] = lang_1.isPresent(prevValue) ? mergeAttributeValue(name, prevValue, value) : value;
            });
        });
        return mapToKeyValueArray(attrs);
    };
    CommandBuilderVisitor.prototype.visitNgContent = function (ast, context) {
        this.transitiveNgContentCount++;
        this.result.push(this.commandFactory.createNgContent(ast.index, ast.ngContentIndex));
        return null;
    };
    CommandBuilderVisitor.prototype.visitEmbeddedTemplate = function (ast, context) {
        var _this = this;
        this.embeddedTemplateIndex++;
        var childVisitor = new CommandBuilderVisitor(this.commandFactory, this.embeddedTemplateIndex);
        template_ast_1.templateVisitAll(childVisitor, ast.children);
        var isMerged = childVisitor.transitiveNgContentCount > 0;
        var variableNameAndValues = [];
        ast.vars.forEach(function (varAst) {
            variableNameAndValues.push(varAst.name);
            variableNameAndValues.push(varAst.value.length > 0 ? varAst.value : IMPLICIT_TEMPLATE_VAR);
        });
        var directives = [];
        collection_1.ListWrapper.forEachWithIndex(ast.directives, function (directiveAst, index) {
            directiveAst.visit(_this, new DirectiveContext(index, [], [], directives));
        });
        this.result.push(this.commandFactory.createEmbeddedTemplate(this.embeddedTemplateIndex, this._readAttrNameAndValues(directives, ast.attrs), variableNameAndValues, directives, isMerged, ast.ngContentIndex, childVisitor.result));
        this.transitiveNgContentCount += childVisitor.transitiveNgContentCount;
        this.embeddedTemplateIndex = childVisitor.embeddedTemplateIndex;
        return null;
    };
    CommandBuilderVisitor.prototype.visitElement = function (ast, context) {
        var _this = this;
        var component = ast.getComponent();
        var eventTargetAndNames = visitAndReturnContext(this, ast.outputs, []);
        var variableNameAndValues = [];
        if (lang_1.isBlank(component)) {
            ast.exportAsVars.forEach(function (varAst) {
                variableNameAndValues.push(varAst.name);
                variableNameAndValues.push(null);
            });
        }
        var directives = [];
        collection_1.ListWrapper.forEachWithIndex(ast.directives, function (directiveAst, index) {
            directiveAst.visit(_this, new DirectiveContext(index, eventTargetAndNames, variableNameAndValues, directives));
        });
        eventTargetAndNames = removeKeyValueArrayDuplicates(eventTargetAndNames);
        var attrNameAndValues = this._readAttrNameAndValues(directives, ast.attrs);
        if (lang_1.isPresent(component)) {
            this.result.push(this.commandFactory.createBeginComponent(ast.name, attrNameAndValues, eventTargetAndNames, variableNameAndValues, directives, component.template.encapsulation, ast.ngContentIndex));
            template_ast_1.templateVisitAll(this, ast.children);
            this.result.push(this.commandFactory.createEndComponent());
        }
        else {
            this.result.push(this.commandFactory.createBeginElement(ast.name, attrNameAndValues, eventTargetAndNames, variableNameAndValues, directives, ast.isBound(), ast.ngContentIndex));
            template_ast_1.templateVisitAll(this, ast.children);
            this.result.push(this.commandFactory.createEndElement());
        }
        return null;
    };
    CommandBuilderVisitor.prototype.visitVariable = function (ast, ctx) { return null; };
    CommandBuilderVisitor.prototype.visitAttr = function (ast, attrNameAndValues) {
        attrNameAndValues.push(ast.name);
        attrNameAndValues.push(ast.value);
        return null;
    };
    CommandBuilderVisitor.prototype.visitBoundText = function (ast, context) {
        this.result.push(this.commandFactory.createText(null, true, ast.ngContentIndex));
        return null;
    };
    CommandBuilderVisitor.prototype.visitText = function (ast, context) {
        this.result.push(this.commandFactory.createText(ast.value, false, ast.ngContentIndex));
        return null;
    };
    CommandBuilderVisitor.prototype.visitDirective = function (ast, ctx) {
        ctx.targetDirectives.push(ast.directive);
        template_ast_1.templateVisitAll(this, ast.hostEvents, ctx.eventTargetAndNames);
        ast.exportAsVars.forEach(function (varAst) {
            ctx.targetVariableNameAndValues.push(varAst.name);
            ctx.targetVariableNameAndValues.push(ctx.index);
        });
        return null;
    };
    CommandBuilderVisitor.prototype.visitEvent = function (ast, eventTargetAndNames) {
        eventTargetAndNames.push(ast.target);
        eventTargetAndNames.push(ast.name);
        return null;
    };
    CommandBuilderVisitor.prototype.visitDirectiveProperty = function (ast, context) { return null; };
    CommandBuilderVisitor.prototype.visitElementProperty = function (ast, context) { return null; };
    return CommandBuilderVisitor;
})();
function removeKeyValueArrayDuplicates(keyValueArray) {
    var knownPairs = new Set();
    var resultKeyValueArray = [];
    for (var i = 0; i < keyValueArray.length; i += 2) {
        var key = keyValueArray[i];
        var value = keyValueArray[i + 1];
        var pairId = key + ":" + value;
        if (!collection_1.SetWrapper.has(knownPairs, pairId)) {
            resultKeyValueArray.push(key);
            resultKeyValueArray.push(value);
            knownPairs.add(pairId);
        }
    }
    return resultKeyValueArray;
}
function keyValueArrayToMap(keyValueArr) {
    var data = {};
    for (var i = 0; i < keyValueArr.length; i += 2) {
        data[keyValueArr[i]] = keyValueArr[i + 1];
    }
    return data;
}
function mapToKeyValueArray(data) {
    var entryArray = [];
    collection_1.StringMapWrapper.forEach(data, function (value, name) { entryArray.push([name, value]); });
    // We need to sort to get a defined output order
    // for tests and for caching generated artifacts...
    collection_1.ListWrapper.sort(entryArray, function (entry1, entry2) { return lang_1.StringWrapper.compare(entry1[0], entry2[0]); });
    var keyValueArray = [];
    entryArray.forEach(function (entry) {
        keyValueArray.push(entry[0]);
        keyValueArray.push(entry[1]);
    });
    return keyValueArray;
}
function mergeAttributeValue(attrName, attrValue1, attrValue2) {
    if (attrName == CLASS_ATTR || attrName == STYLE_ATTR) {
        return attrValue1 + " " + attrValue2;
    }
    else {
        return attrValue2;
    }
}
var DirectiveContext = (function () {
    function DirectiveContext(index, eventTargetAndNames, targetVariableNameAndValues, targetDirectives) {
        this.index = index;
        this.eventTargetAndNames = eventTargetAndNames;
        this.targetVariableNameAndValues = targetVariableNameAndValues;
        this.targetDirectives = targetDirectives;
    }
    return DirectiveContext;
})();
var Expression = (function () {
    function Expression(value) {
        this.value = value;
    }
    return Expression;
})();
function escapeValue(value) {
    if (value instanceof Expression) {
        return value.value;
    }
    else if (lang_1.isString(value)) {
        return util_1.escapeSingleQuoteString(value);
    }
    else if (lang_1.isBlank(value)) {
        return 'null';
    }
    else {
        return "" + value;
    }
}
function codeGenArray(data) {
    var base = "[" + data.map(escapeValue).join(',') + "]";
    return lang_1.IS_DART ? "const " + base : base;
}
function codeGenDirectivesArray(directives) {
    var expressions = directives.map(function (directiveType) { return ("" + source_module_1.moduleRef(directiveType.type.moduleUrl) + directiveType.type.name); });
    var base = "[" + expressions.join(',') + "]";
    return lang_1.IS_DART ? "const " + base : base;
}
function codeGenViewEncapsulation(value) {
    if (lang_1.IS_DART) {
        return "" + exports.TEMPLATE_COMMANDS_MODULE_REF + value;
    }
    else {
        return "" + value;
    }
}
//# sourceMappingURL=command_compiler.js.map