var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isNumber, isPresent, isBlank, NumberWrapper, RegExpWrapper, CONST } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { NumberFormatter, NumberFormatStyle } from 'angular2/src/facade/intl';
import { Injectable, Pipe } from 'angular2/core';
import { ListWrapper } from 'angular2/src/facade/collection';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
var defaultLocale = 'en-US';
var _re = RegExpWrapper.create('^(\\d+)?\\.((\\d+)(\\-(\\d+))?)?$');
/**
 * Internal base class for numeric pipes.
 */
export let NumberPipe = class {
    /** @internal */
    static _format(value, style, digits, currency = null, currencyAsSymbol = false) {
        if (isBlank(value))
            return null;
        if (!isNumber(value)) {
            throw new InvalidPipeArgumentException(NumberPipe, value);
        }
        var minInt = 1, minFraction = 0, maxFraction = 3;
        if (isPresent(digits)) {
            var parts = RegExpWrapper.firstMatch(_re, digits);
            if (isBlank(parts)) {
                throw new BaseException(`${digits} is not a valid digit info for number pipes`);
            }
            if (isPresent(parts[1])) {
                minInt = NumberWrapper.parseIntAutoRadix(parts[1]);
            }
            if (isPresent(parts[3])) {
                minFraction = NumberWrapper.parseIntAutoRadix(parts[3]);
            }
            if (isPresent(parts[5])) {
                maxFraction = NumberWrapper.parseIntAutoRadix(parts[5]);
            }
        }
        return NumberFormatter.format(value, defaultLocale, style, {
            minimumIntegerDigits: minInt,
            minimumFractionDigits: minFraction,
            maximumFractionDigits: maxFraction,
            currency: currency,
            currencyAsSymbol: currencyAsSymbol
        });
    }
};
NumberPipe = __decorate([
    CONST(),
    Injectable(), 
    __metadata('design:paramtypes', [])
], NumberPipe);
/**
 * WARNING: this pipe uses the Internationalization API.
 * Therefore it is only reliable in Chrome and Opera browsers.
 *
 * Formats a number as local text. i.e. group sizing and separator and other locale-specific
 * configurations are based on the active locale.
 *
 * ### Usage
 *
 *     expression | number[:digitInfo]
 *
 * where `expression` is a number and `digitInfo` has the following format:
 *
 *     {minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}
 *
 * - minIntegerDigits is the minimum number of integer digits to use. Defaults to 1.
 * - minFractionDigits is the minimum number of digits after fraction. Defaults to 0.
 * - maxFractionDigits is the maximum number of digits after fraction. Defaults to 3.
 *
 * For more information on the acceptable range for each of these numbers and other
 * details see your native internationalization library.
 *
 * ### Example
 *
 * {@example core/pipes/ts/number_pipe/number_pipe_example.ts region='NumberPipe'}
 */
