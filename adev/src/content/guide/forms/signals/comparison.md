# Comparison with other form approaches

Angular provides three approaches to building forms: Signal Forms, Reactive Forms, and Template-driven Forms. Each has distinct patterns for managing state, validation, and data flow. This guide helps you understand the differences and choose the right approach for your project.

NOTE: Signal Forms are [experimental](reference/releases#experimental) as of Angular v21. The API may change before stabilizing.

## Quick comparison

| Feature          | Signal Forms                       | Reactive Forms                        | Template-driven Forms   |
| ---------------- | ---------------------------------- | ------------------------------------- | ----------------------- |
| Source of truth  | User-defined writable signal model | `FormControl`/`FormGroup`             | User model in component |
| Type safety      | Inferred from model                | Explicit with typed forms             | Minimal                 |
| Validation       | Schema with path-based validators  | List of validators passed to Controls | Directive-based         |
| State management | Signal-based                       | Observable-based                      | Angular-managed         |
| Setup            | Signal + schema function           | FormControl tree                      | NgModel in template     |
| Best for         | Signal-based apps                  | Complex forms                         | Simple forms            |
| Learning curve   | Medium                             | Medium-High                           | Low                     |
| Status           | Experimental (v21+)                | Stable                                | Stable                  |

## By example: Login form

The best way to understand the differences is to see the same form implemented in all three approaches.

<docs-code-multifile>
  <docs-code language="angular-ts" header="Signal forms" path="adev/src/content/examples/signal-forms/src/comparison/app/signal-forms.ts"/>
  <docs-code header="Reactive forms" path="adev/src/content/examples/signal-forms/src/comparison/app/reactive-forms.ts"/>
  <docs-code header="Template-driven forms" path="adev/src/content/examples/signal-forms/src/comparison/app/template-driven-forms.ts"/>
</docs-code-multifile>

## Understanding the differences

The three approaches make different design choices that affect how you write and maintain your forms. These differences stem from where each approach stores form state and how it manages validation.

### Where your form data lives

The most fundamental difference is where each approach considers the "source of truth" for form values.

Signal Forms stores data in a writable signal. When you need the current form values, you call the signal:

```ts
const credentials = this.loginModel(); // { email: '...', password: '...' }
```

This keeps your form data in a single reactive container that automatically notifies Angular when values change. The form structure mirrors your data model exactly.

Reactive Forms stores data inside FormControl and FormGroup instances. You access values through the form hierarchy:

```ts
const credentials = this.loginForm.value; // { email: '...', password: '...' }
```

This separates form state management from your component's data model. The form structure is explicit but requires more setup code.

Template-driven Forms stores data in component properties. You access values directly:

```ts
const credentials = {email: this.email, password: this.password};
```

This is the most direct approach but requires manually assembling values when you need them. Angular manages form state through directives in the template.

### How validation works

Each approach defines validation rules differently, affecting where your validation logic lives and how you maintain it.

Signal Forms uses a schema function where you bind validators to field paths:

```ts
loginForm = form(this.loginModel, (fieldPath) => {
  required(fieldPath.email, {message: 'Email is required'});
  email(fieldPath.email, {message: 'Enter a valid email address'});
});
```

All validation rules live together in one place. The schema function runs once during form creation, and validators execute automatically when field values change. Error messages are part of the validation definition.

Reactive Forms attaches validators when creating controls:

```ts
loginForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
});
```

Validators are tied to individual controls in the form structure. This distributes validation across your form definition. Error messages typically live in your template.

Template-driven Forms uses directive attributes in the template:

```html
<input [(ngModel)]="email" required email />
```

Validation rules live in your template alongside the HTML. This keeps validation close to the UI but spreads logic across template and component.

### Type safety and autocomplete

TypeScript integration differs significantly between approaches, affecting how much the compiler helps you avoid errors.

Signal Forms infers types from your model structure:

```ts
const loginModel = signal({email: '', password: ''});
const loginForm = form(loginModel);
// TypeScript knows: loginForm.email exists and returns FieldState<string>
```

You define your data shape once in the signal, and TypeScript automatically knows what fields exist and their types. Accessing `loginForm.username` (which doesn't exist) produces a type error.

Reactive Forms requires explicit type annotations with typed forms:

```ts
const loginForm = new FormGroup({
  email: new FormControl<string>(''),
  password: new FormControl<string>(''),
});
// TypeScript knows: loginForm.controls.email is FormControl<string>
```

You specify types for each control individually. TypeScript validates your form structure, but you maintain type information separately from your data model.

Template-driven Forms offers minimal type safety:

```ts
email = '';
password = '';
// TypeScript only knows these are strings, no form-level typing
```

TypeScript understands your component properties but has no knowledge of form structure or validation. You lose compile-time checking for form operations.

## Choose your approach

### Use Signal Forms if:

- You're building new signal-based applications (Angular v21+)
- You want type safety inferred from your model structure
- You're comfortable working with experimental features
- Schema-based validation appeals to you
- Your team is familiar with signals

### Use Reactive Forms if:

- You need production-ready stability
- You're building complex, dynamic forms
- You prefer observable-based patterns
- You need fine-grained control over form state
- You're working on an existing reactive forms codebase

### Use Template-driven Forms if:

- You're building simple forms (login, contact, search)
- You're doing rapid prototyping
- Your form logic is straightforward
- You prefer keeping form logic in templates
- You're working on an existing template-driven codebase

## Next steps

To learn more about each approach:

- **Signal Forms**: See the [Overview guide](guide/forms/signals/overview) to get started, or dive into [Form Models](guide/forms/signals/models), [Validation](guide/forms/signals/validation), and [Field State Management](guide/forms/signals/field-state-management)
- **Reactive Forms**: See the [Reactive Forms guide](guide/forms/reactive-forms) in Angular documentation
- **Template-driven Forms**: See the [Template-driven Forms guide](guide/forms/template-driven-forms) in Angular documentation
