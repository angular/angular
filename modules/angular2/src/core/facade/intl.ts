
// Modified version of internal Typescript intl.d.ts.
// TODO(piloopin): remove when https://github.com/Microsoft/TypeScript/issues/3521 is shipped.
declare module Intl {
  interface NumberFormatOptions {
    localeMatcher?: string;
    style?: string;
    currency?: string;
    currencyDisplay?: string;
    useGrouping?: boolean;
    minimumIntegerDigits?: number;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }

  interface NumberFormat {
    format(value: number): string;
  }

  var NumberFormat: {new (locale?: string, options?: NumberFormatOptions): NumberFormat};

  interface DateTimeFormatOptions {
    localeMatcher?: string;
    weekday?: string;
    era?: string;
    year?: string;
    month?: string;
    day?: string;
    hour?: string;
    minute?: string;
    second?: string;
    timeZoneName?: string;
    formatMatcher?: string;
    hour12?: boolean;
  }

  interface DateTimeFormat {
    format(date?: Date | number): string;
  }

  var DateTimeFormat: {new (locale?: string, options?: DateTimeFormatOptions): DateTimeFormat};
}

export enum NumberFormatStyle {
  Decimal,
  Percent,
  Currency
}

export class NumberFormatter {
  static format(number: number, locale: string, style: NumberFormatStyle,
                {minimumIntegerDigits = 1, minimumFractionDigits = 0, maximumFractionDigits = 3,
                 currency, currencyAsSymbol = false}: {
                  minimumIntegerDigits?: number,
                  minimumFractionDigits?: number,
                  maximumFractionDigits?: number,
                  currency?: string,
                  currencyAsSymbol?: boolean
                } = {}): string {
    var intlOptions: Intl.NumberFormatOptions = {
      minimumIntegerDigits: minimumIntegerDigits,
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits
    };
    intlOptions.style = NumberFormatStyle[style].toLowerCase();
    if (style == NumberFormatStyle.Currency) {
      intlOptions.currency = currency;
      intlOptions.currencyDisplay = currencyAsSymbol ? 'symbol' : 'code';
    }
    return new Intl.NumberFormat(locale, intlOptions).format(number);
  }
}

function digitCondition(len: number): string {
  return len == 2 ? '2-digit' : 'numeric';
}
function nameCondition(len: number): string {
  return len < 4 ? 'short' : 'long';
}
function extractComponents(pattern: string): Intl.DateTimeFormatOptions {
  var ret: Intl.DateTimeFormatOptions = {};
  var i = 0, j;
  while (i < pattern.length) {
    j = i;
    while (j < pattern.length && pattern[j] == pattern[i]) j++;
    let len = j - i;
    switch (pattern[i]) {
      case 'G':
        ret.era = nameCondition(len);
        break;
      case 'y':
        ret.year = digitCondition(len);
        break;
      case 'M':
        if (len >= 3)
          ret.month = nameCondition(len);
        else
          ret.month = digitCondition(len);
        break;
      case 'd':
        ret.day = digitCondition(len);
        break;
      case 'E':
        ret.weekday = nameCondition(len);
        break;
      case 'j':
        ret.hour = digitCondition(len);
        break;
      case 'h':
        ret.hour = digitCondition(len);
        ret.hour12 = true;
        break;
      case 'H':
        ret.hour = digitCondition(len);
        ret.hour12 = false;
        break;
      case 'm':
        ret.minute = digitCondition(len);
        break;
      case 's':
        ret.second = digitCondition(len);
        break;
      case 'z':
        ret.timeZoneName = 'long';
        break;
      case 'Z':
        ret.timeZoneName = 'short';
        break;
    }
    i = j;
  }
  return ret;
}

var dateFormatterCache: Map<string, Intl.DateTimeFormat> = new Map<string, Intl.DateTimeFormat>();

export class DateFormatter {
  static format(date: Date, locale: string, pattern: string): string {
    var key = locale + pattern;
    if (dateFormatterCache.has(key)) {
      return dateFormatterCache.get(key).format(date);
    }
    var formatter = new Intl.DateTimeFormat(locale, extractComponents(pattern));
    dateFormatterCache.set(key, formatter);
    return formatter.format(date);
  }
}
