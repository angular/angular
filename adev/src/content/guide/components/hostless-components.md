# Hostless components

TIP: This guide assumes you've already read the [Essentials Guide](essentials). Read that first if you're new to Angular.

By default, Angular creates a DOM element for every component that matches its selector. This element is the component's [host element](guide/components/host-elements), and Angular renders the component's template inside it.

A **hostless component** does not create a physical host DOM element. Instead, Angular renders the component's template elements directly into the parent container at the component's insertion point, using a comment node as an internal anchor.

## Declaring a hostless component

To create a hostless component, set `hostless: true` in the `@Component` decorator metadata:

```angular-ts {header: "user-row.component.ts"}
import {Component, input} from '@angular/core';

@Component({
  selector: 'user-rows',
  hostless: true,
  template: `
    <tr class="primary-row">
      <td>{{ user().name }}</td>
      <td>{{ user().email }}</td>
    </tr>
    <tr class="details-row">
      <td colspan="2">{{ user().bio }}</td>
    </tr>
  `,
})
export class UserRowsComponent {
  user = input.required<{name: string; email: string; bio: string}>();
}
```

When you use a hostless component in a parent template:

```angular-html {header: "user-table.component.html"}
<table>
  <tbody>
    @for (user of users(); track user.id) {
      <user-rows [user]="user" />
    }
  </tbody>
</table>
```

Angular renders the child elements directly inside the `<tbody>` without an intermediate `<user-rows>` DOM element:

```html {header: "Rendered DOM"}
<table>
  <tbody>
    <tr class="primary-row">
      <td>Alice</td>
      <td>alice@example.com</td>
    </tr>
    <tr class="details-row">
      <td colspan="2">Software Engineer</td>
    </tr>
    <!--hostless user-rows-->
  </tbody>
</table>
```

## When to use hostless components

Hostless components are especially useful when an extra wrapper element would violate HTML specifications or disrupt CSS layouts:

### 1. HTML table structures

Elements such as `<table>`, `<tbody>`, and `<thead>` strictly require `<tr>` elements as direct children. A standard component's host element (e.g., `<user-rows>`) is invalid HTML inside `<tbody>` and can cause browser rendering bugs. Hostless components allow you to group and render multiple `<tr>` rows cleanly.

### 2. CSS Grid and Flexbox layouts

In CSS Grid and Flexbox containers, layout rules such as `grid-template-columns`, `flex-direction`, and `gap` apply only to direct child elements. A hostless component allows multiple sibling elements to participate directly in the parent container's layout without an artificial wrapper element.

### 3. SVG elements

SVG containers (such as `<svg>`) require valid SVG elements (such as `<g>`, `<path>`, or `<circle>`) as children. You can use hostless components to modularize and reuse SVG graphics:

```angular-ts {header: "svg-layer.component.ts"}
@Component({
  selector: 'svg-layers',
  hostless: true,
  template: `
    <svg:g class="layer-background">
      <circle cx="50" cy="50" r="40" fill="lightblue" />
    </svg:g>
    <svg:g class="layer-foreground">
      <text x="50" y="55" text-anchor="middle">Icon</text>
    </svg:g>
  `,
})
export class SvgLayersComponent {}
```

```angular-html {header: "app.component.html"}
<svg viewBox="0 0 100 100">
  <svg-layers />
</svg>
```

### 4. Multi-root components

If a component naturally consists of multiple sibling elements (such as a list of definition terms `<dt>` and `<dd>`, or a header and footer pair), a hostless component lets you output all root elements without adding an unneeded container `<div>`.

## Differences from standard components

Hostless components support standard Angular features, including:

- Signals, inputs, outputs, models, and two-way data binding
- Dependency injection (`providers`, `viewProviders`, hierarchical DI)
- Content projection (`<ng-content>`) and fallback projection
- View queries (`viewChild()`, `viewChildren()`) and content queries (`contentChild()`, `contentChildren()`)
- Control flow (`@if`, `@for`, `@switch`) and deferred loading (`@defer`)
- Server-side rendering (SSR) and hydration

Because hostless components have no physical host DOM element, the following restrictions apply:

### 1. No host bindings or listeners (`NG2029`)

You cannot define `@HostBinding()`, `@HostListener()`, or the `host: { ... }` property on a hostless component.

```angular-ts
// AVOID: Host bindings are not supported on hostless components
@Component({
  selector: 'my-hostless',
  hostless: true,
  template: '<span>Content</span>',
  host: {
    'class': 'active', // Error: NG2029
  },
})
export class MyHostlessComponent {}
```

### 2. No DOM bindings at the call site (`NG8030`)

When consuming a hostless component in a template, you cannot bind native DOM properties, HTML attributes, CSS classes, inline styles, or DOM events to the component tag:

```angular-html
<!-- AVOID: Native DOM bindings are not supported on hostless component tags -->
<user-rows [user]="user" class="table-row" (click)="selectUser(user)" />
```

Inputs and outputs declared by the hostless component or by directives applied to the component tag are fully supported.

### 3. No `:host` styling

CSS selectors such as `:host` and `:host-context()` are not supported in hostless component styles because there is no host element to target. Encapsulated styles applied to elements inside the template function normally.

### 4. No Shadow DOM encapsulation (`NG2030`)

Hostless components cannot use `ViewEncapsulation.ShadowDom` or `ViewEncapsulation.ExperimentalIsolatedShadowDom` because attaching a shadow root requires a physical DOM `Element`.

### 5. No component animations (`NG2031`)

You cannot declare `@Component({ animations: [...] })` on hostless components, as Angular animations require a target host DOM element.

### 6. `ElementRef` references the comment anchor

If you inject `ElementRef` in a hostless component, its `nativeElement` property references the underlying `Comment` node in the DOM rather than an `HTMLElement`.

### 7. Application bootstrapping

A hostless component cannot serve as the root component passed to `bootstrapApplication()` because mounting an application requires an existing DOM element in `index.html`.

## Choosing between hostless components and attribute selectors

Before using `hostless: true`, consider whether an **attribute selector** meets your needs:

| Requirement                          | Hostless Component (`hostless: true`) | Attribute Selector (`selector: 'tr[app-row]'`)   |
| :----------------------------------- | :------------------------------------ | :----------------------------------------------- |
| **Output multiple sibling elements** | Yes                                   | No (exactly one host element)                    |
| **Render inside tables/SVGs**        | Yes                                   | Yes (`<tr app-row></tr>`)                        |
| **Host bindings & listeners**        | No                                    | Yes (`host: { '[class.active]': 'isActive()' }`) |
| **`:host` style encapsulation**      | No                                    | Yes                                              |
| **DOM attributes & events on tag**   | No                                    | Yes                                              |

TIP: If your component maps to a single HTML element (such as a single `<tr>`, `<li>`, or `<button>`), prefer an **attribute selector**. Use `hostless: true` when your component must output **multiple sibling root elements** without a container.

## Testing hostless components

When writing unit tests for hostless components that render table or SVG elements, wrap the component in a **test host component**:

```angular-ts {header: "svg-layer.component.spec.ts"}
@Component({
  imports: [SvgLayersComponent],
  template: `
    <svg viewBox="0 0 100 100">
      <svg-layers />
    </svg>
  `,
})
class TestHost {}

describe('SvgLayersComponent', () => {
  it('should render SVG groups inside the parent svg', async () => {
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();

    const svg = fixture.nativeElement.querySelector('svg');
    const groups = svg.querySelectorAll('g');
    expect(groups.length).toBe(2);
  });
});
```

Using a test host component ensures that browser DOM parsers correctly interpret contextual elements such as `<svg:g>` or `<tr>`.
