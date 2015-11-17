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
var lang_1 = require('angular2/src/facade/lang');
var api_1 = require('angular2/src/core/render/api');
var di_1 = require('angular2/src/core/di');
var pipe_provider_1 = require('../pipes/pipe_provider');
var pipes_1 = require('../pipes/pipes');
var view_1 = require('./view');
var element_binder_1 = require('./element_binder');
var element_injector_1 = require('./element_injector');
var directive_resolver_1 = require('./directive_resolver');
var view_resolver_1 = require('./view_resolver');
var pipe_resolver_1 = require('./pipe_resolver');
var view_2 = require('../metadata/view');
var platform_directives_and_pipes_1 = require('angular2/src/core/platform_directives_and_pipes');
var template_commands_1 = require('./template_commands');
var render_1 = require('angular2/render');
var application_tokens_1 = require('angular2/src/core/application_tokens');
var ProtoViewFactory = (function () {
    function ProtoViewFactory(_renderer, _platformPipes, _directiveResolver, _viewResolver, _pipeResolver, _appId) {
        this._renderer = _renderer;
        this._platformPipes = _platformPipes;
        this._directiveResolver = _directiveResolver;
        this._viewResolver = _viewResolver;
        this._pipeResolver = _pipeResolver;
        this._appId = _appId;
        this._cache = new Map();
        this._nextTemplateId = 0;
    }
    ProtoViewFactory.prototype.clearCache = function () { this._cache.clear(); };
    ProtoViewFactory.prototype.createHost = function (compiledHostTemplate) {
        var compiledTemplate = compiledHostTemplate.template;
        var result = this._cache.get(compiledTemplate.id);
        if (lang_1.isBlank(result)) {
            var emptyMap = {};
            var shortId = this._appId + "-" + this._nextTemplateId++;
            this._renderer.registerComponentTemplate(new api_1.RenderComponentTemplate(compiledTemplate.id, shortId, view_2.ViewEncapsulation.None, compiledTemplate.commands, []));
            result =
                new view_1.AppProtoView(compiledTemplate.id, compiledTemplate.commands, view_1.ViewType.HOST, true, compiledTemplate.changeDetectorFactory, null, new pipes_1.ProtoPipes(emptyMap));
            this._cache.set(compiledTemplate.id, result);
        }
        return result;
    };
    ProtoViewFactory.prototype._createComponent = function (cmd) {
        var _this = this;
        var nestedProtoView = this._cache.get(cmd.templateId);
        if (lang_1.isBlank(nestedProtoView)) {
            var component = cmd.directives[0];
            var view = this._viewResolver.resolve(component);
            var compiledTemplate = cmd.templateGetter();
            var styles = _flattenStyleArr(compiledTemplate.styles, []);
            var shortId = this._appId + "-" + this._nextTemplateId++;
            this._renderer.registerComponentTemplate(new api_1.RenderComponentTemplate(compiledTemplate.id, shortId, cmd.encapsulation, compiledTemplate.commands, styles));
            var boundPipes = this._flattenPipes(view).map(function (pipe) { return _this._bindPipe(pipe); });
            nestedProtoView = new view_1.AppProtoView(compiledTemplate.id, compiledTemplate.commands, view_1.ViewType.COMPONENT, true, compiledTemplate.changeDetectorFactory, null, pipes_1.ProtoPipes.fromProviders(boundPipes));
            // Note: The cache is updated before recursing
            // to be able to resolve cycles
            this._cache.set(compiledTemplate.id, nestedProtoView);
            this._initializeProtoView(nestedProtoView, null);
        }
        return nestedProtoView;
    };
    ProtoViewFactory.prototype._createEmbeddedTemplate = function (cmd, parent) {
        var nestedProtoView = new view_1.AppProtoView(parent.templateId, cmd.children, view_1.ViewType.EMBEDDED, cmd.isMerged, cmd.changeDetectorFactory, arrayToMap(cmd.variableNameAndValues, true), new pipes_1.ProtoPipes(parent.pipes.config));
        if (cmd.isMerged) {
            this.initializeProtoViewIfNeeded(nestedProtoView);
        }
        return nestedProtoView;
    };
    ProtoViewFactory.prototype.initializeProtoViewIfNeeded = function (protoView) {
        if (!protoView.isInitialized()) {
            var render = this._renderer.createProtoView(protoView.templateId, protoView.templateCmds);
            this._initializeProtoView(protoView, render);
        }
    };
    ProtoViewFactory.prototype._initializeProtoView = function (protoView, render) {
        var initializer = new _ProtoViewInitializer(protoView, this._directiveResolver, this);
        template_commands_1.visitAllCommands(initializer, protoView.templateCmds);
        var mergeInfo = new view_1.AppProtoViewMergeInfo(initializer.mergeEmbeddedViewCount, initializer.mergeElementCount, initializer.mergeViewCount);
        protoView.init(render, initializer.elementBinders, initializer.boundTextCount, mergeInfo, initializer.variableLocations);
    };
    ProtoViewFactory.prototype._bindPipe = function (typeOrProvider) {
        var meta = this._pipeResolver.resolve(typeOrProvider);
        return pipe_provider_1.PipeProvider.createFromType(typeOrProvider, meta);
    };
    ProtoViewFactory.prototype._flattenPipes = function (view) {
        var pipes = [];
        if (lang_1.isPresent(this._platformPipes)) {
            _flattenArray(this._platformPipes, pipes);
        }
        if (lang_1.isPresent(view.pipes)) {
            _flattenArray(view.pipes, pipes);
        }
        return pipes;
    };
    ProtoViewFactory = __decorate([
        di_1.Injectable(),
        __param(1, di_1.Optional()),
        __param(1, di_1.Inject(platform_directives_and_pipes_1.PLATFORM_PIPES)),
        __param(5, di_1.Inject(application_tokens_1.APP_ID)), 
        __metadata('design:paramtypes', [render_1.Renderer, Array, directive_resolver_1.DirectiveResolver, view_resolver_1.ViewResolver, pipe_resolver_1.PipeResolver, String])
    ], ProtoViewFactory);
    return ProtoViewFactory;
})();
exports.ProtoViewFactory = ProtoViewFactory;
function createComponent(protoViewFactory, cmd) {
    return protoViewFactory._createComponent(cmd);
}
function createEmbeddedTemplate(protoViewFactory, cmd, parent) {
    return protoViewFactory._createEmbeddedTemplate(cmd, parent);
}
var _ProtoViewInitializer = (function () {
    function _ProtoViewInitializer(_protoView, _directiveResolver, _protoViewFactory) {
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
    _ProtoViewInitializer.prototype.visitText = function (cmd, context) {
        if (cmd.isBound) {
            this.boundTextCount++;
        }
        return null;
    };
    _ProtoViewInitializer.prototype.visitNgContent = function (cmd, context) { return null; };
    _ProtoViewInitializer.prototype.visitBeginElement = function (cmd, context) {
        if (cmd.isBound) {
            this._visitBeginBoundElement(cmd, null);
        }
        else {
            this._visitBeginElement(cmd, null, null);
        }
        return null;
    };
    _ProtoViewInitializer.prototype.visitEndElement = function (context) { return this._visitEndElement(); };
    _ProtoViewInitializer.prototype.visitBeginComponent = function (cmd, context) {
        var nestedProtoView = createComponent(this._protoViewFactory, cmd);
        return this._visitBeginBoundElement(cmd, nestedProtoView);
    };
    _ProtoViewInitializer.prototype.visitEndComponent = function (context) { return this._visitEndElement(); };
    _ProtoViewInitializer.prototype.visitEmbeddedTemplate = function (cmd, context) {
        var nestedProtoView = createEmbeddedTemplate(this._protoViewFactory, cmd, this._protoView);
        if (cmd.isMerged) {
            this.mergeEmbeddedViewCount++;
        }
        this._visitBeginBoundElement(cmd, nestedProtoView);
        return this._visitEndElement();
    };
    _ProtoViewInitializer.prototype._visitBeginBoundElement = function (cmd, nestedProtoView) {
        if (lang_1.isPresent(nestedProtoView) && nestedProtoView.isMergable) {
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
    };
    _ProtoViewInitializer.prototype._visitBeginElement = function (cmd, elementBinder, protoElementInjector) {
        this.distanceToParentElementBinder =
            lang_1.isPresent(elementBinder) ? 1 : this.distanceToParentElementBinder + 1;
        this.distanceToParentProtoElementInjector =
            lang_1.isPresent(protoElementInjector) ? 1 : this.distanceToParentProtoElementInjector + 1;
        this.elementBinderStack.push(elementBinder);
        return null;
    };
    _ProtoViewInitializer.prototype._visitEndElement = function () {
        var parentElementBinder = this.elementBinderStack.pop();
        var parentProtoElementInjector = lang_1.isPresent(parentElementBinder) ? parentElementBinder.protoElementInjector : null;
        this.distanceToParentElementBinder = lang_1.isPresent(parentElementBinder) ?
            parentElementBinder.distanceToParent :
            this.distanceToParentElementBinder - 1;
        this.distanceToParentProtoElementInjector = lang_1.isPresent(parentProtoElementInjector) ?
            parentProtoElementInjector.distanceToParent :
            this.distanceToParentProtoElementInjector - 1;
        return null;
    };
    return _ProtoViewInitializer;
})();
function _createElementBinder(directiveResolver, nestedProtoView, elementBinderStack, boundElementIndex, distanceToParentBinder, distanceToParentPei, beginElementCmd) {
    var parentElementBinder = null;
    var parentProtoElementInjector = null;
    if (distanceToParentBinder > 0) {
        parentElementBinder = elementBinderStack[elementBinderStack.length - distanceToParentBinder];
    }
    if (lang_1.isBlank(parentElementBinder)) {
        distanceToParentBinder = -1;
    }
    if (distanceToParentPei > 0) {
        var peiBinder = elementBinderStack[elementBinderStack.length - distanceToParentPei];
        if (lang_1.isPresent(peiBinder)) {
            parentProtoElementInjector = peiBinder.protoElementInjector;
        }
    }
    if (lang_1.isBlank(parentProtoElementInjector)) {
        distanceToParentPei = -1;
    }
    var componentDirectiveProvider = null;
    var isEmbeddedTemplate = false;
    var directiveProviders = beginElementCmd.directives.map(function (type) { return provideDirective(directiveResolver, type); });
    if (beginElementCmd instanceof template_commands_1.BeginComponentCmd) {
        componentDirectiveProvider = directiveProviders[0];
    }
    else if (beginElementCmd instanceof template_commands_1.EmbeddedTemplateCmd) {
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
        protoElementInjector = element_injector_1.ProtoElementInjector.create(parentProtoElementInjector, boundElementIndex, directiveProviders, lang_1.isPresent(componentDirectiveProvider), distanceToParentPei, directiveVariableBindings);
        protoElementInjector.attributes = arrayToMap(beginElementCmd.attrNameAndValues, false);
    }
    return new element_binder_1.ElementBinder(boundElementIndex, parentElementBinder, distanceToParentBinder, protoElementInjector, componentDirectiveProvider, nestedProtoView);
}
function provideDirective(directiveResolver, type) {
    var annotation = directiveResolver.resolve(type);
    return element_injector_1.DirectiveProvider.createFromType(type, annotation);
}
function createDirectiveVariableBindings(variableNameAndValues, directiveProviders) {
    var directiveVariableBindings = new Map();
    for (var i = 0; i < variableNameAndValues.length; i += 2) {
        var templateName = variableNameAndValues[i];
        var dirIndex = variableNameAndValues[i + 1];
        if (lang_1.isNumber(dirIndex)) {
            directiveVariableBindings.set(templateName, dirIndex);
        }
        else {
            // a variable without a directive index -> reference the element
            directiveVariableBindings.set(templateName, null);
        }
    }
    return directiveVariableBindings;
}
exports.createDirectiveVariableBindings = createDirectiveVariableBindings;
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
        var item = di_1.resolveForwardRef(tree[i]);
        if (lang_1.isArray(item)) {
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
        if (lang_1.isArray(entry)) {
            _flattenStyleArr(entry, out);
        }
        else {
            out.push(entry);
        }
    }
    return out;
}
//# sourceMappingURL=proto_view_factory.js.map