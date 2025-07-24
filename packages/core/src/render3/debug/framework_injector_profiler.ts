/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '../../di/injector';
import {EnvironmentInjector} from '../../di/r3_injector';
import {Type} from '../../interface/type';
import {assertDefined, throwError} from '../../util/assert';
import {assertTNodeForLView} from '../assert';
import {getComponentDef} from '../def_getters';
import {getNodeInjectorLView, getNodeInjectorTNode, NodeInjector} from '../di';
import {TNode} from '../interfaces/node';
import {LView} from '../interfaces/view';
import {EffectRef} from '../reactivity/effect';

import {
  InjectedService,
  InjectorCreatedInstance,
  InjectorProfiler,
  InjectorProfilerContext,
  InjectorProfilerEvent,
  InjectorProfilerEventType,
  ProviderRecord,
  setInjectorProfiler,
} from './injector_profiler';

/**
 * These are the data structures that our framework injector profiler will fill with data in order
 * to support DI debugging APIs.
 *
 * resolverToTokenToDependencies: Maps an injector to a Map of tokens to an Array of
 * dependencies. Injector -> Token -> Dependencies This is used to support the
 * getDependenciesFromInjectable API, which takes in an injector and a token and returns it's
 * dependencies.
 *
 * resolverToProviders: Maps a DI resolver (an Injector or a TNode) to the providers configured
 * within it This is used to support the getInjectorProviders API, which takes in an injector and
 * returns the providers that it was configured with. Note that for the element injector case we
 * use the TNode instead of the LView as the DI resolver. This is because the registration of
 * providers happens only once per type of TNode. If an injector is created with an identical TNode,
 * the providers for that injector will not be reconfigured.
 *
 * standaloneInjectorToComponent: Maps the injector of a standalone component to the standalone
 * component that it is associated with. Used in the getInjectorProviders API, specificially in the
 * discovery of import paths for each provider. This is necessary because the imports array of a
 * standalone component is processed and configured in its standalone injector, but exists within
 * the component's definition. Because getInjectorProviders takes in an injector, if that injector
 * is the injector of a standalone component, we need to be able to discover the place where the
 * imports array is located (the component) in order to flatten the imports array within it to
 * discover all of it's providers.
 *
 *
 * All of these data structures are instantiated with WeakMaps. This will ensure that the presence
 * of any object in the keys of these maps does not prevent the garbage collector from collecting
 * those objects. Because of this property of WeakMaps, these data structures will never be the
 * source of a memory leak.
 *
 * An example of this advantage: When components are destroyed, we don't need to do
 * any additional work to remove that component from our mappings.
 *
 */
class DIDebugData {
  resolverToTokenToDependencies = new WeakMap<
    Injector | LView,
    WeakMap<Type<unknown>, InjectedService[]>
  >();
  resolverToProviders = new WeakMap<Injector | TNode, ProviderRecord[]>();
  resolverToEffects = new WeakMap<Injector | LView, EffectRef[]>();
  standaloneInjectorToComponent = new WeakMap<Injector, Type<unknown>>();

  reset() {
    this.resolverToTokenToDependencies = new WeakMap<
      Injector | LView,
      WeakMap<Type<unknown>, InjectedService[]>
    >();
    this.resolverToProviders = new WeakMap<Injector | TNode, ProviderRecord[]>();
    this.standaloneInjectorToComponent = new WeakMap<Injector, Type<unknown>>();
  }
}

let frameworkDIDebugData = new DIDebugData();

export function getFrameworkDIDebugData(): DIDebugData {
  return frameworkDIDebugData;
}

/**
 * Initalize default handling of injector events. This handling parses events
 * as they are emitted and constructs the data structures necessary to support
 * some of debug APIs.
 *
 * See handleInjectEvent, handleCreateEvent and handleProviderConfiguredEvent
 * for descriptions of each handler
 *
 * Supported APIs:
 *               - getDependenciesFromInjectable
 *               - getInjectorProviders
 */
export function setupFrameworkInjectorProfiler(): void {
  frameworkDIDebugData.reset();
  setInjectorProfiler(injectorProfilerEventHandler);
}

