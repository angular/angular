var di_1 = require('angular2/src/core/di');
var animation_builder_1 = require('angular2/src/animate/animation_builder');
var animation_builder_mock_1 = require('angular2/src/mock/animation_builder_mock');
var proto_view_factory_1 = require('angular2/src/core/linker/proto_view_factory');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var exceptions_1 = require('angular2/src/facade/exceptions');
var view_resolver_1 = require('angular2/src/core/linker/view_resolver');
var directive_resolver_1 = require('angular2/src/core/linker/directive_resolver');
var pipe_resolver_1 = require('angular2/src/core/linker/pipe_resolver');
var dynamic_component_loader_1 = require('angular2/src/core/linker/dynamic_component_loader');
var xhr_1 = require('angular2/src/compiler/xhr');
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var core_1 = require('angular2/core');
var directive_resolver_mock_1 = require('angular2/src/mock/directive_resolver_mock');
var view_resolver_mock_1 = require('angular2/src/mock/view_resolver_mock');
var mock_location_strategy_1 = require('angular2/src/mock/mock_location_strategy');
var location_strategy_1 = require('angular2/src/router/location_strategy');
var ng_zone_mock_1 = require('angular2/src/mock/ng_zone_mock');
var test_component_builder_1 = require('./test_component_builder');
var di_2 = require('angular2/src/core/di');
var debug_element_view_listener_1 = require('angular2/src/platform/browser/debug/debug_element_view_listener');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var view_pool_1 = require('angular2/src/core/linker/view_pool');
var view_manager_1 = require('angular2/src/core/linker/view_manager');
var view_manager_utils_1 = require('angular2/src/core/linker/view_manager_utils');
var api_1 = require('angular2/src/core/render/api');
var dom_tokens_1 = require('angular2/src/platform/dom/dom_tokens');
var dom_renderer_1 = require('angular2/src/platform/dom/dom_renderer');
var shared_styles_host_1 = require('angular2/src/platform/dom/shared_styles_host');
var shared_styles_host_2 = require('angular2/src/platform/dom/shared_styles_host');
var dom_events_1 = require('angular2/src/platform/dom/events/dom_events');
var application_tokens_1 = require('angular2/src/core/application_tokens');
var serializer_1 = require("angular2/src/web_workers/shared/serializer");
var utils_1 = require('./utils');
var compiler_1 = require('angular2/src/compiler/compiler');
var dom_renderer_2 = require("angular2/src/platform/dom/dom_renderer");
var dynamic_component_loader_2 = require("angular2/src/core/linker/dynamic_component_loader");
var view_manager_2 = require("angular2/src/core/linker/view_manager");
/**
 * Returns the root injector providers.
 *
 * This must be kept in sync with the _rootBindings in application.js
 *
 * @returns {any[]}
 */
function _getRootProviders() {
    return [di_1.provide(reflection_1.Reflector, { useValue: reflection_1.reflector })];
}
/**
 * Returns the application injector providers.
 *
 * This must be kept in sync with _injectorBindings() in application.js
 *
 * @returns {any[]}
 */
