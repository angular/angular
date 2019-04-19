/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'mat-card',
  templateUrl: 'card.html',
  styleUrls: ['card.css'],
  host: {
    'class': 'mat-mdc-card',
  },
  exportAs: 'matCard',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatCard {
  // TODO: set up MDC foundation class.
}
