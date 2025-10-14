/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Observable } from 'rxjs';
/**
 * An unmodifiable list of items that Angular keeps up to date when the state
 * of the application changes.
 *
 * The type of object that {@link ViewChildren}, {@link ContentChildren}, and {@link QueryList}
 * provide.
 *
 * Implements an iterable interface, therefore it can be used in both ES6
 * javascript `for (var i of items)` loops as well as in Angular templates with
 * `@for(i of myList; track $index)`.
 *
 * Changes can be observed by subscribing to the `changes` `Observable`.
 * *
 * @usageNotes
 * ### Example
 * ```ts
 * @Component({...})
 * class Container {
 *   @ViewChildren(Item) items:QueryList<Item>;
 * }
 * ```
 *
 * @publicApi
 */
export declare class QueryList<T> implements Iterable<T> {
    private _emitDistinctChangesOnly;
    readonly dirty = true;
    private _onDirty?;
    private _results;
    private _changesDetected;
    private _changes;
    readonly length: number;
    readonly first: T;
    readonly last: T;
    /**
     * Returns `Observable` of `QueryList` notifying the subscriber of changes.
     */
    get changes(): Observable<any>;
    /**
     * @param emitDistinctChangesOnly Whether `QueryList.changes` should fire only when actual change
     *     has occurred. Or if it should fire when query is recomputed. (recomputing could resolve in
     *     the same result)
     */
    constructor(_emitDistinctChangesOnly?: boolean);
    /**
     * Returns the QueryList entry at `index`.
     */
    get(index: number): T | undefined;
    /**
     * See
     * [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
     */
    map<U>(fn: (item: T, index: number, array: T[]) => U): U[];
    /**
     * See
     * [Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    filter<S extends T>(predicate: (value: T, index: number, array: readonly T[]) => value is S): S[];
    filter(predicate: (value: T, index: number, array: readonly T[]) => unknown): T[];
    /**
     * See
     * [Array.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    find(fn: (item: T, index: number, array: T[]) => boolean): T | undefined;
    /**
     * See
     * [Array.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
     */
    reduce<U>(fn: (prevValue: U, curValue: T, curIndex: number, array: T[]) => U, init: U): U;
    /**
     * See
     * [Array.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
     */
    forEach(fn: (item: T, index: number, array: T[]) => void): void;
    /**
     * See
     * [Array.some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
     */
    some(fn: (value: T, index: number, array: T[]) => boolean): boolean;
    /**
     * Returns a copy of the internal results list as an Array.
     */
    toArray(): T[];
    toString(): string;
    /**
     * Updates the stored data of the query list, and resets the `dirty` flag to `false`, so that
     * on change detection, it will not notify of changes to the queries, unless a new change
     * occurs.
     *
     * @param resultsTree The query results to store
     * @param identityAccessor Optional function for extracting stable object identity from a value
     *    in the array. This function is executed for each element of the query result list while
     *    comparing current query list with the new one (provided as a first argument of the `reset`
     *    function) to detect if the lists are different. If the function is not provided, elements
     *    are compared as is (without any pre-processing).
     */
    reset(resultsTree: Array<T | any[]>, identityAccessor?: (value: T) => unknown): void;
    /**
     * Triggers a change event by emitting on the `changes` {@link EventEmitter}.
     */
    notifyOnChanges(): void;
    /** @internal */
    onDirty(cb: () => void): void;
    /** internal */
    setDirty(): void;
    /** internal */
    destroy(): void;
    [Symbol.iterator]: () => Iterator<T>;
}
