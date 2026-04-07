# Signal Forms Integration: Compiler & Core

This document explains how the Signal Forms system hooks into the Angular compiler and runtime to provide seamless type-checking and efficient updates.

## 1. Compiler-CLI Integration (Type Checking)

The `packages/compiler-cli` package contains specific logic to support `[formField]`. This is primarily handled in `src/ngtsc/typecheck/src/ops/signal_forms.ts`.

### Key Mechanisms:

- **Detection**: The compiler identifies a directive as a "Field Directive" if it has the `ɵNgFieldDirective` property or comes from `@angular/forms/signals`.
- **Synthetic Binding Expansion**: When you write `<input [formField]="mySignal" />`, the type checker doesn't just check `formField`. It synthetically expands this into a set of bindings for validation:
  - `[value]="mySignal()"` (or `checked` for checkboxes)
  - `[disabled]="mySignal.disabled()"`
  - `[required]="mySignal.required()"`
  - ...and so on.
  - This ensures that `mySignal` (the `FieldNode`) has all the necessary properties to drive the form control.
- **Conflict Detection**: It actively prevents "double binding". If you bind `[formField]`, you are _banned_ from also binding `[value]`, `[disabled]`, `[required]`, etc., as the signal form should be the single source of truth.
- **Element Type Validation**:
  - **Native Elements**: Checks that the signal's value type matches the element type (e.g., `<input type="checkbox">` requires a `boolean` signal).
  - **Custom Controls**: Detects if a custom component is a "Form Value Control" (has a `value` input/output) or "Form Checkbox Control" (has a `checked` input/output) and validates against that.

### Relevant Files:

- `packages/compiler-cli/src/ngtsc/typecheck/src/ops/signal_forms.ts`: The core logic for `TcbNativeFieldOp` and `SignalFormFieldOp`.

## 2. Core Runtime Integration

The `packages/core` package provides the low-level instructions that power the `FormField` directive. This allows it to do things normal directives cannot, like efficiently syncing state without change detection overhead for every property.

### Key Mechanisms:

- **`ɵngControlCreate` Hook**: The `FormField` directive defines a special method `ɵngControlCreate`.
- **`ɵɵcontrol` Instructions**: When the compiler sees `ɵngControlCreate`, it emits:
  - `ɵɵcontrolCreate`: Called during the creation phase.
  - `ɵɵcontrol`: Called during the update phase.
- **`ControlDirectiveHost`**: These instructions provide the directive with a `ControlDirectiveHost`. This is a privileged interface that allows the `FormField` directive to:
  - **Access the Element**: Get direct access to the native element or component instance.
  - **Set Inputs**: Write directly to inputs of _other directives_ on the same node (e.g., setting the `value` input of a custom control).
  - **Listen to Outputs**: Subscribe to outputs of other directives (e.g., `valueChange`).
  - **Bypass Templates**: It effectively acts as a "meta-directive" that manages the bindings for you, bypassing the need for explicit template syntax for every property.

### Relevant Files:

- `packages/core/src/render3/instructions/control.ts`: Implementation of `ɵɵcontrol` instructions.
- `packages/forms/signals/src/directive/form_field_directive.ts`: The directive that implements the hook.
