import {provide, Provider} from 'angular2/src/core/di';
import {DEFAULT_PIPES} from 'angular2/src/core/pipes';
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
import {ExceptionHandler} from 'angular2/src/core/facade/exceptions';
import {ViewResolver} from 'angular2/src/core/linker/view_resolver';
import {DirectiveResolver} from 'angular2/src/core/linker/directive_resolver';
import {PipeResolver} from 'angular2/src/core/linker/pipe_resolver';
import {DynamicComponentLoader} from 'angular2/src/core/linker/dynamic_component_loader';
import {XHR} from 'angular2/src/core/compiler/xhr';
import {NgZone} from 'angular2/src/core/zone/ng_zone';

import {DOM} from 'angular2/src/core/dom/dom_adapter';

import {
  EventManager,
  DomEventsPlugin,
  EVENT_MANAGER_PLUGINS
} from 'angular2/src/core/render/dom/events/event_manager';

import {MockDirectiveResolver} from 'angular2/src/mock/directive_resolver_mock';
import {MockViewResolver} from 'angular2/src/mock/view_resolver_mock';
import {MockLocationStrategy} from 'angular2/src/mock/mock_location_strategy';
import {LocationStrategy} from 'angular2/src/router/location_strategy';
import {MockNgZone} from 'angular2/src/mock/ng_zone_mock';

import {TestComponentBuilder} from './test_component_builder';

import {Injector} from 'angular2/src/core/di';
import {ELEMENT_PROBE_PROVIDERS} from 'angular2/src/core/debug';

import {ListWrapper} from 'angular2/src/core/facade/collection';
import {FunctionWrapper, Type} from 'angular2/src/core/facade/lang';

import {AppViewPool, APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/linker/view_pool';
import {AppViewManager} from 'angular2/src/core/linker/view_manager';
import {AppViewManagerUtils} from 'angular2/src/core/linker/view_manager_utils';
import {Renderer} from 'angular2/src/core/render/api';
import {
  DomRenderer,
  DOCUMENT,
  SharedStylesHost,
  DomSharedStylesHost
} from 'angular2/src/core/render/render';
import {APP_ID} from 'angular2/src/core/application_tokens';
import {Serializer} from "angular2/src/web_workers/shared/serializer";
import {Log} from './utils';
import {compilerProviders} from 'angular2/src/core/compiler/compiler';
import {DomRenderer_} from "angular2/src/core/render/dom/dom_renderer";
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
    compilerProviders(),
    provide(ChangeDetectorGenConfig,
            {useValue: new ChangeDetectorGenConfig(true, true, false, true)}),
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
    DEFAULT_PIPES,
    provide(IterableDiffers, {useValue: defaultIterableDiffers}),
    provide(KeyValueDiffers, {useValue: defaultKeyValueDiffers}),
    Log,
    provide(DynamicComponentLoader, {useClass: DynamicComponentLoader_}),
    PipeResolver,
    provide(ExceptionHandler, {useValue: new ExceptionHandler(DOM)}),
    provide(LocationStrategy, {useClass: MockLocationStrategy}),
    XHR,
    TestComponentBuilder,
    provide(NgZone, {useClass: MockNgZone}),
    provide(AnimationBuilder, {useClass: MockAnimationBuilder}),
    EventManager,
    new Provider(EVENT_MANAGER_PLUGINS, {useClass: DomEventsPlugin, multi: true})
  ];
}

export function createTestInjector(providers: Array<Type | Provider | any[]>): Injector {
  var rootInjector = Injector.resolveAndCreate(_getRootProviders());
  return rootInjector.resolveAndCreateChild(ListWrapper.concat(_getAppBindings(), providers));
}

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
export function inject(tokens: any[], fn: Function): FunctionWithParamTokens {
  return new FunctionWithParamTokens(tokens, fn, false);
}

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
