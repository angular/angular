/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationInitStatus, CompilerOptions, Component, Directive, InjectFlags, InjectionToken, Injector, NgModule, NgModuleFactory, NgModuleRef, NgZone, Optional, Pipe, PlatformRef, Provider, ProviderToken, SchemaMetadata, SkipSelf, StaticProvider, Type, ɵclearOverrides as clearOverrides, ɵDepFlags as DepFlags, ɵgetInjectableDef as getInjectableDef, ɵINJECTOR_SCOPE as INJECTOR_SCOPE, ɵivyEnabled as ivyEnabled, ɵNodeFlags as NodeFlags, ɵoverrideComponentView as overrideComponentView, ɵoverrideProvider as overrideProvider, ɵstringify as stringify, ɵɵInjectableDeclaration} from '@angular/core';

import {ComponentFixture} from './component_fixture';
import {MetadataOverride} from './metadata_override';
import {_getTestBedRender3, TestBedRender3} from './r3_test_bed';
import {ComponentFixtureAutoDetect, ComponentFixtureNoNgZone, ModuleTeardownOptions, TEARDOWN_TESTING_MODULE_ON_DESTROY_DEFAULT, TestBedStatic, TestComponentRenderer, TestEnvironmentOptions, TestModuleMetadata} from './test_bed_common';
import {TestingCompiler, TestingCompilerFactory} from './test_compiler';


let _nextRootElementId = 0;

/**
 * @publicApi
 */
export interface TestBed {
  platform: PlatformRef;

  ngModule: Type<any>|Type<any>[];

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
   */
  initTestEnvironment(
      ngModule: Type<any>|Type<any>[], platform: PlatformRef,
      options?: TestEnvironmentOptions): void;
  initTestEnvironment(
      ngModule: Type<any>|Type<any>[], platform: PlatformRef, aotSummaries?: () => any[]): void;

  /**
   * Reset the providers for the test injector.
   */
  resetTestEnvironment(): void;

  resetTestingModule(): void;

  configureCompiler(config: {providers?: any[], useJit?: boolean}): void;

  configureTestingModule(moduleDef: TestModuleMetadata): void;

  compileComponents(): Promise<any>;

  inject<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): T;
  inject<T>(token: ProviderToken<T>, notFoundValue: null, flags?: InjectFlags): T|null;

  /** @deprecated from v9.0.0 use TestBed.inject */
  get<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): any;
  /** @deprecated from v9.0.0 use TestBed.inject */
  get(token: any, notFoundValue?: any): any;

  execute(tokens: any[], fn: Function, context?: any): any;

  overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): void;

  overrideComponent(component: Type<any>, override: MetadataOverride<Component>): void;

  overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>): void;

  overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): void;

  /**
   * Overwrites all providers for the given token with the given provider definition.
   */
  overrideProvider(token: any, provider: {
    useFactory: Function,
    deps: any[],
  }): void;
  overrideProvider(token: any, provider: {useValue: any;}): void;
  overrideProvider(token: any, provider: {useFactory?: Function, useValue?: any, deps?: any[]}):
      void;

  overrideTemplateUsingTestingModule(component: Type<any>, template: string): void;

  createComponent<T>(component: Type<T>): ComponentFixture<T>;
}

/**
 * @description
 * Configures and initializes environment for unit testing and provides methods for
 * creating components and services in unit tests.
 *
 * `TestBed` is the primary api for writing unit tests for Angular applications and libraries.
 *
 * Note: Use `TestBed` in tests. It will be set to either `TestBedViewEngine` or `TestBedRender3`
 * according to the compiler used.
 */
export class TestBedViewEngine implements TestBed {
  /**
   * Teardown options that have been configured at the environment level.
   * Used as a fallback if no instance-level options have been provided.
   */
  private static _environmentTeardownOptions: ModuleTeardownOptions|undefined;

