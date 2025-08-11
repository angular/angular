import {Component, signal, model, ChangeDetectionStrategy} from '@angular/core';
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
          [name]="productName()"
          [price]="productPrice()"
          [available]="productAvailable()"
          (addProductToCart)="onProductClicked($event)"
        />

        <div class="controls">
          <button (click)="updateProduct()">Update Product Data</button>
          <button (click)="toggleAvailability()">Toggle Availability</button>
        </div>
      </div>

      <div class="demo-section">
        <h2>Signal Models (Parent ↔ Child)</h2>
        <p>Two-way binding allows parent and child to share state:</p>

        <quantity-selector
          [(quantity)]="selectedQuantity"
          [min]="1"
          [max]="10"
        />

        <div class="controls">
          <p>Selected quantity: {{ selectedQuantity() }}</p>
          <button (click)="resetQuantity()">Reset to 1</button>
          <button (click)="increaseQuantity()">Increase from Parent</button>
        </div>

        <div class="explanation">
          <p><strong>Try this:</strong></p>
          <ul>
            <li>Click +/- buttons above (child changes parent)</li>
            <li>Click "Increase from Parent" (parent changes child)</li>
            <li>Both automatically sync! That's the power of signal models.</li>
          </ul>
        </div>
      </div>

      <div class="demo-section">
        <h2>Signal Outputs (Child → Parent)</h2>
        <p>Last product added to cart: {{ lastAdded() || 'None yet' }}</p>
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

  // Signal model for two-way binding
  selectedQuantity = model(1);

  // Signal for tracking events
  lastAdded = signal<string | null>(null);

  updateProduct() {
    this.productName.set(`Product ${Math.floor(Math.random() * 100)}`);
    this.productPrice.set(Math.floor(Math.random() * 500) + 50);
  }

  toggleAvailability() {
    this.productAvailable.set(!this.productAvailable());
  }

  resetQuantity() {
    this.selectedQuantity.set(1);
  }

  increaseQuantity() {
    this.selectedQuantity.set(this.selectedQuantity() + 1);
  }

  onProductClicked(productName: string) {
    this.lastAdded.set(`${productName}`);
  }
}
