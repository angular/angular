/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InjectionToken} from '../di';
import {resolveForwardRef} from '../di/forward_ref';
import {isClassProvider, isTypeProvider} from '../di/provider_collection';
import {providerToFactory} from '../di/r3_injector';
import {assertDefined} from '../util/assert';
import {emitProviderConfiguredEvent, runInInjectorProfilerContext} from './debug/injector_profiler';
import {
  diPublicInInjector,
  getNodeInjectable,
  getOrCreateNodeInjectorForNode,
  NodeInjector,
} from './di';
import {ɵɵdirectiveInject} from './instructions/all';
import {NodeInjectorFactory} from './interfaces/injector';
import {isComponentDef} from './interfaces/type_checks';
import {TVIEW} from './interfaces/view';
import {getCurrentTNode, getLView, getTView} from './state';
/**
 * Resolves the providers which are defined in the DirectiveDef.
 *
 * When inserting the tokens and the factories in their respective arrays, we can assume that
 * this method is called first for the component (if any), and then for other directives on the same
 * node.
 * As a consequence,the providers are always processed in that order:
 * 1) The view providers of the component
 * 2) The providers of the component
 * 3) The providers of the other directives
 * This matches the structure of the injectables arrays of a view (for each node).
 * So the tokens and the factories can be pushed at the end of the arrays, except
 * in one case for multi providers.
 *
 * @param def the directive definition
 * @param providers: Array of `providers`.
 * @param viewProviders: Array of `viewProviders`.
 */
export function providersResolver(def, providers, viewProviders) {
  const tView = getTView();
  if (tView.firstCreatePass) {
    const isComponent = isComponentDef(def);
    // The list of view providers is processed first, and the flags are updated
    resolveProvider(viewProviders, tView.data, tView.blueprint, isComponent, true);
    // Then, the list of providers is processed, and the flags are updated
    resolveProvider(providers, tView.data, tView.blueprint, isComponent, false);
  }
}
/**
 * Resolves a provider and publishes it to the DI system.
 */
