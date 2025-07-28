import {Component, ChangeDetectionStrategy} from '@angular/core';

// TODO: Import input and output from @angular/core

@Component({
  selector: 'product-card',
  template: `
    <div class="product-card">
      <h3>Product Name</h3>
      <p class="price">$0</p>
      <p class="status">Status: Available</p>
      <button>Add to cart</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  // TODO: Create signal inputs for name, price, and available
  // TODO: Create signal output for clicked events
  // TODO: Implement addToCart method
}
