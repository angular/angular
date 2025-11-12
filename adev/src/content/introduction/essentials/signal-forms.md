<docs-decorative-header title="Forms with signals" imgSrc="adev/src/assets/images/signals.svg"> <!-- markdownlint-disable-line -->
Signal Forms is built on Angular signals to provide a reactive, type-safe way to manage form state.
</docs-decorative-header>

Signal Forms manage form state using Angular signals to provide automatic synchronization between your data model and the UI.

This guide walks you through the core concepts to create forms with Signal Forms. Here's how it works:

## Creating your first form

### 1. Create a form model

When you create a form, you start by creating a signal that holds your form's data:

```ts
const loginModel = signal({
  email: '',
  password: '',
});
```

### 2. Pass the form model to `form()`

Then, you pass your form model into the `form()` function to create a **field tree** - an object structure that mirrors your model's shape, allowing you to access fields with dot notation:

```ts
form(loginModel);

// Access fields directly by property name
loginForm.email
loginForm.password
```

### 3. Bind inputs with `[field]` directive

Next, you bind your HTML inputs to the form using the `[field]` directive, which creates two-way binding between them:

```html
<input type="email" [field]="loginForm.email" />
<input type="password" [field]="loginForm.password" />
```

As a result, user changes (such as typing in the field) automatically updates the form, and any programmatic changes update the displayed value as well:

```ts
// Update the value programmatically
loginForm.email().value.set('alice@wonderland.com');

// The model signal is also updated
console.log(loginModel().email); // 'alice@wonderland.com'
```

NOTE: The `[field]` directive also syncs field state for attributes like `required`, `disabled`, and `readonly` when appropriate.

### 4. Read form field values with `value()`

You can access field state by calling the field as a function. This returns a `FieldState` object containing reactive signals for the field's value, validation status, and interaction state:

```ts
loginForm.email() // Returns FieldState with value(), valid(), touched(), etc.
```

To read the field's current value, access the `value()` signal:

```html
<!-- Render form value that updates automatically as user types -->
<p>Email: {{ loginForm.email().value() }}</p>
```

```ts
// Get the current value
const currentEmail = loginForm.email().value();
```

Here's a complete example:

<docs-code-multifile preview path="adev/src/content/examples/signal-forms/src/login-simple/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.css"/>
</docs-code-multifile>

## Basic usage

The `[field]` directive works with all standard HTML input types. Here are the most common patterns:

### Text inputs

Text inputs work with various `type` attributes and textareas:

```html
<!-- Text and email -->
<input type="text" [field]="form.name" />
<input type="email" [field]="form.email" />
```

#### Numbers

Number inputs automatically convert between strings and numbers:

```html
<!-- Number - automatically converts to number type -->
<input type="number" [field]="form.age" />
```

#### Date and time

Date inputs store values as `YYYY-MM-DD` strings, and time inputs use `HH:mm` format:

```html
<!-- Date and time - stores as ISO format strings -->
<input type="date" [field]="form.eventDate" />
<input type="time" [field]="form.eventTime" />
```

If you need to convert date strings to Date objects, you can do so by passing the field value into `Date()`:

```ts
const dateObject = new Date(form.eventDate().value());
```

#### Multiline text

Textareas work the same way as text inputs:

```html
<!-- Textarea -->
<textarea [field]="form.message" rows="4"></textarea>
```

### Checkboxes

Checkboxes bind to boolean values:

```html
<!-- Single checkbox -->
<label>
  <input type="checkbox" [field]="form.agreeToTerms" />
  I agree to the terms
</label>
```

#### Multiple checkboxes

For multiple options, create a separate boolean `field` for each:

```html
<label>
  <input type="checkbox" [field]="form.emailNotifications" />
  Email notifications
</label>
<label>
  <input type="checkbox" [field]="form.smsNotifications" />
  SMS notifications
</label>
```

### Radio buttons

Radio buttons work similarly to checkboxes. As long as the radio buttons use the same `[field]` value, Signal Forms will automatically bind the same `name` attribute to all of them:

```html
<label>
  <input type="radio" value="free" [field]="form.plan" />
  Free
</label>
<label>
  <input type="radio" value="premium" [field]="form.plan" />
  Premium
</label>
```

When a user selects a radio button, the form `field` stores the value from that radio button's `value` attribute. For example, selecting "Premium" sets `form.plan().value()` to `"premium"`.

### Select dropdowns

Select elements work with both static and dynamic options:

```html
<!-- Static options -->
<select [field]="form.country">
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="ca">Canada</option>
</select>

<!-- Dynamic options with @for -->
<select [field]="form.productId">
  <option value="">Select a product</option>
  @for (product of products; track product.id) {
    <option [value]="product.id">{{ product.name }}</option>
  }
</select>
```

NOTE: Multiple select (`<select multiple>`) is not supported by the `[field]` directive at this time.

## Validation and state

Signal Forms provides built-in validators that you can apply to your form fields. To add validation, pass a schema function as the second argument to `form()`. This function receives a **field path** parameter that allows you to reference the fields in your form model:

```ts
const loginForm = form(loginModel, (fieldPath) => {
  required(fieldPath.email);
  email(fieldPath.email);
});
```

Common validators include:

- **`required()`** - Ensures the field has a value
- **`email()`** - Validates email format
- **`min()`** / **`max()`** - Validates number ranges
- **`minLength()`** / **`maxLength()`** - Validates string or collection length
- **`pattern()`** - Validates against a regex pattern

You can also customize error messages by passing an options object as the second argument to the validator:

```ts
required(p.email, { message: 'Email is required' });
email(p.email, { message: 'Please enter a valid email address' });
```

Each form field exposes its validation state through signals. For example, you can check `field().valid()` to see if validation passes, `field().touched()` to see if the user has interacted with it, and `field().errors()` to get the list of validation errors.

Here's a complete example:

<docs-code-multifile preview path="adev/src/content/examples/signal-forms/src/login-validation/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-validation/app/app.css"/>
</docs-code-multifile>

### Field State Signals

Every `field()` provides these state signals:

| State        | Description                                                                |
| ------------ | -------------------------------------------------------------------------- |
| `valid()`    | Returns `true` if the field passes all validation rules                    |
| `touched()`  | Returns `true` if the user has focused and blurred the field               |
| `dirty()`    | Returns `true` if the user has changed the value                           |
| `disabled()` | Returns `true` if the field is disabled                                    |
| `pending()`  | Returns `true` if async validation is in progress                          |
| `errors()`   | Returns an array of validation errors with `kind` and `message` properties |

TIP: Show errors only after `field().touched()` is true to avoid displaying validation messages before the user has interacted with a field.
