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
  selector: 'mat-slide-toggle',
  templateUrl: 'slide-toggle.html',
  styleUrls: ['slide-toggle.css'],
  host: {
    'class': 'mat-mdc-slide-toggle',
  },
  exportAs: 'matSlideToggle',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSlideToggle {
  // TODO: set up MDC foundation class.
}
