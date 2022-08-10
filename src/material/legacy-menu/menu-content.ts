/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {MAT_MENU_CONTENT, _MatMenuContentBase} from '@angular/material/menu';

/**
 * Menu content that will be rendered lazily once the menu is opened.
 */
@Directive({
  selector: 'ng-template[matMenuContent]',
  providers: [{provide: MAT_MENU_CONTENT, useExisting: MatLegacyMenuContent}],
})
export class MatLegacyMenuContent extends _MatMenuContentBase {}
