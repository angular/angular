/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe, PipeTransform} from '@angular/core';

/**
 * @ngModule CommonModule
 * @whatItDoes Transforms an object to array of its key value pairs.
 * @howToUse `object_expression | entries`
 * @description
 *
 * Transforms an object to array of `{key, value}` pairs using `Object.keys`.
 *
 * ### Example
 * {@example common/pipes/ts/entries_pipe.ts region='EntriesPipe'}
 *
 * @experimental
 */
@Pipe({name: 'entries', pure: false})
export class EntriesPipe implements PipeTransform {
  transform(object: {[key: string]: any}): {key: string, value: any}[] {
    if (object == null) {
      return [];
    }

    return Object.keys(object).map(key => ({key, value: object[key]}));
  }
}
