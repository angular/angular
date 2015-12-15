import {
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
  provide
} from 'angular2/core';
import {AnimationBuilder} from 'angular2/src/animate/animation_builder';
import {MockAnimationBuilder} from 'angular2/src/mock/animation_builder_mock';

import {ProtoViewFactory} from 'angular2/src/core/linker/proto_view_factory';
import {Reflector, reflector} from 'angular2/src/core/reflection/reflection';
import {
  IterableDiffers,
  defaultIterableDiffers,
  KeyValueDiffers,
  defaultKeyValueDiffers,
  ChangeDetectorGenConfig
} from 'angular2/src/core/change_detection/change_detection';
import {BaseException, ExceptionHandler} from 'angular2/src/facade/exceptions';
import {PipeResolver} from 'angular2/src/core/linker/pipe_resolver';
import {XHR} from 'angular2/src/compiler/xhr';

import {DOM} from 'angular2/src/platform/dom/dom_adapter';

import {MockDirectiveResolver} from 'angular2/src/mock/directive_resolver_mock';
import {MockViewResolver} from 'angular2/src/mock/view_resolver_mock';
import {MockLocationStrategy} from 'angular2/src/mock/mock_location_strategy';
import {LocationStrategy} from 'angular2/src/router/location_strategy';
import {MockNgZone} from 'angular2/src/mock/ng_zone_mock';

import {TestComponentBuilder} from './test_component_builder';

import {
  EventManager,
  EVENT_MANAGER_PLUGINS,
  ELEMENT_PROBE_PROVIDERS
} from 'angular2/platform/common_dom';

import {ListWrapper} from 'angular2/src/facade/collection';
import {FunctionWrapper, Type} from 'angular2/src/facade/lang';

import {AppViewPool, APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/linker/view_pool';
import {AppViewManagerUtils} from 'angular2/src/core/linker/view_manager_utils';

import {DOCUMENT} from 'angular2/src/platform/dom/dom_tokens';
import {DomRenderer} from 'angular2/src/platform/dom/dom_renderer';
import {DomSharedStylesHost} from 'angular2/src/platform/dom/shared_styles_host';
import {SharedStylesHost} from 'angular2/src/platform/dom/shared_styles_host';
import {DomEventsPlugin} from 'angular2/src/platform/dom/events/dom_events';

import {Serializer} from "angular2/src/web_workers/shared/serializer";
import {Log} from './utils';
import {COMPILER_PROVIDERS} from 'angular2/src/compiler/compiler';
import {DomRenderer_} from "angular2/src/platform/dom/dom_renderer";
import {DynamicComponentLoader_} from "angular2/src/core/linker/dynamic_component_loader";
import {AppViewManager_} from "angular2/src/core/linker/view_manager";

/**
 * Returns the root injector providers.
 *
 * This must be kept in sync with the _rootBindings in application.js
 *
 * @returns {any[]}
 */
function _getRootProviders() {
  return [provide(Reflector, {useValue: reflector})];
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
    appDoc = DOM.defaultDoc();
  } catch (e) {
    appDoc = null;
  }

  return [
    APPLICATION_COMMON_PROVIDERS,
    provide(ChangeDetectorGenConfig, {useValue: new ChangeDetectorGenConfig(true, false, true)}),
    provide(DOCUMENT, {useValue: appDoc}),
    provide(DomRenderer, {useClass: DomRenderer_}),
    provide(Renderer, {useExisting: DomRenderer}),
    provide(APP_ID, {useValue: 'a'}),
    DomSharedStylesHost,
    provide(SharedStylesHost, {useExisting: DomSharedStylesHost}),
    AppViewPool,
    provide(AppViewManager, {useClass: AppViewManager_}),
    AppViewManagerUtils,
    Serializer,
    ELEMENT_PROBE_PROVIDERS,
    provide(APP_VIEW_POOL_CAPACITY, {useValue: 500}),
    ProtoViewFactory,
    provide(DirectiveResolver, {useClass: MockDirectiveResolver}),
    provide(ViewResolver, {useClass: MockViewResolver}),
    provide(IterableDiffers, {useValue: defaultIterableDiffers}),
    provide(KeyValueDiffers, {useValue: defaultKeyValueDiffers}),
    Log,
    provide(DynamicComponentLoader, {useClass: DynamicComponentLoader_}),
    PipeResolver,
    provide(ExceptionHandler, {useValue: new ExceptionHandler(DOM)}),
    provide(LocationStrategy, {useClass: MockLocationStrategy}),
    provide(XHR, {useClass: DOM.getXHR()}),
    TestComponentBuilder,
    provide(NgZone, {useClass: MockNgZone}),
    provide(AnimationBuilder, {useClass: MockAnimationBuilder}),
    EventManager,
    new Provider(EVENT_MANAGER_PLUGINS, {useClass: DomEventsPlugin, multi: true})
  ];
}

function _runtimeCompilerBindings() {
  return [
    provide(XHR, {useClass: DOM.getXHR()}),
    COMPILER_PROVIDERS,
  ];
}

export class TestInjector {
  private _instantiated: boolean = false;

  private _injector: Injector = null;

  private _providers: Array<Type | Provider | any[]> = [];

  reset() {
    this._injector = null;
    this._providers = [];
    this._instantiated = false;
  }

  addProviders(providers: Array<Type | Provider | any[]>) {
    if (this._instantiated) {
      throw new BaseException('Cannot add providers after test injector is instantiated');
    }
    this._providers = ListWrapper.concat(this._providers, providers);
  }

  createInjector() {
    var rootInjector = Injector.resolveAndCreate(_getRootProviders());
    this._injector = rootInjector.resolveAndCreateChild(ListWrapper.concat(
        ListWrapper.concat(_getAppBindings(), _runtimeCompilerBindings()), this._providers));
    this._instantiated = true;
    return this._injector;
  }

  execute(fn: FunctionWithParamTokens): any {
    if (!this._instantiated) {
      this.createInjector();
    }
    return fn.execute(this._injector);
  }
}

var _testInjector: TestInjector = null;

export function getTestInjector() {
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
export function inject(tokens: any[], fn: Function): FunctionWithParamTokens {
  return new FunctionWithParamTokens(tokens, fn, false);
}

/**
 * @deprecated Use inject instead, which now supports both synchronous and asynchronous tests.
 */
export function injectAsync(tokens: any[], fn: Function): FunctionWithParamTokens {
  return new FunctionWithParamTokens(tokens, fn, true);
}

export class FunctionWithParamTokens {
  constructor(private _tokens: any[], private _fn: Function, public isAsync: boolean) {}

  /**
   * Returns the value of the executed function.
   */
  execute(injector: Injector): any {
    var params = this._tokens.map(t => injector.get(t));
    return FunctionWrapper.apply(this._fn, params);
  }

  hasToken(token: any): boolean { return this._tokens.indexOf(token) > -1; }
}
