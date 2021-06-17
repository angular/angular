/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// The formatter and CI disagree on how this import statement should be formatted. Both try to keep
// it on one line, too, which has gotten very hard to read & manage. So disable the formatter for
// this statement only.

/* clang-format off */
import {
  Component,
  Directive,
  InjectFlags,
  InjectionToken,
  Injector,
  NgModule,
  NgZone,
  Pipe,
  PlatformRef,
  ProviderToken,
  Type,
  ɵflushModuleScopingQueueAsMuchAsPossible as flushModuleScopingQueueAsMuchAsPossible,
  ɵRender3ComponentFactory as ComponentFactory,
  ɵRender3NgModuleRef as NgModuleRef,
  ɵresetCompiledComponents as resetCompiledComponents,
  ɵstringify as stringify,
} from '@angular/core';

/* clang-format on */

import {ComponentFixture} from './component_fixture';
import {MetadataOverride} from './metadata_override';
import {R3TestBedCompiler} from './r3_test_bed_compiler';
import {TestBed} from './test_bed';
import {ComponentFixtureAutoDetect, ComponentFixtureNoNgZone, ModuleTeardownOptions, TEARDOWN_TESTING_MODULE_ON_DESTROY_DEFAULT, TestBedStatic, TestComponentRenderer, TestEnvironmentOptions, TestModuleMetadata} from './test_bed_common';

let _nextRootElementId = 0;


/**
 * @description
 * Configures and initializes environment for unit testing and provides methods for
 * creating components and services in unit tests.
 *
 * TestBed is the primary api for writing unit tests for Angular applications and libraries.
 *
 * Note: Use `TestBed` in tests. It will be set to either `TestBedViewEngine` or `TestBedRender3`
 * according to the compiler used.
 */
export class TestBedRender3 implements TestBed {
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
   *
   * @publicApi
   */
  static initTestEnvironment(
      ngModule: Type<any>|Type<any>[], platform: PlatformRef,
      summariesOrOptions?: TestEnvironmentOptions|(() => any[])): TestBed {
    const testBed = _getTestBedRender3();
    testBed.initTestEnvironment(ngModule, platform, summariesOrOptions);
    return testBed;
  }

  /**
   * Reset the providers for the test injector.
   *
   * @publicApi
   */
  static resetTestEnvironment(): void {
    _getTestBedRender3().resetTestEnvironment();
  }

  static configureCompiler(config: {providers?: any[]; useJit?: boolean;}): TestBedStatic {
    _getTestBedRender3().configureCompiler(config);
    return TestBedRender3 as any as TestBedStatic;
  }

  /**
   * Allows overriding default providers, directives, pipes, modules of the test injector,
   * which are defined in test_injector.js
   */
  static configureTestingModule(moduleDef: TestModuleMetadata): TestBedStatic {
    _getTestBedRender3().configureTestingModule(moduleDef);
    return TestBedRender3 as any as TestBedStatic;
  }

  /**
   * Compile components with a `templateUrl` for the test's NgModule.
   * It is necessary to call this function
   * as fetching urls is asynchronous.
   */
  static compileComponents(): Promise<any> {
    return _getTestBedRender3().compileComponents();
  }

