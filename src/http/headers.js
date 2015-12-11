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
     * Returns string of all headers.
     */
    Headers.prototype.toJSON = function () { return lang_1.Json.stringify(this.values()); };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9odHRwL2hlYWRlcnMudHMiXSwibmFtZXMiOlsiSGVhZGVycyIsIkhlYWRlcnMuY29uc3RydWN0b3IiLCJIZWFkZXJzLmZyb21SZXNwb25zZUhlYWRlclN0cmluZyIsIkhlYWRlcnMuYXBwZW5kIiwiSGVhZGVycy5kZWxldGUiLCJIZWFkZXJzLmZvckVhY2giLCJIZWFkZXJzLmdldCIsIkhlYWRlcnMuaGFzIiwiSGVhZGVycy5rZXlzIiwiSGVhZGVycy5zZXQiLCJIZWFkZXJzLnZhbHVlcyIsIkhlYWRlcnMudG9KU09OIiwiSGVhZGVycy5nZXRBbGwiLCJIZWFkZXJzLmVudHJpZXMiXSwibWFwcGluZ3MiOiJBQUFBLHFCQU9PLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsMkJBTU8sZ0NBQWdDLENBQUMsQ0FBQTtBQUV4Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlCRztBQUNIO0lBR0VBLGlCQUFZQSxPQUF3Q0E7UUFIdERDLGlCQXVHQ0E7UUFuR0dBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLFlBQVlBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQy9CQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFhQSxPQUFRQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUNsREEsTUFBTUEsQ0FBQ0E7UUFDVEEsQ0FBQ0E7UUFFREEsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsSUFBSUEsZ0JBQUdBLEVBQW9CQSxDQUFDQTtRQUUvQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLE1BQU1BLENBQUNBO1FBQ1RBLENBQUNBO1FBRURBLCtCQUErQkE7UUFDL0JBLDZCQUFnQkEsQ0FBQ0EsT0FBT0EsQ0FDcEJBLE9BQU9BLEVBQUVBLFVBQUNBLENBQUNBLEVBQUVB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LHlCQUFPQSxHQUFQQSxjQUFZYSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0Esc0RBQXNEQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoR2IsY0FBQ0E7QUFBREEsQ0FBQ0EsQUF2R0QsSUF1R0M7QUF2R1ksZUFBTyxVQXVHbkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgaXNKc09iamVjdCxcbiAgaXNUeXBlLFxuICBTdHJpbmdXcmFwcGVyLFxuICBKc29uXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1xuICBpc0xpc3RMaWtlSXRlcmFibGUsXG4gIE1hcCxcbiAgTWFwV3JhcHBlcixcbiAgU3RyaW5nTWFwV3JhcHBlcixcbiAgTGlzdFdyYXBwZXIsXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbi8qKlxuICogUG9seWZpbGwgZm9yIFtIZWFkZXJzXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSGVhZGVycy9IZWFkZXJzKSwgYXNcbiAqIHNwZWNpZmllZCBpbiB0aGUgW0ZldGNoIFNwZWNdKGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNoZWFkZXJzLWNsYXNzKS5cbiAqXG4gKiBUaGUgb25seSBrbm93biBkaWZmZXJlbmNlIGJldHdlZW4gdGhpcyBgSGVhZGVyc2AgaW1wbGVtZW50YXRpb24gYW5kIHRoZSBzcGVjIGlzIHRoZVxuICogbGFjayBvZiBhbiBgZW50cmllc2AgbWV0aG9kLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9NVGR3VDY/cD1wcmV2aWV3KSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7SGVhZGVyc30gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKlxuICogdmFyIGZpcnN0SGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XG4gKiBmaXJzdEhlYWRlcnMuYXBwZW5kKCdDb250ZW50LVR5cGUnLCAnaW1hZ2UvanBlZycpO1xuICogY29uc29sZS5sb2coZmlyc3RIZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykpIC8vJ2ltYWdlL2pwZWcnXG4gKlxuICogLy8gQ3JlYXRlIGhlYWRlcnMgZnJvbSBQbGFpbiBPbGQgSmF2YVNjcmlwdCBPYmplY3RcbiAqIHZhciBzZWNvbmRIZWFkZXJzID0gbmV3IEhlYWRlcnMoe1xuICogICAnWC1NeS1DdXN0b20tSGVhZGVyJzogJ0FuZ3VsYXInXG4gKiB9KTtcbiAqIGNvbnNvbGUubG9nKHNlY29uZEhlYWRlcnMuZ2V0KCdYLU15LUN1c3RvbS1IZWFkZXInKSk7IC8vJ0FuZ3VsYXInXG4gKlxuICogdmFyIHRoaXJkSGVhZGVycyA9IG5ldyBIZWFkZXJzKHNlY29uZEhlYWRlcnMpO1xuICogY29uc29sZS5sb2codGhpcmRIZWFkZXJzLmdldCgnWC1NeS1DdXN0b20tSGVhZGVyJykpOyAvLydBbmd1bGFyJ1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBIZWFkZXJzIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfaGVhZGVyc01hcDogTWFwPHN0cmluZywgc3RyaW5nW10+O1xuICBjb25zdHJ1Y3RvcihoZWFkZXJzPzogSGVhZGVycyB8IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICB0aGlzLl9oZWFkZXJzTWFwID0gKDxIZWFkZXJzPmhlYWRlcnMpLl9oZWFkZXJzTWFwO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2hlYWRlcnNNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG5cbiAgICBpZiAoaXNCbGFuayhoZWFkZXJzKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGhlYWRlcnMgaW5zdGFuY2VvZiBTdHJpbmdNYXBcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goXG4gICAgICAgIGhlYWRlcnMsICh2LCBrKSA9PiB7IHRoaXMuX2hlYWRlcnNNYXAuc2V0KGssIGlzTGlzdExpa2VJdGVyYWJsZSh2KSA/IHYgOiBbdl0pOyB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IEhlYWRlcnMgaW5zdGFuY2UgZnJvbSB0aGUgZ2l2ZW4gRE9NU3RyaW5nIG9mIFJlc3BvbnNlIEhlYWRlcnNcbiAgICovXG4gIHN0YXRpYyBmcm9tUmVzcG9uc2VIZWFkZXJTdHJpbmcoaGVhZGVyc1N0cmluZzogc3RyaW5nKTogSGVhZGVycyB7XG4gICAgcmV0dXJuIGhlYWRlcnNTdHJpbmcudHJpbSgpXG4gICAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgICAgLm1hcCh2YWwgPT4gdmFsLnNwbGl0KCc6JykpXG4gICAgICAgIC5tYXAoKFtrZXksIC4uLnBhcnRzXSkgPT4gKFtrZXkudHJpbSgpLCBwYXJ0cy5qb2luKCc6JykudHJpbSgpXSkpXG4gICAgICAgIC5yZWR1Y2UoKGhlYWRlcnMsIFtrZXksIHZhbHVlXSkgPT4gIWhlYWRlcnMuc2V0KGtleSwgdmFsdWUpICYmIGhlYWRlcnMsIG5ldyBIZWFkZXJzKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZHMgYSBoZWFkZXIgdG8gZXhpc3RpbmcgbGlzdCBvZiBoZWFkZXIgdmFsdWVzIGZvciBhIGdpdmVuIGhlYWRlciBuYW1lLlxuICAgKi9cbiAgYXBwZW5kKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHZhciBtYXBOYW1lID0gdGhpcy5faGVhZGVyc01hcC5nZXQobmFtZSk7XG4gICAgdmFyIGxpc3QgPSBpc0xpc3RMaWtlSXRlcmFibGUobWFwTmFtZSkgPyBtYXBOYW1lIDogW107XG4gICAgbGlzdC5wdXNoKHZhbHVlKTtcbiAgICB0aGlzLl9oZWFkZXJzTWFwLnNldChuYW1lLCBsaXN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGVzIGFsbCBoZWFkZXIgdmFsdWVzIGZvciB0aGUgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIGRlbGV0ZSAobmFtZTogc3RyaW5nKTogdm9pZCB7IHRoaXMuX2hlYWRlcnNNYXAuZGVsZXRlKG5hbWUpOyB9XG5cbiAgZm9yRWFjaChmbjogKHZhbHVlczogc3RyaW5nW10sIG5hbWU6IHN0cmluZywgaGVhZGVyczogTWFwPHN0cmluZywgc3RyaW5nW10+KSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5faGVhZGVyc01hcC5mb3JFYWNoKGZuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGZpcnN0IGhlYWRlciB0aGF0IG1hdGNoZXMgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIGdldChoZWFkZXI6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBMaXN0V3JhcHBlci5maXJzdCh0aGlzLl9oZWFkZXJzTWFwLmdldChoZWFkZXIpKTsgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgZXhpc3RlbmNlIG9mIGhlYWRlciBieSBnaXZlbiBuYW1lLlxuICAgKi9cbiAgaGFzKGhlYWRlcjogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9oZWFkZXJzTWFwLmhhcyhoZWFkZXIpOyB9XG5cbiAgLyoqXG4gICAqIFByb3ZpZGVzIG5hbWVzIG9mIHNldCBoZWFkZXJzXG4gICAqL1xuICBrZXlzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIE1hcFdyYXBwZXIua2V5cyh0aGlzLl9oZWFkZXJzTWFwKTsgfVxuXG4gIC8qKlxuICAgKiBTZXRzIG9yIG92ZXJyaWRlcyBoZWFkZXIgdmFsdWUgZm9yIGdpdmVuIG5hbWUuXG4gICAqL1xuICBzZXQoaGVhZGVyOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBzdHJpbmdbXSk6IHZvaWQge1xuICAgIHZhciBsaXN0ID0gW107XG5cbiAgICBpZiAoaXNMaXN0TGlrZUl0ZXJhYmxlKHZhbHVlKSkge1xuICAgICAgdmFyIHB1c2hWYWx1ZSA9ICg8c3RyaW5nW10+dmFsdWUpLmpvaW4oJywnKTtcbiAgICAgIGxpc3QucHVzaChwdXNoVmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnB1c2godmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMuX2hlYWRlcnNNYXAuc2V0KGhlYWRlciwgbGlzdCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB2YWx1ZXMgb2YgYWxsIGhlYWRlcnMuXG4gICAqL1xuICB2YWx1ZXMoKTogc3RyaW5nW11bXSB7IHJldHVybiBNYXBXcmFwcGVyLnZhbHVlcyh0aGlzLl9oZWFkZXJzTWFwKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHN0cmluZyBvZiBhbGwgaGVhZGVycy5cbiAgICovXG4gIHRvSlNPTigpOiBzdHJpbmcgeyByZXR1cm4gSnNvbi5zdHJpbmdpZnkodGhpcy52YWx1ZXMoKSk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyBsaXN0IG9mIGhlYWRlciB2YWx1ZXMgZm9yIGEgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIGdldEFsbChoZWFkZXI6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICB2YXIgaGVhZGVycyA9IHRoaXMuX2hlYWRlcnNNYXAuZ2V0KGhlYWRlcik7XG4gICAgcmV0dXJuIGlzTGlzdExpa2VJdGVyYWJsZShoZWFkZXJzKSA/IGhlYWRlcnMgOiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBub3QgaW1wbGVtZW50ZWQuXG4gICAqL1xuICBlbnRyaWVzKCkgeyB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignXCJlbnRyaWVzXCIgbWV0aG9kIGlzIG5vdCBpbXBsZW1lbnRlZCBvbiBIZWFkZXJzIGNsYXNzJyk7IH1cbn1cbiJdfQ==