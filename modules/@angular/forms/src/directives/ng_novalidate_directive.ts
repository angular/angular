/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';

@Directive({
  selector: 'form:not([ngNoForm])',
  host: {'novalidate': ''},
})
export class NgNovalidate {
}
