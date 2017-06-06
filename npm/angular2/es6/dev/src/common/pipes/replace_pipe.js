var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isBlank, isString, isNumber, isFunction, RegExpWrapper, StringWrapper } from 'angular2/src/facade/lang';
import { Injectable, Pipe } from 'angular2/core';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
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
let ReplacePipe_1;
export let ReplacePipe = ReplacePipe_1 = class ReplacePipe {
    transform(value, pattern, replacement) {
        if (isBlank(value)) {
            return value;
        }
        if (!this._supportedInput(value)) {
            throw new InvalidPipeArgumentException(ReplacePipe_1, value);
        }
        var input = value.toString();
        if (!this._supportedPattern(pattern)) {
            throw new InvalidPipeArgumentException(ReplacePipe_1, pattern);
        }
        if (!this._supportedReplacement(replacement)) {
            throw new InvalidPipeArgumentException(ReplacePipe_1, replacement);
        }
        // template fails with literal RegExp e.g /pattern/igm
        // var rgx = pattern instanceof RegExp ? pattern : RegExpWrapper.create(pattern);
        if (isFunction(replacement)) {
            var rgxPattern = isString(pattern) ? RegExpWrapper.create(pattern) : pattern;
            return StringWrapper.replaceAllMapped(input, rgxPattern, replacement);
        }
        if (pattern instanceof RegExp) {
            // use the replaceAll variant
            return StringWrapper.replaceAll(input, pattern, replacement);
        }
        return StringWrapper.replace(input, pattern, replacement);
    }
    _supportedInput(input) { return isString(input) || isNumber(input); }
    _supportedPattern(pattern) {
        return isString(pattern) || pattern instanceof RegExp;
    }
    _supportedReplacement(replacement) {
        return isString(replacement) || isFunction(replacement);
    }
};
ReplacePipe = ReplacePipe_1 = __decorate([
    Pipe({ name: 'replace' }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], ReplacePipe);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZV9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9waXBlcy9yZXBsYWNlX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFDTCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFFBQVEsRUFDUixVQUFVLEVBQ1YsYUFBYSxFQUNiLGFBQWEsRUFDZCxNQUFNLDBCQUEwQjtPQUMxQixFQUFDLFVBQVUsRUFBaUIsSUFBSSxFQUFDLE1BQU0sZUFBZTtPQUN0RCxFQUFDLDRCQUE0QixFQUFDLE1BQU0sbUNBQW1DO0FBRTlFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFJSDs7SUFDRSxTQUFTLENBQUMsS0FBVSxFQUFFLE9BQXdCLEVBQUUsV0FBOEI7UUFDNUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQixNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsTUFBTSxJQUFJLDRCQUE0QixDQUFDLGFBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRTdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxNQUFNLElBQUksNEJBQTRCLENBQUMsYUFBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0MsTUFBTSxJQUFJLDRCQUE0QixDQUFDLGFBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBQ0Qsc0RBQXNEO1FBQ3RELGlGQUFpRjtRQUVqRixFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLElBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFTLE9BQU8sQ0FBQyxHQUFXLE9BQU8sQ0FBQztZQUU3RixNQUFNLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxVQUFVLEVBQVksV0FBVyxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLE9BQU8sWUFBWSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzlCLDZCQUE2QjtZQUM3QixNQUFNLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFVLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFFRCxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQVUsT0FBTyxFQUFVLFdBQVcsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFTyxlQUFlLENBQUMsS0FBVSxJQUFhLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVuRixpQkFBaUIsQ0FBQyxPQUFZO1FBQ3BDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxZQUFZLE1BQU0sQ0FBQztJQUN4RCxDQUFDO0lBRU8scUJBQXFCLENBQUMsV0FBZ0I7UUFDNUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDMUQsQ0FBQztBQUNILENBQUM7QUE3Q0Q7SUFBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFDLENBQUM7SUFDdkIsVUFBVSxFQUFFOztlQUFBO0FBNENaIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaXNCbGFuayxcbiAgaXNTdHJpbmcsXG4gIGlzTnVtYmVyLFxuICBpc0Z1bmN0aW9uLFxuICBSZWdFeHBXcmFwcGVyLFxuICBTdHJpbmdXcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0luamVjdGFibGUsIFBpcGVUcmFuc2Zvcm0sIFBpcGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9ufSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9leGNlcHRpb24nO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgU3RyaW5nIHdpdGggc29tZSBvciBhbGwgb2YgdGhlIG1hdGNoZXMgb2YgYSBwYXR0ZXJuIHJlcGxhY2VkIGJ5XG4gKiBhIHJlcGxhY2VtZW50LlxuICpcbiAqIFRoZSBwYXR0ZXJuIHRvIGJlIG1hdGNoZWQgaXMgc3BlY2lmaWVkIGJ5IHRoZSAncGF0dGVybicgcGFyYW1ldGVyLlxuICpcbiAqIFRoZSByZXBsYWNlbWVudCB0byBiZSBzZXQgaXMgc3BlY2lmaWVkIGJ5IHRoZSAncmVwbGFjZW1lbnQnIHBhcmFtZXRlci5cbiAqXG4gKiBBbiBvcHRpb25hbCAnZmxhZ3MnIHBhcmFtZXRlciBjYW4gYmUgc2V0LlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqICAgICBleHByZXNzaW9uIHwgcmVwbGFjZTpwYXR0ZXJuOnJlcGxhY2VtZW50XG4gKlxuICogQWxsIGJlaGF2aW9yIGlzIGJhc2VkIG9uIHRoZSBleHBlY3RlZCBiZWhhdmlvciBvZiB0aGUgSmF2YVNjcmlwdCBBUElcbiAqIFN0cmluZy5wcm90b3R5cGUucmVwbGFjZSgpIGZ1bmN0aW9uLlxuICpcbiAqIFdoZXJlIHRoZSBpbnB1dCBleHByZXNzaW9uIGlzIGEgW1N0cmluZ10gb3IgW051bWJlcl0gKHRvIGJlIHRyZWF0ZWQgYXMgYSBzdHJpbmcpLFxuICogdGhlIGBwYXR0ZXJuYCBpcyBhIFtTdHJpbmddIG9yIFtSZWdFeHBdLFxuICogdGhlICdyZXBsYWNlbWVudCcgaXMgYSBbU3RyaW5nXSBvciBbRnVuY3Rpb25dLlxuICpcbiAqIC0tTm90ZS0tOiBUaGUgJ3BhdHRlcm4nIHBhcmFtZXRlciB3aWxsIGJlIGNvbnZlcnRlZCB0byBhIFJlZ0V4cCBpbnN0YW5jZS4gTWFrZSBzdXJlIHRvIGVzY2FwZSB0aGVcbiAqIHN0cmluZyBwcm9wZXJseSBpZiB5b3UgYXJlIG1hdGNoaW5nIGZvciByZWd1bGFyIGV4cHJlc3Npb24gc3BlY2lhbCBjaGFyYWN0ZXJzIGxpa2UgcGFyZW50aGVzaXMsXG4gKiBicmFja2V0cyBldGMuXG4gKi9cblxuQFBpcGUoe25hbWU6ICdyZXBsYWNlJ30pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUmVwbGFjZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIHBhdHRlcm46IHN0cmluZyB8IFJlZ0V4cCwgcmVwbGFjZW1lbnQ6IEZ1bmN0aW9uIHwgc3RyaW5nKTogYW55IHtcbiAgICBpZiAoaXNCbGFuayh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX3N1cHBvcnRlZElucHV0KHZhbHVlKSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb24oUmVwbGFjZVBpcGUsIHZhbHVlKTtcbiAgICB9XG5cbiAgICB2YXIgaW5wdXQgPSB2YWx1ZS50b1N0cmluZygpO1xuXG4gICAgaWYgKCF0aGlzLl9zdXBwb3J0ZWRQYXR0ZXJuKHBhdHRlcm4pKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbihSZXBsYWNlUGlwZSwgcGF0dGVybik7XG4gICAgfVxuICAgIGlmICghdGhpcy5fc3VwcG9ydGVkUmVwbGFjZW1lbnQocmVwbGFjZW1lbnQpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbihSZXBsYWNlUGlwZSwgcmVwbGFjZW1lbnQpO1xuICAgIH1cbiAgICAvLyB0ZW1wbGF0ZSBmYWlscyB3aXRoIGxpdGVyYWwgUmVnRXhwIGUuZyAvcGF0dGVybi9pZ21cbiAgICAvLyB2YXIgcmd4ID0gcGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cCA/IHBhdHRlcm4gOiBSZWdFeHBXcmFwcGVyLmNyZWF0ZShwYXR0ZXJuKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHJlcGxhY2VtZW50KSkge1xuICAgICAgdmFyIHJneFBhdHRlcm4gPSBpc1N0cmluZyhwYXR0ZXJuKSA/IFJlZ0V4cFdyYXBwZXIuY3JlYXRlKDxzdHJpbmc+cGF0dGVybikgOiA8UmVnRXhwPnBhdHRlcm47XG5cbiAgICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoaW5wdXQsIHJneFBhdHRlcm4sIDxGdW5jdGlvbj5yZXBsYWNlbWVudCk7XG4gICAgfVxuICAgIGlmIChwYXR0ZXJuIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAvLyB1c2UgdGhlIHJlcGxhY2VBbGwgdmFyaWFudFxuICAgICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChpbnB1dCwgcGF0dGVybiwgPHN0cmluZz5yZXBsYWNlbWVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZShpbnB1dCwgPHN0cmluZz5wYXR0ZXJuLCA8c3RyaW5nPnJlcGxhY2VtZW50KTtcbiAgfVxuXG4gIHByaXZhdGUgX3N1cHBvcnRlZElucHV0KGlucHV0OiBhbnkpOiBib29sZWFuIHsgcmV0dXJuIGlzU3RyaW5nKGlucHV0KSB8fCBpc051bWJlcihpbnB1dCk7IH1cblxuICBwcml2YXRlIF9zdXBwb3J0ZWRQYXR0ZXJuKHBhdHRlcm46IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1N0cmluZyhwYXR0ZXJuKSB8fCBwYXR0ZXJuIGluc3RhbmNlb2YgUmVnRXhwO1xuICB9XG5cbiAgcHJpdmF0ZSBfc3VwcG9ydGVkUmVwbGFjZW1lbnQocmVwbGFjZW1lbnQ6IGFueSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc1N0cmluZyhyZXBsYWNlbWVudCkgfHwgaXNGdW5jdGlvbihyZXBsYWNlbWVudCk7XG4gIH1cbn1cbiJdfQ==