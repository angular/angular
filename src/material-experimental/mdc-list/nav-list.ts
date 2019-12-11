/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {MatList} from './list';
import {MatListBase} from './list-base';

@Component({
  selector: 'mat-nav-list',
  /**
   * @deprecated `matList` export will be removed, use `matNavList`
   * @breaking-change 11.0.0
   */
  exportAs: 'matNavList, matList',
  templateUrl: 'list.html',
  host: {
    'class': 'mat-mdc-nav-list mat-mdc-list-base',
  },
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    /**
     * @deprecated Provider for `MatList` will be removed, use `MatNavList` instead.
     * @breaking-change 11.0.0
     */
    {provide: MatList, useExisting: MatNavList}
  ]
})
export class MatNavList extends MatListBase {}
