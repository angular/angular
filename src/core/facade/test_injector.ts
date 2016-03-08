import {Injector, Provider, PLATFORM_INITIALIZER} from 'angular2/core';
import {BaseException} from 'angular2/src/facade/exceptions';
import {ListWrapper} from 'angular2/src/facade/collection';
import {FunctionWrapper, isPresent, Type} from 'angular2/src/facade/lang';

export class TestInjector {

  private instantiated_: boolean = false;

  private injector_: Injector = null;

  private providers_: Array<Type | Provider | any[]> = [];

  reset() {
    this.injector_ = null;
    this.providers_ = [];
    this.instantiated_ = false;
  }

  platformProviders: Array<Type | Provider | any[]> = [];

  applicationProviders: Array<Type | Provider | any[]> = [];

  addProviders(providers: Array<Type | Provider | any[]>) {
    if (this.instantiated_) {
      throw new BaseException('Cannot add providers after test injector is instantiated');
    }
    this.providers_ = ListWrapper.concat(this.providers_, providers);
  }

  createInjector() {
    let rootInjector = Injector.resolveAndCreate(this.platformProviders);
    this.injector_ = rootInjector.resolveAndCreateChild(
      ListWrapper.concat(this.applicationProviders, this.providers_));
    this.instantiated_ = true;
    return this.injector_;
  }

  execute(fn: FunctionWithParamTokens): any {
    if (!this.instantiated_) {
      this.createInjector();
    }
    return fn.execute(this.injector_);
  }
}

let testInjectorCache: TestInjector = null;

export function getTestInjector() {
  if (testInjectorCache == null) {
    testInjectorCache = new TestInjector();
  }
  return testInjectorCache;
}

/**
 * Set the providers that the test injector should use. These should be providers
 * common to every test in the suite.
 *
 * This may only be called once, to set up the common providers for the current test
 * suite on teh current platform. If you absolutely need to change the providers,
 * first use `resetBaseTestProviders`.
 *
 * Test Providers for individual platforms are available from
 * 'angular2/platform/testing/<platform_name>'.
 */
export function setBaseTestProviders(platformProviders: Array<Type | Provider | any[]>,
                                     applicationProviders: Array<Type | Provider | any[]>) {
  let testInjector = getTestInjector();
  if (testInjector.platformProviders.length > 0 || testInjector.applicationProviders.length > 0) {
    throw new BaseException('Cannot set base providers because it has already been called');
  }
  testInjector.platformProviders = platformProviders;
  testInjector.applicationProviders = applicationProviders;
  let injector = testInjector.createInjector();
  let inits: Function[] = <Function[]>injector.getOptional(PLATFORM_INITIALIZER);
  if (isPresent(inits)) {
    inits.forEach(init => init());
  }
  testInjector.reset();
}

/**
 * Reset the providers for the test injector.
 */
export function resetBaseTestProviders() {
  let testInjector = getTestInjector();
  testInjector.platformProviders = [];
  testInjector.applicationProviders = [];
  testInjector.reset();
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
  constructor(private tokens_: any[], private fn_: Function, public isAsync: boolean) {}

  /**
   * Returns the value of the executed function.
   */
  execute(injector: Injector): any {
    let params = this.tokens_.map(t => injector.get(t));
    return FunctionWrapper.apply(this.fn_, params);
  }

  hasToken(token: any): boolean { return this.tokens_.indexOf(token) > -1; }
}
