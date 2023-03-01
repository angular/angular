/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {makeParamDecorator} from '../util/decorators';

import {attachInjectFlag} from './injector_compatibility';
import {DecoratorFlags, InternalInjectFlags} from './interface/injector';


/**
 * Type of the Inject decorator / constructor function.
 *
 * @publicApi
 */
export interface InjectDecorator {
  /**
   * Parameter decorator on a dependency parameter of a class constructor
   * that specifies a custom provider of the dependency.
   *
   * @usageNotes
   * The following example shows a class constructor that specifies a
   * custom provider of a dependency using the parameter decorator.
   *
   * When `@Inject()` is not present, the injector uses the type annotation of the
   * parameter as the provider.
   *
   * <code-example path="core/di/ts/metadata_spec.ts" region="InjectWithoutDecorator">
   * </code-example>
   *
   * @see ["Dependency Injection Guide"](guide/dependency-injection)
   *
   */
  (token: any): any;
  new(token: any): Inject;
}

/**
 * Type of the Inject metadata.
 *
 * @publicApi
 */
export interface Inject {
  /**
   * A [DI token](guide/glossary#di-token) that maps to the dependency to be injected.
   */
  token: any;
}

/**
 * Inject decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Inject: InjectDecorator = attachInjectFlag(
    // Disable tslint because `DecoratorFlags` is a const enum which gets inlined.
    // tslint:disable-next-line: no-toplevel-property-access
    makeParamDecorator('Inject', (token: any) => ({token})), DecoratorFlags.Inject);

/**
 * Type of the Optional decorator / constructor function.
 *
 * @publicApi
 */
export interface OptionalDecorator {
  /**
   * Parameter decorator to be used on constructor parameters,
   * which marks the parameter as being an optional dependency.
   * The DI framework provides `null` if the dependency is not found.
   *
   * Can be used together with other parameter decorators
   * that modify how dependency injection operates.
   *
   * @usageNotes
   *
   * The following code allows the possibility of a `null` result:
   *
   * <code-example path="core/di/ts/metadata_spec.ts" region="Optional">
   * </code-example>
   *
   * @see ["Dependency Injection Guide"](guide/dependency-injection).
   */
  (): any;
  new(): Optional;
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
export const Optional: OptionalDecorator =
    // Disable tslint because `InternalInjectFlags` is a const enum which gets inlined.
    // tslint:disable-next-line: no-toplevel-property-access
    attachInjectFlag(makeParamDecorator('Optional'), InternalInjectFlags.Optional);

/**
 * Type of the Self decorator / constructor function.
 *
 * @publicApi
 */
export interface SelfDecorator {
  /**
   * Parameter decorator to be used on constructor parameters,
   * which tells the DI framework to start dependency resolution from the local injector.
   *
   * Resolution works upward through the injector hierarchy, so the children
   * of this class must configure their own providers or be prepared for a `null` result.
   *
   * @usageNotes
   *
   * In the following example, the dependency can be resolved
   * by the local injector when instantiating the class itself, but not
   * when instantiating a child.
   *
   * <code-example path="core/di/ts/metadata_spec.ts" region="Self">
   * </code-example>
   *
   * @see `SkipSelf`
   * @see `Optional`
   *
   */
  (): any;
  new(): Self;
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
export const Self: SelfDecorator =
    // Disable tslint because `InternalInjectFlags` is a const enum which gets inlined.
    // tslint:disable-next-line: no-toplevel-property-access
    attachInjectFlag(makeParamDecorator('Self'), InternalInjectFlags.Self);


/**
 * Type of the `SkipSelf` decorator / constructor function.
 *
 * @publicApi
 */
export interface SkipSelfDecorator {
  /**
   * Parameter decorator to be used on constructor parameters,
   * which tells the DI framework to start dependency resolution from the parent injector.
   * Resolution works upward through the injector hierarchy, so the local injector
   * is not checked for a provider.
   *
   * @usageNotes
   *
   * In the following example, the dependency can be resolved when
   * instantiating a child, but not when instantiating the class itself.
   *
   * <code-example path="core/di/ts/metadata_spec.ts" region="SkipSelf">
   * </code-example>
   *
   * @see [Dependency Injection guide](guide/dependency-injection-in-action#skip).
   * @see `Self`
   * @see `Optional`
   *
   */
  (): any;
  new(): SkipSelf;
}

/**
 * Type of the `SkipSelf` metadata.
 *
 * @publicApi
 */
export interface SkipSelf {}

/**
 * `SkipSelf` decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const SkipSelf: SkipSelfDecorator =
    // Disable tslint because `InternalInjectFlags` is a const enum which gets inlined.
    // tslint:disable-next-line: no-toplevel-property-access
    attachInjectFlag(makeParamDecorator('SkipSelf'), InternalInjectFlags.SkipSelf);

/**
 * Type of the `Host` decorator / constructor function.
 *
 * @publicApi
 */
export interface HostDecorator {
  /**
   * Parameter decorator on a view-provider parameter of a class constructor
   * that tells the DI framework to resolve the view by checking injectors of child
   * elements, and stop when reaching the host element of the current component.
   *
   * @usageNotes
   *
   * The following shows use with the `@Optional` decorator, and allows for a `null` result.
   *
   * <code-example path="core/di/ts/metadata_spec.ts" region="Host">
   * </code-example>
   *
   * For an extended example, see ["Dependency Injection
   * Guide"](guide/dependency-injection-in-action#optional).
   */
  (): any;
  new(): Host;
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
export const Host: HostDecorator =
    // Disable tslint because `InternalInjectFlags` is a const enum which gets inlined.
    // tslint:disable-next-line: no-toplevel-property-access
    attachInjectFlag(makeParamDecorator('Host'), InternalInjectFlags.Host);
