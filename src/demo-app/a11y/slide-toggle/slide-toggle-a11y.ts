/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {MatSnackBar} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'slide-toggle-a11y',
  templateUrl: 'slide-toggle-a11y.html'
})
export class SlideToggleAccessibilityDemo {
  emailToggle: boolean = true;
  termsToggle: boolean = false;
  musicToggle: boolean = false;

  constructor(private snackBar: MatSnackBar) {}

  onFormSubmit() {
    this.snackBar.open('Terms and condistions accepted!', '', {duration: 2000});
  }
}
