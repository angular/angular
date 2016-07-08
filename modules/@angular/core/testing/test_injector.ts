/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AppModule, AppModuleFactory, AppModuleMetadata, AppModuleRef, Compiler, CompilerFactory, ComponentStillLoadingError, Injector, PlatformRef, Provider, Type} from '../index';
import {ListWrapper} from '../src/facade/collection';
import {BaseException} from '../src/facade/exceptions';
import {FunctionWrapper, isPresent, stringify} from '../src/facade/lang';

import {AsyncTestCompleter} from './async_test_completer';

const UNDEFINED = new Object();

/**
 * @experimental
 */
export class TestInjector implements Injector {
  private _instantiated: boolean = false;

  private _compiler: Compiler = null;
  private _moduleRef: AppModuleRef<any> = null;

  private _compilerProviders: Array<Type|Provider|any[]|any> = [];
  private _compilerUseJit: boolean = true;

  private _providers: Array<Type|Provider|any[]|any> = [];
  private _directives: Array<Type|any[]|any> = [];
  private _pipes: Array<Type|any[]|any> = [];
  private _modules: Array<Type|any[]|any> = [];
  private _precompile: Array<Type|any[]|any> = [];

  reset() {
    this._compiler = null;
    this._moduleRef = null;
    this._compilerProviders = [];
    this._compilerUseJit = true;
    this._providers = [];
    this._directives = [];
    this._pipes = [];
    this._modules = [];
    this._precompile = [];
    this._instantiated = false;
  }

  platform: PlatformRef = null;

  appModule: Type = null;

  configureCompiler(config: {providers?: any[], useJit?: boolean}) {
    if (this._instantiated) {
      throw new BaseException('Cannot add configuration after test injector is instantiated');
    }
    if (config.providers) {
      this._compilerProviders = ListWrapper.concat(this._compilerProviders, config.providers);
    }
    if (config.useJit !== undefined) {
      this._compilerUseJit = config.useJit;
    }
  }

  configureModule(moduleDef: {
    providers?: any[],
    directives?: any[],
    pipes?: any[],
    precompile?: any[],
    modules?: any[]
  }) {
    if (this._instantiated) {
      throw new BaseException('Cannot add configuration after test injector is instantiated');
    }
    if (moduleDef.providers) {
      this._providers = ListWrapper.concat(this._providers, moduleDef.providers);
    }
    if (moduleDef.directives) {
      this._directives = ListWrapper.concat(this._directives, moduleDef.directives);
    }
    if (moduleDef.pipes) {
      this._pipes = ListWrapper.concat(this._pipes, moduleDef.pipes);
    }
    if (moduleDef.precompile) {
      this._precompile = ListWrapper.concat(this._precompile, moduleDef.precompile);
    }
    if (moduleDef.modules) {
      this._modules = ListWrapper.concat(this._modules, moduleDef.modules);
    }
  }

  createInjectorSync(): Injector {
    if (this._instantiated) {
      return this;
    }
    let moduleMeta = this._createCompilerAndModuleMeta();
    return this._createFromModuleFactory(
        this._compiler.compileAppModuleSync(_NoopModule, moduleMeta));
  }

  createInjectorAsync(): Promise<Injector> {
    if (this._instantiated) {
      return Promise.resolve(this);
    }
    let moduleMeta = this._createCompilerAndModuleMeta();
    return this._compiler.compileAppModuleAsync(_NoopModule, moduleMeta)
        .then((appModuleFactory) => this._createFromModuleFactory(appModuleFactory));
  }

  private _createCompilerAndModuleMeta(): AppModuleMetadata {
    const compilerFactory: CompilerFactory = this.platform.injector.get(CompilerFactory);
    this._compiler = compilerFactory.createCompiler({
      providers: this._compilerProviders,
      useJit: this._compilerUseJit,
      deprecatedAppProviders: this._providers
    });
    const moduleMeta = new AppModuleMetadata({
      providers: this._providers.concat([{provide: TestInjector, useValue: this}]),
      modules: this._modules.concat([this.appModule]),
      directives: this._directives,
      pipes: this._pipes,
      precompile: this._precompile
    });

    return moduleMeta;
  }

  private _createFromModuleFactory(appModuleFactory: AppModuleFactory<any>): Injector {
    this._moduleRef = appModuleFactory.create(this.platform.injector);
    this._instantiated = true;
    return this;
  }

