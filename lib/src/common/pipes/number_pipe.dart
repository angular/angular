library angular2.src.common.pipes.number_pipe;

import "package:angular2/src/facade/lang.dart"
    show
        isNumber,
        isPresent,
        isBlank,
        StringWrapper,
        NumberWrapper,
        RegExpWrapper,
        FunctionWrapper;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/facade/intl.dart"
    show NumberFormatter, NumberFormatStyle;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/core/change_detection.dart"
    show PipeTransform, WrappedValue;
import "package:angular2/src/core/metadata.dart" show Pipe;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "invalid_pipe_argument_exception.dart" show InvalidPipeArgumentException;

String defaultLocale = "en-US";
var _re = RegExpWrapper.create("^(\\d+)?\\.((\\d+)(\\-(\\d+))?)?\$");

@Injectable()
class NumberPipe {
  /** @internal */
  static String _format(num value, NumberFormatStyle style, String digits,
      [String currency = null, bool currencyAsSymbol = false]) {
    if (isBlank(value)) return null;
    if (!isNumber(value)) {
      throw new InvalidPipeArgumentException(NumberPipe, value);
    }
    var minInt = 1, minFraction = 0, maxFraction = 3;
    if (isPresent(digits)) {
      var parts = RegExpWrapper.firstMatch(_re, digits);
      if (isBlank(parts)) {
        throw new BaseException(
            '''${ digits} is not a valid digit info for number pipes''');
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
    return NumberFormatter.format(value, defaultLocale, style,
        minimumIntegerDigits: minInt,
        minimumFractionDigits: minFraction,
        maximumFractionDigits: maxFraction,
        currency: currency,
        currencyAsSymbol: currencyAsSymbol);
  }

  const NumberPipe();
}

/**
 * WARNING: this pipe uses the Internationalization API.
 * Therefore it is only reliable in Chrome and Opera browsers.
 *
 * Formats a number as local text. i.e. group sizing and separator and other locale-specific
 * configurations are based on the active locale.
 *
 *##Usage
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
 * ### Examples
 *
 *     {{ 123 | number }}              // output is 123
 *     {{ 123.1 | number: '.2-3' }}    // output is 123.10
 *     {{ 1 | number: '2.2' }}         // output is 01.00
 */
@Pipe(name: "number")
@Injectable()
class DecimalPipe extends NumberPipe implements PipeTransform {
  String transform(dynamic value, List<dynamic> args) {
    String digits = ListWrapper.first(args);
    return NumberPipe._format(value, NumberFormatStyle.Decimal, digits);
  }

  const DecimalPipe();
}

/**
 * WARNING: this pipe uses the Internationalization API.
 * Therefore it is only reliable in Chrome and Opera browsers.
 *
 * Formats a number as local percent.
 *
 *##Usage
 *
 *     expression | percent[:digitInfo]
 *
 * For more information about `digitInfo` see [DecimalPipe]
 */
@Pipe(name: "percent")
@Injectable()
class PercentPipe extends NumberPipe implements PipeTransform {
  String transform(dynamic value, List<dynamic> args) {
    String digits = ListWrapper.first(args);
    return NumberPipe._format(value, NumberFormatStyle.Percent, digits);
  }

  const PercentPipe();
}

/**
 * WARNING: this pipe uses the Internationalization API.
 * Therefore it is only reliable in Chrome and Opera browsers.
 *
 * Formats a number as local currency.
 *
 *##Usage
 *
 *     expression | currency[:currencyCode[:symbolDisplay[:digitInfo]]]
 *
 * where `currencyCode` is the ISO 4217 currency code, such as "USD" for the US dollar and
 * "EUR" for the euro. `symbolDisplay` is a boolean indicating whether to use the currency
 * symbol (e.g. $) or the currency code (e.g. USD) in the output. The default for this value
 * is `false`.
 * For more information about `digitInfo` see [DecimalPipe]
 */
@Pipe(name: "currency")
@Injectable()
class CurrencyPipe extends NumberPipe implements PipeTransform {
  String transform(dynamic value, List<dynamic> args) {
    String currencyCode = isPresent(args) && args.length > 0 ? args[0] : "USD";
    bool symbolDisplay = isPresent(args) && args.length > 1 ? args[1] : false;
    String digits = isPresent(args) && args.length > 2 ? args[2] : null;
    return NumberPipe._format(
        value, NumberFormatStyle.Currency, digits, currencyCode, symbolDisplay);
  }

  const CurrencyPipe();
}
