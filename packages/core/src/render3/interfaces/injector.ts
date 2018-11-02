/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '../../di/injection_token';
import {InjectFlags} from '../../di/injector_compatibility';
import {Type} from '../../type';
import {TElementNode} from './node';
import {LViewData, TData} from './view';

export const TNODE = 8;
export const PARENT_INJECTOR = 8;
export const INJECTOR_SIZE = 9;

/**
 * Represents a relative location of parent injector.
 *
 * The interfaces encodes number of parents `LViewData`s to traverse and index in the `LViewData`
 * pointing to the parent injector.
 */
export interface RelativeInjectorLocation { __brand__: 'RelativeInjectorLocationFlags'; }

export const enum RelativeInjectorLocationFlags {
  InjectorIndexMask = 0b111111111111111,
  AcrossHostBoundary = 0b1000000000000000,
  ViewOffsetShift = 16,
  NO_PARENT = -1,
}

export const NO_PARENT_INJECTOR: RelativeInjectorLocation = -1 as any;

/**
 * Each injector is saved in 9 contiguous slots in `LViewData` and 9 contiguous slots in
 * `TView.data`. This allows us to store information about the current node's tokens (which
 * can be shared in `TView`) as well as the tokens of its ancestor nodes (which cannot be
 * shared, so they live in `LViewData`).
 *
 * Each of these slots (aside from the last slot) contains a bloom filter. This bloom filter
 * determines whether a directive is available on the associated node or not. This prevents us
 * from searching the directives array at this level unless it's probable the directive is in it.
 *
 * See: https://en.wikipedia.org/wiki/Bloom_filter for more about bloom filters.
 *
 * Because all injectors have been flattened into `LViewData` and `TViewData`, they cannot typed
 * using interfaces as they were previously. The start index of each `LInjector` and `TInjector`
 * will differ based on where it is flattened into the main array, so it's not possible to know
 * the indices ahead of time and save their types here. The interfaces are still included here
 * for documentation purposes.
 *
 * export interface LInjector extends Array<any> {
 *
 *    // Cumulative bloom for directive IDs 0-31  (IDs are % BLOOM_SIZE)
 *    [0]: number;
 *
 *    // Cumulative bloom for directive IDs 32-63
 *    [1]: number;
 *
 *    // Cumulative bloom for directive IDs 64-95
 *    [2]: number;
 *
 *    // Cumulative bloom for directive IDs 96-127
 *    [3]: number;
 *
 *    // Cumulative bloom for directive IDs 128-159
 *    [4]: number;
 *
 *    // Cumulative bloom for directive IDs 160 - 191
 *    [5]: number;
 *
 *    // Cumulative bloom for directive IDs 192 - 223
 *    [6]: number;
 *
 *    // Cumulative bloom for directive IDs 224 - 255
 *    [7]: number;
 *
 *    // We need to store a reference to the injector's parent so DI can keep looking up
 *    // the injector tree until it finds the dependency it's looking for.
 *    [PARENT_INJECTOR]: number;
 * }
 *
 * export interface TInjector extends Array<any> {
 *
 *    // Shared node bloom for directive IDs 0-31  (IDs are % BLOOM_SIZE)
 *    [0]: number;
 *
 *    // Shared node bloom for directive IDs 32-63
 *    [1]: number;
 *
 *    // Shared node bloom for directive IDs 64-95
 *    [2]: number;
 *
 *    // Shared node bloom for directive IDs 96-127
 *    [3]: number;
 *
 *    // Shared node bloom for directive IDs 128-159
 *    [4]: number;
 *
 *    // Shared node bloom for directive IDs 160 - 191
 *    [5]: number;
 *
 *    // Shared node bloom for directive IDs 192 - 223
 *    [6]: number;
 *
 *    // Shared node bloom for directive IDs 224 - 255
 *    [7]: number;
 *
 *    // Necessary to find directive indices for a particular node.
 *    [TNODE]: TElementNode|TElementContainerNode|TContainerNode;
 *  }
 */

