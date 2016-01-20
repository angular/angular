var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isPresent, isBlank, StringWrapper, IS_DART, CONST_EXPR } from 'angular2/src/facade/lang';
import { StringMapWrapper, ListWrapper } from 'angular2/src/facade/collection';
import { templateVisitAll } from './template_ast';
import { moduleRef } from './source_module';
import { AppProtoView } from 'angular2/src/core/linker/view';
import { ViewType } from 'angular2/src/core/linker/view_type';
import { AppProtoElement } from 'angular2/src/core/linker/element';
import { MODULE_SUFFIX, codeGenStringMap, Expression, Statement } from './util';
import { Injectable } from 'angular2/src/core/di';
export const PROTO_VIEW_JIT_IMPORTS = CONST_EXPR({ 'AppProtoView': AppProtoView, 'AppProtoElement': AppProtoElement, 'ViewType': ViewType });
// TODO: have a single file that reexports everything needed for
// codegen explicitly
// - helps understanding what codegen works against
// - less imports in codegen code
export var APP_VIEW_MODULE_REF = moduleRef('package:angular2/src/core/linker/view' + MODULE_SUFFIX);
export var VIEW_TYPE_MODULE_REF = moduleRef('package:angular2/src/core/linker/view_type' + MODULE_SUFFIX);
export var APP_EL_MODULE_REF = moduleRef('package:angular2/src/core/linker/element' + MODULE_SUFFIX);
export var METADATA_MODULE_REF = moduleRef('package:angular2/src/core/metadata/view' + MODULE_SUFFIX);
const IMPLICIT_TEMPLATE_VAR = '\$implicit';
const CLASS_ATTR = 'class';
const STYLE_ATTR = 'style';
export let ProtoViewCompiler = class {
    constructor() {
    }
    compileProtoViewRuntime(metadataCache, component, template, pipes) {
        var protoViewFactory = new RuntimeProtoViewFactory(metadataCache, component, pipes);
        var allProtoViews = [];
        protoViewFactory.createCompileProtoView(template, [], [], allProtoViews);
        return new CompileProtoViews([], allProtoViews);
    }
    compileProtoViewCodeGen(resolvedMetadataCacheExpr, component, template, pipes) {
        var protoViewFactory = new CodeGenProtoViewFactory(resolvedMetadataCacheExpr, component, pipes);
        var allProtoViews = [];
        var allStatements = [];
        protoViewFactory.createCompileProtoView(template, [], allStatements, allProtoViews);
        return new CompileProtoViews(allStatements.map(stmt => stmt.statement), allProtoViews);
    }
};
ProtoViewCompiler = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], ProtoViewCompiler);
export class CompileProtoViews {
    constructor(declarations, protoViews) {
        this.declarations = declarations;
        this.protoViews = protoViews;
    }
}
export class CompileProtoView {
    constructor(embeddedTemplateIndex, protoElements, protoView) {
        this.embeddedTemplateIndex = embeddedTemplateIndex;
        this.protoElements = protoElements;
        this.protoView = protoView;
    }
}
export class CompileProtoElement {
    constructor(boundElementIndex, attrNameAndValues, variableNameAndValues, renderEvents, directives, embeddedTemplateIndex, appProtoEl) {
        this.boundElementIndex = boundElementIndex;
        this.attrNameAndValues = attrNameAndValues;
        this.variableNameAndValues = variableNameAndValues;
        this.renderEvents = renderEvents;
        this.directives = directives;
        this.embeddedTemplateIndex = embeddedTemplateIndex;
        this.appProtoEl = appProtoEl;
    }
}
function visitAndReturnContext(visitor, asts, context) {
    templateVisitAll(visitor, asts, context);
    return context;
}
class ProtoViewFactory {
    constructor(component) {
        this.component = component;
    }
    createCompileProtoView(template, templateVariableBindings, targetStatements, targetProtoViews) {
        var embeddedTemplateIndex = targetProtoViews.length;
        // Note: targetProtoViews needs to be in depth first order.
        // So we "reserve" a space here that we fill after the recursion is done
        targetProtoViews.push(null);
        var builder = new ProtoViewBuilderVisitor(this, targetStatements, targetProtoViews);
        templateVisitAll(builder, template);
        var viewType = getViewType(this.component, embeddedTemplateIndex);
        var appProtoView = this.createAppProtoView(embeddedTemplateIndex, viewType, templateVariableBindings, targetStatements);
        var cpv = new CompileProtoView(embeddedTemplateIndex, builder.protoElements, appProtoView);
        targetProtoViews[embeddedTemplateIndex] = cpv;
        return cpv;
    }
}
class CodeGenProtoViewFactory extends ProtoViewFactory {
    constructor(resolvedMetadataCacheExpr, component, pipes) {
        super(component);
        this.resolvedMetadataCacheExpr = resolvedMetadataCacheExpr;
        this.pipes = pipes;
        this._nextVarId = 0;
    }
    _nextProtoViewVar(embeddedTemplateIndex) {
        return `appProtoView${this._nextVarId++}_${this.component.type.name}${embeddedTemplateIndex}`;
    }
    createAppProtoView(embeddedTemplateIndex, viewType, templateVariableBindings, targetStatements) {
        var protoViewVarName = this._nextProtoViewVar(embeddedTemplateIndex);
        var viewTypeExpr = codeGenViewType(viewType);
        var pipesExpr = embeddedTemplateIndex === 0 ?
            codeGenTypesArray(this.pipes.map(pipeMeta => pipeMeta.type)) :
            null;
        var statement = `var ${protoViewVarName} = ${APP_VIEW_MODULE_REF}AppProtoView.create(${this.resolvedMetadataCacheExpr.expression}, ${viewTypeExpr}, ${pipesExpr}, ${codeGenStringMap(templateVariableBindings)});`;
        targetStatements.push(new Statement(statement));
        return new Expression(protoViewVarName);
    }
    createAppProtoElement(boundElementIndex, attrNameAndValues, variableNameAndValues, directives, targetStatements) {
        var varName = `appProtoEl${this._nextVarId++}_${this.component.type.name}`;
        var value = `${APP_EL_MODULE_REF}AppProtoElement.create(
        ${this.resolvedMetadataCacheExpr.expression},
        ${boundElementIndex},
        ${codeGenStringMap(attrNameAndValues)},
        ${codeGenDirectivesArray(directives)},
        ${codeGenStringMap(variableNameAndValues)}
      )`;
        var statement = `var ${varName} = ${value};`;
        targetStatements.push(new Statement(statement));
        return new Expression(varName);
    }
}
class RuntimeProtoViewFactory extends ProtoViewFactory {
    constructor(metadataCache, component, pipes) {
        super(component);
        this.metadataCache = metadataCache;
        this.pipes = pipes;
    }
    createAppProtoView(embeddedTemplateIndex, viewType, templateVariableBindings, targetStatements) {
        var pipes = embeddedTemplateIndex === 0 ? this.pipes.map(pipeMeta => pipeMeta.type.runtime) : [];
        var templateVars = keyValueArrayToStringMap(templateVariableBindings);
        return AppProtoView.create(this.metadataCache, viewType, pipes, templateVars);
    }
    createAppProtoElement(boundElementIndex, attrNameAndValues, variableNameAndValues, directives, targetStatements) {
        var attrs = keyValueArrayToStringMap(attrNameAndValues);
        return AppProtoElement.create(this.metadataCache, boundElementIndex, attrs, directives.map(dirMeta => dirMeta.type.runtime), keyValueArrayToStringMap(variableNameAndValues));
    }
}
class ProtoViewBuilderVisitor {
    constructor(factory, allStatements, allProtoViews) {
        this.factory = factory;
        this.allStatements = allStatements;
        this.allProtoViews = allProtoViews;
        this.protoElements = [];
        this.boundElementCount = 0;
    }
    _readAttrNameAndValues(directives, attrAsts) {
        var attrs = visitAndReturnContext(this, attrAsts, {});
        directives.forEach(directiveMeta => {
            StringMapWrapper.forEach(directiveMeta.hostAttributes, (value, name) => {
                var prevValue = attrs[name];
                attrs[name] = isPresent(prevValue) ? mergeAttributeValue(name, prevValue, value) : value;
            });
        });
        return mapToKeyValueArray(attrs);
    }
    visitBoundText(ast, context) { return null; }
    visitText(ast, context) { return null; }
    visitNgContent(ast, context) { return null; }
    visitElement(ast, context) {
        var boundElementIndex = null;
        if (ast.isBound()) {
            boundElementIndex = this.boundElementCount++;
        }
        var component = ast.getComponent();
        var variableNameAndValues = [];
        if (isBlank(component)) {
            ast.exportAsVars.forEach((varAst) => { variableNameAndValues.push([varAst.name, null]); });
        }
        var directives = [];
        var renderEvents = visitAndReturnContext(this, ast.outputs, new Map());
        ListWrapper.forEachWithIndex(ast.directives, (directiveAst, index) => {
            directiveAst.visit(this, new DirectiveContext(index, boundElementIndex, renderEvents, variableNameAndValues, directives));
        });
        var renderEventArray = [];
        renderEvents.forEach((eventAst, _) => renderEventArray.push(eventAst));
        var attrNameAndValues = this._readAttrNameAndValues(directives, ast.attrs);
        this._addProtoElement(ast.isBound(), boundElementIndex, attrNameAndValues, variableNameAndValues, renderEventArray, directives, null);
        templateVisitAll(this, ast.children);
        return null;
    }
    visitEmbeddedTemplate(ast, context) {
        var boundElementIndex = this.boundElementCount++;
        var directives = [];
        ListWrapper.forEachWithIndex(ast.directives, (directiveAst, index) => {
            directiveAst.visit(this, new DirectiveContext(index, boundElementIndex, new Map(), [], directives));
        });
        var attrNameAndValues = this._readAttrNameAndValues(directives, ast.attrs);
        var templateVariableBindings = ast.vars.map(varAst => [varAst.value.length > 0 ? varAst.value : IMPLICIT_TEMPLATE_VAR, varAst.name]);
        var nestedProtoView = this.factory.createCompileProtoView(ast.children, templateVariableBindings, this.allStatements, this.allProtoViews);
        this._addProtoElement(true, boundElementIndex, attrNameAndValues, [], [], directives, nestedProtoView.embeddedTemplateIndex);
        return null;
    }
    _addProtoElement(isBound, boundElementIndex, attrNameAndValues, variableNameAndValues, renderEvents, directives, embeddedTemplateIndex) {
        var appProtoEl = null;
        if (isBound) {
            appProtoEl =
                this.factory.createAppProtoElement(boundElementIndex, attrNameAndValues, variableNameAndValues, directives, this.allStatements);
        }
        var compileProtoEl = new CompileProtoElement(boundElementIndex, attrNameAndValues, variableNameAndValues, renderEvents, directives, embeddedTemplateIndex, appProtoEl);
        this.protoElements.push(compileProtoEl);
    }
    visitVariable(ast, ctx) { return null; }
    visitAttr(ast, attrNameAndValues) {
        attrNameAndValues[ast.name] = ast.value;
        return null;
    }
    visitDirective(ast, ctx) {
        ctx.targetDirectives.push(ast.directive);
        templateVisitAll(this, ast.hostEvents, ctx.hostEventTargetAndNames);
        ast.exportAsVars.forEach(varAst => { ctx.targetVariableNameAndValues.push([varAst.name, ctx.index]); });
        return null;
    }
    visitEvent(ast, eventTargetAndNames) {
        eventTargetAndNames.set(ast.fullName, ast);
        return null;
    }
    visitDirectiveProperty(ast, context) { return null; }
    visitElementProperty(ast, context) { return null; }
}
function mapToKeyValueArray(data) {
    var entryArray = [];
    StringMapWrapper.forEach(data, (value, name) => { entryArray.push([name, value]); });
    // We need to sort to get a defined output order
    // for tests and for caching generated artifacts...
    ListWrapper.sort(entryArray, (entry1, entry2) => StringWrapper.compare(entry1[0], entry2[0]));
    var keyValueArray = [];
    entryArray.forEach((entry) => { keyValueArray.push([entry[0], entry[1]]); });
    return keyValueArray;
}
function mergeAttributeValue(attrName, attrValue1, attrValue2) {
    if (attrName == CLASS_ATTR || attrName == STYLE_ATTR) {
        return `${attrValue1} ${attrValue2}`;
    }
    else {
        return attrValue2;
    }
}
class DirectiveContext {
    constructor(index, boundElementIndex, hostEventTargetAndNames, targetVariableNameAndValues, targetDirectives) {
        this.index = index;
        this.boundElementIndex = boundElementIndex;
        this.hostEventTargetAndNames = hostEventTargetAndNames;
        this.targetVariableNameAndValues = targetVariableNameAndValues;
        this.targetDirectives = targetDirectives;
    }
}
function keyValueArrayToStringMap(keyValueArray) {
    var stringMap = {};
    for (var i = 0; i < keyValueArray.length; i++) {
        var entry = keyValueArray[i];
        stringMap[entry[0]] = entry[1];
    }
    return stringMap;
}
function codeGenDirectivesArray(directives) {
    var expressions = directives.map(directiveType => typeRef(directiveType.type));
    return `[${expressions.join(',')}]`;
}
function codeGenTypesArray(types) {
    var expressions = types.map(typeRef);
    return `[${expressions.join(',')}]`;
}
function codeGenViewType(value) {
    if (IS_DART) {
        return `${VIEW_TYPE_MODULE_REF}${value}`;
    }
    else {
        return `${value}`;
    }
}
function typeRef(type) {
    return `${moduleRef(type.moduleUrl)}${type.name}`;
}
function getViewType(component, embeddedTemplateIndex) {
    if (embeddedTemplateIndex > 0) {
        return ViewType.EMBEDDED;
    }
    else if (component.type.isHost) {
        return ViewType.HOST;
    }
    else {
        return ViewType.COMPONENT;
    }
}
