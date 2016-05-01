'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
/**
 * Polyfill for [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers), as
 * specified in the [Fetch Spec](https://fetch.spec.whatwg.org/#headers-class).
 *
 * The only known difference between this `Headers` implementation and the spec is the
 * lack of an `entries` method.
 *
 * ### Example ([live demo](http://plnkr.co/edit/MTdwT6?p=preview))
 *
 * ```
 * import {Headers} from 'angular2/http';
 *
 * var firstHeaders = new Headers();
 * firstHeaders.append('Content-Type', 'image/jpeg');
 * console.log(firstHeaders.get('Content-Type')) //'image/jpeg'
 *
 * // Create headers from Plain Old JavaScript Object
 * var secondHeaders = new Headers({
 *   'X-My-Custom-Header': 'Angular'
 * });
 * console.log(secondHeaders.get('X-My-Custom-Header')); //'Angular'
 *
 * var thirdHeaders = new Headers(secondHeaders);
 * console.log(thirdHeaders.get('X-My-Custom-Header')); //'Angular'
 * ```
 */
var Headers = (function () {
    function Headers(headers) {
        var _this = this;
        if (headers instanceof Headers) {
            this._headersMap = headers._headersMap;
            return;
        }
        this._headersMap = new collection_1.Map();
        if (lang_1.isBlank(headers)) {
            return;
        }
        // headers instanceof StringMap
        collection_1.StringMapWrapper.forEach(headers, function (v, k) {
            _this._headersMap.set(k, collection_1.isListLikeIterable(v) ? v : [v]);
        });
    }
    /**
     * Returns a new Headers instance from the given DOMString of Response Headers
     */
    Headers.fromResponseHeaderString = function (headersString) {
        return headersString.trim()
            .split('\n')
            .map(function (val) { return val.split(':'); })
            .map(function (_a) {
            var key = _a[0], parts = _a.slice(1);
            return ([key.trim(), parts.join(':').trim()]);
        })
            .reduce(function (headers, _a) {
            var key = _a[0], value = _a[1];
            return !headers.set(key, value) && headers;
        }, new Headers());
    };
    /**
     * Appends a header to existing list of header values for a given header name.
     */
    Headers.prototype.append = function (name, value) {
        var mapName = this._headersMap.get(name);
        var list = collection_1.isListLikeIterable(mapName) ? mapName : [];
        list.push(value);
        this._headersMap.set(name, list);
    };
    /**
     * Deletes all header values for the given name.
     */
    Headers.prototype.delete = function (name) { this._headersMap.delete(name); };
    Headers.prototype.forEach = function (fn) {
        this._headersMap.forEach(fn);
    };
    /**
     * Returns first header that matches given name.
     */
    Headers.prototype.get = function (header) { return collection_1.ListWrapper.first(this._headersMap.get(header)); };
    /**
     * Check for existence of header by given name.
     */
    Headers.prototype.has = function (header) { return this._headersMap.has(header); };
    /**
     * Provides names of set headers
     */
    Headers.prototype.keys = function () { return collection_1.MapWrapper.keys(this._headersMap); };
    /**
     * Sets or overrides header value for given name.
     */
    Headers.prototype.set = function (header, value) {
        var list = [];
        if (collection_1.isListLikeIterable(value)) {
            var pushValue = value.join(',');
            list.push(pushValue);
        }
        else {
            list.push(value);
        }
        this._headersMap.set(header, list);
    };
    /**
     * Returns values of all headers.
     */
    Headers.prototype.values = function () { return collection_1.MapWrapper.values(this._headersMap); };
    /**
     * Returns string of all headers.
     */
    Headers.prototype.toJSON = function () {
        var serializableHeaders = {};
        this._headersMap.forEach(function (values, name) {
            var list = [];
            collection_1.iterateListLike(values, function (val) { return list = collection_1.ListWrapper.concat(list, val.split(',')); });
            serializableHeaders[name] = list;
        });
        return serializableHeaders;
    };
    /**
     * Returns list of header values for a given name.
     */
    Headers.prototype.getAll = function (header) {
        var headers = this._headersMap.get(header);
        return collection_1.isListLikeIterable(headers) ? headers : [];
    };
    /**
     * This method is not implemented.
     */
    Headers.prototype.entries = function () { throw new exceptions_1.BaseException('"entries" method is not implemented on Headers class'); };
    return Headers;
}());
exports.Headers = Headers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9odHRwL2hlYWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFCQU9PLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsMkJBT08sZ0NBQWdDLENBQUMsQ0FBQTtBQUV4Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUNIO0lBR0UsaUJBQVksT0FBd0M7UUFIdEQsaUJBa0hDO1FBOUdHLEVBQUUsQ0FBQyxDQUFDLE9BQU8sWUFBWSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxXQUFXLEdBQWEsT0FBUSxDQUFDLFdBQVcsQ0FBQztZQUNsRCxNQUFNLENBQUM7UUFDVCxDQUFDO1FBRUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLGdCQUFHLEVBQW9CLENBQUM7UUFFL0MsRUFBRSxDQUFDLENBQUMsY0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixNQUFNLENBQUM7UUFDVCxDQUFDO1FBRUQsK0JBQStCO1FBQy9CLDZCQUFnQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFNLEVBQUUsQ0FBUztZQUNsRCxLQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsK0JBQWtCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNJLGdDQUF3QixHQUEvQixVQUFnQyxhQUFxQjtRQUNuRCxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRTthQUN0QixLQUFLLENBQUMsSUFBSSxDQUFDO2FBQ1gsR0FBRyxDQUFD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LE9BQU8sQ0FBQyxVQUFDLE1BQWdCLEVBQUUsSUFBWTtZQUN0RCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7WUFFZCw0QkFBZSxDQUFDLE1BQU0sRUFBRSxVQUFBLEdBQUcsSUFBSSxPQUFBLElBQUksR0FBRyx3QkFBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUEvQyxDQUErQyxDQUFDLENBQUM7WUFFaEYsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLG1CQUFtQixDQUFDO0lBQzdCLENBQUM7SUFFRDs7T0FFRztJQUNILHdCQUFNLEdBQU4sVUFBTyxNQUFjO1FBQ25CLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLE1BQU0sQ0FBQywrQkFBa0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ3BELENBQUM7SUFFRDs7T0FFRztJQUNILHlCQUFPLEdBQVAsY0FBWSxNQUFNLElBQUksMEJBQWEsQ0FBQyxzREFBc0QsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRyxjQUFDO0FBQUQsQ0FBQyxBQWxIRCxJQWtIQztBQWxIWSxlQUFPLFVBa0huQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBpc0pzT2JqZWN0LFxuICBpc1R5cGUsXG4gIFN0cmluZ1dyYXBwZXIsXG4gIEpzb25cbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7XG4gIGlzTGlzdExpa2VJdGVyYWJsZSxcbiAgaXRlcmF0ZUxpc3RMaWtlLFxuICBNYXAsXG4gIE1hcFdyYXBwZXIsXG4gIFN0cmluZ01hcFdyYXBwZXIsXG4gIExpc3RXcmFwcGVyLFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG4vKipcbiAqIFBvbHlmaWxsIGZvciBbSGVhZGVyc10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0hlYWRlcnMvSGVhZGVycyksIGFzXG4gKiBzcGVjaWZpZWQgaW4gdGhlIFtGZXRjaCBTcGVjXShodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jaGVhZGVycy1jbGFzcykuXG4gKlxuICogVGhlIG9ubHkga25vd24gZGlmZmVyZW5jZSBiZXR3ZWVuIHRoaXMgYEhlYWRlcnNgIGltcGxlbWVudGF0aW9uIGFuZCB0aGUgc3BlYyBpcyB0aGVcbiAqIGxhY2sgb2YgYW4gYGVudHJpZXNgIG1ldGhvZC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvTVRkd1Q2P3A9cHJldmlldykpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0hlYWRlcnN9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICpcbiAqIHZhciBmaXJzdEhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xuICogZmlyc3RIZWFkZXJzLmFwcGVuZCgnQ29udGVudC1UeXBlJywgJ2ltYWdlL2pwZWcnKTtcbiAqIGNvbnNvbGUubG9nKGZpcnN0SGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpKSAvLydpbWFnZS9qcGVnJ1xuICpcbiAqIC8vIENyZWF0ZSBoZWFkZXJzIGZyb20gUGxhaW4gT2xkIEphdmFTY3JpcHQgT2JqZWN0XG4gKiB2YXIgc2Vjb25kSGVhZGVycyA9IG5ldyBIZWFkZXJzKHtcbiAqICAgJ1gtTXktQ3VzdG9tLUhlYWRlcic6ICdBbmd1bGFyJ1xuICogfSk7XG4gKiBjb25zb2xlLmxvZyhzZWNvbmRIZWFkZXJzLmdldCgnWC1NeS1DdXN0b20tSGVhZGVyJykpOyAvLydBbmd1bGFyJ1xuICpcbiAqIHZhciB0aGlyZEhlYWRlcnMgPSBuZXcgSGVhZGVycyhzZWNvbmRIZWFkZXJzKTtcbiAqIGNvbnNvbGUubG9nKHRoaXJkSGVhZGVycy5nZXQoJ1gtTXktQ3VzdG9tLUhlYWRlcicpKTsgLy8nQW5ndWxhcidcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgSGVhZGVycyB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2hlYWRlcnNNYXA6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPjtcbiAgY29uc3RydWN0b3IoaGVhZGVycz86IEhlYWRlcnMgfCB7W2tleTogc3RyaW5nXTogYW55fSkge1xuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgdGhpcy5faGVhZGVyc01hcCA9ICg8SGVhZGVycz5oZWFkZXJzKS5faGVhZGVyc01hcDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9oZWFkZXJzTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuXG4gICAgaWYgKGlzQmxhbmsoaGVhZGVycykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBoZWFkZXJzIGluc3RhbmNlb2YgU3RyaW5nTWFwXG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGhlYWRlcnMsICh2OiBhbnksIGs6IHN0cmluZykgPT4ge1xuICAgICAgdGhpcy5faGVhZGVyc01hcC5zZXQoaywgaXNMaXN0TGlrZUl0ZXJhYmxlKHYpID8gdiA6IFt2XSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBIZWFkZXJzIGluc3RhbmNlIGZyb20gdGhlIGdpdmVuIERPTVN0cmluZyBvZiBSZXNwb25zZSBIZWFkZXJzXG4gICAqL1xuICBzdGF0aWMgZnJvbVJlc3BvbnNlSGVhZGVyU3RyaW5nKGhlYWRlcnNTdHJpbmc6IHN0cmluZyk6IEhlYWRlcnMge1xuICAgIHJldHVybiBoZWFkZXJzU3RyaW5nLnRyaW0oKVxuICAgICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAgIC5tYXAodmFsID0+IHZhbC5zcGxpdCgnOicpKVxuICAgICAgICAubWFwKChba2V5LCAuLi5wYXJ0c10pID0+IChba2V5LnRyaW0oKSwgcGFydHMuam9pbignOicpLnRyaW0oKV0pKVxuICAgICAgICAucmVkdWNlKChoZWFkZXJzLCBba2V5LCB2YWx1ZV0pID0+ICFoZWFkZXJzLnNldChrZXksIHZhbHVlKSAmJiBoZWFkZXJzLCBuZXcgSGVhZGVycygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIGEgaGVhZGVyIHRvIGV4aXN0aW5nIGxpc3Qgb2YgaGVhZGVyIHZhbHVlcyBmb3IgYSBnaXZlbiBoZWFkZXIgbmFtZS5cbiAgICovXG4gIGFwcGVuZChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB2YXIgbWFwTmFtZSA9IHRoaXMuX2hlYWRlcnNNYXAuZ2V0KG5hbWUpO1xuICAgIHZhciBsaXN0ID0gaXNMaXN0TGlrZUl0ZXJhYmxlKG1hcE5hbWUpID8gbWFwTmFtZSA6IFtdO1xuICAgIGxpc3QucHVzaCh2YWx1ZSk7XG4gICAgdGhpcy5faGVhZGVyc01hcC5zZXQobmFtZSwgbGlzdCk7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlcyBhbGwgaGVhZGVyIHZhbHVlcyBmb3IgdGhlIGdpdmVuIG5hbWUuXG4gICAqL1xuICBkZWxldGUgKG5hbWU6IHN0cmluZyk6IHZvaWQgeyB0aGlzLl9oZWFkZXJzTWFwLmRlbGV0ZShuYW1lKTsgfVxuXG4gIGZvckVhY2goZm46ICh2YWx1ZXM6IHN0cmluZ1tdLCBuYW1lOiBzdHJpbmcsIGhlYWRlcnM6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPikgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2hlYWRlcnNNYXAuZm9yRWFjaChmbik7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBmaXJzdCBoZWFkZXIgdGhhdCBtYXRjaGVzIGdpdmVuIG5hbWUuXG4gICAqL1xuICBnZXQoaGVhZGVyOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gTGlzdFdyYXBwZXIuZmlyc3QodGhpcy5faGVhZGVyc01hcC5nZXQoaGVhZGVyKSk7IH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIGV4aXN0ZW5jZSBvZiBoZWFkZXIgYnkgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIGhhcyhoZWFkZXI6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5faGVhZGVyc01hcC5oYXMoaGVhZGVyKTsgfVxuXG4gIC8qKlxuICAgKiBQcm92aWRlcyBuYW1lcyBvZiBzZXQgaGVhZGVyc1xuICAgKi9cbiAga2V5cygpOiBzdHJpbmdbXSB7IHJldHVybiBNYXBXcmFwcGVyLmtleXModGhpcy5faGVhZGVyc01hcCk7IH1cblxuICAvKipcbiAgICogU2V0cyBvciBvdmVycmlkZXMgaGVhZGVyIHZhbHVlIGZvciBnaXZlbiBuYW1lLlxuICAgKi9cbiAgc2V0KGhlYWRlcjogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgc3RyaW5nW10pOiB2b2lkIHtcbiAgICB2YXIgbGlzdDogc3RyaW5nW10gPSBbXTtcblxuICAgIGlmIChpc0xpc3RMaWtlSXRlcmFibGUodmFsdWUpKSB7XG4gICAgICB2YXIgcHVzaFZhbHVlID0gKDxzdHJpbmdbXT52YWx1ZSkuam9pbignLCcpO1xuICAgICAgbGlzdC5wdXNoKHB1c2hWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3QucHVzaCg8c3RyaW5nPnZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLl9oZWFkZXJzTWFwLnNldChoZWFkZXIsIGxpc3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdmFsdWVzIG9mIGFsbCBoZWFkZXJzLlxuICAgKi9cbiAgdmFsdWVzKCk6IHN0cmluZ1tdW10geyByZXR1cm4gTWFwV3JhcHBlci52YWx1ZXModGhpcy5faGVhZGVyc01hcCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyBzdHJpbmcgb2YgYWxsIGhlYWRlcnMuXG4gICAqL1xuICB0b0pTT04oKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGxldCBzZXJpYWxpemFibGVIZWFkZXJzID0ge307XG4gICAgdGhpcy5faGVhZGVyc01hcC5mb3JFYWNoKCh2YWx1ZXM6IHN0cmluZ1tdLCBuYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIGxldCBsaXN0ID0gW107XG5cbiAgICAgIGl0ZXJhdGVMaXN0TGlrZSh2YWx1ZXMsIHZhbCA9PiBsaXN0ID0gTGlzdFdyYXBwZXIuY29uY2F0KGxpc3QsIHZhbC5zcGxpdCgnLCcpKSk7XG5cbiAgICAgIHNlcmlhbGl6YWJsZUhlYWRlcnNbbmFtZV0gPSBsaXN0O1xuICAgIH0pO1xuICAgIHJldHVybiBzZXJpYWxpemFibGVIZWFkZXJzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgbGlzdCBvZiBoZWFkZXIgdmFsdWVzIGZvciBhIGdpdmVuIG5hbWUuXG4gICAqL1xuICBnZXRBbGwoaGVhZGVyOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgdmFyIGhlYWRlcnMgPSB0aGlzLl9oZWFkZXJzTWFwLmdldChoZWFkZXIpO1xuICAgIHJldHVybiBpc0xpc3RMaWtlSXRlcmFibGUoaGVhZGVycykgPyBoZWFkZXJzIDogW107XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgaXMgbm90IGltcGxlbWVudGVkLlxuICAgKi9cbiAgZW50cmllcygpIHsgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ1wiZW50cmllc1wiIG1ldGhvZCBpcyBub3QgaW1wbGVtZW50ZWQgb24gSGVhZGVycyBjbGFzcycpOyB9XG59XG4iXX0=