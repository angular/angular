---
name: reference-signal-forms
description: Explains the mental model and architecture of the code under `packages/forms/signals`. You MUST use this skill any time you plan to work with code in `packages/forms/signals`
---

# Signal Forms Architecture

The `packages/forms/signals` directory contains an experimental, signal-based forms API for Angular.
This system differs significantly from the existing Reactive and Template-driven forms.

## Mental Model

1.  **Model-Driven**: The system is built around a `WritableSignal<T>` which serves as the **single source of truth**.
    Unlike Reactive Forms where the `FormControl` holds the value, here the `Signal` holds the value.
    The form is merely a _view_ or _projection_ of that signal, adding form-specific state (validity, dirty, touched).

2.  **Proxy-Based Traversal**: The form API (`form(signal)`) returns a `FieldTree`. This object is a **Proxy**.
    It allows accessing nested fields (e.g., `myForm.user.name`) without manually creating control groups.
    Accessing a property on the proxy lazily resolves or creates the corresponding `FieldNode`.

3.  **Schema-Based Logic**: Validation, disabled state, and other metadata are defined separately via **Schemas**.
    Schemas are applied to the form structure using functions like `apply`, `applyEach` (for arrays), and `applyWhen`.
    This separates the _structure_ of the data from the _rules_ governing it.

4.  **Directives as Glue**: The `[formField]` directive binds a DOM element (native input or custom control) to a `FieldNode`.
    It handles:
    - Syncing the value between the DOM and the Signal.
    - Reflecting state (valid, touched, etc.) to the UI.
    - Handling user interaction events (blur, input).

## Key Components

### 1. `FieldNode` (`src/field/node.ts`)

The central internal class representing a single field in the form graph. It aggregates several state managers:

- `structure`: Manages parent/child relationships and signal slicing.
- `validationState`: Computes `valid`, `invalid`, `errors` signals.
- `nodeState`: Tracks `touched`, `dirty`, `pristine`.
- `metadataState`: Stores metadata like `min`, `max`, `required`.
- `submitState`: Tracks submission status and server errors.

### 2. `ValidationState` (`src/field/validation.ts`)

Manages the complexity of validation:

- **Synchronous Errors**: Derived from schema rules.
- **Asynchronous Errors**: Handled via signals, including 'pending' states.
- **Tree Errors**: Errors that bubble up or are targeted at specific fields.
- **Submission Errors**: Server-side errors injected imperatively via `submit()`.

### 3. `FormField` Directive (`src/directive/form_field_directive.ts`)

The bridge between the `FieldNode` and the DOM.

- Selector: `[formField]`
- It supports:
  - **Native Elements**: `<input>`, `<select>`, `<textarea>`.
  - **Custom Controls**: Components implementing `FormUiControl` or `FormValueControl`.
  - **Legacy Interop**: Components implementing `ControlValueAccessor` (via `InteropNgControl`).

### 4. `Schema` (`src/api/structure.ts` & `src/api/rules`)

Defines the behavior.

- Created via `schema(fn)`.
- Applied via `apply(path, schema)`.
- Rules include validators (`required`, `pattern`, `min`, `max`) and state modifiers (`disabled`, `hidden`).

## Data Flow

1.  **Read**: `form.field.value()` reads directly from the underlying signal (projected to the specific path).
2.  **Write**: Writing to the form (e.g., via UI) updates the underlying signal.
3.  **Validation**: A computed effect observes the value signal and runs validators defined in the schema.

## Usage Example (Conceptual)

```typescript
// 1. Define Model
const user = signal({name: '', age: 0});

// 2. Define Schema
const userRules = schema((u) => {
  required(u.name);
  min(u.age, 18);
});

// 3. Create Form
const userForm = form(user, userRules); // OR apply(userForm, userRules)

// 4. Bind in Template
// <input [formField]="userForm.name">
```

## Important Files

- `packages/forms/signals/src/api/structure.ts`: Public API entry points (`form`, `apply`).
- `packages/forms/signals/src/api/control.ts`: Interfaces for custom controls (`FormUiControl`).
- `packages/forms/signals/src/field/node.ts`: The `FieldNode` implementation.
- `packages/forms/signals/src/directive/form_field_directive.ts`: The `[formField]` directive.

## Supplemental Information

- [Compiler & Core Integration](references/integration.md): Details how `[formField]` hooks into type-checking and the runtime.
