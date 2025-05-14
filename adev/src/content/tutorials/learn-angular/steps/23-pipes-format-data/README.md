# Formatting data with pipes

You can take your use of pipes even further by configuring them. Pipes can be configured by passing options to them.

Note: Learn more about [formatting data with pipes in the in-depth guide](/guide/templates/pipes).

In this activity, you will work with some pipes and pipe parameters.

<hr>

To pass parameters to a pipe, use the `:` syntax followed by the parameter value. Here's an example:

```ts
template: `{{ date | date:'medium' }}`;
```

The output is `Jun 15, 2015, 9:43:11 PM`.

Time to customize some pipe output:

<docs-workflow>

<docs-step title="Format a number with `DecimalPipe`">

In `app.ts`, update the template to include parameter for the `decimal` pipe.

<docs-code language="ts" highlight="[3]">
template: `
    ...
    <li>Number with "decimal" {{ num | number:"3.2-2" }}</li>
`
</docs-code>

NOTE: What's that format? The parameter for the `DecimalPipe` is called `digitsInfo`, this parameter uses the format: `{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}`

</docs-step>

<docs-step title="Format a date with `DatePipe`">

Now, update the template to use the `date` pipe.

<docs-code language="ts" highlight="[3]">
template: `
    ...
    <li>Date with "date" {{ birthday | date: 'medium' }}</li>
`
</docs-code>

For extra fun, try some different parameters for `date`. More information can be found in the [Angular docs](guide/templates/pipes).

</docs-step>

<docs-step title="Format a currency with `CurrencyPipe`">

For your last task, update the template to use the `currency` pipe.

<docs-code language="ts" highlight="[3]">
template: `
    ...
    <li>Currency with "currency" {{ cost | currency }}</li>
`
</docs-code>

You can also try different parameters for `currency`. More information can be found in the [Angular docs](guide/templates/pipes).

</docs-step>

</docs-workflow>

Great work with pipes. You've made some great progress so far.

There are even more built-in pipes that you can use in your applications. You can find the list in the [Angular documentation](guide/templates/pipes).

In the case that the built-in pipes don't cover your needs, you can also create a custom pipe. Check out the next lesson to find out more.
