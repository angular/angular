/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive} from '@angular/core';

@Directive({
  selector: '[myAttr]',
  standalone: true,
})
export class MyAttrDirective {}
