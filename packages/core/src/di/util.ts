/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {ReflectionCapabilities} from '../reflection/reflection_capabilities';
import {EMPTY_ARRAY} from '../util/empty';
import {getClosureSafeProperty} from '../util/property';

import {resolveForwardRef} from './forward_ref';
import {injectArgs, ɵɵinject} from './injector_compatibility';
import {ClassSansProvider, ConstructorSansProvider, ExistingSansProvider, FactorySansProvider, StaticClassSansProvider, ValueProvider, ValueSansProvider} from './interface/provider';

const USE_VALUE =
    getClosureSafeProperty<ValueProvider>({provide: String, useValue: getClosureSafeProperty});

export function convertInjectableProviderToFactory(
    type: Type<any>,
    provider?: ValueSansProvider|ExistingSansProvider|StaticClassSansProvider|
    ConstructorSansProvider|FactorySansProvider|ClassSansProvider): () => any {
  if (!provider) {
    const reflectionCapabilities = new ReflectionCapabilities();
    const deps = reflectionCapabilities.parameters(type);
    // TODO - convert to flags.
    return () => new type(...injectArgs(deps as any[]));
  }

  if (USE_VALUE in provider) {
    const valueProvider = (provider as ValueSansProvider);
    return () => valueProvider.useValue;
  } else if ((provider as ExistingSansProvider).useExisting) {
    const existingProvider = (provider as ExistingSansProvider);
    return () => ɵɵinject(resolveForwardRef(existingProvider.useExisting));
  } else if ((provider as FactorySansProvider).useFactory) {
    const factoryProvider = (provider as FactorySansProvider);
    return () => factoryProvider.useFactory(...injectArgs(factoryProvider.deps || EMPTY_ARRAY));
  } else if ((provider as StaticClassSansProvider | ClassSansProvider).useClass) {
    const classProvider = (provider as StaticClassSansProvider | ClassSansProvider);
    let deps = (provider as StaticClassSansProvider).deps;
    if (!deps) {
      const reflectionCapabilities = new ReflectionCapabilities();
      deps = reflectionCapabilities.parameters(type);
    }
    return () => new (resolveForwardRef(classProvider.useClass))(...injectArgs(deps));
  } else {
    let deps = (provider as ConstructorSansProvider).deps;
    if (!deps) {
      const reflectionCapabilities = new ReflectionCapabilities();
      deps = reflectionCapabilities.parameters(type);
    }
    return () => new type(...injectArgs(deps!));
  }
}
