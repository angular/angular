# Query child elements with signal queries

Now that you've learned [how to use signals with directives](/tutorials/signals/8-using-signals-with-directives), let's explore signal-based query APIs. These provide a reactive way to access and interact with child components and directives. Both components and directives can perform queries while also being queried themselves. Unlike the traditional ViewChild, signal queries automatically update and provide type-safe access to child components and directives.

In this activity, you'll add viewChild queries to interact with child components programmatically.

<hr />

<docs-workflow>

<docs-step title="Add viewChild import">
First, add the `viewChild` import to access child components in `app.ts`.

```ts
import {Component, signal, computed, viewChild, ChangeDetectionStrategy} from '@angular/core';
```

</docs-step>

<docs-step title="Create viewChild queries">
Add viewChild queries to the App component to access child components.

```ts
// Query APIs to access child components
firstProduct = viewChild(ProductCard);
cartSummary = viewChild(CartSummary);
```

These queries create signals that reference child component instances.
</docs-step>

<docs-step title="Implement parent methods">
Use the viewChild queries to call methods on child components in `app.ts`:

```ts
showFirstProductDetails() {
  const product = this.firstProduct();
  if (product) {
    product.highlight();
  }
}

initiateCheckout() {
  const summary = this.cartSummary();
  if (summary) {
    summary.initiateCheckout();
  }
}
```

</docs-step>

<docs-step title="Test the interactions">
The control buttons should now work:

- **"Show First Product Details"** - Calls `highlight()` on the ProductCard
- **"Initiate Checkout"** - Calls `initiateCheckout()` on the CartSummary

Click the buttons to see how viewChild queries enable parent components to control child behavior.
</docs-step>

</docs-workflow>

Perfect! You've learned how to use signal-based query APIs for child component interaction:

In the next lesson, you'll learn about [how to react to signal changes with effect](/tutorials/signals/10-reacting-to-signal-changes-with-effect)!