function resolveProvider(
  provider,
  tInjectables,
  lInjectablesBlueprint,
  isComponent,
  isViewProvider,
) {
  provider = resolveForwardRef(provider);
  if (Array.isArray(provider)) {
    // Recursively call `resolveProvider`
    // Recursion is OK in this case because this code will not be in hot-path once we implement
    // cloning of the initial state.
    for (let i = 0; i < provider.length; i++) {
      resolveProvider(
        provider[i],
        tInjectables,
        lInjectablesBlueprint,
        isComponent,
        isViewProvider,
      );
    }
  } else {
    const tView = getTView();
    const lView = getLView();
    const tNode = getCurrentTNode();
    let token = isTypeProvider(provider) ? provider : resolveForwardRef(provider.provide);
    const providerFactory = providerToFactory(provider);
    if (ngDevMode) {
      const injector = new NodeInjector(tNode, lView);
      runInInjectorProfilerContext(injector, token, () => {
        emitProviderConfiguredEvent(provider, isViewProvider);
      });
    }
    const beginIndex =
      tNode.providerIndexes & 1048575; /* TNodeProviderIndexes.ProvidersStartIndexMask */
    const endIndex = tNode.directiveStart;
    const cptViewProvidersCount =
      tNode.providerIndexes >> 20; /* TNodeProviderIndexes.CptViewProvidersCountShift */
    if (isTypeProvider(provider) || !provider.multi) {
      const factory = new NodeInjectorFactory(
        providerFactory,
        isViewProvider,
        ɵɵdirectiveInject,
        ngDevMode ? providerName(provider) : null,
      );
      const existingFactoryIndex = indexOf(
        token,
        tInjectables,
        isViewProvider ? beginIndex : beginIndex + cptViewProvidersCount,
        endIndex,
      );
      if (existingFactoryIndex === -1) {
        diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, lView), tView, token);
        registerDestroyHooksIfSupported(tView, provider, tInjectables.length);
        tInjectables.push(token);
        tNode.directiveStart++;
        tNode.directiveEnd++;
        if (isViewProvider) {
          tNode.providerIndexes += 1048576 /* TNodeProviderIndexes.CptViewProvidersCountShifter */;
        }
        lInjectablesBlueprint.push(factory);
        lView.push(factory);
      } else {
        lInjectablesBlueprint[existingFactoryIndex] = factory;
        lView[existingFactoryIndex] = factory;
      }
    } else {
      // Multi provider case:
      // We create a multi factory which is going to aggregate all the values.
      // Since the output of such a factory depends on content or view injection,
      // we create two of them, which are linked together.
      //
      // The first one (for view providers) is always in the first block of the injectables array,
      // and the second one (for providers) is always in the second block.
      // This is important because view providers have higher priority. When a multi token
      // is being looked up, the view providers should be found first.
      // Note that it is not possible to have a multi factory in the third block (directive block).
      //
      // The algorithm to process multi providers is as follows:
      // 1) If the multi provider comes from the `viewProviders` of the component:
      //   a) If the special view providers factory doesn't exist, it is created and pushed.
      //   b) Else, the multi provider is added to the existing multi factory.
      // 2) If the multi provider comes from the `providers` of the component or of another
      // directive:
      //   a) If the multi factory doesn't exist, it is created and provider pushed into it.
      //      It is also linked to the multi factory for view providers, if it exists.
      //   b) Else, the multi provider is added to the existing multi factory.
      const existingProvidersFactoryIndex = indexOf(
        token,
        tInjectables,
        beginIndex + cptViewProvidersCount,
        endIndex,
      );
      const existingViewProvidersFactoryIndex = indexOf(
        token,
        tInjectables,
        beginIndex,
        beginIndex + cptViewProvidersCount,
      );
      const doesProvidersFactoryExist =
        existingProvidersFactoryIndex >= 0 && lInjectablesBlueprint[existingProvidersFactoryIndex];
      const doesViewProvidersFactoryExist =
        existingViewProvidersFactoryIndex >= 0 &&
        lInjectablesBlueprint[existingViewProvidersFactoryIndex];
      if (
        (isViewProvider && !doesViewProvidersFactoryExist) ||
        (!isViewProvider && !doesProvidersFactoryExist)
      ) {
        // Cases 1.a and 2.a
        diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, lView), tView, token);
        const factory = multiFactory(
          isViewProvider ? multiViewProvidersFactoryResolver : multiProvidersFactoryResolver,
          lInjectablesBlueprint.length,
          isViewProvider,
          isComponent,
          providerFactory,
          provider,
        );
        if (!isViewProvider && doesViewProvidersFactoryExist) {
          lInjectablesBlueprint[existingViewProvidersFactoryIndex].providerFactory = factory;
        }
        registerDestroyHooksIfSupported(tView, provider, tInjectables.length, 0);
        tInjectables.push(token);
        tNode.directiveStart++;
        tNode.directiveEnd++;
        if (isViewProvider) {
          tNode.providerIndexes += 1048576 /* TNodeProviderIndexes.CptViewProvidersCountShifter */;
        }
        lInjectablesBlueprint.push(factory);
        lView.push(factory);
      } else {
        // Cases 1.b and 2.b
        const indexInFactory = multiFactoryAdd(
          lInjectablesBlueprint[
            isViewProvider ? existingViewProvidersFactoryIndex : existingProvidersFactoryIndex
          ],
          providerFactory,
          !isViewProvider && isComponent,
        );
        registerDestroyHooksIfSupported(
          tView,
          provider,
          existingProvidersFactoryIndex > -1
            ? existingProvidersFactoryIndex
            : existingViewProvidersFactoryIndex,
          indexInFactory,
        );
      }
      if (!isViewProvider && isComponent && doesViewProvidersFactoryExist) {
        lInjectablesBlueprint[existingViewProvidersFactoryIndex].componentProviders++;
      }
    }
  }
}
/**
 * Registers the `ngOnDestroy` hook of a provider, if the provider supports destroy hooks.
 * @param tView `TView` in which to register the hook.
 * @param provider Provider whose hook should be registered.
 * @param contextIndex Index under which to find the context for the hook when it's being invoked.
 * @param indexInFactory Only required for `multi` providers. Index of the provider in the multi
 * provider factory.
 */
