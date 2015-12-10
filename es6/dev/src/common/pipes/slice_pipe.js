var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isBlank, isString, isArray, StringWrapper } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import { Injectable, Pipe } from 'angular2/core';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
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
export let SlicePipe = class {
    transform(value, args = null) {
        if (isBlank(args) || args.length == 0) {
            throw new BaseException('Slice pipe requires one argument');
        }
        if (!this.supports(value)) {
            throw new InvalidPipeArgumentException(SlicePipe, value);
        }
        if (isBlank(value))
            return value;
        var start = args[0];
        var end = args.length > 1 ? args[1] : null;
        if (isString(value)) {
            return StringWrapper.slice(value, start, end);
        }
        return ListWrapper.slice(value, start, end);
    }
    supports(obj) { return isString(obj) || isArray(obj); }
};
SlicePipe = __decorate([
    Pipe({ name: 'slice', pure: false }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], SlicePipe);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpY2VfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vcGlwZXMvc2xpY2VfcGlwZS50cyJdLCJuYW1lcyI6WyJTbGljZVBpcGUiLCJTbGljZVBpcGUudHJhbnNmb3JtIiwiU2xpY2VQaXBlLnN1cHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFRLE1BQU0sMEJBQTBCO09BQ2xGLEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JELEVBQUMsV0FBVyxFQUFDLE1BQU0sZ0NBQWdDO09BQ25ELEVBQUMsVUFBVSxFQUErQixJQUFJLEVBQUMsTUFBTSxlQUFlO09BQ3BFLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxtQ0FBbUM7QUFFOUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0RHO0FBRUg7SUFHRUEsU0FBU0EsQ0FBQ0EsS0FBVUEsRUFBRUEsSUFBSUEsR0FBVUEsSUFBSUE7UUFDdENDLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RDQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUFDQSxrQ0FBa0NBLENBQUNBLENBQUNBO1FBQzlEQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxQkEsTUFBTUEsSUFBSUEsNEJBQTRCQSxDQUFDQSxTQUFTQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUMzREEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDakNBLElBQUlBLEtBQUtBLEdBQVdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzVCQSxJQUFJQSxHQUFHQSxHQUFXQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNuREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1FBQ2hEQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUM5Q0EsQ0FBQ0E7SUFFT0QsUUFBUUEsQ0FBQ0EsR0FBUUEsSUFBYUUsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDL0VGLENBQUNBO0FBcEJEO0lBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUM7SUFDbEMsVUFBVSxFQUFFOztjQW1CWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc0JsYW5rLCBpc1N0cmluZywgaXNBcnJheSwgU3RyaW5nV3JhcHBlciwgQ09OU1R9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBQaXBlVHJhbnNmb3JtLCBXcmFwcGVkVmFsdWUsIFBpcGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9ufSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9leGNlcHRpb24nO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgTGlzdCBvciBTdHJpbmcgY29udGFpbmluZyBvbmx5IGEgc3Vic2V0IChzbGljZSkgb2YgdGhlXG4gKiBlbGVtZW50cy5cbiAqXG4gKiBUaGUgc3RhcnRpbmcgaW5kZXggb2YgdGhlIHN1YnNldCB0byByZXR1cm4gaXMgc3BlY2lmaWVkIGJ5IHRoZSBgc3RhcnRgIHBhcmFtZXRlci5cbiAqXG4gKiBUaGUgZW5kaW5nIGluZGV4IG9mIHRoZSBzdWJzZXQgdG8gcmV0dXJuIGlzIHNwZWNpZmllZCBieSB0aGUgb3B0aW9uYWwgYGVuZGAgcGFyYW1ldGVyLlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqICAgICBleHByZXNzaW9uIHwgc2xpY2U6c3RhcnRbOmVuZF1cbiAqXG4gKiBBbGwgYmVoYXZpb3IgaXMgYmFzZWQgb24gdGhlIGV4cGVjdGVkIGJlaGF2aW9yIG9mIHRoZSBKYXZhU2NyaXB0IEFQSVxuICogQXJyYXkucHJvdG90eXBlLnNsaWNlKCkgYW5kIFN0cmluZy5wcm90b3R5cGUuc2xpY2UoKVxuICpcbiAqIFdoZXJlIHRoZSBpbnB1dCBleHByZXNzaW9uIGlzIGEgW0xpc3RdIG9yIFtTdHJpbmddLCBhbmQgYHN0YXJ0YCBpczpcbiAqXG4gKiAtICoqYSBwb3NpdGl2ZSBpbnRlZ2VyKio6IHJldHVybiB0aGUgaXRlbSBhdCBfc3RhcnRfIGluZGV4IGFuZCBhbGwgaXRlbXMgYWZ0ZXJcbiAqIGluIHRoZSBsaXN0IG9yIHN0cmluZyBleHByZXNzaW9uLlxuICogLSAqKmEgbmVnYXRpdmUgaW50ZWdlcioqOiByZXR1cm4gdGhlIGl0ZW0gYXQgX3N0YXJ0XyBpbmRleCBmcm9tIHRoZSBlbmQgYW5kIGFsbCBpdGVtcyBhZnRlclxuICogaW4gdGhlIGxpc3Qgb3Igc3RyaW5nIGV4cHJlc3Npb24uXG4gKiAtICoqYHxzdGFydHxgIGdyZWF0ZXIgdGhhbiB0aGUgc2l6ZSBvZiB0aGUgZXhwcmVzc2lvbioqOiByZXR1cm4gYW4gZW1wdHkgbGlzdCBvciBzdHJpbmcuXG4gKiAtICoqYHxzdGFydHxgIG5lZ2F0aXZlIGdyZWF0ZXIgdGhhbiB0aGUgc2l6ZSBvZiB0aGUgZXhwcmVzc2lvbioqOiByZXR1cm4gZW50aXJlIGxpc3Qgb3JcbiAqIHN0cmluZyBleHByZXNzaW9uLlxuICpcbiAqIGFuZCB3aGVyZSBgZW5kYCBpczpcbiAqXG4gKiAtICoqb21pdHRlZCoqOiByZXR1cm4gYWxsIGl0ZW1zIHVudGlsIHRoZSBlbmQgb2YgdGhlIGlucHV0XG4gKiAtICoqYSBwb3NpdGl2ZSBpbnRlZ2VyKio6IHJldHVybiBhbGwgaXRlbXMgYmVmb3JlIF9lbmRfIGluZGV4IG9mIHRoZSBsaXN0IG9yIHN0cmluZ1xuICogZXhwcmVzc2lvbi5cbiAqIC0gKiphIG5lZ2F0aXZlIGludGVnZXIqKjogcmV0dXJuIGFsbCBpdGVtcyBiZWZvcmUgX2VuZF8gaW5kZXggZnJvbSB0aGUgZW5kIG9mIHRoZSBsaXN0XG4gKiBvciBzdHJpbmcgZXhwcmVzc2lvbi5cbiAqXG4gKiBXaGVuIG9wZXJhdGluZyBvbiBhIFtMaXN0XSwgdGhlIHJldHVybmVkIGxpc3QgaXMgYWx3YXlzIGEgY29weSBldmVuIHdoZW4gYWxsXG4gKiB0aGUgZWxlbWVudHMgYXJlIGJlaW5nIHJldHVybmVkLlxuICpcbiAqICMjIExpc3QgRXhhbXBsZVxuICpcbiAqIFRoaXMgYG5nLWZvcmAgZXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9waXBlcy90cy9zbGljZV9waXBlL3NsaWNlX3BpcGVfZXhhbXBsZS50cyByZWdpb249J1NsaWNlUGlwZV9saXN0J31cbiAqXG4gKiBwcm9kdWNlcyB0aGUgZm9sbG93aW5nOlxuICpcbiAqICAgICA8bGk+YjwvbGk+XG4gKiAgICAgPGxpPmM8L2xpPlxuICpcbiAqICMjIFN0cmluZyBFeGFtcGxlc1xuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3BpcGVzL3RzL3NsaWNlX3BpcGUvc2xpY2VfcGlwZV9leGFtcGxlLnRzIHJlZ2lvbj0nU2xpY2VQaXBlX3N0cmluZyd9XG4gKi9cblxuQFBpcGUoe25hbWU6ICdzbGljZScsIHB1cmU6IGZhbHNlfSlcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTbGljZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGFyZ3M6IGFueVtdID0gbnVsbCk6IGFueSB7XG4gICAgaWYgKGlzQmxhbmsoYXJncykgfHwgYXJncy5sZW5ndGggPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ1NsaWNlIHBpcGUgcmVxdWlyZXMgb25lIGFyZ3VtZW50Jyk7XG4gICAgfVxuICAgIGlmICghdGhpcy5zdXBwb3J0cyh2YWx1ZSkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9uKFNsaWNlUGlwZSwgdmFsdWUpO1xuICAgIH1cbiAgICBpZiAoaXNCbGFuayh2YWx1ZSkpIHJldHVybiB2YWx1ZTtcbiAgICB2YXIgc3RhcnQ6IG51bWJlciA9IGFyZ3NbMF07XG4gICAgdmFyIGVuZDogbnVtYmVyID0gYXJncy5sZW5ndGggPiAxID8gYXJnc1sxXSA6IG51bGw7XG4gICAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIuc2xpY2UodmFsdWUsIHN0YXJ0LCBlbmQpO1xuICAgIH1cbiAgICByZXR1cm4gTGlzdFdyYXBwZXIuc2xpY2UodmFsdWUsIHN0YXJ0LCBlbmQpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdXBwb3J0cyhvYmo6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gaXNTdHJpbmcob2JqKSB8fCBpc0FycmF5KG9iaik7IH1cbn1cbiJdfQ==