import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {ProductCard} from './product-card';

@Component({
  selector: 'app-root',
  imports: [ProductCard],
  template: `
    <div class="shopping-app">
      <h1>Input Signals Demo</h1>

      <div class="demo-section">
        <h2>Signal Inputs (Parent → Child)</h2>
        <p>Data flows down from parent to child via signal inputs:</p>

        <product-card
          [name]="productName()"
          [price]="productPrice()"
          [available]="productAvailable()"
        />

        <div class="controls">
          <button (click)="updateProduct()">Update Product Data</button>
          <button (click)="toggleAvailability()">Toggle Availability</button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // Signal inputs data
  productName = signal('Demo Product');
  productPrice = signal(99);
  productAvailable = signal(true);

  updateProduct() {
    this.productName.set(`Product ${Math.floor(Math.random() * 100)}`);
    this.productPrice.set(Math.floor(Math.random() * 500) + 50);
  }

  toggleAvailability() {
    this.productAvailable.set(!this.productAvailable());
  }
}
