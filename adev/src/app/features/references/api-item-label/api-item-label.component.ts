/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {ApiItemType} from '../interfaces/api-item-type';

const shortLabelsMap: Record<ApiItemType, string> = {
  [ApiItemType.BLOCK]: 'B',
  [ApiItemType.CLASS]: 'C',
  [ApiItemType.CONST]: 'K',
  [ApiItemType.DECORATOR]: '@',
  [ApiItemType.DIRECTIVE]: 'D',
  [ApiItemType.ELEMENT]: 'El',
  [ApiItemType.ENUM]: 'E',
  [ApiItemType.FUNCTION]: 'F',
  [ApiItemType.INTERFACE]: 'I',
  [ApiItemType.PIPE]: 'P',
  [ApiItemType.NG_MODULE]: 'M',
  [ApiItemType.TYPE_ALIAS]: 'T',
  [ApiItemType.INITIALIZER_API_FUNCTION]: 'IA',
};

const fullLabelsMap: Record<ApiItemType, string> = {
  [ApiItemType.BLOCK]: 'Block',
  [ApiItemType.CLASS]: 'Class',
  [ApiItemType.CONST]: 'Const',
  [ApiItemType.DECORATOR]: 'Decorator',
  [ApiItemType.DIRECTIVE]: 'Directive',
  [ApiItemType.ELEMENT]: 'Element',
  [ApiItemType.ENUM]: 'Enum',
  [ApiItemType.FUNCTION]: 'Function',
  [ApiItemType.INTERFACE]: 'Interface',
  [ApiItemType.PIPE]: 'Pipe',
  [ApiItemType.NG_MODULE]: 'Module',
  [ApiItemType.TYPE_ALIAS]: 'Type Alias',
  [ApiItemType.INITIALIZER_API_FUNCTION]: 'Initializer API',
};

@Component({
  selector: 'docs-api-item-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="{{ clazz() }}">{{ label() }}</span>
    @if (mode() === 'full') {
      {{ fullLabel() }}
    }
  `,
  styleUrls: ['./api-item-label.component.scss'],
})
export default class ApiItemLabel {
  readonly mode = input<'short' | 'full'>('short');
  readonly type = input.required<ApiItemType>();
  readonly label = computed(() => shortLabelsMap[this.type()]);
  readonly fullLabel = computed(() => fullLabelsMap[this.type()]);
  readonly clazz = computed(() => `type-${this.type()}`);
}
