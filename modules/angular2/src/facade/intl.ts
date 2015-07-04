
// Modified version of internal Typescript intl.d.ts.
// TODO(piloopin): remove when https://github.com/Microsoft/TypeScript/issues/3521 is shipped.
declare module Intl {
  interface NumberFormatOptions {
    localeMatcher?: string;
    style?: string;
    currency?: string;
    currencyDisplay?: string;
    useGrouping?: boolean;
  }

  interface NumberFormat {
    format(value: number): string;
  }

  var NumberFormat: {
    new (locale?: string, options?: NumberFormatOptions): NumberFormat;
  }

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

  var DateTimeFormat: {
    new (locale?: string, options?: DateTimeFormatOptions): DateTimeFormat;
  }
}

export enum NumberFormatStyle {
  DECIMAL,
  PERCENT,
  CURRENCY
}

export class NumberFormatter {
  static format(number: number, locale: string, style: NumberFormatStyle,
                {minimumIntegerDigits = 1, minimumFractionDigits = 0, maximumFractionDigits = 3,
                 currency, currencyAsSymbol = false}: {
                  minimumIntegerDigits?: int,
                  minimumFractionDigits?: int,
                  maximumFractionDigits?: int,
                  currency?: string,
                  currencyAsSymbol?: boolean
                } = {}): string {
    var intlOptions: Intl.NumberFormatOptions = {
      minimumIntegerDigits: minimumIntegerDigits,
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits
    };
    intlOptions.style = NumberFormatStyle[style].toLowerCase();
    if (style == NumberFormatStyle.CURRENCY) {
      intlOptions.currency = currency;
      intlOptions.currencyDisplay = currencyAsSymbol ? 'symbol' : 'code';
    }
    return new Intl.NumberFormat(locale, intlOptions).format(number);
  }
}