export let DecimalPipe = class extends NumberPipe {
    transform(value, args) {
        var digits = ListWrapper.first(args);
        return NumberPipe._format(value, NumberFormatStyle.Decimal, digits);
    }
};
DecimalPipe = __decorate([
    CONST(),
    Pipe({ name: 'number' }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], DecimalPipe);
/**
 * WARNING: this pipe uses the Internationalization API.
 * Therefore it is only reliable in Chrome and Opera browsers.
 *
 * Formats a number as local percent.
 *
 * ### Usage
 *
 *     expression | percent[:digitInfo]
 *
 * For more information about `digitInfo` see {@link DecimalPipe}
 *
 * ### Example
 *
 * {@example core/pipes/ts/number_pipe/number_pipe_example.ts region='PercentPipe'}
 */
export let PercentPipe = class extends NumberPipe {
    transform(value, args) {
        var digits = ListWrapper.first(args);
        return NumberPipe._format(value, NumberFormatStyle.Percent, digits);
    }
};
PercentPipe = __decorate([
    CONST(),
    Pipe({ name: 'percent' }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], PercentPipe);
/**
 * WARNING: this pipe uses the Internationalization API.
 * Therefore it is only reliable in Chrome and Opera browsers.
 *
 * Formats a number as local currency.
 *
 * ### Usage
 *
 *     expression | currency[:currencyCode[:symbolDisplay[:digitInfo]]]
 *
 * where `currencyCode` is the ISO 4217 currency code, such as "USD" for the US dollar and
 * "EUR" for the euro. `symbolDisplay` is a boolean indicating whether to use the currency
 * symbol (e.g. $) or the currency code (e.g. USD) in the output. The default for this value
 * is `false`.
 * For more information about `digitInfo` see {@link DecimalPipe}
 *
 * ### Example
 *
 * {@example core/pipes/ts/number_pipe/number_pipe_example.ts region='CurrencyPipe'}
 */
export let CurrencyPipe = class extends NumberPipe {
    transform(value, args) {
        var currencyCode = isPresent(args) && args.length > 0 ? args[0] : 'USD';
        var symbolDisplay = isPresent(args) && args.length > 1 ? args[1] : false;
        var digits = isPresent(args) && args.length > 2 ? args[2] : null;
        return NumberPipe._format(value, NumberFormatStyle.Currency, digits, currencyCode, symbolDisplay);
    }
};
CurrencyPipe = __decorate([
    CONST(),
    Pipe({ name: 'currency' }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], CurrencyPipe);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL3BpcGVzL251bWJlcl9waXBlLnRzIl0sIm5hbWVzIjpbIk51bWJlclBpcGUiLCJOdW1iZXJQaXBlLl9mb3JtYXQiLCJEZWNpbWFsUGlwZSIsIkRlY2ltYWxQaXBlLnRyYW5zZm9ybSIsIlBlcmNlbnRQaXBlIiwiUGVyY2VudFBpcGUudHJhbnNmb3JtIiwiQ3VycmVuY3lQaXBlIiwiQ3VycmVuY3lQaXBlLnRyYW5zZm9ybSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFDTCxRQUFRLEVBQ1IsU0FBUyxFQUNULE9BQU8sRUFFUCxhQUFhLEVBQ2IsYUFBYSxFQUNiLEtBQUssRUFFTixNQUFNLDBCQUEwQjtPQUMxQixFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FDdkUsRUFBQyxlQUFlLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSwwQkFBMEI7T0FDcEUsRUFBQyxVQUFVLEVBQStCLElBQUksRUFBQyxNQUFNLGVBQWU7T0FDcEUsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FFbkQsRUFBQyw0QkFBNEIsRUFBQyxNQUFNLG1DQUFtQztBQUU5RSxJQUFJLGFBQWEsR0FBVyxPQUFPLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0FBRXBFOztHQUVHO0FBQ0g7SUFHRUEsZ0JBQWdCQTtJQUNoQkEsT0FBT0EsT0FBT0EsQ0FBQ0EsS0FBYUEsRUFBRUEsS0FBd0JBLEVBQUVBLE1BQWNBLEVBQUVBLFFBQVFBLEdBQVdBLElBQUlBLEVBQ2hGQSxnQkFBZ0JBLEdBQVlBLEtBQUtBO1FBQzlDQyxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNoQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FB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QVhEO0lBQUMsS0FBSyxFQUFFO0lBQ1AsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBQyxDQUFDO0lBQ3hCLFVBQVUsRUFBRTs7aUJBU1o7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzTnVtYmVyLFxuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFN0cmluZ1dyYXBwZXIsXG4gIE51bWJlcldyYXBwZXIsXG4gIFJlZ0V4cFdyYXBwZXIsXG4gIENPTlNULFxuICBGdW5jdGlvbldyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TnVtYmVyRm9ybWF0dGVyLCBOdW1iZXJGb3JtYXRTdHlsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9pbnRsJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgUGlwZVRyYW5zZm9ybSwgV3JhcHBlZFZhbHVlLCBQaXBlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7SW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbn0gZnJvbSAnLi9pbnZhbGlkX3BpcGVfYXJndW1lbnRfZXhjZXB0aW9uJztcblxudmFyIGRlZmF1bHRMb2NhbGU6IHN0cmluZyA9ICdlbi1VUyc7XG52YXIgX3JlID0gUmVnRXhwV3JhcHBlci5jcmVhdGUoJ14oXFxcXGQrKT9cXFxcLigoXFxcXGQrKShcXFxcLShcXFxcZCspKT8pPyQnKTtcblxuLyoqXG4gKiBJbnRlcm5hbCBiYXNlIGNsYXNzIGZvciBudW1lcmljIHBpcGVzLlxuICovXG5AQ09OU1QoKVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE51bWJlclBpcGUge1xuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfZm9ybWF0KHZhbHVlOiBudW1iZXIsIHN0eWxlOiBOdW1iZXJGb3JtYXRTdHlsZSwgZGlnaXRzOiBzdHJpbmcsIGN1cnJlbmN5OiBzdHJpbmcgPSBudWxsLFxuICAgICAgICAgICAgICAgICBjdXJyZW5jeUFzU3ltYm9sOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xuICAgIGlmIChpc0JsYW5rKHZhbHVlKSkgcmV0dXJuIG51bGw7XG4gICAgaWYgKCFpc051bWJlcih2YWx1ZSkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9uKE51bWJlclBpcGUsIHZhbHVlKTtcbiAgICB9XG4gICAgdmFyIG1pbkludCA9IDEsIG1pbkZyYWN0aW9uID0gMCwgbWF4RnJhY3Rpb24gPSAzO1xuICAgIGlmIChpc1ByZXNlbnQoZGlnaXRzKSkge1xuICAgICAgdmFyIHBhcnRzID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKF9yZSwgZGlnaXRzKTtcbiAgICAgIGlmIChpc0JsYW5rKHBhcnRzKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgJHtkaWdpdHN9IGlzIG5vdCBhIHZhbGlkIGRpZ2l0IGluZm8gZm9yIG51bWJlciBwaXBlc2ApO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChwYXJ0c1sxXSkpIHsgIC8vIG1pbiBpbnRlZ2VyIGRpZ2l0c1xuICAgICAgICBtaW5JbnQgPSBOdW1iZXJXcmFwcGVyLnBhcnNlSW50QXV0b1JhZGl4KHBhcnRzWzFdKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQocGFydHNbM10pKSB7ICAvLyBtaW4gZnJhY3Rpb24gZGlnaXRzXG4gICAgICAgIG1pbkZyYWN0aW9uID0gTnVtYmVyV3JhcHBlci5wYXJzZUludEF1dG9SYWRpeChwYXJ0c1szXSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHBhcnRzWzVdKSkgeyAgLy8gbWF4IGZyYWN0aW9uIGRpZ2l0c1xuICAgICAgICBtYXhGcmFjdGlvbiA9IE51bWJlcldyYXBwZXIucGFyc2VJbnRBdXRvUmFkaXgocGFydHNbNV0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gTnVtYmVyRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSwgZGVmYXVsdExvY2FsZSwgc3R5bGUsIHtcbiAgICAgIG1pbmltdW1JbnRlZ2VyRGlnaXRzOiBtaW5JbnQsXG4gICAgICBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IG1pbkZyYWN0aW9uLFxuICAgICAgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiBtYXhGcmFjdGlvbixcbiAgICAgIGN1cnJlbmN5OiBjdXJyZW5jeSxcbiAgICAgIGN1cnJlbmN5QXNTeW1ib2w6IGN1cnJlbmN5QXNTeW1ib2xcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFdBUk5JTkc6IHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkuXG4gKiBUaGVyZWZvcmUgaXQgaXMgb25seSByZWxpYWJsZSBpbiBDaHJvbWUgYW5kIE9wZXJhIGJyb3dzZXJzLlxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgbG9jYWwgdGV4dC4gaS5lLiBncm91cCBzaXppbmcgYW5kIHNlcGFyYXRvciBhbmQgb3RoZXIgbG9jYWxlLXNwZWNpZmljXG4gKiBjb25maWd1cmF0aW9ucyBhcmUgYmFzZWQgb24gdGhlIGFjdGl2ZSBsb2NhbGUuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogICAgIGV4cHJlc3Npb24gfCBudW1iZXJbOmRpZ2l0SW5mb11cbiAqXG4gKiB3aGVyZSBgZXhwcmVzc2lvbmAgaXMgYSBudW1iZXIgYW5kIGBkaWdpdEluZm9gIGhhcyB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAqXG4gKiAgICAge21pbkludGVnZXJEaWdpdHN9LnttaW5GcmFjdGlvbkRpZ2l0c30te21heEZyYWN0aW9uRGlnaXRzfVxuICpcbiAqIC0gbWluSW50ZWdlckRpZ2l0cyBpcyB0aGUgbWluaW11bSBudW1iZXIgb2YgaW50ZWdlciBkaWdpdHMgdG8gdXNlLiBEZWZhdWx0cyB0byAxLlxuICogLSBtaW5GcmFjdGlvbkRpZ2l0cyBpcyB0aGUgbWluaW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIGZyYWN0aW9uLiBEZWZhdWx0cyB0byAwLlxuICogLSBtYXhGcmFjdGlvbkRpZ2l0cyBpcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIGZyYWN0aW9uLiBEZWZhdWx0cyB0byAzLlxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHRoZSBhY2NlcHRhYmxlIHJhbmdlIGZvciBlYWNoIG9mIHRoZXNlIG51bWJlcnMgYW5kIG90aGVyXG4gKiBkZXRhaWxzIHNlZSB5b3VyIG5hdGl2ZSBpbnRlcm5hdGlvbmFsaXphdGlvbiBsaWJyYXJ5LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvcGlwZXMvdHMvbnVtYmVyX3BpcGUvbnVtYmVyX3BpcGVfZXhhbXBsZS50cyByZWdpb249J051bWJlclBpcGUnfVxuICovXG5AQ09OU1QoKVxuQFBpcGUoe25hbWU6ICdudW1iZXInfSlcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEZWNpbWFsUGlwZSBleHRlbmRzIE51bWJlclBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGFyZ3M6IGFueVtdKTogc3RyaW5nIHtcbiAgICB2YXIgZGlnaXRzOiBzdHJpbmcgPSBMaXN0V3JhcHBlci5maXJzdChhcmdzKTtcbiAgICByZXR1cm4gTnVtYmVyUGlwZS5fZm9ybWF0KHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5EZWNpbWFsLCBkaWdpdHMpO1xuICB9XG59XG5cbi8qKlxuICogV0FSTklORzogdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSS5cbiAqIFRoZXJlZm9yZSBpdCBpcyBvbmx5IHJlbGlhYmxlIGluIENocm9tZSBhbmQgT3BlcmEgYnJvd3NlcnMuXG4gKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyBsb2NhbCBwZXJjZW50LlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqICAgICBleHByZXNzaW9uIHwgcGVyY2VudFs6ZGlnaXRJbmZvXVxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IGBkaWdpdEluZm9gIHNlZSB7QGxpbmsgRGVjaW1hbFBpcGV9XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9waXBlcy90cy9udW1iZXJfcGlwZS9udW1iZXJfcGlwZV9leGFtcGxlLnRzIHJlZ2lvbj0nUGVyY2VudFBpcGUnfVxuICovXG5AQ09OU1QoKVxuQFBpcGUoe25hbWU6ICdwZXJjZW50J30pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGVyY2VudFBpcGUgZXh0ZW5kcyBOdW1iZXJQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBhcmdzOiBhbnlbXSk6IHN0cmluZyB7XG4gICAgdmFyIGRpZ2l0czogc3RyaW5nID0gTGlzdFdyYXBwZXIuZmlyc3QoYXJncyk7XG4gICAgcmV0dXJuIE51bWJlclBpcGUuX2Zvcm1hdCh2YWx1ZSwgTnVtYmVyRm9ybWF0U3R5bGUuUGVyY2VudCwgZGlnaXRzKTtcbiAgfVxufVxuXG4vKipcbiAqIFdBUk5JTkc6IHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkuXG4gKiBUaGVyZWZvcmUgaXQgaXMgb25seSByZWxpYWJsZSBpbiBDaHJvbWUgYW5kIE9wZXJhIGJyb3dzZXJzLlxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgbG9jYWwgY3VycmVuY3kuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogICAgIGV4cHJlc3Npb24gfCBjdXJyZW5jeVs6Y3VycmVuY3lDb2RlWzpzeW1ib2xEaXNwbGF5WzpkaWdpdEluZm9dXV1cbiAqXG4gKiB3aGVyZSBgY3VycmVuY3lDb2RlYCBpcyB0aGUgSVNPIDQyMTcgY3VycmVuY3kgY29kZSwgc3VjaCBhcyBcIlVTRFwiIGZvciB0aGUgVVMgZG9sbGFyIGFuZFxuICogXCJFVVJcIiBmb3IgdGhlIGV1cm8uIGBzeW1ib2xEaXNwbGF5YCBpcyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRvIHVzZSB0aGUgY3VycmVuY3lcbiAqIHN5bWJvbCAoZS5nLiAkKSBvciB0aGUgY3VycmVuY3kgY29kZSAoZS5nLiBVU0QpIGluIHRoZSBvdXRwdXQuIFRoZSBkZWZhdWx0IGZvciB0aGlzIHZhbHVlXG4gKiBpcyBgZmFsc2VgLlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgYGRpZ2l0SW5mb2Agc2VlIHtAbGluayBEZWNpbWFsUGlwZX1cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3BpcGVzL3RzL251bWJlcl9waXBlL251bWJlcl9waXBlX2V4YW1wbGUudHMgcmVnaW9uPSdDdXJyZW5jeVBpcGUnfVxuICovXG5AQ09OU1QoKVxuQFBpcGUoe25hbWU6ICdjdXJyZW5jeSd9KVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEN1cnJlbmN5UGlwZSBleHRlbmRzIE51bWJlclBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGFyZ3M6IGFueVtdKTogc3RyaW5nIHtcbiAgICB2YXIgY3VycmVuY3lDb2RlOiBzdHJpbmcgPSBpc1ByZXNlbnQoYXJncykgJiYgYXJncy5sZW5ndGggPiAwID8gYXJnc1swXSA6ICdVU0QnO1xuICAgIHZhciBzeW1ib2xEaXNwbGF5OiBib29sZWFuID0gaXNQcmVzZW50KGFyZ3MpICYmIGFyZ3MubGVuZ3RoID4gMSA/IGFyZ3NbMV0gOiBmYWxzZTtcbiAgICB2YXIgZGlnaXRzOiBzdHJpbmcgPSBpc1ByZXNlbnQoYXJncykgJiYgYXJncy5sZW5ndGggPiAyID8gYXJnc1syXSA6IG51bGw7XG4gICAgcmV0dXJuIE51bWJlclBpcGUuX2Zvcm1hdCh2YWx1ZSwgTnVtYmVyRm9ybWF0U3R5bGUuQ3VycmVuY3ksIGRpZ2l0cywgY3VycmVuY3lDb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ltYm9sRGlzcGxheSk7XG4gIH1cbn1cbiJdfQ==