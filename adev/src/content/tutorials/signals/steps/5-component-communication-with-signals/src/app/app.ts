// TODO: Import signal and model from @angular/core
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {ProductCard} from './product-card';
import {QuantitySelector} from './quantity-selector';

@Component({
  selector: 'app-root',
  imports: [ProductCard, QuantitySelector],
  template: `
    <div class="shopping-app">
      <h1>Component Communication with Signals</h1>

      <div class="demo-section">
        <h2>Signal Inputs (Parent → Child)</h2>
        <p>Data flows down from parent to child via signal inputs:</p>

        <product-card
          name="'Static Product'"
          price="99"
          available="true"
        />

        <div class="controls">
          <button (click)="updateProduct()">Update Product Data</button>
          <button (click)="toggleAvailability()">Toggle Availability</button>
        </div>
      </div>

      <div class="demo-section">
        <h2>Signal Models (Parent ↔ Child)</h2>
        <p>Two-way binding allows parent and child to share state:</p>

        <!-- TODO: Update quantity-selector with two-way binding -->
        <quantity-selector></quantity-selector>

        <div class="controls">
          <p>Selected quantity: 1</p>
          <button (click)="resetQuantity()">Reset to 1</button>
          <button (click)="increaseQuantity()">Increase from Parent</button>
        </div>

        <div class="explanation">
          <p><strong>After implementing signal models:</strong></p>
          <ul>
            <li>Click +/- buttons (child changes parent)</li>
            <li>Click "Increase from Parent" (parent changes child)</li>
            <li>Watch both sync automatically!</li>
          </ul>
        </div>
      </div>

      <div class="demo-section">
        <h2>Signal Outputs (Child → Parent)</h2>
        <p>Last product clicked on: None yet</p>
      </div>
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  productName = signal('Demo Product');
  productPrice = signal(99);
  productAvailable = signal(true);
  lastAdded = signal<string | null>(null);

  // TODO: Create signal model for selectedQuantity
  // TODO: Create signal for lastAdded tracking

  updateProduct() {
    this.productName.set(`Product ${Math.floor(Math.random() * 100)}`);
    this.productPrice.set(Math.floor(Math.random() * 500) + 50);
  }

  toggleAvailability() {
    this.productAvailable.set(!this.productAvailable());
  }

  resetQuantity() {
    // TODO: Reset selectedQuantity to 1
    console.log('TODO: Reset quantity');
  }

  increaseQuantity() {
    // TODO: Increase selectedQuantity by 1
    console.log('TODO: Increase quantity');
  }

  // TODO: Add onProductClicked method to handle child events
}