function registerDestroyHooksIfSupported(tView, provider, contextIndex, indexInFactory) {
  const providerIsTypeProvider = isTypeProvider(provider);
  const providerIsClassProvider = isClassProvider(provider);
  if (providerIsTypeProvider || providerIsClassProvider) {
    // Resolve forward references as `useClass` can hold a forward reference.
    const classToken = providerIsClassProvider ? resolveForwardRef(provider.useClass) : provider;
    const prototype = classToken.prototype;
    const ngOnDestroy = prototype.ngOnDestroy;
    if (ngOnDestroy) {
      const hooks = tView.destroyHooks || (tView.destroyHooks = []);
      if (!providerIsTypeProvider && provider.multi) {
        ngDevMode &&
          assertDefined(
            indexInFactory,
            'indexInFactory when registering multi factory destroy hook',
          );
        const existingCallbacksIndex = hooks.indexOf(contextIndex);
        if (existingCallbacksIndex === -1) {
          hooks.push(contextIndex, [indexInFactory, ngOnDestroy]);
        } else {
          hooks[existingCallbacksIndex + 1].push(indexInFactory, ngOnDestroy);
        }
      } else {
        hooks.push(contextIndex, ngOnDestroy);
      }
    }
  }
}
/**
 * Add a factory in a multi factory.
 * @returns Index at which the factory was inserted.
 */
function multiFactoryAdd(multiFactory, factory, isComponentProvider) {
  if (isComponentProvider) {
    multiFactory.componentProviders++;
  }
  return multiFactory.multi.push(factory) - 1;
}
/**
 * Returns the index of item in the array, but only in the begin to end range.
 */
function indexOf(item, arr, begin, end) {
  for (let i = begin; i < end; i++) {
    if (arr[i] === item) return i;
  }
  return -1;
}
/**
 * Use this with `multi` `providers`.
 */
function multiProvidersFactoryResolver(_, flags, tData, lData, tNode) {
  return multiResolve(this.multi, []);
}
/**
 * Use this with `multi` `viewProviders`.
 *
 * This factory knows how to concatenate itself with the existing `multi` `providers`.
 */
function multiViewProvidersFactoryResolver(_, _flags, _tData, lView, tNode) {
  const factories = this.multi;
  let result;
  if (this.providerFactory) {
    const componentCount = this.providerFactory.componentProviders;
    const multiProviders = getNodeInjectable(
      lView,
      lView[TVIEW],
      this.providerFactory.index,
      tNode,
    );
    // Copy the section of the array which contains `multi` `providers` from the component
    result = multiProviders.slice(0, componentCount);
    // Insert the `viewProvider` instances.
    multiResolve(factories, result);
    // Copy the section of the array which contains `multi` `providers` from other directives
    for (let i = componentCount; i < multiProviders.length; i++) {
      result.push(multiProviders[i]);
    }
  } else {
    result = [];
    // Insert the `viewProvider` instances.
    multiResolve(factories, result);
  }
  return result;
}
/**
 * Maps an array of factories into an array of values.
 */
function multiResolve(factories, result) {
  for (let i = 0; i < factories.length; i++) {
    const factory = factories[i];
    result.push(factory());
  }
  return result;
}
/**
 * Creates a multi factory.
 */
function multiFactory(factoryFn, index, isViewProvider, isComponent, f, provider) {
  const factory = new NodeInjectorFactory(
    factoryFn,
    isViewProvider,
    ɵɵdirectiveInject,
    ngDevMode ? providerName(provider) : null,
  );
  factory.multi = [];
  factory.index = index;
  factory.componentProviders = 0;
  multiFactoryAdd(factory, f, isComponent && !isViewProvider);
  return factory;
}
function providerName(provider) {
  if (Array.isArray(provider)) {
    return null;
  }
  if (isTypeProvider(provider)) {
    return provider.name;
  } else if (isClassProvider(provider)) {
    if (provider.provide instanceof InjectionToken) {
      return `('${provider.provide.toString()}':${provider.useClass.name})`;
    }
    return provider.useClass.name;
  } else if (provider.provide instanceof InjectionToken) {
    return provider.provide.toString();
  } else if (typeof provider.provide === 'string') {
    return provider.provide;
  } else {
    return null;
  }
}
//# sourceMappingURL=di_setup.js.map
