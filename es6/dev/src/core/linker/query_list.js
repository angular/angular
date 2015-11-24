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
export class QueryList {
    constructor() {
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
     * converts QueryList into an array
     */
    toArray() { return ListWrapper.clone(this._results); }
    [getSymbolIterator()]() { return this._results[getSymbolIterator()](); }
    toString() { return this._results.toString(); }
    /**
     * @internal
     */
    reset(res) { this._results = res; }
    /** @internal */
    notifyOnChanges() { this._emitter.emit(this); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlfbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9xdWVyeV9saXN0LnRzIl0sIm5hbWVzIjpbIlF1ZXJ5TGlzdCIsIlF1ZXJ5TGlzdC5jb25zdHJ1Y3RvciIsIlF1ZXJ5TGlzdC5jaGFuZ2VzIiwiUXVlcnlMaXN0Lmxlbmd0aCIsIlF1ZXJ5TGlzdC5maXJzdCIsIlF1ZXJ5TGlzdC5sYXN0IiwiUXVlcnlMaXN0Lm1hcCIsIlF1ZXJ5TGlzdC5maWx0ZXIiLCJRdWVyeUxpc3QucmVkdWNlIiwiUXVlcnlMaXN0LnRvQXJyYXkiLCJRdWVyeUxpc3RbZ2V0U3ltYm9sSXRlcmF0b3IoKV0iLCJRdWVyeUxpc3QudG9TdHJpbmciLCJRdWVyeUxpc3QucmVzZXQiLCJRdWVyeUxpc3Qubm90aWZ5T25DaGFuZ2VzIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFdBQVcsRUFBYSxNQUFNLGdDQUFnQztPQUMvRCxFQUFDLGlCQUFpQixFQUFDLE1BQU0sMEJBQTBCO09BQ25ELEVBQWEsWUFBWSxFQUFDLE1BQU0sMkJBQTJCO0FBR2xFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCRztBQUNIO0lBQUFBO1FBQ1VDLGFBQVFBLEdBQWFBLEVBQUVBLENBQUNBO1FBQ3hCQSxhQUFRQSxHQUFHQSxJQUFJQSxZQUFZQSxFQUFFQSxDQUFDQTtJQXNDeENBLENBQUNBO0lBcENDRCxJQUFJQSxPQUFPQSxLQUFzQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDeERGLElBQUlBLE1BQU1BLEtBQWFHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO0lBQ3JESCxJQUFJQSxLQUFLQSxLQUFRSSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMzREosSUFBSUEsSUFBSUEsS0FBUUssTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFekRMOztPQUVHQTtJQUNIQSxHQUFHQSxDQUFJQSxFQUFrQkEsSUFBU00sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFakVOOztPQUVHQTtJQUNIQSxNQUFNQSxDQUFDQSxFQUF3QkEsSUFBU08sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFMUVQOztPQUVHQTtJQUNIQSxNQUFNQSxDQUFJQSxFQUEwQkEsRUFBRUEsSUFBT0EsSUFBT1EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFNUZSOztPQUVHQTtJQUNIQSxPQUFPQSxLQUFVUyxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUUzRFQsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxDQUFDQSxLQUFVVSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRTdFVixRQUFRQSxLQUFhVyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV2RFg7O09BRUdBO0lBQ0hBLEtBQUtBLENBQUNBLEdBQVFBLElBQVVZLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO0lBRTlDWixnQkFBZ0JBO0lBQ2hCQSxlQUFlQSxLQUFXYSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUN2RGIsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2dldFN5bWJvbEl0ZXJhdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBFdmVudEVtaXR0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5cbi8qKlxuICogQW4gdW5tb2RpZmlhYmxlIGxpc3Qgb2YgaXRlbXMgdGhhdCBBbmd1bGFyIGtlZXBzIHVwIHRvIGRhdGUgd2hlbiB0aGUgc3RhdGVcbiAqIG9mIHRoZSBhcHBsaWNhdGlvbiBjaGFuZ2VzLlxuICpcbiAqIFRoZSB0eXBlIG9mIG9iamVjdCB0aGF0IHtAbGluayBRdWVyeU1ldGFkYXRhfSBhbmQge0BsaW5rIFZpZXdRdWVyeU1ldGFkYXRhfSBwcm92aWRlLlxuICpcbiAqIEltcGxlbWVudHMgYW4gaXRlcmFibGUgaW50ZXJmYWNlLCB0aGVyZWZvcmUgaXQgY2FuIGJlIHVzZWQgaW4gYm90aCBFUzZcbiAqIGphdmFzY3JpcHQgYGZvciAodmFyIGkgb2YgaXRlbXMpYCBsb29wcyBhcyB3ZWxsIGFzIGluIEFuZ3VsYXIgdGVtcGxhdGVzIHdpdGhcbiAqIGAqbmctZm9yPVwiI2kgb2YgbXlMaXN0XCJgLlxuICpcbiAqIENoYW5nZXMgY2FuIGJlIG9ic2VydmVkIGJ5IHN1YnNjcmliaW5nIHRvIHRoZSBjaGFuZ2VzIGBPYnNlcnZhYmxlYC5cbiAqXG4gKiBOT1RFOiBJbiB0aGUgZnV0dXJlIHRoaXMgY2xhc3Mgd2lsbCBpbXBsZW1lbnQgYW4gYE9ic2VydmFibGVgIGludGVyZmFjZS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUlg4c0puUVlsOUZXdVNDV21lNXo/cD1wcmV2aWV3KSlcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBjbGFzcyBDb250YWluZXIge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoSXRlbSkgaXRlbXM6IFF1ZXJ5TGlzdDxJdGVtPikge1xuICogICAgIGl0ZW1zLmNoYW5nZXMuc3Vic2NyaWJlKF8gPT4gY29uc29sZS5sb2coaXRlbXMubGVuZ3RoKSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgUXVlcnlMaXN0PFQ+IHtcbiAgcHJpdmF0ZSBfcmVzdWx0czogQXJyYXk8VD4gPSBbXTtcbiAgcHJpdmF0ZSBfZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBnZXQgY2hhbmdlcygpOiBPYnNlcnZhYmxlPGFueT4geyByZXR1cm4gdGhpcy5fZW1pdHRlcjsgfVxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9yZXN1bHRzLmxlbmd0aDsgfVxuICBnZXQgZmlyc3QoKTogVCB7IHJldHVybiBMaXN0V3JhcHBlci5maXJzdCh0aGlzLl9yZXN1bHRzKTsgfVxuICBnZXQgbGFzdCgpOiBUIHsgcmV0dXJuIExpc3RXcmFwcGVyLmxhc3QodGhpcy5fcmVzdWx0cyk7IH1cblxuICAvKipcbiAgICogcmV0dXJucyBhIG5ldyBhcnJheSB3aXRoIHRoZSBwYXNzZWQgaW4gZnVuY3Rpb24gYXBwbGllZCB0byBlYWNoIGVsZW1lbnQuXG4gICAqL1xuICBtYXA8VT4oZm46IChpdGVtOiBUKSA9PiBVKTogVVtdIHsgcmV0dXJuIHRoaXMuX3Jlc3VsdHMubWFwKGZuKTsgfVxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgZmlsdGVyZWQgYXJyYXkuXG4gICAqL1xuICBmaWx0ZXIoZm46IChpdGVtOiBUKSA9PiBib29sZWFuKTogVFtdIHsgcmV0dXJuIHRoaXMuX3Jlc3VsdHMuZmlsdGVyKGZuKTsgfVxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgcmVkdWNlZCB2YWx1ZS5cbiAgICovXG4gIHJlZHVjZTxVPihmbjogKGFjYzogVSwgaXRlbTogVCkgPT4gVSwgaW5pdDogVSk6IFUgeyByZXR1cm4gdGhpcy5fcmVzdWx0cy5yZWR1Y2UoZm4sIGluaXQpOyB9XG5cbiAgLyoqXG4gICAqIGNvbnZlcnRzIFF1ZXJ5TGlzdCBpbnRvIGFuIGFycmF5XG4gICAqL1xuICB0b0FycmF5KCk6IFRbXSB7IHJldHVybiBMaXN0V3JhcHBlci5jbG9uZSh0aGlzLl9yZXN1bHRzKTsgfVxuXG4gIFtnZXRTeW1ib2xJdGVyYXRvcigpXSgpOiBhbnkgeyByZXR1cm4gdGhpcy5fcmVzdWx0c1tnZXRTeW1ib2xJdGVyYXRvcigpXSgpOyB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX3Jlc3VsdHMudG9TdHJpbmcoKTsgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHJlc2V0KHJlczogVFtdKTogdm9pZCB7IHRoaXMuX3Jlc3VsdHMgPSByZXM7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIG5vdGlmeU9uQ2hhbmdlcygpOiB2b2lkIHsgdGhpcy5fZW1pdHRlci5lbWl0KHRoaXMpOyB9XG59XG4iXX0=