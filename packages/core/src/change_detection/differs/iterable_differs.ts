/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵɵdefineInjectable} from '../../di/interface/defs';
import {StaticProvider} from '../../di/interface/provider';
import {Optional, SkipSelf} from '../../di/metadata';
import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {DefaultIterableDifferFactory} from '../differs/default_iterable_differ';

/**
 * A type describing supported iterable types.
 *
 * @publicApi
 */
export type NgIterable<T> = Array<T> | Iterable<T>;

/**
 * A strategy for tracking changes over time to an iterable. Used by {@link /api/common/NgForOf NgForOf} to
 * respond to changes in an iterable by effecting equivalent changes in the DOM.
 *
 * @publicApi
 */
export interface IterableDiffer<V> {
  /**
   * Compute a difference between the previous state and the new `object` state.
   *
   * @param object containing the new value.
   * @returns an object describing the difference. The return value is only valid until the next
   * `diff()` invocation.
   */
  diff(object: NgIterable<V> | undefined | null): IterableChanges<V> | null;
}

/**
 * An object describing the changes in the `Iterable` collection since last time
 * `IterableDiffer#diff()` was invoked.
 *
 * @publicApi
 */
export interface IterableChanges<V> {
  /**
   * Iterate over all changes. `IterableChangeRecord` will contain information about changes
   * to each item.
   */
  forEachItem(fn: (record: IterableChangeRecord<V>) => void): void;

  /**
   * Iterate over a set of operations which when applied to the original `Iterable` will produce the
   * new `Iterable`.
   *
   * NOTE: These are not necessarily the actual operations which were applied to the original
   * `Iterable`, rather these are a set of computed operations which may not be the same as the
   * ones applied.
   *
   * @param record A change which needs to be applied
   * @param previousIndex The `IterableChangeRecord#previousIndex` of the `record` refers to the
   *        original `Iterable` location, where as `previousIndex` refers to the transient location
   *        of the item, after applying the operations up to this point.
   * @param currentIndex The `IterableChangeRecord#currentIndex` of the `record` refers to the
   *        original `Iterable` location, where as `currentIndex` refers to the transient location
   *        of the item, after applying the operations up to this point.
   */
  forEachOperation(
    fn: (
      record: IterableChangeRecord<V>,
      previousIndex: number | null,
      currentIndex: number | null,
    ) => void,
  ): void;

  /**
   * Iterate over changes in the order of original `Iterable` showing where the original items
   * have moved.
   */
  forEachPreviousItem(fn: (record: IterableChangeRecord<V>) => void): void;

  /** Iterate over all added items. */
  forEachAddedItem(fn: (record: IterableChangeRecord<V>) => void): void;

  /** Iterate over all moved items. */
  forEachMovedItem(fn: (record: IterableChangeRecord<V>) => void): void;

  /** Iterate over all removed items. */
  forEachRemovedItem(fn: (record: IterableChangeRecord<V>) => void): void;

  /**
   * Iterate over all items which had their identity (as computed by the `TrackByFunction`)
   * changed.
   */
  forEachIdentityChange(fn: (record: IterableChangeRecord<V>) => void): void;
}

/**
 * Record representing the item change information.
 *
 * @publicApi
 */
export interface IterableChangeRecord<V> {
  /** Current index of the item in `Iterable` or null if removed. */
  readonly currentIndex: number | null;

  /** Previous index of the item in `Iterable` or null if added. */
  readonly previousIndex: number | null;

  /** The item. */
  readonly item: V;

  /** Track by identity as computed by the `TrackByFunction`. */
  readonly trackById: any;
}

