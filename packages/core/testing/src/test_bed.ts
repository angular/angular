/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerOptions, Component, Directive, InjectionToken, Injector, ModuleWithComponentFactories, NgModule, NgModuleFactory, NgModuleRef, NgZone, Optional, Pipe, PlatformRef, Provider, ReflectiveInjector, SchemaMetadata, SkipSelf, Type, ɵDepFlags as DepFlags, ɵERROR_COMPONENT_TYPE, ɵNodeFlags as NodeFlags, ɵclearProviderOverrides as clearProviderOverrides, ɵoverrideProvider as overrideProvider, ɵstringify as stringify} from '@angular/core';

import {AsyncTestCompleter} from './async_test_completer';
import {ComponentFixture} from './component_fixture';
import {MetadataOverride} from './metadata_override';
import {TestingCompiler, TestingCompilerFactory} from './test_compiler';

const UNDEFINED = new Object();

/**
 * An abstract class for inserting the root test component element in a platform independent way.
 *
 * @experimental
 */
export class TestComponentRenderer {
  insertRootElement(rootElementId: string) {}
}

let _nextRootElementId = 0;

/**
 * @experimental
 */
export const ComponentFixtureAutoDetect =
    new InjectionToken<boolean[]>('ComponentFixtureAutoDetect');

/**
 * @experimental
 */
export const ComponentFixtureNoNgZone = new InjectionToken<boolean[]>('ComponentFixtureNoNgZone');

/**
 * @experimental
 */
export type TestModuleMetadata = {
  providers?: any[],
  declarations?: any[],
  imports?: any[],
  schemas?: Array<SchemaMetadata|any[]>,
};

/**
 * @whatItDoes Configures and initializes environment for unit testing and provides methods for
 * creating components and services in unit tests.
 * @description
 *
 * TestBed is the primary api for writing unit tests for Angular applications and libraries.
 *
 * @stable
 */
export class TestBed implements Injector {
  /**
   * Initialize the environment for testing with a compiler factory, a PlatformRef, and an
   * angular module. These are common to every test in the suite.
   *
   * This may only be called once, to set up the common providers for the current test
   * suite on the current platform. If you absolutely need to change the providers,
   * first use `resetTestEnvironment`.
   *
   * Test modules and platforms for individual platforms are available from
   * '@angular/<platform_name>/testing'.
   *
   * @experimental
   */
  static initTestEnvironment(
      ngModule: Type<any>|Type<any>[], platform: PlatformRef, aotSummaries?: () => any[]): TestBed {
    const testBed = getTestBed();
    testBed.initTestEnvironment(ngModule, platform, aotSummaries);
    return testBed;
  }

  /**
   * Reset the providers for the test injector.
   *
   * @experimental
   */
  static resetTestEnvironment() { getTestBed().resetTestEnvironment(); }

  static resetTestingModule(): typeof TestBed {
    getTestBed().resetTestingModule();
    return TestBed;
  }

  /**
   * Allows overriding default compiler providers and settings
   * which are defined in test_injector.js
   */
  static configureCompiler(config: {providers?: any[]; useJit?: boolean;}): typeof TestBed {
    getTestBed().configureCompiler(config);
    return TestBed;
  }

  /**
   * Allows overriding default providers, directives, pipes, modules of the test injector,
   * which are defined in test_injector.js
   */
  static configureTestingModule(moduleDef: TestModuleMetadata): typeof TestBed {
    getTestBed().configureTestingModule(moduleDef);
    return TestBed;
  }

  /**
   * Compile components with a `templateUrl` for the test's NgModule.
   * It is necessary to call this function
   * as fetching urls is asynchronous.
   */
  static compileComponents(): Promise<any> { return getTestBed().compileComponents(); }

