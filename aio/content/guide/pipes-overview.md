# Understanding Pipes

Use [pipes](guide/glossary#pipe "Definition of a pipe") to transform strings, currency amounts, dates, and other data for display.

## What is a pipe

Pipes are simple functions to use in [template expressions](/guide/glossary#template-expression "Definition of template expression") to accept an input value and return a transformed value. Pipes are useful because you can use them throughout your application, while only declaring each pipe once.
For example, you would use a pipe to show a date as **April 15, 1988** rather than the raw string format.

<div class="alert is-helpful">

For the sample application used in this topic, see the <live-example name="pipes"></live-example>.

</div>

## Built-in pipes

Angular provides built-in pipes for typical data transformations, including transformations for internationalization (i18n), which use locale information to format data.
The following are commonly used built-in pipes for data formatting:

*   [`DatePipe`](api/common/DatePipe): Formats a date value according to locale rules.
*   [`UpperCasePipe`](api/common/UpperCasePipe): Transforms text to all upper case.
*   [`LowerCasePipe`](api/common/LowerCasePipe): Transforms text to all lower case.
*   [`CurrencyPipe`](api/common/CurrencyPipe): Transforms a number to a currency string, formatted according to locale rules.
*   [`DecimalPipe`](/api/common/DecimalPipe): Transforms a number into a string with a decimal point, formatted according to locale rules.
*   [`PercentPipe`](api/common/PercentPipe): Transforms a number to a percentage string, formatted according to locale rules.

<div class="alert is-helpful">

*   For a complete list of built-in pipes, see the [pipes API documentation](/api/common#pipes "Pipes API reference summary").
*   To learn more about using pipes for internationalization (i18n) efforts, see [formatting data based on locale][AioGuideI18nCommonFormatDataLocale].

</div>

Create pipes to encapsulate custom transformations and use your custom pipes in template expressions.

## Pipes and precedence

The pipe operator has a higher precedence than the ternary operator (`?:`), which means `a ? b : c | x` is parsed as `a ? b : (c | x)`.
The pipe operator cannot be used without parentheses in the first and second operands of `?:`.

Due to precedence, if you want a pipe to apply to the result of a ternary, wrap the entire expression in parentheses; for example, `(a ? b : c) | x`.

<code-example path="pipes/src/app/precedence.component.html" region="precedence" header="src/app/precedence.component.html"></code-example>

<!-- links -->

[AioGuideI18nCommonFormatDataLocale]: guide/i18n-common-format-data-locale "Format data based on locale | Angular"

<!-- end links -->

@reviewed 2022-04-01
