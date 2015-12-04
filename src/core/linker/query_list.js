'use strict';var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
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
var QueryList = (function () {
    function QueryList() {
        this._results = [];
        this._emitter = new async_1.EventEmitter();
    }
    Object.defineProperty(QueryList.prototype, "changes", {
        get: function () { return this._emitter; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryList.prototype, "length", {
        get: function () { return this._results.length; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryList.prototype, "first", {
        get: function () { return collection_1.ListWrapper.first(this._results); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryList.prototype, "last", {
        get: function () { return collection_1.ListWrapper.last(this._results); },
        enumerable: true,
        configurable: true
    });
    /**
     * returns a new array with the passed in function applied to each element.
     */
    QueryList.prototype.map = function (fn) { return this._results.map(fn); };
    /**
     * returns a filtered array.
     */
    QueryList.prototype.filter = function (fn) { return this._results.filter(fn); };
    /**
     * returns a reduced value.
     */
    QueryList.prototype.reduce = function (fn, init) { return this._results.reduce(fn, init); };
    /**
     * converts QueryList into an array
     */
    QueryList.prototype.toArray = function () { return collection_1.ListWrapper.clone(this._results); };
    QueryList.prototype[lang_1.getSymbolIterator()] = function () { return this._results[lang_1.getSymbolIterator()](); };
    QueryList.prototype.toString = function () { return this._results.toString(); };
    /**
     * @internal
     */
    QueryList.prototype.reset = function (res) { this._results = res; };
    /** @internal */
    QueryList.prototype.notifyOnChanges = function () { this._emitter.emit(this); };
    return QueryList;
})();
exports.QueryList = QueryList;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlfbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9xdWVyeV9saXN0LnRzIl0sIm5hbWVzIjpbIlF1ZXJ5TGlzdCIsIlF1ZXJ5TGlzdC5jb25zdHJ1Y3RvciIsIlF1ZXJ5TGlzdC5jaGFuZ2VzIiwiUXVlcnlMaXN0Lmxlbmd0aCIsIlF1ZXJ5TGlzdC5maXJzdCIsIlF1ZXJ5TGlzdC5sYXN0IiwiUXVlcnlMaXN0Lm1hcCIsIlF1ZXJ5TGlzdC5maWx0ZXIiLCJRdWVyeUxpc3QucmVkdWNlIiwiUXVlcnlMaXN0LnRvQXJyYXkiLCJRdWVyeUxpc3RbZ2V0U3ltYm9sSXRlcmF0b3IoKV0iLCJRdWVyeUxpc3QudG9TdHJpbmciLCJRdWVyeUxpc3QucmVzZXQiLCJRdWVyeUxpc3Qubm90aWZ5T25DaGFuZ2VzIl0sIm1hcHBpbmdzIjoiQUFBQSwyQkFBc0MsZ0NBQWdDLENBQUMsQ0FBQTtBQUN2RSxxQkFBZ0MsMEJBQTBCLENBQUMsQ0FBQTtBQUMzRCxzQkFBdUMsMkJBQTJCLENBQUMsQ0FBQTtBQUduRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSDtJQUFBQTtRQUNVQyxhQUFRQSxHQUFhQSxFQUFFQSxDQUFDQTtRQUN4QkEsYUFBUUEsR0FBR0EsSUFBSUEsb0JBQVlBLEVBQUVBLENBQUNBO0lBc0N4Q0EsQ0FBQ0E7SUFwQ0NELHNCQUFJQSw4QkFBT0E7YUFBWEEsY0FBaUNFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUY7SUFDeERBLHNCQUFJQSw2QkFBTUE7YUFBVkEsY0FBdUJHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUg7SUFDckRBLHNCQUFJQSw0QkFBS0E7YUFBVEEsY0FBaUJJLE1BQU1BLENBQUNBLHdCQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFKO0lBQzNEQSxzQkFBSUEsMkJBQUlBO2FBQVJBLGNBQWdCSyxNQUFNQSxDQUFDQSx3QkFBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBTDtJQUV6REE7O09BRUdBO0lBQ0hBLHVCQUFHQSxHQUFIQSxVQUFPQSxFQUFrQkEsSUFBU00sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFakVOOztPQUVHQTtJQUNIQSwwQkFBTUEsR0FBTkEsVUFBT0EsRUFBd0JBLElBQVNPLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTFFUDs7T0FFR0E7SUFDSEEsMEJBQU1BLEdBQU5BLFVBQVVBLEVBQTBCQSxFQUFFQSxJQUFPQSxJQUFPUSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU1RlI7O09BRUdBO0lBQ0hBLDJCQUFPQSxHQUFQQSxjQUFpQlMsTUFBTUEsQ0FBQ0Esd0JBQVdBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTNEVCxvQkFBQ0Esd0JBQWlCQSxFQUFFQSxDQUFDQSxHQUFyQkEsY0FBK0JVLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLHdCQUFpQkEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFN0VWLDRCQUFRQSxHQUFSQSxjQUFxQlcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFdkRYOztPQUVHQTtJQUNIQSx5QkFBS0EsR0FBTEEsVUFBTUEsR0FBUUEsSUFBVVksSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFOUNaLGdCQUFnQkE7SUFDaEJBLG1DQUFlQSxHQUFmQSxjQUEwQmEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDdkRiLGdCQUFDQTtBQUFEQSxDQUFDQSxBQXhDRCxJQXdDQztBQXhDWSxpQkFBUyxZQXdDckIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2dldFN5bWJvbEl0ZXJhdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBFdmVudEVtaXR0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5cbi8qKlxuICogQW4gdW5tb2RpZmlhYmxlIGxpc3Qgb2YgaXRlbXMgdGhhdCBBbmd1bGFyIGtlZXBzIHVwIHRvIGRhdGUgd2hlbiB0aGUgc3RhdGVcbiAqIG9mIHRoZSBhcHBsaWNhdGlvbiBjaGFuZ2VzLlxuICpcbiAqIFRoZSB0eXBlIG9mIG9iamVjdCB0aGF0IHtAbGluayBRdWVyeU1ldGFkYXRhfSBhbmQge0BsaW5rIFZpZXdRdWVyeU1ldGFkYXRhfSBwcm92aWRlLlxuICpcbiAqIEltcGxlbWVudHMgYW4gaXRlcmFibGUgaW50ZXJmYWNlLCB0aGVyZWZvcmUgaXQgY2FuIGJlIHVzZWQgaW4gYm90aCBFUzZcbiAqIGphdmFzY3JpcHQgYGZvciAodmFyIGkgb2YgaXRlbXMpYCBsb29wcyBhcyB3ZWxsIGFzIGluIEFuZ3VsYXIgdGVtcGxhdGVzIHdpdGhcbiAqIGAqbmctZm9yPVwiI2kgb2YgbXlMaXN0XCJgLlxuICpcbiAqIENoYW5nZXMgY2FuIGJlIG9ic2VydmVkIGJ5IHN1YnNjcmliaW5nIHRvIHRoZSBjaGFuZ2VzIGBPYnNlcnZhYmxlYC5cbiAqXG4gKiBOT1RFOiBJbiB0aGUgZnV0dXJlIHRoaXMgY2xhc3Mgd2lsbCBpbXBsZW1lbnQgYW4gYE9ic2VydmFibGVgIGludGVyZmFjZS5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvUlg4c0puUVlsOUZXdVNDV21lNXo/cD1wcmV2aWV3KSlcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBjbGFzcyBDb250YWluZXIge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoSXRlbSkgaXRlbXM6IFF1ZXJ5TGlzdDxJdGVtPikge1xuICogICAgIGl0ZW1zLmNoYW5nZXMuc3Vic2NyaWJlKF8gPT4gY29uc29sZS5sb2coaXRlbXMubGVuZ3RoKSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgUXVlcnlMaXN0PFQ+IHtcbiAgcHJpdmF0ZSBfcmVzdWx0czogQXJyYXk8VD4gPSBbXTtcbiAgcHJpdmF0ZSBfZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBnZXQgY2hhbmdlcygpOiBPYnNlcnZhYmxlPGFueT4geyByZXR1cm4gdGhpcy5fZW1pdHRlcjsgfVxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9yZXN1bHRzLmxlbmd0aDsgfVxuICBnZXQgZmlyc3QoKTogVCB7IHJldHVybiBMaXN0V3JhcHBlci5maXJzdCh0aGlzLl9yZXN1bHRzKTsgfVxuICBnZXQgbGFzdCgpOiBUIHsgcmV0dXJuIExpc3RXcmFwcGVyLmxhc3QodGhpcy5fcmVzdWx0cyk7IH1cblxuICAvKipcbiAgICogcmV0dXJucyBhIG5ldyBhcnJheSB3aXRoIHRoZSBwYXNzZWQgaW4gZnVuY3Rpb24gYXBwbGllZCB0byBlYWNoIGVsZW1lbnQuXG4gICAqL1xuICBtYXA8VT4oZm46IChpdGVtOiBUKSA9PiBVKTogVVtdIHsgcmV0dXJuIHRoaXMuX3Jlc3VsdHMubWFwKGZuKTsgfVxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgZmlsdGVyZWQgYXJyYXkuXG4gICAqL1xuICBmaWx0ZXIoZm46IChpdGVtOiBUKSA9PiBib29sZWFuKTogVFtdIHsgcmV0dXJuIHRoaXMuX3Jlc3VsdHMuZmlsdGVyKGZuKTsgfVxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgcmVkdWNlZCB2YWx1ZS5cbiAgICovXG4gIHJlZHVjZTxVPihmbjogKGFjYzogVSwgaXRlbTogVCkgPT4gVSwgaW5pdDogVSk6IFUgeyByZXR1cm4gdGhpcy5fcmVzdWx0cy5yZWR1Y2UoZm4sIGluaXQpOyB9XG5cbiAgLyoqXG4gICAqIGNvbnZlcnRzIFF1ZXJ5TGlzdCBpbnRvIGFuIGFycmF5XG4gICAqL1xuICB0b0FycmF5KCk6IFRbXSB7IHJldHVybiBMaXN0V3JhcHBlci5jbG9uZSh0aGlzLl9yZXN1bHRzKTsgfVxuXG4gIFtnZXRTeW1ib2xJdGVyYXRvcigpXSgpOiBhbnkgeyByZXR1cm4gdGhpcy5fcmVzdWx0c1tnZXRTeW1ib2xJdGVyYXRvcigpXSgpOyB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX3Jlc3VsdHMudG9TdHJpbmcoKTsgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHJlc2V0KHJlczogVFtdKTogdm9pZCB7IHRoaXMuX3Jlc3VsdHMgPSByZXM7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIG5vdGlmeU9uQ2hhbmdlcygpOiB2b2lkIHsgdGhpcy5fZW1pdHRlci5lbWl0KHRoaXMpOyB9XG59XG4iXX0=