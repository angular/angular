/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'legacy-button-demo',
  templateUrl: 'legacy-button-demo.html',
  styleUrls: ['legacy-button-demo.css'],
  standalone: true,
  imports: [MatLegacyButtonModule, MatIconModule],
})
export class LegacyButtonDemo {
  isDisabled: boolean = false;
  clickCounter: number = 0;
  toggleDisable: boolean = false;
}
