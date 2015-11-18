import { Observable } from 'angular2/src/facade/async';
/**
 * An unmodifiable list of items that Angular keeps up to date when the state
 * of the application changes.
 *
 * The type of object that {@link QueryMetadata} and {@link ViewQueryMetadata} provide.
 *
 * Implements an iterable interface, therefore it can be used in both ES6
 * javascript `for (var i of items)` loops as well as in Angular templates with
 * `*ng-for="#i of myList"`.
 *
 * Changes can be observed by subscribing to the changes `Observable`.
 *
 * NOTE: In the future this class will implement an `Observable` interface.
 *
 * ### Example ([live demo](http://plnkr.co/edit/RX8sJnQYl9FWuSCWme5z?p=preview))
 * ```typescript
 * @Component({...})
 * class Container {
 *   constructor(@Query(Item) items: QueryList<Item>) {
 *     items.changes.subscribe(_ => console.log(items.length));
 *   }
 * }
 * ```
 */
export declare class QueryList<T> {
    private _results;
    private _emitter;
    changes: Observable<any>;
    length: number;
    first: T;
    last: T;
    /**
     * returns a new array with the passed in function applied to each element.
     */
    map<U>(fn: (item: T) => U): U[];
    /**
     * returns a filtered array.
     */
    filter(fn: (item: T) => boolean): T[];
    /**
     * returns a reduced value.
     */
    reduce<U>(fn: (acc: U, item: T) => U, init: U): U;
    /**
     * converts QueryList into an array
     */
    toArray(): T[];
    toString(): string;
}
