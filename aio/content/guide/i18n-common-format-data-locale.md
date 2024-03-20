# Format data based on locale

Angular provides the following built-in data transformation [pipes][AioGuideGlossaryPipe].
The data transformation pipes use the [`LOCALE_ID`][AioApiCoreLocaleId] token to format data based on rules of each locale.

| Data transformation pipe                   | Details |
|:---                                        |:---     |
| [`DatePipe`][AioApiCommonDatepipe]         | Formats a date value.                             |
| [`CurrencyPipe`][AioApiCommonCurrencypipe] | Transforms a number into a currency string.       |
| [`DecimalPipe`][AioApiCommonDecimalpipe]   | Transforms a number into a decimal number string. |
| [`PercentPipe`][AioApiCommonPercentpipe]   | Transforms a number into a percentage string.     |

## Use DatePipe to display the current date

To display the current date in the format for the current locale, use the following format for the `DatePipe`.

<!--todo: replace with code-example -->

<code-example format="typescript" language="typescript">

{{ today &verbar; date }}

</code-example>

## Override current locale for CurrencyPipe

Add the `locale` parameter to the pipe to override the current value of `LOCALE_ID` token.

To force the currency to use American English \(`en-US`\), use the following format for the `CurrencyPipe`

<!--todo: replace with code-example -->

<code-example format="typescript" language="typescript">

{{ amount &verbar; currency : 'en-US' }}

</code-example>

<div class="alert is-helpful">

**NOTE**: <br />
The locale specified for the `CurrencyPipe` overrides the global `LOCALE_ID` token of your application.

</div>

## What's next

*   [Prepare component for translation][AioGuideI18nCommonPrepare]

<!-- links -->

[AioApiCommonCurrencypipe]: api/common/CurrencyPipe "CurrencyPipe | Common - API | Angular"
[AioApiCommonDatepipe]: api/common/DatePipe "DatePipe | Common - API | Angular"
[AioApiCommonDecimalpipe]: api/common/DecimalPipe "DecimalPipe | Common - API | Angular"
[AioApiCommonPercentpipe]: api/common/PercentPipe "PercentPipe | Common - API | Angular"
[AioApiCoreLocaleId]: api/core/LOCALE_ID "LOCALE_ID | Core - API | Angular"

[AioGuideGlossaryPipe]: guide/glossary#pipe "pipe - Glossary | Angular"

[AioGuideI18nCommonPrepare]: guide/i18n-common-prepare "Prepare component for translation | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
