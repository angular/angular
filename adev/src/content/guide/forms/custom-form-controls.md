# Custom form controls

Custom form controls let you build reusable UI components that plug into Angular forms just like native inputs. They use the `ControlValueAccessor` interface so Angular can write values into your component and so your component can report changes back to Angular’s forms API (status, validation, dirty/touched, and two‑way binding).

## Implementing `ControlValueAccessor`

Implement the following methods on your component and register it as a value accessor:

- [`writeValue`](api/forms/ControlValueAccessor#writeValue) — Writes a new value to the element. The forms API calls this method when programmatic changes from model to view are requested. Update your view to reflect the new value without emitting a change event.
- [`registerOnChange`](api/forms/ControlValueAccessor#registerOnChange) — Registers a callback function that is called when the control's value changes in the UI. The forms API calls this method on initialization. Save the callback and invoke it whenever your control's value changes to notify the forms API.
- [`registerOnTouched`](api/forms/ControlValueAccessor#registerOnTouched) — Registers a callback function that is called when the control should be considered touched. The forms API calls this method on initialization. Save the callback and invoke it when the control is touched.
- [`setDisabledState`](api/forms/ControlValueAccessor#setDisabledState) — Optional. Sets the disabled state on the element.

Provide your component with `NG_VALUE_ACCESSOR` using `multi: true` so it can act as a value accessor for its host element.

## Creating a custom control

The example below implements a rating input that works with Angular forms.

<docs-code-multifile>
    <docs-code header="rating-input.ts" path="adev/src/content/examples/custom-form-controls/src/app/rating-input/rating-input.ts" />
    <docs-code header="rating-input.html" path="adev/src/content/examples/custom-form-controls/src/app/rating-input/rating-input.html" />
    <docs-code header="rating-input.css" path="adev/src/content/examples/custom-form-controls/src/app/rating-input/rating-input.css"/>
</docs-code-multifile>

In this example, clicking a star updates the internal value and calls the registered `onChange()` callback to notify Angular’s forms API.

## Using custom controls in forms

Custom controls work in both reactive and template‑driven forms.

### Reactive forms

Bind with `formControlName` exactly as you would with native inputs.

<docs-code-multifile>
    <docs-code header="app.html" path="adev/src/content/examples/custom-form-controls/src/app/app.html"  />
    <docs-code header="app.ts" path="adev/src/content/examples/custom-form-controls/src/app/app.ts"  />
    <docs-code header="app.css" path="adev/src/content/examples/custom-form-controls/src/app/app.css"  />
</docs-code-multifile>

### Template-driven forms

Use `[(ngModel)]` for two‑way binding.

<docs-code-multifile>
    <docs-code header="app.ts" path="adev/src/content/examples/custom-form-controls/src/app/app-form-template.ts"  />
    <docs-code header="app.html" path="adev/src/content/examples/custom-form-controls/src/app/app-form-template.html"  />
    <docs-code header="app.css" path="adev/src/content/examples/custom-form-controls/src/app/app.css"  />
</docs-code-multifile>

## Using `NgControl`

Angular attaches a `NgControl` directive to the element that hosts your component whenever it is combined with `formControlName`, `ngModel`, or another form binding. Inject that directive when your component needs to coordinate with the parent form control instead of asking the consumer to pass state through inputs.

Use `inject(NgControl, {self: true})` to request the control that lives on the same element. The `self: true` option ensures you get the control on the current element.

<docs-code-multifile>
    <docs-code header="custom-input.ts" path="adev/src/content/examples/custom-form-controls/src/app/custom-input/custom-input.ts" visibleRegion="ngcontrol"/>
    <docs-code header="custom-input.html" path="adev/src/content/examples/custom-form-controls/src/app/custom-input/custom-input.html" />
    <docs-code header="custom-input.css" path="adev/src/content/examples/custom-form-controls/src/app/custom-input/custom-input.css"/>
</docs-code-multifile>

In this example, the component injects `NgControl` and sets itself as the `valueAccessor` in the constructor. It subscribes to the control's `events` to update validation signals reactively.

The `firstError` signals are updated whenever the control's validation state changes, providing efficient reactive updates to the template.

This pattern keeps the component self-sufficient: it can surface validation messages, toggle CSS classes, and observe form state changes without requiring extra inputs. Setting `valueAccessor` in the constructor also means the component no longer needs to declare an explicit `NG_VALUE_ACCESSOR` provider when you choose to register it imperatively.

## Adding validation support

To validate inside your control, implement the `Validator` interface and register `NG_VALIDATORS`. The `validate(control)` method should return a `ValidationErrors` object when invalid, or `null` when valid.

<docs-code header="rating-input.ts (with validation)" path="adev/src/content/examples/custom-form-controls/src/app/rating-input/rating-input-validation.ts" visibleRegion="validation"/>

If your validation depends on component inputs, implement [`registerOnValidatorChange`](/api/forms/Validator#registerOnValidatorChange) to re‑run validation when inputs change:

<docs-code header="rating-input.ts (dynamic validation)" path="adev/src/content/examples/custom-form-controls/src/app/rating-input/rating-input-dynamic-validation.ts" visibleRegion="dynamic-validation"/>

## Centralizing validation errors

For applications with multiple forms, you can centralize error display logic by creating a directive that automatically renders validation messages. The directive attaches to any element with `formControl` or `formControlName`, subscribes to `focusout` events and `statusChanges`, and dynamically creates an error component when validation fails.

<docs-code-multifile>
    <docs-code header="control-errors.directive.ts" path="adev/src/content/examples/custom-form-controls/src/app/validation-error/directive/control-errors.directive.ts" visibleRegion="directive"/>
    <docs-code header="control-error.token.ts" path="adev/src/content/examples/custom-form-controls/src/app/validation-error/token/control-error.token.ts"  />
    <docs-code header="validation-error.ts" language="angular-ts" path="adev/src/content/examples/custom-form-controls/src/app/validation-error/component/validation-error.ts" />
    <docs-code header="app-validation-error.html" path="adev/src/content/examples/custom-form-controls/src/app/app-validation-error.html" />
</docs-code-multifile>

This pattern separates error display concerns from form controls, letting your components focus on value management while the directive handles validation feedback consistently across your application.

## Next steps

<docs-pill-row>
  <docs-pill href="guide/forms/reactive-forms" title="Reactive forms"/>
  <docs-pill href="guide/forms/form-validation" title="Form validation"/>
  <docs-pill href="api/forms/ControlValueAccessor" title="ControlValueAccessor API reference"/>
  <docs-pill href="api/forms/NgControl" title="NgControl API reference"/>
</docs-pill-row>
