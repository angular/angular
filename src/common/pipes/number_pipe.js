var __extends = (this && this.__extends) || function (d, b) {
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
var di_1 = require('angular2/src/core/di');
var metadata_1 = require('angular2/src/core/metadata');
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
        di_1.Injectable(), 
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
        metadata_1.Pipe({ name: 'number' }),
        di_1.Injectable(), 
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
        metadata_1.Pipe({ name: 'percent' }),
        di_1.Injectable(), 
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
        metadata_1.Pipe({ name: 'currency' }),
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], CurrencyPipe);
    return CurrencyPipe;
})(NumberPipe);
exports.CurrencyPipe = CurrencyPipe;
//# sourceMappingURL=number_pipe.js.map