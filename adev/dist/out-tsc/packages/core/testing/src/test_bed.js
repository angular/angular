/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// The formatter and CI disagree on how this import statement should be formatted. Both try to keep
// it on one line, too, which has gotten very hard to read & manage. So disable the formatter for
// this statement only.
import {
  ApplicationRef,
  ɵRender3ComponentFactory as ComponentFactory,
  EnvironmentInjector,
  ɵflushModuleScopingQueueAsMuchAsPossible as flushModuleScopingQueueAsMuchAsPossible,
  ɵgetAsyncClassMetadataFn as getAsyncClassMetadataFn,
  ɵgetUnknownElementStrictMode as getUnknownElementStrictMode,
  ɵgetUnknownPropertyStrictMode as getUnknownPropertyStrictMode,
  Injector,
  NgZone,
  ɵresetCompiledComponents as resetCompiledComponents,
  runInInjectionContext,
  ɵsetAllowDuplicateNgModuleIdsForTest as setAllowDuplicateNgModuleIdsForTest,
  ɵsetUnknownElementStrictMode as setUnknownElementStrictMode,
  ɵsetUnknownPropertyStrictMode as setUnknownPropertyStrictMode,
  ɵstringify as stringify,
  ɵinferTagNameFromDefinition as inferTagNameFromDefinition,
  ɵgetComponentDef as getComponentDef,
} from '../../src/core';
import {ComponentFixture} from './component_fixture';
import {
  ANIMATIONS_ENABLED_DEFAULT,
  ComponentFixtureNoNgZone,
  DEFER_BLOCK_DEFAULT_BEHAVIOR,
  TEARDOWN_TESTING_MODULE_ON_DESTROY_DEFAULT,
  TestComponentRenderer,
  THROW_ON_UNKNOWN_ELEMENTS_DEFAULT,
  THROW_ON_UNKNOWN_PROPERTIES_DEFAULT,
} from './test_bed_common';
import {TestBedCompiler} from './test_bed_compiler';
let _nextRootElementId = 0;
/**
 * Returns a singleton of the `TestBed` class.
 *
 * @publicApi
 */
export function getTestBed() {
  return TestBedImpl.INSTANCE;
}
/**
 * @description
 * Configures and initializes environment for unit testing and provides methods for
 * creating components and services in unit tests.
 *
 * TestBed is the primary api for writing unit tests for Angular applications and libraries.
 */
