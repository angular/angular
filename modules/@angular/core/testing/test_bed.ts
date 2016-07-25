/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, CompilerFactory, CompilerOptions, ComponentStillLoadingError, Injector, NgModule, NgModuleFactory, NgModuleMetadata, NgModuleRef, PlatformRef, Provider, ReflectiveInjector, Type, assertPlatform, createPlatform, getPlatform} from '../index';
import {ListWrapper} from '../src/facade/collection';
import {BaseException} from '../src/facade/exceptions';
import {ConcreteType, FunctionWrapper, isPresent, stringify} from '../src/facade/lang';

import {AsyncTestCompleter} from './async_test_completer';

const UNDEFINED = new Object();

/**
 * @experimental
 */
export class TestBed implements Injector {
  private _instantiated: boolean = false;

  private _compiler: Compiler = null;
  private _moduleRef: NgModuleRef<any> = null;
  private _ngModuleFactory: NgModuleFactory<any> = null;

  private _compilerOptions: CompilerOptions[] = [];

  private _providers: Array<Type|Provider|any[]|any> = [];
  private _declarations: Array<Type|any[]|any> = [];
  private _imports: Array<Type|any[]|any> = [];
  private _entryComponents: Array<Type|any[]|any> = [];

  reset() {
    this._compiler = null;
    this._moduleRef = null;
    this._ngModuleFactory = null;
    this._compilerOptions = [];
    this._providers = [];
    this._declarations = [];
    this._imports = [];
    this._entryComponents = [];
    this._instantiated = false;
  }

  platform: PlatformRef = null;

  ngModule: Type = null;

  configureCompiler(config: {providers?: any[], useJit?: boolean}) {
    if (this._instantiated) {
      throw new BaseException('Cannot add configuration after test injector is instantiated');
    }
    this._compilerOptions.push(config);
  }

  configureModule(
      moduleDef:
          {providers?: any[], declarations?: any[], imports?: any[], entryComponents?: any[]}) {
    if (this._instantiated) {
      throw new BaseException('Cannot add configuration after test injector is instantiated');
    }
    if (moduleDef.providers) {
      this._providers = ListWrapper.concat(this._providers, moduleDef.providers);
    }
    if (moduleDef.declarations) {
      this._declarations = ListWrapper.concat(this._declarations, moduleDef.declarations);
    }
    if (moduleDef.imports) {
      this._imports = ListWrapper.concat(this._imports, moduleDef.imports);
    }
    if (moduleDef.entryComponents) {
      this._entryComponents = ListWrapper.concat(this._entryComponents, moduleDef.entryComponents);
    }
  }

  createModuleFactory(): Promise<NgModuleFactory<any>> {
    if (this._instantiated) {
      throw new BaseException(
          'Cannot compile entryComponents when the test NgModule has already been instantiated. ' +
          'Make sure you are not using `inject` before `doAsyncEntryPointCompilation`.');
    }

    if (this._ngModuleFactory) {
      return Promise.resolve(this._ngModuleFactory);
    }

    const moduleType = this._createCompilerAndModule();

    return this._compiler.compileModuleAsync(moduleType).then((ngModuleFactory) => {
      this._ngModuleFactory = ngModuleFactory;
      return ngModuleFactory;
    });
  }

  initTestModule() {
    if (this._instantiated) {
      return;
    }

    if (this._ngModuleFactory) {
      this._createFromModuleFactory(this._ngModuleFactory);
    } else {
      let moduleType = this._createCompilerAndModule();
      this._createFromModuleFactory(this._compiler.compileModuleSync(moduleType));
    }
  }

  /**
   * @internal
   */
  _createInjectorAsync(): Promise<Injector> {
    if (this._instantiated) {
      return Promise.resolve(this);
    }
    let ngModule = this._createCompilerAndModule();
    return this._compiler.compileModuleAsync(ngModule).then(
        (ngModuleFactory) => this._createFromModuleFactory(ngModuleFactory));
  }

  private _createCompilerAndModule(): ConcreteType<any> {
    const providers = this._providers.concat([{provide: TestBed, useValue: this}]);
    const declarations = this._declarations;
    const imports = [this.ngModule, this._imports];
    const entryComponents = this._entryComponents;

    @NgModule({
      providers: providers,
      declarations: declarations,
      imports: imports,
      entryComponents: entryComponents
    })
    class DynamicTestModule {
    }

    const compilerFactory: CompilerFactory = this.platform.injector.get(CompilerFactory);
    this._compiler =
        compilerFactory.createCompiler(this._compilerOptions.concat([{useDebug: true}]));
    return DynamicTestModule;
  }

  private _createFromModuleFactory(ngModuleFactory: NgModuleFactory<any>): Injector {
    this._moduleRef = ngModuleFactory.create(this.platform.injector);
    this._instantiated = true;
    return this;
  }

