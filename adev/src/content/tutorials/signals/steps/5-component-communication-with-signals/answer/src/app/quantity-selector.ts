import {Component, input, model, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'quantity-selector',
  template: `
    <div class="quantity-selector">
      <label>Quantity:</label>
      <button (click)="decrement()" [disabled]="quantity() <= min()">-</button>
      <span class="quantity">{{ quantity() }}</span>
      <button (click)="increment()" [disabled]="quantity() >= max()">+</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantitySelector {
  // Signal model INPUT - receives parent's model for two-way binding
  quantity = model.required<number>();

  // Signal inputs for constraints
  min = input<number>(1);
  max = input<number>(10);

  increment() {
    if (this.quantity() < this.max()) {
      this.quantity.set(this.quantity() + 1);
    }
  }

  decrement() {
    if (this.quantity() > this.min()) {
      this.quantity.set(this.quantity() - 1);
    }
  }
}
