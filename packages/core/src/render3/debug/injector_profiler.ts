/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {FactoryProvider, ProviderToken} from '../../di';
import {resolveForwardRef} from '../../di/forward_ref';
import {InjectionToken} from '../../di/injection_token';
import type {Injector} from '../../di/injector';
import {InjectOptions, InternalInjectFlags} from '../../di/interface/injector';
import type {SingleProvider} from '../../di/provider_collection';
import {Type} from '../../interface/type';
import {throwError} from '../../util/assert';
import type {TNode} from '../interfaces/node';
import type {LView} from '../interfaces/view';
import type {EffectRef} from '../reactivity/effect';

/**
 * An enum describing the types of events that can be emitted from the injector profiler
 */
export const enum InjectorProfilerEventType {
  /**
   * Emits when a service is injected.
   */
  Inject,

  /**
   * Emits when an Angular class instance is created by an injector.
   */
  InstanceCreatedByInjector,

  /**
   * Emits when an injector configures a provider.
   */
  ProviderConfigured,

  /**
   * Emits when an effect is created.
   */
  EffectCreated,

  /**
   * Emits when an Angular DI system is about to create an instance corresponding to a given token.
   */
  InjectorToCreateInstanceEvent,
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

export type InjectorProfilerEvent =
  | InjectedServiceEvent
  | InjectorToCreateInstanceEvent
  | InjectorCreatedInstanceEvent
  | ProviderConfiguredEvent
  | EffectCreatedEvent;

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
  injectedIn?: {lView: LView; tNode: TNode};
}

export interface InjectorProfiler {
  (event: InjectorProfilerEvent): void;
}

let _injectorProfilerContext: InjectorProfilerContext;
export function getInjectorProfilerContext() {
  !ngDevMode && throwError('getInjectorProfilerContext should never be called in production mode');
  return _injectorProfilerContext;
}

export function setInjectorProfilerContext(context: InjectorProfilerContext) {
  !ngDevMode && throwError('setInjectorProfilerContext should never be called in production mode');

  const previous = _injectorProfilerContext;
  _injectorProfilerContext = context;
  return previous;
}

const injectorProfilerCallbacks: InjectorProfiler[] = [];

const NOOP_PROFILER_REMOVAL = () => {};

function removeProfiler(profiler: InjectorProfiler) {
  const profilerIdx = injectorProfilerCallbacks.indexOf(profiler);
  if (profilerIdx !== -1) {
    injectorProfilerCallbacks.splice(profilerIdx, 1);
  }
}

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
export function setInjectorProfiler(injectorProfiler: InjectorProfiler | null): () => void {
  !ngDevMode && throwError('setInjectorProfiler should never be called in production mode');

  if (injectorProfiler !== null) {
    if (!injectorProfilerCallbacks.includes(injectorProfiler)) {
      injectorProfilerCallbacks.push(injectorProfiler);
    }
    return () => removeProfiler(injectorProfiler);
  } else {
    injectorProfilerCallbacks.length = 0;
    return NOOP_PROFILER_REMOVAL;
  }
}

/**
 * Injector profiler function which emits on DI events executed by the runtime.
 *
 * @param event InjectorProfilerEvent corresponding to the DI event being emitted
 */
export function injectorProfiler(event: InjectorProfilerEvent): void {
  !ngDevMode && throwError('Injector profiler should never be called in production mode');

  for (let i = 0; i < injectorProfilerCallbacks.length; i++) {
    const injectorProfilerCallback = injectorProfilerCallbacks[i];
    injectorProfilerCallback(event);
  }
}

/**
 * Emits an InjectorProfilerEventType.ProviderConfigured to the injector profiler. The data in the
 * emitted event includes the raw provider, as well as the token that provider is providing.
 *
 * @param eventProvider A provider object
 */
export function emitProviderConfiguredEvent(
  eventProvider: SingleProvider,
  isViewProvider: boolean = false,
): void {
  !ngDevMode && throwError('Injector profiler should never be called in production mode');

  let token;
  // if the provider is a TypeProvider (typeof provider is function) then the token is the
  // provider itself
  if (typeof eventProvider === 'function') {
    token = eventProvider;
  }
  // if the provider is an injection token, then the token is the injection token.
  else if (eventProvider instanceof InjectionToken) {
    token = eventProvider;
  }
  // in all other cases we can access the token via the `provide` property of the provider
  else {
    token = resolveForwardRef(eventProvider.provide);
  }

  let provider = eventProvider;
  // Injection tokens may define their own default provider which gets attached to the token itself
  // as `ɵprov`. In this case, we want to emit the provider that is attached to the token, not the
  // token itself.
  if (eventProvider instanceof InjectionToken) {
    provider = (eventProvider.ɵprov as FactoryProvider) || eventProvider;
  }

  injectorProfiler({
    type: InjectorProfilerEventType.ProviderConfigured,
    context: getInjectorProfilerContext(),
    providerRecord: {token, provider, isViewProvider},
  });
}

/**
 * Emits an event to the injector profiler when an instance corresponding to a given token is about to be created be an injector. Note that
 * the injector associated with this emission can be accessed by using getDebugInjectContext()
 *
 * @param instance an object created by an injector
 */
export function emitInjectorToCreateInstanceEvent(token: ProviderToken<unknown>): void {
  !ngDevMode && throwError('Injector profiler should never be called in production mode');

  injectorProfiler({
    type: InjectorProfilerEventType.InjectorToCreateInstanceEvent,
    context: getInjectorProfilerContext(),
    token: token,
  });
}

/**
 * Emits an event to the injector profiler with the instance that was created. Note that
 * the injector associated with this emission can be accessed by using getDebugInjectContext()
 *
 * @param instance an object created by an injector
 */
export function emitInstanceCreatedByInjectorEvent(instance: unknown): void {
  !ngDevMode && throwError('Injector profiler should never be called in production mode');

  injectorProfiler({
    type: InjectorProfilerEventType.InstanceCreatedByInjector,
    context: getInjectorProfilerContext(),
    instance: {value: instance},
  });
}

/**
 * @param token DI token associated with injected service
 * @param value the instance of the injected service (i.e the result of `inject(token)`)
 * @param flags the flags that the token was injected with
 */
export function emitInjectEvent(
  token: Type<unknown>,
  value: unknown,
  flags: InternalInjectFlags,
): void {
  !ngDevMode && throwError('Injector profiler should never be called in production mode');

  injectorProfiler({
    type: InjectorProfilerEventType.Inject,
    context: getInjectorProfilerContext(),
    service: {token, value, flags},
  });
}

export function emitEffectCreatedEvent(effect: EffectRef): void {
  !ngDevMode && throwError('Injector profiler should never be called in production mode');

  injectorProfiler({
    type: InjectorProfilerEventType.EffectCreated,
    context: getInjectorProfilerContext(),
    effect,
  });
}

export function runInInjectorProfilerContext(
  injector: Injector,
  token: Type<unknown>,
  callback: () => void,
): void {
  !ngDevMode &&
    throwError('runInInjectorProfilerContext should never be called in production mode');

  const prevInjectContext = setInjectorProfilerContext({injector, token});
  try {
    callback();
  } finally {
    setInjectorProfilerContext(prevInjectContext);
  }
}