  get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND) {
    if (!this._instantiated) {
      throw new BaseException(
          'Illegal state: The test bed\'s injector has not yet been created. Call initTestNgModule first!');
    }
    if (token === TestBed) {
      return this;
    }
    // Tests can inject things from the ng module and from the compiler,
    // but the ng module can't inject things from the compiler and vice versa.
    let result = this._moduleRef.injector.get(token, UNDEFINED);
    return result === UNDEFINED ? this._compiler.injector.get(token, notFoundValue) : result;
  }

  execute(tokens: any[], fn: Function): any {
    if (!this._instantiated) {
      throw new BaseException(
          'Illegal state: The test bed\'s injector has not yet been created. Call initTestNgModule first!');
    }
    var params = tokens.map(t => this.get(t));
    return FunctionWrapper.apply(fn, params);
  }
}

var _testBed: TestBed = null;

/**
 * @experimental
 */
export function getTestBed() {
  if (_testBed == null) {
    _testBed = new TestBed();
  }
  return _testBed;
}

/**
 * @deprecated use getTestBed instead.
 */
export function getTestInjector() {
  return getTestBed();
}

/**
 * Set the providers that the test injector should use. These should be providers
 * common to every test in the suite.
 *
 * This may only be called once, to set up the common providers for the current test
 * suite on the current platform. If you absolutely need to change the providers,
 * first use `resetBaseTestProviders`.
 *
 * Test modules and platforms for individual platforms are available from
 * 'angular2/platform/testing/<platform_name>'.
 *
 * @deprecated Use initTestEnvironment instead
 */
export function setBaseTestProviders(
    platformProviders: Array<Type|Provider|any[]>,
    applicationProviders: Array<Type|Provider|any[]>) {
  if (platformProviders.length === 1 && typeof platformProviders[0] === 'function') {
    (<any>platformProviders[0])(applicationProviders);
  } else {
    throw new Error(
        `setBaseTestProviders is deprecated and only supports platformProviders that are predefined by Angular. Use 'initTestEnvironment' instead.`);
  }
}

/**
 * Initialize the environment for testing with a compiler factory, a PlatformRef, and an
 * angular module. These are common to every test in the suite.
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
export function initTestEnvironment(ngModule: Type, platform: PlatformRef): Injector {
  var testBed = getTestBed();
  if (testBed.platform || testBed.ngModule) {
    throw new BaseException('Cannot set base providers because it has already been called');
  }
  testBed.platform = platform;
  testBed.ngModule = ngModule;

  return testBed;
}

/**
 * Reset the providers for the test injector.
 *
 * @deprecated Use resetTestEnvironment instead.
 */
export function resetBaseTestProviders() {
  resetTestEnvironment();
}

/**
 * Reset the providers for the test injector.
 *
 * @experimental
 */
export function resetTestEnvironment() {
  var testBed = getTestBed();
  testBed.platform = null;
  testBed.ngModule = null;
  testBed.reset();
}

/**
 * Compile entryComponents with a `templateUrl` for the test's NgModule.
 * It is necessary to call this function
 * as fetching urls is asynchronous.
 *
 * @experimental
 */
export function doAsyncEntryPointCompilation(): Promise<any> {
  let testBed = getTestBed();
  return testBed.createModuleFactory();
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
  let testBed = getTestBed();
  if (tokens.indexOf(AsyncTestCompleter) >= 0) {
    return () => {
      // Return an async test method that returns a Promise if AsyncTestCompleter is one of the
      // injected tokens.
      return testBed._createInjectorAsync().then(() => {
        let completer: AsyncTestCompleter = testBed.get(AsyncTestCompleter);
        testBed.execute(tokens, fn);
        return completer.promise;
      });
    };
  } else {
    return () => {
      try {
        testBed.initTestModule();
      } catch (e) {
        if (e instanceof ComponentStillLoadingError) {
          throw new Error(
              `This test module uses the entryComponents ${stringify(e.compType)} which is using a "templateUrl", but they were never compiled. ` +
              `Please call "doAsyncEntryPointCompilation" before "inject".`);
        } else {
          throw e;
        }
      }
      return testBed.execute(tokens, fn);
    };
  }
}

/**
 * @experimental
 */
export class InjectSetupWrapper {
  constructor(private _moduleDef: () => {
    providers?: any[],
    declarations?: any[],
    imports?: any[],
    entryComponents?: any[]
  }) {}

  private _addModule() {
    var moduleDef = this._moduleDef();
    if (moduleDef) {
      getTestBed().configureModule(moduleDef);
    }
  }

  inject(tokens: any[], fn: Function): () => any {
    return () => {
      this._addModule();
      return inject(tokens, fn)();
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
  declarations?: any[],
  imports?: any[],
  entryComponents?: any[]
}) {
  return new InjectSetupWrapper(moduleDef);
}
