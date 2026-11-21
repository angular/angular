# Component host elements

TIP: This guide assumes you've already read the [Essentials Guide](essentials). Read that first if you're new to Angular.

Angular creates an instance of a component for every HTML element that matches the component's
selector. The DOM element that matches a component's selector is that component's **host element**.
The contents of a component's template are rendered inside its host element.

```angular-ts
// Component source
@Component({
  selector: 'profile-photo',
  template: `<img src="profile-photo.jpg" alt="Your profile photo" />`,
})
export class ProfilePhoto {}
```

```angular-html
<!-- Using the component -->
<h3>Your profile photo</h3>
<profile-photo />
<button>Upload a new profile photo</button>
```

```angular-html
<!-- Rendered DOM -->
<h3>Your profile photo</h3>
<profile-photo>
  <img src="profile-photo.jpg" alt="Your profile photo" />
</profile-photo>
<button>Upload a new profile photo</button>
```

In the above example, `<profile-photo>` is the host element of the `ProfilePhoto` component.

## Binding to the host element

A component can bind properties, attributes, styles and events to its host element. This behaves
identically to bindings on elements inside the component's template, but instead defined with
the `host` property in the `@Component` decorator:

```angular-ts
@Component({
  ...,
  host: {
    'role': 'slider',
    '[attr.aria-valuenow]': 'value',
    '[class.active]': 'isActive()',
    '[style.background]' : `hasError() ? 'red' : 'green'`,
    '[tabIndex]': 'disabled ? -1 : 0',
    '(keydown)': 'updateValue($event)',
  },
})
export class CustomSlider {
  value: number = 0;
  disabled: boolean = false;
  isActive = signal(false);
  hasError = signal(false);
  updateValue(event: KeyboardEvent) { /* ... */ }

  /* ... */
}
```

NOTE: The global target names that can be used to prefix an event name are `document:`, `window:` and `body:`.

NOTE: Key names like `'(keydown.enter)'` are matched against `KeyboardEvent.key`, which depends on
the user's keyboard layout and input language. To match a physical key regardless of layout, use
the `code` modifier instead, e.g. `'(keydown.code.Enter)'`. See
[Using key modifiers](guide/templates/event-listeners#using-key-modifiers) for details.

## The `@HostBinding` and `@HostListener` decorators

You can alternatively bind to the host element by applying the `@HostBinding` and `@HostListener`
decorator to class members.

`@HostBinding` lets you bind host properties and attributes to properties and getters:

```ts
@Component({/* ... */})
export class CustomSlider {
  @HostBinding('attr.aria-valuenow')
  value: number = 0;

  @HostBinding('tabIndex')
  get tabIndex() {
    return this.disabled ? -1 : 0;
  }

  /* ... */
}
```

`@HostListener` lets you bind event listeners to the host element. The decorator accepts an event
name and an optional array of arguments:

```ts
export class CustomSlider {
  @HostListener('keydown', ['$event'])
  updateValue(event: KeyboardEvent) {
    /* ... */
  }
}
```

<docs-callout critical title="Prefer using the `host` property over the decorators">
  **Always prefer using the `host` property over `@HostBinding` and `@HostListener`.** These
decorators exist exclusively for backwards compatibility.
</docs-callout>

## Binding collisions

When using a component in a template, you can apply bindings to that component's element. The component (or directives applied to it) may also define host bindings for the same properties, attributes, classes, or styles.

How Angular handles these collisions depends on the type of binding:

### Class and style bindings

Class and style bindings have a defined precedence order. Bindings defined in the template take priority over host bindings defined on directives or components:

1. **Template bindings** (e.g., `[class.active]` or `[style.color]`)
2. **Static template values** (e.g., `class="..."` or `style="..."` in the template)
3. **Directive host bindings**
4. **Component host bindings**
5. **Static host values** (e.g., `host: {class: '...'}`)

If a binding's value is `undefined`, Angular falls back to the next level. A `null` value removes the class or style without falling back.

### Property and attribute collisions

For non-styling properties and attributes (such as `id`, `role`, or `[attr.aria-*]`):

- **Static attributes:** If both the template and the component declare a static attribute (e.g., `<my-cmp id="parent">` and `host: {id: 'child'}`), the attribute set in the template wins.
- **Static and dynamic:** If one value is static and the other is dynamic, the dynamic value wins.
- **Dynamic bindings:** Avoid binding to the same DOM property or attribute both in the template and via host bindings. Angular does not reconcile duplicate property bindings; overlapping dynamic bindings can lead to unexpected overwrites based on change detection execution order.

## Styling with CSS custom properties

Developers often rely on [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties) to enable a flexible configuration of their component's styles.
You can set such custom properties on a host element with a [style binding](guide/templates/binding#css-style-properties).

```angular-ts
@Component({
  /* ... */
  host: {
    '[style.--my-background]': 'color()',
  },
})
export class MyComponent {
  color = signal('lightgreen');
}
```

In this example, the `--my-background` CSS custom property is bound to the `color` signal. The value of the custom property will automatically update whenever the `color` signal changes. This will affect the current component and all its children that rely on this custom property.

### Setting custom properties on children components

Alternatively, it is also possible to set css custom properties on the host element of children components with a [style binding](guide/templates/binding#css-style-properties).

```angular-ts
@Component({
  selector: 'my-component',
  template: `<my-child [style.--my-background]="color()" />`,
})
export class MyComponent {
  color = signal('lightgreen');
}
```

## Injecting host element attributes

Components and directives can read static attributes from their host element by using `HostAttributeToken` together with the [`inject`](api/core/inject) function.

```ts
import { Component, HostAttributeToken, inject } from '@angular/core';

@Component({
  selector: 'app-button',
  ...,
})
export class Button {
  variation = inject(new HostAttributeToken('variation'));
}
```

```angular-html
<app-button variation="primary">Click me</app-button>
```

HELPFUL: `HostAttributeToken` throws an error if the attribute is missing, unless the injection is marked as optional.