  /**
   * Teardown options that have been configured at the `TestBed` instance level.
   * These options take precedence over the environemnt-level ones.
   */
  private _instanceTeardownOptions: ModuleTeardownOptions|undefined;

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
   */
  static initTestEnvironment(
      ngModule: Type<any>|Type<any>[], platform: PlatformRef,
      summariesOrOptions?: TestEnvironmentOptions|(() => any[])): TestBedViewEngine {
    const testBed = _getTestBedViewEngine();
    testBed.initTestEnvironment(ngModule, platform, summariesOrOptions);
    return testBed;
  }

  /**
   * Reset the providers for the test injector.
   */
  static resetTestEnvironment(): void {
    _getTestBedViewEngine().resetTestEnvironment();
  }

  static resetTestingModule(): TestBedStatic {
    _getTestBedViewEngine().resetTestingModule();
    return TestBedViewEngine as any as TestBedStatic;
  }

  /**
   * Allows overriding default compiler providers and settings
   * which are defined in test_injector.js
   */
  static configureCompiler(config: {providers?: any[]; useJit?: boolean;}): TestBedStatic {
    _getTestBedViewEngine().configureCompiler(config);
    return TestBedViewEngine as any as TestBedStatic;
  }

  /**
   * Allows overriding default providers, directives, pipes, modules of the test injector,
   * which are defined in test_injector.js
   */
  static configureTestingModule(moduleDef: TestModuleMetadata): TestBedStatic {
    _getTestBedViewEngine().configureTestingModule(moduleDef);
    return TestBedViewEngine as any as TestBedStatic;
  }

  /**
   * Compile components with a `templateUrl` for the test's NgModule.
   * It is necessary to call this function
   * as fetching urls is asynchronous.
   */
  static compileComponents(): Promise<any> {
    return getTestBed().compileComponents();
  }

