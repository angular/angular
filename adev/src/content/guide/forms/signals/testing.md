# Testing Signal Forms

Forms are often a critical part of applications. Testing provides the confidence you need that the forms behave as expected when the codebase changes. Signal Forms keeps most of its logic in the schema rather than the template, which means you can test the majority of form behavior without rendering a component.

This guide walks through how to set up those tests, starting with isolated logic tests and then covering component-bound tests for cases where DOM interaction matters.

## Testing form logic in isolation

When you only need to verify validation, disabled state, required state, or error output, test the form directly instead of rendering a component. Isolated tests keep the setup small and let the test focus on the form's behavior.

The key requirement is the injector. Signal Forms needs an injection context during form creation. If a test calls `form()` without one, the call throws before the test can assert anything about the form.

The most direct way to satisfy this requirement is to pass an injector explicitly. The following test creates a form with a `required` rule and verifies that the field becomes valid after receiving a value:

```ts {header: 'profile-form.spec.ts'}
import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, required} from '@angular/forms/signals';
import {describe, expect, it} from 'vitest';

describe('profile form', () => {
  it('marks required fields as invalid until they have a value', () => {
    const model = signal({name: ''});

    const profileForm = form(
      model,
      (path) => {
        required(path.name);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(profileForm.name().valid()).toBe(false);
    expect(profileForm.name().errors()).toEqual([expect.objectContaining({kind: 'required'})]);

    profileForm.name().value.set('Ada');

    expect(profileForm.name().valid()).toBe(true);
    expect(profileForm.name().errors()).toEqual([]);
  });
});
```

This pattern works well for most isolated tests because the injector requirement stays visible at the call site. It also matches the way many Signal Forms tests in Angular's source create forms in unit tests.

When the code under test calls `form()` internally, you may not be able to pass the injector directly. In that case, wrap the call in an ambient injection context:

```ts {header: 'profile-form.spec.ts'}
import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, required} from '@angular/forms/signals';
import {describe, expect, it} from 'vitest';

describe('profile form', () => {
  it('can create a form inside an injection context', () => {
    const model = signal({name: ''});

    TestBed.runInInjectionContext(() => {
      const profileForm = form(model, (path) => {
        required(path.name);
      });

      expect(profileForm.name().valid()).toBe(false);
    });
  });
});
```

Both patterns produce the same kind of form. Passing `{injector}` is often the clearest choice when the test creates the form directly. `TestBed.runInInjectionContext()` is useful when the code under test calls `form()` internally and you need to supply the surrounding injection context.

Once the form exists, test it through field state signals. Common assertions include `valid()`, `invalid()`, `disabled()`, `required()`, and `errors()`. For most form logic, that is enough to verify the behavior without involving the DOM.

## Testing a form with multiple rules

After the injector setup is in place, a good next step is a complete test that exercises a few pieces of form logic together. This kind of test is still isolated, but it looks much closer to a real application form.

For example, this test verifies both a basic required rule and a conditional required rule that depends on another field:

```ts {header: 'profile-form.spec.ts'}
import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, required} from '@angular/forms/signals';
import {describe, expect, it} from 'vitest';

describe('profile form', () => {
  it('updates validation state when related fields change', () => {
    const model = signal({
      name: '',
      age: 5,
    });

    const profileForm = form(
      model,
      (path) => {
        required(path.name);
        required(path.name, {
          error: (ctx) => ({kind: `required-${ctx.valueOf(path.age)}`}),
          when: ({valueOf}) => valueOf(path.age) > 10,
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(profileForm.name().invalid()).toBe(true);
    expect(profileForm.name().errors()).toEqual([expect.objectContaining({kind: 'required'})]);

    profileForm.age().value.set(15);

    expect(profileForm.name().errors()).toEqual([
      expect.objectContaining({kind: 'required'}),
      expect.objectContaining({kind: 'required-15'}),
    ]);

    profileForm.name().value.set('Ada');

    expect(profileForm.name().valid()).toBe(true);
    expect(profileForm.name().errors()).toEqual([]);
  });
});
```

This example shows an important testing pattern: update one field, then assert against the state of another field. Because Signal Forms rules are reactive, a field's validation can depend on sibling values, parent values, or other derived conditions. Tests should verify those relationships directly instead of only checking the field that changed.

For validation-focused tests, `errors()` is usually the most useful assertion. `valid()` and `invalid()` tell you whether the field currently passes validation, but `errors()` shows which rule produced the failure. That becomes especially useful once a field has multiple validators or conditional rules.

