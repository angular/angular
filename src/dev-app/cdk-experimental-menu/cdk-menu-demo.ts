/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {ConnectedPosition} from '@angular/cdk/overlay';

@Component({
  templateUrl: 'cdk-menu-demo.html',
  styleUrls: ['cdk-menu-demo.css'],
})
export class CdkMenuDemo {
  customPosition = [
    {originX: 'center', originY: 'center', overlayX: 'center', overlayY: 'center'},
  ] as ConnectedPosition[];
}
