/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {CdkMenu} from './menu';

/**
 * Directive applied to an ng-template which wraps a CdkMenu and provides a reference to the
 * child element it wraps which allows for opening of the CdkMenu in an overlay.
 */
@Directive({selector: 'ng-template[cdkMenuPanel]', exportAs: 'cdkMenuPanel'})
export class CdkMenuPanel {
  /** Reference to the child menu component */
  _menu: CdkMenu;
}
