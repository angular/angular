# Set up the form model

Every Signal Form starts with a form data model - a signal that defines the shape of your data, and stores your form data.

In this lesson, you'll learn how to:

- Define a TypeScript interface for your form data
- Create a signal to hold form values
- Use the `form()` function to create a Signal Form

Let's build the foundation for our login form!

<hr />

<docs-workflow>

<docs-step title="Define the LoginData interface">
Create a TypeScript interface that defines the structure of your login form data. The form will have:

- An `email` field (string)
- A `password` field (string)
- A `rememberMe` field (boolean)

```ts
interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}
```

Add this interface above the `@Component` decorator.
</docs-step>

<docs-step title="Import signal and form">
Import the `signal` function from `@angular/core` and the `form` function from `@angular/forms/signals`:

```ts
import {Component, signal} from '@angular/core';
import {form} from '@angular/forms/signals';
```

</docs-step>

<docs-step title="Create the form model signal">
In your component class, create a `loginModel` signal with initial values. Use the `LoginData` interface as the type parameter:

```ts
loginModel = signal<LoginData>({
  email: '',
  password: '',
  rememberMe: false,
});
```

The initial values start as empty strings for text fields and `false` for the checkbox.
</docs-step>

<docs-step title="Create the form">
Now create the form by passing your model signal to the `form()` function:

```ts
loginForm = form(this.loginModel);
```

The `form()` function creates a form from your model, giving you access to field state and validation.
</docs-step>

</docs-workflow>

Excellent! You've set up your form model. The `loginModel` signal holds your form data, and the `loginForm` provides access to each field with type safety.

Next, you'll learn [how to connect your form to the template](/tutorials/signal-forms/2-connect-form-template)!
