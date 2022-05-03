/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';

@Component({
  selector: 'drawer-demo',
  templateUrl: 'drawer-demo.html',
  styleUrls: ['drawer-demo.css'],
  standalone: true,
  imports: [MatButtonModule, MatListModule, MatSidenavModule],
})
export class DrawerDemo {
  invert = false;
}
