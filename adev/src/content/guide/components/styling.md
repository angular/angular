# Styling components

TIP: This guide assumes you've already read the [Essentials Guide](essentials). Read that first if you're new to Angular.

Components can optionally include CSS styles that apply to that component's DOM:

```angular-ts {highlight:[4]}
@Component({
  selector: 'profile-photo',
  template: `<img src="profile-photo.jpg" alt="Your profile photo" />`,
  styles: `
    img {
      border-radius: 50%;
    }
  `,
})
export class ProfilePhoto {}
```

You can also choose to write your styles in separate files:

```angular-ts {highlight:[4]}
@Component({
  selector: 'profile-photo',
  templateUrl: 'profile-photo.html',
  styleUrl: 'profile-photo.css',
})
export class ProfilePhoto {}
```

When Angular compiles your component, these styles are emitted with your component's JavaScript
output. This means that component styles participate in the JavaScript module system. When you
render an Angular component, the framework automatically includes its associated styles, even when
lazy-loading a component.

Angular works with any tool that outputs CSS,
including [Sass](https://sass-lang.com), [Less](https://lesscss.org),
and [Stylus](https://stylus-lang.com).

## Style scoping

Every component has a **view encapsulation** setting that determines how the framework scopes a
component's styles. There are four view encapsulation modes: `Emulated`, `ShadowDom`, `ExperimentalIsolatedShadowDom`, and `None`.
You can specify the mode in the `@Component` decorator:

```angular-ts {highlight:[3]}
@Component({
  ...,
  encapsulation: ViewEncapsulation.None,
})
export class ProfilePhoto { }
```

### ViewEncapsulation.Emulated

By default, Angular uses emulated encapsulation so that a component's styles only apply to elements
defined in that component's template. In this mode, the framework generates a unique HTML attribute
for each component instance, adds that attribute to elements in the component's template, and
inserts that attribute into the CSS selectors defined in your component's styles.

This mode ensures that a component's styles do not leak out and affect other components. However,
global styles defined outside of a component may still affect elements inside a component with
emulated encapsulation.

In emulated mode, Angular supports
the [`:host`](https://developer.mozilla.org/docs/Web/CSS/:host) pseudo-class.
While the [`:host-context()`](https://developer.mozilla.org/docs/Web/CSS/:host-context) pseudo-class
is deprecated in modern browsers, Angular's compiler provides full support for it. Both pseudo-classes
can be used without relying on native
[Shadow DOM](https://developer.mozilla.org/docs/Web/Web_Components/Using_shadow_DOM).
During compilation, the framework transforms these pseudo classes into attributes so it doesn't
comply with these native pseudo classes' rules at runtime (e.g. browser compatibility, specificity). Angular's
emulated encapsulation mode does not support any other pseudo classes related to Shadow DOM, such
as `::shadow` or `::part`.

#### `::ng-deep`

Angular's emulated encapsulation mode supports a custom pseudo class, `::ng-deep`.
**The Angular team strongly discourages new use of `::ng-deep`**. These APIs remain
exclusively for backwards compatibility.

When a selector contains `::ng-deep`, Angular stops applying view-encapsulation boundaries after that point in the selector. Any part of the selector that follows `::ng-deep` can match elements outside the component’s template.

For example:

- a CSS rule selector like `p a`, using the emulated encapsulation, will match `<a>` elements that are descendants of a `<p>` element,
  both being within the component's own template.

- A selector like `::ng-deep p a` will match `<a>` elements anywhere in the application, descendants of a `<p>` element anywhere in the application.

  That effectively makes it behave like a global style.

- In `p ::ng-deep a`, Angular requires the `<p>` element to come from the component's own template, but the `<a>` element may be anywhere in the application.

  So, in effect, the `<a>` element may be in the component's template, or in any of its projected or child content.

- With `:host ::ng-deep p a`, both the `<a>` and `<p>` elements must be descendants of the component's host element.

  They can come from the component's template or the views of its child components, but not elsewhere in the app.

### ViewEncapsulation.ShadowDom

This mode scopes styles within a component by
using [the web standard Shadow DOM API](https://developer.mozilla.org/docs/Web/Web_Components/Using_shadow_DOM).
When enabling this mode, Angular attaches a shadow root to the component's host element and renders
the component's template and styles into the corresponding shadow tree.

Styles inside the shadow tree cannot affect elements outside of that shadow tree.

Enabling `ShadowDom` encapsulation, however, impacts more than style scoping. Rendering the
component in a shadow tree affects event propagation, interaction
with [the `<slot>` API](https://developer.mozilla.org/docs/Web/Web_Components/Using_templates_and_slots),
and how browser developer tools show elements. Always understand the full implications of using
Shadow DOM in your application before enabling this option.

### ViewEncapsulation.ExperimentalIsolatedShadowDom

Behaves as above, except this mode strictly guarantees that _only_ that component's styles apply to elements in the
component's template. Global styles cannot affect elements in a shadow tree and styles inside the
shadow tree cannot affect elements outside of that shadow tree.

### ViewEncapsulation.None

This mode disables all style encapsulation for the component. Any styles associated with the
component behave as global styles.

NOTE: In `Emulated` and `ShadowDom` modes, Angular doesn't 100% guarantee that your component's styles will always override styles coming from outside it.
It is assumed that these styles have the same specificity as your component's styles in case of collision.

## Defining styles in templates

You can use the `<style>` element in a component's template to define additional styles. The
component's view encapsulation mode applies to styles defined this way.

Angular does not support bindings inside of style elements.

## Referencing external style files

Component templates can
use [the `<link>` element](https://developer.mozilla.org/docs/Web/HTML/Element/link) to
reference CSS files. Additionally, your CSS may
use [the `@import`at-rule](https://developer.mozilla.org/docs/Web/CSS/@import) to reference
CSS files. Angular treats these references as _external_ styles. External styles are not affected by
emulated view encapsulation.

## Namespacing CSS custom properties

Angular can add a prefix to the CSS custom properties (also called CSS variables) that your
component styles declare and read. Everything on a page shares one CSS cascade, so when something outside
your application defines a custom property such as `--primary-color` on an ancestor element, your
components read that value. This matters when your application shares a page with another
application or with markup you do not control. Angular does not namespace custom properties until
you ask it to, and an application that owns its page does not need namespacing.

To scope the custom properties in your component styles to your application, add
[`provideCssVarNamespacing`](api/platform-browser/provideCssVarNamespacing) to your application's
providers:

```ts {header: "app.config.ts"}
import {ApplicationConfig} from '@angular/core';
import {provideCssVarNamespacing} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [provideCssVarNamespacing('my-app')],
};
```

Angular prefixes the custom properties in your component styles with that namespace followed by an
underscore, so `--primary-color` becomes `--my-app_primary-color`. Angular appends the underscore
itself: `provideCssVarNamespacing('my-app_')` produces `--my-app__primary-color`. The prefix
applies to declarations, `var()` references, `@property` rules, and style bindings such as
`[style.--primary-color]`, including the style bindings a component declares in its `host` object.

If you call `provideCssVarNamespacing` without an argument, Angular uses the application's
[`APP_ID`](api/core/APP_ID), which is `ng` unless you set it. Give each application its own
namespace or its own `APP_ID`. Otherwise, the applications share a prefix and collide again.

Angular namespaces the styles it compiles into a component: the `styles` and `styleUrl` of the
component, the styles you [write in a `<style>` element](#defining-styles-in-templates) in its template, and
the styles of a component that uses `ViewEncapsulation.None`. Angular does not namespace a stylesheet the browser
loads at runtime, such as a global stylesheet your build configuration lists or an
[external style](#referencing-external-style-files) that your build does not inline.

Namespacing applies to every component Angular compiles, including the components of the libraries
you install. When a library's styles read a custom property that a global stylesheet defines, such
as the properties of a theme, the reference no longer matches, the browser falls back to the
property's initial value, and nothing reports an error. Before you enable namespacing in an
existing application, review the custom properties that cross between your global stylesheets and
your components.

IMPORTANT: Angular rewrites custom property names only in the styles and bindings it compiles.
Everywhere else keeps the name you write, and nothing reports the mismatch.

Angular does not rewrite the name in:

- Static style attributes, such as `style="--primary-color: red"`.
- Object style bindings, such as `[style]="{'--primary-color': color}"` and `ngStyle`.
- Calls to `Renderer2.setStyle`.

Each of these produces a property that your namespaced styles no longer read. Namespace those
names yourself, as described in
[Using namespaced properties in TypeScript](#using-namespaced-properties-in-typescript).

### Opting out of namespacing

To declare or read a custom property that Angular does not namespace, such as one defined in a
global stylesheet, prefix its name with `--global--`. Angular removes `--global--` and leaves the
rest of the name unchanged:

```css
:host {
  /* Declares --accent-color and reads --brand-color, not --my-app_brand-color. */
  --global--accent-color: navy;
  color: var(--global--brand-color);
}
```

Write two hyphens after `global`. A single hyphen, as in `--global-brand-color`, does not opt out,
and Angular namespaces that name like any other. Angular removes `--global--` in every
application, including applications that never configure a namespace.

### Using namespaced properties in TypeScript

Prefer a style binding such as `[style.--primary-color]`, which Angular namespaces for you. When
you go through a DOM API instead, pass the name you wrote in your styles to
[`CssVarNamespacer`](api/platform-browser/CssVarNamespacer), including the leading `--`:

```angular-ts
import {Component, ElementRef, inject} from '@angular/core';
import {CssVarNamespacer} from '@angular/platform-browser';

@Component({
  selector: 'profile-photo',
  template: `<img src="profile-photo.jpg" alt="Your profile photo" />`,
  styles: `
    img {
      border: 2px solid var(--primary-color);
    }
  `,
})
export class ProfilePhoto {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly cssVarNamespacer = inject(CssVarNamespacer);

  setPrimaryColor(color: string): void {
    this.host.style.setProperty(this.cssVarNamespacer.namespace('--primary-color'), color);
  }
}
```

Use the plain name for a property you declared with `--global--`, since Angular never namespaces
those. For everything else, `namespace` returns the name unchanged when an application configures
no namespace, so a library can call it for the custom properties its own styles declare.
