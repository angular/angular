# Using a pipe in a template

To apply a pipe, use the pipe operator (`|`) within a template expression as shown in the following code example, along with the *name* of the pipe, which is `date` for the built-in [`DatePipe`](api/common/DatePipe).

The tabs in the example show the following:

*   `app.component.html` uses `date` in a separate template to display a birthday.
*   `hero-birthday1.component.ts` uses the same pipe as part of an in-line template in a component that also sets the birthday value.

<code-tabs>
    <code-pane header="src/app/app.component.html" region="hero-birthday-template" path="pipes/src/app/app.component.html"></code-pane>
    <code-pane header="src/app/hero-birthday1.component.ts" path="pipes/src/app/hero-birthday1.component.ts"></code-pane>
</code-tabs>

The component's `birthday` value flows through the pipe operator, `|` to the [`date`](api/common/DatePipe) function.

@reviewed 2022-04-07
