/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  moduleId: module.id,
  selector: 'dual-sidenav-a11y',
  templateUrl: 'dual-sidenav-a11y.html',
  styleUrls: ['shared.css', 'dual-sidenav-a11y.css'],
  host: {'class': 'demo-a11y-sidenav-app'},
})
export class SidenavDualAccessibilityDemo {
  constructor(private _snackbar: MatSnackBar) {}

  play(list: string) {
    this._snackbar.open(`Playing "${list}"`, '', {duration: 1000});
  }
}
