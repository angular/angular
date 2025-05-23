/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ResourceLoader} from '@angular/compiler';
import {
  ApplicationInitStatus,
  ɵINTERNAL_APPLICATION_ERROR_HANDLER as INTERNAL_APPLICATION_ERROR_HANDLER,
  ɵChangeDetectionScheduler as ChangeDetectionScheduler,
  ɵChangeDetectionSchedulerImpl as ChangeDetectionSchedulerImpl,
  Compiler,
  COMPILER_OPTIONS,
  Component,
  Directive,
  Injector,
  inject,
  InjectorType,
  LOCALE_ID,
  ModuleWithComponentFactories,
  ModuleWithProviders,
  NgModule,
  NgModuleFactory,
  Pipe,
  PlatformRef,
  Provider,
  resolveForwardRef,
  StaticProvider,
  Type,
  ɵclearResolutionOfComponentResourcesQueue,
  ɵcompileComponent as compileComponent,
  ɵcompileDirective as compileDirective,
  ɵcompileNgModuleDefs as compileNgModuleDefs,
  ɵcompilePipe as compilePipe,
  ɵDEFAULT_LOCALE_ID as DEFAULT_LOCALE_ID,
  ɵDEFER_BLOCK_CONFIG as DEFER_BLOCK_CONFIG,
  ɵdepsTracker as depsTracker,
  ɵDirectiveDef as DirectiveDef,
  ɵgenerateStandaloneInDeclarationsError,
  ɵgetAsyncClassMetadataFn as getAsyncClassMetadataFn,
  ɵgetInjectableDef as getInjectableDef,
  ɵInternalEnvironmentProviders as InternalEnvironmentProviders,
  ɵinternalProvideZoneChangeDetection as internalProvideZoneChangeDetection,
  ɵisComponentDefPendingResolution,
  ɵisEnvironmentProviders as isEnvironmentProviders,
  ɵNG_COMP_DEF as NG_COMP_DEF,
  ɵNG_DIR_DEF as NG_DIR_DEF,
  ɵNG_INJ_DEF as NG_INJ_DEF,
  ɵNG_MOD_DEF as NG_MOD_DEF,
  ɵNG_PIPE_DEF as NG_PIPE_DEF,
  ɵNgModuleFactory as R3NgModuleFactory,
  ɵNgModuleTransitiveScopes as NgModuleTransitiveScopes,
  ɵNgModuleType as NgModuleType,
  ɵpatchComponentDefWithScope as patchComponentDefWithScope,
  ɵRender3ComponentFactory as ComponentFactory,
  ɵRender3NgModuleRef as NgModuleRef,
  ɵresolveComponentResources,
  ɵrestoreComponentResolutionQueue,
  ɵsetLocaleId as setLocaleId,
  ɵtransitiveScopesFor as transitiveScopesFor,
  ɵUSE_RUNTIME_DEPS_TRACKER_FOR_JIT as USE_RUNTIME_DEPS_TRACKER_FOR_JIT,
  ɵɵInjectableDeclaration as InjectableDeclaration,
  NgZone,
  ErrorHandler,
  ENVIRONMENT_INITIALIZER,
} from '../../src/core';

import {ComponentDef, ComponentType} from '../../src/render3';

import {MetadataOverride} from './metadata_override';
import {
  ComponentResolver,
  DirectiveResolver,
  NgModuleResolver,
  PipeResolver,
  Resolver,
} from './resolvers';
import {DEFER_BLOCK_DEFAULT_BEHAVIOR, TestModuleMetadata} from './test_bed_common';
import {
  RETHROW_APPLICATION_ERRORS_DEFAULT,
  TestBedApplicationErrorHandler,
} from './application_error_handler';

enum TestingModuleOverride {
  DECLARATION,
  OVERRIDE_TEMPLATE,
}

function isTestingModuleOverride(value: unknown): value is TestingModuleOverride {
  return (
    value === TestingModuleOverride.DECLARATION || value === TestingModuleOverride.OVERRIDE_TEMPLATE
  );
}

function assertNoStandaloneComponents(
  types: Type<any>[],
  resolver: Resolver<any>,
  location: string,
) {
  types.forEach((type) => {
    if (!getAsyncClassMetadataFn(type)) {
      const component = resolver.resolve(type);
      if (component && (component.standalone == null || component.standalone)) {
        throw new Error(ɵgenerateStandaloneInDeclarationsError(type, location));
      }
    }
  });
}

// Resolvers for Angular decorators
type Resolvers = {
  module: Resolver<NgModule>;
  component: Resolver<Directive>;
  directive: Resolver<Component>;
  pipe: Resolver<Pipe>;
};

interface CleanupOperation {
  fieldName: string;
  object: any;
  originalValue: unknown;
}

export class TestBedCompiler {
  private originalComponentResolutionQueue: Map<Type<any>, Component> | null = null;

  // Testing module configuration
  private declarations: Type<any>[] = [];
  private imports: Type<any>[] = [];
  private providers: Provider[] = [];
  private schemas: any[] = [];

  // Queues of components/directives/pipes that should be recompiled.
  private pendingComponents = new Set<Type<any>>();
  private pendingDirectives = new Set<Type<any>>();
  private pendingPipes = new Set<Type<any>>();

  // Set of components with async metadata, i.e. components with `@defer` blocks
  // in their templates.
  private componentsWithAsyncMetadata = new Set<Type<unknown>>();

  // Keep track of all components and directives, so we can patch Providers onto defs later.
  private seenComponents = new Set<Type<any>>();
  private seenDirectives = new Set<Type<any>>();

  // Keep track of overridden modules, so that we can collect all affected ones in the module tree.
  private overriddenModules = new Set<NgModuleType<any>>();

  // Store resolved styles for Components that have template overrides present and `styleUrls`
  // defined at the same time.
  private existingComponentStyles = new Map<Type<any>, string[]>();

