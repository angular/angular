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
