# Add form submission

Finally, let's learn how to handle form submission. You'll learn how to use the `submit()` function to run async operations when the form is valid, and disable the submit button when the form has errors.

In this activity, you'll learn how to:

- Import the `submit()` function
- Create a submission handler method
- Use `submit()` to run logic only when valid
- Disable the submit button based on form state

Let's complete the form!

<hr />

<docs-workflow>

<docs-step title="Import the submit function">
Import the `submit` function from `@angular/forms/signals`:

```ts
import {form, FormField, required, email, submit} from '@angular/forms/signals';
```

</docs-step>

<docs-step title="Add the onSubmit method">
In your component class, add an `onSubmit()` method that handles form submission:

```ts
onSubmit(event: Event) {
  event.preventDefault();
  submit(this.loginForm, async () => {
    const credentials = this.loginModel();
    console.log('Logging in with:', credentials);
    // Add your login logic here
  });
}
```

The `submit()` function only runs your async callback if the form is valid. It also handles the form's submission state automatically.
</docs-step>

<docs-step title="Bind the submit handler to the form">
In your template, bind the `onSubmit()` method to the form's submit event:

```html
<form (submit)="onSubmit($event)"></form>
```

</docs-step>

<docs-step title="Disable the button when form is invalid">
Update the submit button to be disabled when the form is invalid:

```html
<button type="submit" [disabled]="loginForm().invalid()">Log in</button>
```

This prevents submission when the form has validation errors.
</docs-step>

</docs-workflow>

Congratulations! You've built a complete login form with Signal Forms.

Ready to see what you've learned and explore advanced topics? Continue to [the next steps](/tutorials/signal-forms/6-next-steps)!