  private resolvers: Resolvers = initResolvers();

  // Map of component type to an NgModule that declares it.
  //
  // There are a couple special cases:
  // - for standalone components, the module scope value is `null`
  // - when a component is declared in `TestBed.configureTestingModule()` call or
  //   a component's template is overridden via `TestBed.overrideTemplateUsingTestingModule()`.
  //   we use a special value from the `TestingModuleOverride` enum.
  private componentToModuleScope = new Map<Type<any>, Type<any> | TestingModuleOverride | null>();

  // Map that keeps initial version of component/directive/pipe defs in case
  // we compile a Type again, thus overriding respective static fields. This is
  // required to make sure we restore defs to their initial states between test runs.
  // Note: one class may have multiple defs (for example: ɵmod and ɵinj in case of an
  // NgModule), store all of them in a map.
  private initialNgDefs = new Map<Type<any>, Map<string, PropertyDescriptor | undefined>>();

  // Array that keeps cleanup operations for initial versions of component/directive/pipe/module
  // defs in case TestBed makes changes to the originals.
  private defCleanupOps: CleanupOperation[] = [];

  private _injector: Injector | null = null;
  private compilerProviders: Provider[] | null = null;

  private providerOverrides: Provider[] = [];
  private rootProviderOverrides: Provider[] = [];
  // Overrides for injectables with `{providedIn: SomeModule}` need to be tracked and added to that
  // module's provider list.
  private providerOverridesByModule = new Map<InjectorType<any>, Provider[]>();
  private providerOverridesByToken = new Map<any, Provider>();
  private scopesWithOverriddenProviders = new Set<Type<any>>();

  private testModuleType: NgModuleType<any>;
  private testModuleRef: NgModuleRef<any> | null = null;

  private deferBlockBehavior = DEFER_BLOCK_DEFAULT_BEHAVIOR;
  private rethrowApplicationTickErrors = RETHROW_APPLICATION_ERRORS_DEFAULT;

  constructor(
    private platform: PlatformRef,
    private additionalModuleTypes: Type<any> | Type<any>[],
  ) {
    class DynamicTestModule {}
    this.testModuleType = DynamicTestModule as any;
  }

  setCompilerProviders(providers: Provider[] | null): void {
    this.compilerProviders = providers;
    this._injector = null;
  }

  configureTestingModule(moduleDef: TestModuleMetadata): void {
    // Enqueue any compilation tasks for the directly declared component.
    if (moduleDef.declarations !== undefined) {
      // Verify that there are no standalone components
      assertNoStandaloneComponents(
        moduleDef.declarations,
        this.resolvers.component,
        '"TestBed.configureTestingModule" call',
      );
      this.queueTypeArray(moduleDef.declarations, TestingModuleOverride.DECLARATION);
      this.declarations.push(...moduleDef.declarations);
    }

    // Enqueue any compilation tasks for imported modules.
    if (moduleDef.imports !== undefined) {
      this.queueTypesFromModulesArray(moduleDef.imports);
      this.imports.push(...moduleDef.imports);
    }

    if (moduleDef.providers !== undefined) {
      this.providers.push(...moduleDef.providers);
    }

    if (moduleDef.schemas !== undefined) {
      this.schemas.push(...moduleDef.schemas);
    }

    this.deferBlockBehavior = moduleDef.deferBlockBehavior ?? DEFER_BLOCK_DEFAULT_BEHAVIOR;
    this.rethrowApplicationTickErrors =
      moduleDef.rethrowApplicationErrors ?? RETHROW_APPLICATION_ERRORS_DEFAULT;
  }

  overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): void {
    if (USE_RUNTIME_DEPS_TRACKER_FOR_JIT) {
      depsTracker.clearScopeCacheFor(ngModule);
    }
    this.overriddenModules.add(ngModule as NgModuleType<any>);

    // Compile the module right away.
    this.resolvers.module.addOverride(ngModule, override);
    const metadata = this.resolvers.module.resolve(ngModule);
    if (metadata === null) {
      throw invalidTypeError(ngModule.name, 'NgModule');
    }

    this.recompileNgModule(ngModule, metadata);

    // At this point, the module has a valid module def (ɵmod), but the override may have introduced
    // new declarations or imported modules. Ingest any possible new types and add them to the
    // current queue.
    this.queueTypesFromModulesArray([ngModule]);
  }

  overrideComponent(component: Type<any>, override: MetadataOverride<Component>): void {
    this.verifyNoStandaloneFlagOverrides(component, override);
    this.resolvers.component.addOverride(component, override);
    this.pendingComponents.add(component);

    // If this is a component with async metadata (i.e. a component with a `@defer` block
    // in a template) - store it for future processing.
    this.maybeRegisterComponentWithAsyncMetadata(component);
  }

  overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>): void {
    this.verifyNoStandaloneFlagOverrides(directive, override);
    this.resolvers.directive.addOverride(directive, override);
    this.pendingDirectives.add(directive);
  }

  overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): void {
    this.verifyNoStandaloneFlagOverrides(pipe, override);
    this.resolvers.pipe.addOverride(pipe, override);
    this.pendingPipes.add(pipe);
  }

  private verifyNoStandaloneFlagOverrides(
    type: Type<any>,
    override: MetadataOverride<Component | Directive | Pipe>,
  ) {
    if (
      override.add?.hasOwnProperty('standalone') ||
      override.set?.hasOwnProperty('standalone') ||
      override.remove?.hasOwnProperty('standalone')
    ) {
      throw new Error(
        `An override for the ${type.name} class has the \`standalone\` flag. ` +
          `Changing the \`standalone\` flag via TestBed overrides is not supported.`,
      );
    }
  }

  overrideProvider(
    token: any,
    provider: {useFactory?: Function; useValue?: any; deps?: any[]; multi?: boolean},
  ): void {
    let providerDef: Provider;
    if (provider.useFactory !== undefined) {
      providerDef = {
        provide: token,
        useFactory: provider.useFactory,
        deps: provider.deps || [],
        multi: provider.multi,
      };
    } else if (provider.useValue !== undefined) {
      providerDef = {provide: token, useValue: provider.useValue, multi: provider.multi};
    } else {
      providerDef = {provide: token};
    }

    const injectableDef: InjectableDeclaration<any> | null =
      typeof token !== 'string' ? getInjectableDef(token) : null;
    const providedIn = injectableDef === null ? null : resolveForwardRef(injectableDef.providedIn);
    const overridesBucket =
      providedIn === 'root' ? this.rootProviderOverrides : this.providerOverrides;
    overridesBucket.push(providerDef);

    // Keep overrides grouped by token as well for fast lookups using token
    this.providerOverridesByToken.set(token, providerDef);
    if (injectableDef !== null && providedIn !== null && typeof providedIn !== 'string') {
      const existingOverrides = this.providerOverridesByModule.get(providedIn);
      if (existingOverrides !== undefined) {
        existingOverrides.push(providerDef);
      } else {
        this.providerOverridesByModule.set(providedIn, [providerDef]);
      }
    }
  }

  overrideTemplateUsingTestingModule(type: Type<any>, template: string): void {
    const def = (type as any)[NG_COMP_DEF];
    const hasStyleUrls = (): boolean => {
      const metadata = this.resolvers.component.resolve(type)! as Component;
      return !!metadata.styleUrl || !!metadata.styleUrls?.length;
    };
    const overrideStyleUrls = !!def && !ɵisComponentDefPendingResolution(type) && hasStyleUrls();

    // In Ivy, compiling a component does not require knowing the module providing the
    // component's scope, so overrideTemplateUsingTestingModule can be implemented purely via
    // overrideComponent. Important: overriding template requires full Component re-compilation,
    // which may fail in case styleUrls are also present (thus Component is considered as required
    // resolution). In order to avoid this, we preemptively set styleUrls to an empty array,
    // preserve current styles available on Component def and restore styles back once compilation
    // is complete.
    const override = overrideStyleUrls
      ? {template, styles: [], styleUrls: [], styleUrl: undefined}
      : {template};
    this.overrideComponent(type, {set: override});

    if (overrideStyleUrls && def.styles && def.styles.length > 0) {
      this.existingComponentStyles.set(type, def.styles);
    }

    // Set the component's scope to be the testing module.
    this.componentToModuleScope.set(type, TestingModuleOverride.OVERRIDE_TEMPLATE);
  }

  private async resolvePendingComponentsWithAsyncMetadata() {
    if (this.componentsWithAsyncMetadata.size === 0) return;

    const promises = [];
    for (const component of this.componentsWithAsyncMetadata) {
      const asyncMetadataFn = getAsyncClassMetadataFn(component);
      if (asyncMetadataFn) {
        promises.push(asyncMetadataFn());
      }
    }
    this.componentsWithAsyncMetadata.clear();

    const resolvedDeps = await Promise.all(promises);
    const flatResolvedDeps = resolvedDeps.flat(2);
    this.queueTypesFromModulesArray(flatResolvedDeps);

    // Loaded standalone components might contain imports of NgModules
    // with providers, make sure we override providers there too.
    for (const component of flatResolvedDeps) {
      this.applyProviderOverridesInScope(component);
    }
  }

  async compileComponents(): Promise<void> {
    this.clearComponentResolutionQueue();

    // Wait for all async metadata for components that were
    // overridden, we need resolved metadata to perform an override
    // and re-compile a component.
    await this.resolvePendingComponentsWithAsyncMetadata();

    // Verify that there were no standalone components present in the `declarations` field
    // during the `TestBed.configureTestingModule` call. We perform this check here in addition
    // to the logic in the `configureTestingModule` function, since at this point we have
    // all async metadata resolved.
    assertNoStandaloneComponents(
      this.declarations,
      this.resolvers.component,
      '"TestBed.configureTestingModule" call',
    );

    // Run compilers for all queued types.
    let needsAsyncResources = this.compileTypesSync();

    // compileComponents() should not be async unless it needs to be.
    if (needsAsyncResources) {
      let resourceLoader: ResourceLoader;
      let resolver = (url: string): Promise<string> => {
        if (!resourceLoader) {
          resourceLoader = this.injector.get(ResourceLoader);
        }
        return Promise.resolve(resourceLoader.get(url));
      };
      await ɵresolveComponentResources(resolver);
    }
  }

  finalize(): NgModuleRef<any> {
    // One last compile
    this.compileTypesSync();

    // Create the testing module itself.
    this.compileTestModule();

    this.applyTransitiveScopes();

    this.applyProviderOverrides();

    // Patch previously stored `styles` Component values (taken from ɵcmp), in case these
    // Components have `styleUrls` fields defined and template override was requested.
    this.patchComponentsWithExistingStyles();

    // Clear the componentToModuleScope map, so that future compilations don't reset the scope of
    // every component.
    this.componentToModuleScope.clear();

    const parentInjector = this.platform.injector;
    this.testModuleRef = new NgModuleRef(this.testModuleType, parentInjector, []);

    // ApplicationInitStatus.runInitializers() is marked @internal to core.
    // Cast it to any before accessing it.
    (this.testModuleRef.injector.get(ApplicationInitStatus) as any).runInitializers();

    // Set locale ID after running app initializers, since locale information might be updated while
    // running initializers. This is also consistent with the execution order while bootstrapping an
    // app (see `packages/core/src/application_ref.ts` file).
    const localeId = this.testModuleRef.injector.get(LOCALE_ID, DEFAULT_LOCALE_ID);
    setLocaleId(localeId);

    return this.testModuleRef;
  }

  /**
   * @internal
   */
  _compileNgModuleSync(moduleType: Type<any>): void {
    this.queueTypesFromModulesArray([moduleType]);
    this.compileTypesSync();
    this.applyProviderOverrides();
    this.applyProviderOverridesInScope(moduleType);
    this.applyTransitiveScopes();
  }

  /**
   * @internal
   */
  async _compileNgModuleAsync(moduleType: Type<any>): Promise<void> {
    this.queueTypesFromModulesArray([moduleType]);
    await this.compileComponents();
    this.applyProviderOverrides();
    this.applyProviderOverridesInScope(moduleType);
    this.applyTransitiveScopes();
  }

  /**
   * @internal
   */
  _getModuleResolver(): Resolver<NgModule> {
    return this.resolvers.module;
  }

  /**
   * @internal
   */
  _getComponentFactories(moduleType: NgModuleType): ComponentFactory<any>[] {
    return maybeUnwrapFn(moduleType.ɵmod.declarations).reduce((factories, declaration) => {
      const componentDef = (declaration as any).ɵcmp;
      componentDef && factories.push(new ComponentFactory(componentDef, this.testModuleRef!));
      return factories;
    }, [] as ComponentFactory<any>[]);
  }

  private compileTypesSync(): boolean {
    // Compile all queued components, directives, pipes.
    let needsAsyncResources = false;
    this.pendingComponents.forEach((declaration) => {
      if (getAsyncClassMetadataFn(declaration)) {
        throw new Error(
          `Component '${declaration.name}' has unresolved metadata. ` +
            `Please call \`await TestBed.compileComponents()\` before running this test.`,
        );
      }

      needsAsyncResources = needsAsyncResources || ɵisComponentDefPendingResolution(declaration);

      const metadata = this.resolvers.component.resolve(declaration);
      if (metadata === null) {
        throw invalidTypeError(declaration.name, 'Component');
      }

      this.maybeStoreNgDef(NG_COMP_DEF, declaration);
      if (USE_RUNTIME_DEPS_TRACKER_FOR_JIT) {
        depsTracker.clearScopeCacheFor(declaration);
      }
      compileComponent(declaration, metadata);
    });
    this.pendingComponents.clear();

    this.pendingDirectives.forEach((declaration) => {
      const metadata = this.resolvers.directive.resolve(declaration);
      if (metadata === null) {
        throw invalidTypeError(declaration.name, 'Directive');
      }
      this.maybeStoreNgDef(NG_DIR_DEF, declaration);
      compileDirective(declaration, metadata);
    });
    this.pendingDirectives.clear();

    this.pendingPipes.forEach((declaration) => {
      const metadata = this.resolvers.pipe.resolve(declaration);
      if (metadata === null) {
        throw invalidTypeError(declaration.name, 'Pipe');
      }
      this.maybeStoreNgDef(NG_PIPE_DEF, declaration);
      compilePipe(declaration, metadata);
    });
    this.pendingPipes.clear();

    return needsAsyncResources;
  }

  private applyTransitiveScopes(): void {
    if (this.overriddenModules.size > 0) {
      // Module overrides (via `TestBed.overrideModule`) might affect scopes that were previously
      // calculated and stored in `transitiveCompileScopes`. If module overrides are present,
      // collect all affected modules and reset scopes to force their re-calculation.
      const testingModuleDef = (this.testModuleType as any)[NG_MOD_DEF];
      const affectedModules = this.collectModulesAffectedByOverrides(testingModuleDef.imports);
      if (affectedModules.size > 0) {
        affectedModules.forEach((moduleType) => {
          if (!USE_RUNTIME_DEPS_TRACKER_FOR_JIT) {
            this.storeFieldOfDefOnType(moduleType as any, NG_MOD_DEF, 'transitiveCompileScopes');
            (moduleType as any)[NG_MOD_DEF].transitiveCompileScopes = null;
          } else {
            depsTracker.clearScopeCacheFor(moduleType);
          }
        });
      }
    }

    const moduleToScope = new Map<Type<any> | TestingModuleOverride, NgModuleTransitiveScopes>();
    const getScopeOfModule = (
      moduleType: Type<any> | TestingModuleOverride,
    ): NgModuleTransitiveScopes => {
      if (!moduleToScope.has(moduleType)) {
        const isTestingModule = isTestingModuleOverride(moduleType);
        const realType = isTestingModule ? this.testModuleType : (moduleType as Type<any>);
        moduleToScope.set(moduleType, transitiveScopesFor(realType));
      }
      return moduleToScope.get(moduleType)!;
    };

    this.componentToModuleScope.forEach((moduleType, componentType) => {
      if (moduleType !== null) {
        const moduleScope = getScopeOfModule(moduleType);
        this.storeFieldOfDefOnType(componentType, NG_COMP_DEF, 'directiveDefs');
        this.storeFieldOfDefOnType(componentType, NG_COMP_DEF, 'pipeDefs');
        patchComponentDefWithScope(getComponentDef(componentType)!, moduleScope);
      }
      // `tView` that is stored on component def contains information about directives and pipes
      // that are in the scope of this component. Patching component scope will cause `tView` to be
      // changed. Store original `tView` before patching scope, so the `tView` (including scope
      // information) is restored back to its previous/original state before running next test.
      // Resetting `tView` is also needed for cases when we apply provider overrides and those
      // providers are defined on component's level, in which case they may end up included into
      // `tView.blueprint`.
      this.storeFieldOfDefOnType(componentType, NG_COMP_DEF, 'tView');
    });

    this.componentToModuleScope.clear();
  }

  private applyProviderOverrides(): void {
    const maybeApplyOverrides = (field: string) => (type: Type<any>) => {
      const resolver = field === NG_COMP_DEF ? this.resolvers.component : this.resolvers.directive;
      const metadata = resolver.resolve(type)!;
      if (this.hasProviderOverrides(metadata.providers)) {
        this.patchDefWithProviderOverrides(type, field);
      }
    };
    this.seenComponents.forEach(maybeApplyOverrides(NG_COMP_DEF));
    this.seenDirectives.forEach(maybeApplyOverrides(NG_DIR_DEF));

    this.seenComponents.clear();
    this.seenDirectives.clear();
  }

  /**
   * Applies provider overrides to a given type (either an NgModule or a standalone component)
   * and all imported NgModules and standalone components recursively.
   */
  private applyProviderOverridesInScope(type: Type<any>): void {
    const hasScope = isStandaloneComponent(type) || isNgModule(type);

    // The function can be re-entered recursively while inspecting dependencies
    // of an NgModule or a standalone component. Exit early if we come across a
    // type that can not have a scope (directive or pipe) or the type is already
    // processed earlier.
    if (!hasScope || this.scopesWithOverriddenProviders.has(type)) {
      return;
    }
    this.scopesWithOverriddenProviders.add(type);

    // NOTE: the line below triggers JIT compilation of the module injector,
    // which also invokes verification of the NgModule semantics, which produces
    // detailed error messages. The fact that the code relies on this line being
    // present here is suspicious and should be refactored in a way that the line
    // below can be moved (for ex. after an early exit check below).
    const injectorDef: any = (type as any)[NG_INJ_DEF];

    // No provider overrides, exit early.
    if (this.providerOverridesByToken.size === 0) return;

    if (isStandaloneComponent(type)) {
      // Visit all component dependencies and override providers there.
      const def = getComponentDef(type);
      const dependencies = maybeUnwrapFn(def.dependencies ?? []);
      for (const dependency of dependencies) {
        this.applyProviderOverridesInScope(dependency);
      }
    } else {
      const providers: Array<Provider | InternalEnvironmentProviders> = [
        ...injectorDef.providers,
        ...(this.providerOverridesByModule.get(type as InjectorType<any>) || []),
      ];
      if (this.hasProviderOverrides(providers)) {
        this.maybeStoreNgDef(NG_INJ_DEF, type);

        this.storeFieldOfDefOnType(type, NG_INJ_DEF, 'providers');
        injectorDef.providers = this.getOverriddenProviders(providers);
      }

      // Apply provider overrides to imported modules recursively
      const moduleDef = (type as any)[NG_MOD_DEF];
      const imports = maybeUnwrapFn(moduleDef.imports);
      for (const importedModule of imports) {
        this.applyProviderOverridesInScope(importedModule);
      }
      // Also override the providers on any ModuleWithProviders imports since those don't appear in
      // the moduleDef.
      for (const importedModule of flatten(injectorDef.imports)) {
        if (isModuleWithProviders(importedModule)) {
          this.defCleanupOps.push({
            object: importedModule,
            fieldName: 'providers',
            originalValue: importedModule.providers,
          });
          importedModule.providers = this.getOverriddenProviders(
            importedModule.providers as Array<Provider | InternalEnvironmentProviders>,
          );
        }
      }
    }
  }

  private patchComponentsWithExistingStyles(): void {
    this.existingComponentStyles.forEach(
      (styles, type) => ((type as any)[NG_COMP_DEF].styles = styles),
    );
    this.existingComponentStyles.clear();
  }

  private queueTypeArray(arr: any[], moduleType: Type<any> | TestingModuleOverride): void {
    for (const value of arr) {
      if (Array.isArray(value)) {
        this.queueTypeArray(value, moduleType);
      } else {
        this.queueType(value, moduleType);
      }
    }
  }

  private recompileNgModule(ngModule: Type<any>, metadata: NgModule): void {
    // Cache the initial ngModuleDef as it will be overwritten.
    this.maybeStoreNgDef(NG_MOD_DEF, ngModule);
    this.maybeStoreNgDef(NG_INJ_DEF, ngModule);

    compileNgModuleDefs(ngModule as NgModuleType<any>, metadata);
  }

  private maybeRegisterComponentWithAsyncMetadata(type: Type<unknown>) {
    const asyncMetadataFn = getAsyncClassMetadataFn(type);
    if (asyncMetadataFn) {
      this.componentsWithAsyncMetadata.add(type);
    }
  }

  private queueType(type: Type<any>, moduleType: Type<any> | TestingModuleOverride | null): void {
    // If this is a component with async metadata (i.e. a component with a `@defer` block
    // in a template) - store it for future processing.
    this.maybeRegisterComponentWithAsyncMetadata(type);

    const component = this.resolvers.component.resolve(type);
    if (component) {
      // Check whether a give Type has respective NG def (ɵcmp) and compile if def is
      // missing. That might happen in case a class without any Angular decorators extends another
      // class where Component/Directive/Pipe decorator is defined.
      if (ɵisComponentDefPendingResolution(type) || !type.hasOwnProperty(NG_COMP_DEF)) {
        this.pendingComponents.add(type);
      }
      this.seenComponents.add(type);

      // Keep track of the module which declares this component, so later the component's scope
      // can be set correctly. If the component has already been recorded here, then one of several
      // cases is true:
      // * the module containing the component was imported multiple times (common).
      // * the component is declared in multiple modules (which is an error).
      // * the component was in 'declarations' of the testing module, and also in an imported module
      //   in which case the module scope will be TestingModuleOverride.DECLARATION.
      // * overrideTemplateUsingTestingModule was called for the component in which case the module
      //   scope will be TestingModuleOverride.OVERRIDE_TEMPLATE.
      //
      // If the component was previously in the testing module's 'declarations' (meaning the
      // current value is TestingModuleOverride.DECLARATION), then `moduleType` is the component's
      // real module, which was imported. This pattern is understood to mean that the component
      // should use its original scope, but that the testing module should also contain the
      // component in its scope.
      if (
        !this.componentToModuleScope.has(type) ||
        this.componentToModuleScope.get(type) === TestingModuleOverride.DECLARATION
      ) {
        this.componentToModuleScope.set(type, moduleType);
      }
      return;
    }

    const directive = this.resolvers.directive.resolve(type);
    if (directive) {
      if (!type.hasOwnProperty(NG_DIR_DEF)) {
        this.pendingDirectives.add(type);
      }
      this.seenDirectives.add(type);
      return;
    }

    const pipe = this.resolvers.pipe.resolve(type);
    if (pipe && !type.hasOwnProperty(NG_PIPE_DEF)) {
      this.pendingPipes.add(type);
      return;
    }
  }

  private queueTypesFromModulesArray(arr: any[]): void {
    // Because we may encounter the same NgModule or a standalone Component while processing
    // the dependencies of an NgModule or a standalone Component, we cache them in this set so we
    // can skip ones that have already been seen encountered. In some test setups, this caching
    // resulted in 10X runtime improvement.
    const processedDefs = new Set();
    const queueTypesFromModulesArrayRecur = (arr: any[]): void => {
      for (const value of arr) {
        if (Array.isArray(value)) {
          queueTypesFromModulesArrayRecur(value);
        } else if (hasNgModuleDef(value)) {
          const def = value.ɵmod;
          if (processedDefs.has(def)) {
            continue;
          }
          processedDefs.add(def);
          // Look through declarations, imports, and exports, and queue
          // everything found there.
          this.queueTypeArray(maybeUnwrapFn(def.declarations), value);
          queueTypesFromModulesArrayRecur(maybeUnwrapFn(def.imports));
          queueTypesFromModulesArrayRecur(maybeUnwrapFn(def.exports));
        } else if (isModuleWithProviders(value)) {
          queueTypesFromModulesArrayRecur([value.ngModule]);
        } else if (isStandaloneComponent(value)) {
          this.queueType(value, null);
          const def = getComponentDef(value);

          if (processedDefs.has(def)) {
            continue;
          }
          processedDefs.add(def);

          const dependencies = maybeUnwrapFn(def.dependencies ?? []);
          dependencies.forEach((dependency) => {
            // Note: in AOT, the `dependencies` might also contain regular
            // (NgModule-based) Component, Directive and Pipes, so we handle
            // them separately and proceed with recursive process for standalone
            // Components and NgModules only.
            if (isStandaloneComponent(dependency) || hasNgModuleDef(dependency)) {
              queueTypesFromModulesArrayRecur([dependency]);
            } else {
              this.queueType(dependency, null);
            }
          });
        }
      }
    };
    queueTypesFromModulesArrayRecur(arr);
  }

  // When module overrides (via `TestBed.overrideModule`) are present, it might affect all modules
  // that import (even transitively) an overridden one. For all affected modules we need to
  // recalculate their scopes for a given test run and restore original scopes at the end. The goal
  // of this function is to collect all affected modules in a set for further processing. Example:
  // if we have the following module hierarchy: A -> B -> C (where `->` means `imports`) and module
  // `C` is overridden, we consider `A` and `B` as affected, since their scopes might become
  // invalidated with the override.
  private collectModulesAffectedByOverrides(arr: any[]): Set<NgModuleType<any>> {
    const seenModules = new Set<NgModuleType<any>>();
    const affectedModules = new Set<NgModuleType<any>>();
    const calcAffectedModulesRecur = (arr: any[], path: NgModuleType<any>[]): void => {
      for (const value of arr) {
        if (Array.isArray(value)) {
          // If the value is an array, just flatten it (by invoking this function recursively),
          // keeping "path" the same.
          calcAffectedModulesRecur(value, path);
        } else if (hasNgModuleDef(value)) {
          if (seenModules.has(value)) {
            // If we've seen this module before and it's included into "affected modules" list, mark
            // the whole path that leads to that module as affected, but do not descend into its
            // imports, since we already examined them before.
            if (affectedModules.has(value)) {
              path.forEach((item) => affectedModules.add(item));
            }
            continue;
          }
          seenModules.add(value);
          if (this.overriddenModules.has(value)) {
            path.forEach((item) => affectedModules.add(item));
          }
          // Examine module imports recursively to look for overridden modules.
          const moduleDef = (value as any)[NG_MOD_DEF];
          calcAffectedModulesRecur(maybeUnwrapFn(moduleDef.imports), path.concat(value));
        }
      }
    };
    calcAffectedModulesRecur(arr, []);
    return affectedModules;
  }

  /**
   * Preserve an original def (such as ɵmod, ɵinj, etc) before applying an override.
   * Note: one class may have multiple defs (for example: ɵmod and ɵinj in case of
   * an NgModule). If there is a def in a set already, don't override it, since
   * an original one should be restored at the end of a test.
   */
  private maybeStoreNgDef(prop: string, type: Type<any>) {
    if (!this.initialNgDefs.has(type)) {
      this.initialNgDefs.set(type, new Map());
    }
    const currentDefs = this.initialNgDefs.get(type)!;
    if (!currentDefs.has(prop)) {
      const currentDef = Object.getOwnPropertyDescriptor(type, prop);
      currentDefs.set(prop, currentDef);
    }
  }

  private storeFieldOfDefOnType(type: Type<any>, defField: string, fieldName: string): void {
    const def: any = (type as any)[defField];
    const originalValue: any = def[fieldName];
    this.defCleanupOps.push({object: def, fieldName, originalValue});
  }

  /**
   * Clears current components resolution queue, but stores the state of the queue, so we can
   * restore it later. Clearing the queue is required before we try to compile components (via
   * `TestBed.compileComponents`), so that component defs are in sync with the resolution queue.
   */
  private clearComponentResolutionQueue() {
    if (this.originalComponentResolutionQueue === null) {
      this.originalComponentResolutionQueue = new Map();
    }
    ɵclearResolutionOfComponentResourcesQueue().forEach((value, key) =>
      this.originalComponentResolutionQueue!.set(key, value),
    );
  }

  /*
   * Restores component resolution queue to the previously saved state. This operation is performed
   * as a part of restoring the state after completion of the current set of tests (that might
   * potentially mutate the state).
   */
  private restoreComponentResolutionQueue() {
    if (this.originalComponentResolutionQueue !== null) {
      ɵrestoreComponentResolutionQueue(this.originalComponentResolutionQueue);
      this.originalComponentResolutionQueue = null;
    }
  }

  restoreOriginalState(): void {
    // Process cleanup ops in reverse order so the field's original value is restored correctly (in
    // case there were multiple overrides for the same field).
    forEachRight(this.defCleanupOps, (op: CleanupOperation) => {
      op.object[op.fieldName] = op.originalValue;
    });
    // Restore initial component/directive/pipe defs
    this.initialNgDefs.forEach(
      (defs: Map<string, PropertyDescriptor | undefined>, type: Type<any>) => {
        if (USE_RUNTIME_DEPS_TRACKER_FOR_JIT) {
          depsTracker.clearScopeCacheFor(type);
        }
        defs.forEach((descriptor, prop) => {
          if (!descriptor) {
            // Delete operations are generally undesirable since they have performance
            // implications on objects they were applied to. In this particular case, situations
            // where this code is invoked should be quite rare to cause any noticeable impact,
            // since it's applied only to some test cases (for example when class with no
            // annotations extends some @Component) when we need to clear 'ɵcmp' field on a given
            // class to restore its original state (before applying overrides and running tests).
            delete (type as any)[prop];
          } else {
            Object.defineProperty(type, prop, descriptor);
          }
        });
      },
    );
    this.initialNgDefs.clear();
    this.scopesWithOverriddenProviders.clear();
    this.restoreComponentResolutionQueue();
    // Restore the locale ID to the default value, this shouldn't be necessary but we never know
    setLocaleId(DEFAULT_LOCALE_ID);
  }

  private compileTestModule(): void {
    class RootScopeModule {}
    compileNgModuleDefs(RootScopeModule as NgModuleType<any>, {
      providers: [
        ...this.rootProviderOverrides,
        internalProvideZoneChangeDetection({}),
        TestBedApplicationErrorHandler,
        {provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl},
        {
          provide: ENVIRONMENT_INITIALIZER,
          multi: true,
          useValue: () => {
            inject(ErrorHandler);
          },
        },
      ],
    });

    const providers = [
      {provide: Compiler, useFactory: () => new R3TestCompiler(this)},
      {provide: DEFER_BLOCK_CONFIG, useValue: {behavior: this.deferBlockBehavior}},
      {
        provide: INTERNAL_APPLICATION_ERROR_HANDLER,
        useFactory: () => {
          if (this.rethrowApplicationTickErrors) {
            const handler = inject(TestBedApplicationErrorHandler);
            return (e: unknown) => {
              handler.handleError(e);
            };
          } else {
            const userErrorHandler = inject(ErrorHandler);
            const ngZone = inject(NgZone);
            return (e: unknown) => ngZone.runOutsideAngular(() => userErrorHandler.handleError(e));
          }
        },
      },
      ...this.providers,
      ...this.providerOverrides,
    ];
    const imports = [RootScopeModule, this.additionalModuleTypes, this.imports || []];

    compileNgModuleDefs(
      this.testModuleType,
      {
        declarations: this.declarations,
        imports,
        schemas: this.schemas,
        providers,
      },
      /* allowDuplicateDeclarationsInRoot */ true,
    );

    this.applyProviderOverridesInScope(this.testModuleType);
  }

  get injector(): Injector {
    if (this._injector !== null) {
      return this._injector;
    }

    const providers: StaticProvider[] = [];
    const compilerOptions = this.platform.injector.get(COMPILER_OPTIONS, []);
    compilerOptions.forEach((opts) => {
      if (opts.providers) {
        providers.push(opts.providers);
      }
    });
    if (this.compilerProviders !== null) {
      providers.push(...(this.compilerProviders as StaticProvider[]));
    }

    this._injector = Injector.create({providers, parent: this.platform.injector});
    return this._injector;
  }

  // get overrides for a specific provider (if any)
  private getSingleProviderOverrides(provider: Provider): Provider | null {
    const token = getProviderToken(provider);
    return this.providerOverridesByToken.get(token) || null;
  }

  private getProviderOverrides(
    providers?: Array<Provider | InternalEnvironmentProviders>,
  ): Provider[] {
    if (!providers || !providers.length || this.providerOverridesByToken.size === 0) return [];
    // There are two flattening operations here. The inner flattenProviders() operates on the
    // metadata's providers and applies a mapping function which retrieves overrides for each
    // incoming provider. The outer flatten() then flattens the produced overrides array. If this is
    // not done, the array can contain other empty arrays (e.g. `[[], []]`) which leak into the
    // providers array and contaminate any error messages that might be generated.
    return flatten(
      flattenProviders(
        providers,
        (provider: Provider) => this.getSingleProviderOverrides(provider) || [],
      ),
    );
  }

  private getOverriddenProviders(
    providers?: Array<Provider | InternalEnvironmentProviders>,
  ): Provider[] {
    if (!providers || !providers.length || this.providerOverridesByToken.size === 0) return [];

    const flattenedProviders = flattenProviders(providers);
    const overrides = this.getProviderOverrides(flattenedProviders);
    const overriddenProviders = [...flattenedProviders, ...overrides];
    const final: Provider[] = [];
    const seenOverriddenProviders = new Set<Provider>();

    // We iterate through the list of providers in reverse order to make sure provider overrides
    // take precedence over the values defined in provider list. We also filter out all providers
    // that have overrides, keeping overridden values only. This is needed, since presence of a
    // provider with `ngOnDestroy` hook will cause this hook to be registered and invoked later.
    forEachRight(overriddenProviders, (provider: any) => {
      const token: any = getProviderToken(provider);
      if (this.providerOverridesByToken.has(token)) {
        if (!seenOverriddenProviders.has(token)) {
          seenOverriddenProviders.add(token);
          // Treat all overridden providers as `{multi: false}` (even if it's a multi-provider) to
          // make sure that provided override takes highest precedence and is not combined with
          // other instances of the same multi provider.
          final.unshift({...provider, multi: false});
        }
      } else {
        final.unshift(provider);
      }
    });
    return final;
  }

  private hasProviderOverrides(
    providers?: Array<Provider | InternalEnvironmentProviders>,
  ): boolean {
    return this.getProviderOverrides(providers).length > 0;
  }

  private patchDefWithProviderOverrides(declaration: Type<any>, field: string): void {
    const def = (declaration as any)[field];
    if (def && def.providersResolver) {
      this.maybeStoreNgDef(field, declaration);

      const resolver = def.providersResolver;
      const processProvidersFn = (providers: Provider[]) => this.getOverriddenProviders(providers);
      this.storeFieldOfDefOnType(declaration, field, 'providersResolver');
      def.providersResolver = (ngDef: DirectiveDef<any>) => resolver(ngDef, processProvidersFn);
    }
  }
}

