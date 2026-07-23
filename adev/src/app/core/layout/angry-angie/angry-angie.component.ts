/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject} from '@angular/core';

import {AngryAngie} from '../../services/angry-angie.service';

@Component({
  selector: 'adev-angry-angie',
  templateUrl: './angry-angie.component.html',
  styleUrl: './angry-angie.component.scss',
})
export class AngryAngieComponent {
  protected readonly angie = inject(AngryAngie);
}
