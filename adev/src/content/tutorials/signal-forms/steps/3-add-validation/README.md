# Add validation to your form

Adding validation to your form is critical to ensure users enter valid data. Signal Forms uses validators in a schema function that you pass to the `form()` function.

In this activity, you'll learn how to:

- Import built-in validators
- Define a schema function for your form
- Apply validators to specific fields with custom error messages

Let's add validation!

<hr />

<docs-workflow>

<docs-step title="Import the validators">
Import the `required` and `email` validators from `@angular/forms/signals`:

```ts
import {form, FormField, required, email} from '@angular/forms/signals';
```

</docs-step>

<docs-step title="Add a schema function to your form">
Update your `form()` call to include a schema function as the second parameter. The schema function receives a `fieldPath` parameter that lets you access each field:

```ts
loginForm = form(this.loginModel, (fieldPath) => {
  // Validators will go here
});
```

</docs-step>

<docs-step title="Add validation to the email field">
Inside the schema function, add validation for the email field. Use both `required()` and `email()` validators:

```ts
loginForm = form(this.loginModel, (fieldPath) => {
  required(fieldPath.email, {message: 'Email is required'});
  email(fieldPath.email, {message: 'Enter a valid email address'});
});
```

The `message` option provides custom error messages for users.
</docs-step>

<docs-step title="Add validation to the password field">
Add validation for the password field using the `required()` validator:

```ts
loginForm = form(this.loginModel, (fieldPath) => {
  required(fieldPath.email, {message: 'Email is required'});
  email(fieldPath.email, {message: 'Enter a valid email address'});
  required(fieldPath.password, {message: 'Password is required'});
});
```

</docs-step>

</docs-workflow>

Perfect! You've added validation to your form. The validators run automatically as users interact with the form. When validation fails, the field's state will reflect the errors.

Next, you'll learn [how to display validation errors in the template](/tutorials/signal-forms/4-display-errors)!