function _getAppBindings() {
    var appDoc;
    // The document is only available in browser environment
    try {
        appDoc = dom_adapter_1.DOM.defaultDoc();
    }
    catch (e) {
        appDoc = null;
    }
    return [
        compiler_1.COMPILER_PROVIDERS,
        di_1.provide(change_detection_1.ChangeDetectorGenConfig, { useValue: new change_detection_1.ChangeDetectorGenConfig(true, false, true) }),
        di_1.provide(dom_tokens_1.DOCUMENT, { useValue: appDoc }),
        di_1.provide(dom_renderer_1.DomRenderer, { useClass: dom_renderer_2.DomRenderer_ }),
        di_1.provide(api_1.Renderer, { useExisting: dom_renderer_1.DomRenderer }),
        di_1.provide(application_tokens_1.APP_ID, { useValue: 'a' }),
        shared_styles_host_1.DomSharedStylesHost,
        di_1.provide(shared_styles_host_2.SharedStylesHost, { useExisting: shared_styles_host_1.DomSharedStylesHost }),
        view_pool_1.AppViewPool,
        di_1.provide(view_manager_1.AppViewManager, { useClass: view_manager_2.AppViewManager_ }),
        view_manager_utils_1.AppViewManagerUtils,
        serializer_1.Serializer,
        debug_element_view_listener_1.ELEMENT_PROBE_PROVIDERS,
        di_1.provide(view_pool_1.APP_VIEW_POOL_CAPACITY, { useValue: 500 }),
        proto_view_factory_1.ProtoViewFactory,
        di_1.provide(directive_resolver_1.DirectiveResolver, { useClass: directive_resolver_mock_1.MockDirectiveResolver }),
        di_1.provide(view_resolver_1.ViewResolver, { useClass: view_resolver_mock_1.MockViewResolver }),
        di_1.provide(change_detection_1.IterableDiffers, { useValue: change_detection_1.defaultIterableDiffers }),
        di_1.provide(change_detection_1.KeyValueDiffers, { useValue: change_detection_1.defaultKeyValueDiffers }),
        utils_1.Log,
        di_1.provide(dynamic_component_loader_1.DynamicComponentLoader, { useClass: dynamic_component_loader_2.DynamicComponentLoader_ }),
        pipe_resolver_1.PipeResolver,
        di_1.provide(exceptions_1.ExceptionHandler, { useValue: new exceptions_1.ExceptionHandler(dom_adapter_1.DOM) }),
        di_1.provide(location_strategy_1.LocationStrategy, { useClass: mock_location_strategy_1.MockLocationStrategy }),
        di_1.provide(xhr_1.XHR, { useClass: dom_adapter_1.DOM.getXHR() }),
        test_component_builder_1.TestComponentBuilder,
        di_1.provide(ng_zone_1.NgZone, { useClass: ng_zone_mock_1.MockNgZone }),
        di_1.provide(animation_builder_1.AnimationBuilder, { useClass: animation_builder_mock_1.MockAnimationBuilder }),
        core_1.EventManager,
        new di_1.Provider(core_1.EVENT_MANAGER_PLUGINS, { useClass: dom_events_1.DomEventsPlugin, multi: true })
    ];
}
function createTestInjector(providers) {
    var rootInjector = di_2.Injector.resolveAndCreate(_getRootProviders());
    return rootInjector.resolveAndCreateChild(collection_1.ListWrapper.concat(_getAppBindings(), providers));
}
exports.createTestInjector = createTestInjector;
/**
 * Allows injecting dependencies in `beforeEach()` and `it()`.
 *
 * Example:
 *
 * ```
 * beforeEach(inject([Dependency, AClass], (dep, object) => {
 *   // some code that uses `dep` and `object`
 *   // ...
 * }));
 *
 * it('...', inject([AClass, AsyncTestCompleter], (object, async) => {
 *   object.doSomething().then(() => {
 *     expect(...);
 *     async.done();
 *   });
 * })
 * ```
 *
 * Notes:
 * - injecting an `AsyncTestCompleter` allow completing async tests - this is the equivalent of
 *   adding a `done` parameter in Jasmine,
 * - inject is currently a function because of some Traceur limitation the syntax should eventually
 *   becomes `it('...', @Inject (object: AClass, async: AsyncTestCompleter) => { ... });`
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 */
function inject(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, false);
}
exports.inject = inject;
function injectAsync(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, true);
}
exports.injectAsync = injectAsync;
var FunctionWithParamTokens = (function () {
    function FunctionWithParamTokens(_tokens, _fn, isAsync) {
        this._tokens = _tokens;
        this._fn = _fn;
        this.isAsync = isAsync;
    }
    /**
     * Returns the value of the executed function.
     */
    FunctionWithParamTokens.prototype.execute = function (injector) {
        var params = this._tokens.map(function (t) { return injector.get(t); });
        return lang_1.FunctionWrapper.apply(this._fn, params);
    };
    FunctionWithParamTokens.prototype.hasToken = function (token) { return this._tokens.indexOf(token) > -1; };
    return FunctionWithParamTokens;
})();
exports.FunctionWithParamTokens = FunctionWithParamTokens;
//# sourceMappingURL=test_injector.js.map