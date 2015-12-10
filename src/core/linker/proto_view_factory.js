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
var api_2 = require('angular2/src/core/render/api');
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
        __metadata('design:paramtypes', [api_2.Renderer, Array, directive_resolver_1.DirectiveResolver, view_resolver_1.ViewResolver, pipe_resolver_1.PipeResolver, String])
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9fdmlld19mYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3Byb3RvX3ZpZXdfZmFjdG9yeS50cyJdLCJuYW1lcyI6WyJQcm90b1ZpZXdGYWN0b3J5IiwiUHJvdG9WaWV3RmFjdG9yeS5jb25zdHJ1Y3RvciIsIlByb3RvVmlld0ZhY3RvcnkuY2xlYXJDYWNoZSIsIlByb3RvVmlld0ZhY3RvcnkuY3JlYXRlSG9zdCIsIlByb3RvVmlld0ZhY3RvcnkuX2NyZWF0ZUNvbXBvbmVudCIsIlByb3RvVmlld0ZhY3RvcnkuX2NyZWF0ZUVtYmVkZGVkVGVtcGxhdGUiLCJQcm90b1ZpZXdGYWN0b3J5LmluaXRpYWxpemVQcm90b1ZpZXdJZk5lZWRlZCIsIlByb3RvVmlld0ZhY3RvcnkuX2luaXRpYWxpemVQcm90b1ZpZXciLCJQcm90b1ZpZXdGYWN0b3J5Ll9iaW5kUGlwZSIsIlByb3RvVmlld0ZhY3RvcnkuX2ZsYXR0ZW5QaXBlcyIsImNyZWF0ZUNvbXBvbmVudCIsImNyZWF0ZUVtYmVkZGVkVGVtcGxhdGUiLCJfUHJvdG9WaWV3SW5pdGlhbGl6ZXIiLCJfUHJvdG9WaWV3SW5pdGlhbGl6ZXIuY29uc3RydWN0b3IiLCJfUHJvdG9WaWV3SW5pdGlhbGl6ZXIudmlzaXRUZXh0IiwiX1Byb3RvVmlld0luaXRpYWxpemVyLnZpc2l0TmdDb250ZW50IiwiX1Byb3RvVmlld0luaXRpYWxpemVyLnZpc2l0QmVnaW5FbGVtZW50IiwiX1Byb3RvVmlld0luaXRpYWxpemVyLnZpc2l0RW5kRWxlbWVudCIsIl9Qcm90b1ZpZXdJbml0aWFsaXplci52aXNpdEJlZ2luQ29tcG9uZW50IiwiX1Byb3RvVmlld0luaXRpYWxpemVyLnZpc2l0RW5kQ29tcG9uZW50IiwiX1Byb3RvVmlld0luaXRpYWxpemVyLnZpc2l0RW1iZWRkZWRUZW1wbGF0ZSIsIl9Qcm90b1ZpZXdJbml0aWFsaXplci5fdmlzaXRCZWdpbkJvdW5kRWxlbWVudCIsIl9Qcm90b1ZpZXdJbml0aWFsaXplci5fdmlzaXRCZWdpbkVsZW1lbnQiLCJfUHJvdG9WaWV3SW5pdGlhbGl6ZXIuX3Zpc2l0RW5kRWxlbWVudCIsIl9jcmVhdGVFbGVtZW50QmluZGVyIiwicHJvdmlkZURpcmVjdGl2ZSIsImNyZWF0ZURpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3MiLCJhcnJheVRvTWFwIiwiX2ZsYXR0ZW5BcnJheSIsIl9mbGF0dGVuU3R5bGVBcnIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUJBQTBELDBCQUEwQixDQUFDLENBQUE7QUFFckYsb0JBQTBELDhCQUE4QixDQUFDLENBQUE7QUFFekYsbUJBQXdFLHNCQUFzQixDQUFDLENBQUE7QUFFL0YsOEJBQTJCLHdCQUF3QixDQUFDLENBQUE7QUFDcEQsc0JBQXlCLGdCQUFnQixDQUFDLENBQUE7QUFFMUMscUJBQTRELFFBQVEsQ0FBQyxDQUFBO0FBQ3JFLCtCQUE0QixrQkFBa0IsQ0FBQyxDQUFBO0FBQy9DLGlDQUFzRCxvQkFBb0IsQ0FBQyxDQUFBO0FBQzNFLG1DQUFnQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ3ZELDhCQUEyQixpQkFBaUIsQ0FBQyxDQUFBO0FBQzdDLDhCQUEyQixpQkFBaUIsQ0FBQyxDQUFBO0FBQzdDLHFCQUE4QyxrQkFBa0IsQ0FBQyxDQUFBO0FBQ2pFLDhDQUE2QixpREFBaUQsQ0FBQyxDQUFBO0FBRS9FLGtDQVlPLHFCQUFxQixDQUFDLENBQUE7QUFFN0Isb0JBQXVCLDhCQUE4QixDQUFDLENBQUE7QUFDdEQsbUNBQXFCLHNDQUFzQyxDQUFDLENBQUE7QUFHNUQ7SUFLRUEsMEJBQW9CQSxTQUFtQkEsRUFDaUJBLGNBQW1DQSxFQUN2RUEsa0JBQXFDQSxFQUFVQSxhQUEyQkEsRUFDMUVBLGFBQTJCQSxFQUEwQkEsTUFBY0E7UUFIbkVDLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO1FBQ2lCQSxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBcUJBO1FBQ3ZFQSx1QkFBa0JBLEdBQWxCQSxrQkFBa0JBLENBQW1CQTtRQUFVQSxrQkFBYUEsR0FBYkEsYUFBYUEsQ0FBY0E7UUFDMUVBLGtCQUFhQSxHQUFiQSxhQUFhQSxDQUFjQTtRQUEwQkEsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBUUE7UUFOL0VBLFdBQU1BLEdBQThCQSxJQUFJQSxHQUFHQSxFQUF3QkEsQ0FBQ0E7UUFDcEVBLG9CQUFlQSxHQUFXQSxDQUFDQSxDQUFDQTtJQUtzREEsQ0FBQ0E7SUFFM0ZELHFDQUFVQSxHQUFWQSxjQUFlRSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVyQ0YscUNBQVVBLEdBQVZBLFVBQVdBLG9CQUEwQ0E7UUFDbkRHLElBQUlBLGdCQUFnQkEsR0FBR0Esb0JBQW9CQSxDQUFDQSxRQUFRQSxDQUFDQTtRQUNyREEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUNsREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLElBQUlBLFFBQVFBLEdBQWtDQSxFQUFFQSxDQUFDQTtZQUNqREEsSUFBSUEsT0FBT0EsR0FBTUEsSUFBSUEsQ0FBQ0EsTUFBTUEsU0FBSUEsSUFBSUEsQ0FBQ0EsZUFBZUEsRUFBSUEsQ0FBQ0E7WUFDekRBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLHlCQUF5QkEsQ0FBQ0EsSUFBSUEsNkJBQXVCQSxDQUNoRUEsZ0JBQWdCQSxDQUFDQSxFQUFFQSxFQUFFQSxPQUFPQSxFQUFFQSx3QkFBaUJBLENBQUNBLElBQUlBLEVBQUVBLGdCQUFnQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMUZBLE1BQU1BO2dCQUNGQSxJQUFJQSxtQkFBWUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxFQUFFQSxFQUFFQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLGVBQVFBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLEVBQ25FQSxnQkFBZ0JBLENBQUNBLHFCQUFxQkEsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsa0JBQVVBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQzdGQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEVBQUVBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1FBQy9DQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUFFT0gsMkNBQWdCQSxHQUF4QkEsVUFBeUJBLEdBQXNCQTtRQUEvQ0ksaUJBcUJDQTtRQXBCQ0EsSUFBSUEsZUFBZUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDdERBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzdCQSxJQUFJQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQ0EsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7WUFDakRBLElBQUlBLGdCQUFnQkEsR0FBR0EsR0FBR0EsQ0FBQ0EsY0FBY0EsRUFBRUEsQ0FBQ0E7WUFDNUNBLElBQUlBLE1BQU1BLEdBQUdBLGdCQUFnQkEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUMzREEsSUFBSUEsT0FBT0EsR0FBTUEsSUFBSUEsQ0FBQ0EsTUFBTUEsU0FBSUEsSUFBSUEsQ0FBQ0EsZUFBZUEsRUFBSUEsQ0FBQ0E7WUFDekRBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLHlCQUF5QkEsQ0FBQ0EsSUFBSUEsNkJBQXVCQSxDQUNoRUEsZ0JBQWdCQSxDQUFDQSxFQUFFQSxFQUFFQSxPQUFPQSxFQUFFQSxHQUFHQSxDQUFDQSxhQUFhQSxFQUFFQSxnQkFBZ0JBLENBQUNBLFFBQVFBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1lBQ3pGQSxJQUFJQSxVQUFVQSxHQUFHQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFBQSxJQUFJQSxJQUFJQSxPQUFBQSxLQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFwQkEsQ0FBb0JBLENBQUNBLENBQUNBO1lBRTVFQSxlQUFlQSxHQUFHQSxJQUFJQSxtQkFBWUEsQ0FDOUJBLGdCQUFnQkEsQ0FBQ0EsRUFBRUEsRUFBRUEsZ0JBQWdCQSxDQUFDQSxRQUFRQSxFQUFFQSxlQUFRQSxDQUFDQSxTQUFTQSxFQUFFQSxJQUFJQSxFQUN4RUEsZ0JBQWdCQSxDQUFDQSxxQkFBcUJBLEVBQUVBLElBQUlBLEVBQUVBLGtCQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4RkEsOENBQThDQTtZQUM5Q0EsK0JBQStCQTtZQUMvQkEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxFQUFFQSxFQUFFQSxlQUFlQSxDQUFDQSxDQUFDQTtZQUN0REEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxlQUFlQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNuREEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsZUFBZUEsQ0FBQ0E7SUFDekJBLENBQUNBO0lBRU9KLGtEQUF1QkEsR0FBL0JBLFVBQWdDQSxHQUF3QkEsRUFBRUEsTUFBb0JBO1FBQzVFSyxJQUFJQSxlQUFlQSxHQUFHQSxJQUFJQSxtQkFBWUEsQ0FDbENBLE1BQU1BLENBQUNBLFVBQVVBLEVBQUVBLEdBQUdBLENBQUNBLFFBQVFBLEVBQUVBLGVBQVFBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLENBQUNBLHFCQUFxQkEsRUFDM0ZBLFVBQVVBLENBQUNBLEdBQUdBLENBQUNBLHFCQUFxQkEsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsSUFBSUEsa0JBQVVBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1FBQ3RGQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQkEsSUFBSUEsQ0FBQ0EsMkJBQTJCQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQTtRQUNwREEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsZUFBZUEsQ0FBQ0E7SUFDekJBLENBQUNBO0lBRURMLHNEQUEyQkEsR0FBM0JBLFVBQTRCQSxTQUF1QkE7UUFDakRNLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQy9CQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxlQUFlQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFVQSxFQUFFQSxTQUFTQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtZQUMxRkEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxTQUFTQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUMvQ0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFT04sK0NBQW9CQSxHQUE1QkEsVUFBNkJBLFNBQXVCQSxFQUFFQSxNQUEwQkE7UUFDOUVPLElBQUlBLFdBQVdBLEdBQUdBLElBQUlBLHFCQUFxQkEsQ0FBQ0EsU0FBU0EsRUFBRUEsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN0RkEsb0NBQWdCQSxDQUFDQSxXQUFXQSxFQUFFQSxTQUFTQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUN0REEsSUFBSUEsU0FBU0EsR0FDVEEsSUFBSUEsNEJBQXFCQSxDQUFDQSxXQUFXQSxDQUFDQSxzQkFBc0JBLEVBQUVBLFdBQVdBLENBQUNBLGlCQUFpQkEsRUFDakVBLFdBQVdBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBO1FBQzFEQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxXQUFXQSxDQUFDQSxjQUFjQSxFQUFFQSxXQUFXQSxDQUFDQSxjQUFjQSxFQUFFQSxTQUFTQSxFQUN6RUEsV0FBV0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQTtJQUNoREEsQ0FBQ0E7SUFFT1Asb0NBQVNBLEdBQWpCQSxVQUFrQkEsY0FBY0E7UUFDOUJRLElBQUlBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLE9BQU9BLENBQUNBLGNBQWNBLENBQUNBLENBQUNBO1FBQ3REQSxNQUFNQSxDQUFDQSw0QkFBWUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsY0FBY0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDM0RBLENBQUNBO0lBRU9SLHdDQUFhQSxHQUFyQkEsVUFBc0JBLElBQWtCQTtRQUN0Q1MsSUFBSUEsS0FBS0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDZkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ25DQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUM1Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNuQ0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDZkEsQ0FBQ0E7SUE1RkhUO1FBQUNBLGVBQVVBLEVBQUVBO1FBTUNBLFdBQUNBLGFBQVFBLEVBQUVBLENBQUFBO1FBQUNBLFdBQUNBLFdBQU1BLENBQUNBLDhDQUFjQSxDQUFDQSxDQUFBQTtRQUVFQSxXQUFDQSxXQUFNQSxDQUFDQSwyQkFBTUEsQ0FBQ0EsQ0FBQUE7O3lCQXFGakVBO0lBQURBLHVCQUFDQTtBQUFEQSxDQUFDQSxBQTdGRCxJQTZGQztBQTVGWSx3QkFBZ0IsbUJBNEY1QixDQUFBO0FBR0QseUJBQXlCLGdCQUFrQyxFQUFFLEdBQXNCO0lBQ2pGVSxNQUFNQSxDQUFPQSxnQkFBaUJBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7QUFDdkRBLENBQUNBO0FBRUQsZ0NBQWdDLGdCQUFrQyxFQUFFLEdBQXdCLEVBQzVELE1BQW9CO0lBQ2xEQyxNQUFNQSxDQUFPQSxnQkFBaUJBLENBQUNBLHVCQUF1QkEsQ0FBQ0EsR0FBR0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7QUFDdEVBLENBQUNBO0FBRUQ7SUFZRUMsK0JBQW9CQSxVQUF3QkEsRUFBVUEsa0JBQXFDQSxFQUN2RUEsaUJBQW1DQTtRQURuQ0MsZUFBVUEsR0FBVkEsVUFBVUEsQ0FBY0E7UUFBVUEsdUJBQWtCQSxHQUFsQkEsa0JBQWtCQSxDQUFtQkE7UUFDdkVBLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBa0JBO1FBWnZEQSxzQkFBaUJBLEdBQXdCQSxJQUFJQSxHQUFHQSxFQUFrQkEsQ0FBQ0E7UUFDbkVBLG1CQUFjQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUMzQkEsc0JBQWlCQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUM5QkEsdUJBQWtCQSxHQUFvQkEsRUFBRUEsQ0FBQ0E7UUFDekNBLGtDQUE2QkEsR0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLHlDQUFvQ0EsR0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDakRBLG1CQUFjQSxHQUFvQkEsRUFBRUEsQ0FBQ0E7UUFDckNBLDJCQUFzQkEsR0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLHNCQUFpQkEsR0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDOUJBLG1CQUFjQSxHQUFXQSxDQUFDQSxDQUFDQTtJQUcrQkEsQ0FBQ0E7SUFFM0RELHlDQUFTQSxHQUFUQSxVQUFVQSxHQUFZQSxFQUFFQSxPQUFZQTtRQUNsQ0UsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaEJBLElBQUlBLENBQUNBLGNBQWNBLEVBQUVBLENBQUNBO1FBQ3hCQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUNERiw4Q0FBY0EsR0FBZEEsVUFBZUEsR0FBaUJBLEVBQUVBLE9BQVlBLElBQVNHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBQ3JFSCxpREFBaUJBLEdBQWpCQSxVQUFrQkEsR0FBb0JBLEVBQUVBLE9BQVlBO1FBQ2xESSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQkEsSUFBSUEsQ0FBQ0EsdUJBQXVCQSxDQUFDQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUMxQ0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUMzQ0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFDREosK0NBQWVBLEdBQWZBLFVBQWdCQSxPQUFZQSxJQUFTSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ3RFTCxtREFBbUJBLEdBQW5CQSxVQUFvQkEsR0FBc0JBLEVBQUVBLE9BQVlBO1FBQ3RETSxJQUFJQSxlQUFlQSxHQUFHQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1FBQ25FQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSx1QkFBdUJBLENBQUNBLEdBQUdBLEVBQUVBLGVBQWVBLENBQUNBLENBQUNBO0lBQzVEQSxDQUFDQTtJQUNETixpREFBaUJBLEdBQWpCQSxVQUFrQkEsT0FBWUEsSUFBU08sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN4RVAscURBQXFCQSxHQUFyQkEsVUFBc0JBLEdBQXdCQSxFQUFFQSxPQUFZQTtRQUMxRFEsSUFBSUEsZUFBZUEsR0FBR0Esc0JBQXNCQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1FBQzNGQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQkEsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxFQUFFQSxDQUFDQTtRQUNoQ0EsQ0FBQ0E7UUFDREEsSUFBSUEsQ0FBQ0EsdUJBQXVCQSxDQUFDQSxHQUFHQSxFQUFFQSxlQUFlQSxDQUFDQSxDQUFDQTtRQUNuREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQTtJQUNqQ0EsQ0FBQ0E7SUFFT1IsdURBQXVCQSxHQUEvQkEsVUFBZ0NBLEdBQXFCQSxFQUFFQSxlQUE2QkE7UUFDbEZTLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM3REEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxJQUFJQSxlQUFlQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxDQUFDQTtZQUNqRUEsSUFBSUEsQ0FBQ0EsY0FBY0EsSUFBSUEsZUFBZUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0E7WUFDM0RBLElBQUlBLENBQUNBLHNCQUFzQkEsSUFBSUEsZUFBZUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQTtRQUM3RUEsQ0FBQ0E7UUFDREEsSUFBSUEsYUFBYUEsR0FBR0Esb0JBQW9CQSxDQUNwQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxFQUFFQSxlQUFlQSxFQUFFQSxJQUFJQSxDQUFDQSxrQkFBa0JBLEVBQUVBLElBQUlBLENBQUNBLGlCQUFpQkEsRUFDekZBLElBQUlBLENBQUNBLDZCQUE2QkEsRUFBRUEsSUFBSUEsQ0FBQ0Esb0NBQW9DQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUN4RkEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDeENBLElBQUlBLG9CQUFvQkEsR0FBR0EsYUFBYUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQTtRQUM5REEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EscUJBQXFCQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUM3REEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxHQUFHQSxDQUFTQSxHQUFHQSxDQUFDQSxxQkFBcUJBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0E7UUFDM0ZBLENBQUNBO1FBQ0RBLElBQUlBLENBQUNBLGlCQUFpQkEsRUFBRUEsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLGlCQUFpQkEsRUFBRUEsQ0FBQ0E7UUFDekJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsR0FBR0EsRUFBRUEsYUFBYUEsRUFBRUEsb0JBQW9CQSxDQUFDQSxDQUFDQTtJQUMzRUEsQ0FBQ0E7SUFFT1Qsa0RBQWtCQSxHQUExQkEsVUFBMkJBLEdBQXFCQSxFQUFFQSxhQUE0QkEsRUFDbkRBLG9CQUEwQ0E7UUFDbkVVLElBQUlBLENBQUNBLDZCQUE2QkE7WUFDOUJBLGdCQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSw2QkFBNkJBLEdBQUdBLENBQUNBLENBQUNBO1FBQzFFQSxJQUFJQSxDQUFDQSxvQ0FBb0NBO1lBQ3JDQSxnQkFBU0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxvQ0FBb0NBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3hGQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1FBQzVDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVPVixnREFBZ0JBLEdBQXhCQTtRQUNFVyxJQUFJQSxtQkFBbUJBLEdBQUdBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDeERBLElBQUlBLDBCQUEwQkEsR0FDMUJBLGdCQUFTQSxDQUFDQSxtQkFBbUJBLENBQUNBLEdBQUdBLG1CQUFtQkEsQ0FBQ0Esb0JBQW9CQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNyRkEsSUFBSUEsQ0FBQ0EsNkJBQTZCQSxHQUFHQSxnQkFBU0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQTtZQUMxQkEsbUJBQW1CQSxDQUFDQSxnQkFBZ0JBO1lBQ3BDQSxJQUFJQSxDQUFDQSw2QkFBNkJBLEdBQUdBLENBQUNBLENBQUNBO1FBQ2hGQSxJQUFJQSxDQUFDQSxvQ0FBb0NBLEdBQUdBLGdCQUFTQSxDQUFDQSwwQkFBMEJBLENBQUNBO1lBQ2pDQSwwQkFBMEJBLENBQUNBLGdCQUFnQkE7WUFDM0NBLElBQUlBLENBQUNBLG9DQUFvQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDOUZBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0lBQ0hYLDRCQUFDQTtBQUFEQSxDQUFDQSxBQXRGRCxJQXNGQztBQUdELDhCQUE4QixpQkFBb0MsRUFBRSxlQUE2QixFQUNuRSxrQkFBbUMsRUFBRSxpQkFBeUIsRUFDOUQsc0JBQThCLEVBQUUsbUJBQTJCLEVBQzNELGVBQWlDO0lBQzdEWSxJQUFJQSxtQkFBbUJBLEdBQWtCQSxJQUFJQSxDQUFDQTtJQUM5Q0EsSUFBSUEsMEJBQTBCQSxHQUF5QkEsSUFBSUEsQ0FBQ0E7SUFDNURBLEVBQUVBLENBQUNBLENBQUNBLHNCQUFzQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDL0JBLG1CQUFtQkEsR0FBR0Esa0JBQWtCQSxDQUFDQSxrQkFBa0JBLENBQUNBLE1BQU1BLEdBQUdBLHNCQUFzQkEsQ0FBQ0EsQ0FBQ0E7SUFDL0ZBLENBQUNBO0lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakNBLHNCQUFzQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDOUJBLENBQUNBO0lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLG1CQUFtQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDNUJBLElBQUlBLFNBQVNBLEdBQUdBLGtCQUFrQkEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxNQUFNQSxHQUFHQSxtQkFBbUJBLENBQUNBLENBQUNBO1FBQ3BGQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDekJBLDBCQUEwQkEsR0FBR0EsU0FBU0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQTtRQUM5REEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsMEJBQTBCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN4Q0EsbUJBQW1CQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMzQkEsQ0FBQ0E7SUFDREEsSUFBSUEsMEJBQTBCQSxHQUFzQkEsSUFBSUEsQ0FBQ0E7SUFDekRBLElBQUlBLGtCQUFrQkEsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDL0JBLElBQUlBLGtCQUFrQkEsR0FDbEJBLGVBQWVBLENBQUNBLFVBQVVBLENBQUNBLEdBQUdBLENBQUNBLFVBQUFBLElBQUlBLElBQUlBLE9BQUFBLGdCQUFnQkEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUF6Q0EsQ0FBeUNBLENBQUNBLENBQUNBO0lBQ3RGQSxFQUFFQSxDQUFDQSxDQUFDQSxlQUFlQSxZQUFZQSxxQ0FBaUJBLENBQUNBLENBQUNBLENBQUNBO1FBQ2pEQSwwQkFBMEJBLEdBQUdBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDckRBLENBQUNBO0lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLGVBQWVBLFlBQVlBLHVDQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDMURBLGtCQUFrQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDNUJBLENBQUNBO0lBRURBLElBQUlBLG9CQUFvQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDaENBLHNGQUFzRkE7SUFDdEZBLHFEQUFxREE7SUFDckRBLG1FQUFtRUE7SUFDbkVBLGtFQUFrRUE7SUFDbEVBLDhGQUE4RkE7SUFDOUZBLElBQUlBLFlBQVlBLEdBQUdBLGVBQWVBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDcEVBLEVBQUVBLENBQUNBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsSUFBSUEsWUFBWUEsSUFBSUEsa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN4RUEsSUFBSUEseUJBQXlCQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFrQkEsQ0FBQ0E7UUFDMURBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLHlCQUF5QkEsR0FBR0EsK0JBQStCQSxDQUN2REEsZUFBZUEsQ0FBQ0EscUJBQXFCQSxFQUFFQSxrQkFBa0JBLENBQUNBLENBQUNBO1FBQ2pFQSxDQUFDQTtRQUNEQSxvQkFBb0JBLEdBQUdBLHVDQUFvQkEsQ0FBQ0EsTUFBTUEsQ0FDOUNBLDBCQUEwQkEsRUFBRUEsaUJBQWlCQSxFQUFFQSxrQkFBa0JBLEVBQ2pFQSxnQkFBU0EsQ0FBQ0EsMEJBQTBCQSxDQUFDQSxFQUFFQSxtQkFBbUJBLEVBQUVBLHlCQUF5QkEsQ0FBQ0EsQ0FBQ0E7UUFDM0ZBLG9CQUFvQkEsQ0FBQ0EsVUFBVUEsR0FBR0EsVUFBVUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN6RkEsQ0FBQ0E7SUFFREEsTUFBTUEsQ0FBQ0EsSUFBSUEsOEJBQWFBLENBQUNBLGlCQUFpQkEsRUFBRUEsbUJBQW1CQSxFQUFFQSxzQkFBc0JBLEVBQzlEQSxvQkFBb0JBLEVBQUVBLDBCQUEwQkEsRUFBRUEsZUFBZUEsQ0FBQ0EsQ0FBQ0E7QUFDOUZBLENBQUNBO0FBRUQsMEJBQTBCLGlCQUFvQyxFQUFFLElBQVU7SUFDeEVDLElBQUlBLFVBQVVBLEdBQUdBLGlCQUFpQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDakRBLE1BQU1BLENBQUNBLG9DQUFpQkEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7QUFDNURBLENBQUNBO0FBRUQseUNBQ0kscUJBQTZDLEVBQzdDLGtCQUF1QztJQUN6Q0MsSUFBSUEseUJBQXlCQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFrQkEsQ0FBQ0E7SUFDMURBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLHFCQUFxQkEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFDekRBLElBQUlBLFlBQVlBLEdBQVdBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDcERBLElBQUlBLFFBQVFBLEdBQVdBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDcERBLEVBQUVBLENBQUNBLENBQUNBLGVBQVFBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZCQSx5QkFBeUJBLENBQUNBLEdBQUdBLENBQUNBLFlBQVlBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBQ3hEQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxnRUFBZ0VBO1lBQ2hFQSx5QkFBeUJBLENBQUNBLEdBQUdBLENBQUNBLFlBQVlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BEQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSx5QkFBeUJBLENBQUNBO0FBQ25DQSxDQUFDQTtBQWZlLHVDQUErQixrQ0FlOUMsQ0FBQTtBQUdELG9CQUFvQixHQUFhLEVBQUUsT0FBZ0I7SUFDakRDLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLEdBQUdBLEVBQWtCQSxDQUFDQTtJQUN2Q0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFDdkNBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQ1pBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ2pDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqQ0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFDREEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7QUFDaEJBLENBQUNBO0FBRUQsdUJBQXVCLElBQVcsRUFBRSxHQUFtQztJQUNyRUMsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7UUFDckNBLElBQUlBLElBQUlBLEdBQUdBLHNCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDdENBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xCQSxhQUFhQSxDQUFDQSxJQUFJQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUMzQkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDakJBLENBQUNBO0lBQ0hBLENBQUNBO0FBQ0hBLENBQUNBO0FBRUQsMEJBQTBCLEdBQTBCLEVBQUUsR0FBYTtJQUNqRUMsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7UUFDcENBLElBQUlBLEtBQUtBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ25CQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuQkEsZ0JBQWdCQSxDQUFRQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUN0Q0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBU0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDMUJBLENBQUNBO0lBQ0hBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO0FBQ2JBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIFR5cGUsIGlzQXJyYXksIGlzTnVtYmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge1JlbmRlclByb3RvVmlld1JlZiwgUmVuZGVyQ29tcG9uZW50VGVtcGxhdGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuXG5pbXBvcnQge09wdGlvbmFsLCBJbmplY3RhYmxlLCBQcm92aWRlciwgcmVzb2x2ZUZvcndhcmRSZWYsIEluamVjdH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5pbXBvcnQge1BpcGVQcm92aWRlcn0gZnJvbSAnLi4vcGlwZXMvcGlwZV9wcm92aWRlcic7XG5pbXBvcnQge1Byb3RvUGlwZXN9IGZyb20gJy4uL3BpcGVzL3BpcGVzJztcblxuaW1wb3J0IHtBcHBQcm90b1ZpZXcsIEFwcFByb3RvVmlld01lcmdlSW5mbywgVmlld1R5cGV9IGZyb20gJy4vdmlldyc7XG5pbXBvcnQge0VsZW1lbnRCaW5kZXJ9IGZyb20gJy4vZWxlbWVudF9iaW5kZXInO1xuaW1wb3J0IHtQcm90b0VsZW1lbnRJbmplY3RvciwgRGlyZWN0aXZlUHJvdmlkZXJ9IGZyb20gJy4vZWxlbWVudF9pbmplY3Rvcic7XG5pbXBvcnQge0RpcmVjdGl2ZVJlc29sdmVyfSBmcm9tICcuL2RpcmVjdGl2ZV9yZXNvbHZlcic7XG5pbXBvcnQge1ZpZXdSZXNvbHZlcn0gZnJvbSAnLi92aWV3X3Jlc29sdmVyJztcbmltcG9ydCB7UGlwZVJlc29sdmVyfSBmcm9tICcuL3BpcGVfcmVzb2x2ZXInO1xuaW1wb3J0IHtWaWV3TWV0YWRhdGEsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuLi9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7UExBVEZPUk1fUElQRVN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3BsYXRmb3JtX2RpcmVjdGl2ZXNfYW5kX3BpcGVzJztcblxuaW1wb3J0IHtcbiAgdmlzaXRBbGxDb21tYW5kcyxcbiAgQ29tcGlsZWRDb21wb25lbnRUZW1wbGF0ZSxcbiAgQ29tcGlsZWRIb3N0VGVtcGxhdGUsXG4gIFRlbXBsYXRlQ21kLFxuICBDb21tYW5kVmlzaXRvcixcbiAgRW1iZWRkZWRUZW1wbGF0ZUNtZCxcbiAgQmVnaW5Db21wb25lbnRDbWQsXG4gIEJlZ2luRWxlbWVudENtZCxcbiAgSUJlZ2luRWxlbWVudENtZCxcbiAgVGV4dENtZCxcbiAgTmdDb250ZW50Q21kXG59IGZyb20gJy4vdGVtcGxhdGVfY29tbWFuZHMnO1xuXG5pbXBvcnQge1JlbmRlcmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7QVBQX0lEfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9hcHBsaWNhdGlvbl90b2tlbnMnO1xuXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQcm90b1ZpZXdGYWN0b3J5IHtcbiAgcHJpdmF0ZSBfY2FjaGU6IE1hcDxzdHJpbmcsIEFwcFByb3RvVmlldz4gPSBuZXcgTWFwPHN0cmluZywgQXBwUHJvdG9WaWV3PigpO1xuICBwcml2YXRlIF9uZXh0VGVtcGxhdGVJZDogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoUExBVEZPUk1fUElQRVMpIHByaXZhdGUgX3BsYXRmb3JtUGlwZXM6IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgICAgICAgICAgIHByaXZhdGUgX2RpcmVjdGl2ZVJlc29sdmVyOiBEaXJlY3RpdmVSZXNvbHZlciwgcHJpdmF0ZSBfdmlld1Jlc29sdmVyOiBWaWV3UmVzb2x2ZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3BpcGVSZXNvbHZlcjogUGlwZVJlc29sdmVyLCBASW5qZWN0KEFQUF9JRCkgcHJpdmF0ZSBfYXBwSWQ6IHN0cmluZykge31cblxuICBjbGVhckNhY2hlKCkgeyB0aGlzLl9jYWNoZS5jbGVhcigpOyB9XG5cbiAgY3JlYXRlSG9zdChjb21waWxlZEhvc3RUZW1wbGF0ZTogQ29tcGlsZWRIb3N0VGVtcGxhdGUpOiBBcHBQcm90b1ZpZXcge1xuICAgIHZhciBjb21waWxlZFRlbXBsYXRlID0gY29tcGlsZWRIb3N0VGVtcGxhdGUudGVtcGxhdGU7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuX2NhY2hlLmdldChjb21waWxlZFRlbXBsYXRlLmlkKTtcbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICB2YXIgZW1wdHlNYXA6IHtba2V5OiBzdHJpbmddOiBQaXBlUHJvdmlkZXJ9ID0ge307XG4gICAgICB2YXIgc2hvcnRJZCA9IGAke3RoaXMuX2FwcElkfS0ke3RoaXMuX25leHRUZW1wbGF0ZUlkKyt9YDtcbiAgICAgIHRoaXMuX3JlbmRlcmVyLnJlZ2lzdGVyQ29tcG9uZW50VGVtcGxhdGUobmV3IFJlbmRlckNvbXBvbmVudFRlbXBsYXRlKFxuICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUuaWQsIHNob3J0SWQsIFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsIGNvbXBpbGVkVGVtcGxhdGUuY29tbWFuZHMsIFtdKSk7XG4gICAgICByZXN1bHQgPVxuICAgICAgICAgIG5ldyBBcHBQcm90b1ZpZXcoY29tcGlsZWRUZW1wbGF0ZS5pZCwgY29tcGlsZWRUZW1wbGF0ZS5jb21tYW5kcywgVmlld1R5cGUuSE9TVCwgdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUuY2hhbmdlRGV0ZWN0b3JGYWN0b3J5LCBudWxsLCBuZXcgUHJvdG9QaXBlcyhlbXB0eU1hcCkpO1xuICAgICAgdGhpcy5fY2FjaGUuc2V0KGNvbXBpbGVkVGVtcGxhdGUuaWQsIHJlc3VsdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVDb21wb25lbnQoY21kOiBCZWdpbkNvbXBvbmVudENtZCk6IEFwcFByb3RvVmlldyB7XG4gICAgdmFyIG5lc3RlZFByb3RvVmlldyA9IHRoaXMuX2NhY2hlLmdldChjbWQudGVtcGxhdGVJZCk7XG4gICAgaWYgKGlzQmxhbmsobmVzdGVkUHJvdG9WaWV3KSkge1xuICAgICAgdmFyIGNvbXBvbmVudCA9IGNtZC5kaXJlY3RpdmVzWzBdO1xuICAgICAgdmFyIHZpZXcgPSB0aGlzLl92aWV3UmVzb2x2ZXIucmVzb2x2ZShjb21wb25lbnQpO1xuICAgICAgdmFyIGNvbXBpbGVkVGVtcGxhdGUgPSBjbWQudGVtcGxhdGVHZXR0ZXIoKTtcbiAgICAgIHZhciBzdHlsZXMgPSBfZmxhdHRlblN0eWxlQXJyKGNvbXBpbGVkVGVtcGxhdGUuc3R5bGVzLCBbXSk7XG4gICAgICB2YXIgc2hvcnRJZCA9IGAke3RoaXMuX2FwcElkfS0ke3RoaXMuX25leHRUZW1wbGF0ZUlkKyt9YDtcbiAgICAgIHRoaXMuX3JlbmRlcmVyLnJlZ2lzdGVyQ29tcG9uZW50VGVtcGxhdGUobmV3IFJlbmRlckNvbXBvbmVudFRlbXBsYXRlKFxuICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUuaWQsIHNob3J0SWQsIGNtZC5lbmNhcHN1bGF0aW9uLCBjb21waWxlZFRlbXBsYXRlLmNvbW1hbmRzLCBzdHlsZXMpKTtcbiAgICAgIHZhciBib3VuZFBpcGVzID0gdGhpcy5fZmxhdHRlblBpcGVzKHZpZXcpLm1hcChwaXBlID0+IHRoaXMuX2JpbmRQaXBlKHBpcGUpKTtcblxuICAgICAgbmVzdGVkUHJvdG9WaWV3ID0gbmV3IEFwcFByb3RvVmlldyhcbiAgICAgICAgICBjb21waWxlZFRlbXBsYXRlLmlkLCBjb21waWxlZFRlbXBsYXRlLmNvbW1hbmRzLCBWaWV3VHlwZS5DT01QT05FTlQsIHRydWUsXG4gICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZS5jaGFuZ2VEZXRlY3RvckZhY3RvcnksIG51bGwsIFByb3RvUGlwZXMuZnJvbVByb3ZpZGVycyhib3VuZFBpcGVzKSk7XG4gICAgICAvLyBOb3RlOiBUaGUgY2FjaGUgaXMgdXBkYXRlZCBiZWZvcmUgcmVjdXJzaW5nXG4gICAgICAvLyB0byBiZSBhYmxlIHRvIHJlc29sdmUgY3ljbGVzXG4gICAgICB0aGlzLl9jYWNoZS5zZXQoY29tcGlsZWRUZW1wbGF0ZS5pZCwgbmVzdGVkUHJvdG9WaWV3KTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm90b1ZpZXcobmVzdGVkUHJvdG9WaWV3LCBudWxsKTtcbiAgICB9XG4gICAgcmV0dXJuIG5lc3RlZFByb3RvVmlldztcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUVtYmVkZGVkVGVtcGxhdGUoY21kOiBFbWJlZGRlZFRlbXBsYXRlQ21kLCBwYXJlbnQ6IEFwcFByb3RvVmlldyk6IEFwcFByb3RvVmlldyB7XG4gICAgdmFyIG5lc3RlZFByb3RvVmlldyA9IG5ldyBBcHBQcm90b1ZpZXcoXG4gICAgICAgIHBhcmVudC50ZW1wbGF0ZUlkLCBjbWQuY2hpbGRyZW4sIFZpZXdUeXBlLkVNQkVEREVELCBjbWQuaXNNZXJnZWQsIGNtZC5jaGFuZ2VEZXRlY3RvckZhY3RvcnksXG4gICAgICAgIGFycmF5VG9NYXAoY21kLnZhcmlhYmxlTmFtZUFuZFZhbHVlcywgdHJ1ZSksIG5ldyBQcm90b1BpcGVzKHBhcmVudC5waXBlcy5jb25maWcpKTtcbiAgICBpZiAoY21kLmlzTWVyZ2VkKSB7XG4gICAgICB0aGlzLmluaXRpYWxpemVQcm90b1ZpZXdJZk5lZWRlZChuZXN0ZWRQcm90b1ZpZXcpO1xuICAgIH1cbiAgICByZXR1cm4gbmVzdGVkUHJvdG9WaWV3O1xuICB9XG5cbiAgaW5pdGlhbGl6ZVByb3RvVmlld0lmTmVlZGVkKHByb3RvVmlldzogQXBwUHJvdG9WaWV3KSB7XG4gICAgaWYgKCFwcm90b1ZpZXcuaXNJbml0aWFsaXplZCgpKSB7XG4gICAgICB2YXIgcmVuZGVyID0gdGhpcy5fcmVuZGVyZXIuY3JlYXRlUHJvdG9WaWV3KHByb3RvVmlldy50ZW1wbGF0ZUlkLCBwcm90b1ZpZXcudGVtcGxhdGVDbWRzKTtcbiAgICAgIHRoaXMuX2luaXRpYWxpemVQcm90b1ZpZXcocHJvdG9WaWV3LCByZW5kZXIpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2luaXRpYWxpemVQcm90b1ZpZXcocHJvdG9WaWV3OiBBcHBQcm90b1ZpZXcsIHJlbmRlcjogUmVuZGVyUHJvdG9WaWV3UmVmKSB7XG4gICAgdmFyIGluaXRpYWxpemVyID0gbmV3IF9Qcm90b1ZpZXdJbml0aWFsaXplcihwcm90b1ZpZXcsIHRoaXMuX2RpcmVjdGl2ZVJlc29sdmVyLCB0aGlzKTtcbiAgICB2aXNpdEFsbENvbW1hbmRzKGluaXRpYWxpemVyLCBwcm90b1ZpZXcudGVtcGxhdGVDbWRzKTtcbiAgICB2YXIgbWVyZ2VJbmZvID1cbiAgICAgICAgbmV3IEFwcFByb3RvVmlld01lcmdlSW5mbyhpbml0aWFsaXplci5tZXJnZUVtYmVkZGVkVmlld0NvdW50LCBpbml0aWFsaXplci5tZXJnZUVsZW1lbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsaXplci5tZXJnZVZpZXdDb3VudCk7XG4gICAgcHJvdG9WaWV3LmluaXQocmVuZGVyLCBpbml0aWFsaXplci5lbGVtZW50QmluZGVycywgaW5pdGlhbGl6ZXIuYm91bmRUZXh0Q291bnQsIG1lcmdlSW5mbyxcbiAgICAgICAgICAgICAgICAgICBpbml0aWFsaXplci52YXJpYWJsZUxvY2F0aW9ucyk7XG4gIH1cblxuICBwcml2YXRlIF9iaW5kUGlwZSh0eXBlT3JQcm92aWRlcik6IFBpcGVQcm92aWRlciB7XG4gICAgbGV0IG1ldGEgPSB0aGlzLl9waXBlUmVzb2x2ZXIucmVzb2x2ZSh0eXBlT3JQcm92aWRlcik7XG4gICAgcmV0dXJuIFBpcGVQcm92aWRlci5jcmVhdGVGcm9tVHlwZSh0eXBlT3JQcm92aWRlciwgbWV0YSk7XG4gIH1cblxuICBwcml2YXRlIF9mbGF0dGVuUGlwZXModmlldzogVmlld01ldGFkYXRhKTogYW55W10ge1xuICAgIGxldCBwaXBlcyA9IFtdO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fcGxhdGZvcm1QaXBlcykpIHtcbiAgICAgIF9mbGF0dGVuQXJyYXkodGhpcy5fcGxhdGZvcm1QaXBlcywgcGlwZXMpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHZpZXcucGlwZXMpKSB7XG4gICAgICBfZmxhdHRlbkFycmF5KHZpZXcucGlwZXMsIHBpcGVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHBpcGVzO1xuICB9XG59XG5cblxuZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KHByb3RvVmlld0ZhY3Rvcnk6IFByb3RvVmlld0ZhY3RvcnksIGNtZDogQmVnaW5Db21wb25lbnRDbWQpOiBBcHBQcm90b1ZpZXcge1xuICByZXR1cm4gKDxhbnk+cHJvdG9WaWV3RmFjdG9yeSkuX2NyZWF0ZUNvbXBvbmVudChjbWQpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVFbWJlZGRlZFRlbXBsYXRlKHByb3RvVmlld0ZhY3Rvcnk6IFByb3RvVmlld0ZhY3RvcnksIGNtZDogRW1iZWRkZWRUZW1wbGF0ZUNtZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBBcHBQcm90b1ZpZXcpOiBBcHBQcm90b1ZpZXcge1xuICByZXR1cm4gKDxhbnk+cHJvdG9WaWV3RmFjdG9yeSkuX2NyZWF0ZUVtYmVkZGVkVGVtcGxhdGUoY21kLCBwYXJlbnQpO1xufVxuXG5jbGFzcyBfUHJvdG9WaWV3SW5pdGlhbGl6ZXIgaW1wbGVtZW50cyBDb21tYW5kVmlzaXRvciB7XG4gIHZhcmlhYmxlTG9jYXRpb25zOiBNYXA8c3RyaW5nLCBudW1iZXI+ID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgYm91bmRUZXh0Q291bnQ6IG51bWJlciA9IDA7XG4gIGJvdW5kRWxlbWVudEluZGV4OiBudW1iZXIgPSAwO1xuICBlbGVtZW50QmluZGVyU3RhY2s6IEVsZW1lbnRCaW5kZXJbXSA9IFtdO1xuICBkaXN0YW5jZVRvUGFyZW50RWxlbWVudEJpbmRlcjogbnVtYmVyID0gMDtcbiAgZGlzdGFuY2VUb1BhcmVudFByb3RvRWxlbWVudEluamVjdG9yOiBudW1iZXIgPSAwO1xuICBlbGVtZW50QmluZGVyczogRWxlbWVudEJpbmRlcltdID0gW107XG4gIG1lcmdlRW1iZWRkZWRWaWV3Q291bnQ6IG51bWJlciA9IDA7XG4gIG1lcmdlRWxlbWVudENvdW50OiBudW1iZXIgPSAwO1xuICBtZXJnZVZpZXdDb3VudDogbnVtYmVyID0gMTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wcm90b1ZpZXc6IEFwcFByb3RvVmlldywgcHJpdmF0ZSBfZGlyZWN0aXZlUmVzb2x2ZXI6IERpcmVjdGl2ZVJlc29sdmVyLFxuICAgICAgICAgICAgICBwcml2YXRlIF9wcm90b1ZpZXdGYWN0b3J5OiBQcm90b1ZpZXdGYWN0b3J5KSB7fVxuXG4gIHZpc2l0VGV4dChjbWQ6IFRleHRDbWQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgaWYgKGNtZC5pc0JvdW5kKSB7XG4gICAgICB0aGlzLmJvdW5kVGV4dENvdW50Kys7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0TmdDb250ZW50KGNtZDogTmdDb250ZW50Q21kLCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdEJlZ2luRWxlbWVudChjbWQ6IEJlZ2luRWxlbWVudENtZCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBpZiAoY21kLmlzQm91bmQpIHtcbiAgICAgIHRoaXMuX3Zpc2l0QmVnaW5Cb3VuZEVsZW1lbnQoY21kLCBudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdmlzaXRCZWdpbkVsZW1lbnQoY21kLCBudWxsLCBudWxsKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRFbmRFbGVtZW50KGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiB0aGlzLl92aXNpdEVuZEVsZW1lbnQoKTsgfVxuICB2aXNpdEJlZ2luQ29tcG9uZW50KGNtZDogQmVnaW5Db21wb25lbnRDbWQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdmFyIG5lc3RlZFByb3RvVmlldyA9IGNyZWF0ZUNvbXBvbmVudCh0aGlzLl9wcm90b1ZpZXdGYWN0b3J5LCBjbWQpO1xuICAgIHJldHVybiB0aGlzLl92aXNpdEJlZ2luQm91bmRFbGVtZW50KGNtZCwgbmVzdGVkUHJvdG9WaWV3KTtcbiAgfVxuICB2aXNpdEVuZENvbXBvbmVudChjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gdGhpcy5fdmlzaXRFbmRFbGVtZW50KCk7IH1cbiAgdmlzaXRFbWJlZGRlZFRlbXBsYXRlKGNtZDogRW1iZWRkZWRUZW1wbGF0ZUNtZCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB2YXIgbmVzdGVkUHJvdG9WaWV3ID0gY3JlYXRlRW1iZWRkZWRUZW1wbGF0ZSh0aGlzLl9wcm90b1ZpZXdGYWN0b3J5LCBjbWQsIHRoaXMuX3Byb3RvVmlldyk7XG4gICAgaWYgKGNtZC5pc01lcmdlZCkge1xuICAgICAgdGhpcy5tZXJnZUVtYmVkZGVkVmlld0NvdW50Kys7XG4gICAgfVxuICAgIHRoaXMuX3Zpc2l0QmVnaW5Cb3VuZEVsZW1lbnQoY21kLCBuZXN0ZWRQcm90b1ZpZXcpO1xuICAgIHJldHVybiB0aGlzLl92aXNpdEVuZEVsZW1lbnQoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0QmVnaW5Cb3VuZEVsZW1lbnQoY21kOiBJQmVnaW5FbGVtZW50Q21kLCBuZXN0ZWRQcm90b1ZpZXc6IEFwcFByb3RvVmlldyk6IGFueSB7XG4gICAgaWYgKGlzUHJlc2VudChuZXN0ZWRQcm90b1ZpZXcpICYmIG5lc3RlZFByb3RvVmlldy5pc01lcmdhYmxlKSB7XG4gICAgICB0aGlzLm1lcmdlRWxlbWVudENvdW50ICs9IG5lc3RlZFByb3RvVmlldy5tZXJnZUluZm8uZWxlbWVudENvdW50O1xuICAgICAgdGhpcy5tZXJnZVZpZXdDb3VudCArPSBuZXN0ZWRQcm90b1ZpZXcubWVyZ2VJbmZvLnZpZXdDb3VudDtcbiAgICAgIHRoaXMubWVyZ2VFbWJlZGRlZFZpZXdDb3VudCArPSBuZXN0ZWRQcm90b1ZpZXcubWVyZ2VJbmZvLmVtYmVkZGVkVmlld0NvdW50O1xuICAgIH1cbiAgICB2YXIgZWxlbWVudEJpbmRlciA9IF9jcmVhdGVFbGVtZW50QmluZGVyKFxuICAgICAgICB0aGlzLl9kaXJlY3RpdmVSZXNvbHZlciwgbmVzdGVkUHJvdG9WaWV3LCB0aGlzLmVsZW1lbnRCaW5kZXJTdGFjaywgdGhpcy5ib3VuZEVsZW1lbnRJbmRleCxcbiAgICAgICAgdGhpcy5kaXN0YW5jZVRvUGFyZW50RWxlbWVudEJpbmRlciwgdGhpcy5kaXN0YW5jZVRvUGFyZW50UHJvdG9FbGVtZW50SW5qZWN0b3IsIGNtZCk7XG4gICAgdGhpcy5lbGVtZW50QmluZGVycy5wdXNoKGVsZW1lbnRCaW5kZXIpO1xuICAgIHZhciBwcm90b0VsZW1lbnRJbmplY3RvciA9IGVsZW1lbnRCaW5kZXIucHJvdG9FbGVtZW50SW5qZWN0b3I7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbWQudmFyaWFibGVOYW1lQW5kVmFsdWVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICB0aGlzLnZhcmlhYmxlTG9jYXRpb25zLnNldCg8c3RyaW5nPmNtZC52YXJpYWJsZU5hbWVBbmRWYWx1ZXNbaV0sIHRoaXMuYm91bmRFbGVtZW50SW5kZXgpO1xuICAgIH1cbiAgICB0aGlzLmJvdW5kRWxlbWVudEluZGV4Kys7XG4gICAgdGhpcy5tZXJnZUVsZW1lbnRDb3VudCsrO1xuICAgIHJldHVybiB0aGlzLl92aXNpdEJlZ2luRWxlbWVudChjbWQsIGVsZW1lbnRCaW5kZXIsIHByb3RvRWxlbWVudEluamVjdG9yKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0QmVnaW5FbGVtZW50KGNtZDogSUJlZ2luRWxlbWVudENtZCwgZWxlbWVudEJpbmRlcjogRWxlbWVudEJpbmRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdG9FbGVtZW50SW5qZWN0b3I6IFByb3RvRWxlbWVudEluamVjdG9yKTogYW55IHtcbiAgICB0aGlzLmRpc3RhbmNlVG9QYXJlbnRFbGVtZW50QmluZGVyID1cbiAgICAgICAgaXNQcmVzZW50KGVsZW1lbnRCaW5kZXIpID8gMSA6IHRoaXMuZGlzdGFuY2VUb1BhcmVudEVsZW1lbnRCaW5kZXIgKyAxO1xuICAgIHRoaXMuZGlzdGFuY2VUb1BhcmVudFByb3RvRWxlbWVudEluamVjdG9yID1cbiAgICAgICAgaXNQcmVzZW50KHByb3RvRWxlbWVudEluamVjdG9yKSA/IDEgOiB0aGlzLmRpc3RhbmNlVG9QYXJlbnRQcm90b0VsZW1lbnRJbmplY3RvciArIDE7XG4gICAgdGhpcy5lbGVtZW50QmluZGVyU3RhY2sucHVzaChlbGVtZW50QmluZGVyKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0RW5kRWxlbWVudCgpOiBhbnkge1xuICAgIHZhciBwYXJlbnRFbGVtZW50QmluZGVyID0gdGhpcy5lbGVtZW50QmluZGVyU3RhY2sucG9wKCk7XG4gICAgdmFyIHBhcmVudFByb3RvRWxlbWVudEluamVjdG9yID1cbiAgICAgICAgaXNQcmVzZW50KHBhcmVudEVsZW1lbnRCaW5kZXIpID8gcGFyZW50RWxlbWVudEJpbmRlci5wcm90b0VsZW1lbnRJbmplY3RvciA6IG51bGw7XG4gICAgdGhpcy5kaXN0YW5jZVRvUGFyZW50RWxlbWVudEJpbmRlciA9IGlzUHJlc2VudChwYXJlbnRFbGVtZW50QmluZGVyKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50QmluZGVyLmRpc3RhbmNlVG9QYXJlbnQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXN0YW5jZVRvUGFyZW50RWxlbWVudEJpbmRlciAtIDE7XG4gICAgdGhpcy5kaXN0YW5jZVRvUGFyZW50UHJvdG9FbGVtZW50SW5qZWN0b3IgPSBpc1ByZXNlbnQocGFyZW50UHJvdG9FbGVtZW50SW5qZWN0b3IpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRQcm90b0VsZW1lbnRJbmplY3Rvci5kaXN0YW5jZVRvUGFyZW50IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3RhbmNlVG9QYXJlbnRQcm90b0VsZW1lbnRJbmplY3RvciAtIDE7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBfY3JlYXRlRWxlbWVudEJpbmRlcihkaXJlY3RpdmVSZXNvbHZlcjogRGlyZWN0aXZlUmVzb2x2ZXIsIG5lc3RlZFByb3RvVmlldzogQXBwUHJvdG9WaWV3LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudEJpbmRlclN0YWNrOiBFbGVtZW50QmluZGVyW10sIGJvdW5kRWxlbWVudEluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZVRvUGFyZW50QmluZGVyOiBudW1iZXIsIGRpc3RhbmNlVG9QYXJlbnRQZWk6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luRWxlbWVudENtZDogSUJlZ2luRWxlbWVudENtZCk6IEVsZW1lbnRCaW5kZXIge1xuICB2YXIgcGFyZW50RWxlbWVudEJpbmRlcjogRWxlbWVudEJpbmRlciA9IG51bGw7XG4gIHZhciBwYXJlbnRQcm90b0VsZW1lbnRJbmplY3RvcjogUHJvdG9FbGVtZW50SW5qZWN0b3IgPSBudWxsO1xuICBpZiAoZGlzdGFuY2VUb1BhcmVudEJpbmRlciA+IDApIHtcbiAgICBwYXJlbnRFbGVtZW50QmluZGVyID0gZWxlbWVudEJpbmRlclN0YWNrW2VsZW1lbnRCaW5kZXJTdGFjay5sZW5ndGggLSBkaXN0YW5jZVRvUGFyZW50QmluZGVyXTtcbiAgfVxuICBpZiAoaXNCbGFuayhwYXJlbnRFbGVtZW50QmluZGVyKSkge1xuICAgIGRpc3RhbmNlVG9QYXJlbnRCaW5kZXIgPSAtMTtcbiAgfVxuICBpZiAoZGlzdGFuY2VUb1BhcmVudFBlaSA+IDApIHtcbiAgICB2YXIgcGVpQmluZGVyID0gZWxlbWVudEJpbmRlclN0YWNrW2VsZW1lbnRCaW5kZXJTdGFjay5sZW5ndGggLSBkaXN0YW5jZVRvUGFyZW50UGVpXTtcbiAgICBpZiAoaXNQcmVzZW50KHBlaUJpbmRlcikpIHtcbiAgICAgIHBhcmVudFByb3RvRWxlbWVudEluamVjdG9yID0gcGVpQmluZGVyLnByb3RvRWxlbWVudEluamVjdG9yO1xuICAgIH1cbiAgfVxuICBpZiAoaXNCbGFuayhwYXJlbnRQcm90b0VsZW1lbnRJbmplY3RvcikpIHtcbiAgICBkaXN0YW5jZVRvUGFyZW50UGVpID0gLTE7XG4gIH1cbiAgdmFyIGNvbXBvbmVudERpcmVjdGl2ZVByb3ZpZGVyOiBEaXJlY3RpdmVQcm92aWRlciA9IG51bGw7XG4gIHZhciBpc0VtYmVkZGVkVGVtcGxhdGUgPSBmYWxzZTtcbiAgdmFyIGRpcmVjdGl2ZVByb3ZpZGVyczogRGlyZWN0aXZlUHJvdmlkZXJbXSA9XG4gICAgICBiZWdpbkVsZW1lbnRDbWQuZGlyZWN0aXZlcy5tYXAodHlwZSA9PiBwcm92aWRlRGlyZWN0aXZlKGRpcmVjdGl2ZVJlc29sdmVyLCB0eXBlKSk7XG4gIGlmIChiZWdpbkVsZW1lbnRDbWQgaW5zdGFuY2VvZiBCZWdpbkNvbXBvbmVudENtZCkge1xuICAgIGNvbXBvbmVudERpcmVjdGl2ZVByb3ZpZGVyID0gZGlyZWN0aXZlUHJvdmlkZXJzWzBdO1xuICB9IGVsc2UgaWYgKGJlZ2luRWxlbWVudENtZCBpbnN0YW5jZW9mIEVtYmVkZGVkVGVtcGxhdGVDbWQpIHtcbiAgICBpc0VtYmVkZGVkVGVtcGxhdGUgPSB0cnVlO1xuICB9XG5cbiAgdmFyIHByb3RvRWxlbWVudEluamVjdG9yID0gbnVsbDtcbiAgLy8gQ3JlYXRlIGEgcHJvdG9FbGVtZW50SW5qZWN0b3IgZm9yIGFueSBlbGVtZW50IHRoYXQgZWl0aGVyIGhhcyBiaW5kaW5ncyAqb3IqIGhhcyBvbmVcbiAgLy8gb3IgbW9yZSB2YXItIGRlZmluZWQgKm9yKiBmb3IgPHRlbXBsYXRlPiBlbGVtZW50czpcbiAgLy8gLSBFbGVtZW50cyB3aXRoIGEgdmFyLSBkZWZpbmVkIG5lZWQgYSB0aGVpciBvd24gZWxlbWVudCBpbmplY3RvclxuICAvLyAgIHNvIHRoYXQsIHdoZW4gaHlkcmF0aW5nLCAkaW1wbGljaXQgY2FuIGJlIHNldCB0byB0aGUgZWxlbWVudC5cbiAgLy8gLSA8dGVtcGxhdGU+IGVsZW1lbnRzIG5lZWQgdGhlaXIgb3duIEVsZW1lbnRJbmplY3RvciBzbyB0aGF0IHdlIGNhbiBxdWVyeSB0aGVpciBUZW1wbGF0ZVJlZlxuICB2YXIgaGFzVmFyaWFibGVzID0gYmVnaW5FbGVtZW50Q21kLnZhcmlhYmxlTmFtZUFuZFZhbHVlcy5sZW5ndGggPiAwO1xuICBpZiAoZGlyZWN0aXZlUHJvdmlkZXJzLmxlbmd0aCA+IDAgfHwgaGFzVmFyaWFibGVzIHx8IGlzRW1iZWRkZWRUZW1wbGF0ZSkge1xuICAgIHZhciBkaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgICBpZiAoIWlzRW1iZWRkZWRUZW1wbGF0ZSkge1xuICAgICAgZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncyA9IGNyZWF0ZURpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3MoXG4gICAgICAgICAgYmVnaW5FbGVtZW50Q21kLnZhcmlhYmxlTmFtZUFuZFZhbHVlcywgZGlyZWN0aXZlUHJvdmlkZXJzKTtcbiAgICB9XG4gICAgcHJvdG9FbGVtZW50SW5qZWN0b3IgPSBQcm90b0VsZW1lbnRJbmplY3Rvci5jcmVhdGUoXG4gICAgICAgIHBhcmVudFByb3RvRWxlbWVudEluamVjdG9yLCBib3VuZEVsZW1lbnRJbmRleCwgZGlyZWN0aXZlUHJvdmlkZXJzLFxuICAgICAgICBpc1ByZXNlbnQoY29tcG9uZW50RGlyZWN0aXZlUHJvdmlkZXIpLCBkaXN0YW5jZVRvUGFyZW50UGVpLCBkaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzKTtcbiAgICBwcm90b0VsZW1lbnRJbmplY3Rvci5hdHRyaWJ1dGVzID0gYXJyYXlUb01hcChiZWdpbkVsZW1lbnRDbWQuYXR0ck5hbWVBbmRWYWx1ZXMsIGZhbHNlKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgRWxlbWVudEJpbmRlcihib3VuZEVsZW1lbnRJbmRleCwgcGFyZW50RWxlbWVudEJpbmRlciwgZGlzdGFuY2VUb1BhcmVudEJpbmRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3RvRWxlbWVudEluamVjdG9yLCBjb21wb25lbnREaXJlY3RpdmVQcm92aWRlciwgbmVzdGVkUHJvdG9WaWV3KTtcbn1cblxuZnVuY3Rpb24gcHJvdmlkZURpcmVjdGl2ZShkaXJlY3RpdmVSZXNvbHZlcjogRGlyZWN0aXZlUmVzb2x2ZXIsIHR5cGU6IFR5cGUpOiBEaXJlY3RpdmVQcm92aWRlciB7XG4gIGxldCBhbm5vdGF0aW9uID0gZGlyZWN0aXZlUmVzb2x2ZXIucmVzb2x2ZSh0eXBlKTtcbiAgcmV0dXJuIERpcmVjdGl2ZVByb3ZpZGVyLmNyZWF0ZUZyb21UeXBlKHR5cGUsIGFubm90YXRpb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncyhcbiAgICB2YXJpYWJsZU5hbWVBbmRWYWx1ZXM6IEFycmF5PHN0cmluZyB8IG51bWJlcj4sXG4gICAgZGlyZWN0aXZlUHJvdmlkZXJzOiBEaXJlY3RpdmVQcm92aWRlcltdKTogTWFwPHN0cmluZywgbnVtYmVyPiB7XG4gIHZhciBkaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YXJpYWJsZU5hbWVBbmRWYWx1ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICB2YXIgdGVtcGxhdGVOYW1lID0gPHN0cmluZz52YXJpYWJsZU5hbWVBbmRWYWx1ZXNbaV07XG4gICAgdmFyIGRpckluZGV4ID0gPG51bWJlcj52YXJpYWJsZU5hbWVBbmRWYWx1ZXNbaSArIDFdO1xuICAgIGlmIChpc051bWJlcihkaXJJbmRleCkpIHtcbiAgICAgIGRpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3Muc2V0KHRlbXBsYXRlTmFtZSwgZGlySW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhIHZhcmlhYmxlIHdpdGhvdXQgYSBkaXJlY3RpdmUgaW5kZXggLT4gcmVmZXJlbmNlIHRoZSBlbGVtZW50XG4gICAgICBkaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzLnNldCh0ZW1wbGF0ZU5hbWUsIG51bGwpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncztcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvTWFwKGFycjogc3RyaW5nW10sIGludmVyc2U6IGJvb2xlYW4pOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgdmFyIHJlc3VsdCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgaWYgKGludmVyc2UpIHtcbiAgICAgIHJlc3VsdC5zZXQoYXJyW2kgKyAxXSwgYXJyW2ldKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnNldChhcnJbaV0sIGFycltpICsgMV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBfZmxhdHRlbkFycmF5KHRyZWU6IGFueVtdLCBvdXQ6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IHZvaWQge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRyZWUubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IHJlc29sdmVGb3J3YXJkUmVmKHRyZWVbaV0pO1xuICAgIGlmIChpc0FycmF5KGl0ZW0pKSB7XG4gICAgICBfZmxhdHRlbkFycmF5KGl0ZW0sIG91dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBfZmxhdHRlblN0eWxlQXJyKGFycjogQXJyYXk8c3RyaW5nIHwgYW55W10+LCBvdXQ6IHN0cmluZ1tdKTogc3RyaW5nW10ge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBlbnRyeSA9IGFycltpXTtcbiAgICBpZiAoaXNBcnJheShlbnRyeSkpIHtcbiAgICAgIF9mbGF0dGVuU3R5bGVBcnIoPGFueVtdPmVudHJ5LCBvdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQucHVzaCg8c3RyaW5nPmVudHJ5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cbiJdfQ==