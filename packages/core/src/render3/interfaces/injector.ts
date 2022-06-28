/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InternalInjectFlags} from '../../di/interface/injector';
import {ProviderToken} from '../../di/provider_token';
import {assertDefined, assertEqual} from '../../util/assert';

import {TDirectiveHostNode} from './node';
import {LView, TData} from './view';

/**
 * Offsets of the `NodeInjector` data structure in the expando.
 *
 * `NodeInjector` is stored in both `LView` as well as `TView.data`. All storage requires 9 words.
 * First 8 are reserved for bloom filter and the 9th is reserved for the associated `TNode` as well
 * as parent `NodeInjector` pointer. All indexes are starting with `index` and have an offset as
 * shown.
 *
 * `LView` layout:
 * ```
 * index + 0: cumulative bloom filter
 * index + 1: cumulative bloom filter
 * index + 2: cumulative bloom filter
 * index + 3: cumulative bloom filter
 * index + 4: cumulative bloom filter
 * index + 5: cumulative bloom filter
 * index + 6: cumulative bloom filter
 * index + 7: cumulative bloom filter
 * index + 8: cumulative bloom filter
 * index + PARENT: Index to the parent injector. See `RelativeInjectorLocation`
 *                 `const parent = lView[index + NodeInjectorOffset.PARENT]`
 * ```
 *
 * `TViewData` layout:
 * ```
 * index + 0: cumulative bloom filter
 * index + 1: cumulative bloom filter
 * index + 2: cumulative bloom filter
 * index + 3: cumulative bloom filter
 * index + 4: cumulative bloom filter
 * index + 5: cumulative bloom filter
 * index + 6: cumulative bloom filter
 * index + 7: cumulative bloom filter
 * index + 8: cumulative bloom filter
 * index + TNODE: TNode associated with this `NodeInjector`
 *                `const tNode = tView.data[index + NodeInjectorOffset.TNODE]`
 * ```
 */
export const enum NodeInjectorOffset {
  TNODE = 8,
  PARENT = 8,
  BLOOM_SIZE = 8,
  SIZE = 9,
}

/**
 * Represents a relative location of parent injector.
 *
 * The interfaces encodes number of parents `LView`s to traverse and index in the `LView`
 * pointing to the parent injector.
 */
export type RelativeInjectorLocation = number & {
  __brand__: 'RelativeInjectorLocationFlags';
};

export const enum RelativeInjectorLocationFlags {
  InjectorIndexMask = 0b111111111111111,
  ViewOffsetShift = 16,
  NO_PARENT = -1,
}

export const NO_PARENT_INJECTOR = -1 as RelativeInjectorLocation;

/**
 * Each injector is saved in 9 contiguous slots in `LView` and 9 contiguous slots in
 * `TView.data`. This allows us to store information about the current node's tokens (which
 * can be shared in `TView`) as well as the tokens of its ancestor nodes (which cannot be
 * shared, so they live in `LView`).
 *
 * Each of these slots (aside from the last slot) contains a bloom filter. This bloom filter
 * determines whether a directive is available on the associated node or not. This prevents us
 * from searching the directives array at this level unless it's probable the directive is in it.
 *
 * See: https://en.wikipedia.org/wiki/Bloom_filter for more about bloom filters.
 *
 * Because all injectors have been flattened into `LView` and `TViewData`, they cannot typed
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
  injectImpl: null | (<T>(token: ProviderToken<T>, flags?: InternalInjectFlags) => T);

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
   * ```ts
   * component:
   *   providers: [ {provide: String, useValue: 'component', multi: true} ],
   *   viewProviders: [ {provide: String, useValue: 'componentView', multi: true} ],
   *
   * directive:
   *   providers: [ {provide: String, useValue: 'directive', multi: true} ],
   * ```
   *
   * Then the expected results are:
   *
   * ```ts
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
   * Because the same `multi` provider can be declared in `providers` and `viewProviders` it is
   * possible for `viewProviders` to shadow the `providers`. For this reason we store the
   * `provideFactory` of the `providers` so that `providers` can be extended with `viewProviders`.
   *
   * Example:
   *
   * Given:
   * ```ts
   * providers: [ {provide: String, useValue: 'all', multi: true} ],
   * viewProviders: [ {provide: String, useValue: 'viewOnly', multi: true} ],
   * ```
   *
   * We have to return `['all']` in case of content injection, but `['all', 'viewOnly']` in case
   * of view injection. We further have to make sure that the shared instances (in our case
   * `all`) are the exact same instance in both the content as well as the view injection. (We
   * have to make sure that we don't double instantiate.) For this reason the `viewProviders`
   * `Factory` has a pointer to the shadowed `providers` factory so that it can instantiate the
   * `providers` (`['all']`) and then extend it with `viewProviders` (`['all'] + ['viewOnly'] =
   * ['all', 'viewOnly']`).
   */
  providerFactory?: NodeInjectorFactory | null;

  constructor(
    /**
     * Factory to invoke in order to create a new instance.
     */
    public factory: (
      this: NodeInjectorFactory,
      _: undefined,
      /**
       * Flags that control the injection behavior.
       */
      flags: InternalInjectFlags | undefined,
      /**
       * array where injectables tokens are stored. This is used in
       * case of an error reporting to produce friendlier errors.
       */
      tData: TData,
      /**
       * array where existing instances of injectables are stored. This is used in case
       * of multi shadow is needed. See `multi` field documentation.
       */
      lView: LView,
      /**
       * The TNode of the same element injector.
       */
      tNode: TDirectiveHostNode,
    ) => any,
    /**
     * Set to `true` if the token is declared in `viewProviders` (or if it is component).
     */
    isViewProvider: boolean,
    injectImplementation: null | (<T>(token: ProviderToken<T>, flags?: InternalInjectFlags) => T),
    // Expect `null` in devmode
    public name: string | null,
  ) {
    ngDevMode && assertDefined(factory, 'Factory not specified');
    ngDevMode && assertEqual(typeof factory, 'function', 'Expected factory function.');
    this.canSeeViewProviders = isViewProvider;
    this.injectImpl = injectImplementation;
  }
}
