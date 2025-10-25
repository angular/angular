# Using signals with services

Now that you've learned [two-way binding with model signals](/tutorials/signals/6-two-way-binding-with-model-signals), let's explore how to use signals with Angular services. Services are perfect for sharing reactive state across multiple components, and signals make this even more powerful by providing automatic change detection and clean reactive patterns.

In this activity, you'll learn how to create a cart store with signals that allow the cart display component to react to state changes automatically.

<hr />

<docs-workflow>

<docs-step title="Add cart store signals">
Add readonly and computed signals to make the cart state reactive in `cart-store.ts`.

```ts
// Add the computed import
import {Injectable, signal, computed} from '@angular/core';

// Then add these signals to the class:

// Readonly signals
readonly cartItems = this.items.asReadonly();

// Computed signals
readonly totalQuantity = computed(() => {
  return this.items().reduce((sum, item) => sum + item.quantity, 0);
});

readonly totalPrice = computed(() => {
  return this.items().reduce((sum, item) => sum + item.price * item.quantity, 0);
});
```

These signals allow components to reactively access cart data and computed totals. The `asReadonly()` method prevents external code from modifying the cart items directly, while `computed()` creates derived state that automatically updates when the source signal changes.
</docs-step>

<docs-step title="Complete the quantity update methods">
The cart display component in `cart-display.ts` already uses the cart store signals in its template. Complete the quantity update methods to modify cart items:

```ts
increaseQuantity(id: string) {
  const items = this.cartStore.cartItems();
  const currentItem = items.find((item) => item.id === id);
  if (currentItem) {
    this.cartStore.updateQuantity(id, currentItem.quantity + 1);
  }
}

decreaseQuantity(id: string) {
  const items = this.cartStore.cartItems();
  const currentItem = items.find((item) => item.id === id);
  if (currentItem && currentItem.quantity > 1) {
    this.cartStore.updateQuantity(id, currentItem.quantity - 1);
  }
}
```

These methods read the current cart state using `cartItems()` and update quantities through the store's methods. The UI automatically updates when the signals change!
</docs-step>

<docs-step title="Update the main app component">
Update the main app component in `app.ts` to use the cart service and display the cart component.

```ts
import {Component, inject} from '@angular/core';
import {CartStore} from './cart-store';
import {CartDisplay} from './cart-display';

@Component({
  selector: 'app-root',
  imports: [CartDisplay],
  template: `
    <div class="shopping-app">
      <header>
        <h1>Signals with Services Demo</h1>
        <div class="cart-badge">
          Cart: {{ cartStore.totalQuantity() }} items (\${{ cartStore.totalPrice() }})
        </div>
      </header>

      <main>
        <cart-display></cart-display>
      </main>
    </div>
  `,
  styleUrl: './app.css',
})
export class App {
  cartStore = inject(CartStore);
}
```

</docs-step>

</docs-workflow>

Excellent! You've now learned how to use signals with services. Key concepts to remember:

- **Service-level signals**: Services can use signals to manage reactive state
- **Dependency injection**: Use `inject()` to access services with signals in components
- **Computed signals in services**: Create derived state that updates automatically
- **Readonly signals**: Expose read-only versions of signals to prevent external mutations

In the next lesson, you'll learn about [how to use signals with directives](/tutorials/signals/8-using-signals-with-directives)!
