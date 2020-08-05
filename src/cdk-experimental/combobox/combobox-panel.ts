/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';

@Directive({
  selector: 'ng-template[cdkComboboxPanel]',
  exportAs: 'cdkComboboxPanel',
})
export class CdkComboboxPanel<T = unknown> {

}
