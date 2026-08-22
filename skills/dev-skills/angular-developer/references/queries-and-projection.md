# View Queries and Content Projection

View queries and content projection allow components to access, interact with, and dynamically insert nested elements or components in their views.

## View Queries (`viewChild`, `viewChildren`)

Use signal-based queries to access child elements or components in the component's own template. Signal queries are reactive, readonly signals that automatically update when the DOM changes.

### Querying a Single Element or Component (`viewChild`)

Use `viewChild` to find the first matching child.

```ts
import {Component, ElementRef, viewChild} from '@angular/core';

@Component({
  selector: 'app-custom-input',
  template: ` <input #inputField type="text" /> `,
})
export class CustomInput {
  // Query by template reference variable
  readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputField');

  focusInput() {
    // The signal value might be undefined if queried before the view is initialized
    this.inputEl()?.nativeElement.focus();
  }
}
```

- **Required Queries**: Use `viewChild.required` if you expect the child to always be present. It returns a signal that directly throws an error if read before it is available or if it is missing.
  ```ts
  readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('inputField');
  ```
- **Querying Components**: You can query by component class name. L'inférence de type est automatique dans ce cas.
  ```ts
  readonly childComponent = viewChild(ChildComponent); // Type déduit automatiquement : Signal<ChildComponent | undefined>
  ```
  _Note : Pour les requêtes basées sur des chaînes de caractères (variables de référence de template comme `'inputField'`), le typage générique explicite (ex: `ElementRef<HTMLInputElement>`) est requis car TypeScript ne peut pas inférer le type de l'élément cible._

### Querying Multiple Elements or Components (`viewChildren`)

Use `viewChildren` to query all matching items. It returns a signal containing a read-only array of matches.

```ts
import {Component, viewChildren} from '@angular/core';
import {TabComponent} from './tab.component';

@Component({
  selector: 'app-tab-group',
  template: `
    <app-tab title="Tab 1">Content 1</app-tab>
    <app-tab title="Tab 2">Content 2</app-tab>
  `,
})
export class TabGroup {
  readonly tabs = viewChildren(TabComponent);

  ngAfterViewInit() {
    console.log(`Number of tabs: ${this.tabs().length}`);
  }
}
```

### Query Options

You can pass an options object to configure the query:

- `read`: Read a different token from the matched element (e.g. `ElementRef` or a specific directive instance).
  ```ts
  readonly child = viewChild(ChildComponent, {read: ElementRef});
  ```

---

## Content Queries (`contentChild`, `contentChildren`)

Use content queries to access elements or components that are projected into the component's template via `<ng-content>`.

```ts
import {Component, contentChild, ElementRef} from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    <div class="card-content">
      <ng-content />
    </div>
  `,
})
export class Card {
  // Query projected element with template ref '#cardHeader'
  readonly header = contentChild<ElementRef>('cardHeader');
}
```

- Content queries resolve during content initialization, before view queries.
- Like view queries, you can use `.required` and configuration options like `read`.
- **Option `descendants`** : Détermine si la requête recherche récursivement dans les sous-éléments. Par défaut, elle est à `true` pour `contentChild` et à `false` pour `contentChildren`.
  ```ts
  readonly items = contentChildren(ItemComponent, { descendants: true });
  ```

---

## Content Projection

Content projection allows you to insert HTML or component templates from a parent component into a child component.

### Single-slot Projection

Use a plain `<ng-content />` tag to project all children into a single location.

```html
<!-- app-button component template -->
<button class="btn">
  <ng-content />
</button>
```

Usage:

```html
<app-button>Click Me!</app-button>
```

### Multi-slot Projection

Use the `select` attribute on `<ng-content>` to target specific elements based on CSS selectors (attributes, classes, or element names).

```html
<!-- app-layout component template -->
<header>
  <ng-content select="header-content" />
</header>
<main>
  <ng-content />
</main>
<footer>
  <ng-content select="[footer-content]" />
</footer>
```

Usage:

```html
<app-layout>
  <header-content>My Website Header</header-content>
  <p>Main content goes here.</p>
  <div footer-content>Copyright Info</div>
</app-layout>
```

### Fallback/Default Content

Since **Angular 18**, you can provide default fallback content inside `<ng-content>` that will render if no content matches the slot.

```html
<!-- app-card component template -->
<div class="card">
  <div class="card-header">
    <ng-content select="card-title">Default Title</ng-content>
  </div>
  <div class="card-body">
    <ng-content />
  </div>
</div>
```

---

## Recommended Patterns

- **Prefer Signal-based Queries**: Use `viewChild`, `viewChildren`, `contentChild`, and `contentChildren` instead of legacy decorators (`@ViewChild`, `@ViewChildren`, `@ContentChild`, `@ContentChildren`).
- **Reactive Derivations**: Since signal queries return signals, you can compose them inside `computed` or monitor them in `effect` blocks without needing lifecycle hooks like `ngAfterViewInit`.
- **Use `.required` for Safe Reads**: Prefer `.required` when the element is guaranteed to be in the template, eliminating type checks for `undefined`.
- **Prefer Host Property for Element Access**: If you only need to modify attributes/styles/classes on the component's host element itself, use the `host` property in `@Component` metadata instead of querying the host element via `ElementRef`.
- **Avoid Direct DOM Manipulation**: Always prefer binding data reactively or using Angular APIs rather than directly manipulating element DOM properties via `nativeElement`.
