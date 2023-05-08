/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {makeDecorator, TypeDecorator} from '../util/decorators';

import {ClassSansProvider, ConstructorSansProvider, ExistingSansProvider, FactorySansProvider, StaticClassSansProvider, ValueSansProvider} from './interface/provider';
import {compileInjectable} from './jit/injectable';

export {compileInjectable};

/**
 * Injectable providers used in `@Injectable` decorator.
 *
 * @publicApi
 */
export type InjectableProvider = ValueSansProvider|ExistingSansProvider|StaticClassSansProvider|
    ConstructorSansProvider|FactorySansProvider|ClassSansProvider;

/**
 * Type of the Injectable decorator / constructor function.
 *
 * @publicApi
 */
export interface InjectableDecorator {
  /**
   * Decorator that marks a class as available to be
   * provided and injected as a dependency.
   *
   * @see [Introduction to Services and DI](guide/architecture-services)
   * @see [Dependency Injection Guide](guide/dependency-injection)
   *
   * @usageNotes
   *
   * Marking a class with `@Injectable` ensures that the compiler
   * will generate the necessary metadata to create the class's
   * dependencies when the class is injected.
   *
   * The following example shows how a service class is properly
   *  marked so that a supporting service can be injected upon creation.
   *
   * <code-example path="core/di/ts/metadata_spec.ts" region="Injectable"></code-example>
   *
   */
  (): TypeDecorator;
  (options?: {providedIn: Type<any>|'root'|'platform'|'any'|null}&
   InjectableProvider): TypeDecorator;
  new(): Injectable;
  new(options?: {providedIn: Type<any>|'root'|'platform'|'any'|null}&
      InjectableProvider): Injectable;
}

/**
 * Type of the Injectable metadata.
 *
 * @publicApi
 */
export interface Injectable {
  /**
   * Determines which injectors will provide the injectable.
   *
   * - `Type<any>` - associates the injectable with an `@NgModule` or other `InjectorType`. This
   * option is DEPRECATED.
   * - 'null' : Equivalent to `undefined`. The injectable is not provided in any scope automatically
   * and must be added to a `providers` array of an [@NgModule](api/core/NgModule#providers),
   * [@Component](api/core/Directive#providers) or [@Directive](api/core/Directive#providers).
   *
   * The following options specify that this injectable should be provided in one of the following
   * injectors:
   * - 'root' : The application-level injector in most apps.
   * - 'platform' : A special singleton platform injector shared by all
   * applications on the page.
   * - 'any' : Provides a unique instance in each lazy loaded module while all eagerly loaded
   * modules share one instance. This option is DEPRECATED.
   *
   */
  providedIn?: Type<any>|'root'|'platform'|'any'|null;
}

/**
 * Injectable decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Injectable: InjectableDecorator = makeDecorator(
    'Injectable', undefined, undefined, undefined,
    (type: Type<any>, meta: Injectable) => compileInjectable(type as any, meta));
