/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Input} from '@angular/core';

@Component({
  selector: '[mat-list-item]',
  standalone: true,
  template: '<ng-content></ng-content>',
})
export class MatListItemStub {
  @Input() activated: boolean = false;
}
