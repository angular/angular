/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {Directive, ElementRef, Inject, NgZone, OnDestroy, Optional, Self} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {CdkMenuItemSelectable} from './menu-item-selectable';
import {CdkMenuItem} from './menu-item';
import {CdkMenuTrigger} from './menu-trigger';
import {CDK_MENU, Menu} from './menu-interface';
import {MENU_AIM, MenuAim} from './menu-aim';
import {MENU_STACK, MenuStack} from './menu-stack';

/** Counter used to set a unique id and name for a selectable item */
let nextId = 0;

/**
 * A directive providing behavior for the "menuitemradio" ARIA role, which behaves similarly to
 * a conventional radio-button. Any sibling `CdkMenuItemRadio` instances within the same `CdkMenu`
 * or `CdkMenuGroup` comprise a radio group with unique selection enforced.
 */
@Directive({
  selector: '[cdkMenuItemRadio]',
  exportAs: 'cdkMenuItemRadio',
  host: {
    'role': 'menuitemradio',
  },
  providers: [
    {provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio},
    {provide: CdkMenuItem, useExisting: CdkMenuItemSelectable},
  ],
})
export class CdkMenuItemRadio extends CdkMenuItemSelectable implements OnDestroy {
  /** An ID to identify this radio item to the `UniqueSelectionDisptcher`. */
  private _id = `${nextId++}`;

  /** Function to unregister the selection dispatcher */
  private _removeDispatcherListener: () => void;

  constructor(
    /** The host element for this radio item. */
    element: ElementRef<HTMLElement>,
    /** The Angular zone. */
    ngZone: NgZone,
    /** The unique selection dispatcher for this radio's `CdkMenuGroup`. */
    private readonly _selectionDispatcher: UniqueSelectionDispatcher,
    /** The menu stack this item belongs to. */
    @Inject(MENU_STACK) menuStack: MenuStack,
    /** The parent menu for this item. */
    @Optional() @Inject(CDK_MENU) parentMenu?: Menu,
    /** The menu aim used for this item. */
    @Optional() @Inject(MENU_AIM) menuAim?: MenuAim,
    /** The directionality of the page. */
    @Optional() dir?: Directionality,
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    // tslint:disable-next-line: lightweight-tokens
    @Self() @Optional() menuTrigger?: CdkMenuTrigger,
  ) {
    super(element, ngZone, menuStack, parentMenu, menuAim, dir, menuTrigger);

    this._registerDispatcherListener();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();

    this._removeDispatcherListener();
  }

  /**
   * Toggles the checked state of the radio-button.
   * @param options Options the configure how the item is triggered
   *   - keepOpen: specifies that the menu should be kept open after triggering the item.
   */
  override trigger(options?: {keepOpen: boolean}) {
    super.trigger(options);

    if (!this.disabled) {
      this._selectionDispatcher.notify(this._id, '');
    }
  }

  /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
  private _registerDispatcherListener() {
    this._removeDispatcherListener = this._selectionDispatcher.listen((id: string) => {
      this.checked = this._id === id;
    });
  }
}
