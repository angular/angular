/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {ReflectionCapabilities} from '../reflection/reflection_capabilities';
import {getClosureSafeProperty} from '../util/property';

import {resolveForwardRef} from './forward_ref';
import {InjectionToken} from './injection_token';
import {ɵɵinject} from './injector_compatibility';
import {InjectFlags} from './interface/injector';
import {ClassSansProvider, ConstructorSansProvider, ExistingSansProvider, FactorySansProvider, StaticClassSansProvider, ValueProvider, ValueSansProvider} from './interface/provider';
import {Inject, Optional, Self, SkipSelf} from './metadata';

const USE_VALUE =
    getClosureSafeProperty<ValueProvider>({provide: String, useValue: getClosureSafeProperty});
const EMPTY_ARRAY: any[] = [];

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

export function injectArgs(types: (Type<any>|InjectionToken<any>|any[])[]): any[] {
  const args: any[] = [];
  for (let i = 0; i < types.length; i++) {
    const arg = resolveForwardRef(types[i]);
    if (Array.isArray(arg)) {
      if (arg.length === 0) {
        throw new Error('Arguments array must have arguments.');
      }
      let type: Type<any>|undefined = undefined;
      let flags: InjectFlags = InjectFlags.Default;

      for (let j = 0; j < arg.length; j++) {
        const meta = arg[j];
        if (meta instanceof Optional || meta.ngMetadataName === 'Optional' || meta === Optional) {
          flags |= InjectFlags.Optional;
        } else if (
            meta instanceof SkipSelf || meta.ngMetadataName === 'SkipSelf' || meta === SkipSelf) {
          flags |= InjectFlags.SkipSelf;
        } else if (meta instanceof Self || meta.ngMetadataName === 'Self' || meta === Self) {
          flags |= InjectFlags.Self;
        } else if (meta instanceof Inject || meta === Inject) {
          type = meta.token;
        } else {
          type = meta;
        }
      }

      args.push(ɵɵinject(type!, flags));
    } else {
      args.push(ɵɵinject(arg));
    }
  }
  return args;
}