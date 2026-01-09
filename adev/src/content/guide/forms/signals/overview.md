<docs-decorative-header title="Forms with Angular Signals" imgSrc="adev/src/assets/images/signals.svg"> <!-- markdownlint-disable-line -->
</docs-decorative-header>

CRITICAL: Signal Forms are [experimental](/reference/releases#experimental). The API may change in future releases. Avoid using experimental APIs in production applications without understanding the risks.

Signal Forms is an experimental library that allows you to manage form state in Angular applications by building on the reactive foundation of signals. With automatic two-way binding, type-safe field access, and schema-based validation, Signal Forms help you create robust forms.

TIP: For a quick introduction to Signal Forms, see the [Signal Forms essentials guide](essentials/signal-forms).

## Why Signal Forms?

Building forms in web applications involves managing several interconnected concerns: tracking field values, validating user input, handling error states, and keeping the UI synchronized with your data model. Managing these concerns separately creates boilerplate code and complexity.

Signal Forms address these challenges by:

- **Synchronizing state automatically** - Automatically syncs the form data model with bound form fields
- **Providing type safety** - Supports fully type safe schemas & bindings between your UI controls and data model
- **Centralizing validation logic** - Define all validation rules in one place using a validation schema

Signal Forms work best in new applications built with signals. If you're working with an existing application that uses reactive forms, or if you need production stability guarantees, reactive forms remain a solid choice.

NOTE: If you're coming from template or reactive forms, you may be interested in the [comparison guide](guide/forms/signals/comparison).

## Prerequisites

Signal Forms require:

- Angular v21 or higher

## Setup

Signal Forms are already included in the `@angular/forms` package. Import the necessary functions and directives from `@angular/forms/signals`:

```ts
import {form, FormField, required, email} from '@angular/forms/signals';
```

The `FormField` directive must be imported into any component that binds form fields to HTML inputs:

```ts
@Component({
  // ...
  imports: [FormField],
})
```

## Next steps

To learn more about how Signal Forms work, check out the following guides:

<docs-pill-row>
  <docs-pill href="essentials/signal-forms" title="Signal forms essentials" />
  <docs-pill href="guide/forms/signals/models" title="Form models" />
  <docs-pill href="guide/forms/signals/designing-your-form-model" title="Designing your form model" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/custom-controls" title="Custom controls" />
  <docs-pill href="guide/forms/signals/comparison" title="Comparison with other form systems" />
</docs-pill-row>
