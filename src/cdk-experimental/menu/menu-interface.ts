/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';

/** Injection token used to return classes implementing the Menu interface */
export const CDK_MENU = new InjectionToken<Menu>('cdk-menu');

/** Interface which specifies Menu operations and used to break circular dependency issues */
export interface Menu {
  /** The orientation of the menu */
  orientation: 'horizontal' | 'vertical';
}
