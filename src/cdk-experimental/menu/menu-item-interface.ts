/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '@angular/core';

/**
 * An element within a Menu or MenuBar which:
 *  - performs some user defined action
 *  - opens up a submenu
 *  - acts as a checkbox or radio button
 */
export interface MenuItem {
  /** ARIA role for the menu item. */
  role: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox';

  /** Whether the checkbox or radiobutton is checked */
  checked: boolean;

  /**  Whether the MenuItem is disabled - defaults to false */
  disabled: boolean;

  /** Emits when the attached submenu is opened */
  opened: EventEmitter<void>;

  /** Whether the menu item opens a menu */
  hasSubmenu(): boolean;
}
