/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {ApiItemType} from '../interfaces/api-item-type';
import {shortLabelsMap} from '../pipes/api-label.pipe';

@Component({
  selector: 'docs-api-item-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': `clazz()`,
  },
  template: `{{ label() }}`,
})
export default class ApiItemLabel {
  readonly type = input.required<ApiItemType>();
  readonly label = computed(() => shortLabelsMap[this.type()]);
  readonly clazz = computed(() => `type-${this.type()}`);
}