function injectorProfilerEventHandler(injectorProfilerEvent: InjectorProfilerEvent): void {
  const {context, type} = injectorProfilerEvent;

  if (type === InjectorProfilerEventType.Inject) {
    handleInjectEvent(context, injectorProfilerEvent.service);
  } else if (type === InjectorProfilerEventType.InstanceCreatedByInjector) {
    handleInstanceCreatedByInjectorEvent(context, injectorProfilerEvent.instance);
  } else if (type === InjectorProfilerEventType.ProviderConfigured) {
    handleProviderConfiguredEvent(context, injectorProfilerEvent.providerRecord);
  } else if (type === InjectorProfilerEventType.EffectCreated) {
    handleEffectCreatedEvent(context, injectorProfilerEvent.effect);
  }
}

function handleEffectCreatedEvent(context: InjectorProfilerContext, effect: EffectRef): void {
  const diResolver = getDIResolver(context.injector);
  if (diResolver === null) {
    throwError('An EffectCreated event must be run within an injection context.');
  }

  const {resolverToEffects} = frameworkDIDebugData;

  if (!resolverToEffects.has(diResolver)) {
    resolverToEffects.set(diResolver, []);
  }

  resolverToEffects.get(diResolver)!.push(effect);
}

/**
 *
 * Stores the injected service in frameworkDIDebugData.resolverToTokenToDependencies
 * based on it's injector and token.
 *
 * @param context InjectorProfilerContext the injection context that this event occurred in.
 * @param data InjectedService the service associated with this inject event.
 *
 */
function handleInjectEvent(context: InjectorProfilerContext, data: InjectedService) {
  const diResolver = getDIResolver(context.injector);
  if (diResolver === null) {
    throwError('An Inject event must be run within an injection context.');
  }

  const diResolverToInstantiatedToken = frameworkDIDebugData.resolverToTokenToDependencies;

  if (!diResolverToInstantiatedToken.has(diResolver)) {
    diResolverToInstantiatedToken.set(diResolver, new WeakMap<Type<unknown>, InjectedService[]>());
  }

  // if token is a primitive type, ignore this event. We do this because we cannot keep track of
  // non-primitive tokens in WeakMaps since they are not garbage collectable.
  if (!canBeHeldWeakly(context.token)) {
    return;
  }

  const instantiatedTokenToDependencies = diResolverToInstantiatedToken.get(diResolver)!;
  if (!instantiatedTokenToDependencies.has(context.token!)) {
    instantiatedTokenToDependencies.set(context.token!, []);
  }

  const {token, value, flags} = data;

  assertDefined(context.token, 'Injector profiler context token is undefined.');

  const dependencies = instantiatedTokenToDependencies.get(context.token);
  assertDefined(dependencies, 'Could not resolve dependencies for token.');

  if (context.injector instanceof NodeInjector) {
    dependencies.push({token, value, flags, injectedIn: getNodeInjectorContext(context.injector)});
  } else {
    dependencies.push({token, value, flags});
  }
}

/**
 *
 * Returns the LView and TNode associated with a NodeInjector. Returns undefined if the injector
 * is not a NodeInjector.
 *
 * @param injector
 * @returns {lView: LView, tNode: TNode}|undefined
 */
function getNodeInjectorContext(injector: Injector): {lView: LView; tNode: TNode} | undefined {
  if (!(injector instanceof NodeInjector)) {
    throwError('getNodeInjectorContext must be called with a NodeInjector');
  }

  const lView = getNodeInjectorLView(injector);
  const tNode = getNodeInjectorTNode(injector);
  if (tNode === null) {
    return;
  }

  assertTNodeForLView(tNode, lView);

  return {lView, tNode};
}

/**
 *
 * If the created instance is an instance of a standalone component, maps the injector to that
 * standalone component in frameworkDIDebugData.standaloneInjectorToComponent
 *
 * @param context InjectorProfilerContext the injection context that this event occurred in.
 * @param data InjectorCreatedInstance an object containing the instance that was just created
 *
 */