function initResolvers(): Resolvers {
  return {
    module: new NgModuleResolver(),
    component: new ComponentResolver(),
    directive: new DirectiveResolver(),
    pipe: new PipeResolver(),
  };
}

function isStandaloneComponent<T>(value: Type<T>): value is ComponentType<T> {
  const def = getComponentDef(value);
  return !!def?.standalone;
}

function getComponentDef(value: ComponentType<unknown>): ComponentDef<unknown>;
function getComponentDef(value: Type<unknown>): ComponentDef<unknown> | null;
function getComponentDef(value: Type<unknown>): ComponentDef<unknown> | null {
  return (value as any).ɵcmp ?? null;
}

function hasNgModuleDef<T>(value: Type<T>): value is NgModuleType<T> {
  return value.hasOwnProperty('ɵmod');
}

function isNgModule<T>(value: Type<T>): boolean {
  return hasNgModuleDef(value);
}

function maybeUnwrapFn<T>(maybeFn: (() => T) | T): T {
  return maybeFn instanceof Function ? maybeFn() : maybeFn;
}

function flatten<T>(values: any[]): T[] {
  const out: T[] = [];
  values.forEach((value) => {
    if (Array.isArray(value)) {
      out.push(...flatten<T>(value));
    } else {
      out.push(value);
    }
  });
  return out;
}

