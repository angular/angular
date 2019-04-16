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
  selector: 'mat-button',
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  host: {
    'class': 'mat-mdc-button',
  },
  exportAs: 'matMyCheckbox',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatButton {
  // TODO: set up MDC foundation class.
}
