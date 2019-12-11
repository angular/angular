/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {MatListBase} from './list-base';

@Component({
  selector: 'mat-action-list',
  exportAs: 'matActionList',
  templateUrl: 'list.html',
  host: {
    'class': 'mat-mdc-action-list mat-mdc-list-base',
  },
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatActionList extends MatListBase {}
