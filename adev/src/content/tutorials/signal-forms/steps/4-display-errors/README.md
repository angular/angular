# Display validation errors

Now that you're able to validate the form, it's important to show validation errors to users.

In this activity, you'll learn how to:

- Access field state with validation signals
- Use `@if` to conditionally display errors
- Loop through errors with `@for`
- Show errors only after user interaction

Let's display validation feedback!

<hr />

<docs-workflow>

<docs-step title="Add error display for email field">
Below the email input, add conditional error display. This will only show errors when the field is both invalid and touched:

```angular-html
<label>
  Email
  <input type="email" [formField]="loginForm.email" />
</label>
@if (loginForm.email().invalid() && loginForm.email().touched()) {
  <div class="error">
    @for (error of loginForm.email().errors(); track error.kind) {
      <span>{{ error.message }}</span>
    }
  </div>
}
```

The `loginForm.email()` call accesses the field's state signal. The `invalid()` method returns `true` when validation fails, `touched()` returns `true` after the user has interacted with the field, and `errors()` provides an array of validation errors with their custom messages.
</docs-step>

<docs-step title="Add error display for password field">
Below the password input, add the same pattern for password errors:

```angular-html
<label>
  Password
  <input type="password" [formField]="loginForm.password" />
</label>
@if (loginForm.password().invalid() && loginForm.password().touched()) {
  <div class="error">
    @for (error of loginForm.password().errors(); track error.kind) {
      <span>{{ error.message }}</span>
    }
  </div>
}
```

</docs-step>

</docs-workflow>

Excellent! You've added error display to your form. The errors appear only after users interact with a field, providing helpful feedback without being intrusive.

Next, you'll learn [how to handle form submission](/tutorials/signal-forms/5-add-submission)!
