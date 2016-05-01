'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var invalid_pipe_argument_exception_1 = require('./invalid_pipe_argument_exception');
/**
 * Creates a new String with some or all of the matches of a pattern replaced by
 * a replacement.
 *
 * The pattern to be matched is specified by the 'pattern' parameter.
 *
 * The replacement to be set is specified by the 'replacement' parameter.
 *
 * An optional 'flags' parameter can be set.
 *
 * ### Usage
 *
 *     expression | replace:pattern:replacement
 *
 * All behavior is based on the expected behavior of the JavaScript API
 * String.prototype.replace() function.
 *
 * Where the input expression is a [String] or [Number] (to be treated as a string),
 * the `pattern` is a [String] or [RegExp],
 * the 'replacement' is a [String] or [Function].
 *
 * --Note--: The 'pattern' parameter will be converted to a RegExp instance. Make sure to escape the
 * string properly if you are matching for regular expression special characters like parenthesis,
 * brackets etc.
 */
var ReplacePipe = (function () {
    function ReplacePipe() {
    }
    ReplacePipe.prototype.transform = function (value, pattern, replacement) {
        if (lang_1.isBlank(value)) {
            return value;
        }
        if (!this._supportedInput(value)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(ReplacePipe, value);
        }
        var input = value.toString();
        if (!this._supportedPattern(pattern)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(ReplacePipe, pattern);
        }
        if (!this._supportedReplacement(replacement)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(ReplacePipe, replacement);
        }
        // template fails with literal RegExp e.g /pattern/igm
        // var rgx = pattern instanceof RegExp ? pattern : RegExpWrapper.create(pattern);
        if (lang_1.isFunction(replacement)) {
            var rgxPattern = lang_1.isString(pattern) ? lang_1.RegExpWrapper.create(pattern) : pattern;
            return lang_1.StringWrapper.replaceAllMapped(input, rgxPattern, replacement);
        }
        if (pattern instanceof RegExp) {
            // use the replaceAll variant
            return lang_1.StringWrapper.replaceAll(input, pattern, replacement);
        }
        return lang_1.StringWrapper.replace(input, pattern, replacement);
    };
    ReplacePipe.prototype._supportedInput = function (input) { return lang_1.isString(input) || lang_1.isNumber(input); };
    ReplacePipe.prototype._supportedPattern = function (pattern) {
        return lang_1.isString(pattern) || pattern instanceof RegExp;
    };
    ReplacePipe.prototype._supportedReplacement = function (replacement) {
        return lang_1.isString(replacement) || lang_1.isFunction(replacement);
    };
    ReplacePipe = __decorate([
        core_1.Pipe({ name: 'replace' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ReplacePipe);
    return ReplacePipe;
}());
exports.ReplacePipe = ReplacePipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZV9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9waXBlcy9yZXBsYWNlX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFCQU9PLDBCQUEwQixDQUFDLENBQUE7QUFDbEMscUJBQThDLGVBQWUsQ0FBQyxDQUFBO0FBQzlELGdEQUEyQyxtQ0FBbUMsQ0FBQyxDQUFBO0FBRS9FOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFJSDtJQUFBO0lBMkNBLENBQUM7SUExQ0MsK0JBQVMsR0FBVCxVQUFVLEtBQVUsRUFBRSxPQUF3QixFQUFFLFdBQThCO1FBQzVFLEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNmLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sSUFBSSw4REFBNEIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUU3QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsTUFBTSxJQUFJLDhEQUE0QixDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sSUFBSSw4REFBNEIsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUNELHNEQUFzRDtRQUN0RCxpRkFBaUY7UUFFakYsRUFBRSxDQUFDLENBQUMsaUJBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxVQUFVLEdBQUcsZUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLG9CQUFhLENBQUMsTUFBTSxDQUFTLE9BQU8sQ0FBQyxHQUFXLE9BQU8sQ0FBQztZQUU3RixNQUFNLENBQUMsb0JBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFZLFdBQVcsQ0FBQyxDQUFDO1FBQ2xGLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxPQUFPLFlBQVksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM5Qiw2QkFBNkI7WUFDN0IsTUFBTSxDQUFDLG9CQUFhLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQVUsV0FBVyxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUVELE1BQU0sQ0FBQyxvQkFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQVUsT0FBTyxFQUFVLFdBQVcsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFTyxxQ0FBZSxHQUF2QixVQUF3QixLQUFVLElBQWEsTUFBTSxDQUFDLGVBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxlQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRW5GLHVDQUFpQixHQUF6QixVQUEwQixPQUFZO1FBQ3BDLE1BQU0sQ0FBQyxlQUFRLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxZQUFZLE1BQU0sQ0FBQztJQUN4RCxDQUFDO0lBRU8sMkNBQXFCLEdBQTdCLFVBQThCLFdBQWdCO1FBQzVDLE1BQU0sQ0FBQyxlQUFRLENBQUMsV0FBVyxDQUFDLElBQUksaUJBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBNUNIO1FBQUMsV0FBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBQyxDQUFDO1FBQ3ZCLGlCQUFVLEVBQUU7O21CQUFBO0lBNENiLGtCQUFDO0FBQUQsQ0FBQyxBQTNDRCxJQTJDQztBQTNDWSxtQkFBVyxjQTJDdkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzQmxhbmssXG4gIGlzU3RyaW5nLFxuICBpc051bWJlcixcbiAgaXNGdW5jdGlvbixcbiAgUmVnRXhwV3JhcHBlcixcbiAgU3RyaW5nV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBQaXBlVHJhbnNmb3JtLCBQaXBlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7SW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXhjZXB0aW9uJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFN0cmluZyB3aXRoIHNvbWUgb3IgYWxsIG9mIHRoZSBtYXRjaGVzIG9mIGEgcGF0dGVybiByZXBsYWNlZCBieVxuICogYSByZXBsYWNlbWVudC5cbiAqXG4gKiBUaGUgcGF0dGVybiB0byBiZSBtYXRjaGVkIGlzIHNwZWNpZmllZCBieSB0aGUgJ3BhdHRlcm4nIHBhcmFtZXRlci5cbiAqXG4gKiBUaGUgcmVwbGFjZW1lbnQgdG8gYmUgc2V0IGlzIHNwZWNpZmllZCBieSB0aGUgJ3JlcGxhY2VtZW50JyBwYXJhbWV0ZXIuXG4gKlxuICogQW4gb3B0aW9uYWwgJ2ZsYWdzJyBwYXJhbWV0ZXIgY2FuIGJlIHNldC5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiAgICAgZXhwcmVzc2lvbiB8IHJlcGxhY2U6cGF0dGVybjpyZXBsYWNlbWVudFxuICpcbiAqIEFsbCBiZWhhdmlvciBpcyBiYXNlZCBvbiB0aGUgZXhwZWN0ZWQgYmVoYXZpb3Igb2YgdGhlIEphdmFTY3JpcHQgQVBJXG4gKiBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2UoKSBmdW5jdGlvbi5cbiAqXG4gKiBXaGVyZSB0aGUgaW5wdXQgZXhwcmVzc2lvbiBpcyBhIFtTdHJpbmddIG9yIFtOdW1iZXJdICh0byBiZSB0cmVhdGVkIGFzIGEgc3RyaW5nKSxcbiAqIHRoZSBgcGF0dGVybmAgaXMgYSBbU3RyaW5nXSBvciBbUmVnRXhwXSxcbiAqIHRoZSAncmVwbGFjZW1lbnQnIGlzIGEgW1N0cmluZ10gb3IgW0Z1bmN0aW9uXS5cbiAqXG4gKiAtLU5vdGUtLTogVGhlICdwYXR0ZXJuJyBwYXJhbWV0ZXIgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gYSBSZWdFeHAgaW5zdGFuY2UuIE1ha2Ugc3VyZSB0byBlc2NhcGUgdGhlXG4gKiBzdHJpbmcgcHJvcGVybHkgaWYgeW91IGFyZSBtYXRjaGluZyBmb3IgcmVndWxhciBleHByZXNzaW9uIHNwZWNpYWwgY2hhcmFjdGVycyBsaWtlIHBhcmVudGhlc2lzLFxuICogYnJhY2tldHMgZXRjLlxuICovXG5cbkBQaXBlKHtuYW1lOiAncmVwbGFjZSd9KVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJlcGxhY2VQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBwYXR0ZXJuOiBzdHJpbmcgfCBSZWdFeHAsIHJlcGxhY2VtZW50OiBGdW5jdGlvbiB8IHN0cmluZyk6IGFueSB7XG4gICAgaWYgKGlzQmxhbmsodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLl9zdXBwb3J0ZWRJbnB1dCh2YWx1ZSkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9uKFJlcGxhY2VQaXBlLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgdmFyIGlucHV0ID0gdmFsdWUudG9TdHJpbmcoKTtcblxuICAgIGlmICghdGhpcy5fc3VwcG9ydGVkUGF0dGVybihwYXR0ZXJuKSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb24oUmVwbGFjZVBpcGUsIHBhdHRlcm4pO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX3N1cHBvcnRlZFJlcGxhY2VtZW50KHJlcGxhY2VtZW50KSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb24oUmVwbGFjZVBpcGUsIHJlcGxhY2VtZW50KTtcbiAgICB9XG4gICAgLy8gdGVtcGxhdGUgZmFpbHMgd2l0aCBsaXRlcmFsIFJlZ0V4cCBlLmcgL3BhdHRlcm4vaWdtXG4gICAgLy8gdmFyIHJneCA9IHBhdHRlcm4gaW5zdGFuY2VvZiBSZWdFeHAgPyBwYXR0ZXJuIDogUmVnRXhwV3JhcHBlci5jcmVhdGUocGF0dGVybik7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihyZXBsYWNlbWVudCkpIHtcbiAgICAgIHZhciByZ3hQYXR0ZXJuID0gaXNTdHJpbmcocGF0dGVybikgPyBSZWdFeHBXcmFwcGVyLmNyZWF0ZSg8c3RyaW5nPnBhdHRlcm4pIDogPFJlZ0V4cD5wYXR0ZXJuO1xuXG4gICAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsTWFwcGVkKGlucHV0LCByZ3hQYXR0ZXJuLCA8RnVuY3Rpb24+cmVwbGFjZW1lbnQpO1xuICAgIH1cbiAgICBpZiAocGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgLy8gdXNlIHRoZSByZXBsYWNlQWxsIHZhcmlhbnRcbiAgICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoaW5wdXQsIHBhdHRlcm4sIDxzdHJpbmc+cmVwbGFjZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2UoaW5wdXQsIDxzdHJpbmc+cGF0dGVybiwgPHN0cmluZz5yZXBsYWNlbWVudCk7XG4gIH1cblxuICBwcml2YXRlIF9zdXBwb3J0ZWRJbnB1dChpbnB1dDogYW55KTogYm9vbGVhbiB7IHJldHVybiBpc1N0cmluZyhpbnB1dCkgfHwgaXNOdW1iZXIoaW5wdXQpOyB9XG5cbiAgcHJpdmF0ZSBfc3VwcG9ydGVkUGF0dGVybihwYXR0ZXJuOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNTdHJpbmcocGF0dGVybikgfHwgcGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cDtcbiAgfVxuXG4gIHByaXZhdGUgX3N1cHBvcnRlZFJlcGxhY2VtZW50KHJlcGxhY2VtZW50OiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNTdHJpbmcocmVwbGFjZW1lbnQpIHx8IGlzRnVuY3Rpb24ocmVwbGFjZW1lbnQpO1xuICB9XG59XG4iXX0=