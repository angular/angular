/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { StaticProvider } from '../../di';
/**
 * A differ that tracks changes made to an object over time.
 *
 * @publicApi
 */
export interface KeyValueDiffer<K, V> {
    /**
     * Compute a difference between the previous state and the new `object` state.
     *
     * @param object containing the new value.
     * @returns an object describing the difference. The return value is only valid until the next
     * `diff()` invocation.
     */
    diff(object: Map<K, V>): KeyValueChanges<K, V> | null;
    /**
     * Compute a difference between the previous state and the new `object` state.
     *
     * @param object containing the new value.
     * @returns an object describing the difference. The return value is only valid until the next
     * `diff()` invocation.
     */
    diff(object: {
        [key: string]: V;
    }): KeyValueChanges<string, V> | null;
}
/**
 * An object describing the changes in the `Map` or `{[k:string]: string}` since last time
 * `KeyValueDiffer#diff()` was invoked.
 *
 * @publicApi
 */
export interface KeyValueChanges<K, V> {
    /**
     * Iterate over all changes. `KeyValueChangeRecord` will contain information about changes
     * to each item.
     */
    forEachItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    /**
     * Iterate over changes in the order of original Map showing where the original items
     * have moved.
     */
    forEachPreviousItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    /**
     * Iterate over all keys for which values have changed.
     */
    forEachChangedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    /**
     * Iterate over all added items.
     */
    forEachAddedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    /**
     * Iterate over all removed items.
     */
    forEachRemovedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
}
/**
 * Record representing the item change information.
 *
 * @publicApi
 */
export interface KeyValueChangeRecord<K, V> {
    /**
     * Current key in the Map.
     */
    readonly key: K;
    /**
     * Current value for the key or `null` if removed.
     */
    readonly currentValue: V | null;
    /**
     * Previous value for the key or `null` if added.
     */
    readonly previousValue: V | null;
}
/**
 * Provides a factory for {@link KeyValueDiffer}.
 *
 * @publicApi
 */
export interface KeyValueDifferFactory {
    /**
     * Test to see if the differ knows how to diff this kind of object.
     */
    supports(objects: any): boolean;
    /**
     * Create a `KeyValueDiffer`.
     */
    create<K, V>(): KeyValueDiffer<K, V>;
}
export declare function defaultKeyValueDiffersFactory(): KeyValueDiffers;
/**
 * A repository of different Map diffing strategies used by NgClass, NgStyle, and others.
 *
 * @publicApi
 */
export declare class KeyValueDiffers {
    /** @nocollapse */
    static ɵprov: unknown;
    private readonly factories;
    constructor(factories: KeyValueDifferFactory[]);
    static create<S>(factories: KeyValueDifferFactory[], parent?: KeyValueDiffers): KeyValueDiffers;
    /**
     * Takes an array of {@link KeyValueDifferFactory} and returns a provider used to extend the
     * inherited {@link KeyValueDiffers} instance with the provided factories and return a new
     * {@link KeyValueDiffers} instance.
     *
     * @usageNotes
     * ### Example
     *
     * The following example shows how to extend an existing list of factories,
     * which will only be applied to the injector for this component and its children.
     * This step is all that's required to make a new {@link KeyValueDiffer} available.
     *
     * ```ts
     * @Component({
     *   viewProviders: [
     *     KeyValueDiffers.extend([new ImmutableMapDiffer()])
     *   ]
     * })
     * ```
     */
    static extend<S>(factories: KeyValueDifferFactory[]): StaticProvider;
    find(kv: any): KeyValueDifferFactory;
}
