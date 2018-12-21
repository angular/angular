/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationInitStatus, Component, Directive, Injector, NgModule, NgZone, Pipe, PlatformRef, Provider, SchemaMetadata, Type, resolveForwardRef, ɵInjectableDef as InjectableDef, ɵNG_COMPONENT_DEF as NG_COMPONENT_DEF, ɵNG_DIRECTIVE_DEF as NG_DIRECTIVE_DEF, ɵNG_INJECTOR_DEF as NG_INJECTOR_DEF, ɵNG_MODULE_DEF as NG_MODULE_DEF, ɵNG_PIPE_DEF as NG_PIPE_DEF, ɵNgModuleDef as NgModuleDef, ɵNgModuleTransitiveScopes as NgModuleTransitiveScopes, ɵNgModuleType as NgModuleType, ɵRender3ComponentFactory as ComponentFactory, ɵRender3NgModuleRef as NgModuleRef, ɵcompileComponent as compileComponent, ɵcompileDirective as compileDirective, ɵcompileNgModuleDefs as compileNgModuleDefs, ɵcompilePipe as compilePipe, ɵgetInjectableDef as getInjectableDef, ɵpatchComponentDefWithScope as patchComponentDefWithScope, ɵresetCompiledComponents as resetCompiledComponents, ɵstringify as stringify} from '@angular/core';

import {ComponentFixture} from './component_fixture';
import {MetadataOverride} from './metadata_override';
import {ComponentResolver, DirectiveResolver, NgModuleResolver, PipeResolver, Resolver} from './resolvers';
import {TestBed} from './test_bed';
import {ComponentFixtureAutoDetect, ComponentFixtureNoNgZone, TestBedStatic, TestComponentRenderer, TestModuleMetadata} from './test_bed_common';

let _nextRootElementId = 0;

const EMPTY_ARRAY: Type<any>[] = [];

