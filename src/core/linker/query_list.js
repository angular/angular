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
 * `*ngFor="#i of myList"`.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlfbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9xdWVyeV9saXN0LnRzIl0sIm5hbWVzIjpbIlF1ZXJ5TGlzdCIsIlF1ZXJ5TGlzdC5jb25zdHJ1Y3RvciIsIlF1ZXJ5TGlzdC5jaGFuZ2VzIiwiUXVlcnlMaXN0Lmxlbmd0aCIsIlF1ZXJ5TGlzdC5maXJzdCIsIlF1ZXJ5TGlzdC5sYXN0IiwiUXVlcnlMaXN0Lm1hcCIsIlF1ZXJ5TGlzdC5maWx0ZXIiLCJRdWVyeUxpc3QucmVkdWNlIiwiUXVlcnlMaXN0LnRvQXJyYXkiLCJRdWVyeUxpc3RbZ2V0U3ltYm9sSXRlcmF0b3IoKV0iLCJRdWVyeUxpc3QudG9TdHJpbmciLCJRdWVyeUxpc3QucmVzZXQiLCJRdWVyeUxpc3Qubm90aWZ5T25DaGFuZ2VzIl0sIm1hcHBpbmdzIjoiQUFBQSwyQkFBc0MsZ0NBQWdDLENBQUMsQ0FBQTtBQUN2RSxxQkFBZ0MsMEJBQTBCLENBQUMsQ0FBQTtBQUMzRCxzQkFBdUMsMkJBQTJCLENBQUMsQ0FBQTtBQUduRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSDtJQUFBQTtRQUNVQyxhQUFRQSxHQUFhQSxFQUFFQSxDQUFDQTtRQUN4QkEsYUFBUUEsR0FBR0EsSUFBSUEsb0JBQVlBLEVBQUVBLENBQUNBO0lBc0N4Q0EsQ0FBQ0E7SUFwQ0NELHNCQUFJQSw4QkFBT0E7YUFBWEEsY0FBaUNFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUY7SUFDeERBLHNCQUFJQSw2QkFBTUE7YUFBVkEsY0FBdUJHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUg7SUFDckRBLHNCQUFJQSw0QkFBS0E7YUFBVEEsY0FBaUJJLE1BQU1BLENBQUNBLHdCQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFKO0lBQzNEQSxzQkFBSUEsMkJBQUlBO2FBQVJBLGNBQWdCSyxNQUFNQSxDQUFDQSx3QkFBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBTDtJQUV6REE7O09BRUdBO0lBQ0hBLHVCQUFHQSxHQUFIQSxVQUFPQSxFQUFrQkEsSUFBU00sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFakVOOztPQUVHQTtJQUNIQSwwQkFBTUEsR0FBTkEsVUFBT0EsRUFBd0JBLElBQVNPLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTFFUDs7T0FFR0E7SUFDSEEsMEJBQU1BLEdBQU5BLFVBQVVBLEVBQTBCQSxFQUFFQSxJQUFPQSxJQUFPUSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU1RlI7O09BRUdBO0lBQ0hBLDJCQUFPQSxHQUFQQSxjQUFpQlMsTUFBTUEsQ0FBQ0Esd0JBQVdBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTNEVCxvQkFBQ0Esd0JBQWlCQSxFQUFFQSxDQUFDQSxHQUFyQkEsY0FBK0JVLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLHdCQUFpQkEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFN0VWLDRCQUFRQSxHQUFSQSxjQUFxQlcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFdkRYOztPQUVHQTtJQUNIQSx5QkFBS0EsR0FBTEEsVUFBTUEsR0FBUUEsSUFBVVksSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFOUNaLGdCQUFnQkE7SUFDaEJBLG1DQUFlQSxHQUFmQSxjQUEwQmEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDdkRiLGdCQUFDQTtBQUFEQSxDQUFDQSxBQXhDRCxJQXdDQztBQXhDWSxpQkFBUyxZQXdDckIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2dldFN5bWJvbEl0ZXJhdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBFdmVudEVtaXR0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5cbi8qKlxuICogQW4gdW5tb2RpZmlhYmxlIGxpc3Qgb2YgaXRlbXMgdGhhdCBBbmd1bGFyIGtlZXBzIHVwIHRvIGRhdGUgd2hlbiB0aGUgc3RhdGVcbiAqIG9mIHRoZSBhcHBsaWNhdGlvbiBjaGFuZ2VzLlxuICpcbiAqIFRoZSB0eXBlIG9mIG9iamVjdCB0aGF0IHtAbGluayBRdWVyeU1ldGFkYXRhfSBhbmQge0BsaW5rIFZpZXdRdWVyeU1ldGFkYXRhfSBwcm92aWRlLlxuICpcbiAqIEltcGxlbWVudHMgYW4gaXRlcmFibGUgaW50ZXJmYWNlLCB0aGVyZWZvcmUgaXQgY2FuIGJlIHVzZWQgaW4gYm90aCBFUzZcbiAqIGphdmFzY3JpcHQgYGZvciAodmFyIGkgb2YgaXRlbXMpYCBsb29wcyBhcyB3ZWxsIGFzIGluIEFuZ3VsYXIgdGVtcGxhdGVzIHdpdGhcbiAqIGAqbmdGb3I9XCIjaSBvZiBteUxpc3RcImAuXG4gKlxuICogQ2hhbmdlcyBjYW4gYmUgb2JzZXJ2ZWQgYnkgc3Vic2NyaWJpbmcgdG8gdGhlIGNoYW5nZXMgYE9ic2VydmFibGVgLlxuICpcbiAqIE5PVEU6IEluIHRoZSBmdXR1cmUgdGhpcyBjbGFzcyB3aWxsIGltcGxlbWVudCBhbiBgT2JzZXJ2YWJsZWAgaW50ZXJmYWNlLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9SWDhzSm5RWWw5Rld1U0NXbWU1ej9wPXByZXZpZXcpKVxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7Li4ufSlcbiAqIGNsYXNzIENvbnRhaW5lciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShJdGVtKSBpdGVtczogUXVlcnlMaXN0PEl0ZW0+KSB7XG4gKiAgICAgaXRlbXMuY2hhbmdlcy5zdWJzY3JpYmUoXyA9PiBjb25zb2xlLmxvZyhpdGVtcy5sZW5ndGgpKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBRdWVyeUxpc3Q8VD4ge1xuICBwcml2YXRlIF9yZXN1bHRzOiBBcnJheTxUPiA9IFtdO1xuICBwcml2YXRlIF9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIGdldCBjaGFuZ2VzKCk6IE9ic2VydmFibGU8YW55PiB7IHJldHVybiB0aGlzLl9lbWl0dGVyOyB9XG4gIGdldCBsZW5ndGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3Jlc3VsdHMubGVuZ3RoOyB9XG4gIGdldCBmaXJzdCgpOiBUIHsgcmV0dXJuIExpc3RXcmFwcGVyLmZpcnN0KHRoaXMuX3Jlc3VsdHMpOyB9XG4gIGdldCBsYXN0KCk6IFQgeyByZXR1cm4gTGlzdFdyYXBwZXIubGFzdCh0aGlzLl9yZXN1bHRzKTsgfVxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgbmV3IGFycmF5IHdpdGggdGhlIHBhc3NlZCBpbiBmdW5jdGlvbiBhcHBsaWVkIHRvIGVhY2ggZWxlbWVudC5cbiAgICovXG4gIG1hcDxVPihmbjogKGl0ZW06IFQpID0+IFUpOiBVW10geyByZXR1cm4gdGhpcy5fcmVzdWx0cy5tYXAoZm4pOyB9XG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSBmaWx0ZXJlZCBhcnJheS5cbiAgICovXG4gIGZpbHRlcihmbjogKGl0ZW06IFQpID0+IGJvb2xlYW4pOiBUW10geyByZXR1cm4gdGhpcy5fcmVzdWx0cy5maWx0ZXIoZm4pOyB9XG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSByZWR1Y2VkIHZhbHVlLlxuICAgKi9cbiAgcmVkdWNlPFU+KGZuOiAoYWNjOiBVLCBpdGVtOiBUKSA9PiBVLCBpbml0OiBVKTogVSB7IHJldHVybiB0aGlzLl9yZXN1bHRzLnJlZHVjZShmbiwgaW5pdCk7IH1cblxuICAvKipcbiAgICogY29udmVydHMgUXVlcnlMaXN0IGludG8gYW4gYXJyYXlcbiAgICovXG4gIHRvQXJyYXkoKTogVFtdIHsgcmV0dXJuIExpc3RXcmFwcGVyLmNsb25lKHRoaXMuX3Jlc3VsdHMpOyB9XG5cbiAgW2dldFN5bWJvbEl0ZXJhdG9yKCldKCk6IGFueSB7IHJldHVybiB0aGlzLl9yZXN1bHRzW2dldFN5bWJvbEl0ZXJhdG9yKCldKCk7IH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fcmVzdWx0cy50b1N0cmluZygpOyB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgcmVzZXQocmVzOiBUW10pOiB2b2lkIHsgdGhpcy5fcmVzdWx0cyA9IHJlczsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgbm90aWZ5T25DaGFuZ2VzKCk6IHZvaWQgeyB0aGlzLl9lbWl0dGVyLmVtaXQodGhpcyk7IH1cbn1cbiJdfQ==