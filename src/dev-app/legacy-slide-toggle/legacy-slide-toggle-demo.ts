/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatLegacySlideToggleModule} from '@angular/material/legacy-slide-toggle';

@Component({
  selector: 'slide-toggle-demo',
  templateUrl: 'legacy-slide-toggle-demo.html',
  styleUrls: ['legacy-slide-toggle-demo.css'],
  standalone: true,
  imports: [FormsModule, MatLegacyButtonModule, MatLegacySlideToggleModule],
})
export class LegacySlideToggleDemo {
  firstToggle: boolean;

  onFormSubmit() {
    alert(`You submitted the form.`);
  }
}
