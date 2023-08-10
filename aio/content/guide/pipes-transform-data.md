# Transforming data with parameters and chained pipes

Some pipes have _optional_ parameters to fine-tune the pipe's output.

For example, the [`CurrencyPipe`](api/common/CurrencyPipe 'API reference') accepts a country code as a parameter.
To specify the parameter, follow the pipe name (`currency`) with a colon (`:`) and the parameter value (a country code).

The template expression `{{ amount | currency:'EUR' }}` displays the amount, prefixed with the Euros symbol (€).

Some pipes accept multiple _optional_ parameters. Pass each parameter to the pipe, separated by colons.

For example, `{{ amount | currency:'EUR':'Euros '}}` displays the amount with the label "Euros" (the second parameter) instead of the Euros symbol.

Some pipes, such as [`SlicePipe`](/api/common/SlicePipe 'API reference for SlicePipe'), _require_ at least one parameter and may allow more _optional_ parameters.

The expression `{{ anArray | slice:1:5 }}` displays a new string containing a subset of the elements starting with element `1` and ending with element `5`.

## Example: Formatting a date

The following example demonstrates two ways to format a hero's birthdate with the [`DatePipe`](api/common/DatePipe 'API reference').

<code-tabs>
    <code-pane header="birthday-formatting.component.html (template)" path="pipes/src/app/birthday-formatting.component.html"></code-pane>
    <code-pane header="birthday-formatting.component.ts (class)" path="pipes/src/app/birthday-formatting.component.ts"></code-pane>
</code-tabs>

In the template, the first expression passes the birthdate to the `DatePipe` _with a literal_ date format parameter, "shortDate". The output is **04/15/88**.

The second expression passes the birthdate to the `DatePipe` with a date format parameter _bound to a component property_ (`format`).

Clicking the "Toggle" button switches that property value between two of the [many possible pre-defined formats](api/common/DatePipe#pre-defined-format-options), `'mediumDate'` and `'fullDate'`. The output is either **April 15, 1988** or **Friday, April 15, 1988**.

The page displays the birthdate in the specified format.

## Example: Chaining two pipes together

Connect multiple pipes, using "pipe chaining syntax", so that the output of one pipe becomes the input to the next.

The following example passes the birthdate to the `DatePipe` and then forwards the result to the [`UpperCasePipe`](api/common/UpperCasePipe 'API reference') pipe, using "pipe chaining syntax".

Once again, it demonstrates the `DatePipe` both _with_ and _without_ a format parameter. Note that both results (**APR 15, 1988** and **FRIDAY, APRIL 15, 1988**) are in uppercase.

<code-tabs>
    <code-pane header="birthday-pipe-chaining.component.html (template)" path="pipes/src/app/birthday-pipe-chaining.component.html"></code-pane>
    <code-pane header="birthday-pipe-chaining.component.ts (class)" path="pipes/src/app/birthday-pipe-chaining.component.ts"></code-pane>
</code-tabs>

Switch to the class file to see that this is a [standalone component](guide/standalone-components); it imports the two pipes from `@angular/common`, the source of all built-in pipes.

@reviewed 2023-08-14
