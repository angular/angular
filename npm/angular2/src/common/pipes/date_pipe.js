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
var intl_1 = require('angular2/src/facade/intl');
var core_1 = require('angular2/core');
var collection_1 = require('angular2/src/facade/collection');
var invalid_pipe_argument_exception_1 = require('./invalid_pipe_argument_exception');
// TODO: move to a global configurable location along with other i18n components.
var defaultLocale = 'en-US';
/**
 * Formats a date value to a string based on the requested format.
 *
 * WARNINGS:
 * - this pipe is marked as pure hence it will not be re-evaluated when the input is mutated.
 *   Instead users should treat the date as an immutable object and change the reference when the
 *   pipe needs to re-run (this is to avoid reformatting the date on every change detection run
 *   which would be an expensive operation).
 * - this pipe uses the Internationalization API. Therefore it is only reliable in Chrome and Opera
 *   browsers.
 *
 * ## Usage
 *
 *     expression | date[:format]
 *
 * where `expression` is a date object or a number (milliseconds since UTC epoch) and
 * `format` indicates which date/time components to include:
 *
 *  | Component | Symbol | Short Form   | Long Form         | Numeric   | 2-digit   |
 *  |-----------|:------:|--------------|-------------------|-----------|-----------|
 *  | era       |   G    | G (AD)       | GGGG (Anno Domini)| -         | -         |
 *  | year      |   y    | -            | -                 | y (2015)  | yy (15)   |
 *  | month     |   M    | MMM (Sep)    | MMMM (September)  | M (9)     | MM (09)   |
 *  | day       |   d    | -            | -                 | d (3)     | dd (03)   |
 *  | weekday   |   E    | EEE (Sun)    | EEEE (Sunday)     | -         | -         |
 *  | hour      |   j    | -            | -                 | j (13)    | jj (13)   |
 *  | hour12    |   h    | -            | -                 | h (1 PM)  | hh (01 PM)|
 *  | hour24    |   H    | -            | -                 | H (13)    | HH (13)   |
 *  | minute    |   m    | -            | -                 | m (5)     | mm (05)   |
 *  | second    |   s    | -            | -                 | s (9)     | ss (09)   |
 *  | timezone  |   z    | -            | z (Pacific Standard Time)| -  | -         |
 *  | timezone  |   Z    | Z (GMT-8:00) | -                 | -         | -         |
 *
 * In javascript, only the components specified will be respected (not the ordering,
 * punctuations, ...) and details of the formatting will be dependent on the locale.
 * On the other hand in Dart version, you can also include quoted text as well as some extra
 * date/time components such as quarter. For more information see:
 * https://api.dartlang.org/apidocs/channels/stable/dartdoc-viewer/intl/intl.DateFormat.
 *
 * `format` can also be one of the following predefined formats:
 *
 *  - `'medium'`: equivalent to `'yMMMdjms'` (e.g. Sep 3, 2010, 12:05:08 PM for en-US)
 *  - `'short'`: equivalent to `'yMdjm'` (e.g. 9/3/2010, 12:05 PM for en-US)
 *  - `'fullDate'`: equivalent to `'yMMMMEEEEd'` (e.g. Friday, September 3, 2010 for en-US)
 *  - `'longDate'`: equivalent to `'yMMMMd'` (e.g. September 3, 2010)
 *  - `'mediumDate'`: equivalent to `'yMMMd'` (e.g. Sep 3, 2010 for en-US)
 *  - `'shortDate'`: equivalent to `'yMd'` (e.g. 9/3/2010 for en-US)
 *  - `'mediumTime'`: equivalent to `'jms'` (e.g. 12:05:08 PM for en-US)
 *  - `'shortTime'`: equivalent to `'jm'` (e.g. 12:05 PM for en-US)
 *
 * Timezone of the formatted text will be the local system timezone of the end-users machine.
 *
 * ### Examples
 *
 * Assuming `dateObj` is (year: 2015, month: 6, day: 15, hour: 21, minute: 43, second: 11)
 * in the _local_ time and locale is 'en-US':
 *
 * ```
 *     {{ dateObj | date }}               // output is 'Jun 15, 2015'
 *     {{ dateObj | date:'medium' }}      // output is 'Jun 15, 2015, 9:43:11 PM'
 *     {{ dateObj | date:'shortTime' }}   // output is '9:43 PM'
 *     {{ dateObj | date:'mmss' }}        // output is '43:11'
 * ```
 *
 * {@example core/pipes/ts/date_pipe/date_pipe_example.ts region='DatePipe'}
 */