  static overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): typeof TestBed {
    getTestBed().overrideModule(ngModule, override);
    return TestBed;
  }

  static overrideComponent(component: Type<any>, override: MetadataOverride<Component>):
      typeof TestBed {
    getTestBed().overrideComponent(component, override);
    return TestBed;
  }

  static overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>):
      typeof TestBed {
    getTestBed().overrideDirective(directive, override);
    return TestBed;
  }

  static overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): typeof TestBed {
    getTestBed().overridePipe(pipe, override);
    return TestBed;
  }

  static overrideTemplate(component: Type<any>, template: string): typeof TestBed {
    getTestBed().overrideComponent(component, {set: {template, templateUrl: null !}});
    return TestBed;
  }


  /**
   * Overwrites all providers for the given token with the given provider definition.
   */
  static overrideProvider(token: any, provider: {
    useFactory: Function,
    deps: any[],
  }): void;
  static overrideProvider(token: any, provider: {useValue: any;}): void;
  static overrideProvider(token: any, provider: {
    useFactory?: Function,
    useValue?: any,
    deps?: any[],
  }): typeof TestBed {
    getTestBed().overrideProvider(token, provider as any);
    return TestBed;
  }

  static get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND) {
    return getTestBed().get(token, notFoundValue);
  }

  static createComponent<T>(component: Type<T>): ComponentFixture<T> {
    return getTestBed().createComponent(component);
  }

  private _instantiated: boolean = false;

  private _compiler: TestingCompiler = null !;
  private _moduleRef: NgModuleRef<any> = null !;
  private _moduleFactory: NgModuleFactory<any> = null !;

  private _compilerOptions: CompilerOptions[] = [];

  private _moduleOverrides: [Type<any>, MetadataOverride<NgModule>][] = [];
  private _componentOverrides: [Type<any>, MetadataOverride<Component>][] = [];
  private _directiveOverrides: [Type<any>, MetadataOverride<Directive>][] = [];
  private _pipeOverrides: [Type<any>, MetadataOverride<Pipe>][] = [];

  private _providers: Provider[] = [];
  private _declarations: Array<Type<any>|any[]|any> = [];
  private _imports: Array<Type<any>|any[]|any> = [];
  private _schemas: Array<SchemaMetadata|any[]> = [];
  private _activeFixtures: ComponentFixture<any>[] = [];

  private _aotSummaries: () => any[] = () => [];

  platform: PlatformRef = null !;

  ngModule: Type<any>|Type<any>[] = null !;

  /**
   * Initialize the environment for testing with a compiler factory, a PlatformRef, and an
   * angular module. These are common to every test in the suite.
   *
   * This may only be called once, to set up the common providers for the current test
   * suite on the current platform. If you absolutely need to change the providers,
   * first use `resetTestEnvironment`.
   *
   * Test modules and platforms for individual platforms are available from
   * '@angular/<platform_name>/testing'.
   *
   * @experimental
   */
  initTestEnvironment(
      ngModule: Type<any>|Type<any>[], platform: PlatformRef, aotSummaries?: () => any[]) {
    if (this.platform || this.ngModule) {
      throw new Error('Cannot set base providers because it has already been called');
    }
    this.platform = platform;
    this.ngModule = ngModule;
    if (aotSummaries) {
      this._aotSummaries = aotSummaries;
    }
  }

  /**
   * Reset the providers for the test injector.
   *
   * @experimental
   */
  resetTestEnvironment() {
    this.resetTestingModule();
    this.platform = null !;
    this.ngModule = null !;
    this._aotSummaries = () => [];
  }

  resetTestingModule() {
    clearProviderOverrides();
    this._compiler = null !;
    this._moduleOverrides = [];
    this._componentOverrides = [];
    this._directiveOverrides = [];
    this._pipeOverrides = [];

    this._moduleRef = null !;
    this._moduleFactory = null !;
    this._compilerOptions = [];
    this._providers = [];
    this._declarations = [];
    this._imports = [];
    this._schemas = [];
    this._instantiated = false;
    this._activeFixtures.forEach((fixture) => {
      try {
        fixture.destroy();
      } catch (e) {
        console.error('Error during cleanup of component', fixture.componentInstance);
      }
    });
    this._activeFixtures = [];
  }

  configureCompiler(config: {providers?: any[], useJit?: boolean}) {
    this._assertNotInstantiated('TestBed.configureCompiler', 'configure the compiler');
    this._compilerOptions.push(config);
  }

  configureTestingModule(moduleDef: TestModuleMetadata) {
    this._assertNotInstantiated('TestBed.configureTestingModule', 'configure the test module');
    if (moduleDef.providers) {
      this._providers.push(...moduleDef.providers);
    }
    if (moduleDef.declarations) {
      this._declarations.push(...moduleDef.declarations);
    }
    if (moduleDef.imports) {
      this._imports.push(...moduleDef.imports);
    }
    if (moduleDef.schemas) {
      this._schemas.push(...moduleDef.schemas);
    }
  }

  compileComponents(): Promise<any> {
    if (this._moduleFactory || this._instantiated) {
      return Promise.resolve(null);
    }

    const moduleType = this._createCompilerAndModule();
    return this._compiler.compileModuleAndAllComponentsAsync(moduleType)
        .then((moduleAndComponentFactories) => {
          this._moduleFactory = moduleAndComponentFactories.ngModuleFactory;
        });
  }

  private _initIfNeeded() {
    if (this._instantiated) {
      return;
    }
    if (!this._moduleFactory) {
      try {
        const moduleType = this._createCompilerAndModule();
        this._moduleFactory =
            this._compiler.compileModuleAndAllComponentsSync(moduleType).ngModuleFactory;
      } catch (e) {
        if (getComponentType(e)) {
          throw new Error(
              `This test module uses the component ${stringify(getComponentType(e))} which is using a "templateUrl" or "styleUrls", but they were never compiled. ` +
              `Please call "TestBed.compileComponents" before your test.`);
        } else {
          throw e;
        }
      }
    }
    const ngZone = new NgZone({enableLongStackTrace: true});
    const ngZoneInjector = ReflectiveInjector.resolveAndCreate(
        [{provide: NgZone, useValue: ngZone}], this.platform.injector);
    this._moduleRef = this._moduleFactory.create(ngZoneInjector);
    this._instantiated = true;
  }

  private _createCompilerAndModule(): Type<any> {
    const providers = this._providers.concat([{provide: TestBed, useValue: this}]);
    const declarations = this._declarations;
    const imports = [this.ngModule, this._imports];
    const schemas = this._schemas;

    @NgModule({providers, declarations, imports, schemas})
    class DynamicTestModule {
    }

    const compilerFactory: TestingCompilerFactory =
        this.platform.injector.get(TestingCompilerFactory);
    this._compiler =
        compilerFactory.createTestingCompiler(this._compilerOptions.concat([{useDebug: true}]));
    this._compiler.loadAotSummaries(this._aotSummaries);
    this._moduleOverrides.forEach((entry) => this._compiler.overrideModule(entry[0], entry[1]));
    this._componentOverrides.forEach(
        (entry) => this._compiler.overrideComponent(entry[0], entry[1]));
    this._directiveOverrides.forEach(
        (entry) => this._compiler.overrideDirective(entry[0], entry[1]));
    this._pipeOverrides.forEach((entry) => this._compiler.overridePipe(entry[0], entry[1]));
    return DynamicTestModule;
  }

  private _assertNotInstantiated(methodName: string, methodDescription: string) {
    if (this._instantiated) {
      throw new Error(
          `Cannot ${methodDescription} when the test module has already been instantiated. ` +
          `Make sure you are not using \`inject\` before \`${methodName}\`.`);
    }
  }

  get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND) {
    this._initIfNeeded();
    if (token === TestBed) {
      return this;
    }
    // Tests can inject things from the ng module and from the compiler,
    // but the ng module can't inject things from the compiler and vice versa.
    const result = this._moduleRef.injector.get(token, UNDEFINED);
    return result === UNDEFINED ? this._compiler.injector.get(token, notFoundValue) : result;
  }

  execute(tokens: any[], fn: Function, context?: any): any {
    this._initIfNeeded();
    const params = tokens.map(t => this.get(t));
    return fn.apply(context, params);
  }

  overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): void {
    this._assertNotInstantiated('overrideModule', 'override module metadata');
    this._moduleOverrides.push([ngModule, override]);
  }

  overrideComponent(component: Type<any>, override: MetadataOverride<Component>): void {
    this._assertNotInstantiated('overrideComponent', 'override component metadata');
    this._componentOverrides.push([component, override]);
  }

  overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>): void {
    this._assertNotInstantiated('overrideDirective', 'override directive metadata');
    this._directiveOverrides.push([directive, override]);
  }

  overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): void {
    this._assertNotInstantiated('overridePipe', 'override pipe metadata');
    this._pipeOverrides.push([pipe, override]);
  }

  /**
   * Overwrites all providers for the given token with the given provider definition.
   */
  overrideProvider(token: any, provider: {
    useFactory: Function,
    deps: any[],
  }): void;
  overrideProvider(token: any, provider: {useValue: any;}): void;
  overrideProvider(token: any, provider: {
    useFactory?: Function,
    useValue?: any,
    deps?: any[],
  }): void {
    let flags: NodeFlags = 0;
    let value: any;
    if (provider.useFactory) {
      flags |= NodeFlags.TypeFactoryProvider;
      value = provider.useFactory;
    } else {
      flags |= NodeFlags.TypeValueProvider;
      value = provider.useValue;
    }
    const deps = (provider.deps || []).map((dep) => {
      let depFlags: DepFlags = DepFlags.None;
      let depToken: any;
      if (Array.isArray(dep)) {
        dep.forEach((entry: any) => {
          if (entry instanceof Optional) {
            depFlags |= DepFlags.Optional;
          } else if (entry instanceof SkipSelf) {
            depFlags |= DepFlags.SkipSelf;
          } else {
            depToken = entry;
          }
        });
      } else {
        depToken = dep;
      }
      return [depFlags, depToken];
    });
    overrideProvider({token, flags, deps, value});
  }

  createComponent<T>(component: Type<T>): ComponentFixture<T> {
    this._initIfNeeded();
    const componentFactory = this._compiler.getComponentFactory(component);

    if (!componentFactory) {
      throw new Error(
          `Cannot create the component ${stringify(component)} as it was not imported into the testing module!`);
    }

    const noNgZone = this.get(ComponentFixtureNoNgZone, false);
    const autoDetect: boolean = this.get(ComponentFixtureAutoDetect, false);
    const ngZone: NgZone = noNgZone ? null : this.get(NgZone, null);
    const testComponentRenderer: TestComponentRenderer = this.get(TestComponentRenderer);
    const rootElId = `root${_nextRootElementId++}`;
    testComponentRenderer.insertRootElement(rootElId);

    const initComponent = () => {
      const componentRef =
          componentFactory.create(Injector.NULL, [], `#${rootElId}`, this._moduleRef);
      return new ComponentFixture<T>(componentRef, ngZone, autoDetect);
    };

    const fixture = !ngZone ? initComponent() : ngZone.run(initComponent);
    this._activeFixtures.push(fixture);
    return fixture;
  }
}