  get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND) {
    if (!this._instantiated) {
      throw new BaseException(
          'Illegal state: The TestInjector has not yet been created. Call createInjectorSync/Async first!');
    }
    if (token === TestInjector) {
      return this;
    }
    // Tests can inject things from the app module and from the compiler,
    // but the app module can't inject things from the compiler and vice versa.
    let result = this._moduleRef.injector.get(token, UNDEFINED);
    return result === UNDEFINED ? this._compiler.injector.get(token, notFoundValue) : result;
  }

  execute(tokens: any[], fn: Function): any {
    if (!this._instantiated) {
      throw new BaseException(
          'Illegal state: The TestInjector has not yet been created. Call createInjectorSync/Async first!');
    }
    var params = tokens.map(t => this.get(t));
    return FunctionWrapper.apply(fn, params);
  }
}

var _testInjector: TestInjector = null;

/**
 * @experimental
 */
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
 * suite on the current platform. If you absolutely need to change the providers,
 * first use `resetTestEnvironment`.
 *
 * Test modules and platforms for individual platforms are available from
 * 'angular2/platform/testing/<platform_name>'.
 *
 * @experimental
 */
export function initTestEnvironment(appModule: Type, platform: PlatformRef) {
  var testInjector = getTestInjector();
  if (testInjector.platform || testInjector.appModule) {
    throw new BaseException('Cannot set base providers because it has already been called');
  }
  testInjector.platform = platform;
  testInjector.appModule = appModule;
}

/**
 * Reset the providers for the test injector.
 *
 * @experimental
 */
export function resetTestEnvironment() {
  var testInjector = getTestInjector();
  testInjector.platform = null;
  testInjector.appModule = null;
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
 * @stable
 */
export function inject(tokens: any[], fn: Function): () => any {
  let testInjector = getTestInjector();
  if (tokens.indexOf(AsyncTestCompleter) >= 0) {
    return () => {
      // Return an async test method that returns a Promise if AsyncTestCompleter is one of the
      // injected tokens.
      return testInjector.createInjectorAsync().then(() => {
        let completer: AsyncTestCompleter = testInjector.get(AsyncTestCompleter);
        testInjector.execute(tokens, fn);
        return completer.promise;
      });
    };
  } else {
    return () => {
      // Return a asynchronous test method with the injected tokens.
      // TODO(tbosch): Right now, we can only detect the AsyncTestZoneSpec via its name.
      // (see https://github.com/angular/zone.js/issues/370)
      if (Zone.current.name.toLowerCase().indexOf('asynctestzone') >= 0) {
        return testInjector.createInjectorAsync().then(() => testInjector.execute(tokens, fn));
      } else {
        // Return a synchronous test method with the injected tokens.
        try {
          testInjector.createInjectorSync();
        } catch (e) {
          if (e instanceof ComponentStillLoadingError) {
            throw new Error(
                `This test module precompiles the component ${stringify(e.compType)} which is using a "templateUrl", but the test is synchronous. ` +
                `Please use the "async(...)" or "fakeAsync(...)" helper functions to make the test asynchronous.`);
          } else {
            throw e;
          }
        }
        return testInjector.execute(tokens, fn);
      }
    };
  }
}

/**
 * @experimental
 */
export class InjectSetupWrapper {
  constructor(private _moduleDef: () => {
    providers?: any[],
    directives?: any[],
    pipes?: any[],
    precompile?: any[],
    modules?: any[]
  }) {}

  private _addModule() {
    var moduleDef = this._moduleDef();
    if (moduleDef) {
      getTestInjector().configureModule(moduleDef);
    }
  }

  inject(tokens: any[], fn: Function): () => any {
    return () => {
      this._addModule();
      return inject_impl(tokens, fn)();
    };
  }
}

/**
 * @experimental
 */
export function withProviders(providers: () => any) {
  return new InjectSetupWrapper(() => {{return {providers: providers()};}});
}

/**
 * @experimental
 */
export function withModule(moduleDef: () => {
  providers?: any[],
  directives?: any[],
  pipes?: any[],
  precompile?: any[],
  modules?: any[]
}) {
  return new InjectSetupWrapper(moduleDef);
}


// This is to ensure inject(Async) within InjectSetupWrapper doesn't call itself
// when transpiled to Dart.
var inject_impl = inject;

class _NoopModule {}
