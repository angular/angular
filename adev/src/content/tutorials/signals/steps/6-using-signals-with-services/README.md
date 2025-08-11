# Using signals with services

Now that you've learned [component communication with signals](/tutorials/signals/5-component-communication-with-signals), let's explore how to use signals with Angular services. Services are perfect for sharing reactive state across multiple components, and signals make this even more powerful by providing automatic change detection and clean reactive patterns.

In this activity, you'll learn how to create a cart store that uses signals to manage shopping cart state and share it across components.

<hr />

Let's build a simple shopping cart store that manages cart state with signals, allowing the cart display component to react to cart changes automatically.

<docs-workflow>

<docs-step title="Add cart store signals">
Add readonly and computed signals to make the cart state reactive in `cart-store.ts`.

```ts
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

These signals allow components to reactively access cart data and computed totals.
</docs-step>

<docs-step title="Update the cart display component">
Update the cart display component in `cart-display.ts` to use the cart store signals.

```ts
import {Component, inject} from '@angular/core';
import {CartStore} from './cart-store';

@Component({
  selector: 'cart-display',
  template: `
    <div class="cart-display">
      <h2>Shopping Cart Demo</h2>

      <div class="add-products">
        <h3>Add Products</h3>
        <button (click)="addLaptop()">Add Laptop ($999)</button>
        <button (click)="addMouse()">Add Mouse ($25)</button>
        <button (click)="addKeyboard()">Add Keyboard ($79)</button>
      </div>

      <h3>Cart Contents</h3>

      @if (cartStore.cartItems().length === 0) {
        <p class="empty-message">Your cart is empty</p>
      } @else {
        <div class="cart-items">
          @for (item of cartStore.cartItems(); track item.id) {
            <div class="cart-item">
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <p class="price">\${{ item.price }} each</p>
              </div>

              <div class="quantity-controls">
                <button (click)="decreaseQuantity(item.id)">-</button>
                <span class="quantity">{{ item.quantity }}</span>
                <button (click)="increaseQuantity(item.id)">+</button>
                <button (click)="removeItem(item.id)" class="remove">×</button>
              </div>
            </div>
          }
        </div>

        <div class="cart-summary">
          <p>Total Items: {{ cartStore.totalQuantity() }}</p>
          <p class="total-price">Total: \${{ cartStore.totalPrice() }}</p>
          <button (click)="clearCart()" class="clear-btn">Clear Cart</button>
        </div>
      }
    </div>
  `,
})
export class CartDisplay {
  cartStore = inject(CartStore);

  addLaptop() {
    this.cartStore.addItem('1', 'Laptop', 999);
  }

  addMouse() {
    this.cartStore.addItem('2', 'Mouse', 25);
  }

  addKeyboard() {
    this.cartStore.addItem('3', 'Keyboard', 79);
  }

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

  removeItem(id: string) {
    this.cartStore.removeItem(id);
  }

  clearCart() {
    this.cartStore.clearCart();
  }
}
```

This component includes buttons to add products and displays cart contents using service signals.
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
  styleUrls: ['./app.css'],
})
export class App {
  cartStore = inject(CartStore);
}
```

This component demonstrates how services with signals provide automatic reactivity in the header cart badge.
</docs-step>

</docs-workflow>

Excellent! You've now learned how to use signals with services. Key concepts to remember:

- **Service-level signals**: Services can use signals to manage reactive state
- **Dependency injection**: Use `inject()` to access services with signals in components
- **Computed signals in services**: Create derived state that updates automatically
- **Readonly signals**: Expose read-only versions of signals to prevent external mutations

In the next lesson, you'll learn about [how to use signals with directives](/tutorials/signals/7-using-signals-with-directives)!