/**
* Factory for creating instances of injectors in the NodeInjector.
*
* This factory is complicated by the fact that it can resolve `multi` factories as well.
*
* NOTE: Some of the fields are optional which means that this class has two hidden classes.
* - One without `multi` support (most common)
* - One with `multi` values, (rare).
*
* Since VMs can cache up to 4 inline hidden classes this is OK.
*
* - Single factory: Only `resolving` and `factory` is defined.
* - `providers` factory: `componentProviders` is a number and `index = -1`.
* - `viewProviders` factory: `componentProviders` is a number and `index` points to `providers`.
*/
export class NodeInjectorFactory {
  /**
   * The inject implementation to be activated when using the factory.
   */
  injectImpl: null|(<T>(token: Type<T>|InjectionToken<T>, flags: InjectFlags) => T);

  /**
   * Marker set to true during factory invocation to see if we get into recursive loop.
   * Recursive loop causes an error to be displayed.
   */
  resolving = false;

  /**
   * Marks that the token can see other Tokens declared in `viewProviders` on the same node.
   */
  canSeeViewProviders: boolean;

  /**
   * An array of factories to use in case of `multi` provider.
   */
  multi?: Array<() => any>;

  /**
   * Number of `multi`-providers which belong to the component.
   *
   * This is needed because when multiple components and directives declare the `multi` provider
   * they have to be concatenated in the correct order.
   *
   * Example:
   *
   * If we have a component and directive active an a single element as declared here
   * ```
   * component:
   *   provides: [ {provide: String, useValue: 'component', multi: true} ],
   *   viewProvides: [ {provide: String, useValue: 'componentView', multi: true} ],
   *
   * directive:
   *   provides: [ {provide: String, useValue: 'directive', multi: true} ],
   * ```
   *
   * Then the expected results are:
   *
   * ```
   * providers: ['component', 'directive']
   * viewProviders: ['component', 'componentView', 'directive']
   * ```
   *
   * The way to think about it is that the `viewProviders` have been inserted after the component
   * but before the directives, which is why we need to know how many `multi`s have been declared by
   * the component.
   */
  componentProviders?: number;

  /**
   * Current index of the Factory in the `data`. Needed for `viewProviders` and `providers` merging.
   * See `providerFactory`.
   */
  index?: number;

  /**
   * Because the same `multi` provider can be declared in `provides` and `viewProvides` it is
   * possible for `viewProvides` to shadow the `provides`. For this reason we store the
   * `provideFactory` of the `providers` so that `providers` can be extended with `viewProviders`.
   *
   * Example:
   *
   * Given:
   * ```
   * provides: [ {provide: String, useValue: 'all', multi: true} ],
   * viewProvides: [ {provide: String, useValue: 'viewOnly', multi: true} ],
   * ```
   *
   * We have to return `['all']` in case of content injection, but `['all', 'viewOnly']` in case
   * of view injection. We further have to make sure that the shared instances (in our case
   * `all`) are the exact same instance in both the content as well as the view injection. (We
   * have to make sure that we don't double instantiate.) For this reason the `viewProvides`
   * `Factory` has a pointer to the shadowed `provides` factory so that it can instantiate the
   * `providers` (`['all']`) and then extend it with `viewProviders` (`['all'] + ['viewOnly'] =
   * ['all', 'viewOnly']`).
   */
  providerFactory?: NodeInjectorFactory|null;


  constructor(
      /**
       * Factory to invoke in order to create a new instance.
       */
      public factory:
          (this: NodeInjectorFactory, _: null,
           /**
            * array where injectables tokens are stored. This is used in
            * case of an error reporting to produce friendlier errors.
            */
           tData: TData,
           /**
            * array where existing instances of injectables are stored. This is used in case
            * of multi shadow is needed. See `multi` field documentation.
            */
           lData: LViewData,
           /**
            * The TNode of the same element injector.
            */
           tNode: TElementNode) => any,
      /**
       * Set to `true` if the token is declared in `viewProviders` (or if it is component).
       */
      isViewProvider: boolean,
      injectImplementation: null|(<T>(token: Type<T>|InjectionToken<T>, flags: InjectFlags) => T)) {
    this.canSeeViewProviders = isViewProvider;
    this.injectImpl = injectImplementation;
  }
}

const FactoryPrototype = NodeInjectorFactory.prototype;
export function isFactory(obj: any): obj is NodeInjectorFactory {
  // See: https://jsperf.com/instanceof-vs-getprototypeof
  return obj != null && typeof obj == 'object' && Object.getPrototypeOf(obj) == FactoryPrototype;
}

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
