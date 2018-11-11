/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {compileInjectable as render3CompileInjectable} from '../render3/jit/injectable';
import {Type} from '../type';
import {makeDecorator} from '../util/decorators';

import {InjectableDef, InjectableType, defineInjectable, getInjectableDef} from './defs';
import {ClassSansProvider, ConstructorSansProvider, ExistingSansProvider, FactorySansProvider, StaticClassSansProvider, ValueSansProvider} from './provider';
import {convertInjectableProviderToFactory} from './util';


/**
 * Injectable providers used in `@Injectable` decorator.
 *
 * @publicApi
 */
export type InjectableProvider = ValueSansProvider | ExistingSansProvider |
    StaticClassSansProvider | ConstructorSansProvider | FactorySansProvider | ClassSansProvider;

/**
 * Type of the Injectable decorator / constructor function.
 *
 * @publicApi
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
 * @publicApi
 */
export interface Injectable { providedIn?: Type<any>|'root'|null; }

/**
 * Injectable decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Injectable: InjectableDecorator = makeDecorator(
    'Injectable', undefined, undefined, undefined,
    (type: Type<any>, meta: Injectable) => SWITCH_COMPILE_INJECTABLE(type as any, meta));

/**
 * Type representing injectable service.
 *
 * @publicApi
 */
export interface InjectableType<T> extends Type<T> { ngInjectableDef: InjectableDef<T>; }

/**
 * Supports @Injectable() in JIT mode for Render2.
 */
function render2CompileInjectable(
    injectableType: InjectableType<any>,
    options: {providedIn?: Type<any>| 'root' | null} & InjectableProvider): void {
  if (options && options.providedIn !== undefined && !getInjectableDef(injectableType)) {
    injectableType.ngInjectableDef = defineInjectable({
      providedIn: options.providedIn,
      factory: convertInjectableProviderToFactory(injectableType, options),
    });
  }
}

export const SWITCH_COMPILE_INJECTABLE__POST_R3__ = render3CompileInjectable;
const SWITCH_COMPILE_INJECTABLE__PRE_R3__ = render2CompileInjectable;
const SWITCH_COMPILE_INJECTABLE: typeof render3CompileInjectable =
    SWITCH_COMPILE_INJECTABLE__PRE_R3__;
