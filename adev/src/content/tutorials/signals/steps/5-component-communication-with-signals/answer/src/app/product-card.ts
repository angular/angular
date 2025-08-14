import {Component, input, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'product-card',
  template: `
    <div class="product-card">
      <h3>{{ name() }}</h3>
      <p class="price">\${{ price() }}</p>
      <p class="status">
        Status: 
        @if (available()) {
          <span class="available">Available</span>
        } @else {
          <span class="unavailable">Out of Stock</span>
        }
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  // Signal inputs - receive data from parent
  name = input.required<string>();
  price = input.required<number>();
  available = input<boolean>(true);
}