// Resolvers for Angular decorators
type Resolvers = {
  module: Resolver<NgModule>,
  component: Resolver<Directive>,
  directive: Resolver<Component>,
  pipe: Resolver<Pipe>,
};

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
export class TestBedRender3 implements Injector, TestBed {
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
      ngModule: Type<any>|Type<any>[], platform: PlatformRef, aotSummaries?: () => any[]): TestBed {
    const testBed = _getTestBedRender3();
    testBed.initTestEnvironment(ngModule, platform, aotSummaries);
    return testBed;
  }

  /**
   * Reset the providers for the test injector.
   *
   * @publicApi
   */
  static resetTestEnvironment(): void { _getTestBedRender3().resetTestEnvironment(); }

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
  static compileComponents(): Promise<any> { return _getTestBedRender3().compileComponents(); }

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
    _getTestBedRender3().overrideComponent(component, {set: {template, templateUrl: null !}});
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

  overrideTemplateUsingTestingModule(component: Type<any>, template: string): void {
    if (this._instantiated) {
      throw new Error(
          'Cannot override template when the test module has already been instantiated');
    }
    this._templateOverrides.set(component, template);
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

  /**
   * Overwrites all providers for the given token with the given provider definition.
   *
   * @deprecated as it makes all NgModules lazy. Introduced only for migrating off of it.
   */
  static deprecatedOverrideProvider(token: any, provider: {
    useFactory: Function,
    deps: any[],
  }): void;
  static deprecatedOverrideProvider(token: any, provider: {useValue: any;}): void;
  static deprecatedOverrideProvider(token: any, provider: {
    useFactory?: Function,
    useValue?: any,
    deps?: any[],
  }): TestBedStatic {
    throw new Error('Render3TestBed.deprecatedOverrideProvider is not implemented');
  }

  static get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND): any {
    return _getTestBedRender3().get(token, notFoundValue);
  }

  static createComponent<T>(component: Type<T>): ComponentFixture<T> {
    return _getTestBedRender3().createComponent(component);
  }

  static resetTestingModule(): TestBedStatic {
    _getTestBedRender3().resetTestingModule();
    return TestBedRender3 as any as TestBedStatic;
  }

  // Properties

  platform: PlatformRef = null !;
  ngModule: Type<any>|Type<any>[] = null !;

  // metadata overrides
  private _moduleOverrides: [Type<any>, MetadataOverride<NgModule>][] = [];
  private _componentOverrides: [Type<any>, MetadataOverride<Component>][] = [];
  private _directiveOverrides: [Type<any>, MetadataOverride<Directive>][] = [];
  private _pipeOverrides: [Type<any>, MetadataOverride<Pipe>][] = [];
  private _providerOverrides: Provider[] = [];
  private _rootProviderOverrides: Provider[] = [];
  private _providerOverridesByToken: Map<any, Provider[]> = new Map();
  private _templateOverrides: Map<Type<any>, string> = new Map();

  // test module configuration
  private _providers: Provider[] = [];
  private _declarations: Array<Type<any>|any[]|any> = [];
  private _imports: Array<Type<any>|any[]|any> = [];
  private _schemas: Array<SchemaMetadata|any[]> = [];

  private _activeFixtures: ComponentFixture<any>[] = [];

  private _moduleRef: NgModuleRef<any> = null !;
  private _testModuleType: NgModuleType<any> = null !;

  private _instantiated: boolean = false;

  // Map that keeps initial version of component/directive/pipe defs in case
  // we compile a Type again, thus overriding respective static fields. This is
  // required to make sure we restore defs to their initial states between test runs
  private _initiaNgDefs: Map<Type<any>, [string, PropertyDescriptor|undefined]> = new Map();

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
  initTestEnvironment(
      ngModule: Type<any>|Type<any>[], platform: PlatformRef, aotSummaries?: () => any[]): void {
    if (this.platform || this.ngModule) {
      throw new Error('Cannot set base providers because it has already been called');
    }
    this.platform = platform;
    this.ngModule = ngModule;
  }

  /**
   * Reset the providers for the test injector.
   *
   * @publicApi
   */
  resetTestEnvironment(): void {
    this.resetTestingModule();
    this.platform = null !;
    this.ngModule = null !;
  }

  resetTestingModule(): void {
    resetCompiledComponents();
    // reset metadata overrides
    this._moduleOverrides = [];
    this._componentOverrides = [];
    this._directiveOverrides = [];
    this._pipeOverrides = [];
    this._providerOverrides = [];
    this._rootProviderOverrides = [];
    this._providerOverridesByToken.clear();
    this._templateOverrides.clear();

    // reset test module config
    this._providers = [];
    this._declarations = [];
    this._imports = [];
    this._schemas = [];
    this._moduleRef = null !;
    this._testModuleType = null !;

    this._instantiated = false;
    this._activeFixtures.forEach((fixture) => {
      try {
        fixture.destroy();
      } catch (e) {
        console.error('Error during cleanup of component', {
          component: fixture.componentInstance,
          stacktrace: e,
        });
      }
    });
    this._activeFixtures = [];

    // restore initial component/directive/pipe defs
    this._initiaNgDefs.forEach((value: [string, PropertyDescriptor], type: Type<any>) => {
      Object.defineProperty(type, value[0], value[1]);
    });
    this._initiaNgDefs.clear();
  }

  configureCompiler(config: {providers?: any[]; useJit?: boolean;}): void {
    if (config.useJit != null) {
      throw new Error('the Render3 compiler JiT mode is not configurable !');
    }

    if (config.providers) {
      this._providerOverrides.push(...config.providers);
    }
  }

  configureTestingModule(moduleDef: TestModuleMetadata): void {
    this._assertNotInstantiated('R3TestBed.configureTestingModule', 'configure the test module');
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
    // assume for now that components don't use templateUrl / stylesUrl to unblock further testing
    // TODO(pk): plug into the ivy's resource fetching pipeline
    return Promise.resolve();
  }

  get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND): any {
    this._initIfNeeded();
    if (token === TestBedRender3) {
      return this;
    }
    return this._moduleRef.injector.get(token, notFoundValue);
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
  overrideProvider(token: any, provider: {useFactory?: Function, useValue?: any, deps?: any[]}):
      void {
    const providerDef = provider.useFactory ?
        {provide: token, useFactory: provider.useFactory, deps: provider.deps || []} :
        {provide: token, useValue: provider.useValue};

    let injectableDef: InjectableDef<any>|null;
    const isRoot =
        (typeof token !== 'string' && (injectableDef = getInjectableDef(token)) &&
         injectableDef.providedIn === 'root');
    const overridesBucket = isRoot ? this._rootProviderOverrides : this._providerOverrides;
    overridesBucket.push(providerDef);

    // keep all overrides grouped by token as well for fast lookups using token
    const overridesForToken = this._providerOverridesByToken.get(token) || [];
    overridesForToken.push(providerDef);
    this._providerOverridesByToken.set(token, overridesForToken);
  }

  /**
   * Overwrites all providers for the given token with the given provider definition.
   *
   * @deprecated as it makes all NgModules lazy. Introduced only for migrating off of it.
   */
  deprecatedOverrideProvider(token: any, provider: {
    useFactory: Function,
    deps: any[],
  }): void;
  deprecatedOverrideProvider(token: any, provider: {useValue: any;}): void;
  deprecatedOverrideProvider(
      token: any, provider: {useFactory?: Function, useValue?: any, deps?: any[]}): void {
    throw new Error('No implemented in IVY');
  }

  createComponent<T>(type: Type<T>): ComponentFixture<T> {
    this._initIfNeeded();

    const testComponentRenderer: TestComponentRenderer = this.get(TestComponentRenderer);
    const rootElId = `root${_nextRootElementId++}`;
    testComponentRenderer.insertRootElement(rootElId);

    const componentDef = (type as any).ngComponentDef;

    if (!componentDef) {
      throw new Error(
          `It looks like '${stringify(type)}' has not been IVY compiled - it has no 'ngComponentDef' field`);
    }

    const noNgZone: boolean = this.get(ComponentFixtureNoNgZone, false);
    const autoDetect: boolean = this.get(ComponentFixtureAutoDetect, false);
    const ngZone: NgZone = noNgZone ? null : this.get(NgZone, null);
    const componentFactory = new ComponentFactory(componentDef);
    const initComponent = () => {
      const componentRef =
          componentFactory.create(Injector.NULL, [], `#${rootElId}`, this._moduleRef);
      return new ComponentFixture<any>(componentRef, ngZone, autoDetect);
    };
    const fixture = ngZone ? ngZone.run(initComponent) : initComponent();
    this._activeFixtures.push(fixture);
    return fixture;
  }

  // internal methods

  private _initIfNeeded(): void {
    if (this._instantiated) {
      return;
    }

    const resolvers = this._getResolvers();
    this._testModuleType = this._createTestModule();
    this._compileNgModule(this._testModuleType, resolvers);

    const parentInjector = this.platform.injector;
    this._moduleRef = new NgModuleRef(this._testModuleType, parentInjector);

    // ApplicationInitStatus.runInitializers() is marked @internal
    // to core. Cast it to any before accessing it.
    (this._moduleRef.injector.get(ApplicationInitStatus) as any).runInitializers();
    this._instantiated = true;
  }

  private _storeNgDef(prop: string, type: Type<any>) {
    if (!this._initiaNgDefs.has(type)) {
      const currentDef = Object.getOwnPropertyDescriptor(type, prop);
      this._initiaNgDefs.set(type, [prop, currentDef]);
    }
  }

  // get overrides for a specific provider (if any)
  private _getProviderOverrides(provider: any) {
    const token = typeof provider === 'object' && provider.hasOwnProperty('provide') ?
        provider.provide :
        provider;
    return this._providerOverridesByToken.get(token) || [];
  }

  // creates resolvers taking overrides into account
  private _getResolvers() {
    const module = new NgModuleResolver();
    module.setOverrides(this._moduleOverrides);

    const component = new ComponentResolver();
    component.setOverrides(this._componentOverrides);

    const directive = new DirectiveResolver();
    directive.setOverrides(this._directiveOverrides);

    const pipe = new PipeResolver();
    pipe.setOverrides(this._pipeOverrides);

    return {module, component, directive, pipe};
  }

  private _assertNotInstantiated(methodName: string, methodDescription: string) {
    if (this._instantiated) {
      throw new Error(
          `Cannot ${methodDescription} when the test module has already been instantiated. ` +
          `Make sure you are not using \`inject\` before \`${methodName}\`.`);
    }
  }

  private _createTestModule(): NgModuleType {
    const rootProviderOverrides = this._rootProviderOverrides;

    @NgModule({
      providers: [...rootProviderOverrides],
      jit: true,
    })
    class RootScopeModule {
    }

    const ngZone = new NgZone({enableLongStackTrace: true});
    const providers =
        [{provide: NgZone, useValue: ngZone}, ...this._providers, ...this._providerOverrides];

    const declarations = this._declarations;
    const imports = [RootScopeModule, this.ngModule, this._imports];
    const schemas = this._schemas;

    @NgModule({providers, declarations, imports, schemas, jit: true})
    class DynamicTestModule {
    }

    return DynamicTestModule as NgModuleType;
  }

  private _getMetaWithOverrides(meta: Component|Directive|NgModule, type?: Type<any>) {
    const overrides: {providers?: any[], template?: string} = {};
    if (meta.providers && meta.providers.length) {
      const providerOverrides =
          flatten(meta.providers, (provider: any) => this._getProviderOverrides(provider));
      if (providerOverrides.length) {
        overrides.providers = [...meta.providers, ...providerOverrides];
      }
    }
    const hasTemplateOverride = !!type && this._templateOverrides.has(type);
    if (hasTemplateOverride) {
      overrides.template = this._templateOverrides.get(type !);
    }
    return Object.keys(overrides).length ? {...meta, ...overrides} : meta;
  }

  private _compileNgModule(moduleType: NgModuleType, resolvers: Resolvers): void {
    const ngModule = resolvers.module.resolve(moduleType);

    if (ngModule === null) {
      throw new Error(`${stringify(moduleType)} has not @NgModule annotation`);
    }

    this._storeNgDef(NG_MODULE_DEF, moduleType);
    this._storeNgDef(NG_INJECTOR_DEF, moduleType);
    const metadata = this._getMetaWithOverrides(ngModule);
    compileNgModuleDefs(moduleType, metadata);

    const declarations: Type<any>[] =
        flatten(ngModule.declarations || EMPTY_ARRAY, resolveForwardRef);
    const compiledComponents: Type<any>[] = [];

    // Compile the components, directives and pipes declared by this module
    declarations.forEach(declaration => {
      const component = resolvers.component.resolve(declaration);
      if (component) {
        this._storeNgDef(NG_COMPONENT_DEF, declaration);
        const metadata = this._getMetaWithOverrides(component, declaration);
        compileComponent(declaration, metadata);
        compiledComponents.push(declaration);
        return;
      }

      const directive = resolvers.directive.resolve(declaration);
      if (directive) {
        this._storeNgDef(NG_DIRECTIVE_DEF, declaration);
        const metadata = this._getMetaWithOverrides(directive);
        compileDirective(declaration, metadata);
        return;
      }

      const pipe = resolvers.pipe.resolve(declaration);
      if (pipe) {
        this._storeNgDef(NG_PIPE_DEF, declaration);
        compilePipe(declaration, pipe);
        return;
      }
    });

    // Compile transitive modules, components, directives and pipes
    const transitiveScope = this._transitiveScopesFor(moduleType, resolvers);
    compiledComponents.forEach(cmp => {
      const scope = this._templateOverrides.has(cmp) ?
          // if we have template override via `TestBed.overrideTemplateUsingTestingModule` -
          // define Component scope as TestingModule scope, instead of the scope of NgModule
          // where this Component was declared
          this._transitiveScopesFor(this._testModuleType, resolvers) :
          transitiveScope;
      patchComponentDefWithScope((cmp as any).ngComponentDef, scope);
    });
  }

  /**
   * Compute the pair of transitive scopes (compilation scope and exported scope) for a given
   * module.
   *
   * This operation is memoized and the result is cached on the module's definition. It can be
   * called on modules with components that have not fully compiled yet, but the result should not
   * be used until they have.
   */
  private _transitiveScopesFor<T>(moduleType: Type<T>, resolvers: Resolvers):
      NgModuleTransitiveScopes {
    if (!isNgModule(moduleType)) {
      throw new Error(`${moduleType.name} does not have an ngModuleDef`);
    }
    const def = moduleType.ngModuleDef;

    if (def.transitiveCompileScopes !== null) {
      return def.transitiveCompileScopes;
    }

    const scopes: NgModuleTransitiveScopes = {
      compilation: {
        directives: new Set<any>(),
        pipes: new Set<any>(),
      },
      exported: {
        directives: new Set<any>(),
        pipes: new Set<any>(),
      },
    };

    def.declarations.forEach(declared => {
      const declaredWithDefs = declared as Type<any>& { ngPipeDef?: any; };

      if (declaredWithDefs.ngPipeDef !== undefined) {
        scopes.compilation.pipes.add(declared);
      } else {
        scopes.compilation.directives.add(declared);
      }
    });

    def.imports.forEach(<I>(imported: NgModuleType) => {
      const ngModule = resolvers.module.resolve(imported);

      if (ngModule === null) {
        throw new Error(`Importing ${imported.name} which does not have an @ngModule`);
      } else {
        this._compileNgModule(imported, resolvers);
      }

      // When this module imports another, the imported module's exported directives and pipes are
      // added to the compilation scope of this module.
      const importedScope = this._transitiveScopesFor(imported, resolvers);
      importedScope.exported.directives.forEach(entry => scopes.compilation.directives.add(entry));
      importedScope.exported.pipes.forEach(entry => scopes.compilation.pipes.add(entry));
    });

    def.exports.forEach(<E>(exported: Type<E>) => {
      const exportedTyped = exported as Type<E>& {
        // Components, Directives, NgModules, and Pipes can all be exported.
        ngComponentDef?: any;
        ngDirectiveDef?: any;
        ngModuleDef?: NgModuleDef<E>;
        ngPipeDef?: any;
      };

      // Either the type is a module, a pipe, or a component/directive (which may not have an
      // ngComponentDef as it might be compiled asynchronously).
      if (isNgModule(exportedTyped)) {
        // When this module exports another, the exported module's exported directives and pipes are
        // added to both the compilation and exported scopes of this module.
        const exportedScope = this._transitiveScopesFor(exportedTyped, resolvers);
        exportedScope.exported.directives.forEach(entry => {
          scopes.compilation.directives.add(entry);
          scopes.exported.directives.add(entry);
        });
        exportedScope.exported.pipes.forEach(entry => {
          scopes.compilation.pipes.add(entry);
          scopes.exported.pipes.add(entry);
        });
      } else if (exportedTyped.ngPipeDef !== undefined) {
        scopes.exported.pipes.add(exportedTyped);
      } else {
        scopes.exported.directives.add(exportedTyped);
      }
    });

    def.transitiveCompileScopes = scopes;
    return scopes;
  }
}

let testBed: TestBedRender3;

export function _getTestBedRender3(): TestBedRender3 {
  return testBed = testBed || new TestBedRender3();
}

const OWNER_MODULE = '__NG_MODULE__';
/**
 * This function clears the OWNER_MODULE property from the Types. This is set in
 * r3/jit/modules.ts. It is common for the same Type to be compiled in different tests. If we don't
 * clear this we will get errors which will complain that the same Component/Directive is in more
 * than one NgModule.
 */
function clearNgModules(type: Type<any>) {
  if (type.hasOwnProperty(OWNER_MODULE)) {
    (type as any)[OWNER_MODULE] = undefined;
  }
}

function flatten<T>(values: any[], mapFn?: (value: T) => any): T[] {
  const out: T[] = [];
  values.forEach(value => {
    if (Array.isArray(value)) {
      out.push(...flatten<T>(value, mapFn));
    } else {
      out.push(mapFn ? mapFn(value) : value);
    }
  });
  return out;
}

function isNgModule<T>(value: Type<T>): value is Type<T>&{ngModuleDef: NgModuleDef<T>} {
  return (value as{ngModuleDef?: NgModuleDef<T>}).ngModuleDef !== undefined;
}
