# Format data based on locale

Angular provides the following built-in data transformation [pipes](guide/templates/pipes).
The data transformation pipes use the [`LOCALE_ID`][ApiCoreLocaleId] token to format data based on rules of each locale.

| Data transformation pipe                   | Details |
|:---                                        |:---     |
| [`DatePipe`][ApiCommonDatepipe]         | Formats a date value.                             |
| [`CurrencyPipe`][ApiCommonCurrencypipe] | Transforms a number into a currency string.       |
| [`DecimalPipe`][ApiCommonDecimalpipe]   | Transforms a number into a decimal number string. |
| [`PercentPipe`][ApiCommonPercentpipe]   | Transforms a number into a percentage string.     |

## Use DatePipe to display the current date

To display the current date in the format for the current locale, use the following format for the `DatePipe`.

<!--todo: replace with docs-code -->

<docs-code language="typescript">

{{ today | date }}

</docs-code>

## Override current locale for CurrencyPipe

Add the `locale` parameter to the pipe to override the current value of `LOCALE_ID` token.

To force the currency to use American English \(`en-US`\), use the following format for the `CurrencyPipe`

<!--todo: replace with docs-code -->

<docs-code language="typescript">

{{ amount | currency : 'en-US' }}

</docs-code>

HELPFUL: The locale specified for the `CurrencyPipe` overrides the global `LOCALE_ID` token of your application.

## What's next

<docs-pill-row>
  <docs-pill href="guide/i18n/prepare" title="Prepare component for translation"/>
</docs-pill-row>

[ApiCommonCurrencypipe]: api/common/CurrencyPipe "CurrencyPipe | Common - API | Angular"

[ApiCommonDatepipe]: api/common/DatePipe "DatePipe | Common - API | Angular"
[ApiCommonDecimalpipe]: api/common/DecimalPipe "DecimalPipe | Common - API | Angular"
[ApiCommonPercentpipe]: api/common/PercentPipe "PercentPipe | Common - API | Angular"
[ApiCoreLocaleId]: api/core/LOCALE_ID "LOCALE_ID | Core - API | Angular"
