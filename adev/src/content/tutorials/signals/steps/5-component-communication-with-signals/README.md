# Component communication with signals

Now that you've learned [managing async data with signals](/tutorials/signals/4-managing-async-data-with-signals), let's explore Angular's signal-based APIs for component inputs, outputs, and two-way binding, making component data flow more reactive and efficient.

In this activity, you'll add signal communication to pre-built components to see the three main patterns in action.

<hr />

<docs-workflow>

<docs-step title="Add signal inputs to ProductCard">
Add signal `input` and `output` to receive and send data in the `product-card` component.

```ts
// Add imports for signal based communication between components
import {Component, input, output} from '@angular/core';

// Add these signal inputs
name = input.required<string>();
price = input.required<number>();
available = input<boolean>(true);

// Add signal output
addProductToCart = output<string>();
```

</docs-step>

<docs-step title="Connect signals to the template">
Update the template in `product-card` to display the signal values and handle clicks.

```html
<div class="product-card">
  <h3>{{ name() }}</h3>
  <p class="price">\${{ price() }}</p>
  <p class="status">Status: {{ available() ? 'Available' : 'Out of Stock' }}</p>
  <button
    (click)="addToCart()"
    [disabled]="!available()">
    {{ available() ? 'Click Me!' : 'Unavailable' }}
  </button>
</div>
```

</docs-step>

<docs-step title="Add the event and display the data">
Implement the method that emits data from the child to the parent and updates the app to display the last added product.

```ts
// product-card.ts
addToCart() {
  if (this.available()) {
    this.addProductToCart.emit(this.name());
  }
}
```

```html
<!-- app.ts -->
<p>Last product added to cart: {{ lastAdded() || 'None yet' }}</p>
```

</docs-step>

<docs-step title="Connect parent signals to child inputs">
Chase the static values on the `product-card` component in `app.ts` to use dynamic values from the parent's signals.

```html
<!-- Change from static values: -->
<product-card
  name="'Static Product'"
  price="99"
  available="true"
/>


<!-- To dynamic signals: -->
<product-card
  [name]="productName()"
  [price]="productPrice()"
  [available]="productAvailable()"
  (addProductToCart)="onProductClicked($event)"
/>
```

</docs-step>

<docs-step title="Implement parent signal updates">
Add a method to handle the the `addProductToCart` output from `product-card` in `app.ts`.

```ts
onProductClicked(productName: string) {
  this.lastAdded.set(`${productName}`);
}
```

</docs-step>

<docs-step title="Set up the QuantitySelector model input">
Next, we need to setup two-way binding with a signal model in `quantity-selector.ts` file to receive and update the parent's signal model.

```ts
// Add imports
import {Component, input, model} from '@angular/core';

// Signal model input which receives parent's model
quantity = model.required<number>();

// Signal inputs for constraints
min = input<number>(1);
max = input<number>(10);
```

This creates a model input that will receive the parent's signal model.
</docs-step>

<docs-step title="Connect the template and add methods">
Update the `quantity-selector.ts` component to use the model and add increment/decrement methods.

```html
<div class="quantity-selector">
  <label>Quantity:</label>
  <button (click)="decrement()" [disabled]="quantity() <= min()">-</button>
  <span class="quantity">{{ quantity() }}</span>
  <button (click)="increment()" [disabled]="quantity() >= max()">+</button>
</div>
```

```ts
// Methods that modify the parent's model
increment() {
  if (this.quantity() < this.max()) {
    this.quantity.set(this.quantity() + 1);
  }
}

decrement() {
  if (this.quantity() > this.min()) {
    this.quantity.set(this.quantity() - 1);
  }
}
```

Notice: When the child calls `this.quantity.set()`, it's actually modifying the parent's model!
</docs-step>

<docs-step title="Set up two-way binding with signal models">
Create a signal model and connect it to the `quantity-selector` component in `app.ts`.

```ts
// Add signal model
selectedQuantity = model(1);

// Add methods to test two-way binding
resetQuantity() {
  this.selectedQuantity.set(1);
}

increaseQuantity() {
  this.selectedQuantity.set(this.selectedQuantity() + 1);
}
```

Then update the template to show the two-way binding in action:

```html
// With the actual component and controls:
<quantity-selector
  [(quantity)]="selectedQuantity"
  [min]="1"
  [max]="10">
</quantity-selector>

<div class="controls">
  <p>Selected quantity: {{ selectedQuantity() }}</p>
  <button (click)="resetQuantity()">Reset to 1</button>
  <button (click)="increaseQuantity()">Increase from Parent</button>
</div>
```

  </docs-step>

</docs-workflow>

Perfect! You've implemented the three core signal communication patterns:

- **Signal inputs** - Parent data flows down to child components reactively
- **Signal outputs** - Child events flow up to parent components with type safety
- **Signal models** - Two-way binding keeps parent and child synchronized automatically

In the next lesson, you'll learn about [using signals with services](/tutorials/signals/6-using-signals-with-services)!
