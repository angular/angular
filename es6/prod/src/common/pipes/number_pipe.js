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
