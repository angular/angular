var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isNumber, isPresent, isBlank, NumberWrapper, RegExpWrapper } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { NumberFormatter, NumberFormatStyle } from 'angular2/src/facade/intl';
import { Injectable, Pipe } from 'angular2/core';
import { InvalidPipeArgumentException } from './invalid_pipe_argument_exception';
var defaultLocale = 'en-US';
var _re = RegExpWrapper.create('^(\\d+)?\\.((\\d+)(\\-(\\d+))?)?$');
/**
 * Internal base class for numeric pipes.
 */
let NumberPipe_1;
export let NumberPipe = NumberPipe_1 = class NumberPipe {
    /** @internal */
    static _format(value, style, digits, currency = null, currencyAsSymbol = false) {
        if (isBlank(value))
            return null;
        if (!isNumber(value)) {
            throw new InvalidPipeArgumentException(NumberPipe_1, value);
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
NumberPipe = NumberPipe_1 = __decorate([
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
export let DecimalPipe = class DecimalPipe extends NumberPipe {
    transform(value, digits = null) {
        return NumberPipe._format(value, NumberFormatStyle.Decimal, digits);
    }
};
DecimalPipe = __decorate([
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
export let PercentPipe = class PercentPipe extends NumberPipe {
    transform(value, digits = null) {
        return NumberPipe._format(value, NumberFormatStyle.Percent, digits);
    }
};
PercentPipe = __decorate([
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
export let CurrencyPipe = class CurrencyPipe extends NumberPipe {
    transform(value, currencyCode = 'USD', symbolDisplay = false, digits = null) {
        return NumberPipe._format(value, NumberFormatStyle.Currency, digits, currencyCode, symbolDisplay);
    }
};
CurrencyPipe = __decorate([
    Pipe({ name: 'currency' }),
    Injectable(), 
    __metadata('design:paramtypes', [])
], CurrencyPipe);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvY29tbW9uL3BpcGVzL251bWJlcl9waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQ0wsUUFBUSxFQUNSLFNBQVMsRUFDVCxPQUFPLEVBRVAsYUFBYSxFQUNiLGFBQWEsRUFFZCxNQUFNLDBCQUEwQjtPQUMxQixFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FDdkUsRUFBQyxlQUFlLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSwwQkFBMEI7T0FDcEUsRUFBQyxVQUFVLEVBQStCLElBQUksRUFBQyxNQUFNLGVBQWU7T0FFcEUsRUFBQyw0QkFBNEIsRUFBQyxNQUFNLG1DQUFtQztBQUU5RSxJQUFJLGFBQWEsR0FBVyxPQUFPLENBQUM7QUFDcEMsSUFBSSxHQUFHLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0FBRXBFOztHQUVHO0FBRUg7O0lBQ0UsZ0JBQWdCO0lBQ2hCLE9BQU8sT0FBTyxDQUFDLEtBQWEsRUFBRSxLQUF3QixFQUFFLE1BQWMsRUFBRSxRQUFRLEdBQVcsSUFBSSxFQUNoRixnQkFBZ0IsR0FBWSxLQUFLO1FBQzlDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sSUFBSSw0QkFBNEIsQ0FBQyxZQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUNELElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxXQUFXLEdBQUcsQ0FBQyxFQUFFLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFDakQsRUFB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dXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzTnVtYmVyLFxuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFN0cmluZ1dyYXBwZXIsXG4gIE51bWJlcldyYXBwZXIsXG4gIFJlZ0V4cFdyYXBwZXIsXG4gIEZ1bmN0aW9uV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtOdW1iZXJGb3JtYXR0ZXIsIE51bWJlckZvcm1hdFN0eWxlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2ludGwnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBQaXBlVHJhbnNmb3JtLCBXcmFwcGVkVmFsdWUsIFBpcGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge0ludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb259IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2V4Y2VwdGlvbic7XG5cbnZhciBkZWZhdWx0TG9jYWxlOiBzdHJpbmcgPSAnZW4tVVMnO1xudmFyIF9yZSA9IFJlZ0V4cFdyYXBwZXIuY3JlYXRlKCdeKFxcXFxkKyk/XFxcXC4oKFxcXFxkKykoXFxcXC0oXFxcXGQrKSk/KT8kJyk7XG5cbi8qKlxuICogSW50ZXJuYWwgYmFzZSBjbGFzcyBmb3IgbnVtZXJpYyBwaXBlcy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE51bWJlclBpcGUge1xuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfZm9ybWF0KHZhbHVlOiBudW1iZXIsIHN0eWxlOiBOdW1iZXJGb3JtYXRTdHlsZSwgZGlnaXRzOiBzdHJpbmcsIGN1cnJlbmN5OiBzdHJpbmcgPSBudWxsLFxuICAgICAgICAgICAgICAgICBjdXJyZW5jeUFzU3ltYm9sOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xuICAgIGlmIChpc0JsYW5rKHZhbHVlKSkgcmV0dXJuIG51bGw7XG4gICAgaWYgKCFpc051bWJlcih2YWx1ZSkpIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9uKE51bWJlclBpcGUsIHZhbHVlKTtcbiAgICB9XG4gICAgdmFyIG1pbkludCA9IDEsIG1pbkZyYWN0aW9uID0gMCwgbWF4RnJhY3Rpb24gPSAzO1xuICAgIGlmIChpc1ByZXNlbnQoZGlnaXRzKSkge1xuICAgICAgdmFyIHBhcnRzID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKF9yZSwgZGlnaXRzKTtcbiAgICAgIGlmIChpc0JsYW5rKHBhcnRzKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgJHtkaWdpdHN9IGlzIG5vdCBhIHZhbGlkIGRpZ2l0IGluZm8gZm9yIG51bWJlciBwaXBlc2ApO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChwYXJ0c1sxXSkpIHsgIC8vIG1pbiBpbnRlZ2VyIGRpZ2l0c1xuICAgICAgICBtaW5JbnQgPSBOdW1iZXJXcmFwcGVyLnBhcnNlSW50QXV0b1JhZGl4KHBhcnRzWzFdKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQocGFydHNbM10pKSB7ICAvLyBtaW4gZnJhY3Rpb24gZGlnaXRzXG4gICAgICAgIG1pbkZyYWN0aW9uID0gTnVtYmVyV3JhcHBlci5wYXJzZUludEF1dG9SYWRpeChwYXJ0c1szXSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHBhcnRzWzVdKSkgeyAgLy8gbWF4IGZyYWN0aW9uIGRpZ2l0c1xuICAgICAgICBtYXhGcmFjdGlvbiA9IE51bWJlcldyYXBwZXIucGFyc2VJbnRBdXRvUmFkaXgocGFydHNbNV0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gTnVtYmVyRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSwgZGVmYXVsdExvY2FsZSwgc3R5bGUsIHtcbiAgICAgIG1pbmltdW1JbnRlZ2VyRGlnaXRzOiBtaW5JbnQsXG4gICAgICBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IG1pbkZyYWN0aW9uLFxuICAgICAgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiBtYXhGcmFjdGlvbixcbiAgICAgIGN1cnJlbmN5OiBjdXJyZW5jeSxcbiAgICAgIGN1cnJlbmN5QXNTeW1ib2w6IGN1cnJlbmN5QXNTeW1ib2xcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFdBUk5JTkc6IHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkuXG4gKiBUaGVyZWZvcmUgaXQgaXMgb25seSByZWxpYWJsZSBpbiBDaHJvbWUgYW5kIE9wZXJhIGJyb3dzZXJzLlxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgbG9jYWwgdGV4dC4gaS5lLiBncm91cCBzaXppbmcgYW5kIHNlcGFyYXRvciBhbmQgb3RoZXIgbG9jYWxlLXNwZWNpZmljXG4gKiBjb25maWd1cmF0aW9ucyBhcmUgYmFzZWQgb24gdGhlIGFjdGl2ZSBsb2NhbGUuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogICAgIGV4cHJlc3Npb24gfCBudW1iZXJbOmRpZ2l0SW5mb11cbiAqXG4gKiB3aGVyZSBgZXhwcmVzc2lvbmAgaXMgYSBudW1iZXIgYW5kIGBkaWdpdEluZm9gIGhhcyB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAqXG4gKiAgICAge21pbkludGVnZXJEaWdpdHN9LnttaW5GcmFjdGlvbkRpZ2l0c30te21heEZyYWN0aW9uRGlnaXRzfVxuICpcbiAqIC0gbWluSW50ZWdlckRpZ2l0cyBpcyB0aGUgbWluaW11bSBudW1iZXIgb2YgaW50ZWdlciBkaWdpdHMgdG8gdXNlLiBEZWZhdWx0cyB0byAxLlxuICogLSBtaW5GcmFjdGlvbkRpZ2l0cyBpcyB0aGUgbWluaW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIGZyYWN0aW9uLiBEZWZhdWx0cyB0byAwLlxuICogLSBtYXhGcmFjdGlvbkRpZ2l0cyBpcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgZGlnaXRzIGFmdGVyIGZyYWN0aW9uLiBEZWZhdWx0cyB0byAzLlxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHRoZSBhY2NlcHRhYmxlIHJhbmdlIGZvciBlYWNoIG9mIHRoZXNlIG51bWJlcnMgYW5kIG90aGVyXG4gKiBkZXRhaWxzIHNlZSB5b3VyIG5hdGl2ZSBpbnRlcm5hdGlvbmFsaXphdGlvbiBsaWJyYXJ5LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvcGlwZXMvdHMvbnVtYmVyX3BpcGUvbnVtYmVyX3BpcGVfZXhhbXBsZS50cyByZWdpb249J051bWJlclBpcGUnfVxuICovXG5AUGlwZSh7bmFtZTogJ251bWJlcid9KVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERlY2ltYWxQaXBlIGV4dGVuZHMgTnVtYmVyUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgZGlnaXRzOiBzdHJpbmcgPSBudWxsKTogc3RyaW5nIHtcbiAgICByZXR1cm4gTnVtYmVyUGlwZS5fZm9ybWF0KHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5EZWNpbWFsLCBkaWdpdHMpO1xuICB9XG59XG5cbi8qKlxuICogV0FSTklORzogdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSS5cbiAqIFRoZXJlZm9yZSBpdCBpcyBvbmx5IHJlbGlhYmxlIGluIENocm9tZSBhbmQgT3BlcmEgYnJvd3NlcnMuXG4gKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyBsb2NhbCBwZXJjZW50LlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqICAgICBleHByZXNzaW9uIHwgcGVyY2VudFs6ZGlnaXRJbmZvXVxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IGBkaWdpdEluZm9gIHNlZSB7QGxpbmsgRGVjaW1hbFBpcGV9XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9waXBlcy90cy9udW1iZXJfcGlwZS9udW1iZXJfcGlwZV9leGFtcGxlLnRzIHJlZ2lvbj0nUGVyY2VudFBpcGUnfVxuICovXG5AUGlwZSh7bmFtZTogJ3BlcmNlbnQnfSlcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQZXJjZW50UGlwZSBleHRlbmRzIE51bWJlclBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGRpZ2l0czogc3RyaW5nID0gbnVsbCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIE51bWJlclBpcGUuX2Zvcm1hdCh2YWx1ZSwgTnVtYmVyRm9ybWF0U3R5bGUuUGVyY2VudCwgZGlnaXRzKTtcbiAgfVxufVxuXG4vKipcbiAqIFdBUk5JTkc6IHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkuXG4gKiBUaGVyZWZvcmUgaXQgaXMgb25seSByZWxpYWJsZSBpbiBDaHJvbWUgYW5kIE9wZXJhIGJyb3dzZXJzLlxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgbG9jYWwgY3VycmVuY3kuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogICAgIGV4cHJlc3Npb24gfCBjdXJyZW5jeVs6Y3VycmVuY3lDb2RlWzpzeW1ib2xEaXNwbGF5WzpkaWdpdEluZm9dXV1cbiAqXG4gKiB3aGVyZSBgY3VycmVuY3lDb2RlYCBpcyB0aGUgSVNPIDQyMTcgY3VycmVuY3kgY29kZSwgc3VjaCBhcyBcIlVTRFwiIGZvciB0aGUgVVMgZG9sbGFyIGFuZFxuICogXCJFVVJcIiBmb3IgdGhlIGV1cm8uIGBzeW1ib2xEaXNwbGF5YCBpcyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRvIHVzZSB0aGUgY3VycmVuY3lcbiAqIHN5bWJvbCAoZS5nLiAkKSBvciB0aGUgY3VycmVuY3kgY29kZSAoZS5nLiBVU0QpIGluIHRoZSBvdXRwdXQuIFRoZSBkZWZhdWx0IGZvciB0aGlzIHZhbHVlXG4gKiBpcyBgZmFsc2VgLlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgYGRpZ2l0SW5mb2Agc2VlIHtAbGluayBEZWNpbWFsUGlwZX1cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3BpcGVzL3RzL251bWJlcl9waXBlL251bWJlcl9waXBlX2V4YW1wbGUudHMgcmVnaW9uPSdDdXJyZW5jeVBpcGUnfVxuICovXG5AUGlwZSh7bmFtZTogJ2N1cnJlbmN5J30pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ3VycmVuY3lQaXBlIGV4dGVuZHMgTnVtYmVyUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgY3VycmVuY3lDb2RlOiBzdHJpbmcgPSAnVVNEJywgc3ltYm9sRGlzcGxheTogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgICAgICAgZGlnaXRzOiBzdHJpbmcgPSBudWxsKTogc3RyaW5nIHtcbiAgICByZXR1cm4gTnVtYmVyUGlwZS5fZm9ybWF0KHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5DdXJyZW5jeSwgZGlnaXRzLCBjdXJyZW5jeUNvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2xEaXNwbGF5KTtcbiAgfVxufVxuIl19