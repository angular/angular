/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import {MenuStackItem} from './menu-stack';
import {FocusOrigin} from '@angular/cdk/a11y';

/** Injection token used to return classes implementing the Menu interface */
export const CDK_MENU = new InjectionToken<Menu>('cdk-menu');

/** Interface which specifies Menu operations and used to break circular dependency issues */
export interface Menu extends MenuStackItem {
  /** The id of the menu's host element. */
  id: string;

  /** The menu's native DOM host element. */
  nativeElement: HTMLElement;

  /** The direction items in the menu flow. */
  readonly orientation: 'horizontal' | 'vertical';

  /** Place focus on the first MenuItem in the menu. */
  focusFirstItem(focusOrigin: FocusOrigin): void;

  /** Place focus on the last MenuItem in the menu. */
  focusLastItem(focusOrigin: FocusOrigin): void;
}
