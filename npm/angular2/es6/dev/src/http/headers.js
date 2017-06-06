import { isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { isListLikeIterable, iterateListLike, Map, MapWrapper, StringMapWrapper, ListWrapper } from 'angular2/src/facade/collection';
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
        StringMapWrapper.forEach(headers, (v, k) => {
            this._headersMap.set(k, isListLikeIterable(v) ? v : [v]);
        });
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
    toJSON() {
        let serializableHeaders = {};
        this._headersMap.forEach((values, name) => {
            let list = [];
            iterateListLike(values, val => list = ListWrapper.concat(list, val.split(',')));
            serializableHeaders[name] = list;
        });
        return serializableHeaders;
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9odHRwL2hlYWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BQU8sRUFFTCxPQUFPLEVBS1IsTUFBTSwwQkFBMEI7T0FDMUIsRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BQ3ZFLEVBQ0wsa0JBQWtCLEVBQ2xCLGVBQWUsRUFDZixHQUFHLEVBQ0gsVUFBVSxFQUNWLGdCQUFnQixFQUNoQixXQUFXLEVBQ1osTUFBTSxnQ0FBZ0M7QUFFdkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5Qkc7QUFDSDtJQUdFLFlBQVksT0FBd0M7UUFDbEQsRUFBRSxDQUFDLENBQUMsT0FBTyxZQUFZLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLFdBQVcsR0FBYSxPQUFRLENBQUMsV0FBVyxDQUFDO1lBQ2xELE1BQU0sQ0FBQztRQUNULENBQUM7UUFFRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1FBRS9DLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsTUFBTSxDQUFDO1FBQ1QsQ0FBQztRQUVELCtCQUErQjtRQUMvQixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBTSxFQUFFLENBQVM7WUFDbEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxPQUFPLHdCQUF3QixDQUFDLGFBQXFCO1FBQ25ELE1BQU0sQ0FBQyxhQUFhLENBQUMs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QUM7WUFFZCxlQUFlLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFaEYsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLG1CQUFtQixDQUFDO0lBQzdCLENBQUM7SUFFRDs7T0FFRztJQUNILE1BQU0sQ0FBQyxNQUFjO1FBQ25CLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ3BELENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU8sS0FBSyxNQUFNLElBQUksYUFBYSxDQUFDLHNEQUFzRCxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hHLENBQUM7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgaXNKc09iamVjdCxcbiAgaXNUeXBlLFxuICBTdHJpbmdXcmFwcGVyLFxuICBKc29uXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1xuICBpc0xpc3RMaWtlSXRlcmFibGUsXG4gIGl0ZXJhdGVMaXN0TGlrZSxcbiAgTWFwLFxuICBNYXBXcmFwcGVyLFxuICBTdHJpbmdNYXBXcmFwcGVyLFxuICBMaXN0V3JhcHBlcixcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuLyoqXG4gKiBQb2x5ZmlsbCBmb3IgW0hlYWRlcnNdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9IZWFkZXJzL0hlYWRlcnMpLCBhc1xuICogc3BlY2lmaWVkIGluIHRoZSBbRmV0Y2ggU3BlY10oaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvI2hlYWRlcnMtY2xhc3MpLlxuICpcbiAqIFRoZSBvbmx5IGtub3duIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGlzIGBIZWFkZXJzYCBpbXBsZW1lbnRhdGlvbiBhbmQgdGhlIHNwZWMgaXMgdGhlXG4gKiBsYWNrIG9mIGFuIGBlbnRyaWVzYCBtZXRob2QuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L01UZHdUNj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtIZWFkZXJzfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqXG4gKiB2YXIgZmlyc3RIZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcbiAqIGZpcnN0SGVhZGVycy5hcHBlbmQoJ0NvbnRlbnQtVHlwZScsICdpbWFnZS9qcGVnJyk7XG4gKiBjb25zb2xlLmxvZyhmaXJzdEhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKSkgLy8naW1hZ2UvanBlZydcbiAqXG4gKiAvLyBDcmVhdGUgaGVhZGVycyBmcm9tIFBsYWluIE9sZCBKYXZhU2NyaXB0IE9iamVjdFxuICogdmFyIHNlY29uZEhlYWRlcnMgPSBuZXcgSGVhZGVycyh7XG4gKiAgICdYLU15LUN1c3RvbS1IZWFkZXInOiAnQW5ndWxhcidcbiAqIH0pO1xuICogY29uc29sZS5sb2coc2Vjb25kSGVhZGVycy5nZXQoJ1gtTXktQ3VzdG9tLUhlYWRlcicpKTsgLy8nQW5ndWxhcidcbiAqXG4gKiB2YXIgdGhpcmRIZWFkZXJzID0gbmV3IEhlYWRlcnMoc2Vjb25kSGVhZGVycyk7XG4gKiBjb25zb2xlLmxvZyh0aGlyZEhlYWRlcnMuZ2V0KCdYLU15LUN1c3RvbS1IZWFkZXInKSk7IC8vJ0FuZ3VsYXInXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIEhlYWRlcnMge1xuICAvKiogQGludGVybmFsICovXG4gIF9oZWFkZXJzTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT47XG4gIGNvbnN0cnVjdG9yKGhlYWRlcnM/OiBIZWFkZXJzIHwge1trZXk6IHN0cmluZ106IGFueX0pIHtcbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIHRoaXMuX2hlYWRlcnNNYXAgPSAoPEhlYWRlcnM+aGVhZGVycykuX2hlYWRlcnNNYXA7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5faGVhZGVyc01hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcblxuICAgIGlmIChpc0JsYW5rKGhlYWRlcnMpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gaGVhZGVycyBpbnN0YW5jZW9mIFN0cmluZ01hcFxuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChoZWFkZXJzLCAodjogYW55LCBrOiBzdHJpbmcpID0+IHtcbiAgICAgIHRoaXMuX2hlYWRlcnNNYXAuc2V0KGssIGlzTGlzdExpa2VJdGVyYWJsZSh2KSA/IHYgOiBbdl0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgSGVhZGVycyBpbnN0YW5jZSBmcm9tIHRoZSBnaXZlbiBET01TdHJpbmcgb2YgUmVzcG9uc2UgSGVhZGVyc1xuICAgKi9cbiAgc3RhdGljIGZyb21SZXNwb25zZUhlYWRlclN0cmluZyhoZWFkZXJzU3RyaW5nOiBzdHJpbmcpOiBIZWFkZXJzIHtcbiAgICByZXR1cm4gaGVhZGVyc1N0cmluZy50cmltKClcbiAgICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgICAubWFwKHZhbCA9PiB2YWwuc3BsaXQoJzonKSlcbiAgICAgICAgLm1hcCgoW2tleSwgLi4ucGFydHNdKSA9PiAoW2tleS50cmltKCksIHBhcnRzLmpvaW4oJzonKS50cmltKCldKSlcbiAgICAgICAgLnJlZHVjZSgoaGVhZGVycywgW2tleSwgdmFsdWVdKSA9PiAhaGVhZGVycy5zZXQoa2V5LCB2YWx1ZSkgJiYgaGVhZGVycywgbmV3IEhlYWRlcnMoKSk7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyBhIGhlYWRlciB0byBleGlzdGluZyBsaXN0IG9mIGhlYWRlciB2YWx1ZXMgZm9yIGEgZ2l2ZW4gaGVhZGVyIG5hbWUuXG4gICAqL1xuICBhcHBlbmQobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdmFyIG1hcE5hbWUgPSB0aGlzLl9oZWFkZXJzTWFwLmdldChuYW1lKTtcbiAgICB2YXIgbGlzdCA9IGlzTGlzdExpa2VJdGVyYWJsZShtYXBOYW1lKSA/IG1hcE5hbWUgOiBbXTtcbiAgICBsaXN0LnB1c2godmFsdWUpO1xuICAgIHRoaXMuX2hlYWRlcnNNYXAuc2V0KG5hbWUsIGxpc3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZXMgYWxsIGhlYWRlciB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBuYW1lLlxuICAgKi9cbiAgZGVsZXRlIChuYW1lOiBzdHJpbmcpOiB2b2lkIHsgdGhpcy5faGVhZGVyc01hcC5kZWxldGUobmFtZSk7IH1cblxuICBmb3JFYWNoKGZuOiAodmFsdWVzOiBzdHJpbmdbXSwgbmFtZTogc3RyaW5nLCBoZWFkZXJzOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT4pID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9oZWFkZXJzTWFwLmZvckVhY2goZm4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgZmlyc3QgaGVhZGVyIHRoYXQgbWF0Y2hlcyBnaXZlbiBuYW1lLlxuICAgKi9cbiAgZ2V0KGhlYWRlcjogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIExpc3RXcmFwcGVyLmZpcnN0KHRoaXMuX2hlYWRlcnNNYXAuZ2V0KGhlYWRlcikpOyB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciBleGlzdGVuY2Ugb2YgaGVhZGVyIGJ5IGdpdmVuIG5hbWUuXG4gICAqL1xuICBoYXMoaGVhZGVyOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2hlYWRlcnNNYXAuaGFzKGhlYWRlcik7IH1cblxuICAvKipcbiAgICogUHJvdmlkZXMgbmFtZXMgb2Ygc2V0IGhlYWRlcnNcbiAgICovXG4gIGtleXMoKTogc3RyaW5nW10geyByZXR1cm4gTWFwV3JhcHBlci5rZXlzKHRoaXMuX2hlYWRlcnNNYXApOyB9XG5cbiAgLyoqXG4gICAqIFNldHMgb3Igb3ZlcnJpZGVzIGhlYWRlciB2YWx1ZSBmb3IgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIHNldChoZWFkZXI6IHN0cmluZywgdmFsdWU6IHN0cmluZyB8IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgdmFyIGxpc3Q6IHN0cmluZ1tdID0gW107XG5cbiAgICBpZiAoaXNMaXN0TGlrZUl0ZXJhYmxlKHZhbHVlKSkge1xuICAgICAgdmFyIHB1c2hWYWx1ZSA9ICg8c3RyaW5nW10+dmFsdWUpLmpvaW4oJywnKTtcbiAgICAgIGxpc3QucHVzaChwdXNoVmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnB1c2goPHN0cmluZz52YWx1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5faGVhZGVyc01hcC5zZXQoaGVhZGVyLCBsaXN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHZhbHVlcyBvZiBhbGwgaGVhZGVycy5cbiAgICovXG4gIHZhbHVlcygpOiBzdHJpbmdbXVtdIHsgcmV0dXJuIE1hcFdyYXBwZXIudmFsdWVzKHRoaXMuX2hlYWRlcnNNYXApOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgc3RyaW5nIG9mIGFsbCBoZWFkZXJzLlxuICAgKi9cbiAgdG9KU09OKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBsZXQgc2VyaWFsaXphYmxlSGVhZGVycyA9IHt9O1xuICAgIHRoaXMuX2hlYWRlcnNNYXAuZm9yRWFjaCgodmFsdWVzOiBzdHJpbmdbXSwgbmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBsZXQgbGlzdCA9IFtdO1xuXG4gICAgICBpdGVyYXRlTGlzdExpa2UodmFsdWVzLCB2YWwgPT4gbGlzdCA9IExpc3RXcmFwcGVyLmNvbmNhdChsaXN0LCB2YWwuc3BsaXQoJywnKSkpO1xuXG4gICAgICBzZXJpYWxpemFibGVIZWFkZXJzW25hbWVdID0gbGlzdDtcbiAgICB9KTtcbiAgICByZXR1cm4gc2VyaWFsaXphYmxlSGVhZGVycztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGxpc3Qgb2YgaGVhZGVyIHZhbHVlcyBmb3IgYSBnaXZlbiBuYW1lLlxuICAgKi9cbiAgZ2V0QWxsKGhlYWRlcjogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIHZhciBoZWFkZXJzID0gdGhpcy5faGVhZGVyc01hcC5nZXQoaGVhZGVyKTtcbiAgICByZXR1cm4gaXNMaXN0TGlrZUl0ZXJhYmxlKGhlYWRlcnMpID8gaGVhZGVycyA6IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGlzIG5vdCBpbXBsZW1lbnRlZC5cbiAgICovXG4gIGVudHJpZXMoKSB7IHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdcImVudHJpZXNcIiBtZXRob2QgaXMgbm90IGltcGxlbWVudGVkIG9uIEhlYWRlcnMgY2xhc3MnKTsgfVxufVxuIl19