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
import { isPresent, isBlank, isArray, isNumber } from 'angular2/src/facade/lang';
import { RenderComponentTemplate } from 'angular2/src/core/render/api';
import { Optional, Injectable, resolveForwardRef, Inject } from 'angular2/src/core/di';
import { PipeProvider } from '../pipes/pipe_provider';
import { ProtoPipes } from '../pipes/pipes';
import { AppProtoView, AppProtoViewMergeInfo, ViewType } from './view';
import { ElementBinder } from './element_binder';
import { ProtoElementInjector, DirectiveProvider } from './element_injector';
import { DirectiveResolver } from './directive_resolver';
import { ViewResolver } from './view_resolver';
import { PipeResolver } from './pipe_resolver';
import { ViewEncapsulation } from '../metadata/view';
import { PLATFORM_PIPES } from 'angular2/src/core/platform_directives_and_pipes';
import { visitAllCommands, EmbeddedTemplateCmd, BeginComponentCmd } from './template_commands';
import { Renderer } from 'angular2/src/core/render/api';
import { APP_ID } from 'angular2/src/core/application_tokens';
export let ProtoViewFactory = class {
    constructor(_renderer, _platformPipes, _directiveResolver, _viewResolver, _pipeResolver, _appId) {
        this._renderer = _renderer;
        this._platformPipes = _platformPipes;
        this._directiveResolver = _directiveResolver;
        this._viewResolver = _viewResolver;
        this._pipeResolver = _pipeResolver;
        this._appId = _appId;
        this._cache = new Map();
        this._nextTemplateId = 0;
    }
    clearCache() { this._cache.clear(); }
    createHost(compiledHostTemplate) {
        var compiledTemplate = compiledHostTemplate.template;
        var result = this._cache.get(compiledTemplate.id);
        if (isBlank(result)) {
            var emptyMap = {};
            var shortId = `${this._appId}-${this._nextTemplateId++}`;
            this._renderer.registerComponentTemplate(new RenderComponentTemplate(compiledTemplate.id, shortId, ViewEncapsulation.None, compiledTemplate.commands, []));
            result =
                new AppProtoView(compiledTemplate.id, compiledTemplate.commands, ViewType.HOST, true, compiledTemplate.changeDetectorFactory, null, new ProtoPipes(emptyMap));
            this._cache.set(compiledTemplate.id, result);
        }
        return result;
    }
    _createComponent(cmd) {
        var nestedProtoView = this._cache.get(cmd.templateId);
        if (isBlank(nestedProtoView)) {
            var component = cmd.directives[0];
            var view = this._viewResolver.resolve(component);
            var compiledTemplate = cmd.templateGetter();
            var styles = _flattenStyleArr(compiledTemplate.styles, []);
            var shortId = `${this._appId}-${this._nextTemplateId++}`;
            this._renderer.registerComponentTemplate(new RenderComponentTemplate(compiledTemplate.id, shortId, cmd.encapsulation, compiledTemplate.commands, styles));
            var boundPipes = this._flattenPipes(view).map(pipe => this._bindPipe(pipe));
            nestedProtoView = new AppProtoView(compiledTemplate.id, compiledTemplate.commands, ViewType.COMPONENT, true, compiledTemplate.changeDetectorFactory, null, ProtoPipes.fromProviders(boundPipes));
            // Note: The cache is updated before recursing
            // to be able to resolve cycles
            this._cache.set(compiledTemplate.id, nestedProtoView);
            this._initializeProtoView(nestedProtoView, null);
        }
        return nestedProtoView;
    }
    _createEmbeddedTemplate(cmd, parent) {
        var nestedProtoView = new AppProtoView(parent.templateId, cmd.children, ViewType.EMBEDDED, cmd.isMerged, cmd.changeDetectorFactory, arrayToMap(cmd.variableNameAndValues, true), new ProtoPipes(parent.pipes.config));
        if (cmd.isMerged) {
            this.initializeProtoViewIfNeeded(nestedProtoView);
        }
        return nestedProtoView;
    }
    initializeProtoViewIfNeeded(protoView) {
        if (!protoView.isInitialized()) {
            var render = this._renderer.createProtoView(protoView.templateId, protoView.templateCmds);
            this._initializeProtoView(protoView, render);
        }
    }
    _initializeProtoView(protoView, render) {
        var initializer = new _ProtoViewInitializer(protoView, this._directiveResolver, this);
        visitAllCommands(initializer, protoView.templateCmds);
        var mergeInfo = new AppProtoViewMergeInfo(initializer.mergeEmbeddedViewCount, initializer.mergeElementCount, initializer.mergeViewCount);
        protoView.init(render, initializer.elementBinders, initializer.boundTextCount, mergeInfo, initializer.variableLocations);
    }
    _bindPipe(typeOrProvider) {
        let meta = this._pipeResolver.resolve(typeOrProvider);
        return PipeProvider.createFromType(typeOrProvider, meta);
    }
    _flattenPipes(view) {
        let pipes = [];
        if (isPresent(this._platformPipes)) {
            _flattenArray(this._platformPipes, pipes);
        }
        if (isPresent(view.pipes)) {
            _flattenArray(view.pipes, pipes);
        }
        return pipes;
    }
};
ProtoViewFactory = __decorate([
    Injectable(),
    __param(1, Optional()),
    __param(1, Inject(PLATFORM_PIPES)),
    __param(5, Inject(APP_ID)), 
    __metadata('design:paramtypes', [Renderer, Array, DirectiveResolver, ViewResolver, PipeResolver, String])
], ProtoViewFactory);
function createComponent(protoViewFactory, cmd) {
    return protoViewFactory._createComponent(cmd);
}
function createEmbeddedTemplate(protoViewFactory, cmd, parent) {
    return protoViewFactory._createEmbeddedTemplate(cmd, parent);
}
class _ProtoViewInitializer {
    constructor(_protoView, _directiveResolver, _protoViewFactory) {
        this._protoView = _protoView;
        this._directiveResolver = _directiveResolver;
        this._protoViewFactory = _protoViewFactory;
        this.variableLocations = new Map();
        this.boundTextCount = 0;
        this.boundElementIndex = 0;
        this.elementBinderStack = [];
        this.distanceToParentElementBinder = 0;
        this.distanceToParentProtoElementInjector = 0;
        this.elementBinders = [];
        this.mergeEmbeddedViewCount = 0;
        this.mergeElementCount = 0;
        this.mergeViewCount = 1;
    }
    visitText(cmd, context) {
        if (cmd.isBound) {
            this.boundTextCount++;
        }
        return null;
    }
    visitNgContent(cmd, context) { return null; }
    visitBeginElement(cmd, context) {
        if (cmd.isBound) {
            this._visitBeginBoundElement(cmd, null);
        }
        else {
            this._visitBeginElement(cmd, null, null);
        }
        return null;
    }
    visitEndElement(context) { return this._visitEndElement(); }
    visitBeginComponent(cmd, context) {
        var nestedProtoView = createComponent(this._protoViewFactory, cmd);
        return this._visitBeginBoundElement(cmd, nestedProtoView);
    }
    visitEndComponent(context) { return this._visitEndElement(); }
    visitEmbeddedTemplate(cmd, context) {
        var nestedProtoView = createEmbeddedTemplate(this._protoViewFactory, cmd, this._protoView);
        if (cmd.isMerged) {
            this.mergeEmbeddedViewCount++;
        }
        this._visitBeginBoundElement(cmd, nestedProtoView);
        return this._visitEndElement();
    }
    _visitBeginBoundElement(cmd, nestedProtoView) {
        if (isPresent(nestedProtoView) && nestedProtoView.isMergable) {
            this.mergeElementCount += nestedProtoView.mergeInfo.elementCount;
            this.mergeViewCount += nestedProtoView.mergeInfo.viewCount;
            this.mergeEmbeddedViewCount += nestedProtoView.mergeInfo.embeddedViewCount;
        }
        var elementBinder = _createElementBinder(this._directiveResolver, nestedProtoView, this.elementBinderStack, this.boundElementIndex, this.distanceToParentElementBinder, this.distanceToParentProtoElementInjector, cmd);
        this.elementBinders.push(elementBinder);
        var protoElementInjector = elementBinder.protoElementInjector;
        for (var i = 0; i < cmd.variableNameAndValues.length; i += 2) {
            this.variableLocations.set(cmd.variableNameAndValues[i], this.boundElementIndex);
        }
        this.boundElementIndex++;
        this.mergeElementCount++;
        return this._visitBeginElement(cmd, elementBinder, protoElementInjector);
    }
    _visitBeginElement(cmd, elementBinder, protoElementInjector) {
        this.distanceToParentElementBinder =
            isPresent(elementBinder) ? 1 : this.distanceToParentElementBinder + 1;
        this.distanceToParentProtoElementInjector =
            isPresent(protoElementInjector) ? 1 : this.distanceToParentProtoElementInjector + 1;
        this.elementBinderStack.push(elementBinder);
        return null;
    }
    _visitEndElement() {
        var parentElementBinder = this.elementBinderStack.pop();
        var parentProtoElementInjector = isPresent(parentElementBinder) ? parentElementBinder.protoElementInjector : null;
        this.distanceToParentElementBinder = isPresent(parentElementBinder) ?
            parentElementBinder.distanceToParent :
            this.distanceToParentElementBinder - 1;
        this.distanceToParentProtoElementInjector = isPresent(parentProtoElementInjector) ?
            parentProtoElementInjector.distanceToParent :
            this.distanceToParentProtoElementInjector - 1;
        return null;
    }
}
function _createElementBinder(directiveResolver, nestedProtoView, elementBinderStack, boundElementIndex, distanceToParentBinder, distanceToParentPei, beginElementCmd) {
    var parentElementBinder = null;
    var parentProtoElementInjector = null;
    if (distanceToParentBinder > 0) {
        parentElementBinder = elementBinderStack[elementBinderStack.length - distanceToParentBinder];
    }
    if (isBlank(parentElementBinder)) {
        distanceToParentBinder = -1;
    }
    if (distanceToParentPei > 0) {
        var peiBinder = elementBinderStack[elementBinderStack.length - distanceToParentPei];
        if (isPresent(peiBinder)) {
            parentProtoElementInjector = peiBinder.protoElementInjector;
        }
    }
    if (isBlank(parentProtoElementInjector)) {
        distanceToParentPei = -1;
    }
    var componentDirectiveProvider = null;
    var isEmbeddedTemplate = false;
    var directiveProviders = beginElementCmd.directives.map(type => provideDirective(directiveResolver, type));
    if (beginElementCmd instanceof BeginComponentCmd) {
        componentDirectiveProvider = directiveProviders[0];
    }
    else if (beginElementCmd instanceof EmbeddedTemplateCmd) {
        isEmbeddedTemplate = true;
    }
    var protoElementInjector = null;
    // Create a protoElementInjector for any element that either has bindings *or* has one
    // or more var- defined *or* for <template> elements:
    // - Elements with a var- defined need a their own element injector
    //   so that, when hydrating, $implicit can be set to the element.
    // - <template> elements need their own ElementInjector so that we can query their TemplateRef
    var hasVariables = beginElementCmd.variableNameAndValues.length > 0;
    if (directiveProviders.length > 0 || hasVariables || isEmbeddedTemplate) {
        var directiveVariableBindings = new Map();
        if (!isEmbeddedTemplate) {
            directiveVariableBindings = createDirectiveVariableBindings(beginElementCmd.variableNameAndValues, directiveProviders);
        }
        protoElementInjector = ProtoElementInjector.create(parentProtoElementInjector, boundElementIndex, directiveProviders, isPresent(componentDirectiveProvider), distanceToParentPei, directiveVariableBindings);
        protoElementInjector.attributes = arrayToMap(beginElementCmd.attrNameAndValues, false);
    }
    return new ElementBinder(boundElementIndex, parentElementBinder, distanceToParentBinder, protoElementInjector, componentDirectiveProvider, nestedProtoView);
}
function provideDirective(directiveResolver, type) {
    let annotation = directiveResolver.resolve(type);
    return DirectiveProvider.createFromType(type, annotation);
}
export function createDirectiveVariableBindings(variableNameAndValues, directiveProviders) {
    var directiveVariableBindings = new Map();
    for (var i = 0; i < variableNameAndValues.length; i += 2) {
        var templateName = variableNameAndValues[i];
        var dirIndex = variableNameAndValues[i + 1];
        if (isNumber(dirIndex)) {
            directiveVariableBindings.set(templateName, dirIndex);
        }
        else {
            // a variable without a directive index -> reference the element
            directiveVariableBindings.set(templateName, null);
        }
    }
    return directiveVariableBindings;
}
function arrayToMap(arr, inverse) {
    var result = new Map();
    for (var i = 0; i < arr.length; i += 2) {
        if (inverse) {
            result.set(arr[i + 1], arr[i]);
        }
        else {
            result.set(arr[i], arr[i + 1]);
        }
    }
    return result;
}
function _flattenArray(tree, out) {
    for (var i = 0; i < tree.length; i++) {
        var item = resolveForwardRef(tree[i]);
        if (isArray(item)) {
            _flattenArray(item, out);
        }
        else {
            out.push(item);
        }
    }
}
function _flattenStyleArr(arr, out) {
    for (var i = 0; i < arr.length; i++) {
        var entry = arr[i];
        if (isArray(entry)) {
            _flattenStyleArr(entry, out);
        }
        else {
            out.push(entry);
        }
    }
    return out;
}
