# Attribute resolvers

IMPORTANT: Attribute resolvers are [experimental](reference/releases#experimental). They're ready for you to try, but they might change before they are stable.

TIP: This guide assumes you've already read the [Host elements guide](guide/components/host-elements). Read that first if you're new to host bindings.

When a component, its directives, and the template all set the same attribute on one element, only one value can reach the DOM. An **attribute resolver** is a function that you provide to decide the final value. Angular collects the value that each source gives, merges the values with the resolver of that attribute, and applies the result.

This guide shows how to:

- Provide resolvers for the attributes you care about.
- Resolve an attribute in a template or in a component's `host`.
- Choose which part of your app uses which resolver.
- Resolve elements automatically, without a binding.

## The problem

By default, the last write wins. In the following example, the directive's `[attr.role]` binding overwrites the template's static `role`:

```angular-ts
@Directive({selector: '[menuItem]', host: {'[attr.role]': 'role()'}})
export class MenuItem {
  readonly role = signal('menuitem');
}
```

```angular-html
<!-- Using the directive -->
<li menuItem role="separator"></li>
```

```angular-html
<!-- Rendered DOM -->
<li menuitem="" role="menuitem"></li>
```

Utility CSS classes have a similar problem. A component's host sets `class="px-4 py-2"`, and a consumer sets `class="px-2"`. The element gets all three classes, and the order of rules in the stylesheet decides which padding applies, not the consumer's intent. A resolver such as [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) fixes this: it knows that `px-2` overrides `px-4`, and the source with the higher priority wins.

## Provide resolvers

Use `provideAttributeResolvers()` to register the function that merges each attribute. The keys of the map are attribute names:

```angular-ts
import {joinValues, provideAttributeResolvers} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {twMerge} from 'tailwind-merge';

bootstrapApplication(App, {
  providers: [provideAttributeResolvers({class: twMerge, 'data-labels': joinValues(', ')})],
});
```

The resolver of `class` is a `ClassResolver`, and the resolver of any other name is an `AttributeResolver`:

```ts
type ClassResolver = (...classes: string[]) => string;
type AttributeResolver = (...values: string[]) => string | null;
```

Angular calls a resolver with one argument for each entry, from the lowest to the highest priority. For `class`, an entry is one class name. For `style`, it's one declaration. For any other attribute, it's one value. A scalar attribute is removed when its resolver returns `null`.

The priority of the sources, from the lowest to the highest, is:

1. The component on the element, and its host directives.
1. The other directives on the element.
1. The template.

For example, with a component whose host has `class="px-4 py-2"`:

```angular-html
<ui-card class="px-2" (class)="(cn) => cn()" />
```

Angular calls the resolver with `'px-4'`, `'py-2'`, and `'px-2'`. With `twMerge`, the rendered element gets the classes `py-2 px-2`.

### Built-in rules

An attribute that no provider names uses a built-in rule. Angular exports three rules and one factory, so you can name an attribute without writing a function:

| Rule                    | Result                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `lastValue`             | The last value, which has the highest priority, or `null` when there's none.                                               |
| `joinTokens`            | The tokens without repeated ones, keeping the first, joined with a space. An argument with several tokens counts as those. |
| `joinDeclarations`      | The declarations joined with `; `.                                                                                         |
| `joinValues(separator)` | The values joined with `separator`, keeping repeated ones, or `null` when there's none.                                    |

```ts
lastValue('a', 'b'); // 'b'
joinTokens('b', 'a b', 'a'); // 'b a'
joinDeclarations('color: red', 'padding: 4px'); // 'color: red; padding: 4px'
joinValues(' / ')('a', 'b', 'a'); // 'a / b / a'
```

Angular picks the default rule by the kind of attribute:

| Attribute                                                                                                 | Default rule       |
| --------------------------------------------------------------------------------------------------------- | ------------------ |
| `class`                                                                                                   | Plain merge        |
| `style`                                                                                                   | `joinDeclarations` |
| `rel`, `part`, `headers`, `aria-describedby`, `aria-controls`, `aria-owns`, `aria-flowto`, `aria-details` | `joinTokens`       |
| Every other name, such as `id`, `role`, `title`, `aria-labelledby`, and `data-*`                          | `lastValue`        |

The plain merge for `class` joins the classes in order and drops empty and repeated names. It doesn't resolve utility conflicts.

HELPFUL: Without any `provideAttributeResolvers()` call, a resolver binding still uses these default rules.

## Resolve an attribute in a template

You opt an element in with a resolver binding. Angular treats a binding that is written like an event, but named for an attribute, as a resolver.

### The `(class)` and `(style)` shorthands

The `(class)` and `(style)` shorthands take a callback. Angular calls the callback with the resolver of the element, and applies what the resolver returns:

```angular-html
<ui-button class="px-2" (class)="(cn) => cn('shadow-lg', busy() && 'opacity-50')" />
<div style="color: red" (style)="(s) => s({width: size()})"></div>
```

The arguments that you pass to the resolver are **extras**. They rank after the other entries of the source that the binding is in. In a template, they rank after the template's own entries.

For `class`, an extra can be a string, an array, a `Set`, an object map of names to truthy values, or `false`, `null`, `undefined`, or `''`, which add nothing. That's why `busy() && 'opacity-50'` works. For `style`, an extra can be a declaration string, an array of such strings, or an object map of properties to values.

The callback can take one of these forms:

```angular-html
<!-- An arrow function. -->
<div class="p-2" (class)="(cn) => cn('m-1')"></div>

<!-- A reference to a field. -->
<div class="p-2" (class)="(withMargin)"></div>

<!-- An expression that returns a callback. -->
<div class="p-2" (class)="margin('m-1')"></div>
```

```angular-ts
@Component({
  selector: 'app-list',
  template: `...`,
})
export class List {
  protected readonly withMargin: ClassCallback = (cn) => cn('m-1');

  protected margin(size: string): ClassCallback {
    return (cn) => cn(size);
  }
}
```

A shorthand must be a single expression, and the callback must return the value that its resolver gives it. TypeScript reports a callback that returns anything else, such as a string.

TIP: When the callback reads component state or several elements share it, keep it in an arrow function field, so it keeps `this` however the template reads it.

### The full form: `(attr.x)`

Use `(attr.x)` to resolve any other attribute. The handler receives a resolve event as `$event`:

- `$event.resolver(...extras)` merges the sources and the extras, using the resolver of the attribute.
- `$event.resolve(value)` sets the attribute to exactly `value`. `null` removes the attribute, and so does `''` for a token list.
- `$event.sources` holds the entries of each source: `[component, directives, template]`.

When one element has several resolvers for the same attribute, such as a directive's `host` handler and a template binding, Angular runs them from the lowest to the highest priority: host directives and the component, then the other directives, then the template. Angular folds each result into the sources that the next resolver receives, so a later resolver doesn't get the original sources. The result of the highest resolver becomes the value.

The template's value wins when you resolve with the attribute's default rule:

```angular-html
<li menuItem role="separator" (attr.role)="$event.resolve($event.resolver())"></li>
```

```angular-html
<!-- Rendered DOM -->
<li menuitem="" role="separator"></li>
```

For example, a directive that resolves `role` itself replaces the template's value for the resolvers above it:

```angular-ts
@Directive({selector: '[tab]', host: {'(attr.role)': "$event.resolve('tab')"}})
export class Tab {}
```

```angular-html
<li tab role="separator" (attr.role)="$event.resolve($event.resolver())"></li>
```

```angular-html
<!-- Rendered DOM -->
<li tab="" role="tab"></li>
```

The `Tab` handler runs first and resolves `role` to `tab`. Angular folds that result into the directive sources and leaves the template source empty, so the template handler receives `tab`, not `separator`.

With `provideAttributeResolvers({role: joinValues('+')})`, extras join the other values:

```angular-html
<li menuItem role="separator" (attr.role)="$event.resolve($event.resolver('a', ['b', 'c']))"></li>
```

```angular-html
<!-- Rendered DOM -->
<li menuitem="" role="menuitem+separator+a+b c"></li>
```

`(class)="F"` is shorthand for `(attr.class)="$event.resolve((F)($event.resolver))"`. `(style)` works the same way with `(attr.style)`. Other attributes have no shorthand.

Write the handler as a function of its sources and the state it reads:

- Call `resolve()` at most once, while the handler runs. In dev mode, a second call throws `NG0320`.
- If the handler doesn't call `resolve()`, the attribute takes the default rule of its kind, applied to the sources, without your resolver.
- Don't write a signal in the handler. Doing so throws `NG0600`.
- Angular runs the handler on every refresh of the view, and tracks the signals that it reads.

## Resolve a component's host element

A component or directive can resolve the attributes of its own host element in `host`, so its consumers don't need a binding:

```angular-ts
@Component({
  selector: 'ui-button',
  host: {class: 'inline-flex h-9 px-4 bg-primary', '(class)': 'classes'},
  template: '<ng-content />',
})
export class UiButton {
  readonly disabled = input(false);
  protected readonly classes: ClassCallback = (cn) => cn(this.disabled() && 'bg-muted');
}
```

With `twMerge` provided, a consumer's `class` overrides the component's defaults:

```angular-html
<ui-button class="px-2" />
```

```angular-html
<!-- Rendered DOM -->
<ui-button class="inline-flex h-9 bg-primary px-2"></ui-button>
```

Extras that a component passes in its `host` rank at the end of the component source, so the consumer's template values still win over them.

The full form works in `host` too:

```angular-ts
@Component({
  selector: 'ui-disclosure',
  host: {'(attr.aria-expanded)': "$event.resolve(open() ? 'true' : 'false')"},
  template: '<ng-content />',
})
export class UiDisclosure {
  readonly open = signal(false);
}
```

Declare resolvers in `host`, not with `@HostListener`. `@HostListener('class')` and `@HostListener('attr.x')` are compile errors. A directive can have at most one resolver for each attribute.

## Choose where a provider applies

For a resolver binding, Angular looks up the resolver of each attribute from the injector of the element when it creates the element. You can provide resolvers in four places, and they combine. [Automatic resolution](#resolve-elements-automatically) looks resolvers up differently, as described in [Automatic resolution uses the declaring view](#automatic-resolution-uses-the-declaring-view).

**In the root providers** of `bootstrapApplication()` or `TestBed.configureTestingModule()`. They apply to the whole app. Routes with `providers` apply to the components they create in the same way.

```angular-ts
bootstrapApplication(App, {
  providers: [provideAttributeResolvers({class: markRoot, role: joinValues('-')})],
});
```

**In a component's `providers`.** They apply to the template of the component, to content projected into it, and to every binding on its host element.

```angular-ts
@Component({
  selector: 'ui-menu',
  imports: [MenuItem],
  providers: [provideAttributeResolvers({role: joinValues('+')})],
  template: `<li
    menuItem
    role="separator"
    class="item"
    (class)="(cn) => cn()"
    (attr.role)="$event.resolve($event.resolver())"
  ></li>`,
})
export class UiMenu {}
```

**In a component's `viewProviders`.** They apply only to the component's template and to its own host binding. Content that a consumer projects into the component, and the consumer's bindings on the component, use the resolver that the injectors above it provide.

```angular-ts
@Component({
  selector: 'ui-panel',
  viewProviders: [provideAttributeResolvers({class: panelMerge})],
  host: {class: 'rounded-md', '(class)': 'classes'},
  template: `
    <div class="p-4" (class)="(cn) => cn()"></div>
    <ng-content />
  `,
})
export class UiPanel {
  protected readonly classes: ClassCallback = (cn) => cn();
}
```

In this example, the `<div>` and the host's `(class)` use `panelMerge`. Everything else on `<ui-panel>` uses the outer resolver.

**In a second call that names only some attributes.** Within one injector, a later call replaces only the names that it names:

```angular-ts
providers: [
  provideAttributeResolvers({class: markFirst, role: joinValues('-')}),
  // Replaces `role`. `class` stays `markFirst`.
  provideAttributeResolvers({role: joinValues('+')}),
];
```

### Each name is looked up separately

Angular looks each name up on its own, through the element's injectors and then its environment injector, such as a lazy route's. A call that doesn't name an attribute leaves that attribute to the injectors above it.

With the root providers and `UiMenu` from the previous examples, `class` comes from the root call, and `role` comes from `UiMenu`'s call:

```angular-html
<!-- Rendered DOM, in the UiMenu template -->
<li menuitem="" role="menuitem+separator" class="item by-root"></li>
```

Here, `markRoot` appends `by-root` to the classes.

NOTE: `provideAttributeResolvers()` reads the map when you call it. Changing the object afterward changes nothing.

### Automatic resolution uses the declaring view

An element that automatic resolution handles takes its resolvers from the view of the component whose template declares the element, not from the element's own injector. So the `viewProviders` and `providers` of a component on the element don't affect that element's automatic resolution. They affect only its explicit bindings.

Suppose the root provides `rootMerge` with `withAutoResolution()`, and `UiBox` provides `localMerge` in its `providers`:

```angular-html
<!-- Automatic: uses rootMerge for the host class and the consumer's class. -->
<ui-box class="consumer" />

<!-- Explicit binding: looks up the element's injector, so it uses localMerge. -->
<ui-box class="consumer" (class)="(cn) => cn()" />
```

## Resolve elements automatically

Writing a binding on every element is tedious. Pass `withAutoResolution()` in the root providers, and Angular resolves every element that a component or directive matches:

```angular-ts
bootstrapApplication(App, {
  providers: [provideAttributeResolvers({class: twMerge, role: lastValue}, withAutoResolution())],
});
```

```angular-html
<!-- A component matches: resolved. -->
<ui-button class="px-4" />
<!-- A directive matches: class and role resolved. -->
<li menuItem role="separator"></li>
<!-- No component or directive: not resolved. -->
<span class="px-2 px-4"></span>
```

```angular-html
<!-- Rendered DOM for the <li> -->
<li menuitem="" role="separator"></li>
```

Automatic resolution covers these attributes:

- `class` and `style`.
- The names that the `provideAttributeResolvers()` calls with `withAutoResolution()` list in the root providers.

It also covers components that you create in code, such as routed components, and the host directives of every matched element. It skips an attribute that needs [sanitization](#attributes-that-cant-be-resolved) on that element.

An attribute that already has a resolver binding, in the template or in a directive's `host`, resolves only through its binding.

### Turn it off for a subtree

Only the root providers can turn automatic resolution on. Below the root, provide `withAutoResolution(false)` to turn it off for a component's template and the templates nested in it. Provide `withAutoResolution()` again to turn it back on:

```angular-ts
@Directive({selector: '[tone]', host: {class: 'px-2'}})
export class Tone {}

@Component({
  selector: 'modern-card',
  imports: [Tone],
  // Back on in this template.
  viewProviders: [provideAttributeResolvers({class: twMerge}, withAutoResolution())],
  template: `<div tone class="px-4"></div>`,
})
export class ModernCard {}

@Component({
  selector: 'legacy-table',
  imports: [ModernCard, Tone],
  // Off in this template.
  providers: [provideAttributeResolvers({class: twMerge}, withAutoResolution(false))],
  template: `<modern-card tone class="px-4" />`,
})
export class LegacyTable {}
```

```angular-html
<!-- Rendered DOM -->
<modern-card tone="" class="px-2 px-4">
  <div tone="" class="px-4"></div>
</modern-card>
```

An element follows the template that declares it. `<modern-card>` isn't resolved, because the template of `LegacyTable` declares it. The `<div>` is resolved, because the template of `ModernCard` declares it. Elements in an off template still resolve through their resolver bindings.

If a provider below the root turns the feature on and the root providers don't, dev mode throws `NG0322`.

### Enroll names before the first render

Angular sets up an element for automatic resolution when it first creates the template of the element, and it caches that setup with the component. The names that automatic resolution covers, and the injection token of each name, live for the lifetime of the JavaScript process. They never shrink.

Calling `withAutoResolution()` enables the feature's hooks, but it doesn't enroll your custom names. Angular enrolls the names of the root providers when it first evaluates an effective "on" setting, while it sets up a component. If the first component that Angular creates goes through an injector where the feature is off, such as a child injector, the names stay unenrolled. Creating the component through the root later doesn't repair the template that Angular already cached.

Because of this, a template that Angular created before a name enrolled never resolves that name, in any app of the process. The same holds for a template that Angular created before the first `withAutoResolution()` call. Angular doesn't report it: the affected elements keep their unresolved values. To enroll a custom name, create a component through an injector where the feature is on before Angular creates any template that needs the name.

An app whose root providers call `withAutoResolution()` with all its names, and whose first render goes through an injector where the feature is on, isn't affected. Two cases are:

- Several apps in one process, where an app with fewer names renders a shared component first.
- Tests, where an earlier test renders a component before a later test provides a name. To avoid this, provide the names with the feature on in the root providers of the test that renders first, and call `withAutoResolution()` in your test setup file before any test renders.

## Attributes that can't be resolved

A resolved value doesn't go through Angular's sanitizer. So an attribute whose value is a URL, HTML, or a script can't be resolved. `style` can, because `[style]` bindings aren't sanitized either.

- `(attr.x)` in a template is a compile error when `x` needs sanitization on that element, such as `href` on `<a>`, `srcdoc` on `<iframe>`, or `src` on `<embed>`.
- In `host`, the element isn't known, so `(attr.x)` is a compile error when `x` needs sanitization on any element.
- Event handler attributes, whose names start with `on` in any letter case, can't be resolved anywhere. A key for one in `provideAttributeResolvers()` throws in dev mode.
- Namespaced attributes, such as `xlink:title`, can't be resolved.

```text
Can't resolve the 'href' attribute of <a>, because its value needs sanitization.
```

Automatic resolution checks each element by its tag and namespace, so it skips `href` on `<a>` and resolves it on `<div>`.

## Things to know

The reference for resolvers is still growing. These points matter most when you start:

- **Static attributes and bindings are sources.** Values that you set with `Renderer2.addClass()`, `Renderer2.setStyle()`, `NgClass`, or animations aren't sources, so a resolver can't resolve conflicts with them. Prefer `[class]` over `[ngClass]` on these elements.
- **Property bindings bypass the resolver.** A binding such as `[title]` or `title="{{ hint }}"` writes the attribute but isn't a source. Use `[attr.title]` instead. The [`propertyBindingBypassesResolver`](extended-diagnostics/NG8122) extended diagnostic reports this.
- **A resolver binding hides a same-named output.** `(class)` always resolves classes and never listens to an output named `class`. The [`outputShadowedByAttributeResolver`](extended-diagnostics/NG8120) extended diagnostic reports this.
- **`<ng-container>` and `<ng-template>` have no attributes.** A resolver binding on them does nothing, and the compiler or dev mode reports it.
- **Directives that disagree.** In dev mode, Angular warns with `NG0324` when two directives give different values for a scalar attribute.
- **A resolver writes only its own attribute.** It can't split one value into several attributes.
- **Styles are a subset of CSS.** The `style` resolver models shorthands and longhands with a table, not the full CSS syntax.
- **Bundle size.** A single resolver binding pulls in the whole resolver runtime. Measure the cost for your app.
- **Server rendering.** Resolvers run on the server, and the browser reconciles the resolved value when hydration claims the element.
- **Libraries.** A library compiled in partial mode that uses a resolver binding requires Angular 22.3 or later.

## Type checking

With `strictTemplates`, `$event` is a `ClassResolveEvent` for `class`, a `StyleResolveEvent` for `style`, and an `AttributeResolveEvent` for any other name. Angular checks the callback of a shorthand, the extras, and the arguments of `resolve()`. For example, `$event.resolve(false)` is valid for `class`, but not for `role`.
