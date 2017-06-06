import { ListWrapper } from 'angular2/src/facade/collection';
import { getSymbolIterator } from 'angular2/src/facade/lang';
import { EventEmitter } from 'angular2/src/facade/async';
/**
 * An unmodifiable list of items that Angular keeps up to date when the state
 * of the application changes.
 *
 * The type of object that {@link QueryMetadata} and {@link ViewQueryMetadata} provide.
 *
 * Implements an iterable interface, therefore it can be used in both ES6
 * javascript `for (var i of items)` loops as well as in Angular templates with
 * `*ngFor="let i of myList"`.
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
export class QueryList {
    constructor() {
        this._dirty = true;
        this._results = [];
        this._emitter = new EventEmitter();
    }
    get changes() { return this._emitter; }
    get length() { return this._results.length; }
    get first() { return ListWrapper.first(this._results); }
    get last() { return ListWrapper.last(this._results); }
    /**
     * returns a new array with the passed in function applied to each element.
     */
    map(fn) { return this._results.map(fn); }
    /**
     * returns a filtered array.
     */
    filter(fn) { return this._results.filter(fn); }
    /**
     * returns a reduced value.
     */
    reduce(fn, init) { return this._results.reduce(fn, init); }
    /**
     * executes function for each element in a query.
     */
    forEach(fn) { this._results.forEach(fn); }
    /**
     * converts QueryList into an array
     */
    toArray() { return ListWrapper.clone(this._results); }
    [getSymbolIterator()]() { return this._results[getSymbolIterator()](); }
    toString() { return this._results.toString(); }
    /**
     * @internal
     */
    reset(res) {
        this._results = ListWrapper.flatten(res);
        this._dirty = false;
    }
    /** @internal */
    notifyOnChanges() { this._emitter.emit(this); }
    /** internal */
    setDirty() { this._dirty = true; }
    /** internal */
    get dirty() { return this._dirty; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlfbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9xdWVyeV9saXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsV0FBVyxFQUFhLE1BQU0sZ0NBQWdDO09BQy9ELEVBQUMsaUJBQWlCLEVBQUMsTUFBTSwwQkFBMEI7T0FDbkQsRUFBYSxZQUFZLEVBQUMsTUFBTSwyQkFBMkI7QUFHbEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0g7SUFBQTtRQUNVLFdBQU0sR0FBRyxJQUFJLENBQUM7UUFDZCxhQUFRLEdBQWEsRUFBRSxDQUFDO1FBQ3hCLGFBQVEsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO0lBb0R4QyxDQUFDO0lBbERDLElBQUksT0FBTyxLQUFzQixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDeEQsSUFBSSxNQUFNLEtBQWEsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNyRCxJQUFJLEtBQUssS0FBUSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNELElBQUksSUFBSSxLQUFRLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFekQ7O09BRUc7SUFDSCxHQUFHLENBQUksRUFBa0IsSUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRWpFOztPQUVHO0lBQ0gsTUFBTSxDQUFDLEVBQXdCLElBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUxRTs7T0FFRztJQUNILE1BQU0sQ0FBSSxFQUEwQixFQUFFLElBQU8sSUFBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU1Rjs7T0FFRztJQUNILE9BQU8sQ0FBQyxFQUFxQixJQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVuRTs7T0FFRztJQUNILE9BQU8sS0FBVSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTNELENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxLQUFVLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUU3RSxRQUFRLEtBQWEsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXZEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLEdBQXFCO1FBQ3pCLElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLGVBQWUsS0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFckQsZUFBZTtJQUNmLFFBQVEsS0FBSyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7SUFFbEMsZUFBZTtJQUNmLElBQUksS0FBSyxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3RXcmFwcGVyLCBNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtnZXRTeW1ib2xJdGVyYXRvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgRXZlbnRFbWl0dGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuXG4vKipcbiAqIEFuIHVubW9kaWZpYWJsZSBsaXN0IG9mIGl0ZW1zIHRoYXQgQW5ndWxhciBrZWVwcyB1cCB0byBkYXRlIHdoZW4gdGhlIHN0YXRlXG4gKiBvZiB0aGUgYXBwbGljYXRpb24gY2hhbmdlcy5cbiAqXG4gKiBUaGUgdHlwZSBvZiBvYmplY3QgdGhhdCB7QGxpbmsgUXVlcnlNZXRhZGF0YX0gYW5kIHtAbGluayBWaWV3UXVlcnlNZXRhZGF0YX0gcHJvdmlkZS5cbiAqXG4gKiBJbXBsZW1lbnRzIGFuIGl0ZXJhYmxlIGludGVyZmFjZSwgdGhlcmVmb3JlIGl0IGNhbiBiZSB1c2VkIGluIGJvdGggRVM2XG4gKiBqYXZhc2NyaXB0IGBmb3IgKHZhciBpIG9mIGl0ZW1zKWAgbG9vcHMgYXMgd2VsbCBhcyBpbiBBbmd1bGFyIHRlbXBsYXRlcyB3aXRoXG4gKiBgKm5nRm9yPVwibGV0IGkgb2YgbXlMaXN0XCJgLlxuICpcbiAqIENoYW5nZXMgY2FuIGJlIG9ic2VydmVkIGJ5IHN1YnNjcmliaW5nIHRvIHRoZSBjaGFuZ2VzIGBPYnNlcnZhYmxlYC5cbiAqXG4gKiBOT1RFOiBJbiB0aGUgZnV0dXJlIHRoaXMgY2xhc3Mgd2lsbCBpbXBsZW1lbnQgYW4gYE9ic2VydmFibGVgIGludGVyZmFjZS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUlg4c0puUVlsOUZXdVNDV21lNXo/cD1wcmV2aWV3KSlcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBjbGFzcyBDb250YWluZXIge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoSXRlbSkgaXRlbXM6IFF1ZXJ5TGlzdDxJdGVtPikge1xuICogICAgIGl0ZW1zLmNoYW5nZXMuc3Vic2NyaWJlKF8gPT4gY29uc29sZS5sb2coaXRlbXMubGVuZ3RoKSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgUXVlcnlMaXN0PFQ+IHtcbiAgcHJpdmF0ZSBfZGlydHkgPSB0cnVlO1xuICBwcml2YXRlIF9yZXN1bHRzOiBBcnJheTxUPiA9IFtdO1xuICBwcml2YXRlIF9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIGdldCBjaGFuZ2VzKCk6IE9ic2VydmFibGU8YW55PiB7IHJldHVybiB0aGlzLl9lbWl0dGVyOyB9XG4gIGdldCBsZW5ndGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3Jlc3VsdHMubGVuZ3RoOyB9XG4gIGdldCBmaXJzdCgpOiBUIHsgcmV0dXJuIExpc3RXcmFwcGVyLmZpcnN0KHRoaXMuX3Jlc3VsdHMpOyB9XG4gIGdldCBsYXN0KCk6IFQgeyByZXR1cm4gTGlzdFdyYXBwZXIubGFzdCh0aGlzLl9yZXN1bHRzKTsgfVxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgbmV3IGFycmF5IHdpdGggdGhlIHBhc3NlZCBpbiBmdW5jdGlvbiBhcHBsaWVkIHRvIGVhY2ggZWxlbWVudC5cbiAgICovXG4gIG1hcDxVPihmbjogKGl0ZW06IFQpID0+IFUpOiBVW10geyByZXR1cm4gdGhpcy5fcmVzdWx0cy5tYXAoZm4pOyB9XG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSBmaWx0ZXJlZCBhcnJheS5cbiAgICovXG4gIGZpbHRlcihmbjogKGl0ZW06IFQpID0+IGJvb2xlYW4pOiBUW10geyByZXR1cm4gdGhpcy5fcmVzdWx0cy5maWx0ZXIoZm4pOyB9XG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSByZWR1Y2VkIHZhbHVlLlxuICAgKi9cbiAgcmVkdWNlPFU+KGZuOiAoYWNjOiBVLCBpdGVtOiBUKSA9PiBVLCBpbml0OiBVKTogVSB7IHJldHVybiB0aGlzLl9yZXN1bHRzLnJlZHVjZShmbiwgaW5pdCk7IH1cblxuICAvKipcbiAgICogZXhlY3V0ZXMgZnVuY3Rpb24gZm9yIGVhY2ggZWxlbWVudCBpbiBhIHF1ZXJ5LlxuICAgKi9cbiAgZm9yRWFjaChmbjogKGl0ZW06IFQpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fcmVzdWx0cy5mb3JFYWNoKGZuKTsgfVxuXG4gIC8qKlxuICAgKiBjb252ZXJ0cyBRdWVyeUxpc3QgaW50byBhbiBhcnJheVxuICAgKi9cbiAgdG9BcnJheSgpOiBUW10geyByZXR1cm4gTGlzdFdyYXBwZXIuY2xvbmUodGhpcy5fcmVzdWx0cyk7IH1cblxuICBbZ2V0U3ltYm9sSXRlcmF0b3IoKV0oKTogYW55IHsgcmV0dXJuIHRoaXMuX3Jlc3VsdHNbZ2V0U3ltYm9sSXRlcmF0b3IoKV0oKTsgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9yZXN1bHRzLnRvU3RyaW5nKCk7IH1cblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICByZXNldChyZXM6IEFycmF5PFQgfCBhbnlbXT4pOiB2b2lkIHtcbiAgICB0aGlzLl9yZXN1bHRzID0gTGlzdFdyYXBwZXIuZmxhdHRlbihyZXMpO1xuICAgIHRoaXMuX2RpcnR5ID0gZmFsc2U7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIG5vdGlmeU9uQ2hhbmdlcygpOiB2b2lkIHsgdGhpcy5fZW1pdHRlci5lbWl0KHRoaXMpOyB9XG5cbiAgLyoqIGludGVybmFsICovXG4gIHNldERpcnR5KCkgeyB0aGlzLl9kaXJ0eSA9IHRydWU7IH1cblxuICAvKiogaW50ZXJuYWwgKi9cbiAgZ2V0IGRpcnR5KCkgeyByZXR1cm4gdGhpcy5fZGlydHk7IH1cbn1cbiJdfQ==