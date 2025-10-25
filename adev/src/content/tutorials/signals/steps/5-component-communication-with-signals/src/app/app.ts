// TODO: Import signal from @angular/core
import {Component, ChangeDetectionStrategy} from '@angular/core';
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

        <!-- TODO: Change from static values to dynamic signal values -->
        <product-card
          name="Static Product"
          price="99"
          available="true"
        />

        <!-- TODO: Add controls to test reactive updates -->
        <div class="controls">
          <!-- Add buttons to update product data and toggle availability -->
        </div>
      </div>
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // TODO: Create parent signals for product data
  // productName = signal('Demo Product');
  // productPrice = signal(99);
  // productAvailable = signal(true);
  // TODO: Add methods to update parent signals
  // updateProduct() {
  //   this.productName.set('Updated Product');
  //   this.productPrice.set(149);
  // }
  // toggleAvailability() {
  //   this.productAvailable.set(!this.productAvailable());
  // }
}
