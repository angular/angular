/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {ReflectionCapabilities} from '../reflection/reflection_capabilities';
import {ɵɵinjectAttribute} from '../render3/instructions/di';
import {getClosureSafeProperty} from '../util/property';

import {resolveForwardRef} from './forward_ref';
import {InjectionToken} from './injection_token';
import {ɵɵinject} from './injector_compatibility';
import {InjectFlags} from './interface/injector';
import {ClassSansProvider, ConstructorSansProvider, ExistingSansProvider, FactorySansProvider, StaticClassSansProvider, ValueProvider, ValueSansProvider} from './interface/provider';
import {Attribute, AttributeDecorator, Inject, InjectDecorator, Optional, OptionalDecorator, Self, SelfDecorator, SkipSelf, SkipSelfDecorator} from './metadata';

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
      let injectFn: Function = ɵɵinject;

      for (let j = 0; j < arg.length; j++) {
        const meta = arg[j];
        if (isValidDecorator(meta, Optional, 'Optional')) {
          flags |= InjectFlags.Optional;
        } else if (isValidDecorator(meta, SkipSelf, 'SkipSelf')) {
          flags |= InjectFlags.SkipSelf;
        } else if (isValidDecorator(meta, Self, 'Self')) {
          flags |= InjectFlags.Self;
        } else if (isValidDecorator(meta, Attribute, 'Attribute')) {
          type = meta.attributeName;
          injectFn = ɵɵinjectAttribute;
        } else if (isValidDecorator(meta, Inject)) {
          type = meta.token;
        } else {
          type = meta;
        }
      }

      args.push(injectFn(type!, flags));
    } else {
      args.push(ɵɵinject(arg));
    }
  }
  return args;
}

function isValidDecorator(
    meta: any,
    decorator: OptionalDecorator|SkipSelfDecorator|SelfDecorator|AttributeDecorator|InjectDecorator,
    metadataName: string = '') {
  return meta instanceof decorator ||
      (metadataName !== '' && meta.ngMetadataName === metadataName) || meta === decorator;
}