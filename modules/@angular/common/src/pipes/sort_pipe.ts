/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe, PipeTransform} from '@angular/core';

/**
* Sort an array
*
* ### Usage
*
*  <div *ngFor="let item of items | sort">
*    {{item}}
*  </div>
*
* @experimental
 */
@Pipe({name: 'sort'})
export class SortPipe implements PipeTransform {
  public transform(list: any[], path?: string): any[] {
    if (!list) return undefined;

    if (path) {
      let compareObj: any;

      return list.sort((a, b) => {

        path.split('.').forEach(s => {a = a[s];});

        path.split('.').forEach(s => {b = b[s];});

        if (a > b) {
          return 1;
        } else {
          return -1;
        }
      });
    } else
      return list.sort();
  }
}
