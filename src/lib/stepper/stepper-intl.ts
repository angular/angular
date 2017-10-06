/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';


/** Stepper data that is required for internationalization. */
@Injectable()
export class MatStepperIntl {
  /**
   * Stream that emits whenever the labels here are changed. Use this to notify
   * components if the labels have changed after initialization.
   */
  changes: Subject<void> = new Subject<void>();

  /** Label that is rendered below optional steps. */
  optionalLabel = 'Optional';
}