function identityFn<T>(value: T): T {
  return value;
}

function flattenProviders<T>(
  providers: Array<Provider | InternalEnvironmentProviders>,
  mapFn: (provider: Provider) => T,
): T[];
function flattenProviders(providers: Array<Provider | InternalEnvironmentProviders>): Provider[];
function flattenProviders(
  providers: Array<Provider | InternalEnvironmentProviders>,
  mapFn: (provider: Provider) => any = identityFn,
): any[] {
  const out: any[] = [];
  for (let provider of providers) {
    if (isEnvironmentProviders(provider)) {
      provider = provider.ɵproviders;
    }
    if (Array.isArray(provider)) {
      out.push(...flattenProviders(provider, mapFn));
    } else {
      out.push(mapFn(provider));
    }
  }
  return out;
}

function getProviderField(provider: Provider, field: string) {
  return provider && typeof provider === 'object' && (provider as any)[field];
}

function getProviderToken(provider: Provider) {
  return getProviderField(provider, 'provide') || provider;
}

function isModuleWithProviders(value: any): value is ModuleWithProviders<any> {
  return value.hasOwnProperty('ngModule');
}

function forEachRight<T>(values: T[], fn: (value: T, idx: number) => void): void {
  for (let idx = values.length - 1; idx >= 0; idx--) {
    fn(values[idx], idx);
  }
}

