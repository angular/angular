library angular2.src.testing.test_injector;

import "package:angular2/core.dart"
    show
        APP_ID,
        APPLICATION_COMMON_PROVIDERS,
        AppViewManager,
        DirectiveResolver,
        DynamicComponentLoader,
        Injector,
        NgZone,
        Renderer,
        Provider,
        ViewResolver,
        provide;
import "package:angular2/src/animate/animation_builder.dart"
    show AnimationBuilder;
import "package:angular2/src/mock/animation_builder_mock.dart"
    show MockAnimationBuilder;
import "package:angular2/src/core/linker/proto_view_factory.dart"
    show ProtoViewFactory;
import "package:angular2/src/core/reflection/reflection.dart"
    show Reflector, reflector;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show
        IterableDiffers,
        defaultIterableDiffers,
        KeyValueDiffers,
        defaultKeyValueDiffers,
        ChangeDetectorGenConfig;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, ExceptionHandler;
import "package:angular2/src/core/linker/pipe_resolver.dart" show PipeResolver;
import "package:angular2/src/compiler/xhr.dart" show XHR;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/mock/directive_resolver_mock.dart"
    show MockDirectiveResolver;
import "package:angular2/src/mock/view_resolver_mock.dart"
    show MockViewResolver;
import "package:angular2/src/mock/mock_location_strategy.dart"
    show MockLocationStrategy;
import "package:angular2/src/router/location_strategy.dart"
    show LocationStrategy;
import "package:angular2/src/mock/ng_zone_mock.dart" show MockNgZone;
import "test_component_builder.dart" show TestComponentBuilder;
import "package:angular2/platform/common_dom.dart"
    show EventManager, EVENT_MANAGER_PLUGINS, ELEMENT_PROBE_PROVIDERS;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/facade/lang.dart" show FunctionWrapper, Type;
import "package:angular2/src/core/linker/view_pool.dart"
    show AppViewPool, APP_VIEW_POOL_CAPACITY;
import "package:angular2/src/core/linker/view_manager_utils.dart"
    show AppViewManagerUtils;
import "package:angular2/src/platform/dom/dom_tokens.dart" show DOCUMENT;
import "package:angular2/src/platform/dom/dom_renderer.dart" show DomRenderer;
import "package:angular2/src/platform/dom/shared_styles_host.dart"
    show DomSharedStylesHost;
import "package:angular2/src/platform/dom/shared_styles_host.dart"
    show SharedStylesHost;
import "package:angular2/src/platform/dom/events/dom_events.dart"
    show DomEventsPlugin;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer;
import "utils.dart" show Log;
import "package:angular2/src/compiler/compiler.dart" show COMPILER_PROVIDERS;
import "package:angular2/src/platform/dom/dom_renderer.dart" show DomRenderer_;
import "package:angular2/src/core/linker/dynamic_component_loader.dart"
    show DynamicComponentLoader_;
import "package:angular2/src/core/linker/view_manager.dart"
    show AppViewManager_;

/**
 * Returns the root injector providers.
 *
 * This must be kept in sync with the _rootBindings in application.js
 *
 * @returns {any[]}
 */
_getRootProviders() {
  return [provide(Reflector, useValue: reflector)];
}

/**
 * Returns the application injector providers.
 *
 * This must be kept in sync with _injectorBindings() in application.js
 *
 * @returns {any[]}
 */
