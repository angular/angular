'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL3BpcGVzL251bWJlcl9waXBlLnRzIl0sIm5hbWVzIjpbIk51bWJlclBpcGUiLCJOdW1iZXJQaXBlLmNvbnN0cnVjdG9yIiwiTnVtYmVyUGlwZS5fZm9ybWF0IiwiRGVjaW1hbFBpcGUiLCJEZWNpbWFsUGlwZS5jb25zdHJ1Y3RvciIsIkRlY2ltYWxQaXBlLnRyYW5zZm9ybSIsIlBlcmNlbnRQaXBlIiwiUGVyY2VudFBpcGUuY29uc3RydWN0b3IiLCJQZXJjZW50UGlwZS50cmFuc2Zvcm0iLCJDdXJyZW5jeVBpcGUiLCJDdXJyZW5jeVBpcGUuY29uc3RydWN0b3IiLCJDdXJyZW5jeVBpcGUudHJhbnNmb3JtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUJBU08sMEJBQTBCLENBQUMsQ0FBQTtBQUNsQywyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRSxxQkFBaUQsMEJBQTBCLENBQUMsQ0FBQTtBQUM1RSxxQkFBNEQsZUFBZSxDQUFDLENBQUE7QUFDNUUsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFFM0QsZ0RBQTJDLG1DQUFtQyxDQUFDLENBQUE7QUFFL0UsSUFBSSxhQUFhLEdBQVcsT0FBTyxDQUFDO0FBQ3BDLElBQUksR0FBRyxHQUFHLG9CQUFhLENBQUMsTUFBTSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7QUFFcEU7O0dBRUc7QUFDSDtJQUFBQTtJQWtDQUMsQ0FBQ0E7SUEvQkNELGdCQUFnQkE7SUFDVEEsa0JBQU9BLEdBQWRBLFVBQWVBLEtBQWFBLEVBQUVBLEtBQXdCQSxFQUFFQSxNQUFjQSxFQUFFQSxRQUF1QkEsRUFDaEZBLGdCQUFpQ0E7UUFEd0JFLHdCQUF1QkEsR0FBdkJBLGVBQXVCQTtRQUNoRkEsZ0NBQWlDQSxHQUFqQ0Esd0JBQWlDQTtRQUM5Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsS0FB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QUNoRkEsSUFBSUEsYUFBYUEsR0FBWUEsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ2xGQSxJQUFJQSxNQUFNQSxHQUFXQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDekVBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLEVBQUVBLHdCQUFpQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsTUFBTUEsRUFBRUEsWUFBWUEsRUFDdkRBLGFBQWFBLENBQUNBLENBQUNBO0lBQzNDQSxDQUFDQTtJQVZIRjtRQUFDQSxZQUFLQSxFQUFFQTtRQUNQQSxXQUFJQSxDQUFDQSxFQUFDQSxJQUFJQSxFQUFFQSxVQUFVQSxFQUFDQSxDQUFDQTtRQUN4QkEsaUJBQVVBLEVBQUVBOztxQkFTWkE7SUFBREEsbUJBQUNBO0FBQURBLENBQUNBLEFBWEQsRUFHa0MsVUFBVSxFQVEzQztBQVJZLG9CQUFZLGVBUXhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBpc051bWJlcixcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBTdHJpbmdXcmFwcGVyLFxuICBOdW1iZXJXcmFwcGVyLFxuICBSZWdFeHBXcmFwcGVyLFxuICBDT05TVCxcbiAgRnVuY3Rpb25XcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge051bWJlckZvcm1hdHRlciwgTnVtYmVyRm9ybWF0U3R5bGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvaW50bCc7XG5pbXBvcnQge0luamVjdGFibGUsIFBpcGVUcmFuc2Zvcm0sIFdyYXBwZWRWYWx1ZSwgUGlwZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge0ludmFsaWRQaXBlQXJndW1lbnRFeGNlcHRpb259IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2V4Y2VwdGlvbic7XG5cbnZhciBkZWZhdWx0TG9jYWxlOiBzdHJpbmcgPSAnZW4tVVMnO1xudmFyIF9yZSA9IFJlZ0V4cFdyYXBwZXIuY3JlYXRlKCdeKFxcXFxkKyk/XFxcXC4oKFxcXFxkKykoXFxcXC0oXFxcXGQrKSk/KT8kJyk7XG5cbi8qKlxuICogSW50ZXJuYWwgYmFzZSBjbGFzcyBmb3IgbnVtZXJpYyBwaXBlcy5cbiAqL1xuQENPTlNUKClcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOdW1iZXJQaXBlIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX2Zvcm1hdCh2YWx1ZTogbnVtYmVyLCBzdHlsZTogTnVtYmVyRm9ybWF0U3R5bGUsIGRpZ2l0czogc3RyaW5nLCBjdXJyZW5jeTogc3RyaW5nID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgY3VycmVuY3lBc1N5bWJvbDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICBpZiAoaXNCbGFuayh2YWx1ZSkpIHJldHVybiBudWxsO1xuICAgIGlmICghaXNOdW1iZXIodmFsdWUpKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFBpcGVBcmd1bWVudEV4Y2VwdGlvbihOdW1iZXJQaXBlLCB2YWx1ZSk7XG4gICAgfVxuICAgIHZhciBtaW5JbnQgPSAxLCBtaW5GcmFjdGlvbiA9IDAsIG1heEZyYWN0aW9uID0gMztcbiAgICBpZiAoaXNQcmVzZW50KGRpZ2l0cykpIHtcbiAgICAgIHZhciBwYXJ0cyA9IFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChfcmUsIGRpZ2l0cyk7XG4gICAgICBpZiAoaXNCbGFuayhwYXJ0cykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYCR7ZGlnaXRzfSBpcyBub3QgYSB2YWxpZCBkaWdpdCBpbmZvIGZvciBudW1iZXIgcGlwZXNgKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQocGFydHNbMV0pKSB7ICAvLyBtaW4gaW50ZWdlciBkaWdpdHNcbiAgICAgICAgbWluSW50ID0gTnVtYmVyV3JhcHBlci5wYXJzZUludEF1dG9SYWRpeChwYXJ0c1sxXSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHBhcnRzWzNdKSkgeyAgLy8gbWluIGZyYWN0aW9uIGRpZ2l0c1xuICAgICAgICBtaW5GcmFjdGlvbiA9IE51bWJlcldyYXBwZXIucGFyc2VJbnRBdXRvUmFkaXgocGFydHNbM10pO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChwYXJ0c1s1XSkpIHsgIC8vIG1heCBmcmFjdGlvbiBkaWdpdHNcbiAgICAgICAgbWF4RnJhY3Rpb24gPSBOdW1iZXJXcmFwcGVyLnBhcnNlSW50QXV0b1JhZGl4KHBhcnRzWzVdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIE51bWJlckZvcm1hdHRlci5mb3JtYXQodmFsdWUsIGRlZmF1bHRMb2NhbGUsIHN0eWxlLCB7XG4gICAgICBtaW5pbXVtSW50ZWdlckRpZ2l0czogbWluSW50LFxuICAgICAgbWluaW11bUZyYWN0aW9uRGlnaXRzOiBtaW5GcmFjdGlvbixcbiAgICAgIG1heGltdW1GcmFjdGlvbkRpZ2l0czogbWF4RnJhY3Rpb24sXG4gICAgICBjdXJyZW5jeTogY3VycmVuY3ksXG4gICAgICBjdXJyZW5jeUFzU3ltYm9sOiBjdXJyZW5jeUFzU3ltYm9sXG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBXQVJOSU5HOiB0aGlzIHBpcGUgdXNlcyB0aGUgSW50ZXJuYXRpb25hbGl6YXRpb24gQVBJLlxuICogVGhlcmVmb3JlIGl0IGlzIG9ubHkgcmVsaWFibGUgaW4gQ2hyb21lIGFuZCBPcGVyYSBicm93c2Vycy5cbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIGxvY2FsIHRleHQuIGkuZS4gZ3JvdXAgc2l6aW5nIGFuZCBzZXBhcmF0b3IgYW5kIG90aGVyIGxvY2FsZS1zcGVjaWZpY1xuICogY29uZmlndXJhdGlvbnMgYXJlIGJhc2VkIG9uIHRoZSBhY3RpdmUgbG9jYWxlLlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqICAgICBleHByZXNzaW9uIHwgbnVtYmVyWzpkaWdpdEluZm9dXG4gKlxuICogd2hlcmUgYGV4cHJlc3Npb25gIGlzIGEgbnVtYmVyIGFuZCBgZGlnaXRJbmZvYCBoYXMgdGhlIGZvbGxvd2luZyBmb3JtYXQ6XG4gKlxuICogICAgIHttaW5JbnRlZ2VyRGlnaXRzfS57bWluRnJhY3Rpb25EaWdpdHN9LXttYXhGcmFjdGlvbkRpZ2l0c31cbiAqXG4gKiAtIG1pbkludGVnZXJEaWdpdHMgaXMgdGhlIG1pbmltdW0gbnVtYmVyIG9mIGludGVnZXIgZGlnaXRzIHRvIHVzZS4gRGVmYXVsdHMgdG8gMS5cbiAqIC0gbWluRnJhY3Rpb25EaWdpdHMgaXMgdGhlIG1pbmltdW0gbnVtYmVyIG9mIGRpZ2l0cyBhZnRlciBmcmFjdGlvbi4gRGVmYXVsdHMgdG8gMC5cbiAqIC0gbWF4RnJhY3Rpb25EaWdpdHMgaXMgdGhlIG1heGltdW0gbnVtYmVyIG9mIGRpZ2l0cyBhZnRlciBmcmFjdGlvbi4gRGVmYXVsdHMgdG8gMy5cbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGUgYWNjZXB0YWJsZSByYW5nZSBmb3IgZWFjaCBvZiB0aGVzZSBudW1iZXJzIGFuZCBvdGhlclxuICogZGV0YWlscyBzZWUgeW91ciBuYXRpdmUgaW50ZXJuYXRpb25hbGl6YXRpb24gbGlicmFyeS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3BpcGVzL3RzL251bWJlcl9waXBlL251bWJlcl9waXBlX2V4YW1wbGUudHMgcmVnaW9uPSdOdW1iZXJQaXBlJ31cbiAqL1xuQENPTlNUKClcbkBQaXBlKHtuYW1lOiAnbnVtYmVyJ30pXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRGVjaW1hbFBpcGUgZXh0ZW5kcyBOdW1iZXJQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBhcmdzOiBhbnlbXSk6IHN0cmluZyB7XG4gICAgdmFyIGRpZ2l0czogc3RyaW5nID0gTGlzdFdyYXBwZXIuZmlyc3QoYXJncyk7XG4gICAgcmV0dXJuIE51bWJlclBpcGUuX2Zvcm1hdCh2YWx1ZSwgTnVtYmVyRm9ybWF0U3R5bGUuRGVjaW1hbCwgZGlnaXRzKTtcbiAgfVxufVxuXG4vKipcbiAqIFdBUk5JTkc6IHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkuXG4gKiBUaGVyZWZvcmUgaXQgaXMgb25seSByZWxpYWJsZSBpbiBDaHJvbWUgYW5kIE9wZXJhIGJyb3dzZXJzLlxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgbG9jYWwgcGVyY2VudC5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiAgICAgZXhwcmVzc2lvbiB8IHBlcmNlbnRbOmRpZ2l0SW5mb11cbiAqXG4gKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCBgZGlnaXRJbmZvYCBzZWUge0BsaW5rIERlY2ltYWxQaXBlfVxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvcGlwZXMvdHMvbnVtYmVyX3BpcGUvbnVtYmVyX3BpcGVfZXhhbXBsZS50cyByZWdpb249J1BlcmNlbnRQaXBlJ31cbiAqL1xuQENPTlNUKClcbkBQaXBlKHtuYW1lOiAncGVyY2VudCd9KVxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBlcmNlbnRQaXBlIGV4dGVuZHMgTnVtYmVyUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgYXJnczogYW55W10pOiBzdHJpbmcge1xuICAgIHZhciBkaWdpdHM6IHN0cmluZyA9IExpc3RXcmFwcGVyLmZpcnN0KGFyZ3MpO1xuICAgIHJldHVybiBOdW1iZXJQaXBlLl9mb3JtYXQodmFsdWUsIE51bWJlckZvcm1hdFN0eWxlLlBlcmNlbnQsIGRpZ2l0cyk7XG4gIH1cbn1cblxuLyoqXG4gKiBXQVJOSU5HOiB0aGlzIHBpcGUgdXNlcyB0aGUgSW50ZXJuYXRpb25hbGl6YXRpb24gQVBJLlxuICogVGhlcmVmb3JlIGl0IGlzIG9ubHkgcmVsaWFibGUgaW4gQ2hyb21lIGFuZCBPcGVyYSBicm93c2Vycy5cbiAqXG4gKiBGb3JtYXRzIGEgbnVtYmVyIGFzIGxvY2FsIGN1cnJlbmN5LlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqICAgICBleHByZXNzaW9uIHwgY3VycmVuY3lbOmN1cnJlbmN5Q29kZVs6c3ltYm9sRGlzcGxheVs6ZGlnaXRJbmZvXV1dXG4gKlxuICogd2hlcmUgYGN1cnJlbmN5Q29kZWAgaXMgdGhlIElTTyA0MjE3IGN1cnJlbmN5IGNvZGUsIHN1Y2ggYXMgXCJVU0RcIiBmb3IgdGhlIFVTIGRvbGxhciBhbmRcbiAqIFwiRVVSXCIgZm9yIHRoZSBldXJvLiBgc3ltYm9sRGlzcGxheWAgaXMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0byB1c2UgdGhlIGN1cnJlbmN5XG4gKiBzeW1ib2wgKGUuZy4gJCkgb3IgdGhlIGN1cnJlbmN5IGNvZGUgKGUuZy4gVVNEKSBpbiB0aGUgb3V0cHV0LiBUaGUgZGVmYXVsdCBmb3IgdGhpcyB2YWx1ZVxuICogaXMgYGZhbHNlYC5cbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IGBkaWdpdEluZm9gIHNlZSB7QGxpbmsgRGVjaW1hbFBpcGV9XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9waXBlcy90cy9udW1iZXJfcGlwZS9udW1iZXJfcGlwZV9leGFtcGxlLnRzIHJlZ2lvbj0nQ3VycmVuY3lQaXBlJ31cbiAqL1xuQENPTlNUKClcbkBQaXBlKHtuYW1lOiAnY3VycmVuY3knfSlcbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDdXJyZW5jeVBpcGUgZXh0ZW5kcyBOdW1iZXJQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBhcmdzOiBhbnlbXSk6IHN0cmluZyB7XG4gICAgdmFyIGN1cnJlbmN5Q29kZTogc3RyaW5nID0gaXNQcmVzZW50KGFyZ3MpICYmIGFyZ3MubGVuZ3RoID4gMCA/IGFyZ3NbMF0gOiAnVVNEJztcbiAgICB2YXIgc3ltYm9sRGlzcGxheTogYm9vbGVhbiA9IGlzUHJlc2VudChhcmdzKSAmJiBhcmdzLmxlbmd0aCA+IDEgPyBhcmdzWzFdIDogZmFsc2U7XG4gICAgdmFyIGRpZ2l0czogc3RyaW5nID0gaXNQcmVzZW50KGFyZ3MpICYmIGFyZ3MubGVuZ3RoID4gMiA/IGFyZ3NbMl0gOiBudWxsO1xuICAgIHJldHVybiBOdW1iZXJQaXBlLl9mb3JtYXQodmFsdWUsIE51bWJlckZvcm1hdFN0eWxlLkN1cnJlbmN5LCBkaWdpdHMsIGN1cnJlbmN5Q29kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bWJvbERpc3BsYXkpO1xuICB9XG59XG4iXX0=