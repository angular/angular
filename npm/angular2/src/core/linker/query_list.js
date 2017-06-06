'use strict';"use strict";
var collection_1 = require('angular2/src/facade/collection');
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
var QueryList = (function () {
    function QueryList() {
        this._dirty = true;
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
     * executes function for each element in a query.
     */
    QueryList.prototype.forEach = function (fn) { this._results.forEach(fn); };
    /**
     * converts QueryList into an array
     */
    QueryList.prototype.toArray = function () { return collection_1.ListWrapper.clone(this._results); };
    QueryList.prototype[lang_1.getSymbolIterator()] = function () { return this._results[lang_1.getSymbolIterator()](); };
    QueryList.prototype.toString = function () { return this._results.toString(); };
    /**
     * @internal
     */
    QueryList.prototype.reset = function (res) {
        this._results = collection_1.ListWrapper.flatten(res);
        this._dirty = false;
    };
    /** @internal */
    QueryList.prototype.notifyOnChanges = function () { this._emitter.emit(this); };
    /** internal */
    QueryList.prototype.setDirty = function () { this._dirty = true; };
    Object.defineProperty(QueryList.prototype, "dirty", {
        /** internal */
        get: function () { return this._dirty; },
        enumerable: true,
        configurable: true
    });
    return QueryList;
}());
exports.QueryList = QueryList;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlfbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9xdWVyeV9saXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwyQkFBc0MsZ0NBQWdDLENBQUMsQ0FBQTtBQUN2RSxxQkFBZ0MsMEJBQTBCLENBQUMsQ0FBQTtBQUMzRCxzQkFBdUMsMkJBQTJCLENBQUMsQ0FBQTtBQUduRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSDtJQUFBO1FBQ1UsV0FBTSxHQUFHLElBQUksQ0FBQztRQUNkLGFBQVEsR0FBYSxFQUFFLENBQUM7UUFDeEIsYUFBUSxHQUFHLElBQUksb0JBQVksRUFBRSxDQUFDO0lBb0R4QyxDQUFDO0lBbERDLHNCQUFJLDhCQUFPO2FBQVgsY0FBaUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUN4RCxzQkFBSSw2QkFBTTthQUFWLGNBQXVCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQ3JELHNCQUFJLDRCQUFLO2FBQVQsY0FBaUIsTUFBTSxDQUFDLHdCQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQzNELHNCQUFJLDJCQUFJO2FBQVIsY0FBZ0IsTUFBTSxDQUFDLHdCQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRXpEOztPQUVHO0lBQ0gsdUJBQUcsR0FBSCxVQUFPLEVBQWtCLElBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVqRTs7T0FFRztJQUNILDBCQUFNLEdBQU4sVUFBTyxFQUF3QixJQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFMUU7O09BRUc7SUFDSCwwQkFBTSxHQUFOLFVBQVUsRUFBMEIsRUFBRSxJQUFPLElBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFNUY7O09BRUc7SUFDSCwyQkFBTyxHQUFQLFVBQVEsRUFBcUIsSUFBVSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFbkU7O09BRUc7SUFDSCwyQkFBTyxHQUFQLGNBQWlCLE1BQU0sQ0FBQyx3QkFBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTNELG9CQUFDLHdCQUFpQixFQUFFLENBQUMsR0FBckIsY0FBK0IsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsd0JBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTdFLDRCQUFRLEdBQVIsY0FBcUIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXZEOztPQUVHO0lBQ0gseUJBQUssR0FBTCxVQUFNLEdBQXFCO1FBQ3pCLElBQUksQ0FBQyxRQUFRLEdBQUcsd0JBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixtQ0FBZSxHQUFmLGNBQTBCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVyRCxlQUFlO0lBQ2YsNEJBQVEsR0FBUixjQUFhLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUdsQyxzQkFBSSw0QkFBSztRQURULGVBQWU7YUFDZixjQUFjLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDckMsZ0JBQUM7QUFBRCxDQUFDLEFBdkRELElBdURDO0FBdkRZLGlCQUFTLFlBdURyQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7Z2V0U3ltYm9sSXRlcmF0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge09ic2VydmFibGUsIEV2ZW50RW1pdHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cblxuLyoqXG4gKiBBbiB1bm1vZGlmaWFibGUgbGlzdCBvZiBpdGVtcyB0aGF0IEFuZ3VsYXIga2VlcHMgdXAgdG8gZGF0ZSB3aGVuIHRoZSBzdGF0ZVxuICogb2YgdGhlIGFwcGxpY2F0aW9uIGNoYW5nZXMuXG4gKlxuICogVGhlIHR5cGUgb2Ygb2JqZWN0IHRoYXQge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9IGFuZCB7QGxpbmsgVmlld1F1ZXJ5TWV0YWRhdGF9IHByb3ZpZGUuXG4gKlxuICogSW1wbGVtZW50cyBhbiBpdGVyYWJsZSBpbnRlcmZhY2UsIHRoZXJlZm9yZSBpdCBjYW4gYmUgdXNlZCBpbiBib3RoIEVTNlxuICogamF2YXNjcmlwdCBgZm9yICh2YXIgaSBvZiBpdGVtcylgIGxvb3BzIGFzIHdlbGwgYXMgaW4gQW5ndWxhciB0ZW1wbGF0ZXMgd2l0aFxuICogYCpuZ0Zvcj1cImxldCBpIG9mIG15TGlzdFwiYC5cbiAqXG4gKiBDaGFuZ2VzIGNhbiBiZSBvYnNlcnZlZCBieSBzdWJzY3JpYmluZyB0byB0aGUgY2hhbmdlcyBgT2JzZXJ2YWJsZWAuXG4gKlxuICogTk9URTogSW4gdGhlIGZ1dHVyZSB0aGlzIGNsYXNzIHdpbGwgaW1wbGVtZW50IGFuIGBPYnNlcnZhYmxlYCBpbnRlcmZhY2UuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L1JYOHNKblFZbDlGV3VTQ1dtZTV6P3A9cHJldmlldykpXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogY2xhc3MgQ29udGFpbmVyIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KEl0ZW0pIGl0ZW1zOiBRdWVyeUxpc3Q8SXRlbT4pIHtcbiAqICAgICBpdGVtcy5jaGFuZ2VzLnN1YnNjcmliZShfID0+IGNvbnNvbGUubG9nKGl0ZW1zLmxlbmd0aCkpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFF1ZXJ5TGlzdDxUPiB7XG4gIHByaXZhdGUgX2RpcnR5ID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfcmVzdWx0czogQXJyYXk8VD4gPSBbXTtcbiAgcHJpdmF0ZSBfZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBnZXQgY2hhbmdlcygpOiBPYnNlcnZhYmxlPGFueT4geyByZXR1cm4gdGhpcy5fZW1pdHRlcjsgfVxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9yZXN1bHRzLmxlbmd0aDsgfVxuICBnZXQgZmlyc3QoKTogVCB7IHJldHVybiBMaXN0V3JhcHBlci5maXJzdCh0aGlzLl9yZXN1bHRzKTsgfVxuICBnZXQgbGFzdCgpOiBUIHsgcmV0dXJuIExpc3RXcmFwcGVyLmxhc3QodGhpcy5fcmVzdWx0cyk7IH1cblxuICAvKipcbiAgICogcmV0dXJucyBhIG5ldyBhcnJheSB3aXRoIHRoZSBwYXNzZWQgaW4gZnVuY3Rpb24gYXBwbGllZCB0byBlYWNoIGVsZW1lbnQuXG4gICAqL1xuICBtYXA8VT4oZm46IChpdGVtOiBUKSA9PiBVKTogVVtdIHsgcmV0dXJuIHRoaXMuX3Jlc3VsdHMubWFwKGZuKTsgfVxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgZmlsdGVyZWQgYXJyYXkuXG4gICAqL1xuICBmaWx0ZXIoZm46IChpdGVtOiBUKSA9PiBib29sZWFuKTogVFtdIHsgcmV0dXJuIHRoaXMuX3Jlc3VsdHMuZmlsdGVyKGZuKTsgfVxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgcmVkdWNlZCB2YWx1ZS5cbiAgICovXG4gIHJlZHVjZTxVPihmbjogKGFjYzogVSwgaXRlbTogVCkgPT4gVSwgaW5pdDogVSk6IFUgeyByZXR1cm4gdGhpcy5fcmVzdWx0cy5yZWR1Y2UoZm4sIGluaXQpOyB9XG5cbiAgLyoqXG4gICAqIGV4ZWN1dGVzIGZ1bmN0aW9uIGZvciBlYWNoIGVsZW1lbnQgaW4gYSBxdWVyeS5cbiAgICovXG4gIGZvckVhY2goZm46IChpdGVtOiBUKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX3Jlc3VsdHMuZm9yRWFjaChmbik7IH1cblxuICAvKipcbiAgICogY29udmVydHMgUXVlcnlMaXN0IGludG8gYW4gYXJyYXlcbiAgICovXG4gIHRvQXJyYXkoKTogVFtdIHsgcmV0dXJuIExpc3RXcmFwcGVyLmNsb25lKHRoaXMuX3Jlc3VsdHMpOyB9XG5cbiAgW2dldFN5bWJvbEl0ZXJhdG9yKCldKCk6IGFueSB7IHJldHVybiB0aGlzLl9yZXN1bHRzW2dldFN5bWJvbEl0ZXJhdG9yKCldKCk7IH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fcmVzdWx0cy50b1N0cmluZygpOyB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgcmVzZXQocmVzOiBBcnJheTxUIHwgYW55W10+KTogdm9pZCB7XG4gICAgdGhpcy5fcmVzdWx0cyA9IExpc3RXcmFwcGVyLmZsYXR0ZW4ocmVzKTtcbiAgICB0aGlzLl9kaXJ0eSA9IGZhbHNlO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBub3RpZnlPbkNoYW5nZXMoKTogdm9pZCB7IHRoaXMuX2VtaXR0ZXIuZW1pdCh0aGlzKTsgfVxuXG4gIC8qKiBpbnRlcm5hbCAqL1xuICBzZXREaXJ0eSgpIHsgdGhpcy5fZGlydHkgPSB0cnVlOyB9XG5cbiAgLyoqIGludGVybmFsICovXG4gIGdldCBkaXJ0eSgpIHsgcmV0dXJuIHRoaXMuX2RpcnR5OyB9XG59XG4iXX0=