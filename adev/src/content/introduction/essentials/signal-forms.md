<docs-decorative-header title="Forms with signals" imgSrc="adev/src/assets/images/signals.svg"> </docs-decorative-header>

IMPORTANT: Signal Forms are [experimental](/reference/releases#experimental). The API may change in future releases. Avoid using experimental APIs in production applications without understanding the risks.

Signal Forms manage form state using Angular signals to provide automatic synchronization between your data model and the UI with Angular Signals.

This guide walks you through the core concepts to create forms with Signal Forms. Here's how it works:

## Creating your first form

### 1. Create a form model with `signal()`

Every form starts by creating a signal that holds your form's data model:

```ts
interface LoginData {
  email: string;
  password: string;
}

const loginModel = signal<LoginData>({
  email: '',
  password: '',
});
```

### 2. Pass the form model to `form()` to create a `FieldTree`

Then, you pass your form model into the `form()` function to create a **field tree** - an object structure that mirrors your model's shape, allowing you to access fields with dot notation:

```ts
const loginForm = form(loginModel);

// Access fields directly by property name
loginForm.email;
loginForm.password;
```

### 3. Bind HTML inputs with `[formField]` directive

Next, you bind your HTML inputs to the form using the `[formField]` directive, which creates two-way binding between them:

```html
<input type="email" [formField]="loginForm.email" />
<input type="password" [formField]="loginForm.password" />
```

As a result, user changes (such as typing in the field) automatically updates the form.

NOTE: The `[formField]` directive also syncs field state for attributes like `required`, `disabled`, and `readonly` when appropriate.

### 4. Read field values with `value()`

You can access field state by calling the field as a function. This returns a `FieldState` object containing reactive signals for the field's value, validation status, and interaction state:

```ts
loginForm.email(); // Returns FieldState with value(), valid(), touched(), etc.
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

### 5. Update field values with `set()`

You can programmatically update a field's value using the `value.set()` method. This updates both the field and the underlying model signal:

```ts
// Update the value programmatically
loginForm.email().value.set('alice@wonderland.com');
```

As a result, both the field value and the model signal are updated automatically:

```ts
// The model signal is also updated
console.log(loginModel().email); // 'alice@wonderland.com'
```

Here's a complete example:

<docs-code-multifile preview path="adev/src/content/examples/signal-forms/src/login-simple/app/app.ts">
  <docs-code header="app.ts" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.ts"/>
  <docs-code header="app.html" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.html"/>
  <docs-code header="app.css" path="adev/src/content/examples/signal-forms/src/login-simple/app/app.css"/>
</docs-code-multifile>

## Basic usage

The `[formField]` directive works with all standard HTML input types. Here are the most common patterns:

### Text inputs

Text inputs work with various `type` attributes and textareas:

```html
<!-- Text and email -->
<input type="text" [formField]="form.name" />
<input type="email" [formField]="form.email" />
```

#### Numbers

Number inputs automatically convert between strings and numbers:

```html
<!-- Number - automatically converts to number type -->
<input type="number" [formField]="form.age" />
```

#### Date and time

Date inputs store values as `YYYY-MM-DD` strings, and time inputs use `HH:mm` format:

```html
<!-- Date and time - stores as ISO format strings -->
<input type="date" [formField]="form.eventDate" />
<input type="time" [formField]="form.eventTime" />
```

If you need to convert date strings to Date objects, you can do so by passing the field value into `Date()`:

```ts
const dateObject = new Date(form.eventDate().value());
```

#### Multiline text

Textareas work the same way as text inputs:

```html
<!-- Textarea -->
<textarea [formField]="form.message" rows="4"></textarea>
```

### Checkboxes

Checkboxes bind to boolean values:

```html
<!-- Single checkbox -->
<label>
  <input type="checkbox" [formField]="form.agreeToTerms" />
  I agree to the terms
</label>
```

#### Multiple checkboxes

For multiple options, create a separate boolean `formField` for each:

```html
<label>
  <input type="checkbox" [formField]="form.emailNotifications" />
  Email notifications
</label>
<label>
  <input type="checkbox" [formField]="form.smsNotifications" />
  SMS notifications
</label>
```

### Radio buttons

Radio buttons work similarly to checkboxes. As long as the radio buttons use the same `[formField]` value, Signal Forms will automatically bind the same `name` attribute to all of them:

```html
<label>
  <input type="radio" value="free" [formField]="form.plan" />
  Free
</label>
<label>
  <input type="radio" value="premium" [formField]="form.plan" />
  Premium
</label>
```

When a user selects a radio button, the form `formField` stores the value from that radio button's `value` attribute. For example, selecting "Premium" sets `form.plan().value()` to `"premium"`.

### Select dropdowns

Select elements work with both static and dynamic options:

```angular-html
<!-- Static options -->
<select [formField]="form.country">
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="ca">Canada</option>
</select>

<!-- Dynamic options with @for -->
<select [formField]="form.productId">
  <option value="">Select a product</option>
  @for (product of products; track product.id) {
    <option [value]="product.id">{{ product.name }}</option>
  }
</select>
```

NOTE: Multiple select (`<select multiple>`) is not supported by the `[formField]` directive at this time.

## Validation and state

Signal Forms provides built-in validators that you can apply to your form fields. To add validation, pass a schema function as the second argument to `form()`:

```ts
const loginForm = form(loginModel, (schemaPath) => {
  debounce(schemaPath.email, 500);
  required(schemaPath.email);
  email(schemaPath.email);
});
```

The schema function receives a **schema path** parameter that provides paths to your fields for configuring validation rules.

Common validators include:

- **`required()`** - Ensures the field has a value
- **`email()`** - Validates email format
- **`min()`** / **`max()`** - Validates number ranges
- **`minLength()`** / **`maxLength()`** - Validates string or collection length
- **`pattern()`** - Validates against a regex pattern

You can also customize error messages by passing an options object as the second argument to the validator:

```ts
required(schemaPath.email, {message: 'Email is required'});
email(schemaPath.email, {message: 'Please enter a valid email address'});
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
| `readonly()` | Returns `true` if the field is readonly                                    |
| `pending()`  | Returns `true` if async validation is in progress                          |
| `errors()`   | Returns an array of validation errors with `kind` and `message` properties |

## Next steps

To learn more about Signal Forms and how it works, check out the in-depth guides:

- [Overview](guide/forms/signals/overview) - Introduction to Signal Forms and when to use them
- [Form models](guide/forms/signals/models) - Creating and managing form data with signals
- [Field state management](guide/forms/signals/field-state-management) - Working with validation state, interaction tracking, and field visibility
- [Validation](guide/forms/signals/validation) - Built-in validators, custom validation rules, and async validation
