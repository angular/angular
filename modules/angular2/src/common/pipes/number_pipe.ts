import {
  isNumber,
  isPresent,
  isBlank,
  StringWrapper,
  NumberWrapper,
  RegExpWrapper,
  CONST,
  FunctionWrapper
} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {NumberFormatter, NumberFormatStyle} from 'angular2/src/facade/intl';
import {Injectable, PipeTransform, WrappedValue, Pipe} from 'angular2/core';
import {ListWrapper} from 'angular2/src/facade/collection';

import {InvalidPipeArgumentException} from './invalid_pipe_argument_exception';

var defaultLocale: string = 'en-US';
var _re = RegExpWrapper.create('^(\\d+)?\\.((\\d+)(\\-(\\d+))?)?$');

/**
 * Internal base class for numeric pipes.
 */
@CONST()
@Injectable()
export class NumberPipe {
  /** @internal */
  static _format(value: number, style: NumberFormatStyle, digits: string, currency: string = null,
                 currencyAsSymbol: boolean = false): string {
    if (isBlank(value)) return null;
    if (!isNumber(value)) {
      throw new InvalidPipeArgumentException(NumberPipe, value);
    }
    var minInt = 1, minFraction = 0, maxFraction = 3;
    if (isPresent(digits)) {
      var parts = RegExpWrapper.firstMatch(_re, digits);
      if (isBlank(parts)) {
        throw new BaseException(`${digits} is not a valid digit info for number pipes`);
      }
      if (isPresent(parts[1])) {  // min integer digits
        minInt = NumberWrapper.parseIntAutoRadix(parts[1]);
      }
      if (isPresent(parts[3])) {  // min fraction digits
        minFraction = NumberWrapper.parseIntAutoRadix(parts[3]);
      }
      if (isPresent(parts[5])) {  // max fraction digits
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
}

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
@CONST()
@Pipe({name: 'number'})
@Injectable()
export class DecimalPipe extends NumberPipe implements PipeTransform {
  transform(value: any, args: any[]): string {
    var digits: string = ListWrapper.first(args);
    return NumberPipe._format(value, NumberFormatStyle.Decimal, digits);
  }
}

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
@CONST()
@Pipe({name: 'percent'})
@Injectable()
export class PercentPipe extends NumberPipe implements PipeTransform {
  transform(value: any, args: any[]): string {
    var digits: string = ListWrapper.first(args);
    return NumberPipe._format(value, NumberFormatStyle.Percent, digits);
  }
}

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
@CONST()
@Pipe({name: 'currency'})
@Injectable()
export class CurrencyPipe extends NumberPipe implements PipeTransform {
  transform(value: any, args: any[]): string {
    var currencyCode: string = isPresent(args) && args.length > 0 ? args[0] : 'USD';
    var symbolDisplay: boolean = isPresent(args) && args.length > 1 ? args[1] : false;
    var digits: string = isPresent(args) && args.length > 2 ? args[2] : null;
    return NumberPipe._format(value, NumberFormatStyle.Currency, digits, currencyCode,
                              symbolDisplay);
  }
}
