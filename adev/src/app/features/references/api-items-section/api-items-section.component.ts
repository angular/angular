/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ApiItemsGroup} from '../interfaces/api-items-group';
import ApiItemLabel from '../api-item-label/api-item-label.component';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'adev-api-items-section',
  imports: [ApiItemLabel, RouterLink, MatTooltipModule],
  templateUrl: './api-items-section.component.html',
  styleUrls: ['./api-items-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ApiItemsSection {
  readonly group = input.required<ApiItemsGroup>();
}
