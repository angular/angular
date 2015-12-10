'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var exceptions_1 = require('angular2/src/facade/exceptions');
var intl_1 = require('angular2/src/facade/intl');
var core_1 = require('angular2/core');
var collection_1 = require('angular2/src/facade/collection');
var invalid_pipe_argument_exception_1 = require('./invalid_pipe_argument_exception');
var defaultLocale = 'en-US';
var _re = lang_1.RegExpWrapper.create('^(\\d+)?\\.((\\d+)(\\-(\\d+))?)?$');
/**
 * Internal base class for numeric pipes.
 */
var NumberPipe = (function () {
    function NumberPipe() {
    }
    /** @internal */
    NumberPipe._format = function (value, style, digits, currency, currencyAsSymbol) {
        if (currency === void 0) { currency = null; }
        if (currencyAsSymbol === void 0) { currencyAsSymbol = false; }
        if (lang_1.isBlank(value))
            return null;
        if (!lang_1.isNumber(value)) {
            throw new invalid_pipe_argument_exception_1.InvalidPipeArgumentException(NumberPipe, value);
        }
        var minInt = 1, minFraction = 0, maxFraction = 3;
        if (lang_1.isPresent(digits)) {
            var parts = lang_1.RegExpWrapper.firstMatch(_re, digits);
            if (lang_1.isBlank(parts)) {
                throw new exceptions_1.BaseException(digits + " is not a valid digit info for number pipes");
            }
            if (lang_1.isPresent(parts[1])) {
                minInt = lang_1.NumberWrapper.parseIntAutoRadix(parts[1]);
            }
            if (lang_1.isPresent(parts[3])) {
                minFraction = lang_1.NumberWrapper.parseIntAutoRadix(parts[3]);
            }
            if (lang_1.isPresent(parts[5])) {
                maxFraction = lang_1.NumberWrapper.parseIntAutoRadix(parts[5]);
            }
        }
        return intl_1.NumberFormatter.format(value, defaultLocale, style, {
            minimumIntegerDigits: minInt,
            minimumFractionDigits: minFraction,
            maximumFractionDigits: maxFraction,
            currency: currency,
            currencyAsSymbol: currencyAsSymbol
        });
    };
    NumberPipe = __decorate([
        lang_1.CONST(),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], NumberPipe);
    return NumberPipe;
})();
exports.NumberPipe = NumberPipe;
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
var DecimalPipe = (function (_super) {
    __extends(DecimalPipe, _super);
    function DecimalPipe() {
        _super.apply(this, arguments);
    }
    DecimalPipe.prototype.transform = function (value, args) {
        var digits = collection_1.ListWrapper.first(args);
        return NumberPipe._format(value, intl_1.NumberFormatStyle.Decimal, digits);
    };
    DecimalPipe = __decorate([
        lang_1.CONST(),
        core_1.Pipe({ name: 'number' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DecimalPipe);
    return DecimalPipe;
})(NumberPipe);
exports.DecimalPipe = DecimalPipe;
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
var PercentPipe = (function (_super) {
    __extends(PercentPipe, _super);
    function PercentPipe() {
        _super.apply(this, arguments);
    }
    PercentPipe.prototype.transform = function (value, args) {
        var digits = collection_1.ListWrapper.first(args);
        return NumberPipe._format(value, intl_1.NumberFormatStyle.Percent, digits);
    };
    PercentPipe = __decorate([
        lang_1.CONST(),
        core_1.Pipe({ name: 'percent' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PercentPipe);
    return PercentPipe;
})(NumberPipe);
exports.PercentPipe = PercentPipe;
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
var CurrencyPipe = (function (_super) {
    __extends(CurrencyPipe, _super);
    function CurrencyPipe() {
        _super.apply(this, arguments);
    }
    CurrencyPipe.prototype.transform = function (value, args) {
        var currencyCode = lang_1.isPresent(args) && args.length > 0 ? args[0] : 'USD';
        var symbolDisplay = lang_1.isPresent(args) && args.length > 1 ? args[1] : false;
        var digits = lang_1.isPresent(args) && args.length > 2 ? args[2] : null;
        return NumberPipe._format(value, intl_1.NumberFormatStyle.Currency, digits, currencyCode, symbolDisplay);
    };
    CurrencyPipe = __decorate([
        lang_1.CONST(),
        core_1.Pipe({ name: 'currency' }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], CurrencyPipe);
    return CurrencyPipe;
})(NumberPipe);
exports.CurrencyPipe = CurrencyPipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL3BpcGVzL251bWJlcl9waXBlLnRzIl0sIm5hbWVzIjpbIk51bWJlclBpcGUiLCJOdW1iZXJQaXBlLmNvbnN0cnVjdG9yIiwiTnVtYmVyUGlwZS5fZm9ybWF0IiwiRGVjaW1hbFBpcGUiLCJEZWNpbWFsUGlwZS5jb25zdHJ1Y3RvciIsIkRlY2ltYWxQaXBlLnRyYW5zZm9ybSIsIlBlcmNlbnRQaXBlIiwiUGVyY2VudFBpcGUuY29uc3RydWN0b3IiLCJQZXJjZW50UGlwZS50cmFuc2Zvcm0iLCJDdXJyZW5jeVBpcGUiLCJDdXJyZW5jeVBpcGUuY29uc3RydWN0b3IiLCJDdXJyZW5jeVBpcGUudHJhbnNmb3JtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHFCQVNPLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UscUJBQWlELDBCQUEwQixDQUFDLENBQUE7QUFDNUUscUJBQTRELGVBQWUsQ0FBQyxDQUFBO0FBQzVFLDJCQUEwQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTNELGdEQUEyQyxtQ0FBbUMsQ0FBQyxDQUFBO0FBRS9FLElBQUksYUFBYSxHQUFXLE9BQU8sQ0FBQztBQUNwQyxJQUFJLEdBQUcsR0FBRyxvQkFBYSxDQUFDLE1BQU0sQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0FBRXBFOztHQUVHO0FBQ0g7SUFBQUE7SUFrQ0FDLENBQUNBO0lBL0JDRCxnQkFBZ0JBO0lBQ1RBLGtCQUFPQSxHQUFkQSxVQUFlQSxLQUFhQSxFQUFFQSxLQUF3QkEsRUFBRUEsTUFBY0EsRUFBRUEsUUFBdUJBLEVBQ2hGQSxnQkFBaUNBO1FBRHdCRSx3QkFBdUJBLEdBQXZCQSxlQUF1QkE7UUFDaEZBLGdDQUFpQ0EsR0FBakNBLHdCQUFpQ0E7UUFDOUNBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLEtBQUtB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aEZBLElBQUlBLGFBQWFBLEdBQVlBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUNsRkEsSUFBSUEsTUFBTUEsR0FBV0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3pFQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxFQUFFQSx3QkFBaUJBLENBQUNBLFFBQVFBLEVBQUVBLE1BQU1BLEVBQUVBLFlBQVlBLEVBQ3ZEQSxhQUFhQSxDQUFDQSxDQUFDQTtJQUMzQ0EsQ0FBQ0E7SUFWSEY7UUFBQ0EsWUFBS0EsRUFBRUE7UUFDUEEsV0FBSUEsQ0FBQ0EsRUFBQ0EsSUFBSUEsRUFBRUEsVUFBVUEsRUFBQ0EsQ0FBQ0E7UUFDeEJBLGlCQUFVQSxFQUFFQTs7cUJBU1pBO0lBQURBLG1CQUFDQTtBQUFEQSxDQUFDQSxBQVhELEVBR2tDLFVBQVUsRUFRM0M7QUFSWSxvQkFBWSxlQVF4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaXNOdW1iZXIsXG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgU3RyaW5nV3JhcHBlcixcbiAgTnVtYmVyV3JhcHBlcixcbiAgUmVnRXhwV3JhcHBlcixcbiAgQ09OU1QsXG4gIEZ1bmN0aW9uV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtOdW1iZXJGb3JtYXR0ZXIsIE51bWJlckZvcm1hdFN0eWxlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2ludGwnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBQaXBlVHJhbnNmb3JtLCBXcmFwcGVkVmFsdWUsIFBpcGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtJbnZhbGlkUGlwZUFyZ3VtZW50RXhjZXB0aW9ufSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9leGNlcHRpb24nO1xuXG52YXIgZGVmYXVsdExvY2FsZTogc3RyaW5nID0gJ2VuLVVTJztcbnZhciBfcmUgPSBSZWdFeHBXcmFwcGVyLmNyZWF0ZSgnXihcXFxcZCspP1xcXFwuKChcXFxcZCspKFxcXFwtKFxcXFxkKykpPyk/JCcpO1xuXG4vKipcbiAqIEludGVybmFsIGJhc2UgY2xhc3MgZm9yIG51bWVyaWMgcGlwZXMuXG4gKi9cbkBDT05TVCgpXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTnVtYmVyUGlwZSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc3RhdGljIF9mb3JtYXQodmFsdWU6IG51bWJlciwgc3R5bGU6IE51bWJlckZvcm1hdFN0eWxlLCBkaWdpdHM6IHN0cmluZywgY3VycmVuY3k6IHN0cmluZyA9IG51bGwsXG4gICAgICAgICAgICAgICAgIGN1cnJlbmN5QXNTeW1ib2w6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgaWYgKGlzQmxhbmsodmFsdWUpKSByZXR1cm4gbnVsbDtcbiAgICBpZiAoIWlzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgdGhyb3cgbmV3IEludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb24oTnVtYmVyUGlwZSwgdmFsdWUpO1xuICAgIH1cbiAgICB2YXIgbWluSW50ID0gMSwgbWluRnJhY3Rpb24gPSAwLCBtYXhGcmFjdGlvbiA9IDM7XG4gICAgaWYgKGlzUHJlc2VudChkaWdpdHMpKSB7XG4gICAgICB2YXIgcGFydHMgPSBSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2goX3JlLCBkaWdpdHMpO1xuICAgICAgaWYgKGlzQmxhbmsocGFydHMpKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGAke2RpZ2l0c30gaXMgbm90IGEgdmFsaWQgZGlnaXQgaW5mbyBmb3IgbnVtYmVyIHBpcGVzYCk7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHBhcnRzWzFdKSkgeyAgLy8gbWluIGludGVnZXIgZGlnaXRzXG4gICAgICAgIG1pbkludCA9IE51bWJlcldyYXBwZXIucGFyc2VJbnRBdXRvUmFkaXgocGFydHNbMV0pO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChwYXJ0c1szXSkpIHsgIC8vIG1pbiBmcmFjdGlvbiBkaWdpdHNcbiAgICAgICAgbWluRnJhY3Rpb24gPSBOdW1iZXJXcmFwcGVyLnBhcnNlSW50QXV0b1JhZGl4KHBhcnRzWzNdKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQocGFydHNbNV0pKSB7ICAvLyBtYXggZnJhY3Rpb24gZGlnaXRzXG4gICAgICAgIG1heEZyYWN0aW9uID0gTnVtYmVyV3JhcHBlci5wYXJzZUludEF1dG9SYWRpeChwYXJ0c1s1XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBOdW1iZXJGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlLCBkZWZhdWx0TG9jYWxlLCBzdHlsZSwge1xuICAgICAgbWluaW11bUludGVnZXJEaWdpdHM6IG1pbkludCxcbiAgICAgIG1pbmltdW1GcmFjdGlvbkRpZ2l0czogbWluRnJhY3Rpb24sXG4gICAgICBtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IG1heEZyYWN0aW9uLFxuICAgICAgY3VycmVuY3k6IGN1cnJlbmN5LFxuICAgICAgY3VycmVuY3lBc1N5bWJvbDogY3VycmVuY3lBc1N5bWJvbFxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogV0FSTklORzogdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSS5cbiAqIFRoZXJlZm9yZSBpdCBpcyBvbmx5IHJlbGlhYmxlIGluIENocm9tZSBhbmQgT3BlcmEgYnJvd3NlcnMuXG4gKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyBsb2NhbCB0ZXh0LiBpLmUuIGdyb3VwIHNpemluZyBhbmQgc2VwYXJhdG9yIGFuZCBvdGhlciBsb2NhbGUtc3BlY2lmaWNcbiAqIGNvbmZpZ3VyYXRpb25zIGFyZSBiYXNlZCBvbiB0aGUgYWN0aXZlIGxvY2FsZS5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiAgICAgZXhwcmVzc2lvbiB8IG51bWJlcls6ZGlnaXRJbmZvXVxuICpcbiAqIHdoZXJlIGBleHByZXNzaW9uYCBpcyBhIG51bWJlciBhbmQgYGRpZ2l0SW5mb2AgaGFzIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICpcbiAqICAgICB7bWluSW50ZWdlckRpZ2l0c30ue21pbkZyYWN0aW9uRGlnaXRzfS17bWF4RnJhY3Rpb25EaWdpdHN9XG4gKlxuICogLSBtaW5JbnRlZ2VyRGlnaXRzIGlzIHRoZSBtaW5pbXVtIG51bWJlciBvZiBpbnRlZ2VyIGRpZ2l0cyB0byB1c2UuIERlZmF1bHRzIHRvIDEuXG4gKiAtIG1pbkZyYWN0aW9uRGlnaXRzIGlzIHRoZSBtaW5pbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgZnJhY3Rpb24uIERlZmF1bHRzIHRvIDAuXG4gKiAtIG1heEZyYWN0aW9uRGlnaXRzIGlzIHRoZSBtYXhpbXVtIG51bWJlciBvZiBkaWdpdHMgYWZ0ZXIgZnJhY3Rpb24uIERlZmF1bHRzIHRvIDMuXG4gKlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhlIGFjY2VwdGFibGUgcmFuZ2UgZm9yIGVhY2ggb2YgdGhlc2UgbnVtYmVycyBhbmQgb3RoZXJcbiAqIGRldGFpbHMgc2VlIHlvdXIgbmF0aXZlIGludGVybmF0aW9uYWxpemF0aW9uIGxpYnJhcnkuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9waXBlcy90cy9udW1iZXJfcGlwZS9udW1iZXJfcGlwZV9leGFtcGxlLnRzIHJlZ2lvbj0nTnVtYmVyUGlwZSd9XG4gKi9cbkBDT05TVCgpXG5AUGlwZSh7bmFtZTogJ251bWJlcid9KVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERlY2ltYWxQaXBlIGV4dGVuZHMgTnVtYmVyUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgYXJnczogYW55W10pOiBzdHJpbmcge1xuICAgIHZhciBkaWdpdHM6IHN0cmluZyA9IExpc3RXcmFwcGVyLmZpcnN0KGFyZ3MpO1xuICAgIHJldHVybiBOdW1iZXJQaXBlLl9mb3JtYXQodmFsdWUsIE51bWJlckZvcm1hdFN0eWxlLkRlY2ltYWwsIGRpZ2l0cyk7XG4gIH1cbn1cblxuLyoqXG4gKiBXQVJOSU5HOiB0aGlzIHBpcGUgdXNlcyB0aGUgSW50ZXJuYXRpb25hbGl6YXRpb24gQVBJLlxuICogVGhlcmVmb3JlIGl0IGlzIG9ubHkgcmVsaWFibGUgaW4gQ2hyb21lIGFuZCBPcGVyYSBicm93c2Vycy5cbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIGxvY2FsIHBlcmNlbnQuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogICAgIGV4cHJlc3Npb24gfCBwZXJjZW50WzpkaWdpdEluZm9dXG4gKlxuICogRm9yIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgYGRpZ2l0SW5mb2Agc2VlIHtAbGluayBEZWNpbWFsUGlwZX1cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3BpcGVzL3RzL251bWJlcl9waXBlL251bWJlcl9waXBlX2V4YW1wbGUudHMgcmVnaW9uPSdQZXJjZW50UGlwZSd9XG4gKi9cbkBDT05TVCgpXG5AUGlwZSh7bmFtZTogJ3BlcmNlbnQnfSlcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQZXJjZW50UGlwZSBleHRlbmRzIE51bWJlclBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGFyZ3M6IGFueVtdKTogc3RyaW5nIHtcbiAgICB2YXIgZGlnaXRzOiBzdHJpbmcgPSBMaXN0V3JhcHBlci5maXJzdChhcmdzKTtcbiAgICByZXR1cm4gTnVtYmVyUGlwZS5fZm9ybWF0KHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5QZXJjZW50LCBkaWdpdHMpO1xuICB9XG59XG5cbi8qKlxuICogV0FSTklORzogdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSS5cbiAqIFRoZXJlZm9yZSBpdCBpcyBvbmx5IHJlbGlhYmxlIGluIENocm9tZSBhbmQgT3BlcmEgYnJvd3NlcnMuXG4gKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyBsb2NhbCBjdXJyZW5jeS5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiAgICAgZXhwcmVzc2lvbiB8IGN1cnJlbmN5WzpjdXJyZW5jeUNvZGVbOnN5bWJvbERpc3BsYXlbOmRpZ2l0SW5mb11dXVxuICpcbiAqIHdoZXJlIGBjdXJyZW5jeUNvZGVgIGlzIHRoZSBJU08gNDIxNyBjdXJyZW5jeSBjb2RlLCBzdWNoIGFzIFwiVVNEXCIgZm9yIHRoZSBVUyBkb2xsYXIgYW5kXG4gKiBcIkVVUlwiIGZvciB0aGUgZXVyby4gYHN5bWJvbERpc3BsYXlgIGlzIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gdXNlIHRoZSBjdXJyZW5jeVxuICogc3ltYm9sIChlLmcuICQpIG9yIHRoZSBjdXJyZW5jeSBjb2RlIChlLmcuIFVTRCkgaW4gdGhlIG91dHB1dC4gVGhlIGRlZmF1bHQgZm9yIHRoaXMgdmFsdWVcbiAqIGlzIGBmYWxzZWAuXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCBgZGlnaXRJbmZvYCBzZWUge0BsaW5rIERlY2ltYWxQaXBlfVxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvcGlwZXMvdHMvbnVtYmVyX3BpcGUvbnVtYmVyX3BpcGVfZXhhbXBsZS50cyByZWdpb249J0N1cnJlbmN5UGlwZSd9XG4gKi9cbkBDT05TVCgpXG5AUGlwZSh7bmFtZTogJ2N1cnJlbmN5J30pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ3VycmVuY3lQaXBlIGV4dGVuZHMgTnVtYmVyUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgYXJnczogYW55W10pOiBzdHJpbmcge1xuICAgIHZhciBjdXJyZW5jeUNvZGU6IHN0cmluZyA9IGlzUHJlc2VudChhcmdzKSAmJiBhcmdzLmxlbmd0aCA+IDAgPyBhcmdzWzBdIDogJ1VTRCc7XG4gICAgdmFyIHN5bWJvbERpc3BsYXk6IGJvb2xlYW4gPSBpc1ByZXNlbnQoYXJncykgJiYgYXJncy5sZW5ndGggPiAxID8gYXJnc1sxXSA6IGZhbHNlO1xuICAgIHZhciBkaWdpdHM6IHN0cmluZyA9IGlzUHJlc2VudChhcmdzKSAmJiBhcmdzLmxlbmd0aCA+IDIgPyBhcmdzWzJdIDogbnVsbDtcbiAgICByZXR1cm4gTnVtYmVyUGlwZS5fZm9ybWF0KHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5DdXJyZW5jeSwgZGlnaXRzLCBjdXJyZW5jeUNvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeW1ib2xEaXNwbGF5KTtcbiAgfVxufVxuIl19