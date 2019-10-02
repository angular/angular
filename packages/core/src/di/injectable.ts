/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {TypeDecorator, makeDecorator} from '../util/decorators';

import {getInjectableDef, ɵɵInjectableDef, ɵɵdefineInjectable} from './interface/defs';
import {ClassSansProvider, ConstructorSansProvider, ExistingSansProvider, FactorySansProvider, StaticClassSansProvider, ValueSansProvider} from './interface/provider';
import {compileInjectable as render3CompileInjectable} from './jit/injectable';
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
  (options?: {providedIn: Type<any>| 'root' | 'platform' | 'any' | null}&
   InjectableProvider): TypeDecorator;
  new (): Injectable;
  new (options?: {providedIn: Type<any>| 'root' | 'platform' | 'any' | null}&
       InjectableProvider): Injectable;
}

/**
 * Type of the Injectable metadata.
 *
 * @publicApi
 */
export interface Injectable {
  /**
   * Determines which injectors will provide the injectable,
   * by either associating it with an @NgModule or other `InjectorType`,
   * or by specifying that this injectable should be provided in the:
   * - 'root' injector, which will be the application-level injector in most apps.
   * - 'platform' injector, which would be the special singleton platform injector shared by all
   * applications on the page.
   * - 'any' injector, which would be the injector which receives the resolution. (Note this only
   * works on NgModule Injectors and not on Element Injector)
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
    (type: Type<any>, meta: Injectable) => SWITCH_COMPILE_INJECTABLE(type as any, meta));

/**
 * Type representing injectable service.
 *
 * @publicApi
 */
export interface InjectableType<T> extends Type<T> { ɵprov: ɵɵInjectableDef<T>; }

/**
 * Supports @Injectable() in JIT mode for Render2.
 */
function render2CompileInjectable(injectableType: Type<any>, options?: {
  providedIn?: Type<any>| 'root' | 'platform' | 'any' | null
} & InjectableProvider): void {
  if (options && options.providedIn !== undefined && !getInjectableDef(injectableType)) {
    (injectableType as InjectableType<any>).ɵprov = ɵɵdefineInjectable({
      token: injectableType,
      providedIn: options.providedIn,
      factory: convertInjectableProviderToFactory(injectableType, options),
    });
  }
}

export const SWITCH_COMPILE_INJECTABLE__POST_R3__ = render3CompileInjectable;
const SWITCH_COMPILE_INJECTABLE__PRE_R3__ = render2CompileInjectable;
const SWITCH_COMPILE_INJECTABLE: typeof render3CompileInjectable =
    SWITCH_COMPILE_INJECTABLE__PRE_R3__;
