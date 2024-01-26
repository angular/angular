<docs-decorative-header title="Conditionals and Loops" imgSrc="adev/src/assets/images/directives.svg"> <!-- markdownlint-disable-line -->
Conditionally show and/or repeat content based on dynamic data.
</docs-decorative-header>

One of the advantages of using a framework like Angular is that it provides built-in solutions for common problems that developers encounter. Examples of this include: displaying content based on a certain condition, rendering a list of items based on application data, etc.

To solve this problem, Angular uses built-in control flow blocks, which tell the framework when and how your templates should be rendered.

## Conditional rendering

One of the most common scenarios that developers encounter is the desire to show or hide content in templates based on a condition.

A common example of this is whether or not to display certain controls on the screen based on the user's permission level.

### `@if` block

Similar to JavaScript's `if` statement, Angular uses `@if` control flow blocks to conditionally hide and show part of a template and its contents.

```ts
// user-controls.component.ts
@Component({
  standalone: true,
  selector: 'user-controls',
  template: `
    @if (isAdmin) {
      <button>Erase database</button>
    }
  `,
})
export class UserControls {
  isAdmin = true;
}
```

In this example, Angular only renders the `<button>` element if the `isAdmin` property is true. Otherwise, it does not appear on the page.

### `@else` block

While the `@if` block can be helpful in many situations, it's common to also show fallback UI when the condition is not met.

For example, in the `UserControls` component, rather than show a blank screen, it would be helpful to users to know that they're not able to see anything because they're not authenticated.

When you need a fallback, similar to JavaScript's `else` clause, add an `@else` block to accomplish the same effect.

```ts
// user-controls.component.ts
@Component({
  standalone: true,
  selector: 'user-controls',
  template: `
    @if (isAdmin) {
      <button>Erase database</button>
    } @else {
      <p>You are not authorized.</p>
    }
  `,
})
export class UserControls {
  isAdmin = true;
}
```

## Rendering a list

Another common scenario developers encounter is the need to render a list of items.

### `@for` block

Similar to JavaScript’s `for...of` loops, Angular provides the `@for` block for rendering repeated elements.

```html
<!-- ingredient-list.component.html -->
<ul>
  @for (ingredient of ingredientList; track ingredient.name) {
    <li>{{ ingredient.quantity }} - {{ ingredient.name }}</li>
  }
</ul>
```

```ts
// ingredient-list.component.ts
@Component({
  standalone: true,
  selector: 'ingredient-list',
  templateUrl: './ingredient-list.component.html',
})
export class IngredientList {
  ingredientList = [
    {name: 'noodles', quantity: 1},
    {name: 'miso broth', quantity: 1},
    {name: 'egg', quantity: 2},
  ];
}
```

However, unlike a standard `for...of` loop, you might've noticed that there's an additional `track` keyword.

#### `track` property

When Angular renders a list of elements with `@for`, those items can later change or move. Angular needs to track each element through any reordering, usually by treating a property of the item as a unique identifier or key.

This ensures any updates to the list are reflected correctly in the UI and tracked properly within Angular, especially in the case of stateful elements or animations.

To accomplish this, we can provide a unique key to Angular with the `track` keyword.

## Next Step

With the ability to determine when and how templates are rendered, it's time to learn how we handle an important aspect of most applications: handling user input.

<docs-pill-row>
  <docs-pill title="Handling User Interaction" href="essentials/handling-user-interaction" />
</docs-pill-row>
