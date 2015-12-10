var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isDate, isNumber, isPresent, DateWrapper, CONST, isBlank } from 'angular2/src/facade/lang';
import { DateFormatter } from 'angular2/src/facade/intl';
import { Pipe, Injectable } from 'angular2/core';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
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
export let DatePipe = class {
    transform(value, args) {
        if (isBlank(value))
            return null;
        if (!this.supports(value)) {
            throw new InvalidPipeArgumentException(DatePipe, value);
        }
        var pattern = isPresent(args) && args.length > 0 ? args[0] : 'mediumDate';
        if (isNumber(value)) {
            value = DateWrapper.fromMillis(value);
        }
        if (StringMapWrapper.contains(DatePipe._ALIASES, pattern)) {
            pattern = StringMapWrapper.get(DatePipe._ALIASES, pattern);
        }
        return DateFormatter.format(value, defaultLocale, pattern);
    }
    supports(obj) { return isDate(obj) || isNumber(obj); }
};
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
    CONST(),
    Pipe({ name: 'date', pure: true }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], DatePipe);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZV9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9waXBlcy9kYXRlX3BpcGUudHMiXSwibmFtZXMiOlsiRGF0ZVBpcGUiLCJEYXRlUGlwZS50cmFuc2Zvcm0iLCJEYXRlUGlwZS5zdXBwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFDTCxNQUFNLEVBQ04sUUFBUSxFQUNSLFNBQVMsRUFFVCxXQUFXLEVBQ1gsS0FBSyxFQUNMLE9BQU8sRUFFUixNQUFNLDBCQUEwQjtPQUMxQixFQUFDLGFBQWEsRUFBQyxNQUFNLDBCQUEwQjtPQUMvQyxFQUE4QixJQUFJLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZTtPQUNwRSxFQUFDLGdCQUFnQixFQUFjLE1BQU0sZ0NBQWdDO09BRXJFLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxtQ0FBbUM7QUFHOUUsaUZBQWlGO0FBQ2pGLElBQUksYUFBYSxHQUFXLE9BQU8sQ0FBQztBQUVwQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpRUc7QUFDSDtJQWlCRUEsU0FBU0EsQ0FBQ0EsS0FBVUEsRUFBRUEsSUFBV0E7UUFDL0JDLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBRWhDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxQkEsTUFBTUEsSUFBSUEsNEJBQTRCQSxDQUFDQSxRQUFRQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUMxREEsQ0FBQ0E7UUFFREEsSUFBSUEsT0FBT0EsR0FBV0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsWUFBWUEsQ0FBQ0E7UUFDbEZBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BCQSxLQUFLQSxHQUFHQSxXQUFXQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUN4Q0EsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxREEsT0FBT0EsR0FBV0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxRQUFRQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNyRUEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsYUFBYUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDN0RBLENBQUNBO0lBRURELFFBQVFBLENBQUNBLEdBQVFBLElBQWFFLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQ3RFRixDQUFDQTtBQS9CQyxnQkFBZ0I7QUFDVCxpQkFBUSxHQUE0QjtJQUN6QyxRQUFRLEVBQUUsVUFBVTtJQUNwQixPQUFPLEVBQUUsT0FBTztJQUNoQixVQUFVLEVBQUUsWUFBWTtJQUN4QixVQUFVLEVBQUUsUUFBUTtJQUNwQixZQUFZLEVBQUUsT0FBTztJQUNyQixXQUFXLEVBQUUsS0FBSztJQUNsQixZQUFZLEVBQUUsS0FBSztJQUNuQixXQUFXLEVBQUUsSUFBSTtDQUNsQixDQUFDO0FBZEo7SUFBQyxLQUFLLEVBQUU7SUFDUCxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQztJQUNoQyxVQUFVLEVBQUU7O2FBaUNaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBpc0RhdGUsXG4gIGlzTnVtYmVyLFxuICBpc1ByZXNlbnQsXG4gIERhdGUsXG4gIERhdGVXcmFwcGVyLFxuICBDT05TVCxcbiAgaXNCbGFuayxcbiAgRnVuY3Rpb25XcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0RhdGVGb3JtYXR0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvaW50bCc7XG5pbXBvcnQge1BpcGVUcmFuc2Zvcm0sIFdyYXBwZWRWYWx1ZSwgUGlwZSwgSW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge0ludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb259IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2V4Y2VwdGlvbic7XG5cblxuLy8gVE9ETzogbW92ZSB0byBhIGdsb2JhbCBjb25maWd1cmFibGUgbG9jYXRpb24gYWxvbmcgd2l0aCBvdGhlciBpMThuIGNvbXBvbmVudHMuXG52YXIgZGVmYXVsdExvY2FsZTogc3RyaW5nID0gJ2VuLVVTJztcblxuLyoqXG4gKiBGb3JtYXRzIGEgZGF0ZSB2YWx1ZSB0byBhIHN0cmluZyBiYXNlZCBvbiB0aGUgcmVxdWVzdGVkIGZvcm1hdC5cbiAqXG4gKiBXQVJOSU5HUzpcbiAqIC0gdGhpcyBwaXBlIGlzIG1hcmtlZCBhcyBwdXJlIGhlbmNlIGl0IHdpbGwgbm90IGJlIHJlLWV2YWx1YXRlZCB3aGVuIHRoZSBpbnB1dCBpcyBtdXRhdGVkLlxuICogICBJbnN0ZWFkIHVzZXJzIHNob3VsZCB0cmVhdCB0aGUgZGF0ZSBhcyBhbiBpbW11dGFibGUgb2JqZWN0IGFuZCBjaGFuZ2UgdGhlIHJlZmVyZW5jZSB3aGVuIHRoZVxuICogICBwaXBlIG5lZWRzIHRvIHJlLXJ1biAodGhpcyBpcyB0byBhdm9pZCByZWZvcm1hdHRpbmcgdGhlIGRhdGUgb24gZXZlcnkgY2hhbmdlIGRldGVjdGlvbiBydW5cbiAqICAgd2hpY2ggd291bGQgYmUgYW4gZXhwZW5zaXZlIG9wZXJhdGlvbikuXG4gKiAtIHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkuIFRoZXJlZm9yZSBpdCBpcyBvbmx5IHJlbGlhYmxlIGluIENocm9tZSBhbmQgT3BlcmFcbiAqICAgYnJvd3NlcnMuXG4gKlxuICogIyMgVXNhZ2VcbiAqXG4gKiAgICAgZXhwcmVzc2lvbiB8IGRhdGVbOmZvcm1hdF1cbiAqXG4gKiB3aGVyZSBgZXhwcmVzc2lvbmAgaXMgYSBkYXRlIG9iamVjdCBvciBhIG51bWJlciAobWlsbGlzZWNvbmRzIHNpbmNlIFVUQyBlcG9jaCkgYW5kXG4gKiBgZm9ybWF0YCBpbmRpY2F0ZXMgd2hpY2ggZGF0ZS90aW1lIGNvbXBvbmVudHMgdG8gaW5jbHVkZTpcbiAqXG4gKiAgfCBDb21wb25lbnQgfCBTeW1ib2wgfCBTaG9ydCBGb3JtICAgfCBMb25nIEZvcm0gICAgICAgICB8IE51bWVyaWMgICB8IDItZGlnaXQgICB8XG4gKiAgfC0tLS0tLS0tLS0tfDotLS0tLS06fC0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS18LS0tLS0tLS0tLS18XG4gKiAgfCBlcmEgICAgICAgfCAgIEcgICAgfCBHIChBRCkgICAgICAgfCBHR0dHIChBbm5vIERvbWluaSl8IC0gICAgICAgICB8IC0gICAgICAgICB8XG4gKiAgfCB5ZWFyICAgICAgfCAgIHkgICAgfCAtICAgICAgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IHkgKDIwMTUpICB8IHl5ICgxNSkgICB8XG4gKiAgfCBtb250aCAgICAgfCAgIE0gICAgfCBNTU0gKFNlcCkgICAgfCBNTU1NIChTZXB0ZW1iZXIpICB8IE0gKDkpICAgICB8IE1NICgwOSkgICB8XG4gKiAgfCBkYXkgICAgICAgfCAgIGQgICAgfCAtICAgICAgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IGQgKDMpICAgICB8IGRkICgwMykgICB8XG4gKiAgfCB3ZWVrZGF5ICAgfCAgIEUgICAgfCBFRUUgKFN1bikgICAgfCBFRUVFIChTdW5kYXkpICAgICB8IC0gICAgICAgICB8IC0gICAgICAgICB8XG4gKiAgfCBob3VyICAgICAgfCAgIGogICAgfCAtICAgICAgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IGogKDEzKSAgICB8IGpqICgxMykgICB8XG4gKiAgfCBob3VyMTIgICAgfCAgIGggICAgfCAtICAgICAgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IGggKDEgUE0pICB8IGhoICgwMSBQTSl8XG4gKiAgfCBob3VyMjQgICAgfCAgIEggICAgfCAtICAgICAgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IEggKDEzKSAgICB8IEhIICgxMykgICB8XG4gKiAgfCBtaW51dGUgICAgfCAgIG0gICAgfCAtICAgICAgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IG0gKDUpICAgICB8IG1tICgwNSkgICB8XG4gKiAgfCBzZWNvbmQgICAgfCAgIHMgICAgfCAtICAgICAgICAgICAgfCAtICAgICAgICAgICAgICAgICB8IHMgKDkpICAgICB8IHNzICgwOSkgICB8XG4gKiAgfCB0aW1lem9uZSAgfCAgIHogICAgfCAtICAgICAgICAgICAgfCB6IChQYWNpZmljIFN0YW5kYXJkIFRpbWUpfCAtICB8IC0gICAgICAgICB8XG4gKiAgfCB0aW1lem9uZSAgfCAgIFogICAgfCBaIChHTVQtODowMCkgfCAtICAgICAgICAgICAgICAgICB8IC0gICAgICAgICB8IC0gICAgICAgICB8XG4gKlxuICogSW4gamF2YXNjcmlwdCwgb25seSB0aGUgY29tcG9uZW50cyBzcGVjaWZpZWQgd2lsbCBiZSByZXNwZWN0ZWQgKG5vdCB0aGUgb3JkZXJpbmcsXG4gKiBwdW5jdHVhdGlvbnMsIC4uLikgYW5kIGRldGFpbHMgb2YgdGhlIGZvcm1hdHRpbmcgd2lsbCBiZSBkZXBlbmRlbnQgb24gdGhlIGxvY2FsZS5cbiAqIE9uIHRoZSBvdGhlciBoYW5kIGluIERhcnQgdmVyc2lvbiwgeW91IGNhbiBhbHNvIGluY2x1ZGUgcXVvdGVkIHRleHQgYXMgd2VsbCBhcyBzb21lIGV4dHJhXG4gKiBkYXRlL3RpbWUgY29tcG9uZW50cyBzdWNoIGFzIHF1YXJ0ZXIuIEZvciBtb3JlIGluZm9ybWF0aW9uIHNlZTpcbiAqIGh0dHBzOi8vYXBpLmRhcnRsYW5nLm9yZy9hcGlkb2NzL2NoYW5uZWxzL3N0YWJsZS9kYXJ0ZG9jLXZpZXdlci9pbnRsL2ludGwuRGF0ZUZvcm1hdC5cbiAqXG4gKiBgZm9ybWF0YCBjYW4gYWxzbyBiZSBvbmUgb2YgdGhlIGZvbGxvd2luZyBwcmVkZWZpbmVkIGZvcm1hdHM6XG4gKlxuICogIC0gYCdtZWRpdW0nYDogZXF1aXZhbGVudCB0byBgJ3lNTU1kam1zJ2AgKGUuZy4gU2VwIDMsIDIwMTAsIDEyOjA1OjA4IFBNIGZvciBlbi1VUylcbiAqICAtIGAnc2hvcnQnYDogZXF1aXZhbGVudCB0byBgJ3lNZGptJ2AgKGUuZy4gOS8zLzIwMTAsIDEyOjA1IFBNIGZvciBlbi1VUylcbiAqICAtIGAnZnVsbERhdGUnYDogZXF1aXZhbGVudCB0byBgJ3lNTU1NRUVFRWQnYCAoZS5nLiBGcmlkYXksIFNlcHRlbWJlciAzLCAyMDEwIGZvciBlbi1VUylcbiAqICAtIGAnbG9uZ0RhdGUnYDogZXF1aXZhbGVudCB0byBgJ3lNTU1NZCdgIChlLmcuIFNlcHRlbWJlciAzLCAyMDEwKVxuICogIC0gYCdtZWRpdW1EYXRlJ2A6IGVxdWl2YWxlbnQgdG8gYCd5TU1NZCdgIChlLmcuIFNlcCAzLCAyMDEwIGZvciBlbi1VUylcbiAqICAtIGAnc2hvcnREYXRlJ2A6IGVxdWl2YWxlbnQgdG8gYCd5TWQnYCAoZS5nLiA5LzMvMjAxMCBmb3IgZW4tVVMpXG4gKiAgLSBgJ21lZGl1bVRpbWUnYDogZXF1aXZhbGVudCB0byBgJ2ptcydgIChlLmcuIDEyOjA1OjA4IFBNIGZvciBlbi1VUylcbiAqICAtIGAnc2hvcnRUaW1lJ2A6IGVxdWl2YWxlbnQgdG8gYCdqbSdgIChlLmcuIDEyOjA1IFBNIGZvciBlbi1VUylcbiAqXG4gKiBUaW1lem9uZSBvZiB0aGUgZm9ybWF0dGVkIHRleHQgd2lsbCBiZSB0aGUgbG9jYWwgc3lzdGVtIHRpbWV6b25lIG9mIHRoZSBlbmQtdXNlcnMgbWFjaGluZS5cbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBBc3N1bWluZyBgZGF0ZU9iamAgaXMgKHllYXI6IDIwMTUsIG1vbnRoOiA2LCBkYXk6IDE1LCBob3VyOiAyMSwgbWludXRlOiA0Mywgc2Vjb25kOiAxMSlcbiAqIGluIHRoZSBfbG9jYWxfIHRpbWUgYW5kIGxvY2FsZSBpcyAnZW4tVVMnOlxuICpcbiAqIGBgYFxuICogICAgIHt7IGRhdGVPYmogfCBkYXRlIH19ICAgICAgICAgICAgICAgLy8gb3V0cHV0IGlzICdKdW4gMTUsIDIwMTUnXG4gKiAgICAge3sgZGF0ZU9iaiB8IGRhdGU6J21lZGl1bScgfX0gICAgICAvLyBvdXRwdXQgaXMgJ0p1biAxNSwgMjAxNSwgOTo0MzoxMSBQTSdcbiAqICAgICB7eyBkYXRlT2JqIHwgZGF0ZTonc2hvcnRUaW1lJyB9fSAgIC8vIG91dHB1dCBpcyAnOTo0MyBQTSdcbiAqICAgICB7eyBkYXRlT2JqIHwgZGF0ZTonbW1zcycgfX0gICAgICAgIC8vIG91dHB1dCBpcyAnNDM6MTEnXG4gKiBgYGBcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9waXBlcy90cy9kYXRlX3BpcGUvZGF0ZV9waXBlX2V4YW1wbGUudHMgcmVnaW9uPSdEYXRlUGlwZSd9XG4gKi9cbkBDT05TVCgpXG5AUGlwZSh7bmFtZTogJ2RhdGUnLCBwdXJlOiB0cnVlfSlcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEYXRlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfQUxJQVNFUzoge1trZXk6IHN0cmluZ106IFN0cmluZ30gPSB7XG4gICAgJ21lZGl1bSc6ICd5TU1NZGptcycsXG4gICAgJ3Nob3J0JzogJ3lNZGptJyxcbiAgICAnZnVsbERhdGUnOiAneU1NTU1FRUVFZCcsXG4gICAgJ2xvbmdEYXRlJzogJ3lNTU1NZCcsXG4gICAgJ21lZGl1bURhdGUnOiAneU1NTWQnLFxuICAgICdzaG9ydERhdGUnOiAneU1kJyxcbiAgICAnbWVkaXVtVGltZSc6ICdqbXMnLFxuICAgICdzaG9ydFRpbWUnOiAnam0nXG4gIH07XG5cblxuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgYXJnczogYW55W10pOiBzdHJpbmcge1xuICAgIGlmIChpc0JsYW5rKHZhbHVlKSkgcmV0dXJuIG51bGw7XG5cbiAgICBpZiAoIXRoaXMuc3VwcG9ydHModmFsdWUpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbihEYXRlUGlwZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIHZhciBwYXR0ZXJuOiBzdHJpbmcgPSBpc1ByZXNlbnQoYXJncykgJiYgYXJncy5sZW5ndGggPiAwID8gYXJnc1swXSA6ICdtZWRpdW1EYXRlJztcbiAgICBpZiAoaXNOdW1iZXIodmFsdWUpKSB7XG4gICAgICB2YWx1ZSA9IERhdGVXcmFwcGVyLmZyb21NaWxsaXModmFsdWUpO1xuICAgIH1cbiAgICBpZiAoU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyhEYXRlUGlwZS5fQUxJQVNFUywgcGF0dGVybikpIHtcbiAgICAgIHBhdHRlcm4gPSA8c3RyaW5nPlN0cmluZ01hcFdyYXBwZXIuZ2V0KERhdGVQaXBlLl9BTElBU0VTLCBwYXR0ZXJuKTtcbiAgICB9XG4gICAgcmV0dXJuIERhdGVGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlLCBkZWZhdWx0TG9jYWxlLCBwYXR0ZXJuKTtcbiAgfVxuXG4gIHN1cHBvcnRzKG9iajogYW55KTogYm9vbGVhbiB7IHJldHVybiBpc0RhdGUob2JqKSB8fCBpc051bWJlcihvYmopOyB9XG59XG4iXX0=