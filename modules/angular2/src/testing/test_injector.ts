import {ReflectiveInjector, Provider, PLATFORM_INITIALIZER} from 'angular2/core';
import {BaseException, ExceptionHandler} from 'angular2/src/facade/exceptions';
import {ListWrapper} from 'angular2/src/facade/collection';
import {FunctionWrapper, isPresent, Type} from 'angular2/src/facade/lang';

export class TestInjector {
  private _instantiated: boolean = false;

  private _injector: ReflectiveInjector = null;

  private _providers: Array<Type | Provider | any[]> = [];

  reset() {
    this._injector = null;
    this._providers = [];
    this._instantiated = false;
  }

  platformProviders: Array<Type | Provider | any[]> = [];

  applicationProviders: Array<Type | Provider | any[]> = [];

  addProviders(providers: Array<Type | Provider | any[]>) {
    if (this._instantiated) {
      throw new BaseException('Cannot add providers after test injector is instantiated');
    }
    this._providers = ListWrapper.concat(this._providers, providers);
  }

  createInjector() {
    var rootInjector = ReflectiveInjector.resolveAndCreate(this.platformProviders);
    this._injector = rootInjector.resolveAndCreateChild(
        ListWrapper.concat(this.applicationProviders, this._providers));
    this._instantiated = true;
    return this._injector;
  }

  execute(fn: FunctionWithParamTokens): any {
    var additionalProviders = fn.additionalProviders();
    if (additionalProviders.length > 0) {
      this.addProviders(additionalProviders);
    }
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
  var testInjector = getTestInjector();
  if (testInjector.platformProviders.length > 0 || testInjector.applicationProviders.length > 0) {
    throw new BaseException('Cannot set base providers because it has already been called');
  }
  testInjector.platformProviders = platformProviders;
  testInjector.applicationProviders = applicationProviders;
  var injector = testInjector.createInjector();
  let inits: Function[] = injector.get(PLATFORM_INITIALIZER, null);
  if (isPresent(inits)) {
    inits.forEach(init => init());
  }
  testInjector.reset();
}

/**
 * Reset the providers for the test injector.
 */
export function resetBaseTestProviders() {
  var testInjector = getTestInjector();
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

export class InjectSetupWrapper {
  constructor(private _providers: () => any) {}

  inject(tokens: any[], fn: Function): FunctionWithParamTokens {
    return new FunctionWithParamTokens(tokens, fn, false, this._providers);
  }

  /** @Deprecated {use async(withProviders().inject())} */
  injectAsync(tokens: any[], fn: Function): FunctionWithParamTokens {
    return new FunctionWithParamTokens(tokens, fn, true, this._providers);
  }
}

export function withProviders(providers: () => any) {
  return new InjectSetupWrapper(providers);
}

/**
 * @Deprecated {use async(inject())}
 *
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

/**
 * Wraps a test function in an asynchronous test zone. The test will automatically
 * complete when all asynchronous calls within this zone are done. Can be used
 * to wrap an {@link inject} call.
 *
 * Example:
 *
 * ```
 * it('...', async(inject([AClass], (object) => {
 *   object.doSomething.then(() => {
 *     expect(...);
 *   })
 * });
 * ```
 */
export function async(fn: Function | FunctionWithParamTokens): FunctionWithParamTokens {
  if (fn instanceof FunctionWithParamTokens) {
    fn.isAsync = true;
    return fn;
  } else if (fn instanceof Function) {
    return new FunctionWithParamTokens([], fn, true);
  } else {
    throw new BaseException('argument to async must be a function or inject(<Function>)');
  }
}

function emptyArray(): Array<any> {
  return [];
}

export class FunctionWithParamTokens {
  constructor(private _tokens: any[], public fn: Function, public isAsync: boolean,
              public additionalProviders: () => any = emptyArray) {}

  /**
   * Returns the value of the executed function.
   */
  execute(injector: ReflectiveInjector): any {
    var params = this._tokens.map(t => injector.get(t));
    return FunctionWrapper.apply(this.fn, params);
  }

  hasToken(token: any): boolean { return this._tokens.indexOf(token) > -1; }
}
