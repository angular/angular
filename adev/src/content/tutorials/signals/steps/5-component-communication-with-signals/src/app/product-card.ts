import {Component, ChangeDetectionStrategy} from '@angular/core';

// TODO: Import input from @angular/core

@Component({
  selector: 'product-card',
  template: `
    <div class="product-card">
      <!-- TODO: Display signal input values -->
      <h3>Product Name</h3>
      <p class="price">$0</p>
      <p class="status">Status: Available</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  // TODO: Create signal inputs for name, price, and available
  // name = input.required<string>();
  // price = input.required<number>();
  // available = input<boolean>(true);
}
