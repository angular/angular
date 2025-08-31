# Control Flow in Components - `@if`

Deciding what to display on the screen for a user is a common task in application development. Many times, the decision is made programmatically using conditions.

To express conditional displays in templates, Angular uses the `@if` template syntax.

Note: Learn more about [control flow in the essentials guide](/essentials/templates#control-flow-with-if-and-for).

In this activity, you'll learn how to use conditionals in templates.

<hr/>

The syntax that enables the conditional display of elements in a template is `@if`.

Here's an example of how to use the `@if` syntax in a component:

```angular-ts
@Component({
  ...
  template: `
    @if (isLoggedIn) {
      <p>Welcome back, Friend!</p>
    }
  `,
})
export class App {
  isLoggedIn = true;
}
```

Two things to take note of:

- There is an `@` prefix for the `if` because it is a special type of syntax called [Angular template syntax](guide/templates)
- For applications using v16 and older please refer to the [Angular documentation for NgIf](guide/directives/structural-directives) for more information.

<docs-workflow>

<docs-step title="Create a property called `isServerRunning`">
In the `App` class, add a `boolean` property called `isServerRunning`, set the initial value to `true`.
</docs-step>

<docs-step title="Use `@if` in the template">
Update the template to display the message `Yes, the server is running` if the value of `isServerRunning` is `true`.

</docs-step>

<docs-step title="Use `@else` in the template">
Now Angular supports native template syntax for defining the else case with the `@else` syntax. Update the template to display the message `No, the server is not running` as the else case.

Here's an example:

```angular-ts
template: `
  @if (isServerRunning) { ... }
  @else { ... }
`;
```

Add your code to fill in the missing markup.

</docs-step>

</docs-workflow>

This type of functionality is called conditional control flow. Next you'll learn how to repeat items in a template.