  static overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): TestBedStatic {
    _getTestBedRender3().overrideModule(ngModule, override);
    return TestBedRender3 as any as TestBedStatic;
  }

  static overrideComponent(component: Type<any>, override: MetadataOverride<Component>):
      TestBedStatic {
    _getTestBedRender3().overrideComponent(component, override);
    return TestBedRender3 as any as TestBedStatic;
  }

  static overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>):
      TestBedStatic {
    _getTestBedRender3().overrideDirective(directive, override);
    return TestBedRender3 as any as TestBedStatic;
  }

  static overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): TestBedStatic {
    _getTestBedRender3().overridePipe(pipe, override);
    return TestBedRender3 as any as TestBedStatic;
  }

  static overrideTemplate(component: Type<any>, template: string): TestBedStatic {
    _getTestBedRender3().overrideComponent(component, {set: {template, templateUrl: null!}});
    return TestBedRender3 as any as TestBedStatic;
  }

  /**
   * Overrides the template of the given component, compiling the template
   * in the context of the TestingModule.
   *
   * Note: This works for JIT and AOTed components as well.
   */
  static overrideTemplateUsingTestingModule(component: Type<any>, template: string): TestBedStatic {
    _getTestBedRender3().overrideTemplateUsingTestingModule(component, template);
    return TestBedRender3 as any as TestBedStatic;
  }

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
    _getTestBedRender3().overrideProvider(token, provider);
    return TestBedRender3 as any as TestBedStatic;
  }

  static inject<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): T;
  static inject<T>(token: ProviderToken<T>, notFoundValue: null, flags?: InjectFlags): T|null;
  static inject<T>(token: ProviderToken<T>, notFoundValue?: T|null, flags?: InjectFlags): T|null {
    return _getTestBedRender3().inject(token, notFoundValue, flags);
  }

  /** @deprecated from v9.0.0 use TestBed.inject */
  static get<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): any;
  /** @deprecated from v9.0.0 use TestBed.inject */
  static get(token: any, notFoundValue?: any): any;
  /** @deprecated from v9.0.0 use TestBed.inject */
  static get(
      token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND,
      flags: InjectFlags = InjectFlags.Default): any {
    return _getTestBedRender3().inject(token, notFoundValue, flags);
  }

  static createComponent<T>(component: Type<T>): ComponentFixture<T> {
    return _getTestBedRender3().createComponent(component);
  }

  static resetTestingModule(): TestBedStatic {
    _getTestBedRender3().resetTestingModule();
    return TestBedRender3 as any as TestBedStatic;
  }

  static shouldTearDownTestingModule(): boolean {
    return _getTestBedRender3().shouldTearDownTestingModule();
  }

  static tearDownTestingModule(): void {
    _getTestBedRender3().tearDownTestingModule();
  }

  // Properties

  platform: PlatformRef = null!;
  ngModule: Type<any>|Type<any>[] = null!;

  private _compiler: R3TestBedCompiler|null = null;
  private _testModuleRef: NgModuleRef<any>|null = null;

  private _activeFixtures: ComponentFixture<any>[] = [];
  private _globalCompilationChecked = false;

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
   * @publicApi
   */
  initTestEnvironment(ngModule: Type<any>|Type<any>[], platform: PlatformRef, summariesOrOptions?: {
    teardown?: ModuleTeardownOptions
  }|(() => any[])): void {
    if (this.platform || this.ngModule) {
      throw new Error('Cannot set base providers because it has already been called');
    }

    // If `summariesOrOptions` is a function, it means that it's
    // an AOT summaries factory which Ivy doesn't support.
    TestBedRender3._environmentTeardownOptions =
        typeof summariesOrOptions === 'function' ? undefined : summariesOrOptions?.teardown;

    this.platform = platform;
    this.ngModule = ngModule;
    this._compiler = new R3TestBedCompiler(this.platform, this.ngModule);
  }

  /**
   * Reset the providers for the test injector.
   *
   * @publicApi
   */
  resetTestEnvironment(): void {
    this.resetTestingModule();
    this._compiler = null;
    this.platform = null!;
    this.ngModule = null!;
    TestBedRender3._environmentTeardownOptions = undefined;
  }

  resetTestingModule(): void {
    this.checkGlobalCompilationFinished();
    resetCompiledComponents();
    if (this._compiler !== null) {
      this.compiler.restoreOriginalState();
    }
    this._compiler = new R3TestBedCompiler(this.platform, this.ngModule);

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
        this._testModuleRef = null;
        this._instanceTeardownOptions = undefined;
      }
    }
  }

  configureCompiler(config: {providers?: any[]; useJit?: boolean;}): void {
    if (config.useJit != null) {
      throw new Error('the Render3 compiler JiT mode is not configurable !');
    }

    if (config.providers !== undefined) {
      this.compiler.setCompilerProviders(config.providers);
    }
  }

  configureTestingModule(moduleDef: TestModuleMetadata): void {
    this.assertNotInstantiated('R3TestBed.configureTestingModule', 'configure the test module');
    // Always re-assign the teardown options, even if they're undefined.
    // This ensures that we don't carry the options between tests.
    this._instanceTeardownOptions = moduleDef.teardown;
    this.compiler.configureTestingModule(moduleDef);
  }

  compileComponents(): Promise<any> {
    return this.compiler.compileComponents();
  }

  inject<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): T;
  inject<T>(token: ProviderToken<T>, notFoundValue: null, flags?: InjectFlags): T|null;
  inject<T>(token: ProviderToken<T>, notFoundValue?: T|null, flags?: InjectFlags): T|null {
    if (token as unknown === TestBedRender3) {
      return this as any;
    }
    const UNDEFINED = {};
    const result = this.testModuleRef.injector.get(token, UNDEFINED, flags);
    return result === UNDEFINED ? this.compiler.injector.get(token, notFoundValue, flags) as any :
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
    const params = tokens.map(t => this.inject(t));
    return fn.apply(context, params);
  }

  overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): void {
    this.assertNotInstantiated('overrideModule', 'override module metadata');
    this.compiler.overrideModule(ngModule, override);
  }

  overrideComponent(component: Type<any>, override: MetadataOverride<Component>): void {
    this.assertNotInstantiated('overrideComponent', 'override component metadata');
    this.compiler.overrideComponent(component, override);
  }

  overrideTemplateUsingTestingModule(component: Type<any>, template: string): void {
    this.assertNotInstantiated(
        'R3TestBed.overrideTemplateUsingTestingModule',
        'Cannot override template when the test module has already been instantiated');
    this.compiler.overrideTemplateUsingTestingModule(component, template);
  }

  overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>): void {
    this.assertNotInstantiated('overrideDirective', 'override directive metadata');
    this.compiler.overrideDirective(directive, override);
  }

  overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): void {
    this.assertNotInstantiated('overridePipe', 'override pipe metadata');
    this.compiler.overridePipe(pipe, override);
  }

  /**
   * Overwrites all providers for the given token with the given provider definition.
   */
  overrideProvider(token: any, provider: {useFactory?: Function, useValue?: any, deps?: any[]}):
      void {
    this.assertNotInstantiated('overrideProvider', 'override provider');
    this.compiler.overrideProvider(token, provider);
  }

  createComponent<T>(type: Type<T>): ComponentFixture<T> {
    const testComponentRenderer = this.inject(TestComponentRenderer);
    const rootElId = `root${_nextRootElementId++}`;
    testComponentRenderer.insertRootElement(rootElId);

    const componentDef = (type as any).ɵcmp;

    if (!componentDef) {
      throw new Error(
          `It looks like '${stringify(type)}' has not been IVY compiled - it has no 'ɵcmp' field`);
    }

    // TODO: Don't cast as `InjectionToken<boolean>`, proper type is boolean[]
    const noNgZone = this.inject(ComponentFixtureNoNgZone as InjectionToken<boolean>, false);
    // TODO: Don't cast as `InjectionToken<boolean>`, proper type is boolean[]
    const autoDetect: boolean =
        this.inject(ComponentFixtureAutoDetect as InjectionToken<boolean>, false);
    const ngZone: NgZone|null = noNgZone ? null : this.inject(NgZone, null);
    const componentFactory = new ComponentFactory(componentDef);
    const initComponent = () => {
      const componentRef =
          componentFactory.create(Injector.NULL, [], `#${rootElId}`, this.testModuleRef);
      return new ComponentFixture<any>(componentRef, ngZone, autoDetect);
    };
    const fixture = ngZone ? ngZone.run(initComponent) : initComponent();
    this._activeFixtures.push(fixture);
    return fixture;
  }

  /**
   * @internal strip this from published d.ts files due to
   * https://github.com/microsoft/TypeScript/issues/36216
   */
  private get compiler(): R3TestBedCompiler {
    if (this._compiler === null) {
      throw new Error(`Need to call TestBed.initTestEnvironment() first`);
    }
    return this._compiler;
  }

  /**
   * @internal strip this from published d.ts files due to
   * https://github.com/microsoft/TypeScript/issues/36216
   */
  private get testModuleRef(): NgModuleRef<any> {
    if (this._testModuleRef === null) {
      this._testModuleRef = this.compiler.finalize();
    }
    return this._testModuleRef;
  }

  private assertNotInstantiated(methodName: string, methodDescription: string) {
    if (this._testModuleRef !== null) {
      throw new Error(
          `Cannot ${methodDescription} when the test module has already been instantiated. ` +
          `Make sure you are not using \`inject\` before \`${methodName}\`.`);
    }
  }

  /**
   * Check whether the module scoping queue should be flushed, and flush it if needed.
   *
   * When the TestBed is reset, it clears the JIT module compilation queue, cancelling any
   * in-progress module compilation. This creates a potential hazard - the very first time the
   * TestBed is initialized (or if it's reset without being initialized), there may be pending
   * compilations of modules declared in global scope. These compilations should be finished.
   *
   * To ensure that globally declared modules have their components scoped properly, this function
   * is called whenever TestBed is initialized or reset. The _first_ time that this happens, prior
   * to any other operations, the scoping queue is flushed.
   */
  private checkGlobalCompilationFinished(): void {
    // Checking _testNgModuleRef is null should not be necessary, but is left in as an additional
    // guard that compilations queued in tests (after instantiation) are never flushed accidentally.
    if (!this._globalCompilationChecked && this._testModuleRef === null) {
      flushModuleScopingQueueAsMuchAsPossible();
    }
    this._globalCompilationChecked = true;
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
    const environmentOptions = TestBedRender3._environmentTeardownOptions;

    // If the new teardown behavior hasn't been configured, preserve the old behavior.
    if (!instanceOptions && !environmentOptions) {
      return false;
    }

    // Otherwise use the configured behavior or default to rethrowing.
    return instanceOptions?.rethrowErrors ?? environmentOptions?.rethrowErrors ?? true;
  }

  shouldTearDownTestingModule(): boolean {
    return this._instanceTeardownOptions?.destroyAfterEach ??
        TestBedRender3._environmentTeardownOptions?.destroyAfterEach ??
        TEARDOWN_TESTING_MODULE_ON_DESTROY_DEFAULT;
  }

  tearDownTestingModule() {
    // If the module ref has already been destroyed, we won't be able to get a test renderer.
    if (this._testModuleRef === null) {
      return;
    }
    // Resolve the renderer ahead of time, because we want to remove the root elements as the very
    // last step, but the injector will be destroyed as a part of the module ref destruction.
    const testRenderer = this.inject(TestComponentRenderer);
    try {
      this._testModuleRef.destroy();
    } catch (e) {
      if (this.shouldRethrowTeardownErrors()) {
        throw e;
      } else {
        console.error('Error during cleanup of a testing module', {
          component: this._testModuleRef.instance,
          stacktrace: e,
        });
      }
    } finally {
      testRenderer.removeAllRootElements?.();
    }
  }
}

let testBed: TestBedRender3;

export function _getTestBedRender3(): TestBedRender3 {
  return testBed = testBed || new TestBedRender3();
}
