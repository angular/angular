/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {MatInteractiveListBase, MatListBase} from './list-base';

@Component({
  selector: 'mat-action-list',
  exportAs: 'matActionList',
  template: '<ng-content></ng-content>',
  host: {
    'class': 'mat-mdc-action-list mat-mdc-list-base mdc-list',
  },
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: MatListBase, useExisting: MatActionList},
  ]
})
export class MatActionList extends MatInteractiveListBase {}
