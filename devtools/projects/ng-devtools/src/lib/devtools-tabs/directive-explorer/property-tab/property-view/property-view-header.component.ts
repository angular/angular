/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input} from '@angular/core';

@Component({
  selector: 'ng-property-view-header',
  templateUrl: './property-view-header.component.html',
  styleUrls: ['./property-view-header.component.scss'],
})
export class PropertyViewHeaderComponent {
  @Input() directive: string;
}
