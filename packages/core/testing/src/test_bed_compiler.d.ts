/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Component, Directive, Injector, NgModule, Pipe, PlatformRef, Provider, Type, ɵNgModuleType as NgModuleType, ɵRender3ComponentFactory as ComponentFactory, ɵRender3NgModuleRef as NgModuleRef } from '../../src/core';
import { MetadataOverride } from './metadata_override';
import { Resolver } from './resolvers';
import { TestModuleMetadata } from './test_bed_common';
export declare class TestBedCompiler {
    private platform;
    private additionalModuleTypes;
    private originalComponentResolutionQueue;
    private declarations;
    private imports;
    private providers;
    private schemas;
    private pendingComponents;
    private pendingDirectives;
    private pendingPipes;
    private componentsWithAsyncMetadata;
    private seenComponents;
    private seenDirectives;
    private overriddenModules;
    private existingComponentStyles;
    private resolvers;
    private componentToModuleScope;
    private initialNgDefs;
    private defCleanupOps;
    private _injector;
    private compilerProviders;
    private providerOverrides;
    private rootProviderOverrides;
    private providerOverridesByModule;
    private providerOverridesByToken;
    private scopesWithOverriddenProviders;
    private testModuleType;
    private testModuleRef;
    private animationsEnabled;
    private deferBlockBehavior;
    private rethrowApplicationTickErrors;
    constructor(platform: PlatformRef, additionalModuleTypes: Type<any> | Type<any>[]);
    setCompilerProviders(providers: Provider[] | null): void;
    configureTestingModule(moduleDef: TestModuleMetadata): void;
    overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): void;
    overrideComponent(component: Type<any>, override: MetadataOverride<Component>): void;
    overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>): void;
    overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): void;
    private verifyNoStandaloneFlagOverrides;
    overrideProvider(token: any, provider: {
        useFactory?: Function;
        useValue?: any;
        deps?: any[];
        multi?: boolean;
    }): void;
    overrideTemplateUsingTestingModule(type: Type<any>, template: string): void;
    private resolvePendingComponentsWithAsyncMetadata;
    compileComponents(): Promise<void>;
    finalize(): NgModuleRef<any>;
    /**
     * @internal
     */
    _compileNgModuleSync(moduleType: Type<any>): void;
    /**
     * @internal
     */
    _compileNgModuleAsync(moduleType: Type<any>): Promise<void>;
    /**
     * @internal
     */
    _getModuleResolver(): Resolver<NgModule>;
    /**
     * @internal
     */
    _getComponentFactories(moduleType: NgModuleType): ComponentFactory<any>[];
    private compileTypesSync;
    private applyTransitiveScopes;
    private applyProviderOverrides;
    /**
     * Applies provider overrides to a given type (either an NgModule or a standalone component)
     * and all imported NgModules and standalone components recursively.
     */
    private applyProviderOverridesInScope;
    private patchComponentsWithExistingStyles;
    private queueTypeArray;
    private recompileNgModule;
    private maybeRegisterComponentWithAsyncMetadata;
    private queueType;
    private queueTypesFromModulesArray;
    private collectModulesAffectedByOverrides;
    /**
     * Preserve an original def (such as ɵmod, ɵinj, etc) before applying an override.
     * Note: one class may have multiple defs (for example: ɵmod and ɵinj in case of
     * an NgModule). If there is a def in a set already, don't override it, since
     * an original one should be restored at the end of a test.
     */
    private maybeStoreNgDef;
    private storeFieldOfDefOnType;
    /**
     * Clears current components resolution queue, but stores the state of the queue, so we can
     * restore it later. Clearing the queue is required before we try to compile components (via
     * `TestBed.compileComponents`), so that component defs are in sync with the resolution queue.
     */
    private clearComponentResolutionQueue;
    private restoreComponentResolutionQueue;
    restoreOriginalState(): void;
    private compileTestModule;
    get injector(): Injector;
    private getSingleProviderOverrides;
    private getProviderOverrides;
    private getOverriddenProviders;
    private hasProviderOverrides;
    private patchDefWithProviderOverrides;
}
