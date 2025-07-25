import {Component, input, signal} from '@angular/core';

@Component({
  selector: 'cart-summary',
  template: `
    <div class="cart-summary" [style.background]="isAnimating() ? '#e8f5e8' : ''">
      <h3>Cart Summary {{ isAnimating() ? '🎉' : '' }}</h3>
      <p>Items: {{ itemCount() }}</p>
      <p>Total: \${{ total() }}</p>
      @if (isAnimating()) {
        <p style="color: green; font-weight: bold;">Processing checkout...</p>
      }
    </div>
  `,
  styleUrls: ['./app.css'],
})
export class CartSummary {
  itemCount = input.required<number>();
  total = input.required<number>();

  isAnimating = signal(false);

  // Public method for parent interaction
  initiateCheckout() {
    this.isAnimating.set(true);
    setTimeout(() => this.isAnimating.set(false), 2000);
  }
}
