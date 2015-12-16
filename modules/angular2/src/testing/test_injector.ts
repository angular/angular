import {
  APP_ID,
  PLATFORM_COMMON_PROVIDERS,
  DirectiveResolver,
  Injector,
  NgZone,
  Provider,
  ViewResolver
} from 'angular2/core';
import {
  BROWSER_PROVIDERS,
  BROWSER_APP_COMMON_PROVIDERS
} from 'angular2/src/platform/browser_common';
import {AnimationBuilder} from 'angular2/src/animate/animation_builder';
import {MockAnimationBuilder} from 'angular2/src/mock/animation_builder_mock';

import {BaseException, ExceptionHandler} from 'angular2/src/facade/exceptions';
import {XHR} from 'angular2/src/compiler/xhr';

import {DOM} from 'angular2/src/platform/dom/dom_adapter';

import {MockDirectiveResolver} from 'angular2/src/mock/directive_resolver_mock';
import {MockViewResolver} from 'angular2/src/mock/view_resolver_mock';
import {MockLocationStrategy} from 'angular2/src/mock/mock_location_strategy';
import {LocationStrategy} from 'angular2/src/router/location_strategy';
import {MockNgZone} from 'angular2/src/mock/ng_zone_mock';

import {TestComponentBuilder} from './test_component_builder';

import {
  ELEMENT_PROBE_PROVIDERS
} from 'angular2/platform/common_dom';

import {ListWrapper} from 'angular2/src/facade/collection';
import {FunctionWrapper, ConcreteType, Type, CONST_EXPR} from 'angular2/src/facade/lang';

import {Serializer} from "angular2/src/web_workers/shared/serializer";
import {Log} from './utils';
import {COMPILER_PROVIDERS} from 'angular2/src/compiler/compiler';

/**
 * Default patform providers for testing.
 */
export const TEST_PLATFORM_PROVIDERS: Array<Type | Provider | any[]> =
    CONST_EXPR([PLATFORM_COMMON_PROVIDERS]);

/**
 * Default application providers for tests in a browser.
 */
export const TEST_BROWSER_COMMON_APPLICATION_PROVIDERS: Array<Type | Provider | any[]> =
    CONST_EXPR([
      BROWSER_APP_COMMON_PROVIDERS,
      new Provider(APP_ID, {useValue: 'a'}),
      ELEMENT_PROBE_PROVIDERS,
      new Provider(DirectiveResolver, {useClass: MockDirectiveResolver}),
      new Provider(ViewResolver, {useClass: MockViewResolver}),
      Log,
      TestComponentBuilder,
      new Provider(NgZone, {useClass: MockNgZone}),
      new Provider(LocationStrategy, {useClass: MockLocationStrategy}),
      new Provider(AnimationBuilder, {useClass: MockAnimationBuilder}),
      // TODO - this is temporarily here so that Angular's internal web worker tests
      // still function. Remove it when we have a way of changing the test
      // setup per file.
      Serializer
    ]);

function _getXHRForCurrentDOM(): XHR {
  var xhrType = <ConcreteType>DOM.getXHR();
  return new xhrType();
}

/**
 * Default application providers for tests in a browser and using the runtime compiler.
 */
export const TEST_BROWSER_APPLICATION_PROVIDERS: Array<Type | Provider | any[]> = CONST_EXPR([
  TEST_BROWSER_COMMON_APPLICATION_PROVIDERS,
  // TODO(juliemr): instead of specifying the DOM here, the test should set it up per platform.
  new Provider(XHR, {useFactory: _getXHRForCurrentDOM, deps: []}),
  COMPILER_PROVIDERS
]);

export class TestInjector {
  private _instantiated: boolean = false;

  private _injector: Injector = null;

  private _providers: Array<Type | Provider | any[]> = [];

  reset() {
    this._injector = null;
    this._providers = [];
    this._instantiated = false;
  }

  platformProviders: Array<Type | Provider | any[]> = TEST_PLATFORM_PROVIDERS;

  applicationProviders: Array<Type | Provider | any[]> = TEST_BROWSER_APPLICATION_PROVIDERS;

  addProviders(providers: Array<Type | Provider | any[]>) {
    if (this._instantiated) {
      throw new BaseException('Cannot add providers after test injector is instantiated');
    }
    this._providers = ListWrapper.concat(this._providers, providers);
  }

  createInjector() {
    var rootInjector = Injector.resolveAndCreate(this.platformProviders);
    this._injector = rootInjector.resolveAndCreateChild(
        ListWrapper.concat(this.applicationProviders, this._providers));
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
 * @deprecated Use TestInjector#createInjector() instead.
 */
export function createTestInjector(providers: Array<Type | Provider | any[]>): Injector {
  var rootInjector = Injector.resolveAndCreate(TEST_PLATFORM_PROVIDERS);
  return rootInjector.resolveAndCreateChild(
      ListWrapper.concat(TEST_BROWSER_COMMON_APPLICATION_PROVIDERS, providers));
}

/**
 * @deprecated Use TestInjector#createInjector() instead.
 */
export function createTestInjectorWithRuntimeCompiler(
    providers: Array<Type | Provider | any[]>): Injector {
  var rootInjector = Injector.resolveAndCreate(TEST_PLATFORM_PROVIDERS);
  return rootInjector.resolveAndCreateChild(
      ListWrapper.concat(TEST_BROWSER_APPLICATION_PROVIDERS, providers));
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
 * it('...', inject([AClass], (object) => {
 *   object.doSomething();
 *   expect(...);
 * })
 * ```
 *
 * Notes:
 * - inject is currently a function because of some Traceur limitation the syntax should
 * eventually
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
 * Allows injecting dependencies in `beforeEach()` and `it()`. The test must return
 * a promise which will resolve when all asynchronous activity is complete.
 *
 * Example:
 *
 * ```
 * it('...', injectAsync([AClass], (object) => {
 *   return object.doSomething().then(() => {
 *     expect(...);
 *   });
 * })
 * ```
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
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
