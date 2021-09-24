# Format data based on locale

{@a i18n-pipes}

Angular provides the following built-in data transformation [pipes][AioGuideGlossaryPipe].  The data transformation pipes use the [`LOCALE_ID`][AioApiCoreLocaleId] token to format data based on rules of each locale.

*   [`DatePipe`][AioApiCommonDatepipe]: Formats a date value.
*   [`CurrencyPipe`][AioApiCommonCurrencypipe]: Transforms a number to a currency string.
*   [`DecimalPipe`][AioApiCommonDecimalpipe]: Transforms a number into a decimal number string.
*   [`PercentPipe`][AioApiCommonPercentpipe]: Transforms a number to a percentage string.

For example, `{{today | date}}` uses `DatePipe` to display the current date in the format for the locale in `LOCALE_ID`.

To override the value of `LOCALE_ID`, add the `locale` parameter.
For example, to force the currency to use `en-US` no matter which language-locale you set for `LOCALE_ID`, use this form: `{{amount | currency : 'en-US'}}`.

<!-- links -->

[AioApiCommonCurrencypipe]: api/common/CurrencyPipe "CurrencyPipe | Common - API | Angular"
[AioApiCommonDatepipe]: api/common/DatePipe "DatePipe | Common - API | Angular"
[AioApiCommonDecimalpipe]: api/common/DecimalPipe "DecimalPipe | Common - API | Angular"
[AioApiCommonPercentpipe]: api/common/PercentPipe "PercentPipe | Common - API | Angular"
[AioApiCoreLocaleId]: api/core/LOCALE_ID "LOCALE_ID | Core - API | Angular"

[AioGuideGlossaryPipe]: guide/glossary#pipe "pipe - Glossary | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2021-09-15
