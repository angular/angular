/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '../di/injector';
import { EnvironmentProviders, Provider, StaticProvider } from '../di/interface/provider';
import { EnvironmentInjector, R3Injector } from '../di/r3_injector';
import { Type } from '../interface/type';
import { InternalNgModuleRef, NgModuleFactory as viewEngine_NgModuleFactory, NgModuleRef as viewEngine_NgModuleRef } from '../linker/ng_module_factory';
import { ComponentFactoryResolver } from './component_ref';
/**
 * Returns a new NgModuleRef instance based on the NgModule class and parent injector provided.
 *
 * @param ngModule NgModule class.
 * @param parentInjector Optional injector instance to use as a parent for the module injector. If
 *     not provided, `NullInjector` will be used instead.
 * @returns NgModuleRef that represents an NgModule instance.
 *
 * @publicApi
 */
export declare function createNgModule<T>(ngModule: Type<T>, parentInjector?: Injector): viewEngine_NgModuleRef<T>;
/**
 * The `createNgModule` function alias for backwards-compatibility.
 * Please avoid using it directly and use `createNgModule` instead.
 *
 * @deprecated Use `createNgModule` instead.
 */
export declare const createNgModuleRef: typeof createNgModule;
export declare class NgModuleRef<T> extends viewEngine_NgModuleRef<T> implements InternalNgModuleRef<T> {
    private readonly ngModuleType;
    _parent: Injector | null;
    _bootstrapComponents: Type<any>[];
    private readonly _r3Injector;
    instance: T;
    destroyCbs: (() => void)[] | null;
    readonly componentFactoryResolver: ComponentFactoryResolver;
    constructor(ngModuleType: Type<T>, _parent: Injector | null, additionalProviders: StaticProvider[], runInjectorInitializers?: boolean);
    resolveInjectorInitializers(): void;
    get injector(): EnvironmentInjector;
    destroy(): void;
    onDestroy(callback: () => void): void;
}
export declare class NgModuleFactory<T> extends viewEngine_NgModuleFactory<T> {
    moduleType: Type<T>;
    constructor(moduleType: Type<T>);
    create(parentInjector: Injector | null): viewEngine_NgModuleRef<T>;
}
export declare function createNgModuleRefWithProviders<T>(moduleType: Type<T>, parentInjector: Injector | null, additionalProviders: StaticProvider[]): InternalNgModuleRef<T>;
export declare class EnvironmentNgModuleRefAdapter extends viewEngine_NgModuleRef<null> {
    readonly injector: R3Injector;
    readonly componentFactoryResolver: ComponentFactoryResolver;
    readonly instance: null;
    constructor(config: {
        providers: Array<Provider | EnvironmentProviders>;
        parent: EnvironmentInjector | null;
        debugName: string | null;
        runEnvironmentInitializers: boolean;
    });
    destroy(): void;
    onDestroy(callback: () => void): void;
}
/**
 * Create a new environment injector.
 *
 * @param providers An array of providers.
 * @param parent A parent environment injector.
 * @param debugName An optional name for this injector instance, which will be used in error
 *     messages.
 *
 * @publicApi
 */
export declare function createEnvironmentInjector(providers: Array<Provider | EnvironmentProviders>, parent: EnvironmentInjector, debugName?: string | null): EnvironmentInjector;
