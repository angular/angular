# Queries and content projection

Queries give a component access to elements, directives and components in its template or in its projected content. Content projection lets a parent insert markup into slots of a child component.

## View queries (`viewChild`, `viewChildren`)

View queries search the component's **own template**. They return readonly signals.

### Querying a single element or component (`viewChild`)

Use `viewChild` to find the first match. You can query by a template reference variable (string), a component or directive class, or an `InjectionToken`.

```ts
import {Component, ElementRef, viewChild} from '@angular/core';

@Component({
  selector: 'app-search-field',
  template: `<input #inputField type="text" />`,
})
export class SearchField {
  readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputField');

  focusInput() {
    // The value is undefined until the view has been created
    this.inputEl()?.nativeElement.focus();
  }
}
```

- **Querying by class**: The type is inferred from the class.
  ```ts
  readonly datePicker = viewChild(DatePicker); // Signal<DatePicker | undefined>
  ```
- **Querying by string**: TypeScript cannot infer the type of the matched element. Pass a generic (`viewChild<ElementRef<HTMLInputElement>>('inputField')`) or let the `read` option set the type (see below).
- **Required queries**: `viewChild.required` returns a signal without `undefined` in its type. Reading it before a result exists throws `NG0951: Child query result is required but no value is available`. This happens when it is read in the constructor, or when the matched element sits inside an `@if` whose condition is false. Only use `.required` for elements that are always rendered.
  ```ts
  readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('inputField');
  ```

### Reading a different token (`read`)

Use the `read` option to get something other than the default result from the matched element, such as its `ElementRef`, a directive on it, or the `TemplateRef` of an `<ng-template>`.

```ts
import {Component, ElementRef, TemplateRef, viewChild} from '@angular/core';
import {DatePicker} from './date-picker';

@Component({
  selector: 'app-empty-state',
  imports: [DatePicker],
  template: `
    <app-date-picker />
    <ng-template #emptyTemplate>
      <p>No results</p>
    </ng-template>
  `,
})
export class EmptyState {
  readonly datePickerEl = viewChild(DatePicker, {read: ElementRef});
  // No generic needed: the type comes from `read`
  readonly template = viewChild.required('emptyTemplate', {read: TemplateRef});
}
```

### Querying multiple results (`viewChildren`)

`viewChildren` returns a signal of a readonly array (`Signal<readonly T[]>`).

```ts
import {Component, computed, input, viewChildren} from '@angular/core';
import {Avatar} from './avatar';
import {User} from './user.model';

@Component({
  selector: 'app-user-list',
  imports: [Avatar],
  template: `
    @for (user of users(); track user.id) {
      <app-avatar [user]="user" />
    }
  `,
})
export class UserList {
  readonly users = input.required<User[]>();
  readonly avatars = viewChildren(Avatar);
  readonly avatarCount = computed(() => this.avatars().length);
}
```

### When query results update

Query results update when Angular creates or destroys views, for example when an `@if` condition changes or `@for` items are added or removed. Nodes added outside Angular templates (`Renderer2`, `innerHTML`, third-party libraries) are never matched.

---

## Content queries (`contentChild`, `contentChildren`)

Content queries search the content that a parent **projects** into the component. Use them when consumers provide the children, as in a tab group. A view query would not find projected children.

```ts
import {Component, computed, contentChildren} from '@angular/core';
import {Tab} from './tab';

@Component({
  selector: 'app-tab-group',
  template: `
    <div role="tablist">
      @for (title of tabTitles(); track $index) {
        <button role="tab">{{ title }}</button>
      }
    </div>
    <ng-content />
  `,
})
export class TabGroup {
  // Tab declares `readonly title = input.required<string>()`
  readonly tabs = contentChildren(Tab);
  readonly tabTitles = computed(() => this.tabs().map((tab) => tab.title()));
}
```

Usage (the consumer imports both `TabGroup` and `Tab`):

```html
<app-tab-group>
  <app-tab title="Profile">...</app-tab>
  <app-tab title="Settings">...</app-tab>
