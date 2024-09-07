/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, Input, signal} from '@angular/core';
import {ApiItemType} from '../interfaces/api-item-type';
import {ApiLabel} from '../pipes/api-label.pipe';

@Component({
  selector: 'docs-api-item-label',
  templateUrl: './api-item-label.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-type]': 'apiItemType()',
    '[attr.data-mode]': 'labelMode()',
  },
  imports: [ApiLabel],
})
export default class ApiItemLabel {
  @Input({required: true}) set type(value: ApiItemType) {
    this.apiItemType.set(value);
  }
  @Input({required: true}) set mode(value: 'short' | 'full') {
    this.labelMode.set(value);
  }

  protected apiItemType = signal<ApiItemType | undefined>(undefined);
  protected labelMode = signal<'short' | 'full'>('short');
}
