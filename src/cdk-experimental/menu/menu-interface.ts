/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, ElementRef} from '@angular/core';
import {MenuStackItem} from './menu-stack';
import {FocusOrigin} from '@angular/cdk/a11y';

/** Injection token used to return classes implementing the Menu interface */
export const CDK_MENU = new InjectionToken<Menu>('cdk-menu');

/** Interface which specifies Menu operations and used to break circular dependency issues */
export interface Menu extends MenuStackItem {
  /** The element the Menu directive is placed on. */
  _elementRef: ElementRef<HTMLElement>;

  /** The orientation of the menu */
  orientation: 'horizontal' | 'vertical';

  /** Place focus on the first MenuItem in the menu. */
  focusFirstItem(focusOrigin: FocusOrigin): void;

  /** Place focus on the last MenuItem in the menu. */
  focusLastItem(focusOrigin: FocusOrigin): void;
}
