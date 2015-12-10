'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var core_1 = require('angular2/core');
var invalid_pipe_argument_exception_1 = require('./invalid_pipe_argument_exception');
/**
 * Creates a new List or String containing only a subset (slice) of the
 * elements.
 *
 * The starting index of the subset to return is specified by the `start` parameter.
 *
 * The ending index of the subset to return is specified by the optional `end` parameter.
 *
 * ### Usage
 *
 *     expression | slice:start[:end]
 *
 * All behavior is based on the expected behavior of the JavaScript API
 * Array.prototype.slice() and String.prototype.slice()
 *
 * Where the input expression is a [List] or [String], and `start` is:
 *
 * - **a positive integer**: return the item at _start_ index and all items after
 * in the list or string expression.
 * - **a negative integer**: return the item at _start_ index from the end and all items after
 * in the list or string expression.
 * - **`|start|` greater than the size of the expression**: return an empty list or string.
 * - **`|start|` negative greater than the size of the expression**: return entire list or
 * string expression.
 *
 * and where `end` is:
 *
 * - **omitted**: return all items until the end of the input
 * - **a positive integer**: return all items before _end_ index of the list or string
 * expression.
 * - **a negative integer**: return all items before _end_ index from the end of the list
 * or string expression.
 *
 * When operating on a [List], the returned list is always a copy even when all
 * the elements are being returned.
 *
 * ## List Example
 *
 * This `ng-for` example:
 *
 * {@example core/pipes/ts/slice_pipe/slice_pipe_example.ts region='SlicePipe_list'}
 *
 * produces the following:
 *
 *     <li>b</li>
 *     <li>c</li>
 *
 * ## String Examples
 *
 * {@example core/pipes/ts/slice_pipe/slice_pipe_example.ts region='SlicePipe_string'}
 */
