/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Pipe, PipeTransform} from '@angular/core';
import {NavigationItem} from '../interfaces/index';

@Pipe({
  name: 'isActiveNavigationItem',
})
export class IsActiveNavigationItem implements PipeTransform {
  // Check whether provided item: `itemToCheck` should be marked as active, based on `activeItem`.
  // In addition to `activeItem`, we should mark all its parents, grandparents, etc. as active.
  transform(itemToCheck: NavigationItem, activeItem: NavigationItem | null): boolean {
    let node = activeItem?.parent;

    while (node) {
      if (node === itemToCheck) {
        return true;
      }

      node = node.parent;
    }

    return false;
  }
}