  static overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): TestBedStatic {
    _getTestBedViewEngine().overrideModule(ngModule, override);
    return TestBedViewEngine as any as TestBedStatic;
  }

  static overrideComponent(component: Type<any>, override: MetadataOverride<Component>):
      TestBedStatic {
    _getTestBedViewEngine().overrideComponent(component, override);
    return TestBedViewEngine as any as TestBedStatic;
  }

  static overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>):
      TestBedStatic {
    _getTestBedViewEngine().overrideDirective(directive, override);
    return TestBedViewEngine as any as TestBedStatic;
  }

  static overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): TestBedStatic {
    _getTestBedViewEngine().overridePipe(pipe, override);
    return TestBedViewEngine as any as TestBedStatic;
  }

  static overrideTemplate(component: Type<any>, template: string): TestBedStatic {
    _getTestBedViewEngine().overrideComponent(component, {set: {template, templateUrl: null!}});
    return TestBedViewEngine as any as TestBedStatic;
  }

  /**
   * Overrides the template of the given component, compiling the template
   * in the context of the TestingModule.
   *
   * Note: This works for JIT and AOTed components as well.
   */
  static overrideTemplateUsingTestingModule(component: Type<any>, template: string): TestBedStatic {
    _getTestBedViewEngine().overrideTemplateUsingTestingModule(component, template);
    return TestBedViewEngine as any as TestBedStatic;
  }

  /**
   * Overwrites all providers for the given token with the given provider definition.
   *
   * Note: This works for JIT and AOTed components as well.
   */
  static overrideProvider(token: any, provider: {
    useFactory: Function,
    deps: any[],
  }): TestBedStatic;
  static overrideProvider(token: any, provider: {useValue: any;}): TestBedStatic;
  static overrideProvider(token: any, provider: {
    useFactory?: Function,
    useValue?: any,
    deps?: any[],
  }): TestBedStatic {
    _getTestBedViewEngine().overrideProvider(token, provider as any);
    return TestBedViewEngine as any as TestBedStatic;
  }

  static inject<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): T;
  static inject<T>(token: ProviderToken<T>, notFoundValue: null, flags?: InjectFlags): T|null;
  static inject<T>(token: ProviderToken<T>, notFoundValue?: T|null, flags?: InjectFlags): T|null {
    return _getTestBedViewEngine().inject(token, notFoundValue, flags);
  }

  /** @deprecated from v9.0.0 use TestBed.inject */
  static get<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): any;
  /**
   * @deprecated from v9.0.0 use TestBed.inject
   * @suppress {duplicate}
   */
  static get(token: any, notFoundValue?: any): any;
  /** @deprecated from v9.0.0 use TestBed.inject */
  static get(
      token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND,
      flags: InjectFlags = InjectFlags.Default): any {
    return _getTestBedViewEngine().inject(token, notFoundValue, flags);
  }

  static createComponent<T>(component: Type<T>): ComponentFixture<T> {
    return _getTestBedViewEngine().createComponent(component);
  }

  static shouldTearDownTestingModule(): boolean {
    return _getTestBedViewEngine().shouldTearDownTestingModule();
  }

  static tearDownTestingModule(): void {
    _getTestBedViewEngine().tearDownTestingModule();
  }

  private _instantiated: boolean = false;

  private _compiler: TestingCompiler = null!;
  private _moduleRef: NgModuleRef<any>|null = null;
  private _moduleFactory: NgModuleFactory<any>|null = null;
  private _pendingModuleFactory: Type<unknown>|null = null;

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

  private _testEnvAotSummaries: () => any[] = () => [];
  private _aotSummaries: Array<() => any[]> = [];
  private _templateOverrides: Array<{component: Type<any>, templateOf: Type<any>}> = [];

  private _isRoot: boolean = true;
  private _rootProviderOverrides: Provider[] = [];

  platform: PlatformRef = null!;

  ngModule: Type<any>|Type<any>[] = null!;

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
   */
  initTestEnvironment(
      ngModule: Type<any>|Type<any>[], platform: PlatformRef,
      summariesOrOptions?: TestEnvironmentOptions|(() => any[])): void {
    if (this.platform || this.ngModule) {
      throw new Error('Cannot set base providers because it has already been called');
    }
    this.platform = platform;
    this.ngModule = ngModule;
    if (typeof summariesOrOptions === 'function') {
      this._testEnvAotSummaries = summariesOrOptions;
      TestBedViewEngine._environmentTeardownOptions = undefined;
    } else {
      this._testEnvAotSummaries = (summariesOrOptions?.aotSummaries) || (() => []);
      TestBedViewEngine._environmentTeardownOptions = summariesOrOptions?.teardown;
    }
  }

  /**
   * Reset the providers for the test injector.
   */
  resetTestEnvironment(): void {
    this.resetTestingModule();
    this.platform = null!;
    this.ngModule = null!;
    this._testEnvAotSummaries = () => [];
    TestBedViewEngine._environmentTeardownOptions = undefined;
  }

  resetTestingModule(): void {
    clearOverrides();
    this._aotSummaries = [];
    this._templateOverrides = [];
    this._compiler = null!;
    this._moduleOverrides = [];
    this._componentOverrides = [];
    this._directiveOverrides = [];
    this._pipeOverrides = [];

    this._isRoot = true;
    this._rootProviderOverrides = [];

    this._moduleFactory = null;
    this._pendingModuleFactory = null;
    this._compilerOptions = [];
    this._providers = [];
    this._declarations = [];
    this._imports = [];
    this._schemas = [];

    // We have to chain a couple of try/finally blocks, because each step can
    // throw errors and we don't want it to interrupt the next step and we also
    // want an error to be thrown at the end.
    try {
      this.destroyActiveFixtures();
    } finally {
      try {
        if (this.shouldTearDownTestingModule()) {
          this.tearDownTestingModule();
        }
      } finally {
        this._moduleRef = null;
        this._instanceTeardownOptions = undefined;
        this._instantiated = false;
      }
    }
  }

  configureCompiler(config: {providers?: any[], useJit?: boolean}): void {
    this._assertNotInstantiated('TestBed.configureCompiler', 'configure the compiler');
    this._compilerOptions.push(config);
  }

  configureTestingModule(moduleDef: TestModuleMetadata): void {
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
    if (moduleDef.aotSummaries) {
      this._aotSummaries.push(moduleDef.aotSummaries);
    }
    // Always re-assign the teardown options, even if they're undefined.
    // This ensures that we don't carry the options between tests.
    this._instanceTeardownOptions = moduleDef.teardown;
  }

  compileComponents(): Promise<any> {
    if (this._moduleFactory || this._instantiated) {
      return Promise.resolve(null);
    }

    const moduleType = this._createCompilerAndModule();
    this._pendingModuleFactory = moduleType;
    return this._compiler.compileModuleAndAllComponentsAsync(moduleType).then(result => {
      // If the module mismatches by the time the promise resolves, it means that the module has
      // already been destroyed and a new compilation has started. If that's the case, avoid
      // overwriting the module factory, because it can cause downstream errors.
      if (this._pendingModuleFactory === moduleType) {
        this._moduleFactory = result.ngModuleFactory;
        this._pendingModuleFactory = null;
      }
    });
  }

  private _initIfNeeded(): void {
    if (this._instantiated) {
      return;
    }
    if (!this._moduleFactory) {
      try {
        const moduleType = this._createCompilerAndModule();
        this._moduleFactory =
            this._compiler.compileModuleAndAllComponentsSync(moduleType).ngModuleFactory;
      } catch (e) {
        const errorCompType = this._compiler.getComponentFromError(e);
        if (errorCompType) {
          throw new Error(
              `This test module uses the component ${
                  stringify(
                      errorCompType)} which is using a "templateUrl" or "styleUrls", but they were never compiled. ` +
              `Please call "TestBed.compileComponents" before your test.`);
        } else {
          throw e;
        }
      }
    }
    for (const {component, templateOf} of this._templateOverrides) {
      const compFactory = this._compiler.getComponentFactory(templateOf);
      overrideComponentView(component, compFactory);
    }

    const ngZone =
        new NgZone({enableLongStackTrace: true, shouldCoalesceEventChangeDetection: false});
    const providers: StaticProvider[] = [{provide: NgZone, useValue: ngZone}];
    const ngZoneInjector = Injector.create({
      providers: providers,
      parent: this.platform.injector,
      name: this._moduleFactory.moduleType.name
    });
    this._moduleRef = this._moduleFactory.create(ngZoneInjector);
    // ApplicationInitStatus.runInitializers() is marked @internal to core. So casting to any
    // before accessing it.
    (this._moduleRef.injector.get(ApplicationInitStatus) as any).runInitializers();
    this._instantiated = true;
  }

  private _createCompilerAndModule(): Type<any> {
    const providers = this._providers.concat([{provide: TestBed, useValue: this}]);
    const declarations =
        [...this._declarations, ...this._templateOverrides.map(entry => entry.templateOf)];

    const rootScopeImports = [];
    const rootProviderOverrides = this._rootProviderOverrides;
    if (this._isRoot) {
      @NgModule({
        providers: [
          ...rootProviderOverrides,
        ],
        jit: true,
      })
      class RootScopeModule {
      }
      rootScopeImports.push(RootScopeModule);
    }
    providers.push({provide: INJECTOR_SCOPE, useValue: this._isRoot ? 'root' : null});

    const imports = [rootScopeImports, this.ngModule, this._imports];
    const schemas = this._schemas;

    @NgModule({providers, declarations, imports, schemas, jit: true})
    class DynamicTestModule {
    }

    const compilerFactory = this.platform.injector.get(TestingCompilerFactory);
    this._compiler = compilerFactory.createTestingCompiler(this._compilerOptions);
    for (const summary of [this._testEnvAotSummaries, ...this._aotSummaries]) {
      this._compiler.loadAotSummaries(summary);
    }
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

  inject<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): T;
  inject<T>(token: ProviderToken<T>, notFoundValue: null, flags?: InjectFlags): T|null;
  inject<T>(token: ProviderToken<T>, notFoundValue?: T|null, flags?: InjectFlags): T|null {
    this._initIfNeeded();
    if (token as unknown === TestBed) {
      return this as any;
    }
    // Tests can inject things from the ng module and from the compiler,
    // but the ng module can't inject things from the compiler and vice versa.
    const UNDEFINED = {};
    const result = this._moduleRef!.injector.get(token, UNDEFINED, flags);
    return result === UNDEFINED ? this._compiler.injector.get(token, notFoundValue, flags) as any :
                                  result;
  }

  /** @deprecated from v9.0.0 use TestBed.inject */
  get<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): any;
  /** @deprecated from v9.0.0 use TestBed.inject */
  get(token: any, notFoundValue?: any): any;
  /** @deprecated from v9.0.0 use TestBed.inject */
  get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND,
      flags: InjectFlags = InjectFlags.Default): any {
    return this.inject(token, notFoundValue, flags);
  }

  execute(tokens: any[], fn: Function, context?: any): any {
    this._initIfNeeded();
    const params = tokens.map(t => this.inject(t));
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
  overrideProvider(token: any, provider: {useFactory?: Function, useValue?: any, deps?: any[]}):
      void {
    this._assertNotInstantiated('overrideProvider', 'override provider');
    this.overrideProviderImpl(token, provider);
  }

  private overrideProviderImpl(
      token: any, provider: {
        useFactory?: Function,
        useValue?: any,
        deps?: any[],
      },
      deprecated = false): void {
    let def: ɵɵInjectableDeclaration<any>|null = null;
    if (typeof token !== 'string' && (def = getInjectableDef(token)) && def.providedIn === 'root') {
      if (provider.useFactory) {
        this._rootProviderOverrides.push(
            {provide: token, useFactory: provider.useFactory, deps: provider.deps || []});
      } else {
        this._rootProviderOverrides.push({provide: token, useValue: provider.useValue});
      }
    }
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
    overrideProvider({token, flags, deps, value, deprecatedBehavior: deprecated});
  }

  overrideTemplateUsingTestingModule(component: Type<any>, template: string) {
    this._assertNotInstantiated('overrideTemplateUsingTestingModule', 'override template');

    @Component({selector: 'empty', template, jit: true})
    class OverrideComponent {
    }

    this._templateOverrides.push({component, templateOf: OverrideComponent});
  }

  createComponent<T>(component: Type<T>): ComponentFixture<T> {
    this._initIfNeeded();
    const componentFactory = this._compiler.getComponentFactory(component);

    if (!componentFactory) {
      throw new Error(`Cannot create the component ${
          stringify(component)} as it was not imported into the testing module!`);
    }

    // TODO: Don't cast as `InjectionToken<boolean>`, declared type is boolean[]
    const noNgZone = this.inject(ComponentFixtureNoNgZone as InjectionToken<boolean>, false);
    // TODO: Don't cast as `InjectionToken<boolean>`, declared type is boolean[]
    const autoDetect: boolean =
        this.inject(ComponentFixtureAutoDetect as InjectionToken<boolean>, false);
    const ngZone: NgZone|null = noNgZone ? null : this.inject(NgZone, null);
    const testComponentRenderer: TestComponentRenderer = this.inject(TestComponentRenderer);
    const rootElId = `root${_nextRootElementId++}`;
    testComponentRenderer.insertRootElement(rootElId);

    const initComponent = () => {
      const componentRef =
          componentFactory.create(Injector.NULL, [], `#${rootElId}`, this._moduleRef!);
      return new ComponentFixture<T>(componentRef, ngZone, autoDetect);
    };

    const fixture = !ngZone ? initComponent() : ngZone.run(initComponent);
    this._activeFixtures.push(fixture);
    return fixture;
  }

  private destroyActiveFixtures(): void {
    let errorCount = 0;
    this._activeFixtures.forEach((fixture) => {
      try {
        fixture.destroy();
      } catch (e) {
        errorCount++;
        console.error('Error during cleanup of component', {
          component: fixture.componentInstance,
          stacktrace: e,
        });
      }
    });
    this._activeFixtures = [];

    if (errorCount > 0 && this.shouldRethrowTeardownErrors()) {
      throw Error(
          `${errorCount} ${(errorCount === 1 ? 'component' : 'components')} ` +
          `threw errors during cleanup`);
    }
  }

  private shouldRethrowTeardownErrors() {
    const instanceOptions = this._instanceTeardownOptions;
    const environmentOptions = TestBedViewEngine._environmentTeardownOptions;

    // If the new teardown behavior hasn't been configured, preserve the old behavior.
    if (!instanceOptions && !environmentOptions) {
      return false;
    }

    // Otherwise use the configured behavior or default to rethrowing.
    return instanceOptions?.rethrowErrors ?? environmentOptions?.rethrowErrors ?? true;
  }

  shouldTearDownTestingModule(): boolean {
    return this._instanceTeardownOptions?.destroyAfterEach ??
        TestBedViewEngine._environmentTeardownOptions?.destroyAfterEach ??
        TEARDOWN_TESTING_MODULE_ON_DESTROY_DEFAULT;
  }

  tearDownTestingModule() {
    // If the module ref has already been destroyed, we won't be able to get a test renderer.
    if (this._moduleRef === null) {
      return;
    }

    // Resolve the renderer ahead of time, because we want to remove the root elements as the very
    // last step, but the injector will be destroyed as a part of the module ref destruction.
    const testRenderer = this.inject(TestComponentRenderer);
    try {
      this._moduleRef.destroy();
    } catch (e) {
      if (this._instanceTeardownOptions?.rethrowErrors ??
          TestBedViewEngine._environmentTeardownOptions?.rethrowErrors ?? true) {
        throw e;
      } else {
        console.error('Error during cleanup of a testing module', {
          component: this._moduleRef.instance,
          stacktrace: e,
        });
      }
    } finally {
      testRenderer?.removeAllRootElements?.();
    }
  }
}

