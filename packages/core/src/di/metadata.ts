/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassSansProvider, ConstructorProvider, ConstructorSansProvider, ExistingProvider, ExistingSansProvider, FactoryProvider, FactorySansProvider, StaticClassProvider, StaticClassSansProvider, ValueProvider, ValueSansProvider} from '../di/provider';
import {ReflectionCapabilities} from '../reflection/reflection_capabilities';
import {Type} from '../type';
import {makeDecorator, makeParamDecorator} from '../util/decorators';
import {EMPTY_ARRAY} from '../view/util';


/**
 * Type of the Inject decorator / constructor function.
 *
 * @publicApi
 */
export interface InjectDecorator {
  /**
   * A constructor parameter decorator that specifies a
   * custom provider of a dependency.
   *
   * @see ["Dependency Injection Guide"](guide/dependency-injection).
   *
   * @usageNotes
   * The following example shows a class constructor that specifies a
   * custom provider of a dependency using the parameter decorator.
   *
   * {@example core/di/ts/metadata_spec.ts region='Inject'}
   *
   * When `@Inject()` is not present, the `Injector` uses the type annotation of the
   * parameter as the provider.
   *
   * {@example core/di/ts/metadata_spec.ts region='InjectWithoutDecorator'}
   */
  (token: any): any;
  new (token: any): Inject;
}

/**
 * Type of the Inject metadata.
 *
 * @publicApi
 */
export interface Inject {
  /**
   * Injector token that maps to the dependency to be injected.
   */
  token: any;
}

/**
 * Inject decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Inject: InjectDecorator = makeParamDecorator('Inject', (token: any) => ({token}));


/**
 * Type of the Optional decorator / constructor function.
 *
 * @publicApi
 */
export interface OptionalDecorator {
  /**
   * A constructor parameter decorator that marks a dependency as optional.
   *
   * The DI framework provides null if the dependency is not found.
   * For example, the following code allows the possibility of a null result:
   *
   * {@example core/di/ts/metadata_spec.ts region='Optional'}
   *
   * @see ["Dependency Injection Guide"](guide/dependency-injection).
   */
  (): any;
  new (): Optional;
}

/**
 * Type of the Optional metadata.
 *
 * @publicApi
 */
export interface Optional {}

/**
 * Optional decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Optional: OptionalDecorator = makeParamDecorator('Optional');

/**
 * Type of the Self decorator / constructor function.
 *
 * @publicApi
 */
export interface SelfDecorator {
  /**
   * A constructor parameter decorator that tells the DI framework
   * to retrieve a dependency only from the local injector.
   *
   * In the following example, the dependency can be resolved
   * by the local injector when instantiating the class itself, but not
   * when instantiating a child.
   *
   * {@example core/di/ts/metadata_spec.ts region='Self'}
   *
   * @see ["Dependency Injection Guide"](guide/dependency-injection).
   *
   *
   */
  (): any;
  new (): Self;
}

/**
 * Type of the Self metadata.
 *
 * @publicApi
 */
export interface Self {}

/**
 * Self decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Self: SelfDecorator = makeParamDecorator('Self');


/**
 * Type of the SkipSelf decorator / constructor function.
 *
 * @publicApi
 */
export interface SkipSelfDecorator {
  /**
   * A constructor parameter decorator that tells the DI framework
   * that dependency resolution should start from the parent injector.
   *
   * In the following example, the dependency can be resolved when
   * instantiating a child, but not when instantiating the class itself.
   *
   * {@example core/di/ts/metadata_spec.ts region='SkipSelf'}
   *
   * @see ["Dependency Injection Guide"](guide/dependency-injection).
   *
   *
   */
  (): any;
  new (): SkipSelf;
}

/**
 * Type of the SkipSelf metadata.
 *
 * @publicApi
 */
export interface SkipSelf {}

/**
 * SkipSelf decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const SkipSelf: SkipSelfDecorator = makeParamDecorator('SkipSelf');

/**
 * Type of the Host decorator / constructor function.
 *
 * @publicApi
 */
export interface HostDecorator {
  /**
   * A constructor parameter decorator that tells the DI framework
   * to retrieve a dependency from any injector until
   * reaching the host element of the current component.
   *
   * @see ["Dependency Injection Guide"](guide/dependency-injection).
   *
   * @usageNotes
   *
   * {@example core/di/ts/metadata_spec.ts region='Host'}
   */
  (): any;
  new (): Host;
}

/**
 * Type of the Host metadata.
 *
 * @publicApi
 */
export interface Host {}

/**
 * Host decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Host: HostDecorator = makeParamDecorator('Host');
