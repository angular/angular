# Advanced component configuration

TIP: This guide assumes you've already read the [Essentials Guide](essentials). Read that first if you're new to Angular.

## ChangeDetectionStrategy

The `@Component` decorator accepts a `changeDetection` option that controls the component's **change
detection mode**. There are two change detection mode options.

**`ChangeDetectionStrategy.Eager`** is an optional mode. In this mode,
Angular checks whether the component's DOM needs an update whenever any activity may have occurred
application-wide. Activities that trigger this checking include user interaction, network response,
timers, and more.

**`ChangeDetectionStrategy.OnPush`** is the default strategy (since v22). This mode reduces the amount of checking Angular
needs to perform. In this mode, the framework only checks if a component's DOM needs an update when:

- A component input has changes as a result of a binding in a template, or
- An event listener in this component runs
- The component is explicitly marked for check, via `ChangeDetectorRef.markForCheck` or something which wraps it, like `AsyncPipe`.
- A signal read in the component's template changes.

In the first three cases, Angular _also_ checks all of the component's ancestor
components, traversing upwards through the application tree. When a signal changes, Angular only
refreshes the components whose templates read it.

## PreserveWhitespaces

By default, Angular removes and collapses superfluous whitespace in templates, most commonly from
newlines and indentation. You can change this setting by explicitly setting `preserveWhitespaces` to
`true` in a component's metadata.

## Custom element schemas

By default, Angular throws an error when it encounters an unknown HTML element. You can
disable this behavior for a component by including `CUSTOM_ELEMENTS_SCHEMA` in the `schemas`
property in your component metadata.

```angular-ts
import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

@Component({
  ...,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: '<some-unknown-component />'
})
export class ComponentWithCustomElements { }
```

Angular also provides `NO_ERRORS_SCHEMA`, which allows any element and any property.
