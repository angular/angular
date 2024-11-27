/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {ApiItemType} from '../interfaces/api-item-type';
import {ApiLabel} from '../pipes/api-label.pipe';

@Component({
  selector: 'docs-api-item-label',
  templateUrl: './api-item-label.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-type]': 'type()',
    '[attr.data-mode]': 'mode()',
  },
  imports: [ApiLabel],
})
export default class ApiItemLabel {
  readonly type = input.required<ApiItemType>();
  readonly mode = input.required<'short' | 'full'>();
}
