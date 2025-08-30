import {Component, ChangeDetectionStrategy} from '@angular/core';

// TODO: Import model and input from @angular/core

@Component({
  selector: 'custom-checkbox',
  template: `
    <label class="custom-checkbox">
      <!-- TODO: Add checkbox input with [checked] binding and (change) event -->
      <span class="checkmark"></span>
      <!-- TODO: Display label -->
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomCheckbox {
  // TODO: Add model signal for two-way binding
  // checked = model.required<boolean>();
  // TODO: Add optional input for label
  // label = input<string>('');
  // TODO: Add toggle method
  // toggle() {
  //   this.checked.set(!this.checked());
  // }
}
