import {Component, input, signal, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'product-card',
  template: `
    <div class="product-card" #cardElement>
      <h3 #productTitle>{{ name() }}</h3>
      <p class="price">\${{ price() }}</p>
      <p class="description">{{ description() }}</p>
      <div class="actions">
        <button (click)="toggleDetails()">
          {{ showDetails() ? 'Hide' : 'Show' }} Details
        </button>
      </div>
      @if (showDetails()) {
        <div class="details">
          <p>Product ID: {{ productId() }}</p>
          <p>Category: {{ category() }}</p>
        </div>
      }
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  name = input.required<string>();
  price = input.required<number>();
  description = input<string>('');
  available = input<boolean>(true);
  productId = input<string>('');
  category = input<string>('');

  showDetails = signal(false);

  toggleDetails() {
    this.showDetails.set(!this.showDetails());
  }

  // Public methods for parent interaction
  highlight() {
    this.showDetails.set(true);
  }
}
