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
var testing_internal_1 = require('angular2/testing_internal');
var spies_1 = require('../spies');
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var view_1 = require('angular2/src/core/linker/view');
var element_binder_1 = require('angular2/src/core/linker/element_binder');
var element_injector_1 = require('angular2/src/core/linker/element_injector');
var directive_resolver_1 = require('angular2/src/core/linker/directive_resolver');
var metadata_1 = require('angular2/src/core/metadata');
var view_manager_utils_1 = require('angular2/src/core/linker/view_manager_utils');
var render_1 = require('angular2/render');
function main() {
    // TODO(tbosch): add more tests here!
    testing_internal_1.describe('AppViewManagerUtils', function () {
        var utils;
        testing_internal_1.beforeEach(function () { utils = new view_manager_utils_1.AppViewManagerUtils(); });
        function createViewWithChildren(pv) {
            var renderViewWithFragments = new render_1.RenderViewWithFragments(null, [null, null]);
            return utils.createView(pv, renderViewWithFragments, null, null);
        }
        testing_internal_1.describe('shared hydrate functionality', function () {
            testing_internal_1.it("should hydrate the change detector after hydrating element injectors", function () {
                var log = new testing_internal_1.Log();
                var componentProtoView = createComponentPv([createEmptyElBinder()]);
                var hostView = createViewWithChildren(createHostPv([createNestedElBinder(componentProtoView)]));
                var componentView = hostView.views[1];
                var spyEi = componentView.elementInjectors[0];
                spyEi.spy('hydrate').andCallFake(log.fn('hydrate'));
                var spyCd = componentView.changeDetector;
                spyCd.spy('hydrate').andCallFake(log.fn('hydrateCD'));
                utils.hydrateRootHostView(hostView, createInjector());
                testing_internal_1.expect(log.result()).toEqual('hydrate; hydrateCD');
            });
            testing_internal_1.it("should set up event listeners", function () {
                var dir = new Object();
                var hostPv = createHostPv([createNestedElBinder(createComponentPv()), createEmptyElBinder()]);
                var hostView = createViewWithChildren(hostPv);
                var spyEventAccessor1 = testing_internal_1.SpyObject.stub({ "subscribe": null });
                testing_internal_1.SpyObject.stub(hostView.elementInjectors[0], { 'getEventEmitterAccessors': [[spyEventAccessor1]], 'getDirectiveAtIndex': dir });
                var spyEventAccessor2 = testing_internal_1.SpyObject.stub({ "subscribe": null });
                testing_internal_1.SpyObject.stub(hostView.elementInjectors[1], { 'getEventEmitterAccessors': [[spyEventAccessor2]], 'getDirectiveAtIndex': dir });
                utils.hydrateRootHostView(hostView, createInjector());
                testing_internal_1.expect(spyEventAccessor1.spy('subscribe')).toHaveBeenCalledWith(hostView, 0, dir);
                testing_internal_1.expect(spyEventAccessor2.spy('subscribe')).toHaveBeenCalledWith(hostView, 1, dir);
            });
            testing_internal_1.it("should not hydrate element injectors of component views inside of embedded fragments", function () {
                var hostView = createViewWithChildren(createHostPv([
                    createNestedElBinder(createComponentPv([
                        createNestedElBinder(createEmbeddedPv([createNestedElBinder(createComponentPv([createEmptyElBinder()]))]))
                    ]))
                ]));
                utils.hydrateRootHostView(hostView, createInjector());
                testing_internal_1.expect(hostView.elementInjectors.length).toBe(4);
                testing_internal_1.expect(hostView.elementInjectors[3].spy('hydrate')).not.toHaveBeenCalled();
            });
        });
        testing_internal_1.describe('attachViewInContainer', function () {
            var parentView, contextView, childView;
            function createViews(numInj) {
                if (numInj === void 0) { numInj = 1; }
                var childPv = createEmbeddedPv([createEmptyElBinder()]);
                childView = createViewWithChildren(childPv);
                var parentPv = createHostPv([createEmptyElBinder()]);
                parentView = createViewWithChildren(parentPv);
                var binders = [];
                for (var i = 0; i < numInj; i++) {
                    binders.push(createEmptyElBinder(i > 0 ? binders[i - 1] : null));
                }
                var contextPv = createHostPv(binders);
                contextView = createViewWithChildren(contextPv);
            }
            testing_internal_1.it('should not modify the rootElementInjectors at the given context view', function () {
                createViews();
                utils.attachViewInContainer(parentView, 0, contextView, 0, 0, childView);
                testing_internal_1.expect(contextView.rootElementInjectors.length).toEqual(1);
            });
            testing_internal_1.it('should link the views rootElementInjectors after the elementInjector at the given context', function () {
                createViews(2);
                utils.attachViewInContainer(parentView, 0, contextView, 1, 0, childView);
                testing_internal_1.expect(childView.rootElementInjectors[0].spy('link'))
                    .toHaveBeenCalledWith(contextView.elementInjectors[0]);
            });
        });
        testing_internal_1.describe('hydrateViewInContainer', function () {
            var parentView, contextView, childView;
            function createViews() {
                var parentPv = createHostPv([createEmptyElBinder()]);
                parentView = createViewWithChildren(parentPv);
                var contextPv = createHostPv([createEmptyElBinder()]);
                contextView = createViewWithChildren(contextPv);
                var childPv = createEmbeddedPv([createEmptyElBinder()]);
                childView = createViewWithChildren(childPv);
                utils.attachViewInContainer(parentView, 0, contextView, 0, 0, childView);
            }
            testing_internal_1.it("should instantiate the elementInjectors with the host of the context's elementInjector", function () {
                createViews();
                utils.hydrateViewInContainer(parentView, 0, contextView, 0, 0, null);
                testing_internal_1.expect(childView.rootElementInjectors[0].spy('hydrate'))
                    .toHaveBeenCalledWith(null, contextView.elementInjectors[0].getHost(), childView.preBuiltObjects[0]);
            });
        });
        testing_internal_1.describe('hydrateRootHostView', function () {
            var hostView;
            function createViews() {
                var hostPv = createHostPv([createNestedElBinder(createComponentPv())]);
                hostView = createViewWithChildren(hostPv);
            }
            testing_internal_1.it("should instantiate the elementInjectors with the given injector and an empty host element injector", function () {
                var injector = createInjector();
                createViews();
                utils.hydrateRootHostView(hostView, injector);
                testing_internal_1.expect(hostView.rootElementInjectors[0].spy('hydrate'))
                    .toHaveBeenCalledWith(injector, null, hostView.preBuiltObjects[0]);
            });
        });
    });
}
exports.main = main;
function createInjector() {
    return core_1.Injector.resolveAndCreate([]);
}
exports.createInjector = createInjector;
function createElementInjector(parent) {
    if (parent === void 0) { parent = null; }
    var host = new spies_1.SpyElementInjector();
    var elementInjector = new spies_1.SpyElementInjector();
    var _preBuiltObjects = null;
    var res = testing_internal_1.SpyObject.stub(elementInjector, {
        'isExportingComponent': false,
        'isExportingElement': false,
        'getEventEmitterAccessors': [],
        'getHostActionAccessors': [],
        'getComponent': new Object(),
        'getHost': host
    });
    res.spy('getNestedView').andCallFake(function () { return _preBuiltObjects.nestedView; });
    res.spy('hydrate')
        .andCallFake(function (mperativelyCreatedInjector, host, preBuiltObjects) { _preBuiltObjects = preBuiltObjects; });
    res.prop('parent', parent);
    return res;
}
function createProtoElInjector(parent) {
    if (parent === void 0) { parent = null; }
    var pei = new spies_1.SpyProtoElementInjector();
    pei.prop("parent", parent);
    pei.prop("index", 0);
    pei.spy('instantiate').andCallFake(function (parentEli) { return createElementInjector(parentEli); });
    return pei;
}
exports.createProtoElInjector = createProtoElInjector;
function createEmptyElBinder(parent) {
    if (parent === void 0) { parent = null; }
    var parentPeli = lang_1.isPresent(parent) ? parent.protoElementInjector : null;
    return new element_binder_1.ElementBinder(0, null, 0, createProtoElInjector(parentPeli), null, null);
}
exports.createEmptyElBinder = createEmptyElBinder;
function createNestedElBinder(nestedProtoView) {
    var componentProvider = null;
    if (nestedProtoView.type === view_1.ViewType.COMPONENT) {
        var annotation = new directive_resolver_1.DirectiveResolver().resolve(SomeComponent);
        componentProvider = element_injector_1.DirectiveProvider.createFromType(SomeComponent, annotation);
    }
    return new element_binder_1.ElementBinder(0, null, 0, createProtoElInjector(), componentProvider, nestedProtoView);
}
exports.createNestedElBinder = createNestedElBinder;
function _createProtoView(type, binders) {
    if (binders === void 0) { binders = null; }
    if (lang_1.isBlank(binders)) {
        binders = [];
    }
    var res = new view_1.AppProtoView(null, [], type, true, function (_) { return new spies_1.SpyChangeDetector(); }, new Map(), null);
    var mergedElementCount = 0;
    var mergedEmbeddedViewCount = 0;
    var mergedViewCount = 1;
    for (var i = 0; i < binders.length; i++) {
        var binder = binders[i];
        binder.protoElementInjector.index = i;
        mergedElementCount++;
        var nestedPv = binder.nestedProtoView;
        if (lang_1.isPresent(nestedPv)) {
            mergedElementCount += nestedPv.mergeInfo.elementCount;
            mergedEmbeddedViewCount += nestedPv.mergeInfo.embeddedViewCount;
            mergedViewCount += nestedPv.mergeInfo.viewCount;
            if (nestedPv.type === view_1.ViewType.EMBEDDED) {
                mergedEmbeddedViewCount++;
            }
        }
    }
    var mergeInfo = new view_1.AppProtoViewMergeInfo(mergedEmbeddedViewCount, mergedElementCount, mergedViewCount);
    res.init(null, binders, 0, mergeInfo, new Map());
    return res;
}
function createHostPv(binders) {
    if (binders === void 0) { binders = null; }
    return _createProtoView(view_1.ViewType.HOST, binders);
}
exports.createHostPv = createHostPv;
function createComponentPv(binders) {
    if (binders === void 0) { binders = null; }
    return _createProtoView(view_1.ViewType.COMPONENT, binders);
}
exports.createComponentPv = createComponentPv;
function createEmbeddedPv(binders) {
    if (binders === void 0) { binders = null; }
    return _createProtoView(view_1.ViewType.EMBEDDED, binders);
}
exports.createEmbeddedPv = createEmbeddedPv;
var SomeComponent = (function () {
    function SomeComponent() {
    }
    SomeComponent = __decorate([
        metadata_1.Component({ selector: 'someComponent' }), 
        __metadata('design:paramtypes', [])
    ], SomeComponent);
    return SomeComponent;
})();
//# sourceMappingURL=view_manager_utils_spec.js.map