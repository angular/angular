# Transforming data with parameters and chained pipes

Use optional parameters to fine-tune a pipe's output.
For example, use the [`CurrencyPipe`](api/common/CurrencyPipe "API reference") with a country code such as EUR as a parameter.
The template expression `{{ amount | currency:'EUR' }}` transforms the `amount` to currency in euros.
Follow the pipe name (`currency`) with a colon (`:`) and the parameter value (`'EUR'`).

If the pipe accepts multiple parameters, separate the values with colons.
For example, `{{ amount | currency:'EUR':'Euros '}}` adds the second parameter, the string literal `'Euros '`, to the output string. Use any valid template expression as a parameter, such as a string literal or a component property.

Some pipes require at least one parameter and allow more optional parameters, such as [`SlicePipe`](/api/common/SlicePipe "API reference for SlicePipe"). For example, `{{ slice:1:5 }}` creates a new array or string containing a subset of the elements starting with element `1` and ending with element `5`.

## Example: Formatting a date

The tabs in the following example demonstrates toggling between two different formats (`'shortDate'` and `'fullDate'`):

*   The `app.component.html` template uses a format parameter for the [`DatePipe`](api/common/DatePipe) (named `date`) to show the date as **04/15/88**.
*   The `hero-birthday2.component.ts` component binds the pipe's format parameter to the component's `format` property in the `template` section, and adds a button for a click event bound to the component's `toggleFormat()` method.
*   The `hero-birthday2.component.ts` component's `toggleFormat()` method toggles the component's `format` property between a short form
(`'shortDate'`) and a longer form (`'fullDate'`).

<code-tabs>
    <code-pane header="src/app/app.component.html" region="format-birthday" path="pipes/src/app/app.component.html"></code-pane>
    <code-pane header="src/app/hero-birthday2.component.ts (template)" region="template" path="pipes/src/app/hero-birthday2.component.ts"></code-pane>
    <code-pane header="src/app/hero-birthday2.component.ts (class)" region="class" path="pipes/src/app/hero-birthday2.component.ts"></code-pane>
</code-tabs>

Clicking the **Toggle Format** button alternates the date format between **04/15/1988** and **Friday, April 15, 1988**.

<div class="alert is-helpful">

For `date` pipe format options, see [DatePipe](api/common/DatePipe "DatePipe API Reference page").

</div>

## Example: Applying two formats by chaining pipes

Chain pipes so that the output of one pipe becomes the input to the next.

In the following example, chained pipes first apply a format to a date value, then convert the formatted date to uppercase characters.
The first tab for the `src/app/app.component.html` template chains `DatePipe` and `UpperCasePipe` to display the birthday as **APR 15, 1988**.
The second tab for the `src/app/app.component.html` template passes the `fullDate` parameter to `date` before chaining to `uppercase`, which produces **FRIDAY, APRIL 15, 1988**.

<code-tabs>
    <code-pane header="src/app/app.component.html (1)" region="chained-birthday" path="pipes/src/app/app.component.html"></code-pane>
    <code-pane header="src/app/app.component.html (2)" region="chained-parameter-birthday" path="pipes/src/app/app.component.html"></code-pane>
</code-tabs>

@reviewed 2022-4-01
