'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
    DatePipe.prototype.transform = function (value, args) {
        if (lang_1.isBlank(value))
            return null;
        if (!this.supports(value)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(DatePipe, value);
        }
        var pattern = lang_1.isPresent(args) && args.length > 0 ? args[0] : 'mediumDate';
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
        lang_1.CONST(),
        core_1.Pipe({ name: 'date', pure: true }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DatePipe);
    return DatePipe;
})();
exports.DatePipe = DatePipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZV9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9waXBlcy9kYXRlX3BpcGUudHMiXSwibmFtZXMiOlsiRGF0ZVBpcGUiLCJEYXRlUGlwZS5jb25zdHJ1Y3RvciIsIkRhdGVQaXBlLnRyYW5zZm9ybSIsIkRhdGVQaXBlLnN1cHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHFCQVNPLDBCQUEwQixDQUFDLENBQUE7QUFDbEMscUJBQTRCLDBCQUEwQixDQUFDLENBQUE7QUFDdkQscUJBQTRELGVBQWUsQ0FBQyxDQUFBO0FBQzVFLDJCQUE0QyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTdFLGdEQUEyQyxtQ0FBbUMsQ0FBQyxDQUFBO0FBRy9FLGlGQUFpRjtBQUNqRixJQUFJLGFBQWEsR0FBVyxPQUFPLENBQUM7QUFFcEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUVHO0FBQ0g7SUFBQUE7SUFtQ0FDLENBQUNBO0lBbEJDRCw0QkFBU0EsR0FBVEEsVUFBVUEsS0FBVUEsRUFBRUEsSUFBV0E7UUFDL0JFLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBRWhDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxQkEsTUFBTUEsSUFBSUEsOERBQTRCQSxDQUFDQSxRQUFRQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUMxREEsQ0FBQ0E7UUFFREEsSUFBSUEsT0FBT0EsR0FBV0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLFlBQVlBLENBQUNBO1FBQ2xGQSxFQUFFQSxDQUFDQSxDQUFDQSxlQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsS0FBS0EsR0FBR0Esa0JBQVdBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ3hDQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSw2QkFBZ0JBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzFEQSxPQUFPQSxHQUFXQSw2QkFBZ0JBLENBQUNBLEdBQUdBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO1FBQ3JFQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxvQkFBYUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsYUFBYUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDN0RBLENBQUNBO0lBRURGLDJCQUFRQSxHQUFSQSxVQUFTQSxHQUFRQSxJQUFhRyxNQUFNQSxDQUFDQSxhQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxlQUFRQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQTlCcEVILGdCQUFnQkE7SUFDVEEsaUJBQVFBLEdBQTRCQTtRQUN6Q0EsUUFBUUEsRUFBRUEsVUFBVUE7UUFDcEJBLE9BQU9BLEVBQUVBLE9BQU9BO1FBQ2hCQSxVQUFVQSxFQUFFQSxZQUFZQTtRQUN4QkEsVUFBVUEsRUFBRUEsUUFBUUE7UUFDcEJBLFlBQVlBLEVBQUVBLE9BQU9BO1FBQ3JCQSxXQUFXQSxFQUFFQSxLQUFLQTtRQUNsQkEsWUFBWUEsRUFBRUEsS0FBS0E7UUFDbkJBLFdBQVdBLEVBQUVBLElBQUlBO0tBQ2xCQSxDQUFDQTtJQWRKQTtRQUFDQSxZQUFLQSxFQUFFQTtRQUNQQSxXQUFJQSxDQUFDQSxFQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFDQSxDQUFDQTtRQUNoQ0EsaUJBQVVBLEVBQUVBOztpQkFpQ1pBO0lBQURBLGVBQUNBO0FBQURBLENBQUNBLEFBbkNELElBbUNDO0FBaENZLGdCQUFRLFdBZ0NwQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaXNEYXRlLFxuICBpc051bWJlcixcbiAgaXNQcmVzZW50LFxuICBEYXRlLFxuICBEYXRlV3JhcHBlcixcbiAgQ09OU1QsXG4gIGlzQmxhbmssXG4gIEZ1bmN0aW9uV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtEYXRlRm9ybWF0dGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2ludGwnO1xuaW1wb3J0IHtQaXBlVHJhbnNmb3JtLCBXcmFwcGVkVmFsdWUsIFBpcGUsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9ufSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9leGNlcHRpb24nO1xuXG5cbi8vIFRPRE86IG1vdmUgdG8gYSBnbG9iYWwgY29uZmlndXJhYmxlIGxvY2F0aW9uIGFsb25nIHdpdGggb3RoZXIgaTE4biBjb21wb25lbnRzLlxudmFyIGRlZmF1bHRMb2NhbGU6IHN0cmluZyA9ICdlbi1VUyc7XG5cbi8qKlxuICogRm9ybWF0cyBhIGRhdGUgdmFsdWUgdG8gYSBzdHJpbmcgYmFzZWQgb24gdGhlIHJlcXVlc3RlZCBmb3JtYXQuXG4gKlxuICogV0FSTklOR1M6XG4gKiAtIHRoaXMgcGlwZSBpcyBtYXJrZWQgYXMgcHVyZSBoZW5jZSBpdCB3aWxsIG5vdCBiZSByZS1ldmFsdWF0ZWQgd2hlbiB0aGUgaW5wdXQgaXMgbXV0YXRlZC5cbiAqICAgSW5zdGVhZCB1c2VycyBzaG91bGQgdHJlYXQgdGhlIGRhdGUgYXMgYW4gaW1tdXRhYmxlIG9iamVjdCBhbmQgY2hhbmdlIHRoZSByZWZlcmVuY2Ugd2hlbiB0aGVcbiAqICAgcGlwZSBuZWVkcyB0byByZS1ydW4gKHRoaXMgaXMgdG8gYXZvaWQgcmVmb3JtYXR0aW5nIHRoZSBkYXRlIG9uIGV2ZXJ5IGNoYW5nZSBkZXRlY3Rpb24gcnVuXG4gKiAgIHdoaWNoIHdvdWxkIGJlIGFuIGV4cGVuc2l2ZSBvcGVyYXRpb24pLlxuICogLSB0aGlzIHBpcGUgdXNlcyB0aGUgSW50ZXJuYXRpb25hbGl6YXRpb24gQVBJLiBUaGVyZWZvcmUgaXQgaXMgb25seSByZWxpYWJsZSBpbiBDaHJvbWUgYW5kIE9wZXJhXG4gKiAgIGJyb3dzZXJzLlxuICpcbiAqICMjIFVzYWdlXG4gKlxuICogICAgIGV4cHJlc3Npb24gfCBkYXRlWzpmb3JtYXRdXG4gKlxuICogd2hlcmUgYGV4cHJlc3Npb25gIGlzIGEgZGF0ZSBvYmplY3Qgb3IgYSBudW1iZXIgKG1pbGxpc2Vjb25kcyBzaW5jZSBVVEMgZXBvY2gpIGFuZFxuICogYGZvcm1hdGAgaW5kaWNhdGVzIHdoaWNoIGRhdGUvdGltZSBjb21wb25lbnRzIHRvIGluY2x1ZGU6XG4gKlxuICogIHwgQ29tcG9uZW50IHwgU3ltYm9sIHwgU2hvcnQgRm9ybSAgIHwgTG9uZyBGb3JtICAgICAgICAgfCBOdW1lcmljICAgfCAyLWRpZ2l0ICAgfFxuICogIHwtLS0tLS0tLS0tLXw6LS0tLS0tOnwtLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tfFxuICogIHwgZXJhICAgICAgIHwgICBHICAgIHwgRyAoQUQpICAgICAgIHwgR0dHRyAoQW5ubyBEb21pbmkpfCAtICAgICAgICAgfCAtICAgICAgICAgfFxuICogIHwgeWVhciAgICAgIHwgICB5ICAgIHwgLSAgICAgICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCB5ICgyMDE1KSAgfCB5eSAoMTUpICAgfFxuICogIHwgbW9udGggICAgIHwgICBNICAgIHwgTU1NIChTZXApICAgIHwgTU1NTSAoU2VwdGVtYmVyKSAgfCBNICg5KSAgICAgfCBNTSAoMDkpICAgfFxuICogIHwgZGF5ICAgICAgIHwgICBkICAgIHwgLSAgICAgICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCBkICgzKSAgICAgfCBkZCAoMDMpICAgfFxuICogIHwgd2Vla2RheSAgIHwgICBFICAgIHwgRUVFIChTdW4pICAgIHwgRUVFRSAoU3VuZGF5KSAgICAgfCAtICAgICAgICAgfCAtICAgICAgICAgfFxuICogIHwgaG91ciAgICAgIHwgICBqICAgIHwgLSAgICAgICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCBqICgxMykgICAgfCBqaiAoMTMpICAgfFxuICogIHwgaG91cjEyICAgIHwgICBoICAgIHwgLSAgICAgICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCBoICgxIFBNKSAgfCBoaCAoMDEgUE0pfFxuICogIHwgaG91cjI0ICAgIHwgICBIICAgIHwgLSAgICAgICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCBIICgxMykgICAgfCBISCAoMTMpICAgfFxuICogIHwgbWludXRlICAgIHwgICBtICAgIHwgLSAgICAgICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCBtICg1KSAgICAgfCBtbSAoMDUpICAgfFxuICogIHwgc2Vjb25kICAgIHwgICBzICAgIHwgLSAgICAgICAgICAgIHwgLSAgICAgICAgICAgICAgICAgfCBzICg5KSAgICAgfCBzcyAoMDkpICAgfFxuICogIHwgdGltZXpvbmUgIHwgICB6ICAgIHwgLSAgICAgICAgICAgIHwgeiAoUGFjaWZpYyBTdGFuZGFyZCBUaW1lKXwgLSAgfCAtICAgICAgICAgfFxuICogIHwgdGltZXpvbmUgIHwgICBaICAgIHwgWiAoR01ULTg6MDApIHwgLSAgICAgICAgICAgICAgICAgfCAtICAgICAgICAgfCAtICAgICAgICAgfFxuICpcbiAqIEluIGphdmFzY3JpcHQsIG9ubHkgdGhlIGNvbXBvbmVudHMgc3BlY2lmaWVkIHdpbGwgYmUgcmVzcGVjdGVkIChub3QgdGhlIG9yZGVyaW5nLFxuICogcHVuY3R1YXRpb25zLCAuLi4pIGFuZCBkZXRhaWxzIG9mIHRoZSBmb3JtYXR0aW5nIHdpbGwgYmUgZGVwZW5kZW50IG9uIHRoZSBsb2NhbGUuXG4gKiBPbiB0aGUgb3RoZXIgaGFuZCBpbiBEYXJ0IHZlcnNpb24sIHlvdSBjYW4gYWxzbyBpbmNsdWRlIHF1b3RlZCB0ZXh0IGFzIHdlbGwgYXMgc29tZSBleHRyYVxuICogZGF0ZS90aW1lIGNvbXBvbmVudHMgc3VjaCBhcyBxdWFydGVyLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBzZWU6XG4gKiBodHRwczovL2FwaS5kYXJ0bGFuZy5vcmcvYXBpZG9jcy9jaGFubmVscy9zdGFibGUvZGFydGRvYy12aWV3ZXIvaW50bC9pbnRsLkRhdGVGb3JtYXQuXG4gKlxuICogYGZvcm1hdGAgY2FuIGFsc28gYmUgb25lIG9mIHRoZSBmb2xsb3dpbmcgcHJlZGVmaW5lZCBmb3JtYXRzOlxuICpcbiAqICAtIGAnbWVkaXVtJ2A6IGVxdWl2YWxlbnQgdG8gYCd5TU1NZGptcydgIChlLmcuIFNlcCAzLCAyMDEwLCAxMjowNTowOCBQTSBmb3IgZW4tVVMpXG4gKiAgLSBgJ3Nob3J0J2A6IGVxdWl2YWxlbnQgdG8gYCd5TWRqbSdgIChlLmcuIDkvMy8yMDEwLCAxMjowNSBQTSBmb3IgZW4tVVMpXG4gKiAgLSBgJ2Z1bGxEYXRlJ2A6IGVxdWl2YWxlbnQgdG8gYCd5TU1NTUVFRUVkJ2AgKGUuZy4gRnJpZGF5LCBTZXB0ZW1iZXIgMywgMjAxMCBmb3IgZW4tVVMpXG4gKiAgLSBgJ2xvbmdEYXRlJ2A6IGVxdWl2YWxlbnQgdG8gYCd5TU1NTWQnYCAoZS5nLiBTZXB0ZW1iZXIgMywgMjAxMClcbiAqICAtIGAnbWVkaXVtRGF0ZSdgOiBlcXVpdmFsZW50IHRvIGAneU1NTWQnYCAoZS5nLiBTZXAgMywgMjAxMCBmb3IgZW4tVVMpXG4gKiAgLSBgJ3Nob3J0RGF0ZSdgOiBlcXVpdmFsZW50IHRvIGAneU1kJ2AgKGUuZy4gOS8zLzIwMTAgZm9yIGVuLVVTKVxuICogIC0gYCdtZWRpdW1UaW1lJ2A6IGVxdWl2YWxlbnQgdG8gYCdqbXMnYCAoZS5nLiAxMjowNTowOCBQTSBmb3IgZW4tVVMpXG4gKiAgLSBgJ3Nob3J0VGltZSdgOiBlcXVpdmFsZW50IHRvIGAnam0nYCAoZS5nLiAxMjowNSBQTSBmb3IgZW4tVVMpXG4gKlxuICogVGltZXpvbmUgb2YgdGhlIGZvcm1hdHRlZCB0ZXh0IHdpbGwgYmUgdGhlIGxvY2FsIHN5c3RlbSB0aW1lem9uZSBvZiB0aGUgZW5kLXVzZXJzIG1hY2hpbmUuXG4gKlxuICogIyMjIEV4YW1wbGVzXG4gKlxuICogQXNzdW1pbmcgYGRhdGVPYmpgIGlzICh5ZWFyOiAyMDE1LCBtb250aDogNiwgZGF5OiAxNSwgaG91cjogMjEsIG1pbnV0ZTogNDMsIHNlY29uZDogMTEpXG4gKiBpbiB0aGUgX2xvY2FsXyB0aW1lIGFuZCBsb2NhbGUgaXMgJ2VuLVVTJzpcbiAqXG4gKiBgYGBcbiAqICAgICB7eyBkYXRlT2JqIHwgZGF0ZSB9fSAgICAgICAgICAgICAgIC8vIG91dHB1dCBpcyAnSnVuIDE1LCAyMDE1J1xuICogICAgIHt7IGRhdGVPYmogfCBkYXRlOidtZWRpdW0nIH19ICAgICAgLy8gb3V0cHV0IGlzICdKdW4gMTUsIDIwMTUsIDk6NDM6MTEgUE0nXG4gKiAgICAge3sgZGF0ZU9iaiB8IGRhdGU6J3Nob3J0VGltZScgfX0gICAvLyBvdXRwdXQgaXMgJzk6NDMgUE0nXG4gKiAgICAge3sgZGF0ZU9iaiB8IGRhdGU6J21tc3MnIH19ICAgICAgICAvLyBvdXRwdXQgaXMgJzQzOjExJ1xuICogYGBgXG4gKlxuICoge0BleGFtcGxlIGNvcmUvcGlwZXMvdHMvZGF0ZV9waXBlL2RhdGVfcGlwZV9leGFtcGxlLnRzIHJlZ2lvbj0nRGF0ZVBpcGUnfVxuICovXG5AQ09OU1QoKVxuQFBpcGUoe25hbWU6ICdkYXRlJywgcHVyZTogdHJ1ZX0pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRGF0ZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX0FMSUFTRVM6IHtba2V5OiBzdHJpbmddOiBTdHJpbmd9ID0ge1xuICAgICdtZWRpdW0nOiAneU1NTWRqbXMnLFxuICAgICdzaG9ydCc6ICd5TWRqbScsXG4gICAgJ2Z1bGxEYXRlJzogJ3lNTU1NRUVFRWQnLFxuICAgICdsb25nRGF0ZSc6ICd5TU1NTWQnLFxuICAgICdtZWRpdW1EYXRlJzogJ3lNTU1kJyxcbiAgICAnc2hvcnREYXRlJzogJ3lNZCcsXG4gICAgJ21lZGl1bVRpbWUnOiAnam1zJyxcbiAgICAnc2hvcnRUaW1lJzogJ2ptJ1xuICB9O1xuXG5cbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGFyZ3M6IGFueVtdKTogc3RyaW5nIHtcbiAgICBpZiAoaXNCbGFuayh2YWx1ZSkpIHJldHVybiBudWxsO1xuXG4gICAgaWYgKCF0aGlzLnN1cHBvcnRzKHZhbHVlKSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb24oRGF0ZVBpcGUsIHZhbHVlKTtcbiAgICB9XG5cbiAgICB2YXIgcGF0dGVybjogc3RyaW5nID0gaXNQcmVzZW50KGFyZ3MpICYmIGFyZ3MubGVuZ3RoID4gMCA/IGFyZ3NbMF0gOiAnbWVkaXVtRGF0ZSc7XG4gICAgaWYgKGlzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgdmFsdWUgPSBEYXRlV3JhcHBlci5mcm9tTWlsbGlzKHZhbHVlKTtcbiAgICB9XG4gICAgaWYgKFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnMoRGF0ZVBpcGUuX0FMSUFTRVMsIHBhdHRlcm4pKSB7XG4gICAgICBwYXR0ZXJuID0gPHN0cmluZz5TdHJpbmdNYXBXcmFwcGVyLmdldChEYXRlUGlwZS5fQUxJQVNFUywgcGF0dGVybik7XG4gICAgfVxuICAgIHJldHVybiBEYXRlRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSwgZGVmYXVsdExvY2FsZSwgcGF0dGVybik7XG4gIH1cblxuICBzdXBwb3J0cyhvYmo6IGFueSk6IGJvb2xlYW4geyByZXR1cm4gaXNEYXRlKG9iaikgfHwgaXNOdW1iZXIob2JqKTsgfVxufVxuIl19