/**
 * A function optionally passed into the `NgForOf` directive to customize how `NgForOf` uniquely
 * identifies items in an iterable.
 *
 * `NgForOf` needs to uniquely identify items in the iterable to correctly perform DOM updates
 * when items in the iterable are reordered, new items are added, or existing items are removed.
 *
 *
 * In all of these scenarios it is usually desirable to only update the DOM elements associated
 * with the items affected by the change. This behavior is important to:
 *
 * - preserve any DOM-specific UI state (like cursor position, focus, text selection) when the
 *   iterable is modified
 * - enable animation of item addition, removal, and iterable reordering
 * - preserve the value of the `<select>` element when nested `<option>` elements are dynamically
 *   populated using `NgForOf` and the bound iterable is updated
 *
 * A common use for custom `trackBy` functions is when the model that `NgForOf` iterates over
 * contains a property with a unique identifier. For example, given a model:
 *
 * ```ts
 * class User {
 *   id: number;
 *   name: string;
 *   ...
 * }
 * ```
 * a custom `trackBy` function could look like the following:
 * ```ts
 * function userTrackBy(index, user) {
 *   return user.id;
 * }
 * ```
 *
 * A custom `trackBy` function must have several properties:
 *
 * - be [idempotent](https://en.wikipedia.org/wiki/Idempotence) (be without side effects, and always
 * return the same value for a given input)
 * - return unique value for all unique inputs
 * - be fast
 *
 * @see [`NgForOf#ngForTrackBy`](api/common/NgForOf#ngForTrackBy)
 * @publicApi
 */
export interface TrackByFunction<T> {
  // Note: the type parameter `U` enables more accurate template type checking in case a trackBy
  // function is declared using a base type of the iterated type. The `U` type gives TypeScript
  // additional freedom to infer a narrower type for the `item` parameter type, instead of imposing
  // the trackBy's declared item type as the inferred type for `T`.
  // See https://github.com/angular/angular/issues/40125

  /**
   * @param index The index of the item within the iterable.
   * @param item The item in the iterable.
   */
  <U extends T>(index: number, item: T & U): any;
}

/**
 * Provides a factory for {@link IterableDiffer}.
 *
 * @publicApi
 */
export interface IterableDifferFactory {
  supports(objects: any): boolean;
  create<V>(trackByFn?: TrackByFunction<V>): IterableDiffer<V>;
}

export function defaultIterableDiffersFactory() {
  return new IterableDiffers([new DefaultIterableDifferFactory()]);
}

/**
 * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
 *
 * @publicApi
 */
export class IterableDiffers {
  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: IterableDiffers,
    providedIn: 'root',
    factory: defaultIterableDiffersFactory,
  });

  constructor(private factories: IterableDifferFactory[]) {}

  static create(factories: IterableDifferFactory[], parent?: IterableDiffers): IterableDiffers {
    if (parent != null) {
      const copied = parent.factories.slice();
      factories = factories.concat(copied);
    }

    return new IterableDiffers(factories);
  }

  /**
   * Takes an array of {@link IterableDifferFactory} and returns a provider used to extend the
   * inherited {@link IterableDiffers} instance with the provided factories and return a new
   * {@link IterableDiffers} instance.
   *
   * @usageNotes
   * ### Example
   *
   * The following example shows how to extend an existing list of factories,
   * which will only be applied to the injector for this component and its children.
   * This step is all that's required to make a new {@link IterableDiffer} available.
   *
   * ```ts
   * @Component({
   *   viewProviders: [
   *     IterableDiffers.extend([new ImmutableListDiffer()])
   *   ]
   * })
   * ```
   */
  static extend(factories: IterableDifferFactory[]): StaticProvider {
    return {
      provide: IterableDiffers,
      useFactory: (parent: IterableDiffers | null) => {
        // if parent is null, it means that we are in the root injector and we have just overridden
        // the default injection mechanism for IterableDiffers, in such a case just assume
        // `defaultIterableDiffersFactory`.
        return IterableDiffers.create(factories, parent || defaultIterableDiffersFactory());
      },
      // Dependency technically isn't optional, but we can provide a better error message this way.
      deps: [[IterableDiffers, new SkipSelf(), new Optional()]],
    };
  }

  find(iterable: any): IterableDifferFactory {
    const factory = this.factories.find((f) => f.supports(iterable));
    if (factory != null) {
      return factory;
    } else {
      throw new RuntimeError(
        RuntimeErrorCode.NO_SUPPORTING_DIFFER_FACTORY,
        ngDevMode &&
          `Cannot find a differ supporting object '${iterable}' of type '${getTypeNameForDebugging(
            iterable,
          )}'`,
      );
    }
  }
}

export function getTypeNameForDebugging(type: any): string {
  return type['name'] || typeof type;
}
