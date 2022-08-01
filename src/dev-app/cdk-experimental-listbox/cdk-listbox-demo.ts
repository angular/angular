/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CdkListboxModule} from '@angular/cdk-experimental/listbox';
import {CommonModule} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacySelectModule} from '@angular/material/legacy-select';

function dumbCompare(o1: string, o2: string) {
  const equiv = new Set(['apple', 'orange']);
  return o1 === o2 || (equiv.has(o1) && equiv.has(o2));
}

@Component({
  templateUrl: 'cdk-listbox-demo.html',
  styleUrls: ['cdk-listbox-demo.css'],
  standalone: true,
  imports: [
    CdkListboxModule,
    CommonModule,
    FormsModule,
    MatLegacySelectModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkListboxDemo {
  multiSelectable = false;
  activeDescendant = true;
  skipDisabled = true;
  compare?: (o1: string, o2: string) => boolean;
  fruitControl = new FormControl();
  nativeFruitControl = new FormControl();

  get fruit() {
    return this.fruitControl.value;
  }
  set fruit(value) {
    this.fruitControl.setValue(value);
  }

  get nativeFruit() {
    return this.nativeFruitControl.value;
  }
  set nativeFruit(value) {
    this.nativeFruitControl.setValue(value);
  }

  toggleFormDisabled() {
    if (this.fruitControl.disabled) {
      this.fruitControl.enable();
      this.nativeFruitControl.enable();
    } else {
      this.fruitControl.disable();
      this.nativeFruitControl.disable();
    }
  }

  toggleMultiple() {
    this.multiSelectable = !this.multiSelectable;
  }

  toggleActiveDescendant() {
    this.activeDescendant = !this.activeDescendant;
  }

  toggleDumbCompare() {
    this.compare = this.compare ? undefined : dumbCompare;
  }

  toggleSkipDisabled() {
    this.skipDisabled = !this.skipDisabled;
  }

  onNativeFruitChange(event: Event) {
    this.nativeFruit = Array.from(
      (event.target as HTMLSelectElement).selectedOptions,
      option => option.value,
    );
  }
}