/**
 * @description
 * Configures and initializes environment for unit testing and provides methods for
 * creating components and services in unit tests.
 *
 * `TestBed` is the primary api for writing unit tests for Angular applications and libraries.
 *
 * Note: Use `TestBed` in tests. It will be set to either `TestBedViewEngine` or `TestBedRender3`
 * according to the compiler used.
 *
 * @publicApi
 */
export const TestBed: TestBedStatic =
    ivyEnabled ? TestBedRender3 as any as TestBedStatic : TestBedViewEngine as any as TestBedStatic;

/**
 * Returns a singleton of the applicable `TestBed`.
 *
 * It will be either an instance of `TestBedViewEngine` or `TestBedRender3`.
 *
 * @publicApi
 */
export const getTestBed: () => TestBed = ivyEnabled ? _getTestBedRender3 : _getTestBedViewEngine;

let testBed: TestBedViewEngine;

function _getTestBedViewEngine(): TestBedViewEngine {
  return testBed = testBed || new TestBedViewEngine();
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
 * @publicApi
 */
export function inject(tokens: any[], fn: Function): () => any {
  const testBed = getTestBed();
  // Not using an arrow function to preserve context passed from call site
  return function(this: unknown) {
    return testBed.execute(tokens, fn, this);
  };
}

/**
 * @publicApi
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
    return function(this: unknown) {
      self._addModule();
      return inject(tokens, fn).call(this);
    };
  }
}

/**
 * @publicApi
 */
export function withModule(moduleDef: TestModuleMetadata): InjectSetupWrapper;
export function withModule(moduleDef: TestModuleMetadata, fn: Function): () => any;
export function withModule(moduleDef: TestModuleMetadata, fn?: Function|null): (() => any)|
    InjectSetupWrapper {
  if (fn) {
    // Not using an arrow function to preserve context passed from call site
    return function(this: unknown) {
      const testBed = getTestBed();
      if (moduleDef) {
        testBed.configureTestingModule(moduleDef);
      }
      return fn.apply(this);
    };
  }
  return new InjectSetupWrapper(() => moduleDef);
}
