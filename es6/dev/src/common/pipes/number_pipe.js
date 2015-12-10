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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL3BpcGVzL251bWJlcl9waXBlLnRzIl0sIm5hbWVzIjpbIk51bWJlclBpcGUiLCJOdW1iZXJQaXBlLl9mb3JtYXQiLCJEZWNpbWFsUGlwZSIsIkRlY2ltYWxQaXBlLnRyYW5zZm9ybSIsIlBlcmNlbnRQaXBlIiwiUGVyY2VudFBpcGUudHJhbnNmb3JtIiwiQ3VycmVuY3lQaXBlIiwiQ3VycmVuY3lQaXBlLnRyYW5zZm9ybSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUNMLFFBQVEsRUFDUixTQUFTLEVBQ1QsT0FBTyxFQUVQLGFBQWEsRUFDYixhQUFhLEVBQ2IsS0FBSyxFQUVOLE1BQU0sMEJBQTBCO09BQzFCLEVBQUMsYUFBYSxFQUFtQixNQUFNLGdDQUFnQztPQUN2RSxFQUFDLGVBQWUsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLDBCQUEwQjtPQUNwRSxFQUFDLFVBQVUsRUFBK0IsSUFBSSxFQUFDLE1BQU0sZUFBZTtPQUNwRSxFQUFDLFdBQVcsRUFBQyxNQUFNLGdDQUFnQztPQUVuRCxFQUFDLDRCQUE0QixFQUFDLE1BQU0sbUNBQW1DO0FBRTlFLElBQUksYUFBYSxHQUFXLE9BQU8sQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7QUFFcEU7O0dBRUc7QUFDSDtJQUdFQSxnQkFBZ0JBO0lBQ2hCQSxPQUFPQSxPQUFPQSxDQUFDQSxLQUFhQSxFQUFFQSxLQUF3QkEsRUFBRUEsTUFBY0EsRUFBRUEsUUFBUUEsR0FBV0EsSUFBSUEsRUFDaEZBLGdCQUFnQkEsR0FBWUEsS0FBS0E7UUFDOUNDLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2hDQSxFQUFFQSxDQUFDQSxDQUFDQSxD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O0FBWEQ7SUFBQyxLQUFLLEVBQUU7SUFDUCxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFDLENBQUM7SUFDeEIsVUFBVSxFQUFFOztpQkFTWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaXNOdW1iZXIsXG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgU3RyaW5nV3JhcHBlcixcbiAgTnVtYmVyV3JhcHBlcixcbiAgUmVnRXhwV3JhcHBlcixcbiAgQ09OU1QsXG4gIEZ1bmN0aW9uV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtOdW1iZXJGb3JtYXR0ZXIsIE51bWJlckZvcm1hdFN0eWxlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2ludGwnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBQaXBlVHJhbnNmb3JtLCBXcmFwcGVkVmFsdWUsIFBpcGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9ufSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9leGNlcHRpb24nO1xuXG52YXIgZGVmYXVsdExvY2FsZTogc3RyaW5nID0gJ2VuLVVTJztcbnZhciBfcmUgPSBSZWdFeHBXcmFwcGVyLmNyZWF0ZSgnXihcXFxcZCspP1xcXFwuKChcXFxcZCspKFxcXFwtKFxcXFxkKykpPyk/JCcpO1xuXG4vKipcbiAqIEludGVybmFsIGJhc2UgY2xhc3MgZm9yIG51bWVyaWMgcGlwZXMuXG4gKi9cbkBDT05TVCgpXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTnVtYmVyUGlwZSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc3RhdGljIF9mb3JtYXQodmFsdWU6IG51bWJlciwgc3R5bGU6IE51bWJlckZvcm1hdFN0eWxlLCBkaWdpdHM6IHN0cmluZywgY3VycmVuY3k6IHN0cmluZyA9IG51bGwsXG4gICAgICAgICAgICAgICAgIGN1cnJlbmN5QXNTeW1ib2w6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgaWYgKGlzQmxhbmsodmFsdWUpKSByZXR1cm4gbnVsbDtcbiAgICBpZiAoIWlzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb24oTnVtYmVyUGlwZSwgdmFsdWUpO1xuICAgIH1cbiAgICB2YXIgbWluSW50ID0gMSwgbWluRnJhY3Rpb24gPSAwLCBtYXhGcmFjdGlvbiA9IDM7XG4gICAgaWYgKGlzUHJlc2VudChkaWdpdHMpKSB7XG4gICAgICB2YXIgcGFydHMgPSBSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2goX3JlLCBkaWdpdHMpO1xuICAgICAgaWYgKGlzQmxhbmsocGFydHMpKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGAke2RpZ2l0c30gaXMgbm90IGEgdmFsaWQgZGlnaXQgaW5mbyBmb3IgbnVtYmVyIHBpcGVzYCk7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHBhcnRzWzFdKSkgeyAgLy8gbWluIGludGVnZXIgZGlnaXRzXG4gICAgICAgIG1pbkludCA9IE51bWJlcldyYXBwZXIucGFyc2VJbnRBdXRvUmFkaXgocGFydHNbMV0pO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChwYXJ0c1szXSkpIHsgIC8vIG1pbiBmcmFjdGlvbiBkaWdpdHNcbiAgICAgICAgbWluRnJhY3Rpb24gPSBOdW1iZXJXcmFwcGVyLnBhcnNlSW50QXV0b1JhZGl4KHBhcnRzWzNdKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQocGFydHNbNV0pKSB7ICAvLyBtYXggZnJhY3Rpb24gZGlnaXRzXG4gICAgICAgIG1heEZyYWN0aW9uID0gTnVtYmVyV3JhcHBlci5wYXJzZUludEF1dG9SYWRpeChwYXJ0c1s1XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBOdW1iZXJGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlLCBkZWZhdWx0TG9jYWxlLCBzdHlsZSwge1xuICAgICAgbWluaW11bUludGVnZXJEaWdpdHM6IG1pbkludCxcbiAgICAgIG1pbmltdW1GcmFjdGlvbkRpZ2l0czogbWluRnJhY3Rpb24sXG4gICAgICBtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IG1heEZyYWN0aW9uLFxuICAgICAgY3VycmVuY3k6IGN1cnJlbmN5LFxuICAgICAgY3VycmVuY3lBc1N5bWJvbDogY3VycmVuY3lBc1N5bWJvbFxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogV0FSTklORzogdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSS5cbiAqIFRoZXJlZm9yZSBpdCBpcyBvbmx5IHJlbGlhYmxlIGluIENocm9tZSBhbmQgT3BlcmEgYnJvd3NlcnMuXG4gKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyBsb2NhbCB0ZXh0LiBpLmUuIGdyb3VwIHNpemluZyBhbmQgc2VwYXJhdG9yIGFuZCBvdGhlciBsb2NhbGUtc3BlY2lmaWNcbiAqIGNvbmZpZ3VyYXRpb25zIGFyZSBiYXNlZCBvbiB0aGUgYWN0aXZlIGxvY2FsZS5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiAgICAgZXhwcmVzc2lvbiB8IG51bWJlcls6ZGlnaXRJbmZvXVxuICpcbiAqIHdoZXJlIGBleHByZXNzaW9uYCBpcyBhIG51bWJlciBhbmQgYGRpZ2l0SW5mb2AgaGFzIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICpcbiAqICAgICB7bWluSW50ZWdlckRpZ2l0c30ue21pbkZyYWN0aW9uRGlnaXRzfS17bWF4RnJhY3Rpb25EaWdpdHN9XG4gKlxuICogLSBtaW5JbnRlZ2VyRGlnaXRzIGlzIHRoZSBtaW5pbXVtIG51bWJlciBvZiBpbnRlZ2VyIGRpZ2l0cyB0byB1c2UuIERlZmF1bHRzIHRvIDEuXG4gKiAtIG1pbkZyYWN0aW9uRGlnaXRzIGlzIHRoZSBtaW5pbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgZnJhY3Rpb24uIERlZmF1bHRzIHRvIDAuXG4gKiAtIG1heEZyYWN0aW9uRGlnaXRzIGlzIHRoZSBtYXhpbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgZnJhY3Rpb24uIERlZmF1bHRzIHRvIDMuXG4gKlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlIGFjY2VwdGFibGUgcmFuZ2UgZm9yIGVhY2ggb2YgdGhlc2UgbnVtYmVycyBhbmQgb3RoZXJcbiAqIGRldGFpbHMgc2VlIHlvdXIgbmF0aXZlIGludGVybmF0aW9uYWxpemF0aW9uIGxpYnJhcnkuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9waXBlcy90cy9udW1iZXJfcGlwZS9udW1iZXJfcGlwZV9leGFtcGxlLnRzIHJlZ2lvbj0nTnVtYmVyUGlwZSd9XG4gKi9cbkBDT05TVCgpXG5AUGlwZSh7bmFtZTogJ251bWJlcid9KVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERlY2ltYWxQaXBlIGV4dGVuZHMgTnVtYmVyUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgYXJnczogYW55W10pOiBzdHJpbmcge1xuICAgIHZhciBkaWdpdHM6IHN0cmluZyA9IExpc3RXcmFwcGVyLmZpcnN0KGFyZ3MpO1xuICAgIHJldHVybiBOdW1iZXJQaXBlLl9mb3JtYXQodmFsdWUsIE51bWJlckZvcm1hdFN0eWxlLkRlY2ltYWwsIGRpZ2l0cyk7XG4gIH1cbn1cblxuLyoqXG4gKiBXQVJOSU5HOiB0aGlzIHBpcGUgdXNlcyB0aGUgSW50ZXJuYXRpb25hbGl6YXRpb24gQVBJLlxuICogVGhlcmVmb3JlIGl0IGlzIG9ubHkgcmVsaWFibGUgaW4gQ2hyb21lIGFuZCBPcGVyYSBicm93c2Vycy5cbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIGxvY2FsIHBlcmNlbnQuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogICAgIGV4cHJlc3Npb24gfCBwZXJjZW50WzpkaWdpdEluZm9dXG4gKlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgYGRpZ2l0SW5mb2Agc2VlIHtAbGluayBEZWNpbWFsUGlwZX1cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3BpcGVzL3RzL251bWJlcl9waXBlL251bWJlcl9waXBlX2V4YW1wbGUudHMgcmVnaW9uPSdQZXJjZW50UGlwZSd9XG4gKi9cbkBDT05TVCgpXG5AUGlwZSh7bmFtZTogJ3BlcmNlbnQnfSlcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQZXJjZW50UGlwZSBleHRlbmRzIE51bWJlclBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGFyZ3M6IGFueVtdKTogc3RyaW5nIHtcbiAgICB2YXIgZGlnaXRzOiBzdHJpbmcgPSBMaXN0V3JhcHBlci5maXJzdChhcmdzKTtcbiAgICByZXR1cm4gTnVtYmVyUGlwZS5fZm9ybWF0KHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5QZXJjZW50LCBkaWdpdHMpO1xuICB9XG59XG5cbi8qKlxuICogV0FSTklORzogdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSS5cbiAqIFRoZXJlZm9yZSBpdCBpcyBvbmx5IHJlbGlhYmxlIGluIENocm9tZSBhbmQgT3BlcmEgYnJvd3NlcnMuXG4gKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyBsb2NhbCBjdXJyZW5jeS5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiAgICAgZXhwcmVzc2lvbiB8IGN1cnJlbmN5WzpjdXJyZW5jeUNvZGVbOnN5bWJvbERpc3BsYXlbOmRpZ2l0SW5mb11dXVxuICpcbiAqIHdoZXJlIGBjdXJyZW5jeUNvZGVgIGlzIHRoZSBJU08gNDIxNyBjdXJyZW5jeSBjb2RlLCBzdWNoIGFzIFwiVVNEXCIgZm9yIHRoZSBVUyBkb2xsYXIgYW5kXG4gKiBcIkVVUlwiIGZvciB0aGUgZXVyby4gYHN5bWJvbERpc3BsYXlgIGlzIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gdXNlIHRoZSBjdXJyZW5jeVxuICogc3ltYm9sIChlLmcuICQpIG9yIHRoZSBjdXJyZW5jeSBjb2RlIChlLmcuIFVTRCkgaW4gdGhlIG91dHB1dC4gVGhlIGRlZmF1bHQgZm9yIHRoaXMgdmFsdWVcbiAqIGlzIGBmYWxzZWAuXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCBgZGlnaXRJbmZvYCBzZWUge0BsaW5rIERlY2ltYWxQaXBlfVxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvcGlwZXMvdHMvbnVtYmVyX3BpcGUvbnVtYmVyX3BpcGVfZXhhbXBsZS50cyByZWdpb249J0N1cnJlbmN5UGlwZSd9XG4gKi9cbkBDT05TVCgpXG5AUGlwZSh7bmFtZTogJ2N1cnJlbmN5J30pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ3VycmVuY3lQaXBlIGV4dGVuZHMgTnVtYmVyUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgYXJnczogYW55W10pOiBzdHJpbmcge1xuICAgIHZhciBjdXJyZW5jeUNvZGU6IHN0cmluZyA9IGlzUHJlc2VudChhcmdzKSAmJiBhcmdzLmxlbmd0aCA+IDAgPyBhcmdzWzBdIDogJ1VTRCc7XG4gICAgdmFyIHN5bWJvbERpc3BsYXk6IGJvb2xlYW4gPSBpc1ByZXNlbnQoYXJncykgJiYgYXJncy5sZW5ndGggPiAxID8gYXJnc1sxXSA6IGZhbHNlO1xuICAgIHZhciBkaWdpdHM6IHN0cmluZyA9IGlzUHJlc2VudChhcmdzKSAmJiBhcmdzLmxlbmd0aCA+IDIgPyBhcmdzWzJdIDogbnVsbDtcbiAgICByZXR1cm4gTnVtYmVyUGlwZS5fZm9ybWF0KHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5DdXJyZW5jeSwgZGlnaXRzLCBjdXJyZW5jeUNvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2xEaXNwbGF5KTtcbiAgfVxufVxuIl19