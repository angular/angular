/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {R3_COMPILE_INJECTABLE} from '../ivy_switch';
import {Type} from '../type';
import {makeDecorator} from '../util/decorators';

import {InjectableDef, InjectableType} from './defs';
import {ClassSansProvider, ConstructorSansProvider, ExistingSansProvider, FactorySansProvider, StaticClassSansProvider, ValueProvider, ValueSansProvider} from './provider';

/**
 * Injectable providers used in `@Injectable` decorator.
 *
 * @experimental
 */
export type InjectableProvider = ValueSansProvider | ExistingSansProvider |
    StaticClassSansProvider | ConstructorSansProvider | FactorySansProvider | ClassSansProvider;

/**
 * Type of the Injectable decorator / constructor function.
 */
export interface InjectableDecorator {
  /**
   * A marker metadata that marks a class as available to `Injector` for creation.
   *
   * For more details, see the ["Dependency Injection Guide"](guide/dependency-injection).
   *
   * @usageNotes
   * ### Example
   *
   * {@example core/di/ts/metadata_spec.ts region='Injectable'}
   *
   * `Injector` will throw an error when trying to instantiate a class that
   * does not have `@Injectable` marker, as shown in the example below.
   *
   * {@example core/di/ts/metadata_spec.ts region='InjectableThrows'}
   *
   */
  (): any;
  (options?: {providedIn: Type<any>| 'root' | null}&InjectableProvider): any;
  new (): Injectable;
  new (options?: {providedIn: Type<any>| 'root' | null}&InjectableProvider): Injectable;
}

/**
 * Type of the Injectable metadata.
 *
 * @experimental
 */
export interface Injectable { providedIn?: Type<any>|'root'|null; }

/**
* Injectable decorator and metadata.
*
* @Annotation
*/
export const Injectable: InjectableDecorator = makeDecorator(
    'Injectable', undefined, undefined, undefined,
    (type: Type<any>, meta: Injectable) => R3_COMPILE_INJECTABLE(type, meta));

/**
 * Type representing injectable service.
 *
 * @experimental
 */
export interface InjectableType<T> extends Type<T> { ngInjectableDef: InjectableDef<T>; }