function handleInstanceCreatedByInjectorEvent(
  context: InjectorProfilerContext,
  data: InjectorCreatedInstance,
): void {
  const {value} = data;

  // It might happen that a DI token is requested but there is no corresponding value.
  // The InstanceCreatedByInjectorEvent will be still emitted in this case (to mirror the InjectorToCreateInstanceEvent) but we don't want to do any particular processing for those situations.
  if (data.value == null) {
    return;
  }

  if (getDIResolver(context.injector) === null) {
    throwError('An InjectorCreatedInstance event must be run within an injection context.');
  }

  // if our value is an instance of a standalone component, map the injector of that standalone
  // component to the component class. Otherwise, this event is a noop.
  let standaloneComponent: Type<unknown> | undefined | null = undefined;
  if (typeof value === 'object') {
    standaloneComponent = value?.constructor as Type<unknown> | undefined | null;
  }

  // We want to also cover if `standaloneComponent === null` in addition to `undefined`
  if (standaloneComponent == undefined || !isStandaloneComponent(standaloneComponent)) {
    return;
  }

  const environmentInjector: EnvironmentInjector | null = context.injector.get(
    EnvironmentInjector,
    null,
    {optional: true},
  );
  // Standalone components should have an environment injector. If one cannot be
  // found we may be in a test case for low level functionality that did not explicitly
  // setup this injector. In those cases, we simply ignore this event.
  if (environmentInjector === null) {
    return;
  }

  const {standaloneInjectorToComponent} = frameworkDIDebugData;

  // If our injector has already been mapped, as is the case
  // when a standalone component imports another standalone component,
  // we consider the original component (the component doing the importing)
  // as the component connected to our injector.
  if (standaloneInjectorToComponent.has(environmentInjector)) {
    return;
  }
  // If our injector hasn't been mapped, then we map it to the standalone component
  standaloneInjectorToComponent.set(environmentInjector, standaloneComponent);
}

function isStandaloneComponent(value: Type<unknown>): boolean {
  const def = getComponentDef(value);
  return !!def?.standalone;
}

/**
 *
 * Stores the emitted ProviderRecords from the InjectorProfilerEventType.ProviderConfigured
 * event in frameworkDIDebugData.resolverToProviders
 *
 * @param context InjectorProfilerContext the injection context that this event occurred in.
 * @param data ProviderRecord an object containing the instance that was just created
 *
 */
function handleProviderConfiguredEvent(
  context: InjectorProfilerContext,
  data: ProviderRecord,
): void {
  const {resolverToProviders} = frameworkDIDebugData;

  let diResolver: Injector | TNode;
  if (context?.injector instanceof NodeInjector) {
    diResolver = getNodeInjectorTNode(context.injector) as TNode;
  } else {
    diResolver = context.injector;
  }

  if (diResolver === null) {
    throwError('A ProviderConfigured event must be run within an injection context.');
  }

  if (!resolverToProviders.has(diResolver)) {
    resolverToProviders.set(diResolver, []);
  }

  resolverToProviders.get(diResolver)!.push(data);
}

function getDIResolver(injector: Injector | undefined): Injector | LView | null {
  let diResolver: Injector | LView | null = null;

  if (injector === undefined) {
    return diResolver;
  }

  // We use the LView as the diResolver for NodeInjectors because they
  // do not persist anywhere in the framework. They are simply wrappers around an LView and a TNode
  // that do persist. Because of this, we rely on the LView of the NodeInjector in order to use
  // as a concrete key to represent this injector. If we get the same LView back later, we know
  // we're looking at the same injector.
  if (injector instanceof NodeInjector) {
    diResolver = getNodeInjectorLView(injector);
  }
  // Other injectors can be used a keys for a map because their instances
  // persist
  else {
    diResolver = injector;
  }

  return diResolver;
}

// inspired by
// https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#sec-canbeheldweakly
function canBeHeldWeakly(value: any): boolean {
  // we check for value !== null here because typeof null === 'object
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function' || typeof value === 'symbol')
  );
}
