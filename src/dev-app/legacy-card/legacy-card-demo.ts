/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCardModule} from '@angular/material/legacy-card';
import {MatDividerModule} from '@angular/material/divider';
import {MatLegacyProgressBarModule} from '@angular/material/legacy-progress-bar';

@Component({
  selector: 'legacy-card-demo',
  templateUrl: 'legacy-card-demo.html',
  styleUrls: ['legacy-card-demo.css'],
  standalone: true,
  imports: [
    MatLegacyButtonModule,
    MatLegacyCardModule,
    MatDividerModule,
    MatLegacyProgressBarModule,
  ],
})
export class LegacyCardDemo {
  longText =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ' +
    'incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud ' +
    'exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor' +
    ' in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur' +
    ' sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id ' +
    'est laborum.';
}
