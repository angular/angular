/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatLegacyCardModule} from '@angular/material/legacy-card';
import {MatDividerModule} from '@angular/material/divider';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'card-demo',
  templateUrl: 'card-demo.html',
  styleUrls: ['card-demo.css'],
  standalone: true,
  imports: [MatButtonModule, MatLegacyCardModule, MatDividerModule, MatProgressBarModule],
})
export class CardDemo {
  longText =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ' +
    'incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud ' +
    'exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor' +
    ' in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur' +
    ' sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id ' +
    'est laborum.';
}
