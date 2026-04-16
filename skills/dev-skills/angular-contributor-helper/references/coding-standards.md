# Angular Framework Coding Standards

[Full source](https://github.com/angular/angular/blob/main/contributing-docs/coding-standards.md)

These apply to development on Angular itself, not applications built with Angular.

## Code Style

Based on the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) with additional TypeScript guidance. The team uses `prettier` for automatic formatting, enforced by CI.

## Comments

- Comments explaining _what_ code does are nice.
- Comments explaining _why_ code exists are invaluable.
- Use JsDoc-style comments for descriptions (classes, members, etc.) and `//` for everything else.

```typescript
// GOOD: explains why
// Unless the user specifies otherwise, the calendar should not be a tab stop.
// This prevents ngAria from overzealously adding a tabindex to anything with an ng-model.
if (!attributes['tabindex']) {
  element.setAttribute('tabindex', '-1');
}
```

## API Design

### Boolean Arguments

Avoid boolean arguments that mean "do something extra". Prefer separate functions:

```typescript
// AVOID
function getTargetElement(createIfNotFound = false) { ... }

// PREFER
function getExistingTargetElement() { ... }
function createTargetElement() { ... }
```

### Optional Arguments

Only use when the argument makes sense for the API or is required for performance. Not for implementation convenience.

## TypeScript

### Typing

Avoid `any`. Consider `generic` or `unknown` instead.

### Getters and Setters

- Only use for `@Input` properties or API compatibility.
- Avoid long or complex accessors (max ~3 lines, otherwise use a method).
- Getter should immediately precede its setter.
- Decorators like `@Input` go on the getter.
- Prefer `readonly` over getter-only:

```typescript
// YES
readonly active: boolean;

// NO
get active(): boolean { return this._active; }
```

### Iteration

Prefer `for` or `for of` over `Array.prototype.forEach`.

### JsDoc

- All public APIs must have user-facing JsDoc comments.
- Properties: concise description of what the property means.
- Methods: describe what the function does, each parameter, and the return value.
- Booleans: use "Whether..." not "True if...":

```typescript
/** Whether the button is disabled. */
disabled: boolean = false;
```

### Try-Catch

Only for legitimately unexpected errors. Each `try-catch` **must** include a comment explaining the specific error and why it cannot be prevented.

### Variables

Prefer `const`, use `let` only when value must change. Avoid `var`.

Use `readonly` members wherever possible.

## Naming

### General

- Write out words, avoid abbreviations.
- Prefer exact names over short names (`labelPosition` > `align`).
- Use `is`/`has` prefixes for booleans (except `@Input` properties).
- Name based on responsibility, not usage:

```typescript
// NO
class DefaultRouteReuseStrategy {}

// YES
class NonStoringRouteReuseStrategy {}
```

### Observables

Don't suffix with `$`.

### Classes

PascalCase. Don't end with `Impl`.

### Interfaces

Don't prefix with `I`. Don't suffix with `Interface`.

### Functions and Methods

camelCase. Name should capture the action performed, not when it's called:

```typescript
// AVOID
handleClick() { ... }

// PREFER
activateRipple() { ... }
```

### Constants and Injection Tokens

UPPER_SNAKE_CASE.

### Test Classes

Give meaningful, descriptive names:

```typescript
// PREFER
class FormGroupWithCheckboxAndRadios { ... }
class InputWithNgModel { ... }

// AVOID
class Comp { ... }
class InputComp { ... }
```

## RxJS

Alias `of` as `observableOf`:

```typescript
import {of as observableOf} from 'rxjs';
```

## Testing

Use descriptive test names that read as sentences, typically "it should...":

```typescript
// PREFER
describe('Router', () => {
  describe('with the default route reuse strategy', () => {
    it('should not reuse routes upon location change', () => { ... });
  });
});

// AVOID
describe('Router', () => {
  describe('default strategy', () => {
    it('should work', () => { ... });
  });
});
```
