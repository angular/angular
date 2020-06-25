/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, TemplateRef} from '@angular/core';
import {Menu} from './menu-interface';

/**
 * Directive applied to an ng-template which wraps a CdkMenu and provides a reference to the
 * child element it wraps which allows for opening of the CdkMenu in an overlay.
 */
@Directive({selector: 'ng-template[cdkMenuPanel]', exportAs: 'cdkMenuPanel'})
export class CdkMenuPanel {
  /** Reference to the child menu component */
  _menu?: Menu;

  constructor(readonly _templateRef: TemplateRef<unknown>) {}

  /**
   * Set the Menu component on the menu panel. Since we cannot use ContentChild to fetch the
   * child Menu component, the child Menu must register its self with the parent MenuPanel.
   */
  _registerMenu(child: Menu) {
    this._menu = child;
  }
}
