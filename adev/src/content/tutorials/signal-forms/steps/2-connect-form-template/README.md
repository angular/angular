# Connect your form to the template

Now, you need to connect your form to the template using the `[field]` directive. This creates two-way data binding between your form model and the input elements.

In this lesson, you'll learn how to:

- Import the `Field` directive
- Use the `[field]` directive to bind form fields to inputs
- Connect text inputs and checkboxes to your form
- Display form field values in the template

Let's wire up the template!

<hr />

<docs-workflow>

<docs-step title="Import the Field directive">
Import the `Field` directive from `@angular/forms/signals` and add it to your component's imports array:

```ts
import { form, Field } from '@angular/forms/signals';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Field],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

</docs-step>

<docs-step title="Bind the email field">
In your template, add the `[field]` directive to the email input:

```html
<input type="email" [field]="loginForm.email" />
```

The `loginForm.email` expression accesses the email field from your form.
</docs-step>

<docs-step title="Bind the password field">
Add the `[field]` directive to the password input:

```html
<input type="password" [field]="loginForm.password" />
```

</docs-step>

<docs-step title="Bind the checkbox field">
Add the `[field]` directive to the checkbox input:

```html
<input type="checkbox" [field]="loginForm.rememberMe" />
```

</docs-step>

<docs-step title="Display the form values">
Below the form, there's a debug section to show current form values. Display each field value using `.value()`:

```html
<p>Email: {{ loginForm.email().value() }}</p>
<p>Password: {{ loginForm.password().value() ? '••••••••' : '(empty)' }}</p>
<p>Remember me: {{ loginForm.rememberMe().value() ? 'Yes' : 'No' }}</p>
```

Form field values are signals, so the displayed values update automatically as you type.
</docs-step>

</docs-workflow>

Great work! You've connected your form to the template and displayed the form values. The `[field]` directive handles two-way data binding automatically - as you type, the `loginModel` signal updates, and the displayed values update immediately.

Next, you'll learn [how to add validation to your form](/tutorials/signal-forms/3-add-validation)!
