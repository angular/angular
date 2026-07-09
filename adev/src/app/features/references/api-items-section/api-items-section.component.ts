/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, input} from '@angular/core';
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import ApiItemLabel from '../api-item-label/api-item-label.component';
import {ApiItemsGroup} from '../interfaces/api-items-group';

@Component({
  selector: 'adev-api-items-section',
  imports: [ApiItemLabel, RouterLink, MatTooltip],
  templateUrl: './api-items-section.component.html',
  styleUrls: ['./api-items-section.component.scss'],
})
export default class ApiItemsSection {
  readonly group = input.required<ApiItemsGroup>();
}
