/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'removeHtmlTags',
})
export class RemoveHtmlTags implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) {
      return '';
    }
    return value.replace(/<[^>]*>/g, '');
  }
}