</app-tab-group>
```

- **String locators**: The template reference variable must be on the projected content, in the parent's template, not in the component's own template. For example, `contentChild<ElementRef>('panelHeader')` in a panel component matches `<app-panel><h2 #panelHeader>Title</h2></app-panel>`.
- **`descendants` option**: `contentChild` searches all projected content by default. `contentChildren` only matches direct children of the component's host element in the projected content. Pass `{descendants: true}` to also match items nested inside other elements.
  ```ts
  readonly items = contentChildren(MenuItem, {descendants: true});
  ```
- Content queries support `.required` and the `read` option like view queries. The same `NG0951` caveat applies: projected content inside a parent's `@if` may be absent.

---

## Content projection

### Single-slot projection

A self-closing `<ng-content />` projects all children into one location.

```html
<!-- app-button template -->
<button class="btn">
  <ng-content />
</button>
```

```html
<app-button>Click Me!</app-button>
```

### Multi-slot projection

The `select` attribute of `<ng-content>` takes a CSS selector. Prefer attribute selectors (e.g. `[layout-header]`) for slots. An unknown custom element such as `<layout-header>` fails template compilation with a "not a known element" error, unless it is a real component or the parent declares `CUSTOM_ELEMENTS_SCHEMA`.

```html
<!-- app-layout template -->
<header>
  <ng-content select="[layout-header]" />
</header>
<main>
  <ng-content />
</main>
<footer>
  <ng-content select="[layout-footer]" />
</footer>
```

```html
<app-layout>
  <h1 layout-header>My Website Header</h1>
  <p>Main content goes here.</p>
  <p layout-footer>Copyright Info</p>
</app-layout>
```

### Fallback content

Since **Angular 18**, content placed inside `<ng-content>` renders when nothing matches the slot.

```html
<!-- app-card template -->
<div class="card-header">
  <ng-content select="[card-title]">Default Title</ng-content>
</div>
<div class="card-body">
  <ng-content />
</div>
```

### Conditional or repeated content

Do not put `<ng-content>` inside `@if`, `@for`, `@switch` or `<ng-template>`. The parent always instantiates projected content, even when the slot is not rendered. To render content lazily or several times, have the consumer pass an `<ng-template>`, query it and render it with `NgTemplateOutlet`, which must be added to the component's `imports`.

```ts
import {Component, contentChild, signal, TemplateRef} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-expandable',
  imports: [NgTemplateOutlet],
  template: `
    <button (click)="expanded.set(!expanded())">Toggle</button>
    @if (expanded()) {
      <ng-container [ngTemplateOutlet]="content()" />
    }
  `,
})
export class Expandable {
  readonly expanded = signal(false);
  readonly content = contentChild.required(TemplateRef);
}
```

```html
<app-expandable>
  <ng-template>
    <p>Details, only created when expanded.</p>
  </ng-template>
</app-expandable>
```

---

## Best Practices

- **Prefer signal queries**: Use `viewChild`, `viewChildren`, `contentChild` and `contentChildren` instead of the `@ViewChild`, `@ViewChildren`, `@ContentChild` and `@ContentChildren` decorators. Migrate existing code with `ng generate @angular/core:signal-queries-migration` (see [migrations.md](migrations.md)).
- **No `static` option**: Signal queries do not accept `{static: true}`, which only exists on decorator queries. Passing it is a TypeScript compilation error.
- **Call queries as functions**: Queries are signals. Read them with `this.inputEl()`, not `this.inputEl`.
- **String locators match template reference variables only**: `viewChild('myInput')` matches `<input #myInput>`, not an element named `myInput` or a `.myInput` class. To match a component or directive, pass its class.
- **Derive state instead of using lifecycle hooks**: Instead of reading queries in `ngAfterViewInit` or `ngAfterContentInit`, derive state from them with `computed()`. To work with the DOM of a queried element (measuring, calling a third-party library), use `afterRenderEffect` rather than `effect`, because `effect` runs before Angular updates the DOM (see [effects.md](effects.md)).
- **Host element**: To set attributes, classes or styles on the component's own host element, use the `host` property in `@Component` instead of injecting `ElementRef` (see [host-elements.md](host-elements.md)).
- **Limit `nativeElement` access**: Keep it for imperative DOM APIs that templates cannot express, such as `focus()`, measurements or third-party libraries. Set attributes, classes, styles and text through template bindings.