function invalidTypeError(name: string, expectedType: string): Error {
  return new Error(`${name} class doesn't have @${expectedType} decorator or is missing metadata.`);
}

class R3TestCompiler implements Compiler {
  constructor(private testBed: TestBedCompiler) {}

  compileModuleSync<T>(moduleType: Type<T>): NgModuleFactory<T> {
    this.testBed._compileNgModuleSync(moduleType);
    return new R3NgModuleFactory(moduleType);
  }

  async compileModuleAsync<T>(moduleType: Type<T>): Promise<NgModuleFactory<T>> {
    await this.testBed._compileNgModuleAsync(moduleType);
    return new R3NgModuleFactory(moduleType);
  }

  compileModuleAndAllComponentsSync<T>(moduleType: Type<T>): ModuleWithComponentFactories<T> {
    const ngModuleFactory = this.compileModuleSync(moduleType);
    const componentFactories = this.testBed._getComponentFactories(moduleType as NgModuleType<T>);
    return new ModuleWithComponentFactories(ngModuleFactory, componentFactories);
  }

  async compileModuleAndAllComponentsAsync<T>(
    moduleType: Type<T>,
  ): Promise<ModuleWithComponentFactories<T>> {
    const ngModuleFactory = await this.compileModuleAsync(moduleType);
    const componentFactories = this.testBed._getComponentFactories(moduleType as NgModuleType<T>);
    return new ModuleWithComponentFactories(ngModuleFactory, componentFactories);
  }

  clearCache(): void {}

  clearCacheFor(type: Type<any>): void {}

  getModuleId(moduleType: Type<any>): string | undefined {
    const meta = this.testBed._getModuleResolver().resolve(moduleType);
    return (meta && meta.id) || undefined;
  }
}
