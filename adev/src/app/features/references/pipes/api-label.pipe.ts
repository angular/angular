/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Pipe, PipeTransform} from '@angular/core';

import {ApiItemType} from '../interfaces/api-item-type';

@Pipe({
  name: 'adevApiLabel',
})
export class ApiLabel implements PipeTransform {
  transform(value: ApiItemType, labelType: 'short' | 'full'): string {
    return labelType === 'full' ? fullLabelsMap[value] : shortLabelsMap[value];
  }
}

export const shortLabelsMap: Record<ApiItemType, string> = {
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

export const fullLabelsMap: Record<ApiItemType, string> = {
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
