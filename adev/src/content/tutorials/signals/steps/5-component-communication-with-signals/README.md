# Passing data to components with input signals

Now that you've learned [managing async data with signals](/tutorials/signals/4-managing-async-data-with-signals), let's explore Angular's signal-based `input()` API for passing data from parent to child components, making component data flow more reactive and efficient. If you're familiar with component props from other frameworks, inputs are the same idea.

In this activity, you'll add signal inputs to a product card component and see how parent data flows down reactively.

<hr />

<docs-workflow>

<docs-step title="Add signal inputs to ProductCard">
Add signal `input()` functions to receive data in the `product-card` component.

```ts
// Add imports for signal inputs
import {Component, input} from '@angular/core';

// Add these signal inputs
name = input.required<string>();
price = input.required<number>();
available = input<boolean>(true);
```

Notice how `input.required()` creates an input that must be provided, while `input()` with a default value is optional.
</docs-step>

<docs-step title="Connect inputs to the template">
Update the template in `product-card` to display the signal input values.

```html
<div class="product-card">
  <h3>{{ name() }}</h3>
  <p class="price">\${{ price() }}</p>
  <p class="status">Status:
    @if (available()) {
      Available
    } @else {
      Out of Stock
    }
  </p>
</div>
```

Input signals work just like regular signals in templates - call them as functions to access their values.
</docs-step>

<docs-step title="Connect parent signals to child inputs">
Update the `product-card` usage in `app.ts` to pass dynamic signal values instead of static ones.

```html
<!-- Change from static values: -->
<product-card
  name="Static Product"
  price="99"
  available="true"
/>

<!-- To dynamic signals: -->
<product-card
  [name]="productName()"
  [price]="productPrice()"
  [available]="productAvailable()"
/>
```

The square brackets `[]` create property bindings that pass the current signal values to the child.
</docs-step>

<docs-step title="Test reactive updates">
Add methods in `app.ts` to update the parent signals and see how the child component reacts automatically.

```ts
updateProduct() {
  this.productName.set('Updated Product');
  this.productPrice.set(149);
}

toggleAvailability() {
  this.productAvailable.set(!this.productAvailable());
}
```

```html
<!-- Add controls to test reactivity -->
<div class="controls">
  <button (click)="updateProduct()">Update Product Info</button>
  <button (click)="toggleAvailability()">Toggle Availability</button>
</div>
```

When parent signals change, the child component automatically receives and displays the new values!
</docs-step>

</docs-workflow>

Excellent! You've learned how signal inputs work:

- **Signal inputs** - Use `input()` and `input.required()` to receive data from parent components
- **Reactive updates** - Child components automatically update when parent signal values change
- **Type safety** - Signal inputs provide full TypeScript type checking
- **Default values** - Optional inputs can have default values while required inputs must be provided

Signal inputs make component communication more reactive and eliminate the need for `OnChanges` lifecycle hooks in many cases.

In the next lesson, you'll learn about [two-way binding with model signals](/tutorials/signals/6-two-way-binding-with-model-signals)!
