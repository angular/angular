import { isBlank, Json } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { isListLikeIterable, Map, MapWrapper, StringMapWrapper, ListWrapper } from 'angular2/src/facade/collection';
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
export class Headers {
    constructor(headers) {
        if (headers instanceof Headers) {
            this._headersMap = headers._headersMap;
            return;
        }
        this._headersMap = new Map();
        if (isBlank(headers)) {
            return;
        }
        // headers instanceof StringMap
        StringMapWrapper.forEach(headers, (v, k) => { this._headersMap.set(k, isListLikeIterable(v) ? v : [v]); });
    }
    /**
     * Returns a new Headers instance from the given DOMString of Response Headers
     */
    static fromResponseHeaderString(headersString) {
        return headersString.trim()
            .split('\n')
            .map(val => val.split(':'))
            .map(([key, ...parts]) => ([key.trim(), parts.join(':').trim()]))
            .reduce((headers, [key, value]) => !headers.set(key, value) && headers, new Headers());
    }
    /**
     * Appends a header to existing list of header values for a given header name.
     */
    append(name, value) {
        var mapName = this._headersMap.get(name);
        var list = isListLikeIterable(mapName) ? mapName : [];
        list.push(value);
        this._headersMap.set(name, list);
    }
    /**
     * Deletes all header values for the given name.
     */
    delete(name) { this._headersMap.delete(name); }
    forEach(fn) {
        this._headersMap.forEach(fn);
    }
    /**
     * Returns first header that matches given name.
     */
    get(header) { return ListWrapper.first(this._headersMap.get(header)); }
    /**
     * Check for existence of header by given name.
     */
    has(header) { return this._headersMap.has(header); }
    /**
     * Provides names of set headers
     */
    keys() { return MapWrapper.keys(this._headersMap); }
    /**
     * Sets or overrides header value for given name.
     */
    set(header, value) {
        var list = [];
        if (isListLikeIterable(value)) {
            var pushValue = value.join(',');
            list.push(pushValue);
        }
        else {
            list.push(value);
        }
        this._headersMap.set(header, list);
    }
    /**
     * Returns values of all headers.
     */
    values() { return MapWrapper.values(this._headersMap); }
    /**
     * Returns string of all headers.
     */
    toJSON() { return Json.stringify(this.values()); }
    /**
     * Returns list of header values for a given name.
     */
    getAll(header) {
        var headers = this._headersMap.get(header);
        return isListLikeIterable(headers) ? headers : [];
    }
    /**
     * This method is not implemented.
     */
    entries() { throw new BaseException('"entries" method is not implemented on Headers class'); }
}
