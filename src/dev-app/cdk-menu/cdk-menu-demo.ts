/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {ConnectedPosition} from '@angular/cdk/overlay';
import {CdkMenuModule} from '@angular/cdk/menu';
import {CommonModule} from '@angular/common';
import {CdkMenuExamplesModule} from '@angular/components-examples/cdk/menu';

@Component({
  templateUrl: 'cdk-menu-demo.html',
  styleUrls: ['cdk-menu-demo.css'],
  standalone: true,
  imports: [CdkMenuModule, CommonModule, CdkMenuExamplesModule],
})
export class CdkMenuDemo {
  customPosition = [
    {originX: 'center', originY: 'center', overlayX: 'center', overlayY: 'center'},
  ] as ConnectedPosition[];

  sizes = ['Small', 'Normal', 'Large'];
  colors = ['Red', 'Green', 'Blue'];
  selectedSize: string | undefined = 'Normal';
  selectedColor: string | undefined = 'Red';
}
