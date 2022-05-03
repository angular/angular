/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {CdkComboboxModule} from '@angular/cdk-experimental/combobox';
import {CommonModule} from '@angular/common';

@Component({
  templateUrl: 'cdk-combobox-demo.html',
  standalone: true,
  imports: [CdkComboboxModule, CommonModule],
})
export class CdkComboboxDemo {}
