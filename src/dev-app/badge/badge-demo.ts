/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatBadgeModule} from '@angular/material/badge';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'badge-demo',
  templateUrl: 'badge-demo.html',
  styleUrls: ['badge-demo.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatBadgeModule, MatLegacyButtonModule, MatIconModule],
})
export class BadgeDemo {
  visible = true;
  badgeContent = '0';
}