The same structure works for most everyday form tests:

1. Create a model signal with the smallest shape that reproduces the behavior.
1. Build the form with an explicit injector.
1. Assert the initial field state.
1. Change a field with `.value.set(...)`, including sibling fields when testing cross-field rules.
1. Assert the updated state signals, usually `errors()`, `valid()`, or `invalid()`.

When a test is about schema behavior rather than rendering, this isolated style should remain the default. It is faster than a component test and makes it easier to see which rule is responsible when the behavior changes.

## Testing forms bound to components

When you need to verify behavior that depends on template bindings, user interaction through `dispatchEvent`, or custom form controls that manage their own rendering, isolated tests are not enough. You need component-bound tests to render the template so that you can interact with actual DOM elements.

### Setting up a component test

Component-bound tests require more setup than isolated tests because you need a rendered template and a change detection cycle. Create the component with `TestBed.createComponent()` and wait for rendering to complete before asserting:

```angular-ts {header: 'profile-form.ts'}
import {Component, signal} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';

@Component({
  selector: 'app-profile-form',
  imports: [FormField],
  template: `<input [formField]="profileForm.name" />`,
})
export class ProfileForm {
  readonly model = signal({name: 'Ada'});
  readonly profileForm = form(this.model, (path) => {
    required(path.name);
  });
}
```

```ts {header: 'profile-form.spec.ts'}
import {provideZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from 'vitest';
import {ProfileForm} from './profile-form';

describe('ProfileForm', () => {
  it('reflects model values in the DOM and updates the model on user input', async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    const fixture = TestBed.createComponent(ProfileForm);
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    // Model → View: the input reflects the model's initial value
    expect(input.value).toBe('Ada');

    // View → Model: simulate the user clearing the field
    input.value = '';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.profileForm.name().value()).toBe('');
    expect(fixture.componentInstance.profileForm.name().valid()).toBe(false);
  });
});
```

Notice that the component uses `form()` without an explicit injector because the component's own injection context provides it automatically. The `provideZonelessChangeDetection()` provider tells the test to use zoneless change detection, which is Angular's default direction. After each change, `await fixture.whenStable()` waits for rendering and effects to complete before asserting.

This works, but Signal Forms state updates are synchronous — validation, disabled state, and errors all resolve immediately when a value changes. That means you can flush pending effects directly with `TestBed.tick()` instead of awaiting stabilization. The result is a tighter loop with no `async`/`await`.

### The act, wait, assert pattern

Every interaction in a component test follows three steps:

1. **Act** — Change something: set an input value, dispatch an event, update a signal.
1. **Wait** — Call `TestBed.tick()` to flush change detection so the DOM and signals reflect the change.
1. **Assert** — Check the expected state.

Here is the same user-input scenario from the previous test, rewritten with `TestBed.tick()`:

```ts
// Act
input.value = '';
input.dispatchEvent(new Event('input'));

// Wait
TestBed.tick();

// Assert
expect(fixture.componentInstance.profileForm.name().value()).toBe('');
expect(fixture.componentInstance.profileForm.name().valid()).toBe(false);
```

For async operations such as async validators or server calls, use `await fixture.whenStable()` after the async work resolves to wait for all pending effects before asserting.

## When to use each approach

| What you need to verify                              | Approach        |
| ---------------------------------------------------- | --------------- |
| Validation rules, `errors()`, `valid()`, `invalid()` | Isolated        |
| Disabled, required, or readonly state                | Isolated        |
| Cross-field reactive dependencies                    | Isolated        |
| Conditional schemas (`applyWhen`, `applyWhenValue`)  | Isolated        |
| Input values rendering in the DOM                    | Component-bound |
| User typing updating the model                       | Component-bound |
| Custom form controls with their own templates        | Component-bound |
| Focus management or accessibility attributes         | Component-bound |

Most forms only need isolated tests. The form's logic (such as validation, disabled state, cross-field rules) lives in the schema, and schemas do not need a template to run. Component-bound tests add value when the behavior you care about crosses the boundary between the form and the DOM.

## Next steps

This guide covered testing Signal Forms in isolation and with component templates. Here are related guides that explore other aspects of Signal Forms:

<docs-pill-row>
  <docs-pill href="guide/forms/signals/validation" title="Validation" />
  <docs-pill href="guide/forms/signals/field-state-management" title="Field state management" />
  <docs-pill href="guide/forms/signals/form-submission" title="Form submission" />
</docs-pill-row>