var SlicePipe = (function () {
    function SlicePipe() {
    }
    SlicePipe.prototype.transform = function (value, args) {
        if (args === void 0) { args = null; }
        if (lang_1.isBlank(args) || args.length == 0) {
            throw new exceptions_1.BaseException('Slice pipe requires one argument');
        }
        if (!this.supports(value)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(SlicePipe, value);
        }
        if (lang_1.isBlank(value))
            return value;
        var start = args[0];
        var end = args.length > 1 ? args[1] : null;
        if (lang_1.isString(value)) {
            return lang_1.StringWrapper.slice(value, start, end);
        }
        return collection_1.ListWrapper.slice(value, start, end);
    };
    SlicePipe.prototype.supports = function (obj) { return lang_1.isString(obj) || lang_1.isArray(obj); };
    SlicePipe = __decorate([
        core_1.Pipe({ name: 'slice', pure: false }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], SlicePipe);
    return SlicePipe;
})();
exports.SlicePipe = SlicePipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpY2VfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vcGlwZXMvc2xpY2VfcGlwZS50cyJdLCJuYW1lcyI6WyJTbGljZVBpcGUiLCJTbGljZVBpcGUuY29uc3RydWN0b3IiLCJTbGljZVBpcGUudHJhbnNmb3JtIiwiU2xpY2VQaXBlLnN1cHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxxQkFBK0QsMEJBQTBCLENBQUMsQ0FBQTtBQUMxRiwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCwyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUMzRCxxQkFBNEQsZUFBZSxDQUFDLENBQUE7QUFDNUUsZ0RBQTJDLG1DQUFtQyxDQUFDLENBQUE7QUFFL0U7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0RHO0FBRUg7SUFBQUE7SUFvQkFDLENBQUNBO0lBakJDRCw2QkFBU0EsR0FBVEEsVUFBVUEsS0FBVUEsRUFBRUEsSUFBa0JBO1FBQWxCRSxvQkFBa0JBLEdBQWxCQSxXQUFrQkE7UUFDdENBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RDQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0Esa0NBQWtDQSxDQUFDQSxDQUFDQTtRQUM5REEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMUJBLE1BQU1BLElBQUlBLDhEQUE0QkEsQ0FBQ0EsU0FBU0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2pDQSxJQUFJQSxLQUFLQSxHQUFXQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM1QkEsSUFBSUEsR0FBR0EsR0FBV0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDbkRBLEVBQUVBLENBQUNBLENBQUNBLGVBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BCQSxNQUFNQSxDQUFDQSxvQkFBYUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDaERBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLHdCQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUM5Q0EsQ0FBQ0E7SUFFT0YsNEJBQVFBLEdBQWhCQSxVQUFpQkEsR0FBUUEsSUFBYUcsTUFBTUEsQ0FBQ0EsZUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsY0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFuQi9FSDtRQUFDQSxXQUFJQSxDQUFDQSxFQUFDQSxJQUFJQSxFQUFFQSxPQUFPQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFDQSxDQUFDQTtRQUNsQ0EsaUJBQVVBLEVBQUVBOztrQkFtQlpBO0lBQURBLGdCQUFDQTtBQUFEQSxDQUFDQSxBQXBCRCxJQW9CQztBQWxCWSxpQkFBUyxZQWtCckIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNCbGFuaywgaXNTdHJpbmcsIGlzQXJyYXksIFN0cmluZ1dyYXBwZXIsIENPTlNUfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgUGlwZVRyYW5zZm9ybSwgV3JhcHBlZFZhbHVlLCBQaXBlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7SW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXhjZXB0aW9uJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IExpc3Qgb3IgU3RyaW5nIGNvbnRhaW5pbmcgb25seSBhIHN1YnNldCAoc2xpY2UpIG9mIHRoZVxuICogZWxlbWVudHMuXG4gKlxuICogVGhlIHN0YXJ0aW5nIGluZGV4IG9mIHRoZSBzdWJzZXQgdG8gcmV0dXJuIGlzIHNwZWNpZmllZCBieSB0aGUgYHN0YXJ0YCBwYXJhbWV0ZXIuXG4gKlxuICogVGhlIGVuZGluZyBpbmRleCBvZiB0aGUgc3Vic2V0IHRvIHJldHVybiBpcyBzcGVjaWZpZWQgYnkgdGhlIG9wdGlvbmFsIGBlbmRgIHBhcmFtZXRlci5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiAgICAgZXhwcmVzc2lvbiB8IHNsaWNlOnN0YXJ0WzplbmRdXG4gKlxuICogQWxsIGJlaGF2aW9yIGlzIGJhc2VkIG9uIHRoZSBleHBlY3RlZCBiZWhhdmlvciBvZiB0aGUgSmF2YVNjcmlwdCBBUElcbiAqIEFycmF5LnByb3RvdHlwZS5zbGljZSgpIGFuZCBTdHJpbmcucHJvdG90eXBlLnNsaWNlKClcbiAqXG4gKiBXaGVyZSB0aGUgaW5wdXQgZXhwcmVzc2lvbiBpcyBhIFtMaXN0XSBvciBbU3RyaW5nXSwgYW5kIGBzdGFydGAgaXM6XG4gKlxuICogLSAqKmEgcG9zaXRpdmUgaW50ZWdlcioqOiByZXR1cm4gdGhlIGl0ZW0gYXQgX3N0YXJ0XyBpbmRleCBhbmQgYWxsIGl0ZW1zIGFmdGVyXG4gKiBpbiB0aGUgbGlzdCBvciBzdHJpbmcgZXhwcmVzc2lvbi5cbiAqIC0gKiphIG5lZ2F0aXZlIGludGVnZXIqKjogcmV0dXJuIHRoZSBpdGVtIGF0IF9zdGFydF8gaW5kZXggZnJvbSB0aGUgZW5kIGFuZCBhbGwgaXRlbXMgYWZ0ZXJcbiAqIGluIHRoZSBsaXN0IG9yIHN0cmluZyBleHByZXNzaW9uLlxuICogLSAqKmB8c3RhcnR8YCBncmVhdGVyIHRoYW4gdGhlIHNpemUgb2YgdGhlIGV4cHJlc3Npb24qKjogcmV0dXJuIGFuIGVtcHR5IGxpc3Qgb3Igc3RyaW5nLlxuICogLSAqKmB8c3RhcnR8YCBuZWdhdGl2ZSBncmVhdGVyIHRoYW4gdGhlIHNpemUgb2YgdGhlIGV4cHJlc3Npb24qKjogcmV0dXJuIGVudGlyZSBsaXN0IG9yXG4gKiBzdHJpbmcgZXhwcmVzc2lvbi5cbiAqXG4gKiBhbmQgd2hlcmUgYGVuZGAgaXM6XG4gKlxuICogLSAqKm9taXR0ZWQqKjogcmV0dXJuIGFsbCBpdGVtcyB1bnRpbCB0aGUgZW5kIG9mIHRoZSBpbnB1dFxuICogLSAqKmEgcG9zaXRpdmUgaW50ZWdlcioqOiByZXR1cm4gYWxsIGl0ZW1zIGJlZm9yZSBfZW5kXyBpbmRleCBvZiB0aGUgbGlzdCBvciBzdHJpbmdcbiAqIGV4cHJlc3Npb24uXG4gKiAtICoqYSBuZWdhdGl2ZSBpbnRlZ2VyKio6IHJldHVybiBhbGwgaXRlbXMgYmVmb3JlIF9lbmRfIGluZGV4IGZyb20gdGhlIGVuZCBvZiB0aGUgbGlzdFxuICogb3Igc3RyaW5nIGV4cHJlc3Npb24uXG4gKlxuICogV2hlbiBvcGVyYXRpbmcgb24gYSBbTGlzdF0sIHRoZSByZXR1cm5lZCBsaXN0IGlzIGFsd2F5cyBhIGNvcHkgZXZlbiB3aGVuIGFsbFxuICogdGhlIGVsZW1lbnRzIGFyZSBiZWluZyByZXR1cm5lZC5cbiAqXG4gKiAjIyBMaXN0IEV4YW1wbGVcbiAqXG4gKiBUaGlzIGBuZy1mb3JgIGV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIGNvcmUvcGlwZXMvdHMvc2xpY2VfcGlwZS9zbGljZV9waXBlX2V4YW1wbGUudHMgcmVnaW9uPSdTbGljZVBpcGVfbGlzdCd9XG4gKlxuICogcHJvZHVjZXMgdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAgICAgPGxpPmI8L2xpPlxuICogICAgIDxsaT5jPC9saT5cbiAqXG4gKiAjIyBTdHJpbmcgRXhhbXBsZXNcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9waXBlcy90cy9zbGljZV9waXBlL3NsaWNlX3BpcGVfZXhhbXBsZS50cyByZWdpb249J1NsaWNlUGlwZV9zdHJpbmcnfVxuICovXG5cbkBQaXBlKHtuYW1lOiAnc2xpY2UnLCBwdXJlOiBmYWxzZX0pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU2xpY2VQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBhcmdzOiBhbnlbXSA9IG51bGwpOiBhbnkge1xuICAgIGlmIChpc0JsYW5rKGFyZ3MpIHx8IGFyZ3MubGVuZ3RoID09IDApIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdTbGljZSBwaXBlIHJlcXVpcmVzIG9uZSBhcmd1bWVudCcpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuc3VwcG9ydHModmFsdWUpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbihTbGljZVBpcGUsIHZhbHVlKTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsodmFsdWUpKSByZXR1cm4gdmFsdWU7XG4gICAgdmFyIHN0YXJ0OiBudW1iZXIgPSBhcmdzWzBdO1xuICAgIHZhciBlbmQ6IG51bWJlciA9IGFyZ3MubGVuZ3RoID4gMSA/IGFyZ3NbMV0gOiBudWxsO1xuICAgIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnNsaWNlKHZhbHVlLCBzdGFydCwgZW5kKTtcbiAgICB9XG4gICAgcmV0dXJuIExpc3RXcmFwcGVyLnNsaWNlKHZhbHVlLCBzdGFydCwgZW5kKTtcbiAgfVxuXG4gIHByaXZhdGUgc3VwcG9ydHMob2JqOiBhbnkpOiBib29sZWFuIHsgcmV0dXJuIGlzU3RyaW5nKG9iaikgfHwgaXNBcnJheShvYmopOyB9XG59XG4iXX0=