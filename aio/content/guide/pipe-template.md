# Using a pipe in a template

To apply a pipe, use the pipe operator (`|`) within a template expression as shown in the following code example.

<code-example header="birthday.component.html (template)" path="pipes/src/app/birthday.component.html"></code-example>

The component's `birthday` value flows through the pipe operator (`|`) to the [`DatePipe`](api/common/DatePipe) whose pipe name is `date`.
The pipe renders the date in the default format as **Apr 15, 1988**.

Look at the component class.

<code-example header="birthday.component.ts (class)" path="pipes/src/app/birthday.component.ts"></code-example>

Because this is a [standalone component](guide/standalone-components), it imports the `DatePipe` from `@angular/common`, the source of all built-in pipes.

@reviewed 2023-08-14
