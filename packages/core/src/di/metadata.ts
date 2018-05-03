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
 *
 */
export interface InjectDecorator {
  /**
   * A parameter decorator that specifies a dependency.
   *
   * For more details, see the {@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
   *
   * {@example core/di/ts/metadata_spec.ts region='Inject'}
   *
   * When `@Inject()` is not present, {@link Injector} will use the type annotation of the
   * parameter.
   *
   * {@example core/di/ts/metadata_spec.ts region='InjectWithoutDecorator'}
   *
   * @usageNotes
   *
   * ```
   * @Injectable()
   * class Car {
   *   constructor(@Inject("MyEngine") public engine:Engine) {}
   * }
   * ```
   */
  (token: any): any;
  new (token: any): Inject;
}

/**
 * Type of the Inject metadata.
 */
export interface Inject { token: any; }

/**
 * Inject decorator and metadata.
 *
 * @Annotation
 */
export const Inject: InjectDecorator = makeParamDecorator('Inject', (token: any) => ({token}));


/**
 * Type of the Optional decorator / constructor function.
 */
export interface OptionalDecorator {
  /**
   * A parameter metadata that marks a dependency as optional.
   * {@link Injector} provides `null` if the dependency is not found.
   *
   * For more details, see the {@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
   *
   * {@example core/di/ts/metadata_spec.ts region='Optional'}
   *
   * @usageNotes
   *
   * ```
   * @Injectable()
   * class Car {
   *   constructor(@Optional() public engine:Engine) {}
   * }
   * ```
   */
  (): any;
  new (): Optional;
}

/**
 * Type of the Optional metadata.
 */
export interface Optional {}

/**
 * Optional decorator and metadata.
 *
 * @Annotation
 */
export const Optional: OptionalDecorator = makeParamDecorator('Optional');

/**
 * Type of the Self decorator / constructor function.
 */
export interface SelfDecorator {
  /**
   * Specifies that an {@link Injector} should retrieve a dependency only from itself.
   *
   * For more details, see the {@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
   *
   * {@example core/di/ts/metadata_spec.ts region='Self'}
   *
   * @usageNotes
   *
   * ```
   * @Injectable()
   * class Car {
   *   constructor(@Self() public engine:Engine) {}
   * }
   * ```
   */
  (): any;
  new (): Self;
}

/**
 * Type of the Self metadata.
 */
export interface Self {}

/**
 * Self decorator and metadata.
 *
 * @Annotation
 */
export const Self: SelfDecorator = makeParamDecorator('Self');


/**
 * Type of the SkipSelf decorator / constructor function.
 */
export interface SkipSelfDecorator {
  /**
   * Specifies that the dependency resolution should start from the parent injector.
   *
   * For more details, see the {@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
   *
   * {@example core/di/ts/metadata_spec.ts region='SkipSelf'}
   *
   * @usageNotes
   *
   * ```
   * @Injectable()
   * class Car {
   *   constructor(@SkipSelf() public engine:Engine) {}
   * }
   * ```
   */
  (): any;
  new (): SkipSelf;
}

/**
 * Type of the SkipSelf metadata.
 */
export interface SkipSelf {}

/**
 * SkipSelf decorator and metadata.
 *
 * @Annotation
 */
export const SkipSelf: SkipSelfDecorator = makeParamDecorator('SkipSelf');

/**
 * Type of the Host decorator / constructor function.
 */
export interface HostDecorator {
  /**
   * Specifies that an injector should retrieve a dependency from any injector until
   * reaching the host element of the current component.
   *
   * For more details, see the {@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
   *
   * {@example core/di/ts/metadata_spec.ts region='Host'}
   *
   * @usageNotes
   *
   * ```
   * @Injectable()
   * class Car {
   *   constructor(@Host() public engine:Engine) {}
   * }
   * ```
   */
  (): any;
  new (): Host;
}

/**
 * Type of the Host metadata.
 */
export interface Host {}

/**
 * Host decorator and metadata.
 *
 * @Annotation
 */
export const Host: HostDecorator = makeParamDecorator('Host');
