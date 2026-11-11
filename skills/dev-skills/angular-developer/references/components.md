# Components

Angular components are the fundamental building blocks of an application. Each component consists of a TypeScript class with behaviors, an HTML template, and a CSS selector.

## Component Definition

Use the `@Component` decorator to define a component's metadata.

```ts
@Component({
  selector: 'app-profile',
  template: `
    <img src="profile.jpg" alt="Profile photo" />
    <button (click)="save()">Save</button>
  `,
  styles: `
    img {
      border-radius: 50%;
    }
  `,
})
export class Profile {
  save() {
    /* ... */
  }
}
```

## Metadata Options

- `selector`: The CSS selector that identifies this component in templates.
- `template`: Inline HTML template (preferred for small templates).
- `templateUrl`: Path to an external HTML file.
- `styles`: Inline CSS styles.
- `styleUrl` / `styleUrls`: Path(s) to external CSS file(s).
- `imports`: Lists the components, directives, or pipes used in this component's template.

## Using Components

To use a component, add it to the `imports` array of the consuming component and use its selector in the template.

```ts
@Component({
  selector: 'app-root',
  imports: [Profile],
  template: `<app-profile />`,
})
export class App {}
```

### Self-Closing Tags

Angular supports self-closing tags for custom components.

**Rule:** Always use self-closing tags when a component does not contain projected content or child nodes:

```html
<!-- Preferred: concise and modern -->
<app-profile />
<app-user-card [user]="currentUser()" />
<router-outlet />

<!-- Avoid: redundant closing tags for empty elements -->
<app-profile></app-profile>
<app-user-card [user]="currentUser()"></app-user-card>
<router-outlet></router-outlet>
```

## Template Control Flow

Angular uses built-in blocks for conditional rendering and loops.

### Conditional Rendering (`@if`)

Use `@if` to conditionally show content. You can include `@else if` and `@else` blocks.

```html
@if (user.isAdmin) {
<admin-dashboard />
} @else if (user.isModerator) {
<mod-dashboard />
} @else {
<standard-dashboard />
}
```

**Result aliasing**: Save the result of the expression for reuse.

```html
@if (user.settings(); as settings) {
<p>Theme: {{ settings.theme }}</p>
}
```

### Loops (`@for`)

The `@for` block iterates over collections. The `track` expression is **required** for performance and DOM reuse.

```html
<ul>
  @for (item of items(); track item.id; let i = $index, total = $count) {
  <li>{{ i + 1 }}/{{ total }}: {{ item.name }}</li>
  } @empty {
  <li>No items to display.</li>
  }
</ul>
```

**Implicit Variables**: `$index`, `$count`, `$first`, `$last`, `$even`, `$odd`.

### Avoiding function calls in templates

Do not call component methods from template expressions, especially methods that take arguments or build a new array or object (e.g. `@for (x of getItems(count))`, `{{ formatDate(item.date) }}`). A method is re-run every time the component's template is checked, which happens on every change when the component is dirty (OnPush and zoneless reduce how often, but do not make the call cached). Methods that return a new array or object also give `@for` a new collection on every run.

Reading a signal (`count()`, `items()`) is fine, and so is a trivial lookup. For anything else, derive the value once:

- **`computed()`** for values derived from signals.
- **A pure pipe** for formatting a value (see [pipes.md](pipes.md)).
- **A child component** when each item needs its own derived state.

A `computed()` cannot take arguments, so when the template passes a loop variable to a method, derive the whole nested structure instead:

```ts
// Avoid: items() runs again for every group on every check.
groups = computed(() => [this.count(), 1, 1]);
items(count: number) {
  return Array(count);
}
```

```html
@for (count of groups(); track $index) { @for (_ of items(count); track $index) { ... } }
```

```ts
// Prefer: derive the nested data once.
groups = computed(() => [this.count(), 1, 1].map((n) => Array.from({length: n}, (_, i) => i)));
```

```html
@for (group of groups(); track $index) { @for (item of group; track item) { ... } }
```

### Switching Content (`@switch`)

The `@switch` block renders content based on a value. It uses strict equality (`===`) and has **no fallthrough**.

```html
@switch (status()) { @case ('loading') { <app-spinner /> } @case ('error') { <app-error-msg /> }
@case ('success') { <app-data-grid /> } @default {
<p>Unknown status</p>
} }
```

**Multiple Cases**: Stack consecutive `@case` statements with no content between them to share one
block across several matches.

```angular-html
@switch (status()) {
  @case ('paused')
  @case ('cancelled') {
    <span>Not running</span>
  }
  @default {
    <span>Running</span>
  }
}
```

**Exhaustive Type Checking**: Use `@default never;` to ensure all cases of a union type are handled.

```html
@switch (state) { @case ('on') { ... } @case ('off') { ... } @default never; // Errors if a new
state like 'standby' is added }
```

### Arrow Functions in Template Expressions

Template expressions support arrow functions with an expression body, such as inline array
callbacks:

```html
<button (click)="count.update((c) => c + 1)">Increment</button>
```

For derived values such as a filtered list, use a `computed` signal in the component instead.

Arrow functions must have an expression body, such as `(c) => c + 1`. In event bindings, call the
method directly, `(click)="save()"`, because an arrow function like `(click)="() => save()"` is
never invoked.

Arrow functions with a block body (`() => { ... }`) are not supported. A pipe cannot be used
inside an arrow function's body, but an arrow function can be passed as an argument to a pipe.

## Core Concepts

- **Host Element**: The DOM element that matches the component's selector.
- **View**: The DOM rendered by the component's template inside the host element.
- **Standalone**: By default, components are standalone (since Angular 19, `standalone: true` is default). For older versions, `standalone: true` must be explicit or the component must be part of an `NgModule`.
- **Component Tree**: Angular applications are structured as a tree of components, where each component can host child components.
- **Component Naming**: Do not add suffixes the `Component` suffix for Component classes (e.g., AppComponent) unless the project has been configured to use that naming configuration.
