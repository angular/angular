/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {CdkListboxModule} from '@angular/cdk-experimental/listbox';
import {CommonModule} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  templateUrl: 'cdk-listbox-demo.html',
  styleUrls: ['cdk-listbox-demo.css'],
  standalone: true,
  imports: [CdkListboxModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class CdkListboxDemo {
  multiSelectable = false;
  activeDescendant = true;
  formControl = new FormControl('');

  disableForm() {
    this.formControl.disable();
  }

  toggleMultiple() {
    this.multiSelectable = !this.multiSelectable;
  }

  toggleActiveDescendant() {
    this.activeDescendant = !this.activeDescendant;
  }
}