let _testBed: TestBed = null !;

/**
 * @experimental
 */
export function getTestBed() {
  return _testBed = _testBed || new TestBed();
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
  const testBed = getTestBed();
  if (tokens.indexOf(AsyncTestCompleter) >= 0) {
    // Not using an arrow function to preserve context passed from call site
    return function() {
      // Return an async test method that returns a Promise if AsyncTestCompleter is one of
      // the injected tokens.
      return testBed.compileComponents().then(() => {
        const completer: AsyncTestCompleter = testBed.get(AsyncTestCompleter);
        testBed.execute(tokens, fn, this);
        return completer.promise;
      });
    };
  } else {
    // Not using an arrow function to preserve context passed from call site
    return function() { return testBed.execute(tokens, fn, this); };
  }
}

/**
 * @experimental
 */
export class InjectSetupWrapper {
  constructor(private _moduleDef: () => TestModuleMetadata) {}

  private _addModule() {
    const moduleDef = this._moduleDef();
    if (moduleDef) {
      getTestBed().configureTestingModule(moduleDef);
    }
  }

  inject(tokens: any[], fn: Function): () => any {
    const self = this;
    // Not using an arrow function to preserve context passed from call site
    return function() {
      self._addModule();
      return inject(tokens, fn).call(this);
    };
  }
}

/**
 * @experimental
 */
export function withModule(moduleDef: TestModuleMetadata): InjectSetupWrapper;
export function withModule(moduleDef: TestModuleMetadata, fn: Function): () => any;
export function withModule(moduleDef: TestModuleMetadata, fn?: Function | null): (() => any)|
    InjectSetupWrapper {
  if (fn) {
    // Not using an arrow function to preserve context passed from call site
    return function() {
      const testBed = getTestBed();
      if (moduleDef) {
        testBed.configureTestingModule(moduleDef);
      }
      return fn.apply(this);
    };
  }
  return new InjectSetupWrapper(() => moduleDef);
}

function getComponentType(error: Error): Function {
  return (error as any)[ɵERROR_COMPONENT_TYPE];
}