export class TestBedImpl {
  static _INSTANCE = null;
  static get INSTANCE() {
    return (TestBedImpl._INSTANCE = TestBedImpl._INSTANCE || new TestBedImpl());
  }
  /**
   * Teardown options that have been configured at the environment level.
   * Used as a fallback if no instance-level options have been provided.
   */
  static _environmentTeardownOptions;
  /**
   * "Error on unknown elements" option that has been configured at the environment level.
   * Used as a fallback if no instance-level option has been provided.
   */
  static _environmentErrorOnUnknownElementsOption;
  /**
   * "Error on unknown properties" option that has been configured at the environment level.
   * Used as a fallback if no instance-level option has been provided.
   */
  static _environmentErrorOnUnknownPropertiesOption;
  /**
   * Teardown options that have been configured at the `TestBed` instance level.
   * These options take precedence over the environment-level ones.
   */
  _instanceTeardownOptions;
  /**
   * Defer block behavior option that specifies whether defer blocks will be triggered manually
   * or set to play through.
   */
  _instanceDeferBlockBehavior = DEFER_BLOCK_DEFAULT_BEHAVIOR;
  /**
   * Animations behavior option that specifies whether animations are enabled or disabled.
   */
  _instanceAnimationsEnabled = ANIMATIONS_ENABLED_DEFAULT;
  /**
   * "Error on unknown elements" option that has been configured at the `TestBed` instance level.
   * This option takes precedence over the environment-level one.
   */
  _instanceErrorOnUnknownElementsOption;
  /**
   * "Error on unknown properties" option that has been configured at the `TestBed` instance level.
   * This option takes precedence over the environment-level one.
   */
  _instanceErrorOnUnknownPropertiesOption;
  /**
   * Stores the previous "Error on unknown elements" option value,
   * allowing to restore it in the reset testing module logic.
   */
  _previousErrorOnUnknownElementsOption;
  /**
   * Stores the previous "Error on unknown properties" option value,
   * allowing to restore it in the reset testing module logic.
   */
  _previousErrorOnUnknownPropertiesOption;
  /**
   * Stores the value for `inferTagName` from the testing module.
   */
  _instanceInferTagName;
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
  static initTestEnvironment(ngModule, platform, options) {
    const testBed = TestBedImpl.INSTANCE;
    testBed.initTestEnvironment(ngModule, platform, options);
    return testBed;
  }
  /**
   * Reset the providers for the test injector.
   *
   * @publicApi
   */
  static resetTestEnvironment() {
    TestBedImpl.INSTANCE.resetTestEnvironment();
  }
  static configureCompiler(config) {
    return TestBedImpl.INSTANCE.configureCompiler(config);
  }
  /**
   * Allows overriding default providers, directives, pipes, modules of the test injector,
   * which are defined in test_injector.js
   */
  static configureTestingModule(moduleDef) {
    return TestBedImpl.INSTANCE.configureTestingModule(moduleDef);
  }
  /**
   * Compile components with a `templateUrl` for the test's NgModule.
   * It is necessary to call this function
   * as fetching urls is asynchronous.
   */
  static compileComponents() {
    return TestBedImpl.INSTANCE.compileComponents();
  }
  static overrideModule(ngModule, override) {
    return TestBedImpl.INSTANCE.overrideModule(ngModule, override);
  }
  static overrideComponent(component, override) {
    return TestBedImpl.INSTANCE.overrideComponent(component, override);
  }
  static overrideDirective(directive, override) {
    return TestBedImpl.INSTANCE.overrideDirective(directive, override);
  }
  static overridePipe(pipe, override) {
    return TestBedImpl.INSTANCE.overridePipe(pipe, override);
  }
  static overrideTemplate(component, template) {
    return TestBedImpl.INSTANCE.overrideTemplate(component, template);
  }
  /**
   * Overrides the template of the given component, compiling the template
   * in the context of the TestingModule.
   *
   * Note: This works for JIT and AOTed components as well.
   */
  static overrideTemplateUsingTestingModule(component, template) {
    return TestBedImpl.INSTANCE.overrideTemplateUsingTestingModule(component, template);
  }
  static overrideProvider(token, provider) {
    return TestBedImpl.INSTANCE.overrideProvider(token, provider);
  }
  static inject(token, notFoundValue, options) {
    return TestBedImpl.INSTANCE.inject(token, notFoundValue, options);
  }
  /**
   * Runs the given function in the `EnvironmentInjector` context of `TestBed`.
   *
   * @see {@link https://angular.dev/api/core/EnvironmentInjector#runInContext}
   */
  static runInInjectionContext(fn) {
    return TestBedImpl.INSTANCE.runInInjectionContext(fn);
  }
  static createComponent(component, options) {
    return TestBedImpl.INSTANCE.createComponent(component, options);
  }
  static resetTestingModule() {
    return TestBedImpl.INSTANCE.resetTestingModule();
  }
  static execute(tokens, fn, context) {
    return TestBedImpl.INSTANCE.execute(tokens, fn, context);
  }
  static get platform() {
    return TestBedImpl.INSTANCE.platform;
  }
  static get ngModule() {
    return TestBedImpl.INSTANCE.ngModule;
  }
  static flushEffects() {
    return TestBedImpl.INSTANCE.tick();
  }
  static tick() {
    return TestBedImpl.INSTANCE.tick();
  }
  // Properties
  platform = null;
  ngModule = null;
  _compiler = null;
  _testModuleRef = null;
  _activeFixtures = [];
  /**
   * Internal-only flag to indicate whether a module
   * scoping queue has been checked and flushed already.
   * @docs-private
   */
  globalCompilationChecked = false;
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
  initTestEnvironment(ngModule, platform, options) {
    if (this.platform || this.ngModule) {
      throw new Error('Cannot set base providers because it has already been called');
    }
    TestBedImpl._environmentTeardownOptions = options?.teardown;
    TestBedImpl._environmentErrorOnUnknownElementsOption = options?.errorOnUnknownElements;
    TestBedImpl._environmentErrorOnUnknownPropertiesOption = options?.errorOnUnknownProperties;
    this.platform = platform;
    this.ngModule = ngModule;
    this._compiler = new TestBedCompiler(this.platform, this.ngModule);
    // TestBed does not have an API which can reliably detect the start of a test, and thus could be
    // used to track the state of the NgModule registry and reset it correctly. Instead, when we
    // know we're in a testing scenario, we disable the check for duplicate NgModule registration
    // completely.
    setAllowDuplicateNgModuleIdsForTest(true);
  }
  /**
   * Reset the providers for the test injector.
   *
   * @publicApi
   */
  resetTestEnvironment() {
    this.resetTestingModule();
    this._compiler = null;
    this.platform = null;
    this.ngModule = null;
    TestBedImpl._environmentTeardownOptions = undefined;
    setAllowDuplicateNgModuleIdsForTest(false);
  }
  resetTestingModule() {
    this.checkGlobalCompilationFinished();
    resetCompiledComponents();
    if (this._compiler !== null) {
      this.compiler.restoreOriginalState();
    }
    this._compiler = new TestBedCompiler(this.platform, this.ngModule);
    // Restore the previous value of the "error on unknown elements" option
    setUnknownElementStrictMode(
      this._previousErrorOnUnknownElementsOption ?? THROW_ON_UNKNOWN_ELEMENTS_DEFAULT,
    );
    // Restore the previous value of the "error on unknown properties" option
    setUnknownPropertyStrictMode(
      this._previousErrorOnUnknownPropertiesOption ?? THROW_ON_UNKNOWN_PROPERTIES_DEFAULT,
    );
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
        this._instanceErrorOnUnknownElementsOption = undefined;
        this._instanceErrorOnUnknownPropertiesOption = undefined;
        this._instanceInferTagName = undefined;
        this._instanceDeferBlockBehavior = DEFER_BLOCK_DEFAULT_BEHAVIOR;
        this._instanceAnimationsEnabled = ANIMATIONS_ENABLED_DEFAULT;
      }
    }
    return this;
  }
  configureCompiler(config) {
    if (config.useJit != null) {
      throw new Error('JIT compiler is not configurable via TestBed APIs.');
    }
    if (config.providers !== undefined) {
      this.compiler.setCompilerProviders(config.providers);
    }
    return this;
  }
  configureTestingModule(moduleDef) {
    this.assertNotInstantiated('TestBed.configureTestingModule', 'configure the test module');
    // Trigger module scoping queue flush before executing other TestBed operations in a test.
    // This is needed for the first test invocation to ensure that globally declared modules have
    // their components scoped properly. See the `checkGlobalCompilationFinished` function
    // description for additional info.
    this.checkGlobalCompilationFinished();
    // Always re-assign the options, even if they're undefined.
    // This ensures that we don't carry them between tests.
    this._instanceTeardownOptions = moduleDef.teardown;
    this._instanceErrorOnUnknownElementsOption = moduleDef.errorOnUnknownElements;
    this._instanceErrorOnUnknownPropertiesOption = moduleDef.errorOnUnknownProperties;
    this._instanceInferTagName = moduleDef.inferTagName;
    this._instanceDeferBlockBehavior = moduleDef.deferBlockBehavior ?? DEFER_BLOCK_DEFAULT_BEHAVIOR;
    this._instanceAnimationsEnabled = moduleDef.animationsEnabled ?? ANIMATIONS_ENABLED_DEFAULT;
    // Store the current value of the strict mode option,
    // so we can restore it later
    this._previousErrorOnUnknownElementsOption = getUnknownElementStrictMode();
    setUnknownElementStrictMode(this.shouldThrowErrorOnUnknownElements());
    this._previousErrorOnUnknownPropertiesOption = getUnknownPropertyStrictMode();
    setUnknownPropertyStrictMode(this.shouldThrowErrorOnUnknownProperties());
    this.compiler.configureTestingModule(moduleDef);
    return this;
  }
  compileComponents() {
    return this.compiler.compileComponents();
  }
  inject(token, notFoundValue, options) {
    if (token === TestBed) {
      return this;
    }
    const UNDEFINED = {};
    const result = this.testModuleRef.injector.get(token, UNDEFINED, options);
    return result === UNDEFINED
      ? this.compiler.injector.get(token, notFoundValue, options)
      : result;
  }
  runInInjectionContext(fn) {
    return runInInjectionContext(this.inject(EnvironmentInjector), fn);
  }
  execute(tokens, fn, context) {
    const params = tokens.map((t) => this.inject(t));
    return fn.apply(context, params);
  }
  overrideModule(ngModule, override) {
    this.assertNotInstantiated('overrideModule', 'override module metadata');
    this.compiler.overrideModule(ngModule, override);
    return this;
  }
  overrideComponent(component, override) {
    this.assertNotInstantiated('overrideComponent', 'override component metadata');
    this.compiler.overrideComponent(component, override);
    return this;
  }
  overrideTemplateUsingTestingModule(component, template) {
    this.assertNotInstantiated(
      'TestBed.overrideTemplateUsingTestingModule',
      'Cannot override template when the test module has already been instantiated',
    );
    this.compiler.overrideTemplateUsingTestingModule(component, template);
    return this;
  }
  overrideDirective(directive, override) {
    this.assertNotInstantiated('overrideDirective', 'override directive metadata');
    this.compiler.overrideDirective(directive, override);
    return this;
  }
  overridePipe(pipe, override) {
    this.assertNotInstantiated('overridePipe', 'override pipe metadata');
    this.compiler.overridePipe(pipe, override);
    return this;
  }
  /**
   * Overwrites all providers for the given token with the given provider definition.
   */
  overrideProvider(token, provider) {
    this.assertNotInstantiated('overrideProvider', 'override provider');
    this.compiler.overrideProvider(token, provider);
    return this;
  }
  overrideTemplate(component, template) {
    return this.overrideComponent(component, {set: {template, templateUrl: null}});
  }
  createComponent(type, options) {
    if (getAsyncClassMetadataFn(type)) {
      throw new Error(
        `Component '${type.name}' has unresolved metadata. ` +
          `Please call \`await TestBed.compileComponents()\` before running this test.`,
      );
    }
    // Note: injecting the renderer before accessing the definition appears to be load-bearing.
    const testComponentRenderer = this.inject(TestComponentRenderer);
    const shouldInferTagName = options?.inferTagName ?? this._instanceInferTagName ?? false;
    const componentDef = getComponentDef(type);
    const rootElId = `root${_nextRootElementId++}`;
    if (!componentDef) {
      throw new Error(`It looks like '${stringify(type)}' has not been compiled.`);
    }
    testComponentRenderer.insertRootElement(
      rootElId,
      shouldInferTagName ? inferTagNameFromDefinition(componentDef) : undefined,
    );
    const componentFactory = new ComponentFactory(componentDef);
    const initComponent = () => {
      const componentRef = componentFactory.create(
        Injector.NULL,
        [],
        `#${rootElId}`,
        this.testModuleRef,
        undefined,
        options?.bindings,
      );
      return this.runInInjectionContext(() => new ComponentFixture(componentRef));
    };
    const noNgZone = this.inject(ComponentFixtureNoNgZone, false);
    const ngZone = noNgZone ? null : this.inject(NgZone, null);
    const fixture = ngZone ? ngZone.run(initComponent) : initComponent();
    this._activeFixtures.push(fixture);
    return fixture;
  }
  /**
   * @internal strip this from published d.ts files due to
   * https://github.com/microsoft/TypeScript/issues/36216
   */
  get compiler() {
    if (this._compiler === null) {
      throw new Error(`Need to call TestBed.initTestEnvironment() first`);
    }
    return this._compiler;
  }
  /**
   * @internal strip this from published d.ts files due to
   * https://github.com/microsoft/TypeScript/issues/36216
   */
  get testModuleRef() {
    if (this._testModuleRef === null) {
      this._testModuleRef = this.compiler.finalize();
    }
    return this._testModuleRef;
  }
  assertNotInstantiated(methodName, methodDescription) {
    if (this._testModuleRef !== null) {
      throw new Error(
        `Cannot ${methodDescription} when the test module has already been instantiated. ` +
          `Make sure you are not using \`inject\` before \`${methodName}\`.`,
      );
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
  checkGlobalCompilationFinished() {
    // Checking _testNgModuleRef is null should not be necessary, but is left in as an additional
    // guard that compilations queued in tests (after instantiation) are never flushed accidentally.
    if (!this.globalCompilationChecked && this._testModuleRef === null) {
      flushModuleScopingQueueAsMuchAsPossible();
    }
    this.globalCompilationChecked = true;
  }
  destroyActiveFixtures() {
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
        `${errorCount} ${errorCount === 1 ? 'component' : 'components'} ` +
          `threw errors during cleanup`,
      );
    }
  }
  shouldRethrowTeardownErrors() {
    const instanceOptions = this._instanceTeardownOptions;
    const environmentOptions = TestBedImpl._environmentTeardownOptions;
    // If the new teardown behavior hasn't been configured, preserve the old behavior.
    if (!instanceOptions && !environmentOptions) {
      return TEARDOWN_TESTING_MODULE_ON_DESTROY_DEFAULT;
    }
    // Otherwise use the configured behavior or default to rethrowing.
    return (
      instanceOptions?.rethrowErrors ??
      environmentOptions?.rethrowErrors ??
      this.shouldTearDownTestingModule()
    );
  }
  shouldThrowErrorOnUnknownElements() {
    // Check if a configuration has been provided to throw when an unknown element is found
    return (
      this._instanceErrorOnUnknownElementsOption ??
      TestBedImpl._environmentErrorOnUnknownElementsOption ??
      THROW_ON_UNKNOWN_ELEMENTS_DEFAULT
    );
  }
  shouldThrowErrorOnUnknownProperties() {
    // Check if a configuration has been provided to throw when an unknown property is found
    return (
      this._instanceErrorOnUnknownPropertiesOption ??
      TestBedImpl._environmentErrorOnUnknownPropertiesOption ??
      THROW_ON_UNKNOWN_PROPERTIES_DEFAULT
    );
  }
  shouldTearDownTestingModule() {
    return (
      this._instanceTeardownOptions?.destroyAfterEach ??
      TestBedImpl._environmentTeardownOptions?.destroyAfterEach ??
      TEARDOWN_TESTING_MODULE_ON_DESTROY_DEFAULT
    );
  }
  getDeferBlockBehavior() {
    return this._instanceDeferBlockBehavior;
  }
  getAnimationsEnabled() {
    return this._instanceAnimationsEnabled;
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
  /**
   * Execute any pending effects by executing any pending work required to synchronize model to the UI.
   *
   * @deprecated use `TestBed.tick()` instead
   */
  flushEffects() {
    this.tick();
  }
  /**
   * Execute any pending work required to synchronize model to the UI.
   *
   * @publicApi
   */
  tick() {
    const appRef = this.inject(ApplicationRef);
    try {
      // TODO(atscott): ApplicationRef.tick should set includeAllTestViews to true itself rather than doing this here and in ComponentFixture
      // The behavior should be that TestBed.tick, ComponentFixture.detectChanges, and ApplicationRef.tick all result in the test fixtures
      // getting synchronized, regardless of whether they are autoDetect: true.
      // Automatic scheduling (zone or zoneless) will call _tick which will _not_ include fixtures with autoDetect: false
      appRef.includeAllTestViews = true;
      appRef.tick();
    } finally {
      appRef.includeAllTestViews = false;
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
 * @publicApi
 */
export const TestBed = TestBedImpl;
/**
 * Allows injecting dependencies in `beforeEach()` and `it()`. Note: this function
 * (imported from the `@angular/core/testing` package) can **only** be used to inject dependencies
 * in tests. To inject dependencies in your application code, use the [`inject`](api/core/inject)
 * function from the `@angular/core` package instead.
 *
 * Example:
 *
 * ```ts
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
export function inject(tokens, fn) {
  const testBed = TestBedImpl.INSTANCE;
  // Not using an arrow function to preserve context passed from call site
  return function () {
    return testBed.execute(tokens, fn, this);
  };
}
/**
 * @publicApi
 */
export class InjectSetupWrapper {
  _moduleDef;
  constructor(_moduleDef) {
    this._moduleDef = _moduleDef;
  }
  _addModule() {
    const moduleDef = this._moduleDef();
    if (moduleDef) {
      TestBedImpl.configureTestingModule(moduleDef);
    }
  }
  inject(tokens, fn) {
    const self = this;
    // Not using an arrow function to preserve context passed from call site
    return function () {
      self._addModule();
      return inject(tokens, fn).call(this);
    };
  }
}
export function withModule(moduleDef, fn) {
  if (fn) {
    // Not using an arrow function to preserve context passed from call site
    return function () {
      const testBed = TestBedImpl.INSTANCE;
      if (moduleDef) {
        testBed.configureTestingModule(moduleDef);
      }
      return fn.apply(this);
    };
  }
  return new InjectSetupWrapper(() => moduleDef);
}
//# sourceMappingURL=test_bed.js.map
