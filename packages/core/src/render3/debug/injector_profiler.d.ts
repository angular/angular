/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { ProviderToken } from '../../di';
import { InjectionToken } from '../../di/injection_token';
import type { Injector } from '../../di/injector';
import { InjectOptions, InternalInjectFlags } from '../../di/interface/injector';
import type { SingleProvider } from '../../di/provider_collection';
import { Type } from '../../interface/type';
import type { TNode } from '../interfaces/node';
import type { LView } from '../interfaces/view';
import type { EffectRef } from '../reactivity/effect';
/**
 * An enum describing the types of events that can be emitted from the injector profiler
 */
export declare const enum InjectorProfilerEventType {
    /**
     * Emits when a service is injected.
     */
    Inject = 0,
    /**
     * Emits when an Angular class instance is created by an injector.
     */
    InstanceCreatedByInjector = 1,
    /**
     * Emits when an injector configures a provider.
     */
    ProviderConfigured = 2,
    /**
     * Emits when an effect is created.
     */
    EffectCreated = 3,
    /**
     * Emits when an Angular DI system is about to create an instance corresponding to a given token.
     */
    InjectorToCreateInstanceEvent = 4
}
/**
 * An object that defines an injection context for the injector profiler.
 */
export interface InjectorProfilerContext {
    /**
     *  The Injector that service is being injected into.
     *      - Example: if ModuleA --provides--> ServiceA --injects--> ServiceB
     *                 then inject(ServiceB) in ServiceA has ModuleA as an injector context
     */
    injector: Injector;
    /**
     *  The class where the constructor that is calling `inject` is located
     *      - Example: if ModuleA --provides--> ServiceA --injects--> ServiceB
     *                 then inject(ServiceB) in ServiceA has ServiceA as a construction context
     */
    token: Type<unknown> | null;
}
export interface InjectedServiceEvent {
    type: InjectorProfilerEventType.Inject;
    context: InjectorProfilerContext;
    service: InjectedService;
}
export interface InjectorToCreateInstanceEvent {
    type: InjectorProfilerEventType.InjectorToCreateInstanceEvent;
    context: InjectorProfilerContext;
    token: ProviderToken<unknown>;
}
export interface InjectorCreatedInstanceEvent {
    type: InjectorProfilerEventType.InstanceCreatedByInjector;
    context: InjectorProfilerContext;
    instance: InjectorCreatedInstance;
}
export interface ProviderConfiguredEvent {
    type: InjectorProfilerEventType.ProviderConfigured;
    context: InjectorProfilerContext;
    providerRecord: ProviderRecord;
}
export interface EffectCreatedEvent {
    type: InjectorProfilerEventType.EffectCreated;
    context: InjectorProfilerContext;
    effect: EffectRef;
}
/**
 * An object representing an event that is emitted through the injector profiler
 */
export type InjectorProfilerEvent = InjectedServiceEvent | InjectorToCreateInstanceEvent | InjectorCreatedInstanceEvent | ProviderConfiguredEvent | EffectCreatedEvent;
/**
 * An object that contains information about a provider that has been configured
 *
 * TODO: rename to indicate that it is a debug structure eg. ProviderDebugInfo.
 */
export interface ProviderRecord {
    /**
     * DI token that this provider is configuring
     */
    token: Type<unknown> | InjectionToken<unknown>;
    /**
     * Determines if provider is configured as view provider.
     */
    isViewProvider: boolean;
    /**
     * The raw provider associated with this ProviderRecord.
     */
    provider: SingleProvider;
    /**
     * The path of DI containers that were followed to import this provider
     */
    importPath?: Type<unknown>[];
}
/**
 * An object that contains information about a value that has been constructed within an injector
 */
export interface InjectorCreatedInstance {
    /**
     * Value of the created instance
     */
    value: unknown;
}
/**
 * An object that contains information a service that has been injected within an
 * InjectorProfilerContext
 */
export interface InjectedService {
    /**
     * DI token of the Service that is injected
     */
    token?: Type<unknown> | InjectionToken<unknown>;
    /**
     * Value of the injected service
     */
    value: unknown;
    /**
     * Flags that this service was injected with
     */
    flags?: InternalInjectFlags | InjectOptions;
    /**
     * Injector that this service was provided in.
     */
    providedIn?: Injector;
    /**
     * In NodeInjectors, the LView and TNode that serviced this injection.
     */
    injectedIn?: {
        lView: LView;
        tNode: TNode;
    };
}
export interface InjectorProfiler {
    (event: InjectorProfilerEvent): void;
}
export declare function getInjectorProfilerContext(): InjectorProfilerContext;
export declare function setInjectorProfilerContext(context: InjectorProfilerContext): InjectorProfilerContext;
/**
 * Adds a callback function which will be invoked during certain DI events within the
 * runtime (for example: injecting services, creating injectable instances, configuring providers).
 * Multiple profiler callbacks can be set: in this case profiling events are
 * reported to every registered callback.
 *
 * Warning: this function is *INTERNAL* and should not be relied upon in application's code.
 * The contract of the function might be changed in any release and/or the function can be removed
 * completely.
 *
 * @param profiler function provided by the caller or null value to disable profiling.
 * @returns a cleanup function that, when invoked, removes a given profiler callback.
 */
export declare function setInjectorProfiler(injectorProfiler: InjectorProfiler | null): () => void;
/**
 * Injector profiler function which emits on DI events executed by the runtime.
 *
 * @param event InjectorProfilerEvent corresponding to the DI event being emitted
 */
export declare function injectorProfiler(event: InjectorProfilerEvent): void;
/**
 * Emits an InjectorProfilerEventType.ProviderConfigured to the injector profiler. The data in the
 * emitted event includes the raw provider, as well as the token that provider is providing.
 *
 * @param eventProvider A provider object
 */
export declare function emitProviderConfiguredEvent(eventProvider: SingleProvider, isViewProvider?: boolean): void;
/**
 * Emits an event to the injector profiler when an instance corresponding to a given token is about to be created be an injector. Note that
 * the injector associated with this emission can be accessed by using getDebugInjectContext()
 *
 * @param instance an object created by an injector
 */
export declare function emitInjectorToCreateInstanceEvent(token: ProviderToken<unknown>): void;
/**
 * Emits an event to the injector profiler with the instance that was created. Note that
 * the injector associated with this emission can be accessed by using getDebugInjectContext()
 *
 * @param instance an object created by an injector
 */
export declare function emitInstanceCreatedByInjectorEvent(instance: unknown): void;
/**
 * @param token DI token associated with injected service
 * @param value the instance of the injected service (i.e the result of `inject(token)`)
 * @param flags the flags that the token was injected with
 */
export declare function emitInjectEvent(token: Type<unknown>, value: unknown, flags: InternalInjectFlags): void;
export declare function emitEffectCreatedEvent(effect: EffectRef): void;
export declare function runInInjectorProfilerContext(injector: Injector, token: Type<unknown>, callback: () => void): void;
