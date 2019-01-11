/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../interface/type';

import {InjectionToken} from './injection_token';
import {StaticProvider} from './provider';

/**
 * Injection flags for DI.
 *
 * @publicApi
 */
export enum InjectFlags {
  // TODO(alxhub): make this 'const' when ngc no longer writes exports of it into ngfactory files.

  Default = 0b0000,

  /**
   * Specifies that an injector should retrieve a dependency from any injector until reaching the
   * host element of the current component. (Only used with Element Injector)
   */
  Host = 0b0001,
  /** Don't descend into ancestors of the node requesting injection. */
  Self = 0b0010,
  /** Skip the node that is requesting injection. */
  SkipSelf = 0b0100,
  /** Inject `defaultValue` instead if token not found. */
  Optional = 0b1000,
}

/**
 * Concrete injectors implement this interface.
 *
 * For more details, see the ["Dependency Injection Guide"](guide/dependency-injection).
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/di/ts/injector_spec.ts region='Injector'}
 *
 * `Injector` returns itself when given `Injector` as a token:
 *
 * {@example core/di/ts/injector_spec.ts region='injectInjector'}
 *
 * @publicApi
 */
export interface Injector {
  /**
   * Retrieves an instance from the injector based on the provided token.
   * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
   * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
   */
  get<T>(token: Type<T>|InjectionToken<T>, notFoundValue?: T, flags?: InjectFlags): T;

  /**
   * @deprecated from v4.0.0 use Type<T> or InjectionToken<T>
   * @suppress {duplicate}
   */
  get(token: any, notFoundValue?: any): any;
}

/**
 * Static fields of the `Injector` type.
 */
export interface InjectorStatic {
  /**
   * Special value representing default option which implies that the injector should throw.
   */
  THROW_IF_NOT_FOUND: any;

  /**
   * Null injector implementation.
   *
   * Null injector will always throw an error no matter what token is requested.
   * The root most parent is a null injector which terminates the parent chain.
   */
  NULL: Injector;

  /**
   * @deprecated from v5 use the new signature Injector.create(options)
   */
  create(providers: StaticProvider[], parent?: Injector): Injector;

  /**
   * Create a new Injector which is configure using `StaticProvider`s.
   *
   * @usageNotes
   * ### Example
   *
   * {@example core/di/ts/provider_spec.ts region='ConstructorProvider'}
   */
  create(options: {providers: StaticProvider[], parent?: Injector, name?: string}): Injector;
}