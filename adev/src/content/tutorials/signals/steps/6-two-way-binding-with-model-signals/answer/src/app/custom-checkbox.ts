import {Component, input, model} from '@angular/core';

@Component({
  selector: 'custom-checkbox',
  template: `
    <label class="custom-checkbox">
      <input type="checkbox" [checked]="checked()" (change)="toggle()" />
      <span class="checkmark"></span>
      {{ label() }}
    </label>
  `,
})
export class CustomCheckbox {
  // Model signal for two-way binding
  checked = model.required<boolean>();

  // Optional input for label
  label = input<string>('');

  toggle() {
    // This updates BOTH the component's state AND the parent's model!
    this.checked.set(!this.checked());
  }
}
