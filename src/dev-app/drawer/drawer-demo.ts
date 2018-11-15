/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'drawer-demo',
  templateUrl: 'drawer-demo.html',
  styleUrls: ['drawer-demo.css'],
})
export class DrawerDemo {
  invert = false;
}
