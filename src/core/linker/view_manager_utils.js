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
var di_1 = require('angular2/src/core/di');
var collection_1 = require('angular2/src/facade/collection');
var eli = require('./element_injector');
var lang_1 = require('angular2/src/facade/lang');
var viewModule = require('./view');
var element_ref_1 = require('./element_ref');
var template_ref_1 = require('./template_ref');
var pipes_1 = require('angular2/src/core/pipes/pipes');
var AppViewManagerUtils = (function () {
    function AppViewManagerUtils() {
    }
    AppViewManagerUtils.prototype.getComponentInstance = function (parentView, boundElementIndex) {
        var eli = parentView.elementInjectors[boundElementIndex];
        return eli.getComponent();
    };
    AppViewManagerUtils.prototype.createView = function (mergedParentViewProto, renderViewWithFragments, viewManager, renderer) {
        var renderFragments = renderViewWithFragments.fragmentRefs;
        var renderView = renderViewWithFragments.viewRef;
        var elementCount = mergedParentViewProto.mergeInfo.elementCount;
        var viewCount = mergedParentViewProto.mergeInfo.viewCount;
        var elementRefs = collection_1.ListWrapper.createFixedSize(elementCount);
        var viewContainers = collection_1.ListWrapper.createFixedSize(elementCount);
        var preBuiltObjects = collection_1.ListWrapper.createFixedSize(elementCount);
        var elementInjectors = collection_1.ListWrapper.createFixedSize(elementCount);
        var views = collection_1.ListWrapper.createFixedSize(viewCount);
        var elementOffset = 0;
        var textOffset = 0;
        var fragmentIdx = 0;
        var containerElementIndicesByViewIndex = collection_1.ListWrapper.createFixedSize(viewCount);
        for (var viewOffset = 0; viewOffset < viewCount; viewOffset++) {
            var containerElementIndex = containerElementIndicesByViewIndex[viewOffset];
            var containerElementInjector = lang_1.isPresent(containerElementIndex) ? elementInjectors[containerElementIndex] : null;
            var parentView = lang_1.isPresent(containerElementInjector) ? preBuiltObjects[containerElementIndex].view : null;
            var protoView = lang_1.isPresent(containerElementIndex) ?
                parentView.proto.elementBinders[containerElementIndex - parentView.elementOffset]
                    .nestedProtoView :
                mergedParentViewProto;
            var renderFragment = null;
            if (viewOffset === 0 || protoView.type === viewModule.ViewType.EMBEDDED) {
                renderFragment = renderFragments[fragmentIdx++];
            }
            var currentView = new viewModule.AppView(renderer, protoView, viewOffset, elementOffset, textOffset, protoView.protoLocals, renderView, renderFragment, containerElementInjector);
            views[viewOffset] = currentView;
            if (lang_1.isPresent(containerElementIndex)) {
                preBuiltObjects[containerElementIndex].nestedView = currentView;
            }
            var rootElementInjectors = [];
            var nestedViewOffset = viewOffset + 1;
            for (var binderIdx = 0; binderIdx < protoView.elementBinders.length; binderIdx++) {
                var binder = protoView.elementBinders[binderIdx];
                var boundElementIndex = elementOffset + binderIdx;
                var elementInjector = null;
                if (lang_1.isPresent(binder.nestedProtoView) && binder.nestedProtoView.isMergable) {
                    containerElementIndicesByViewIndex[nestedViewOffset] = boundElementIndex;
                    nestedViewOffset += binder.nestedProtoView.mergeInfo.viewCount;
                }
                // elementInjectors and rootElementInjectors
                var protoElementInjector = binder.protoElementInjector;
                if (lang_1.isPresent(protoElementInjector)) {
                    if (lang_1.isPresent(protoElementInjector.parent)) {
                        var parentElementInjector = elementInjectors[elementOffset + protoElementInjector.parent.index];
                        elementInjector = protoElementInjector.instantiate(parentElementInjector);
                    }
                    else {
                        elementInjector = protoElementInjector.instantiate(null);
                        rootElementInjectors.push(elementInjector);
                    }
                }
                elementInjectors[boundElementIndex] = elementInjector;
                // elementRefs
                var el = new element_ref_1.ElementRef_(currentView.ref, boundElementIndex, renderer);
                elementRefs[el.boundElementIndex] = el;
                // preBuiltObjects
                if (lang_1.isPresent(elementInjector)) {
                    var templateRef = lang_1.isPresent(binder.nestedProtoView) &&
                        binder.nestedProtoView.type === viewModule.ViewType.EMBEDDED ?
                        new template_ref_1.TemplateRef_(el) :
                        null;
                    preBuiltObjects[boundElementIndex] =
                        new eli.PreBuiltObjects(viewManager, currentView, el, templateRef);
                }
            }
            currentView.init(protoView.changeDetectorFactory(currentView), elementInjectors, rootElementInjectors, preBuiltObjects, views, elementRefs, viewContainers);
            if (lang_1.isPresent(parentView) && protoView.type === viewModule.ViewType.COMPONENT) {
                parentView.changeDetector.addViewChild(currentView.changeDetector);
            }
            elementOffset += protoView.elementBinders.length;
            textOffset += protoView.textBindingCount;
        }
        return views[0];
    };
    AppViewManagerUtils.prototype.hydrateRootHostView = function (hostView, injector) {
        this._hydrateView(hostView, injector, null, new Object(), null);
    };
    // Misnomer: this method is attaching next to the view container.
    AppViewManagerUtils.prototype.attachViewInContainer = function (parentView, boundElementIndex, contextView, contextBoundElementIndex, index, view) {
        if (lang_1.isBlank(contextView)) {
            contextView = parentView;
            contextBoundElementIndex = boundElementIndex;
        }
        parentView.changeDetector.addContentChild(view.changeDetector);
        var viewContainer = parentView.viewContainers[boundElementIndex];
        if (lang_1.isBlank(viewContainer)) {
            viewContainer = new viewModule.AppViewContainer();
            parentView.viewContainers[boundElementIndex] = viewContainer;
        }
        collection_1.ListWrapper.insert(viewContainer.views, index, view);
        var elementInjector = contextView.elementInjectors[contextBoundElementIndex];
        for (var i = view.rootElementInjectors.length - 1; i >= 0; i--) {
            if (lang_1.isPresent(elementInjector.parent)) {
                view.rootElementInjectors[i].link(elementInjector.parent);
            }
        }
        elementInjector.traverseAndSetQueriesAsDirty();
    };
    AppViewManagerUtils.prototype.detachViewInContainer = function (parentView, boundElementIndex, index) {
        var viewContainer = parentView.viewContainers[boundElementIndex];
        var view = viewContainer.views[index];
        parentView.elementInjectors[boundElementIndex].traverseAndSetQueriesAsDirty();
        view.changeDetector.remove();
        collection_1.ListWrapper.removeAt(viewContainer.views, index);
        for (var i = 0; i < view.rootElementInjectors.length; ++i) {
            var inj = view.rootElementInjectors[i];
            inj.unlink();
        }
    };
    AppViewManagerUtils.prototype.hydrateViewInContainer = function (parentView, boundElementIndex, contextView, contextBoundElementIndex, index, imperativelyCreatedProviders) {
        if (lang_1.isBlank(contextView)) {
            contextView = parentView;
            contextBoundElementIndex = boundElementIndex;
        }
        var viewContainer = parentView.viewContainers[boundElementIndex];
        var view = viewContainer.views[index];
        var elementInjector = contextView.elementInjectors[contextBoundElementIndex];
        var injector = lang_1.isPresent(imperativelyCreatedProviders) ?
            di_1.Injector.fromResolvedProviders(imperativelyCreatedProviders) :
            null;
        this._hydrateView(view, injector, elementInjector.getHost(), contextView.context, contextView.locals);
    };
    /** @internal */
    AppViewManagerUtils.prototype._hydrateView = function (initView, imperativelyCreatedInjector, hostElementInjector, context, parentLocals) {
        var viewIdx = initView.viewOffset;
        var endViewOffset = viewIdx + initView.proto.mergeInfo.viewCount - 1;
        while (viewIdx <= endViewOffset) {
            var currView = initView.views[viewIdx];
            var currProtoView = currView.proto;
            if (currView !== initView && currView.proto.type === viewModule.ViewType.EMBEDDED) {
                // Don't hydrate components of embedded fragment views.
                viewIdx += currView.proto.mergeInfo.viewCount;
            }
            else {
                if (currView !== initView) {
                    // hydrate a nested component view
                    imperativelyCreatedInjector = null;
                    parentLocals = null;
                    hostElementInjector = currView.containerElementInjector;
                    context = hostElementInjector.getComponent();
                }
                currView.context = context;
                currView.locals.parent = parentLocals;
                var binders = currProtoView.elementBinders;
                for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
                    var boundElementIndex = binderIdx + currView.elementOffset;
                    var elementInjector = initView.elementInjectors[boundElementIndex];
                    if (lang_1.isPresent(elementInjector)) {
                        elementInjector.hydrate(imperativelyCreatedInjector, hostElementInjector, currView.preBuiltObjects[boundElementIndex]);
                        this._populateViewLocals(currView, elementInjector, boundElementIndex);
                        this._setUpEventEmitters(currView, elementInjector, boundElementIndex);
                    }
                }
                var pipes = lang_1.isPresent(hostElementInjector) ?
                    new pipes_1.Pipes(currView.proto.pipes, hostElementInjector.getInjector()) :
                    null;
                currView.changeDetector.hydrate(currView.context, currView.locals, currView, pipes);
                viewIdx++;
            }
        }
    };
    /** @internal */
    AppViewManagerUtils.prototype._populateViewLocals = function (view, elementInjector, boundElementIdx) {
        if (lang_1.isPresent(elementInjector.getDirectiveVariableBindings())) {
            elementInjector.getDirectiveVariableBindings().forEach(function (directiveIndex, name) {
                if (lang_1.isBlank(directiveIndex)) {
                    view.locals.set(name, view.elementRefs[boundElementIdx].nativeElement);
                }
                else {
                    view.locals.set(name, elementInjector.getDirectiveAtIndex(directiveIndex));
                }
            });
        }
    };
    /** @internal */
    AppViewManagerUtils.prototype._setUpEventEmitters = function (view, elementInjector, boundElementIndex) {
        var emitters = elementInjector.getEventEmitterAccessors();
        for (var directiveIndex = 0; directiveIndex < emitters.length; ++directiveIndex) {
            var directiveEmitters = emitters[directiveIndex];
            var directive = elementInjector.getDirectiveAtIndex(directiveIndex);
            for (var eventIndex = 0; eventIndex < directiveEmitters.length; ++eventIndex) {
                var eventEmitterAccessor = directiveEmitters[eventIndex];
                eventEmitterAccessor.subscribe(view, boundElementIndex, directive);
            }
        }
    };
    AppViewManagerUtils.prototype.dehydrateView = function (initView) {
        var endViewOffset = initView.viewOffset + initView.proto.mergeInfo.viewCount - 1;
        for (var viewIdx = initView.viewOffset; viewIdx <= endViewOffset; viewIdx++) {
            var currView = initView.views[viewIdx];
            if (currView.hydrated()) {
                if (lang_1.isPresent(currView.locals)) {
                    currView.locals.clearValues();
                }
                currView.context = null;
                currView.changeDetector.dehydrate();
                var binders = currView.proto.elementBinders;
                for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
                    var eli = initView.elementInjectors[currView.elementOffset + binderIdx];
                    if (lang_1.isPresent(eli)) {
                        eli.dehydrate();
                    }
                }
            }
        }
    };
    AppViewManagerUtils = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], AppViewManagerUtils);
    return AppViewManagerUtils;
})();
exports.AppViewManagerUtils = AppViewManagerUtils;
//# sourceMappingURL=view_manager_utils.js.map