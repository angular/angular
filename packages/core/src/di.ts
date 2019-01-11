/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * The `di` module provides dependency injection container services.
 */

import {Injector as InjectorClass} from './di/injector';
import {Injector as InjectorInterface} from './di/interface/injector';

/*
 * We need to separate the Injector type from the abstract class declaration so that the type can be
 * imported by Ivy without importing the `Injector` value. We could do it the normal way by changing
 * the `class Injector` to just `function` but that confuses the `ngc` compiler. So instead we
 * declare `Injector` twice. Once in `class Injector` and once as `interface Injector` Here we take
 * the `interface Injector` type but use `class Injector` value.
 */
export type Injector = InjectorInterface;
export const Injector = InjectorClass;

/**
 * Because the `class Injector` does not implement `interface Injector` (doing so would expose the
 * duality to api guardian and our users) so we try to do an assignment to verify that that the two
 * types match.
 */
const verify: InjectorInterface = null as any as InjectorClass;

export * from './di/metadata';
export {InjectableType, InjectorType, defineInjectable, defineInjector} from './di/interface/defs';
export {InjectFlags} from './di/interface/injector';
export {forwardRef, resolveForwardRef, ForwardRefFn} from './di/forward_ref';
export {Injectable, InjectableDecorator, InjectableProvider} from './di/injectable';
export {INJECTOR} from './di/injector';
export {inject} from './di/injector_compatibility';
export {ReflectiveInjector} from './di/reflective_injector';
export {StaticProvider, ValueProvider, ConstructorSansProvider, ExistingProvider, FactoryProvider, Provider, TypeProvider, ClassProvider} from './di/interface/provider';
export {createInjector} from './di/r3_injector';
export {ResolvedReflectiveFactory, ResolvedReflectiveProvider} from './di/reflective_provider';
export {ReflectiveKey} from './di/reflective_key';
export {InjectionToken} from './di/interface/injection_token';
