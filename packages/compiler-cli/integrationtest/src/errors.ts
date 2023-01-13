/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({selector: 'comp-with-error', templateUrl: 'errors.html'})
export class BindingErrorComp {
  createError() {
    throw new Error('Test');
  }
}
