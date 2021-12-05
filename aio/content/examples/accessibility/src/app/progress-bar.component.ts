/* eslint-disable @angular-eslint/no-host-metadata-property */
// #docregion progressbar-component
import { Component, Input } from '@angular/core';

/**
 * Example progressbar component.
 */
@Component({
  selector: 'app-example-progressbar',
  template: '<div class="bar" [style.width.%]="value"></div>',
  styleUrls: ['./progress-bar.component.css'],
  host: {
    // Sets the role for this component to "progressbar"
    role: 'progressbar',

    // Sets the minimum and maximum values for the progressbar role.
    'aria-valuemin': '0',
    'aria-valuemax': '100',

    // Binding that updates the current value of the progressbar.
    '[attr.aria-valuenow]': 'value',
  }
})
export class ExampleProgressbarComponent  {
  /** Current value of the progressbar. */
  @Input() value = 0;
}

// #enddocregion progressbar-component