var DatePipe = (function () {
    function DatePipe() {
    }
    DatePipe.prototype.transform = function (value, pattern) {
        if (pattern === void 0) { pattern = 'mediumDate'; }
        if (lang_1.isBlank(value))
            return null;
        if (!this.supports(value)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(DatePipe, value);
        }
        if (lang_1.isNumber(value)) {
            value = lang_1.DateWrapper.fromMillis(value);
        }
        if (collection_1.StringMapWrapper.contains(DatePipe._ALIASES, pattern)) {
            pattern = collection_1.StringMapWrapper.get(DatePipe._ALIASES, pattern);
        }
        return intl_1.DateFormatter.format(value, defaultLocale, pattern);
    };
    DatePipe.prototype.supports = function (obj) { return lang_1.isDate(obj) || lang_1.isNumber(obj); };
    /** @internal */
    DatePipe._ALIASES = {
        'medium': 'yMMMdjms',
        'short': 'yMdjm',
        'fullDate': 'yMMMMEEEEd',
        'longDate': 'yMMMMd',
        'mediumDate': 'yMMMd',
        'shortDate': 'yMd',
        'mediumTime': 'jms',
        'shortTime': 'jm'
    };
    DatePipe = __decorate([
        core_1.Pipe({ name: 'date', pure: true }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DatePipe);
    return DatePipe;
}());
exports.DatePipe = DatePipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZV9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2NvbW1vbi9waXBlcy9kYXRlX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFCQVFPLDBCQUEwQixDQUFDLENBQUE7QUFDbEMscUJBQTRCLDBCQUEwQixDQUFDLENBQUE7QUFDdkQscUJBQTRELGVBQWUsQ0FBQyxDQUFBO0FBQzVFLDJCQUE0QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTdFLGdEQUEyQyxtQ0FBbUMsQ0FBQyxDQUFBO0FBRy9FLGlGQUFpRjtBQUNqRixJQUFJLGFBQWEsR0FBVyxPQUFPLENBQUM7QUFFcEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUVHO0FBR0g7SUFBQTtJQStCQSxDQUFDO0lBakJDLDRCQUFTLEdBQVQsVUFBVSxLQUFVLEVBQUUsT0FBOEI7UUFBOUIsdUJBQThCLEdBQTlCLHNCQUE4QjtRQUNsRCxFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBRWhDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsTUFBTSxJQUFJLDhEQUE0QixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsZUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixLQUFLLEdBQUcsa0JBQVcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLDZCQUFnQixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxRCxPQUFPLEdBQVcsNkJBQWdCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckUsQ0FBQztRQUNELE1BQU0sQ0FBQyxvQkFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCwyQkFBUSxHQUFSLFVBQVMsR0FBUSxJQUFhLE1BQU0sQ0FBQyxhQUFNLENBQUMsR0FBRyxDQUFDLElBQUksZUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQTdCcEUsZ0JBQWdCO0lBQ1QsaUJBQVEsR0FBNEI7UUFDekMsUUFBUSxFQUFFLFVBQVU7UUFDcEIsT0FBTyxFQUFFLE9BQU87UUFDaEIsVUFBVSxFQUFFLFlBQVk7UUFDeEIsVUFBVSxFQUFFLFFBQVE7UUFDcEIsWUFBWSxFQUFFLE9BQU87UUFDckIsV0FBVyxFQUFFLEtBQUs7UUFDbEIsWUFBWSxFQUFFLEtBQUs7UUFDbkIsV0FBVyxFQUFFLElBQUk7S0FDbEIsQ0FBQztJQWJKO1FBQUMsV0FBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUM7UUFDaEMsaUJBQVUsRUFBRTs7Z0JBQUE7SUFnQ2IsZUFBQztBQUFELENBQUMsQUEvQkQsSUErQkM7QUEvQlksZ0JBQVEsV0ErQnBCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBpc0RhdGUsXG4gIGlzTnVtYmVyLFxuICBpc1ByZXNlbnQsXG4gIERhdGUsXG4gIERhdGVXcmFwcGVyLFxuICBpc0JsYW5rLFxuICBGdW5jdGlvbldyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7RGF0ZUZvcm1hdHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9pbnRsJztcbmltcG9ydCB7UGlwZVRyYW5zZm9ybSwgV3JhcHBlZFZhbHVlLCBQaXBlLCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7SW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXhjZXB0aW9uJztcblxuXG4vLyBUT0RPOiBtb3ZlIHRvIGEgZ2xvYmFsIGNvbmZpZ3VyYWJsZSBsb2NhdGlvbiBhbG9uZyB3aXRoIG90aGVyIGkxOG4gY29tcG9uZW50cy5cbnZhciBkZWZhdWx0TG9jYWxlOiBzdHJpbmcgPSAnZW4tVVMnO1xuXG4vKipcbiAqIEZvcm1hdHMgYSBkYXRlIHZhbHVlIHRvIGEgc3RyaW5nIGJhc2VkIG9uIHRoZSByZXF1ZXN0ZWQgZm9ybWF0LlxuICpcbiAqIFdBUk5JTkdTOlxuICogLSB0aGlzIHBpcGUgaXMgbWFya2VkIGFzIHB1cmUgaGVuY2UgaXQgd2lsbCBub3QgYmUgcmUtZXZhbHVhdGVkIHdoZW4gdGhlIGlucHV0IGlzIG11dGF0ZWQuXG4gKiAgIEluc3RlYWQgdXNlcnMgc2hvdWxkIHRyZWF0IHRoZSBkYXRlIGFzIGFuIGltbXV0YWJsZSBvYmplY3QgYW5kIGNoYW5nZSB0aGUgcmVmZXJlbmNlIHdoZW4gdGhlXG4gKiAgIHBpcGUgbmVlZHMgdG8gcmUtcnVuICh0aGlzIGlzIHRvIGF2b2lkIHJlZm9ybWF0dGluZyB0aGUgZGF0ZSBvbiBldmVyeSBjaGFuZ2UgZGV0ZWN0aW9uIHJ1blxuICogICB3aGljaCB3b3VsZCBiZSBhbiBleHBlbnNpdmUgb3BlcmF0aW9uKS5cbiAqIC0gdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSS4gVGhlcmVmb3JlIGl0IGlzIG9ubHkgcmVsaWFibGUgaW4gQ2hyb21lIGFuZCBPcGVyYVxuICogICBicm93c2Vycy5cbiAqXG4gKiAjIyBVc2FnZVxuICpcbiAqICAgICBleHByZXNzaW9uIHwgZGF0ZVs6Zm9ybWF0XVxuICpcbiAqIHdoZXJlIGBleHByZXNzaW9uYCBpcyBhIGRhdGUgb2JqZWN0IG9yIGEgbnVtYmVyIChtaWxsaXNlY29uZHMgc2luY2UgVVRDIGVwb2NoKSBhbmRcbiAqIGBmb3JtYXRgIGluZGljYXRlcyB3aGljaCBkYXRlL3RpbWUgY29tcG9uZW50cyB0byBpbmNsdWRlOlxuICpcbiAqICB8IENvbXBvbmVudCB8IFN5bWJvbCB8IFNob3J0IEZvcm0gICB8IExvbmcgRm9ybSAgICAgICAgIHwgTnVtZXJpYyAgIHwgMi1kaWdpdCAgIHxcbiAqICB8LS0tLS0tLS0tLS18Oi0tLS0tLTp8LS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLXwtLS0tLS0tLS0tLXxcbiAqICB8IGVyYSAgICAgICB8ICAgRyAgICB8IEcgKEFEKSAgICAgICB8IEdHR0cgKEFubm8gRG9taW5pKXwgLSAgICAgICAgIHwgLSAgICAgICAgIHxcbiAqICB8IHllYXIgICAgICB8ICAgeSAgICB8IC0gICAgICAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgeSAoMjAxNSkgIHwgeXkgKDE1KSAgIHxcbiAqICB8IG1vbnRoICAgICB8ICAgTSAgICB8IE1NTSAoU2VwKSAgICB8IE1NTU0gKFNlcHRlbWJlcikgIHwgTSAoOSkgICAgIHwgTU0gKDA5KSAgIHxcbiAqICB8IGRheSAgICAgICB8ICAgZCAgICB8IC0gICAgICAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgZCAoMykgICAgIHwgZGQgKDAzKSAgIHxcbiAqICB8IHdlZWtkYXkgICB8ICAgRSAgICB8IEVFRSAoU3VuKSAgICB8IEVFRUUgKFN1bmRheSkgICAgIHwgLSAgICAgICAgIHwgLSAgICAgICAgIHxcbiAqICB8IGhvdXIgICAgICB8ICAgaiAgICB8IC0gICAgICAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgaiAoMTMpICAgIHwgamogKDEzKSAgIHxcbiAqICB8IGhvdXIxMiAgICB8ICAgaCAgICB8IC0gICAgICAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgaCAoMSBQTSkgIHwgaGggKDAxIFBNKXxcbiAqICB8IGhvdXIyNCAgICB8ICAgSCAgICB8IC0gICAgICAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgSCAoMTMpICAgIHwgSEggKDEzKSAgIHxcbiAqICB8IG1pbnV0ZSAgICB8ICAgbSAgICB8IC0gICAgICAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgbSAoNSkgICAgIHwgbW0gKDA1KSAgIHxcbiAqICB8IHNlY29uZCAgICB8ICAgcyAgICB8IC0gICAgICAgICAgICB8IC0gICAgICAgICAgICAgICAgIHwgcyAoOSkgICAgIHwgc3MgKDA5KSAgIHxcbiAqICB8IHRpbWV6b25lICB8ICAgeiAgICB8IC0gICAgICAgICAgICB8IHogKFBhY2lmaWMgU3RhbmRhcmQgVGltZSl8IC0gIHwgLSAgICAgICAgIHxcbiAqICB8IHRpbWV6b25lICB8ICAgWiAgICB8IFogKEdNVC04OjAwKSB8IC0gICAgICAgICAgICAgICAgIHwgLSAgICAgICAgIHwgLSAgICAgICAgIHxcbiAqXG4gKiBJbiBqYXZhc2NyaXB0LCBvbmx5IHRoZSBjb21wb25lbnRzIHNwZWNpZmllZCB3aWxsIGJlIHJlc3BlY3RlZCAobm90IHRoZSBvcmRlcmluZyxcbiAqIHB1bmN0dWF0aW9ucywgLi4uKSBhbmQgZGV0YWlscyBvZiB0aGUgZm9ybWF0dGluZyB3aWxsIGJlIGRlcGVuZGVudCBvbiB0aGUgbG9jYWxlLlxuICogT24gdGhlIG90aGVyIGhhbmQgaW4gRGFydCB2ZXJzaW9uLCB5b3UgY2FuIGFsc28gaW5jbHVkZSBxdW90ZWQgdGV4dCBhcyB3ZWxsIGFzIHNvbWUgZXh0cmFcbiAqIGRhdGUvdGltZSBjb21wb25lbnRzIHN1Y2ggYXMgcXVhcnRlci4gRm9yIG1vcmUgaW5mb3JtYXRpb24gc2VlOlxuICogaHR0cHM6Ly9hcGkuZGFydGxhbmcub3JnL2FwaWRvY3MvY2hhbm5lbHMvc3RhYmxlL2RhcnRkb2Mtdmlld2VyL2ludGwvaW50bC5EYXRlRm9ybWF0LlxuICpcbiAqIGBmb3JtYXRgIGNhbiBhbHNvIGJlIG9uZSBvZiB0aGUgZm9sbG93aW5nIHByZWRlZmluZWQgZm9ybWF0czpcbiAqXG4gKiAgLSBgJ21lZGl1bSdgOiBlcXVpdmFsZW50IHRvIGAneU1NTWRqbXMnYCAoZS5nLiBTZXAgMywgMjAxMCwgMTI6MDU6MDggUE0gZm9yIGVuLVVTKVxuICogIC0gYCdzaG9ydCdgOiBlcXVpdmFsZW50IHRvIGAneU1kam0nYCAoZS5nLiA5LzMvMjAxMCwgMTI6MDUgUE0gZm9yIGVuLVVTKVxuICogIC0gYCdmdWxsRGF0ZSdgOiBlcXVpdmFsZW50IHRvIGAneU1NTU1FRUVFZCdgIChlLmcuIEZyaWRheSwgU2VwdGVtYmVyIDMsIDIwMTAgZm9yIGVuLVVTKVxuICogIC0gYCdsb25nRGF0ZSdgOiBlcXVpdmFsZW50IHRvIGAneU1NTU1kJ2AgKGUuZy4gU2VwdGVtYmVyIDMsIDIwMTApXG4gKiAgLSBgJ21lZGl1bURhdGUnYDogZXF1aXZhbGVudCB0byBgJ3lNTU1kJ2AgKGUuZy4gU2VwIDMsIDIwMTAgZm9yIGVuLVVTKVxuICogIC0gYCdzaG9ydERhdGUnYDogZXF1aXZhbGVudCB0byBgJ3lNZCdgIChlLmcuIDkvMy8yMDEwIGZvciBlbi1VUylcbiAqICAtIGAnbWVkaXVtVGltZSdgOiBlcXVpdmFsZW50IHRvIGAnam1zJ2AgKGUuZy4gMTI6MDU6MDggUE0gZm9yIGVuLVVTKVxuICogIC0gYCdzaG9ydFRpbWUnYDogZXF1aXZhbGVudCB0byBgJ2ptJ2AgKGUuZy4gMTI6MDUgUE0gZm9yIGVuLVVTKVxuICpcbiAqIFRpbWV6b25lIG9mIHRoZSBmb3JtYXR0ZWQgdGV4dCB3aWxsIGJlIHRoZSBsb2NhbCBzeXN0ZW0gdGltZXpvbmUgb2YgdGhlIGVuZC11c2VycyBtYWNoaW5lLlxuICpcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIEFzc3VtaW5nIGBkYXRlT2JqYCBpcyAoeWVhcjogMjAxNSwgbW9udGg6IDYsIGRheTogMTUsIGhvdXI6IDIxLCBtaW51dGU6IDQzLCBzZWNvbmQ6IDExKVxuICogaW4gdGhlIF9sb2NhbF8gdGltZSBhbmQgbG9jYWxlIGlzICdlbi1VUyc6XG4gKlxuICogYGBgXG4gKiAgICAge3sgZGF0ZU9iaiB8IGRhdGUgfX0gICAgICAgICAgICAgICAvLyBvdXRwdXQgaXMgJ0p1biAxNSwgMjAxNSdcbiAqICAgICB7eyBkYXRlT2JqIHwgZGF0ZTonbWVkaXVtJyB9fSAgICAgIC8vIG91dHB1dCBpcyAnSnVuIDE1LCAyMDE1LCA5OjQzOjExIFBNJ1xuICogICAgIHt7IGRhdGVPYmogfCBkYXRlOidzaG9ydFRpbWUnIH19ICAgLy8gb3V0cHV0IGlzICc5OjQzIFBNJ1xuICogICAgIHt7IGRhdGVPYmogfCBkYXRlOidtbXNzJyB9fSAgICAgICAgLy8gb3V0cHV0IGlzICc0MzoxMSdcbiAqIGBgYFxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3BpcGVzL3RzL2RhdGVfcGlwZS9kYXRlX3BpcGVfZXhhbXBsZS50cyByZWdpb249J0RhdGVQaXBlJ31cbiAqL1xuQFBpcGUoe25hbWU6ICdkYXRlJywgcHVyZTogdHJ1ZX0pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRGF0ZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX0FMSUFTRVM6IHtba2V5OiBzdHJpbmddOiBTdHJpbmd9ID0ge1xuICAgICdtZWRpdW0nOiAneU1NTWRqbXMnLFxuICAgICdzaG9ydCc6ICd5TWRqbScsXG4gICAgJ2Z1bGxEYXRlJzogJ3lNTU1NRUVFRWQnLFxuICAgICdsb25nRGF0ZSc6ICd5TU1NTWQnLFxuICAgICdtZWRpdW1EYXRlJzogJ3lNTU1kJyxcbiAgICAnc2hvcnREYXRlJzogJ3lNZCcsXG4gICAgJ21lZGl1bVRpbWUnOiAnam1zJyxcbiAgICAnc2hvcnRUaW1lJzogJ2ptJ1xuICB9O1xuXG5cbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIHBhdHRlcm46IHN0cmluZyA9ICdtZWRpdW1EYXRlJyk6IHN0cmluZyB7XG4gICAgaWYgKGlzQmxhbmsodmFsdWUpKSByZXR1cm4gbnVsbDtcblxuICAgIGlmICghdGhpcy5zdXBwb3J0cyh2YWx1ZSkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9uKERhdGVQaXBlLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgaWYgKGlzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgdmFsdWUgPSBEYXRlV3JhcHBlci5mcm9tTWlsbGlzKHZhbHVlKTtcbiAgICB9XG4gICAgaWYgKFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnMoRGF0ZVBpcGUuX0FMSUFTRVMsIHBhdHRlcm4pKSB7XG4gICAgICBwYXR0ZXJuID0gPHN0cmluZz5TdHJpbmdNYXBXcmFwcGVyLmdldChEYXRlUGlwZS5fQUxJQVNFUywgcGF0dGVybik7XG4gICAgfVxuICAgIHJldHVybiBEYXRlRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSwgZGVmYXVsdExvY2FsZSwgcGF0dGVybik7XG4gIH1cblxuICBzdXBwb3J0cyhvYmo6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gaXNEYXRlKG9iaikgfHwgaXNOdW1iZXIob2JqKTsgfVxufVxuIl19