_getAppBindings() {
  var appDoc;
  // The document is only available in browser environment
  try {
    appDoc = DOM.defaultDoc();
  } catch (e, e_stack) {
    appDoc = null;
  }
  return [
    APPLICATION_COMMON_PROVIDERS,
    provide(ChangeDetectorGenConfig,
        useValue: new ChangeDetectorGenConfig(true, false, true)),
    provide(DOCUMENT, useValue: appDoc),
    provide(DomRenderer, useClass: DomRenderer_),
    provide(Renderer, useExisting: DomRenderer),
    provide(APP_ID, useValue: "a"),
    DomSharedStylesHost,
    provide(SharedStylesHost, useExisting: DomSharedStylesHost),
    AppViewPool,
    provide(AppViewManager, useClass: AppViewManager_),
    AppViewManagerUtils,
    Serializer,
    ELEMENT_PROBE_PROVIDERS,
    provide(APP_VIEW_POOL_CAPACITY, useValue: 500),
    ProtoViewFactory,
    provide(DirectiveResolver, useClass: MockDirectiveResolver),
    provide(ViewResolver, useClass: MockViewResolver),
    provide(IterableDiffers, useValue: defaultIterableDiffers),
    provide(KeyValueDiffers, useValue: defaultKeyValueDiffers),
    Log,
    provide(DynamicComponentLoader, useClass: DynamicComponentLoader_),
    PipeResolver,
    provide(ExceptionHandler, useValue: new ExceptionHandler(DOM)),
    provide(LocationStrategy, useClass: MockLocationStrategy),
    provide(XHR, useClass: DOM.getXHR()),
    TestComponentBuilder,
    provide(NgZone, useClass: MockNgZone),
    provide(AnimationBuilder, useClass: MockAnimationBuilder),
    EventManager,
    new Provider(EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true)
  ];
}

_runtimeCompilerBindings() {
  return [provide(XHR, useClass: DOM.getXHR()), COMPILER_PROVIDERS];
}

class TestInjector {
  bool _instantiated = false;
  Injector _injector = null;
  List<dynamic /* Type | Provider | List < dynamic > */ > _providers = [];
  reset() {
    this._injector = null;
    this._providers = [];
    this._instantiated = false;
  }

  addProviders(
      List<dynamic /* Type | Provider | List < dynamic > */ > providers) {
    if (this._instantiated) {
      throw new BaseException(
          "Cannot add providers after test injector is instantiated");
    }
    this._providers = ListWrapper.concat(this._providers, providers);
  }

  createInjector() {
    var rootInjector = Injector.resolveAndCreate(_getRootProviders());
    this._injector = rootInjector.resolveAndCreateChild(ListWrapper.concat(
        ListWrapper.concat(_getAppBindings(), _runtimeCompilerBindings()),
        this._providers));
    this._instantiated = true;
    return this._injector;
  }

  dynamic execute(FunctionWithParamTokens fn) {
    if (!this._instantiated) {
      this.createInjector();
    }
    return fn.execute(this._injector);
  }
}

TestInjector _testInjector = null;
getTestInjector() {
  if (_testInjector == null) {
    _testInjector = new TestInjector();
  }
  return _testInjector;
}

/**
 * Allows injecting dependencies in `beforeEach()` and `it()`. When using with the
 * `angular2/testing` library, the test function will be run within a zone and will
 * automatically complete when all asynchronous tests have finished.
 *
 * Example:
 *
 * ```
 * beforeEach(inject([Dependency, AClass], (dep, object) => {
 *   // some code that uses `dep` and `object`
 *   // ...
 * }));
 *
 * it('...', inject([AClass], (object) => {
 *   object.doSomething().then(() => {
 *     expect(...);
 *   });
 * })
 * ```
 *
 * Notes:
 * - inject is currently a function because of some Traceur limitation the syntax should eventually
 *   becomes `it('...', @Inject (object: AClass, async: AsyncTestCompleter) => { ... });`
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 */
FunctionWithParamTokens inject(List<dynamic> tokens, Function fn) {
  return new FunctionWithParamTokens(tokens, fn, false);
}

/**
 * @deprecated Use inject instead, which now supports both synchronous and asynchronous tests.
 */
FunctionWithParamTokens injectAsync(List<dynamic> tokens, Function fn) {
  return new FunctionWithParamTokens(tokens, fn, true);
}

class FunctionWithParamTokens {
  List<dynamic> _tokens;
  Function _fn;
  bool isAsync;
  FunctionWithParamTokens(this._tokens, this._fn, this.isAsync) {}
  /**
   * Returns the value of the executed function.
   */
  dynamic execute(Injector injector) {
    var params = this._tokens.map((t) => injector.get(t)).toList();
    return FunctionWrapper.apply(this._fn, params);
  }

  bool hasToken(dynamic token) {
    return this._tokens.indexOf(token) > -1;
  }
}
