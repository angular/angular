'use strict';var lang_1 = require('angular2/src/facade/lang');
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
        collection_1.StringMapWrapper.forEach(headers, function (v, k) { _this._headersMap.set(k, collection_1.isListLikeIterable(v) ? v : [v]); });
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
})();
exports.Headers = Headers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9odHRwL2hlYWRlcnMudHMiXSwibmFtZXMiOlsiSGVhZGVycyIsIkhlYWRlcnMuY29uc3RydWN0b3IiLCJIZWFkZXJzLmZyb21SZXNwb25zZUhlYWRlclN0cmluZyIsIkhlYWRlcnMuYXBwZW5kIiwiSGVhZGVycy5kZWxldGUiLCJIZWFkZXJzLmZvckVhY2giLCJIZWFkZXJzLmdldCIsIkhlYWRlcnMuaGFzIiwiSGVhZGVycy5rZXlzIiwiSGVhZGVycy5zZXQiLCJIZWFkZXJzLnZhbHVlcyIsIkhlYWRlcnMuZ2V0QWxsIiwiSGVhZGVycy5lbnRyaWVzIl0sIm1hcHBpbmdzIjoiQUFBQSxxQkFBb0UsMEJBQTBCLENBQUMsQ0FBQTtBQUMvRiwyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRSwyQkFNTyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRXhDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeUJHO0FBQ0g7SUFHRUEsaUJBQVlBLE9BQXdDQTtRQUh0REMsaUJBa0dDQTtRQTlGR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsWUFBWUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0JBLElBQUlBLENBQUNBLFdBQVdBLEdBQWFBLE9BQVFBLENBQUNBLFdBQVdBLENBQUNBO1lBQ2xEQSxNQUFNQSxDQUFDQTtRQUNUQSxDQUFDQTtRQUVEQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxJQUFJQSxnQkFBR0EsRUFBb0JBLENBQUNBO1FBRS9DQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQkEsTUFBTUEsQ0FBQ0E7UUFDVEEsQ0FBQ0E7UUFFREEsK0JBQStCQTtRQUMvQkEsNkJBQWdCQSxDQUFDQSxPQUFPQSxDQUNwQkEsT0FBT0EsRUFBRUEsVUFBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBT0EsS0FB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b3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgaXNKc09iamVjdCwgaXNUeXBlLCBTdHJpbmdXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtcbiAgaXNMaXN0TGlrZUl0ZXJhYmxlLFxuICBNYXAsXG4gIE1hcFdyYXBwZXIsXG4gIFN0cmluZ01hcFdyYXBwZXIsXG4gIExpc3RXcmFwcGVyLFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG4vKipcbiAqIFBvbHlmaWxsIGZvciBbSGVhZGVyc10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0hlYWRlcnMvSGVhZGVycyksIGFzXG4gKiBzcGVjaWZpZWQgaW4gdGhlIFtGZXRjaCBTcGVjXShodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jaGVhZGVycy1jbGFzcykuXG4gKlxuICogVGhlIG9ubHkga25vd24gZGlmZmVyZW5jZSBiZXR3ZWVuIHRoaXMgYEhlYWRlcnNgIGltcGxlbWVudGF0aW9uIGFuZCB0aGUgc3BlYyBpcyB0aGVcbiAqIGxhY2sgb2YgYW4gYGVudHJpZXNgIG1ldGhvZC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvTVRkd1Q2P3A9cHJldmlldykpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0hlYWRlcnN9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICpcbiAqIHZhciBmaXJzdEhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xuICogZmlyc3RIZWFkZXJzLmFwcGVuZCgnQ29udGVudC1UeXBlJywgJ2ltYWdlL2pwZWcnKTtcbiAqIGNvbnNvbGUubG9nKGZpcnN0SGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpKSAvLydpbWFnZS9qcGVnJ1xuICpcbiAqIC8vIENyZWF0ZSBoZWFkZXJzIGZyb20gUGxhaW4gT2xkIEphdmFTY3JpcHQgT2JqZWN0XG4gKiB2YXIgc2Vjb25kSGVhZGVycyA9IG5ldyBIZWFkZXJzKHtcbiAqICAgJ1gtTXktQ3VzdG9tLUhlYWRlcic6ICdBbmd1bGFyJ1xuICogfSk7XG4gKiBjb25zb2xlLmxvZyhzZWNvbmRIZWFkZXJzLmdldCgnWC1NeS1DdXN0b20tSGVhZGVyJykpOyAvLydBbmd1bGFyJ1xuICpcbiAqIHZhciB0aGlyZEhlYWRlcnMgPSBuZXcgSGVhZGVycyhzZWNvbmRIZWFkZXJzKTtcbiAqIGNvbnNvbGUubG9nKHRoaXJkSGVhZGVycy5nZXQoJ1gtTXktQ3VzdG9tLUhlYWRlcicpKTsgLy8nQW5ndWxhcidcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgSGVhZGVycyB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2hlYWRlcnNNYXA6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPjtcbiAgY29uc3RydWN0b3IoaGVhZGVycz86IEhlYWRlcnMgfCB7W2tleTogc3RyaW5nXTogYW55fSkge1xuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgdGhpcy5faGVhZGVyc01hcCA9ICg8SGVhZGVycz5oZWFkZXJzKS5faGVhZGVyc01hcDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9oZWFkZXJzTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuXG4gICAgaWYgKGlzQmxhbmsoaGVhZGVycykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBoZWFkZXJzIGluc3RhbmNlb2YgU3RyaW5nTWFwXG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKFxuICAgICAgICBoZWFkZXJzLCAodiwgaykgPT4geyB0aGlzLl9oZWFkZXJzTWFwLnNldChrLCBpc0xpc3RMaWtlSXRlcmFibGUodikgPyB2IDogW3ZdKTsgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBIZWFkZXJzIGluc3RhbmNlIGZyb20gdGhlIGdpdmVuIERPTVN0cmluZyBvZiBSZXNwb25zZSBIZWFkZXJzXG4gICAqL1xuICBzdGF0aWMgZnJvbVJlc3BvbnNlSGVhZGVyU3RyaW5nKGhlYWRlcnNTdHJpbmc6IHN0cmluZyk6IEhlYWRlcnMge1xuICAgIHJldHVybiBoZWFkZXJzU3RyaW5nLnRyaW0oKVxuICAgICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAgIC5tYXAodmFsID0+IHZhbC5zcGxpdCgnOicpKVxuICAgICAgICAubWFwKChba2V5LCAuLi5wYXJ0c10pID0+IChba2V5LnRyaW0oKSwgcGFydHMuam9pbignOicpLnRyaW0oKV0pKVxuICAgICAgICAucmVkdWNlKChoZWFkZXJzLCBba2V5LCB2YWx1ZV0pID0+ICFoZWFkZXJzLnNldChrZXksIHZhbHVlKSAmJiBoZWFkZXJzLCBuZXcgSGVhZGVycygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIGEgaGVhZGVyIHRvIGV4aXN0aW5nIGxpc3Qgb2YgaGVhZGVyIHZhbHVlcyBmb3IgYSBnaXZlbiBoZWFkZXIgbmFtZS5cbiAgICovXG4gIGFwcGVuZChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB2YXIgbWFwTmFtZSA9IHRoaXMuX2hlYWRlcnNNYXAuZ2V0KG5hbWUpO1xuICAgIHZhciBsaXN0ID0gaXNMaXN0TGlrZUl0ZXJhYmxlKG1hcE5hbWUpID8gbWFwTmFtZSA6IFtdO1xuICAgIGxpc3QucHVzaCh2YWx1ZSk7XG4gICAgdGhpcy5faGVhZGVyc01hcC5zZXQobmFtZSwgbGlzdCk7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlcyBhbGwgaGVhZGVyIHZhbHVlcyBmb3IgdGhlIGdpdmVuIG5hbWUuXG4gICAqL1xuICBkZWxldGUgKG5hbWU6IHN0cmluZyk6IHZvaWQgeyB0aGlzLl9oZWFkZXJzTWFwLmRlbGV0ZShuYW1lKTsgfVxuXG4gIGZvckVhY2goZm46ICh2YWx1ZXM6IHN0cmluZ1tdLCBuYW1lOiBzdHJpbmcsIGhlYWRlcnM6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPikgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2hlYWRlcnNNYXAuZm9yRWFjaChmbik7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBmaXJzdCBoZWFkZXIgdGhhdCBtYXRjaGVzIGdpdmVuIG5hbWUuXG4gICAqL1xuICBnZXQoaGVhZGVyOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gTGlzdFdyYXBwZXIuZmlyc3QodGhpcy5faGVhZGVyc01hcC5nZXQoaGVhZGVyKSk7IH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIGV4aXN0ZW5jZSBvZiBoZWFkZXIgYnkgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIGhhcyhoZWFkZXI6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5faGVhZGVyc01hcC5oYXMoaGVhZGVyKTsgfVxuXG4gIC8qKlxuICAgKiBQcm92aWRlcyBuYW1lcyBvZiBzZXQgaGVhZGVyc1xuICAgKi9cbiAga2V5cygpOiBzdHJpbmdbXSB7IHJldHVybiBNYXBXcmFwcGVyLmtleXModGhpcy5faGVhZGVyc01hcCk7IH1cblxuICAvKipcbiAgICogU2V0cyBvciBvdmVycmlkZXMgaGVhZGVyIHZhbHVlIGZvciBnaXZlbiBuYW1lLlxuICAgKi9cbiAgc2V0KGhlYWRlcjogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgc3RyaW5nW10pOiB2b2lkIHtcbiAgICB2YXIgbGlzdCA9IFtdO1xuXG4gICAgaWYgKGlzTGlzdExpa2VJdGVyYWJsZSh2YWx1ZSkpIHtcbiAgICAgIHZhciBwdXNoVmFsdWUgPSAoPHN0cmluZ1tdPnZhbHVlKS5qb2luKCcsJyk7XG4gICAgICBsaXN0LnB1c2gocHVzaFZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5wdXNoKHZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLl9oZWFkZXJzTWFwLnNldChoZWFkZXIsIGxpc3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdmFsdWVzIG9mIGFsbCBoZWFkZXJzLlxuICAgKi9cbiAgdmFsdWVzKCk6IHN0cmluZ1tdW10geyByZXR1cm4gTWFwV3JhcHBlci52YWx1ZXModGhpcy5faGVhZGVyc01hcCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyBsaXN0IG9mIGhlYWRlciB2YWx1ZXMgZm9yIGEgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIGdldEFsbChoZWFkZXI6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICB2YXIgaGVhZGVycyA9IHRoaXMuX2hlYWRlcnNNYXAuZ2V0KGhlYWRlcik7XG4gICAgcmV0dXJuIGlzTGlzdExpa2VJdGVyYWJsZShoZWFkZXJzKSA/IGhlYWRlcnMgOiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBub3QgaW1wbGVtZW50ZWQuXG4gICAqL1xuICBlbnRyaWVzKCkgeyB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignXCJlbnRyaWVzXCIgbWV0aG9kIGlzIG5vdCBpbXBsZW1lbnRlZCBvbiBIZWFkZXJzIGNsYXNzJyk7IH1cbn1cbiJdfQ==