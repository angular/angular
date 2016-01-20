'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var template_ast_1 = require('./template_ast');
var source_module_1 = require('./source_module');
var view_1 = require('angular2/src/core/linker/view');
var view_type_1 = require('angular2/src/core/linker/view_type');
var element_1 = require('angular2/src/core/linker/element');
var util_1 = require('./util');
var di_1 = require('angular2/src/core/di');
exports.PROTO_VIEW_JIT_IMPORTS = lang_1.CONST_EXPR({ 'AppProtoView': view_1.AppProtoView, 'AppProtoElement': element_1.AppProtoElement, 'ViewType': view_type_1.ViewType });
// TODO: have a single file that reexports everything needed for
// codegen explicitly
// - helps understanding what codegen works against
// - less imports in codegen code
exports.APP_VIEW_MODULE_REF = source_module_1.moduleRef('package:angular2/src/core/linker/view' + util_1.MODULE_SUFFIX);
exports.VIEW_TYPE_MODULE_REF = source_module_1.moduleRef('package:angular2/src/core/linker/view_type' + util_1.MODULE_SUFFIX);
exports.APP_EL_MODULE_REF = source_module_1.moduleRef('package:angular2/src/core/linker/element' + util_1.MODULE_SUFFIX);
exports.METADATA_MODULE_REF = source_module_1.moduleRef('package:angular2/src/core/metadata/view' + util_1.MODULE_SUFFIX);
var IMPLICIT_TEMPLATE_VAR = '\$implicit';
var CLASS_ATTR = 'class';
var STYLE_ATTR = 'style';
var ProtoViewCompiler = (function () {
    function ProtoViewCompiler() {
    }
    ProtoViewCompiler.prototype.compileProtoViewRuntime = function (metadataCache, component, template, pipes) {
        var protoViewFactory = new RuntimeProtoViewFactory(metadataCache, component, pipes);
        var allProtoViews = [];
        protoViewFactory.createCompileProtoView(template, [], [], allProtoViews);
        return new CompileProtoViews([], allProtoViews);
    };
    ProtoViewCompiler.prototype.compileProtoViewCodeGen = function (resolvedMetadataCacheExpr, component, template, pipes) {
        var protoViewFactory = new CodeGenProtoViewFactory(resolvedMetadataCacheExpr, component, pipes);
        var allProtoViews = [];
        var allStatements = [];
        protoViewFactory.createCompileProtoView(template, [], allStatements, allProtoViews);
        return new CompileProtoViews(allStatements.map(function (stmt) { return stmt.statement; }), allProtoViews);
    };
    ProtoViewCompiler = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ProtoViewCompiler);
    return ProtoViewCompiler;
})();
exports.ProtoViewCompiler = ProtoViewCompiler;
var CompileProtoViews = (function () {
    function CompileProtoViews(declarations, protoViews) {
        this.declarations = declarations;
        this.protoViews = protoViews;
    }
    return CompileProtoViews;
})();
exports.CompileProtoViews = CompileProtoViews;
var CompileProtoView = (function () {
    function CompileProtoView(embeddedTemplateIndex, protoElements, protoView) {
        this.embeddedTemplateIndex = embeddedTemplateIndex;
        this.protoElements = protoElements;
        this.protoView = protoView;
    }
    return CompileProtoView;
})();
exports.CompileProtoView = CompileProtoView;
var CompileProtoElement = (function () {
    function CompileProtoElement(boundElementIndex, attrNameAndValues, variableNameAndValues, renderEvents, directives, embeddedTemplateIndex, appProtoEl) {
        this.boundElementIndex = boundElementIndex;
        this.attrNameAndValues = attrNameAndValues;
        this.variableNameAndValues = variableNameAndValues;
        this.renderEvents = renderEvents;
        this.directives = directives;
        this.embeddedTemplateIndex = embeddedTemplateIndex;
        this.appProtoEl = appProtoEl;
    }
    return CompileProtoElement;
})();
exports.CompileProtoElement = CompileProtoElement;
function visitAndReturnContext(visitor, asts, context) {
    template_ast_1.templateVisitAll(visitor, asts, context);
    return context;
}
var ProtoViewFactory = (function () {
    function ProtoViewFactory(component) {
        this.component = component;
    }
    ProtoViewFactory.prototype.createCompileProtoView = function (template, templateVariableBindings, targetStatements, targetProtoViews) {
        var embeddedTemplateIndex = targetProtoViews.length;
        // Note: targetProtoViews needs to be in depth first order.
        // So we "reserve" a space here that we fill after the recursion is done
        targetProtoViews.push(null);
        var builder = new ProtoViewBuilderVisitor(this, targetStatements, targetProtoViews);
        template_ast_1.templateVisitAll(builder, template);
        var viewType = getViewType(this.component, embeddedTemplateIndex);
        var appProtoView = this.createAppProtoView(embeddedTemplateIndex, viewType, templateVariableBindings, targetStatements);
        var cpv = new CompileProtoView(embeddedTemplateIndex, builder.protoElements, appProtoView);
        targetProtoViews[embeddedTemplateIndex] = cpv;
        return cpv;
    };
    return ProtoViewFactory;
})();
var CodeGenProtoViewFactory = (function (_super) {
    __extends(CodeGenProtoViewFactory, _super);
    function CodeGenProtoViewFactory(resolvedMetadataCacheExpr, component, pipes) {
        _super.call(this, component);
        this.resolvedMetadataCacheExpr = resolvedMetadataCacheExpr;
        this.pipes = pipes;
        this._nextVarId = 0;
    }
    CodeGenProtoViewFactory.prototype._nextProtoViewVar = function (embeddedTemplateIndex) {
        return "appProtoView" + this._nextVarId++ + "_" + this.component.type.name + embeddedTemplateIndex;
    };
    CodeGenProtoViewFactory.prototype.createAppProtoView = function (embeddedTemplateIndex, viewType, templateVariableBindings, targetStatements) {
        var protoViewVarName = this._nextProtoViewVar(embeddedTemplateIndex);
        var viewTypeExpr = codeGenViewType(viewType);
        var pipesExpr = embeddedTemplateIndex === 0 ?
            codeGenTypesArray(this.pipes.map(function (pipeMeta) { return pipeMeta.type; })) :
            null;
        var statement = "var " + protoViewVarName + " = " + exports.APP_VIEW_MODULE_REF + "AppProtoView.create(" + this.resolvedMetadataCacheExpr.expression + ", " + viewTypeExpr + ", " + pipesExpr + ", " + util_1.codeGenStringMap(templateVariableBindings) + ");";
        targetStatements.push(new util_1.Statement(statement));
        return new util_1.Expression(protoViewVarName);
    };
    CodeGenProtoViewFactory.prototype.createAppProtoElement = function (boundElementIndex, attrNameAndValues, variableNameAndValues, directives, targetStatements) {
        var varName = "appProtoEl" + this._nextVarId++ + "_" + this.component.type.name;
        var value = exports.APP_EL_MODULE_REF + "AppProtoElement.create(\n        " + this.resolvedMetadataCacheExpr.expression + ",\n        " + boundElementIndex + ",\n        " + util_1.codeGenStringMap(attrNameAndValues) + ",\n        " + codeGenDirectivesArray(directives) + ",\n        " + util_1.codeGenStringMap(variableNameAndValues) + "\n      )";
        var statement = "var " + varName + " = " + value + ";";
        targetStatements.push(new util_1.Statement(statement));
        return new util_1.Expression(varName);
    };
    return CodeGenProtoViewFactory;
})(ProtoViewFactory);
var RuntimeProtoViewFactory = (function (_super) {
    __extends(RuntimeProtoViewFactory, _super);
    function RuntimeProtoViewFactory(metadataCache, component, pipes) {
        _super.call(this, component);
        this.metadataCache = metadataCache;
        this.pipes = pipes;
    }
    RuntimeProtoViewFactory.prototype.createAppProtoView = function (embeddedTemplateIndex, viewType, templateVariableBindings, targetStatements) {
        var pipes = embeddedTemplateIndex === 0 ? this.pipes.map(function (pipeMeta) { return pipeMeta.type.runtime; }) : [];
        var templateVars = keyValueArrayToStringMap(templateVariableBindings);
        return view_1.AppProtoView.create(this.metadataCache, viewType, pipes, templateVars);
    };
    RuntimeProtoViewFactory.prototype.createAppProtoElement = function (boundElementIndex, attrNameAndValues, variableNameAndValues, directives, targetStatements) {
        var attrs = keyValueArrayToStringMap(attrNameAndValues);
        return element_1.AppProtoElement.create(this.metadataCache, boundElementIndex, attrs, directives.map(function (dirMeta) { return dirMeta.type.runtime; }), keyValueArrayToStringMap(variableNameAndValues));
    };
    return RuntimeProtoViewFactory;
})(ProtoViewFactory);
var ProtoViewBuilderVisitor = (function () {
    function ProtoViewBuilderVisitor(factory, allStatements, allProtoViews) {
        this.factory = factory;
        this.allStatements = allStatements;
        this.allProtoViews = allProtoViews;
        this.protoElements = [];
        this.boundElementCount = 0;
    }
    ProtoViewBuilderVisitor.prototype._readAttrNameAndValues = function (directives, attrAsts) {
        var attrs = visitAndReturnContext(this, attrAsts, {});
        directives.forEach(function (directiveMeta) {
            collection_1.StringMapWrapper.forEach(directiveMeta.hostAttributes, function (value, name) {
                var prevValue = attrs[name];
                attrs[name] = lang_1.isPresent(prevValue) ? mergeAttributeValue(name, prevValue, value) : value;
            });
        });
        return mapToKeyValueArray(attrs);
    };
    ProtoViewBuilderVisitor.prototype.visitBoundText = function (ast, context) { return null; };
    ProtoViewBuilderVisitor.prototype.visitText = function (ast, context) { return null; };
    ProtoViewBuilderVisitor.prototype.visitNgContent = function (ast, context) { return null; };
    ProtoViewBuilderVisitor.prototype.visitElement = function (ast, context) {
        var _this = this;
        var boundElementIndex = null;
        if (ast.isBound()) {
            boundElementIndex = this.boundElementCount++;
        }
        var component = ast.getComponent();
        var variableNameAndValues = [];
        if (lang_1.isBlank(component)) {
            ast.exportAsVars.forEach(function (varAst) { variableNameAndValues.push([varAst.name, null]); });
        }
        var directives = [];
        var renderEvents = visitAndReturnContext(this, ast.outputs, new Map());
        collection_1.ListWrapper.forEachWithIndex(ast.directives, function (directiveAst, index) {
            directiveAst.visit(_this, new DirectiveContext(index, boundElementIndex, renderEvents, variableNameAndValues, directives));
        });
        var renderEventArray = [];
        renderEvents.forEach(function (eventAst, _) { return renderEventArray.push(eventAst); });
        var attrNameAndValues = this._readAttrNameAndValues(directives, ast.attrs);
        this._addProtoElement(ast.isBound(), boundElementIndex, attrNameAndValues, variableNameAndValues, renderEventArray, directives, null);
        template_ast_1.templateVisitAll(this, ast.children);
        return null;
    };
    ProtoViewBuilderVisitor.prototype.visitEmbeddedTemplate = function (ast, context) {
        var _this = this;
        var boundElementIndex = this.boundElementCount++;
        var directives = [];
        collection_1.ListWrapper.forEachWithIndex(ast.directives, function (directiveAst, index) {
            directiveAst.visit(_this, new DirectiveContext(index, boundElementIndex, new Map(), [], directives));
        });
        var attrNameAndValues = this._readAttrNameAndValues(directives, ast.attrs);
        var templateVariableBindings = ast.vars.map(function (varAst) { return [varAst.value.length > 0 ? varAst.value : IMPLICIT_TEMPLATE_VAR, varAst.name]; });
        var nestedProtoView = this.factory.createCompileProtoView(ast.children, templateVariableBindings, this.allStatements, this.allProtoViews);
        this._addProtoElement(true, boundElementIndex, attrNameAndValues, [], [], directives, nestedProtoView.embeddedTemplateIndex);
        return null;
    };
    ProtoViewBuilderVisitor.prototype._addProtoElement = function (isBound, boundElementIndex, attrNameAndValues, variableNameAndValues, renderEvents, directives, embeddedTemplateIndex) {
        var appProtoEl = null;
        if (isBound) {
            appProtoEl =
                this.factory.createAppProtoElement(boundElementIndex, attrNameAndValues, variableNameAndValues, directives, this.allStatements);
        }
        var compileProtoEl = new CompileProtoElement(boundElementIndex, attrNameAndValues, variableNameAndValues, renderEvents, directives, embeddedTemplateIndex, appProtoEl);
        this.protoElements.push(compileProtoEl);
    };
    ProtoViewBuilderVisitor.prototype.visitVariable = function (ast, ctx) { return null; };
    ProtoViewBuilderVisitor.prototype.visitAttr = function (ast, attrNameAndValues) {
        attrNameAndValues[ast.name] = ast.value;
        return null;
    };
    ProtoViewBuilderVisitor.prototype.visitDirective = function (ast, ctx) {
        ctx.targetDirectives.push(ast.directive);
        template_ast_1.templateVisitAll(this, ast.hostEvents, ctx.hostEventTargetAndNames);
        ast.exportAsVars.forEach(function (varAst) { ctx.targetVariableNameAndValues.push([varAst.name, ctx.index]); });
        return null;
    };
    ProtoViewBuilderVisitor.prototype.visitEvent = function (ast, eventTargetAndNames) {
        eventTargetAndNames.set(ast.fullName, ast);
        return null;
    };
    ProtoViewBuilderVisitor.prototype.visitDirectiveProperty = function (ast, context) { return null; };
    ProtoViewBuilderVisitor.prototype.visitElementProperty = function (ast, context) { return null; };
    return ProtoViewBuilderVisitor;
})();
function mapToKeyValueArray(data) {
    var entryArray = [];
    collection_1.StringMapWrapper.forEach(data, function (value, name) { entryArray.push([name, value]); });
    // We need to sort to get a defined output order
    // for tests and for caching generated artifacts...
    collection_1.ListWrapper.sort(entryArray, function (entry1, entry2) { return lang_1.StringWrapper.compare(entry1[0], entry2[0]); });
    var keyValueArray = [];
    entryArray.forEach(function (entry) { keyValueArray.push([entry[0], entry[1]]); });
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
    function DirectiveContext(index, boundElementIndex, hostEventTargetAndNames, targetVariableNameAndValues, targetDirectives) {
        this.index = index;
        this.boundElementIndex = boundElementIndex;
        this.hostEventTargetAndNames = hostEventTargetAndNames;
        this.targetVariableNameAndValues = targetVariableNameAndValues;
        this.targetDirectives = targetDirectives;
    }
    return DirectiveContext;
})();
function keyValueArrayToStringMap(keyValueArray) {
    var stringMap = {};
    for (var i = 0; i < keyValueArray.length; i++) {
        var entry = keyValueArray[i];
        stringMap[entry[0]] = entry[1];
    }
    return stringMap;
}
function codeGenDirectivesArray(directives) {
    var expressions = directives.map(function (directiveType) { return codeGenType(directiveType.type); });
    return "[" + expressions.join(',') + "]";
}
function codeGenTypesArray(types) {
    var expressions = types.map(codeGenType);
    return "[" + expressions.join(',') + "]";
}
function codeGenViewType(value) {
    if (lang_1.IS_DART) {
        return "" + exports.VIEW_TYPE_MODULE_REF + value;
    }
    else {
        return "" + value;
    }
}
function codeGenType(type) {
    return "" + source_module_1.moduleRef(type.moduleUrl) + type.name;
}
exports.codeGenType = codeGenType;
function getViewType(component, embeddedTemplateIndex) {
    if (embeddedTemplateIndex > 0) {
        return view_type_1.ViewType.EMBEDDED;
    }
    else if (component.type.isHost) {
        return view_type_1.ViewType.HOST;
    }
    else {
        return view_type_1.ViewType.COMPONENT;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9fdmlld19jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9wcm90b192aWV3X2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbIlByb3RvVmlld0NvbXBpbGVyIiwiUHJvdG9WaWV3Q29tcGlsZXIuY29uc3RydWN0b3IiLCJQcm90b1ZpZXdDb21waWxlci5jb21waWxlUHJvdG9WaWV3UnVudGltZSIsIlByb3RvVmlld0NvbXBpbGVyLmNvbXBpbGVQcm90b1ZpZXdDb2RlR2VuIiwiQ29tcGlsZVByb3RvVmlld3MiLCJDb21waWxlUHJvdG9WaWV3cy5jb25zdHJ1Y3RvciIsIkNvbXBpbGVQcm90b1ZpZXciLCJDb21waWxlUHJvdG9WaWV3LmNvbnN0cnVjdG9yIiwiQ29tcGlsZVByb3RvRWxlbWVudCIsIkNvbXBpbGVQcm90b0VsZW1lbnQuY29uc3RydWN0b3IiLCJ2aXNpdEFuZFJldHVybkNvbnRleHQiLCJQcm90b1ZpZXdGYWN0b3J5IiwiUHJvdG9WaWV3RmFjdG9yeS5jb25zdHJ1Y3RvciIsIlByb3RvVmlld0ZhY3RvcnkuY3JlYXRlQ29tcGlsZVByb3RvVmlldyIsIkNvZGVHZW5Qcm90b1ZpZXdGYWN0b3J5IiwiQ29kZUdlblByb3RvVmlld0ZhY3RvcnkuY29uc3RydWN0b3IiLCJDb2RlR2VuUHJvdG9WaWV3RmFjdG9yeS5fbmV4dFByb3RvVmlld1ZhciIsIkNvZGVHZW5Qcm90b1ZpZXdGYWN0b3J5LmNyZWF0ZUFwcFByb3RvVmlldyIsIkNvZGVHZW5Qcm90b1ZpZXdGYWN0b3J5LmNyZWF0ZUFwcFByb3RvRWxlbWVudCIsIlJ1bnRpbWVQcm90b1ZpZXdGYWN0b3J5IiwiUnVudGltZVByb3RvVmlld0ZhY3RvcnkuY29uc3RydWN0b3IiLCJSdW50aW1lUHJvdG9WaWV3RmFjdG9yeS5jcmVhdGVBcHBQcm90b1ZpZXciLCJSdW50aW1lUHJvdG9WaWV3RmFjdG9yeS5jcmVhdGVBcHBQcm90b0VsZW1lbnQiLCJQcm90b1ZpZXdCdWlsZGVyVmlzaXRvciIsIlByb3RvVmlld0J1aWxkZXJWaXNpdG9yLmNvbnN0cnVjdG9yIiwiUHJvdG9WaWV3QnVpbGRlclZpc2l0b3IuX3JlYWRBdHRyTmFtZUFuZFZhbHVlcyIsIlByb3RvVmlld0J1aWxkZXJWaXNpdG9yLnZpc2l0Qm91bmRUZXh0IiwiUHJvdG9WaWV3QnVpbGRlclZpc2l0b3IudmlzaXRUZXh0IiwiUHJvdG9WaWV3QnVpbGRlclZpc2l0b3IudmlzaXROZ0NvbnRlbnQiLCJQcm90b1ZpZXdCdWlsZGVyVmlzaXRvci52aXNpdEVsZW1lbnQiLCJQcm90b1ZpZXdCdWlsZGVyVmlzaXRvci52aXNpdEVtYmVkZGVkVGVtcGxhdGUiLCJQcm90b1ZpZXdCdWlsZGVyVmlzaXRvci5fYWRkUHJvdG9FbGVtZW50IiwiUHJvdG9WaWV3QnVpbGRlclZpc2l0b3IudmlzaXRWYXJpYWJsZSIsIlByb3RvVmlld0J1aWxkZXJWaXNpdG9yLnZpc2l0QXR0ciIsIlByb3RvVmlld0J1aWxkZXJWaXNpdG9yLnZpc2l0RGlyZWN0aXZlIiwiUHJvdG9WaWV3QnVpbGRlclZpc2l0b3IudmlzaXRFdmVudCIsIlByb3RvVmlld0J1aWxkZXJWaXNpdG9yLnZpc2l0RGlyZWN0aXZlUHJvcGVydHkiLCJQcm90b1ZpZXdCdWlsZGVyVmlzaXRvci52aXNpdEVsZW1lbnRQcm9wZXJ0eSIsIm1hcFRvS2V5VmFsdWVBcnJheSIsIm1lcmdlQXR0cmlidXRlVmFsdWUiLCJEaXJlY3RpdmVDb250ZXh0IiwiRGlyZWN0aXZlQ29udGV4dC5jb25zdHJ1Y3RvciIsImtleVZhbHVlQXJyYXlUb1N0cmluZ01hcCIsImNvZGVHZW5EaXJlY3RpdmVzQXJyYXkiLCJjb2RlR2VuVHlwZXNBcnJheSIsImNvZGVHZW5WaWV3VHlwZSIsImNvZGVHZW5UeXBlIiwiZ2V0Vmlld1R5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUJBUU8sMEJBQTBCLENBQUMsQ0FBQTtBQUNsQywyQkFLTyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ3hDLDZCQWVPLGdCQUFnQixDQUFDLENBQUE7QUFNeEIsOEJBQTZELGlCQUFpQixDQUFDLENBQUE7QUFDL0UscUJBQW9DLCtCQUErQixDQUFDLENBQUE7QUFDcEUsMEJBQXVCLG9DQUFvQyxDQUFDLENBQUE7QUFDNUQsd0JBQTBDLGtDQUFrQyxDQUFDLENBQUE7QUFFN0UscUJBU08sUUFBUSxDQUFDLENBQUE7QUFDaEIsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFFbkMsOEJBQXNCLEdBQUcsaUJBQVUsQ0FDNUMsRUFBQyxjQUFjLEVBQUUsbUJBQVksRUFBRSxpQkFBaUIsRUFBRSx5QkFBZSxFQUFFLFVBQVUsRUFBRSxvQkFBUSxFQUFDLENBQUMsQ0FBQztBQUU5RixnRUFBZ0U7QUFDaEUscUJBQXFCO0FBQ3JCLG1EQUFtRDtBQUNuRCxpQ0FBaUM7QUFDdEIsMkJBQW1CLEdBQUcseUJBQVMsQ0FBQyx1Q0FBdUMsR0FBRyxvQkFBYSxDQUFDLENBQUM7QUFDekYsNEJBQW9CLEdBQzNCLHlCQUFTLENBQUMsNENBQTRDLEdBQUcsb0JBQWEsQ0FBQyxDQUFDO0FBQ2pFLHlCQUFpQixHQUN4Qix5QkFBUyxDQUFDLDBDQUEwQyxHQUFHLG9CQUFhLENBQUMsQ0FBQztBQUMvRCwyQkFBbUIsR0FDMUIseUJBQVMsQ0FBQyx5Q0FBeUMsR0FBRyxvQkFBYSxDQUFDLENBQUM7QUFFekUsSUFBTSxxQkFBcUIsR0FBRyxZQUFZLENBQUM7QUFDM0MsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDO0FBQzNCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQztBQUUzQjtJQUVFQTtJQUFlQyxDQUFDQTtJQUVoQkQsbURBQXVCQSxHQUF2QkEsVUFBd0JBLGFBQW9DQSxFQUFFQSxTQUFtQ0EsRUFDekVBLFFBQXVCQSxFQUFFQSxLQUE0QkE7UUFFM0VFLElBQUlBLGdCQUFnQkEsR0FBR0EsSUFBSUEsdUJBQXVCQSxDQUFDQSxhQUFhQSxFQUFFQSxTQUFTQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNwRkEsSUFBSUEsYUFBYUEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDdkJBLGdCQUFnQkEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxRQUFRQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUN6RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsaUJBQWlCQSxDQUFxQ0EsRUFBRUEsRUFBRUEsYUFBYUEsQ0FBQ0EsQ0FBQ0E7SUFDdEZBLENBQUNBO0lBRURGLG1EQUF1QkEsR0FBdkJBLFVBQXdCQSx5QkFBcUNBLEVBQ3JDQSxTQUFtQ0EsRUFBRUEsUUFBdUJBLEVBQzVEQSxLQUE0QkE7UUFFbERHLElBQUlBLGdCQUFnQkEsR0FBR0EsSUFBSUEsdUJBQXVCQSxDQUFDQSx5QkFBeUJBLEVBQUVBLFNBQVNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2hHQSxJQUFJQSxhQUFhQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUN2QkEsSUFBSUEsYUFBYUEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDdkJBLGdCQUFnQkEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxRQUFRQSxFQUFFQSxFQUFFQSxFQUFFQSxhQUFhQSxFQUFFQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUNwRkEsTUFBTUEsQ0FBQ0EsSUFBSUEsaUJBQWlCQSxDQUN4QkEsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBQUEsSUFBSUEsSUFBSUEsT0FBQUEsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBZEEsQ0FBY0EsQ0FBQ0EsRUFBRUEsYUFBYUEsQ0FBQ0EsQ0FBQ0E7SUFDaEVBLENBQUNBO0lBdkJISDtRQUFDQSxlQUFVQSxFQUFFQTs7MEJBd0JaQTtJQUFEQSx3QkFBQ0E7QUFBREEsQ0FBQ0EsQUF4QkQsSUF3QkM7QUF2QlkseUJBQWlCLG9CQXVCN0IsQ0FBQTtBQUVEO0lBQ0VJLDJCQUFtQkEsWUFBeUJBLEVBQ3pCQSxVQUE0REE7UUFENURDLGlCQUFZQSxHQUFaQSxZQUFZQSxDQUFhQTtRQUN6QkEsZUFBVUEsR0FBVkEsVUFBVUEsQ0FBa0RBO0lBQUdBLENBQUNBO0lBQ3JGRCx3QkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBSFkseUJBQWlCLG9CQUc3QixDQUFBO0FBR0Q7SUFDRUUsMEJBQW1CQSxxQkFBNkJBLEVBQzdCQSxhQUFrREEsRUFDbERBLFNBQXlCQTtRQUZ6QkMsMEJBQXFCQSxHQUFyQkEscUJBQXFCQSxDQUFRQTtRQUM3QkEsa0JBQWFBLEdBQWJBLGFBQWFBLENBQXFDQTtRQUNsREEsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBZ0JBO0lBQUdBLENBQUNBO0lBQ2xERCx1QkFBQ0E7QUFBREEsQ0FBQ0EsQUFKRCxJQUlDO0FBSlksd0JBQWdCLG1CQUk1QixDQUFBO0FBRUQ7SUFDRUUsNkJBQW1CQSxpQkFBaUJBLEVBQVNBLGlCQUE2QkEsRUFDdkRBLHFCQUFpQ0EsRUFBU0EsWUFBNkJBLEVBQ3ZFQSxVQUFzQ0EsRUFBU0EscUJBQTZCQSxFQUM1RUEsVUFBd0JBO1FBSHhCQyxzQkFBaUJBLEdBQWpCQSxpQkFBaUJBLENBQUFBO1FBQVNBLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBWUE7UUFDdkRBLDBCQUFxQkEsR0FBckJBLHFCQUFxQkEsQ0FBWUE7UUFBU0EsaUJBQVlBLEdBQVpBLFlBQVlBLENBQWlCQTtRQUN2RUEsZUFBVUEsR0FBVkEsVUFBVUEsQ0FBNEJBO1FBQVNBLDBCQUFxQkEsR0FBckJBLHFCQUFxQkEsQ0FBUUE7UUFDNUVBLGVBQVVBLEdBQVZBLFVBQVVBLENBQWNBO0lBQUdBLENBQUNBO0lBQ2pERCwwQkFBQ0E7QUFBREEsQ0FBQ0EsQUFMRCxJQUtDO0FBTFksMkJBQW1CLHNCQUsvQixDQUFBO0FBRUQsK0JBQStCLE9BQTJCLEVBQUUsSUFBbUIsRUFDaEQsT0FBWTtJQUN6Q0UsK0JBQWdCQSxDQUFDQSxPQUFPQSxFQUFFQSxJQUFJQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUN6Q0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7QUFDakJBLENBQUNBO0FBRUQ7SUFDRUMsMEJBQW1CQSxTQUFtQ0E7UUFBbkNDLGNBQVNBLEdBQVRBLFNBQVNBLENBQTBCQTtJQUFHQSxDQUFDQTtJQVcxREQsaURBQXNCQSxHQUF0QkEsVUFBdUJBLFFBQXVCQSxFQUFFQSx3QkFBb0NBLEVBQzdEQSxnQkFBNkJBLEVBQzdCQSxnQkFBa0VBO1FBRXZGRSxJQUFJQSxxQkFBcUJBLEdBQUdBLGdCQUFnQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDcERBLDJEQUEyREE7UUFDM0RBLHdFQUF3RUE7UUFDeEVBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDNUJBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLHVCQUF1QkEsQ0FDckNBLElBQUlBLEVBQUVBLGdCQUFnQkEsRUFBRUEsZ0JBQWdCQSxDQUFDQSxDQUFDQTtRQUM5Q0EsK0JBQWdCQSxDQUFDQSxPQUFPQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUNwQ0EsSUFBSUEsUUFBUUEsR0FBR0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEscUJBQXFCQSxDQUFDQSxDQUFDQTtRQUNsRUEsSUFBSUEsWUFBWUEsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxxQkFBcUJBLEVBQUVBLFFBQVFBLEVBQy9CQSx3QkFBd0JBLEVBQUVBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0E7UUFDdkZBLElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLGdCQUFnQkEsQ0FDMUJBLHFCQUFxQkEsRUFBRUEsT0FBT0EsQ0FBQ0EsYUFBYUEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0E7UUFDaEVBLGdCQUFnQkEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQTtRQUM5Q0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7SUFDYkEsQ0FBQ0E7SUFDSEYsdUJBQUNBO0FBQURBLENBQUNBLEFBL0JELElBK0JDO0FBRUQ7SUFBc0NHLDJDQUFtREE7SUFHdkZBLGlDQUFtQkEseUJBQXFDQSxFQUFFQSxTQUFtQ0EsRUFDMUVBLEtBQTRCQTtRQUM3Q0Msa0JBQU1BLFNBQVNBLENBQUNBLENBQUNBO1FBRkFBLDhCQUF5QkEsR0FBekJBLHlCQUF5QkEsQ0FBWUE7UUFDckNBLFVBQUtBLEdBQUxBLEtBQUtBLENBQXVCQTtRQUh2Q0EsZUFBVUEsR0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFLL0JBLENBQUNBO0lBRU9ELG1EQUFpQkEsR0FBekJBLFVBQTBCQSxxQkFBNkJBO1FBQ3JERSxNQUFNQSxDQUFDQSxpQkFBZUEsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsU0FBSUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EscUJBQXVCQSxDQUFDQTtJQUNoR0EsQ0FBQ0E7SUFFREYsb0RBQWtCQSxHQUFsQkEsVUFBbUJBLHFCQUE2QkEsRUFBRUEsUUFBa0JBLEVBQ2pEQSx3QkFBb0NBLEVBQ3BDQSxnQkFBNkJBO1FBQzlDRyxJQUFJQSxnQkFBZ0JBLEdBQUdBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxDQUFDQTtRQUNyRUEsSUFBSUEsWUFBWUEsR0FBR0EsZUFBZUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDN0NBLElBQUlBLFNBQVNBLEdBQUdBLHFCQUFxQkEsS0FBS0EsQ0FBQ0E7WUFDdkJBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBQUEsUUFBUUEsSUFBSUEsT0FBQUEsUUFBUUEsQ0FBQ0EsSUFBSUEsRUFBYkEsQ0FBYUEsQ0FBQ0EsQ0FBQ0E7WUFDNURBLElBQUlBLENBQUNBO1FBQ3pCQSxJQUFJQSxTQUFTQSxHQUNUQSxTQUFPQSxnQkFBZ0JBLFdBQU1BLDJCQUFtQkEsNEJBQXVCQSxJQUFJQSxDQUFDQSx5QkFBeUJBLENBQUNBLFVBQVVBLFVBQUtBLFlBQVlBLFVBQUtBLFNBQVNBLFVBQUtBLHVCQUFnQkEsQ0FBQ0Esd0JBQXdCQSxDQUFDQSxPQUFJQSxDQUFDQTtRQUN2TUEsZ0JBQWdCQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDaERBLE1BQU1BLENBQUNBLElBQUlBLGlCQUFVQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBO0lBQzFDQSxDQUFDQTtJQUVESCx1REFBcUJBLEdBQXJCQSxVQUFzQkEsaUJBQXlCQSxFQUFFQSxpQkFBNkJBLEVBQ3hEQSxxQkFBaUNBLEVBQUVBLFVBQXNDQSxFQUN6RUEsZ0JBQTZCQTtRQUNqREksSUFBSUEsT0FBT0EsR0FBR0EsZUFBYUEsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsU0FBSUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBTUEsQ0FBQ0E7UUFDM0VBLElBQUlBLEtBQUtBLEdBQU1BLHlCQUFpQkEseUNBQzFCQSxJQUFJQSxDQUFDQSx5QkFBeUJBLENBQUNBLFVBQVVBLG1CQUN6Q0EsaUJBQWlCQSxtQkFDakJBLHVCQUFnQkEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxtQkFDbkNBLHNCQUFzQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsbUJBQ2xDQSx1QkFBZ0JBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsY0FDekNBLENBQUNBO1FBQ0xBLElBQUlBLFNBQVNBLEdBQUdBLFNBQU9BLE9BQU9BLFdBQU1BLEtBQUtBLE1BQUdBLENBQUNBO1FBQzdDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLGdCQUFTQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNoREEsTUFBTUEsQ0FBQ0EsSUFBSUEsaUJBQVVBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO0lBQ2pDQSxDQUFDQTtJQUNISiw4QkFBQ0E7QUFBREEsQ0FBQ0EsQUF6Q0QsRUFBc0MsZ0JBQWdCLEVBeUNyRDtBQUVEO0lBQXNDSywyQ0FBb0RBO0lBQ3hGQSxpQ0FBbUJBLGFBQW9DQSxFQUFFQSxTQUFtQ0EsRUFDekVBLEtBQTRCQTtRQUM3Q0Msa0JBQU1BLFNBQVNBLENBQUNBLENBQUNBO1FBRkFBLGtCQUFhQSxHQUFiQSxhQUFhQSxDQUF1QkE7UUFDcENBLFVBQUtBLEdBQUxBLEtBQUtBLENBQXVCQTtJQUUvQ0EsQ0FBQ0E7SUFFREQsb0RBQWtCQSxHQUFsQkEsVUFBbUJBLHFCQUE2QkEsRUFBRUEsUUFBa0JBLEVBQ2pEQSx3QkFBb0NBLEVBQUVBLGdCQUF1QkE7UUFDOUVFLElBQUlBLEtBQUtBLEdBQ0xBLHFCQUFxQkEsS0FBS0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBQUEsUUFBUUEsSUFBSUEsT0FBQUEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsRUFBckJBLENBQXFCQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUN6RkEsSUFBSUEsWUFBWUEsR0FBR0Esd0JBQXdCQSxDQUFDQSx3QkFBd0JBLENBQUNBLENBQUNBO1FBQ3RFQSxNQUFNQSxDQUFDQSxtQkFBWUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsRUFBRUEsUUFBUUEsRUFBRUEsS0FBS0EsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0E7SUFDaEZBLENBQUNBO0lBRURGLHVEQUFxQkEsR0FBckJBLFVBQXNCQSxpQkFBeUJBLEVBQUVBLGlCQUE2QkEsRUFDeERBLHFCQUFpQ0EsRUFBRUEsVUFBc0NBLEVBQ3pFQSxnQkFBdUJBO1FBQzNDRyxJQUFJQSxLQUFLQSxHQUFHQSx3QkFBd0JBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0E7UUFDeERBLE1BQU1BLENBQUNBLHlCQUFlQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxFQUFFQSxpQkFBaUJBLEVBQUVBLEtBQUtBLEVBQzVDQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFBQSxPQUFPQSxJQUFJQSxPQUFBQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFwQkEsQ0FBb0JBLENBQUNBLEVBQy9DQSx3QkFBd0JBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDakZBLENBQUNBO0lBQ0hILDhCQUFDQTtBQUFEQSxDQUFDQSxBQXRCRCxFQUFzQyxnQkFBZ0IsRUFzQnJEO0FBRUQ7SUFLRUksaUNBQW1CQSxPQUFrRUEsRUFDbEVBLGFBQTBCQSxFQUMxQkEsYUFBK0RBO1FBRi9EQyxZQUFPQSxHQUFQQSxPQUFPQSxDQUEyREE7UUFDbEVBLGtCQUFhQSxHQUFiQSxhQUFhQSxDQUFhQTtRQUMxQkEsa0JBQWFBLEdBQWJBLGFBQWFBLENBQWtEQTtRQUxsRkEsa0JBQWFBLEdBQXdDQSxFQUFFQSxDQUFDQTtRQUN4REEsc0JBQWlCQSxHQUFXQSxDQUFDQSxDQUFDQTtJQUl1REEsQ0FBQ0E7SUFFOUVELHdEQUFzQkEsR0FBOUJBLFVBQStCQSxVQUFzQ0EsRUFDdENBLFFBQXVCQTtRQUNwREUsSUFBSUEsS0FBS0EsR0FBR0EscUJBQXFCQSxDQUFDQSxJQUFJQSxFQUFFQSxRQUFRQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUN0REEsVUFBVUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQUEsYUFBYUE7WUFDOUJBLDZCQUFnQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsY0FBY0EsRUFBRUEsVUFBQ0EsS0FBS0EsRUFBRUEsSUFBSUE7Z0JBQ2pFQSxJQUFJQSxTQUFTQSxHQUFHQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDNUJBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLGdCQUFTQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxtQkFBbUJBLENBQUNBLElBQUlBLEVBQUVBLFNBQVNBLEVBQUVBLEtBQUtBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBO1lBQzNGQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNMQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNIQSxNQUFNQSxDQUFDQSxrQkFBa0JBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0lBQ25DQSxDQUFDQTtJQUVERixnREFBY0EsR0FBZEEsVUFBZUEsR0FBaUJBLEVBQUVBLE9BQVlBLElBQVNHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBQ3JFSCwyQ0FBU0EsR0FBVEEsVUFBVUEsR0FBWUEsRUFBRUEsT0FBWUEsSUFBU0ksTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFM0RKLGdEQUFjQSxHQUFkQSxVQUFlQSxHQUFpQkEsRUFBRUEsT0FBWUEsSUFBU0ssTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFckVMLDhDQUFZQSxHQUFaQSxVQUFhQSxHQUFlQSxFQUFFQSxPQUFZQTtRQUExQ00saUJBMEJDQTtRQXpCQ0EsSUFBSUEsaUJBQWlCQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbEJBLGlCQUFpQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxDQUFDQTtRQUMvQ0EsQ0FBQ0E7UUFDREEsSUFBSUEsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0E7UUFFbkNBLElBQUlBLHFCQUFxQkEsR0FBZUEsRUFBRUEsQ0FBQ0E7UUFDM0NBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZCQSxHQUFHQSxDQUFDQSxZQUFZQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxNQUFNQSxJQUFPQSxxQkFBcUJBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzdGQSxDQUFDQTtRQUNEQSxJQUFJQSxVQUFVQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNwQkEsSUFBSUEsWUFBWUEsR0FDWkEscUJBQXFCQSxDQUFDQSxJQUFJQSxFQUFFQSxHQUFHQSxDQUFDQSxPQUFPQSxFQUFFQSxJQUFJQSxHQUFHQSxFQUF5QkEsQ0FBQ0EsQ0FBQ0E7UUFDL0VBLHdCQUFXQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEdBQUdBLENBQUNBLFVBQVVBLEVBQUVBLFVBQUNBLFlBQTBCQSxFQUFFQSxLQUFhQTtZQUNyRkEsWUFBWUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBSUEsRUFBRUEsSUFBSUEsZ0JBQWdCQSxDQUFDQSxLQUFLQSxFQUFFQSxpQkFBaUJBLEVBQUVBLFlBQVlBLEVBQ3RDQSxxQkFBcUJBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO1FBQ3BGQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNIQSxJQUFJQSxnQkFBZ0JBLEdBQUdBLEVBQUVBLENBQUNBO1FBQzFCQSxZQUFZQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxJQUFLQSxPQUFBQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEVBQS9CQSxDQUErQkEsQ0FBQ0EsQ0FBQ0E7UUFFdkVBLElBQUlBLGlCQUFpQkEsR0FBR0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxVQUFVQSxFQUFFQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUMzRUEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxFQUFFQSxFQUFFQSxpQkFBaUJBLEVBQUVBLGlCQUFpQkEsRUFDbkRBLHFCQUFxQkEsRUFBRUEsZ0JBQWdCQSxFQUFFQSxVQUFVQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNqRkEsK0JBQWdCQSxDQUFDQSxJQUFJQSxFQUFFQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUNyQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFFRE4sdURBQXFCQSxHQUFyQkEsVUFBc0JBLEdBQXdCQSxFQUFFQSxPQUFZQTtRQUE1RE8saUJBaUJDQTtRQWhCQ0EsSUFBSUEsaUJBQWlCQSxHQUFHQSxJQUFJQSxDQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBO1FBQ2pEQSxJQUFJQSxVQUFVQSxHQUErQkEsRUFBRUEsQ0FBQ0E7UUFDaERBLHdCQUFXQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEdBQUdBLENBQUNBLFVBQVVBLEVBQUVBLFVBQUNBLFlBQTBCQSxFQUFFQSxLQUFhQTtZQUNyRkEsWUFBWUEsQ0FBQ0EsS0FBS0EsQ0FDZEEsS0FBSUEsRUFBRUEsSUFBSUEsZ0JBQWdCQSxDQUFDQSxLQUFLQSxFQUFFQSxpQkFBaUJBLEVBQUVBLElBQUlBLEdBQUdBLEVBQXlCQSxFQUFFQSxFQUFFQSxFQUM5REEsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDOUNBLENBQUNBLENBQUNBLENBQUNBO1FBRUhBLElBQUlBLGlCQUFpQkEsR0FBR0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxVQUFVQSxFQUFFQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUMzRUEsSUFBSUEsd0JBQXdCQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUN2Q0EsVUFBQUEsTUFBTUEsSUFBSUEsT0FBQUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EscUJBQXFCQSxFQUFFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUE3RUEsQ0FBNkVBLENBQUNBLENBQUNBO1FBQzdGQSxJQUFJQSxlQUFlQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxzQkFBc0JBLENBQ3JEQSxHQUFHQSxDQUFDQSxRQUFRQSxFQUFFQSx3QkFBd0JBLEVBQUVBLElBQUlBLENBQUNBLGFBQWFBLEVBQUVBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1FBQ3BGQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLEVBQUVBLGlCQUFpQkEsRUFBRUEsaUJBQWlCQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxVQUFVQSxFQUM5REEsZUFBZUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxDQUFDQTtRQUM3REEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFFT1Asa0RBQWdCQSxHQUF4QkEsVUFBeUJBLE9BQWdCQSxFQUFFQSxpQkFBaUJBLEVBQUVBLGlCQUE2QkEsRUFDbEVBLHFCQUFpQ0EsRUFBRUEsWUFBNkJBLEVBQ2hFQSxVQUFzQ0EsRUFBRUEscUJBQTZCQTtRQUM1RlEsSUFBSUEsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQ1pBLFVBQVVBO2dCQUNOQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxxQkFBcUJBLENBQUNBLGlCQUFpQkEsRUFBRUEsaUJBQWlCQSxFQUNwQ0EscUJBQXFCQSxFQUFFQSxVQUFVQSxFQUFFQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUNoR0EsQ0FBQ0E7UUFDREEsSUFBSUEsY0FBY0EsR0FBR0EsSUFBSUEsbUJBQW1CQSxDQUN4Q0EsaUJBQWlCQSxFQUFFQSxpQkFBaUJBLEVBQUVBLHFCQUFxQkEsRUFBRUEsWUFBWUEsRUFBRUEsVUFBVUEsRUFDckZBLHFCQUFxQkEsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDdkNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBO0lBQzFDQSxDQUFDQTtJQUVEUiwrQ0FBYUEsR0FBYkEsVUFBY0EsR0FBZ0JBLEVBQUVBLEdBQVFBLElBQVNTLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBQy9EVCwyQ0FBU0EsR0FBVEEsVUFBVUEsR0FBWUEsRUFBRUEsaUJBQTBDQTtRQUNoRVUsaUJBQWlCQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUN4Q0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFDRFYsZ0RBQWNBLEdBQWRBLFVBQWVBLEdBQWlCQSxFQUFFQSxHQUFxQkE7UUFDckRXLEdBQUdBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDekNBLCtCQUFnQkEsQ0FBQ0EsSUFBSUEsRUFBRUEsR0FBR0EsQ0FBQ0EsVUFBVUEsRUFBRUEsR0FBR0EsQ0FBQ0EsdUJBQXVCQSxDQUFDQSxDQUFDQTtRQUNwRUEsR0FBR0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsT0FBT0EsQ0FDcEJBLFVBQUFBLE1BQU1BLElBQU1BLEdBQUdBLENBQUNBLDJCQUEyQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbkZBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0lBQ0RYLDRDQUFVQSxHQUFWQSxVQUFXQSxHQUFrQkEsRUFBRUEsbUJBQStDQTtRQUM1RVksbUJBQW1CQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUMzQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFDRFosd0RBQXNCQSxHQUF0QkEsVUFBdUJBLEdBQThCQSxFQUFFQSxPQUFZQSxJQUFTYSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMxRmIsc0RBQW9CQSxHQUFwQkEsVUFBcUJBLEdBQTRCQSxFQUFFQSxPQUFZQSxJQUFTYyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN4RmQsOEJBQUNBO0FBQURBLENBQUNBLEFBMUdELElBMEdDO0FBRUQsNEJBQTRCLElBQTZCO0lBQ3ZEZSxJQUFJQSxVQUFVQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUNwQkEsNkJBQWdCQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxFQUFFQSxVQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxJQUFPQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxJQUFJQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNyRkEsZ0RBQWdEQTtJQUNoREEsbURBQW1EQTtJQUNuREEsd0JBQVdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLFVBQUNBLE1BQU1BLEVBQUVBLE1BQU1BLElBQUtBLE9BQUFBLG9CQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUEzQ0EsQ0FBMkNBLENBQUNBLENBQUNBO0lBQzlGQSxJQUFJQSxhQUFhQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUN2QkEsVUFBVUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQ0EsS0FBS0EsSUFBT0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDN0VBLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBO0FBQ3ZCQSxDQUFDQTtBQUVELDZCQUE2QixRQUFnQixFQUFFLFVBQWtCLEVBQUUsVUFBa0I7SUFDbkZDLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLElBQUlBLFVBQVVBLElBQUlBLFFBQVFBLElBQUlBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO1FBQ3JEQSxNQUFNQSxDQUFJQSxVQUFVQSxTQUFJQSxVQUFZQSxDQUFDQTtJQUN2Q0EsQ0FBQ0E7SUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDTkEsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7SUFDcEJBLENBQUNBO0FBQ0hBLENBQUNBO0FBRUQ7SUFDRUMsMEJBQW1CQSxLQUFhQSxFQUFTQSxpQkFBeUJBLEVBQy9DQSx1QkFBbURBLEVBQ25EQSwyQkFBb0NBLEVBQ3BDQSxnQkFBNENBO1FBSDVDQyxVQUFLQSxHQUFMQSxLQUFLQSxDQUFRQTtRQUFTQSxzQkFBaUJBLEdBQWpCQSxpQkFBaUJBLENBQVFBO1FBQy9DQSw0QkFBdUJBLEdBQXZCQSx1QkFBdUJBLENBQTRCQTtRQUNuREEsZ0NBQTJCQSxHQUEzQkEsMkJBQTJCQSxDQUFTQTtRQUNwQ0EscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUE0QkE7SUFBR0EsQ0FBQ0E7SUFDckVELHVCQUFDQTtBQUFEQSxDQUFDQSxBQUxELElBS0M7QUFFRCxrQ0FBa0MsYUFBc0I7SUFDdERFLElBQUlBLFNBQVNBLEdBQTRCQSxFQUFFQSxDQUFDQTtJQUM1Q0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsYUFBYUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7UUFDOUNBLElBQUlBLEtBQUtBLEdBQUdBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzdCQSxTQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNqQ0EsQ0FBQ0E7SUFDREEsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7QUFDbkJBLENBQUNBO0FBRUQsZ0NBQWdDLFVBQXNDO0lBQ3BFQyxJQUFJQSxXQUFXQSxHQUFHQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFBQSxhQUFhQSxJQUFJQSxPQUFBQSxXQUFXQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUEvQkEsQ0FBK0JBLENBQUNBLENBQUNBO0lBQ25GQSxNQUFNQSxDQUFDQSxNQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFHQSxDQUFDQTtBQUN0Q0EsQ0FBQ0E7QUFFRCwyQkFBMkIsS0FBNEI7SUFDckRDLElBQUlBLFdBQVdBLEdBQUdBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO0lBQ3pDQSxNQUFNQSxDQUFDQSxNQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFHQSxDQUFDQTtBQUN0Q0EsQ0FBQ0E7QUFFRCx5QkFBeUIsS0FBZTtJQUN0Q0MsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDWkEsTUFBTUEsQ0FBQ0EsS0FBR0EsNEJBQW9CQSxHQUFHQSxLQUFPQSxDQUFDQTtJQUMzQ0EsQ0FBQ0E7SUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDTkEsTUFBTUEsQ0FBQ0EsS0FBR0EsS0FBT0EsQ0FBQ0E7SUFDcEJBLENBQUNBO0FBQ0hBLENBQUNBO0FBRUQscUJBQTRCLElBQXlCO0lBQ25EQyxNQUFNQSxDQUFDQSxLQUFHQSx5QkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBTUEsQ0FBQ0E7QUFDcERBLENBQUNBO0FBRmUsbUJBQVcsY0FFMUIsQ0FBQTtBQUVELHFCQUFxQixTQUFtQyxFQUFFLHFCQUE2QjtJQUNyRkMsRUFBRUEsQ0FBQ0EsQ0FBQ0EscUJBQXFCQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM5QkEsTUFBTUEsQ0FBQ0Esb0JBQVFBLENBQUNBLFFBQVFBLENBQUNBO0lBQzNCQSxDQUFDQTtJQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqQ0EsTUFBTUEsQ0FBQ0Esb0JBQVFBLENBQUNBLElBQUlBLENBQUNBO0lBQ3ZCQSxDQUFDQTtJQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNOQSxNQUFNQSxDQUFDQSxvQkFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7SUFDNUJBLENBQUNBO0FBQ0hBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBUeXBlLFxuICBpc1N0cmluZyxcbiAgU3RyaW5nV3JhcHBlcixcbiAgSVNfREFSVCxcbiAgQ09OU1RfRVhQUlxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtcbiAgU2V0V3JhcHBlcixcbiAgU3RyaW5nTWFwV3JhcHBlcixcbiAgTGlzdFdyYXBwZXIsXG4gIE1hcFdyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIFRlbXBsYXRlQXN0LFxuICBUZW1wbGF0ZUFzdFZpc2l0b3IsXG4gIE5nQ29udGVudEFzdCxcbiAgRW1iZWRkZWRUZW1wbGF0ZUFzdCxcbiAgRWxlbWVudEFzdCxcbiAgVmFyaWFibGVBc3QsXG4gIEJvdW5kRXZlbnRBc3QsXG4gIEJvdW5kRWxlbWVudFByb3BlcnR5QXN0LFxuICBBdHRyQXN0LFxuICBCb3VuZFRleHRBc3QsXG4gIFRleHRBc3QsXG4gIERpcmVjdGl2ZUFzdCxcbiAgQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCxcbiAgdGVtcGxhdGVWaXNpdEFsbFxufSBmcm9tICcuL3RlbXBsYXRlX2FzdCc7XG5pbXBvcnQge1xuICBDb21waWxlVHlwZU1ldGFkYXRhLFxuICBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gIENvbXBpbGVQaXBlTWV0YWRhdGFcbn0gZnJvbSAnLi9kaXJlY3RpdmVfbWV0YWRhdGEnO1xuaW1wb3J0IHtTb3VyY2VFeHByZXNzaW9ucywgU291cmNlRXhwcmVzc2lvbiwgbW9kdWxlUmVmfSBmcm9tICcuL3NvdXJjZV9tb2R1bGUnO1xuaW1wb3J0IHtBcHBQcm90b1ZpZXcsIEFwcFZpZXd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3JztcbmltcG9ydCB7Vmlld1R5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3R5cGUnO1xuaW1wb3J0IHtBcHBQcm90b0VsZW1lbnQsIEFwcEVsZW1lbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50JztcbmltcG9ydCB7UmVzb2x2ZWRNZXRhZGF0YUNhY2hlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvcmVzb2x2ZWRfbWV0YWRhdGFfY2FjaGUnO1xuaW1wb3J0IHtcbiAgZXNjYXBlU2luZ2xlUXVvdGVTdHJpbmcsXG4gIGNvZGVHZW5Db25zdENvbnN0cnVjdG9yQ2FsbCxcbiAgY29kZUdlblZhbHVlRm4sXG4gIGNvZGVHZW5GbkhlYWRlcixcbiAgTU9EVUxFX1NVRkZJWCxcbiAgY29kZUdlblN0cmluZ01hcCxcbiAgRXhwcmVzc2lvbixcbiAgU3RhdGVtZW50XG59IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuZXhwb3J0IGNvbnN0IFBST1RPX1ZJRVdfSklUX0lNUE9SVFMgPSBDT05TVF9FWFBSKFxuICAgIHsnQXBwUHJvdG9WaWV3JzogQXBwUHJvdG9WaWV3LCAnQXBwUHJvdG9FbGVtZW50JzogQXBwUHJvdG9FbGVtZW50LCAnVmlld1R5cGUnOiBWaWV3VHlwZX0pO1xuXG4vLyBUT0RPOiBoYXZlIGEgc2luZ2xlIGZpbGUgdGhhdCByZWV4cG9ydHMgZXZlcnl0aGluZyBuZWVkZWQgZm9yXG4vLyBjb2RlZ2VuIGV4cGxpY2l0bHlcbi8vIC0gaGVscHMgdW5kZXJzdGFuZGluZyB3aGF0IGNvZGVnZW4gd29ya3MgYWdhaW5zdFxuLy8gLSBsZXNzIGltcG9ydHMgaW4gY29kZWdlbiBjb2RlXG5leHBvcnQgdmFyIEFQUF9WSUVXX01PRFVMRV9SRUYgPSBtb2R1bGVSZWYoJ3BhY2thZ2U6YW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXcnICsgTU9EVUxFX1NVRkZJWCk7XG5leHBvcnQgdmFyIFZJRVdfVFlQRV9NT0RVTEVfUkVGID1cbiAgICBtb2R1bGVSZWYoJ3BhY2thZ2U6YW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfdHlwZScgKyBNT0RVTEVfU1VGRklYKTtcbmV4cG9ydCB2YXIgQVBQX0VMX01PRFVMRV9SRUYgPVxuICAgIG1vZHVsZVJlZigncGFja2FnZTphbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZWxlbWVudCcgKyBNT0RVTEVfU1VGRklYKTtcbmV4cG9ydCB2YXIgTUVUQURBVEFfTU9EVUxFX1JFRiA9XG4gICAgbW9kdWxlUmVmKCdwYWNrYWdlOmFuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnICsgTU9EVUxFX1NVRkZJWCk7XG5cbmNvbnN0IElNUExJQ0lUX1RFTVBMQVRFX1ZBUiA9ICdcXCRpbXBsaWNpdCc7XG5jb25zdCBDTEFTU19BVFRSID0gJ2NsYXNzJztcbmNvbnN0IFNUWUxFX0FUVFIgPSAnc3R5bGUnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUHJvdG9WaWV3Q29tcGlsZXIge1xuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgY29tcGlsZVByb3RvVmlld1J1bnRpbWUobWV0YWRhdGFDYWNoZTogUmVzb2x2ZWRNZXRhZGF0YUNhY2hlLCBjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IFRlbXBsYXRlQXN0W10sIHBpcGVzOiBDb21waWxlUGlwZU1ldGFkYXRhW10pOlxuICAgICAgQ29tcGlsZVByb3RvVmlld3M8QXBwUHJvdG9WaWV3LCBBcHBQcm90b0VsZW1lbnQsIGFueT4ge1xuICAgIHZhciBwcm90b1ZpZXdGYWN0b3J5ID0gbmV3IFJ1bnRpbWVQcm90b1ZpZXdGYWN0b3J5KG1ldGFkYXRhQ2FjaGUsIGNvbXBvbmVudCwgcGlwZXMpO1xuICAgIHZhciBhbGxQcm90b1ZpZXdzID0gW107XG4gICAgcHJvdG9WaWV3RmFjdG9yeS5jcmVhdGVDb21waWxlUHJvdG9WaWV3KHRlbXBsYXRlLCBbXSwgW10sIGFsbFByb3RvVmlld3MpO1xuICAgIHJldHVybiBuZXcgQ29tcGlsZVByb3RvVmlld3M8QXBwUHJvdG9WaWV3LCBBcHBQcm90b0VsZW1lbnQsIGFueT4oW10sIGFsbFByb3RvVmlld3MpO1xuICB9XG5cbiAgY29tcGlsZVByb3RvVmlld0NvZGVHZW4ocmVzb2x2ZWRNZXRhZGF0YUNhY2hlRXhwcjogRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIHRlbXBsYXRlOiBUZW1wbGF0ZUFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwaXBlczogQ29tcGlsZVBpcGVNZXRhZGF0YVtdKTpcbiAgICAgIENvbXBpbGVQcm90b1ZpZXdzPEV4cHJlc3Npb24sIEV4cHJlc3Npb24sIHN0cmluZz4ge1xuICAgIHZhciBwcm90b1ZpZXdGYWN0b3J5ID0gbmV3IENvZGVHZW5Qcm90b1ZpZXdGYWN0b3J5KHJlc29sdmVkTWV0YWRhdGFDYWNoZUV4cHIsIGNvbXBvbmVudCwgcGlwZXMpO1xuICAgIHZhciBhbGxQcm90b1ZpZXdzID0gW107XG4gICAgdmFyIGFsbFN0YXRlbWVudHMgPSBbXTtcbiAgICBwcm90b1ZpZXdGYWN0b3J5LmNyZWF0ZUNvbXBpbGVQcm90b1ZpZXcodGVtcGxhdGUsIFtdLCBhbGxTdGF0ZW1lbnRzLCBhbGxQcm90b1ZpZXdzKTtcbiAgICByZXR1cm4gbmV3IENvbXBpbGVQcm90b1ZpZXdzPEV4cHJlc3Npb24sIEV4cHJlc3Npb24sIHN0cmluZz4oXG4gICAgICAgIGFsbFN0YXRlbWVudHMubWFwKHN0bXQgPT4gc3RtdC5zdGF0ZW1lbnQpLCBhbGxQcm90b1ZpZXdzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVByb3RvVmlld3M8QVBQX1BST1RPX1ZJRVcsIEFQUF9QUk9UT19FTCwgU1RBVEVNRU5UPiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWNsYXJhdGlvbnM6IFNUQVRFTUVOVFtdLFxuICAgICAgICAgICAgICBwdWJsaWMgcHJvdG9WaWV3czogQ29tcGlsZVByb3RvVmlldzxBUFBfUFJPVE9fVklFVywgQVBQX1BST1RPX0VMPltdKSB7fVxufVxuXG5cbmV4cG9ydCBjbGFzcyBDb21waWxlUHJvdG9WaWV3PEFQUF9QUk9UT19WSUVXLCBBUFBfUFJPVE9fRUw+IHtcbiAgY29uc3RydWN0b3IocHVibGljIGVtYmVkZGVkVGVtcGxhdGVJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgcHJvdG9FbGVtZW50czogQ29tcGlsZVByb3RvRWxlbWVudDxBUFBfUFJPVE9fRUw+W10sXG4gICAgICAgICAgICAgIHB1YmxpYyBwcm90b1ZpZXc6IEFQUF9QUk9UT19WSUVXKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcGlsZVByb3RvRWxlbWVudDxBUFBfUFJPVE9fRUw+IHtcbiAgY29uc3RydWN0b3IocHVibGljIGJvdW5kRWxlbWVudEluZGV4LCBwdWJsaWMgYXR0ck5hbWVBbmRWYWx1ZXM6IHN0cmluZ1tdW10sXG4gICAgICAgICAgICAgIHB1YmxpYyB2YXJpYWJsZU5hbWVBbmRWYWx1ZXM6IHN0cmluZ1tdW10sIHB1YmxpYyByZW5kZXJFdmVudHM6IEJvdW5kRXZlbnRBc3RbXSxcbiAgICAgICAgICAgICAgcHVibGljIGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdLCBwdWJsaWMgZW1iZWRkZWRUZW1wbGF0ZUluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyBhcHBQcm90b0VsOiBBUFBfUFJPVE9fRUwpIHt9XG59XG5cbmZ1bmN0aW9uIHZpc2l0QW5kUmV0dXJuQ29udGV4dCh2aXNpdG9yOiBUZW1wbGF0ZUFzdFZpc2l0b3IsIGFzdHM6IFRlbXBsYXRlQXN0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogYW55KTogYW55IHtcbiAgdGVtcGxhdGVWaXNpdEFsbCh2aXNpdG9yLCBhc3RzLCBjb250ZXh0KTtcbiAgcmV0dXJuIGNvbnRleHQ7XG59XG5cbmFic3RyYWN0IGNsYXNzIFByb3RvVmlld0ZhY3Rvcnk8QVBQX1BST1RPX1ZJRVcsIEFQUF9QUk9UT19FTCwgU1RBVEVNRU5UPiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSkge31cblxuICBhYnN0cmFjdCBjcmVhdGVBcHBQcm90b1ZpZXcoZW1iZWRkZWRUZW1wbGF0ZUluZGV4OiBudW1iZXIsIHZpZXdUeXBlOiBWaWV3VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVmFyaWFibGVCaW5kaW5nczogc3RyaW5nW11bXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFN0YXRlbWVudHM6IFNUQVRFTUVOVFtdKTogQVBQX1BST1RPX1ZJRVc7XG5cbiAgYWJzdHJhY3QgY3JlYXRlQXBwUHJvdG9FbGVtZW50KGJvdW5kRWxlbWVudEluZGV4OiBudW1iZXIsIGF0dHJOYW1lQW5kVmFsdWVzOiBzdHJpbmdbXVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVOYW1lQW5kVmFsdWVzOiBzdHJpbmdbXVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRTdGF0ZW1lbnRzOiBTVEFURU1FTlRbXSk6IEFQUF9QUk9UT19FTDtcblxuICBjcmVhdGVDb21waWxlUHJvdG9WaWV3KHRlbXBsYXRlOiBUZW1wbGF0ZUFzdFtdLCB0ZW1wbGF0ZVZhcmlhYmxlQmluZGluZ3M6IHN0cmluZ1tdW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U3RhdGVtZW50czogU1RBVEVNRU5UW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvdG9WaWV3czogQ29tcGlsZVByb3RvVmlldzxBUFBfUFJPVE9fVklFVywgQVBQX1BST1RPX0VMPltdKTpcbiAgICAgIENvbXBpbGVQcm90b1ZpZXc8QVBQX1BST1RPX1ZJRVcsIEFQUF9QUk9UT19FTD4ge1xuICAgIHZhciBlbWJlZGRlZFRlbXBsYXRlSW5kZXggPSB0YXJnZXRQcm90b1ZpZXdzLmxlbmd0aDtcbiAgICAvLyBOb3RlOiB0YXJnZXRQcm90b1ZpZXdzIG5lZWRzIHRvIGJlIGluIGRlcHRoIGZpcnN0IG9yZGVyLlxuICAgIC8vIFNvIHdlIFwicmVzZXJ2ZVwiIGEgc3BhY2UgaGVyZSB0aGF0IHdlIGZpbGwgYWZ0ZXIgdGhlIHJlY3Vyc2lvbiBpcyBkb25lXG4gICAgdGFyZ2V0UHJvdG9WaWV3cy5wdXNoKG51bGwpO1xuICAgIHZhciBidWlsZGVyID0gbmV3IFByb3RvVmlld0J1aWxkZXJWaXNpdG9yPEFQUF9QUk9UT19WSUVXLCBBUFBfUFJPVE9fRUwsIGFueT4oXG4gICAgICAgIHRoaXMsIHRhcmdldFN0YXRlbWVudHMsIHRhcmdldFByb3RvVmlld3MpO1xuICAgIHRlbXBsYXRlVmlzaXRBbGwoYnVpbGRlciwgdGVtcGxhdGUpO1xuICAgIHZhciB2aWV3VHlwZSA9IGdldFZpZXdUeXBlKHRoaXMuY29tcG9uZW50LCBlbWJlZGRlZFRlbXBsYXRlSW5kZXgpO1xuICAgIHZhciBhcHBQcm90b1ZpZXcgPSB0aGlzLmNyZWF0ZUFwcFByb3RvVmlldyhlbWJlZGRlZFRlbXBsYXRlSW5kZXgsIHZpZXdUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVZhcmlhYmxlQmluZGluZ3MsIHRhcmdldFN0YXRlbWVudHMpO1xuICAgIHZhciBjcHYgPSBuZXcgQ29tcGlsZVByb3RvVmlldzxBUFBfUFJPVE9fVklFVywgQVBQX1BST1RPX0VMPihcbiAgICAgICAgZW1iZWRkZWRUZW1wbGF0ZUluZGV4LCBidWlsZGVyLnByb3RvRWxlbWVudHMsIGFwcFByb3RvVmlldyk7XG4gICAgdGFyZ2V0UHJvdG9WaWV3c1tlbWJlZGRlZFRlbXBsYXRlSW5kZXhdID0gY3B2O1xuICAgIHJldHVybiBjcHY7XG4gIH1cbn1cblxuY2xhc3MgQ29kZUdlblByb3RvVmlld0ZhY3RvcnkgZXh0ZW5kcyBQcm90b1ZpZXdGYWN0b3J5PEV4cHJlc3Npb24sIEV4cHJlc3Npb24sIFN0YXRlbWVudD4ge1xuICBwcml2YXRlIF9uZXh0VmFySWQ6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHJlc29sdmVkTWV0YWRhdGFDYWNoZUV4cHI6IEV4cHJlc3Npb24sIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgICAgICAgICBwdWJsaWMgcGlwZXM6IENvbXBpbGVQaXBlTWV0YWRhdGFbXSkge1xuICAgIHN1cGVyKGNvbXBvbmVudCk7XG4gIH1cblxuICBwcml2YXRlIF9uZXh0UHJvdG9WaWV3VmFyKGVtYmVkZGVkVGVtcGxhdGVJbmRleDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGFwcFByb3RvVmlldyR7dGhpcy5fbmV4dFZhcklkKyt9XyR7dGhpcy5jb21wb25lbnQudHlwZS5uYW1lfSR7ZW1iZWRkZWRUZW1wbGF0ZUluZGV4fWA7XG4gIH1cblxuICBjcmVhdGVBcHBQcm90b1ZpZXcoZW1iZWRkZWRUZW1wbGF0ZUluZGV4OiBudW1iZXIsIHZpZXdUeXBlOiBWaWV3VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVmFyaWFibGVCaW5kaW5nczogc3RyaW5nW11bXSxcbiAgICAgICAgICAgICAgICAgICAgIHRhcmdldFN0YXRlbWVudHM6IFN0YXRlbWVudFtdKTogRXhwcmVzc2lvbiB7XG4gICAgdmFyIHByb3RvVmlld1Zhck5hbWUgPSB0aGlzLl9uZXh0UHJvdG9WaWV3VmFyKGVtYmVkZGVkVGVtcGxhdGVJbmRleCk7XG4gICAgdmFyIHZpZXdUeXBlRXhwciA9IGNvZGVHZW5WaWV3VHlwZSh2aWV3VHlwZSk7XG4gICAgdmFyIHBpcGVzRXhwciA9IGVtYmVkZGVkVGVtcGxhdGVJbmRleCA9PT0gMCA/XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlR2VuVHlwZXNBcnJheSh0aGlzLnBpcGVzLm1hcChwaXBlTWV0YSA9PiBwaXBlTWV0YS50eXBlKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbDtcbiAgICB2YXIgc3RhdGVtZW50ID1cbiAgICAgICAgYHZhciAke3Byb3RvVmlld1Zhck5hbWV9ID0gJHtBUFBfVklFV19NT0RVTEVfUkVGfUFwcFByb3RvVmlldy5jcmVhdGUoJHt0aGlzLnJlc29sdmVkTWV0YWRhdGFDYWNoZUV4cHIuZXhwcmVzc2lvbn0sICR7dmlld1R5cGVFeHByfSwgJHtwaXBlc0V4cHJ9LCAke2NvZGVHZW5TdHJpbmdNYXAodGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzKX0pO2A7XG4gICAgdGFyZ2V0U3RhdGVtZW50cy5wdXNoKG5ldyBTdGF0ZW1lbnQoc3RhdGVtZW50KSk7XG4gICAgcmV0dXJuIG5ldyBFeHByZXNzaW9uKHByb3RvVmlld1Zhck5hbWUpO1xuICB9XG5cbiAgY3JlYXRlQXBwUHJvdG9FbGVtZW50KGJvdW5kRWxlbWVudEluZGV4OiBudW1iZXIsIGF0dHJOYW1lQW5kVmFsdWVzOiBzdHJpbmdbXVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVOYW1lQW5kVmFsdWVzOiBzdHJpbmdbXVtdLCBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFN0YXRlbWVudHM6IFN0YXRlbWVudFtdKTogRXhwcmVzc2lvbiB7XG4gICAgdmFyIHZhck5hbWUgPSBgYXBwUHJvdG9FbCR7dGhpcy5fbmV4dFZhcklkKyt9XyR7dGhpcy5jb21wb25lbnQudHlwZS5uYW1lfWA7XG4gICAgdmFyIHZhbHVlID0gYCR7QVBQX0VMX01PRFVMRV9SRUZ9QXBwUHJvdG9FbGVtZW50LmNyZWF0ZShcbiAgICAgICAgJHt0aGlzLnJlc29sdmVkTWV0YWRhdGFDYWNoZUV4cHIuZXhwcmVzc2lvbn0sXG4gICAgICAgICR7Ym91bmRFbGVtZW50SW5kZXh9LFxuICAgICAgICAke2NvZGVHZW5TdHJpbmdNYXAoYXR0ck5hbWVBbmRWYWx1ZXMpfSxcbiAgICAgICAgJHtjb2RlR2VuRGlyZWN0aXZlc0FycmF5KGRpcmVjdGl2ZXMpfSxcbiAgICAgICAgJHtjb2RlR2VuU3RyaW5nTWFwKHZhcmlhYmxlTmFtZUFuZFZhbHVlcyl9XG4gICAgICApYDtcbiAgICB2YXIgc3RhdGVtZW50ID0gYHZhciAke3Zhck5hbWV9ID0gJHt2YWx1ZX07YDtcbiAgICB0YXJnZXRTdGF0ZW1lbnRzLnB1c2gobmV3IFN0YXRlbWVudChzdGF0ZW1lbnQpKTtcbiAgICByZXR1cm4gbmV3IEV4cHJlc3Npb24odmFyTmFtZSk7XG4gIH1cbn1cblxuY2xhc3MgUnVudGltZVByb3RvVmlld0ZhY3RvcnkgZXh0ZW5kcyBQcm90b1ZpZXdGYWN0b3J5PEFwcFByb3RvVmlldywgQXBwUHJvdG9FbGVtZW50LCBhbnk+IHtcbiAgY29uc3RydWN0b3IocHVibGljIG1ldGFkYXRhQ2FjaGU6IFJlc29sdmVkTWV0YWRhdGFDYWNoZSwgY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICAgICAgICAgIHB1YmxpYyBwaXBlczogQ29tcGlsZVBpcGVNZXRhZGF0YVtdKSB7XG4gICAgc3VwZXIoY29tcG9uZW50KTtcbiAgfVxuXG4gIGNyZWF0ZUFwcFByb3RvVmlldyhlbWJlZGRlZFRlbXBsYXRlSW5kZXg6IG51bWJlciwgdmlld1R5cGU6IFZpZXdUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzOiBzdHJpbmdbXVtdLCB0YXJnZXRTdGF0ZW1lbnRzOiBhbnlbXSk6IEFwcFByb3RvVmlldyB7XG4gICAgdmFyIHBpcGVzID1cbiAgICAgICAgZW1iZWRkZWRUZW1wbGF0ZUluZGV4ID09PSAwID8gdGhpcy5waXBlcy5tYXAocGlwZU1ldGEgPT4gcGlwZU1ldGEudHlwZS5ydW50aW1lKSA6IFtdO1xuICAgIHZhciB0ZW1wbGF0ZVZhcnMgPSBrZXlWYWx1ZUFycmF5VG9TdHJpbmdNYXAodGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzKTtcbiAgICByZXR1cm4gQXBwUHJvdG9WaWV3LmNyZWF0ZSh0aGlzLm1ldGFkYXRhQ2FjaGUsIHZpZXdUeXBlLCBwaXBlcywgdGVtcGxhdGVWYXJzKTtcbiAgfVxuXG4gIGNyZWF0ZUFwcFByb3RvRWxlbWVudChib3VuZEVsZW1lbnRJbmRleDogbnVtYmVyLCBhdHRyTmFtZUFuZFZhbHVlczogc3RyaW5nW11bXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlTmFtZUFuZFZhbHVlczogc3RyaW5nW11bXSwgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRTdGF0ZW1lbnRzOiBhbnlbXSk6IEFwcFByb3RvRWxlbWVudCB7XG4gICAgdmFyIGF0dHJzID0ga2V5VmFsdWVBcnJheVRvU3RyaW5nTWFwKGF0dHJOYW1lQW5kVmFsdWVzKTtcbiAgICByZXR1cm4gQXBwUHJvdG9FbGVtZW50LmNyZWF0ZSh0aGlzLm1ldGFkYXRhQ2FjaGUsIGJvdW5kRWxlbWVudEluZGV4LCBhdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVzLm1hcChkaXJNZXRhID0+IGRpck1ldGEudHlwZS5ydW50aW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXlWYWx1ZUFycmF5VG9TdHJpbmdNYXAodmFyaWFibGVOYW1lQW5kVmFsdWVzKSk7XG4gIH1cbn1cblxuY2xhc3MgUHJvdG9WaWV3QnVpbGRlclZpc2l0b3I8QVBQX1BST1RPX1ZJRVcsIEFQUF9QUk9UT19FTCwgU1RBVEVNRU5UPiBpbXBsZW1lbnRzXG4gICAgVGVtcGxhdGVBc3RWaXNpdG9yIHtcbiAgcHJvdG9FbGVtZW50czogQ29tcGlsZVByb3RvRWxlbWVudDxBUFBfUFJPVE9fRUw+W10gPSBbXTtcbiAgYm91bmRFbGVtZW50Q291bnQ6IG51bWJlciA9IDA7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGZhY3Rvcnk6IFByb3RvVmlld0ZhY3Rvcnk8QVBQX1BST1RPX1ZJRVcsIEFQUF9QUk9UT19FTCwgU1RBVEVNRU5UPixcbiAgICAgICAgICAgICAgcHVibGljIGFsbFN0YXRlbWVudHM6IFNUQVRFTUVOVFtdLFxuICAgICAgICAgICAgICBwdWJsaWMgYWxsUHJvdG9WaWV3czogQ29tcGlsZVByb3RvVmlldzxBUFBfUFJPVE9fVklFVywgQVBQX1BST1RPX0VMPltdKSB7fVxuXG4gIHByaXZhdGUgX3JlYWRBdHRyTmFtZUFuZFZhbHVlcyhkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJBc3RzOiBUZW1wbGF0ZUFzdFtdKTogc3RyaW5nW11bXSB7XG4gICAgdmFyIGF0dHJzID0gdmlzaXRBbmRSZXR1cm5Db250ZXh0KHRoaXMsIGF0dHJBc3RzLCB7fSk7XG4gICAgZGlyZWN0aXZlcy5mb3JFYWNoKGRpcmVjdGl2ZU1ldGEgPT4ge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGRpcmVjdGl2ZU1ldGEuaG9zdEF0dHJpYnV0ZXMsICh2YWx1ZSwgbmFtZSkgPT4ge1xuICAgICAgICB2YXIgcHJldlZhbHVlID0gYXR0cnNbbmFtZV07XG4gICAgICAgIGF0dHJzW25hbWVdID0gaXNQcmVzZW50KHByZXZWYWx1ZSkgPyBtZXJnZUF0dHJpYnV0ZVZhbHVlKG5hbWUsIHByZXZWYWx1ZSwgdmFsdWUpIDogdmFsdWU7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gbWFwVG9LZXlWYWx1ZUFycmF5KGF0dHJzKTtcbiAgfVxuXG4gIHZpc2l0Qm91bmRUZXh0KGFzdDogQm91bmRUZXh0QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdFRleHQoYXN0OiBUZXh0QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIHZpc2l0TmdDb250ZW50KGFzdDogTmdDb250ZW50QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdmFyIGJvdW5kRWxlbWVudEluZGV4ID0gbnVsbDtcbiAgICBpZiAoYXN0LmlzQm91bmQoKSkge1xuICAgICAgYm91bmRFbGVtZW50SW5kZXggPSB0aGlzLmJvdW5kRWxlbWVudENvdW50Kys7XG4gICAgfVxuICAgIHZhciBjb21wb25lbnQgPSBhc3QuZ2V0Q29tcG9uZW50KCk7XG5cbiAgICB2YXIgdmFyaWFibGVOYW1lQW5kVmFsdWVzOiBzdHJpbmdbXVtdID0gW107XG4gICAgaWYgKGlzQmxhbmsoY29tcG9uZW50KSkge1xuICAgICAgYXN0LmV4cG9ydEFzVmFycy5mb3JFYWNoKCh2YXJBc3QpID0+IHsgdmFyaWFibGVOYW1lQW5kVmFsdWVzLnB1c2goW3ZhckFzdC5uYW1lLCBudWxsXSk7IH0pO1xuICAgIH1cbiAgICB2YXIgZGlyZWN0aXZlcyA9IFtdO1xuICAgIHZhciByZW5kZXJFdmVudHM6IE1hcDxzdHJpbmcsIEJvdW5kRXZlbnRBc3Q+ID1cbiAgICAgICAgdmlzaXRBbmRSZXR1cm5Db250ZXh0KHRoaXMsIGFzdC5vdXRwdXRzLCBuZXcgTWFwPHN0cmluZywgQm91bmRFdmVudEFzdD4oKSk7XG4gICAgTGlzdFdyYXBwZXIuZm9yRWFjaFdpdGhJbmRleChhc3QuZGlyZWN0aXZlcywgKGRpcmVjdGl2ZUFzdDogRGlyZWN0aXZlQXN0LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBkaXJlY3RpdmVBc3QudmlzaXQodGhpcywgbmV3IERpcmVjdGl2ZUNvbnRleHQoaW5kZXgsIGJvdW5kRWxlbWVudEluZGV4LCByZW5kZXJFdmVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVOYW1lQW5kVmFsdWVzLCBkaXJlY3RpdmVzKSk7XG4gICAgfSk7XG4gICAgdmFyIHJlbmRlckV2ZW50QXJyYXkgPSBbXTtcbiAgICByZW5kZXJFdmVudHMuZm9yRWFjaCgoZXZlbnRBc3QsIF8pID0+IHJlbmRlckV2ZW50QXJyYXkucHVzaChldmVudEFzdCkpO1xuXG4gICAgdmFyIGF0dHJOYW1lQW5kVmFsdWVzID0gdGhpcy5fcmVhZEF0dHJOYW1lQW5kVmFsdWVzKGRpcmVjdGl2ZXMsIGFzdC5hdHRycyk7XG4gICAgdGhpcy5fYWRkUHJvdG9FbGVtZW50KGFzdC5pc0JvdW5kKCksIGJvdW5kRWxlbWVudEluZGV4LCBhdHRyTmFtZUFuZFZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVOYW1lQW5kVmFsdWVzLCByZW5kZXJFdmVudEFycmF5LCBkaXJlY3RpdmVzLCBudWxsKTtcbiAgICB0ZW1wbGF0ZVZpc2l0QWxsKHRoaXMsIGFzdC5jaGlsZHJlbik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEVtYmVkZGVkVGVtcGxhdGUoYXN0OiBFbWJlZGRlZFRlbXBsYXRlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHZhciBib3VuZEVsZW1lbnRJbmRleCA9IHRoaXMuYm91bmRFbGVtZW50Q291bnQrKztcbiAgICB2YXIgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10gPSBbXTtcbiAgICBMaXN0V3JhcHBlci5mb3JFYWNoV2l0aEluZGV4KGFzdC5kaXJlY3RpdmVzLCAoZGlyZWN0aXZlQXN0OiBEaXJlY3RpdmVBc3QsIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGRpcmVjdGl2ZUFzdC52aXNpdChcbiAgICAgICAgICB0aGlzLCBuZXcgRGlyZWN0aXZlQ29udGV4dChpbmRleCwgYm91bmRFbGVtZW50SW5kZXgsIG5ldyBNYXA8c3RyaW5nLCBCb3VuZEV2ZW50QXN0PigpLCBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVzKSk7XG4gICAgfSk7XG5cbiAgICB2YXIgYXR0ck5hbWVBbmRWYWx1ZXMgPSB0aGlzLl9yZWFkQXR0ck5hbWVBbmRWYWx1ZXMoZGlyZWN0aXZlcywgYXN0LmF0dHJzKTtcbiAgICB2YXIgdGVtcGxhdGVWYXJpYWJsZUJpbmRpbmdzID0gYXN0LnZhcnMubWFwKFxuICAgICAgICB2YXJBc3QgPT4gW3ZhckFzdC52YWx1ZS5sZW5ndGggPiAwID8gdmFyQXN0LnZhbHVlIDogSU1QTElDSVRfVEVNUExBVEVfVkFSLCB2YXJBc3QubmFtZV0pO1xuICAgIHZhciBuZXN0ZWRQcm90b1ZpZXcgPSB0aGlzLmZhY3RvcnkuY3JlYXRlQ29tcGlsZVByb3RvVmlldyhcbiAgICAgICAgYXN0LmNoaWxkcmVuLCB0ZW1wbGF0ZVZhcmlhYmxlQmluZGluZ3MsIHRoaXMuYWxsU3RhdGVtZW50cywgdGhpcy5hbGxQcm90b1ZpZXdzKTtcbiAgICB0aGlzLl9hZGRQcm90b0VsZW1lbnQodHJ1ZSwgYm91bmRFbGVtZW50SW5kZXgsIGF0dHJOYW1lQW5kVmFsdWVzLCBbXSwgW10sIGRpcmVjdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5lc3RlZFByb3RvVmlldy5lbWJlZGRlZFRlbXBsYXRlSW5kZXgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWRkUHJvdG9FbGVtZW50KGlzQm91bmQ6IGJvb2xlYW4sIGJvdW5kRWxlbWVudEluZGV4LCBhdHRyTmFtZUFuZFZhbHVlczogc3RyaW5nW11bXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlTmFtZUFuZFZhbHVlczogc3RyaW5nW11bXSwgcmVuZGVyRXZlbnRzOiBCb3VuZEV2ZW50QXN0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSwgZW1iZWRkZWRUZW1wbGF0ZUluZGV4OiBudW1iZXIpIHtcbiAgICB2YXIgYXBwUHJvdG9FbCA9IG51bGw7XG4gICAgaWYgKGlzQm91bmQpIHtcbiAgICAgIGFwcFByb3RvRWwgPVxuICAgICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGVBcHBQcm90b0VsZW1lbnQoYm91bmRFbGVtZW50SW5kZXgsIGF0dHJOYW1lQW5kVmFsdWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVOYW1lQW5kVmFsdWVzLCBkaXJlY3RpdmVzLCB0aGlzLmFsbFN0YXRlbWVudHMpO1xuICAgIH1cbiAgICB2YXIgY29tcGlsZVByb3RvRWwgPSBuZXcgQ29tcGlsZVByb3RvRWxlbWVudDxBUFBfUFJPVE9fRUw+KFxuICAgICAgICBib3VuZEVsZW1lbnRJbmRleCwgYXR0ck5hbWVBbmRWYWx1ZXMsIHZhcmlhYmxlTmFtZUFuZFZhbHVlcywgcmVuZGVyRXZlbnRzLCBkaXJlY3RpdmVzLFxuICAgICAgICBlbWJlZGRlZFRlbXBsYXRlSW5kZXgsIGFwcFByb3RvRWwpO1xuICAgIHRoaXMucHJvdG9FbGVtZW50cy5wdXNoKGNvbXBpbGVQcm90b0VsKTtcbiAgfVxuXG4gIHZpc2l0VmFyaWFibGUoYXN0OiBWYXJpYWJsZUFzdCwgY3R4OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdEF0dHIoYXN0OiBBdHRyQXN0LCBhdHRyTmFtZUFuZFZhbHVlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pOiBhbnkge1xuICAgIGF0dHJOYW1lQW5kVmFsdWVzW2FzdC5uYW1lXSA9IGFzdC52YWx1ZTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdERpcmVjdGl2ZShhc3Q6IERpcmVjdGl2ZUFzdCwgY3R4OiBEaXJlY3RpdmVDb250ZXh0KTogYW55IHtcbiAgICBjdHgudGFyZ2V0RGlyZWN0aXZlcy5wdXNoKGFzdC5kaXJlY3RpdmUpO1xuICAgIHRlbXBsYXRlVmlzaXRBbGwodGhpcywgYXN0Lmhvc3RFdmVudHMsIGN0eC5ob3N0RXZlbnRUYXJnZXRBbmROYW1lcyk7XG4gICAgYXN0LmV4cG9ydEFzVmFycy5mb3JFYWNoKFxuICAgICAgICB2YXJBc3QgPT4geyBjdHgudGFyZ2V0VmFyaWFibGVOYW1lQW5kVmFsdWVzLnB1c2goW3ZhckFzdC5uYW1lLCBjdHguaW5kZXhdKTsgfSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRFdmVudChhc3Q6IEJvdW5kRXZlbnRBc3QsIGV2ZW50VGFyZ2V0QW5kTmFtZXM6IE1hcDxzdHJpbmcsIEJvdW5kRXZlbnRBc3Q+KTogYW55IHtcbiAgICBldmVudFRhcmdldEFuZE5hbWVzLnNldChhc3QuZnVsbE5hbWUsIGFzdCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXREaXJlY3RpdmVQcm9wZXJ0eShhc3Q6IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0RWxlbWVudFByb3BlcnR5KGFzdDogQm91bmRFbGVtZW50UHJvcGVydHlBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG59XG5cbmZ1bmN0aW9uIG1hcFRvS2V5VmFsdWVBcnJheShkYXRhOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSk6IHN0cmluZ1tdW10ge1xuICB2YXIgZW50cnlBcnJheSA9IFtdO1xuICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZGF0YSwgKHZhbHVlLCBuYW1lKSA9PiB7IGVudHJ5QXJyYXkucHVzaChbbmFtZSwgdmFsdWVdKTsgfSk7XG4gIC8vIFdlIG5lZWQgdG8gc29ydCB0byBnZXQgYSBkZWZpbmVkIG91dHB1dCBvcmRlclxuICAvLyBmb3IgdGVzdHMgYW5kIGZvciBjYWNoaW5nIGdlbmVyYXRlZCBhcnRpZmFjdHMuLi5cbiAgTGlzdFdyYXBwZXIuc29ydChlbnRyeUFycmF5LCAoZW50cnkxLCBlbnRyeTIpID0+IFN0cmluZ1dyYXBwZXIuY29tcGFyZShlbnRyeTFbMF0sIGVudHJ5MlswXSkpO1xuICB2YXIga2V5VmFsdWVBcnJheSA9IFtdO1xuICBlbnRyeUFycmF5LmZvckVhY2goKGVudHJ5KSA9PiB7IGtleVZhbHVlQXJyYXkucHVzaChbZW50cnlbMF0sIGVudHJ5WzFdXSk7IH0pO1xuICByZXR1cm4ga2V5VmFsdWVBcnJheTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VBdHRyaWJ1dGVWYWx1ZShhdHRyTmFtZTogc3RyaW5nLCBhdHRyVmFsdWUxOiBzdHJpbmcsIGF0dHJWYWx1ZTI6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChhdHRyTmFtZSA9PSBDTEFTU19BVFRSIHx8IGF0dHJOYW1lID09IFNUWUxFX0FUVFIpIHtcbiAgICByZXR1cm4gYCR7YXR0clZhbHVlMX0gJHthdHRyVmFsdWUyfWA7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGF0dHJWYWx1ZTI7XG4gIH1cbn1cblxuY2xhc3MgRGlyZWN0aXZlQ29udGV4dCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgYm91bmRFbGVtZW50SW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgcHVibGljIGhvc3RFdmVudFRhcmdldEFuZE5hbWVzOiBNYXA8c3RyaW5nLCBCb3VuZEV2ZW50QXN0PixcbiAgICAgICAgICAgICAgcHVibGljIHRhcmdldFZhcmlhYmxlTmFtZUFuZFZhbHVlczogYW55W11bXSxcbiAgICAgICAgICAgICAgcHVibGljIHRhcmdldERpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdKSB7fVxufVxuXG5mdW5jdGlvbiBrZXlWYWx1ZUFycmF5VG9TdHJpbmdNYXAoa2V5VmFsdWVBcnJheTogYW55W11bXSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgdmFyIHN0cmluZ01hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlWYWx1ZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGVudHJ5ID0ga2V5VmFsdWVBcnJheVtpXTtcbiAgICBzdHJpbmdNYXBbZW50cnlbMF1dID0gZW50cnlbMV07XG4gIH1cbiAgcmV0dXJuIHN0cmluZ01hcDtcbn1cblxuZnVuY3Rpb24gY29kZUdlbkRpcmVjdGl2ZXNBcnJheShkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSk6IHN0cmluZyB7XG4gIHZhciBleHByZXNzaW9ucyA9IGRpcmVjdGl2ZXMubWFwKGRpcmVjdGl2ZVR5cGUgPT4gY29kZUdlblR5cGUoZGlyZWN0aXZlVHlwZS50eXBlKSk7XG4gIHJldHVybiBgWyR7ZXhwcmVzc2lvbnMuam9pbignLCcpfV1gO1xufVxuXG5mdW5jdGlvbiBjb2RlR2VuVHlwZXNBcnJheSh0eXBlczogQ29tcGlsZVR5cGVNZXRhZGF0YVtdKTogc3RyaW5nIHtcbiAgdmFyIGV4cHJlc3Npb25zID0gdHlwZXMubWFwKGNvZGVHZW5UeXBlKTtcbiAgcmV0dXJuIGBbJHtleHByZXNzaW9ucy5qb2luKCcsJyl9XWA7XG59XG5cbmZ1bmN0aW9uIGNvZGVHZW5WaWV3VHlwZSh2YWx1ZTogVmlld1R5cGUpOiBzdHJpbmcge1xuICBpZiAoSVNfREFSVCkge1xuICAgIHJldHVybiBgJHtWSUVXX1RZUEVfTU9EVUxFX1JFRn0ke3ZhbHVlfWA7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGAke3ZhbHVlfWA7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvZGVHZW5UeXBlKHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7bW9kdWxlUmVmKHR5cGUubW9kdWxlVXJsKX0ke3R5cGUubmFtZX1gO1xufVxuXG5mdW5jdGlvbiBnZXRWaWV3VHlwZShjb21wb25lbnQ6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgZW1iZWRkZWRUZW1wbGF0ZUluZGV4OiBudW1iZXIpOiBWaWV3VHlwZSB7XG4gIGlmIChlbWJlZGRlZFRlbXBsYXRlSW5kZXggPiAwKSB7XG4gICAgcmV0dXJuIFZpZXdUeXBlLkVNQkVEREVEO1xuICB9IGVsc2UgaWYgKGNvbXBvbmVudC50eXBlLmlzSG9zdCkge1xuICAgIHJldHVybiBWaWV3VHlwZS5IT1NUO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBWaWV3VHlwZS5DT01QT05FTlQ7XG4gIH1cbn1cbiJdfQ==