/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {MatSnackBar} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'icon-a11y',
  templateUrl: 'icon-a11y.html',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class IconAccessibilityDemo {
  constructor(private snackBar: MatSnackBar) {}

  deleteIcon() {
    this.snackBar.open('Item deleted', '', {duration: 2000});
  }
}
