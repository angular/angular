import {Component, input, output, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'product-card',
  template: `
    <div class="product-card">
      <h3>{{ name() }}</h3>
      <p class="price">\${{ price() }}</p>
      <p class="status">Status: {{ available() ? 'Available' : 'Out of Stock' }}</p>
      <button
        (click)="addToCart()"
        [disabled]="!available()">
        {{ available() ? 'Add to cart' : 'Unavailable' }}
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  // Signal inputs - receive data from parent
  name = input.required<string>();
  price = input.required<number>();
  available = input<boolean>(true);

  // Signal output - send events to parent
  addProductToCart = output<string>();

  addToCart() {
    if (this.available()) {
      this.addProductToCart.emit(this.name());
    }
  }
}
