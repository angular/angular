import {Component, ChangeDetectionStrategy} from '@angular/core';

// TODO: Import input and model from @angular/core

@Component({
  selector: 'quantity-selector',
  template: `
    <div class="quantity-selector">
      <label>Quantity:</label>
      <button [disabled]="true">-</button>
      <span class="quantity">1</span>
      <button [disabled]="true">+</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantitySelector {
  // TODO: Create signal model INPUT for quantity (not creating a new model!)
  // Use model.required<number>() to receive parent's model
  // TODO: Create signal inputs for min and max constraints
  // TODO: Add increment method that updates the model
  // TODO: Add decrement method that updates the model
}
