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
import {CdkMenuItemTrigger} from './menu-item-trigger';
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
  private _id = `${nextId++}`;

  /** Function to unregister the selection dispatcher */
  private _removeDispatcherListener: () => void;

  constructor(
    private readonly _selectionDispatcher: UniqueSelectionDispatcher,
    element: ElementRef<HTMLElement>,
    ngZone: NgZone,
    @Inject(MENU_STACK) menuStack: MenuStack,
    @Optional() @Inject(CDK_MENU) parentMenu?: Menu,
    @Optional() @Inject(MENU_AIM) menuAim?: MenuAim,
    @Optional() dir?: Directionality,
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    // `CdkMenuItemRadio` is commonly used in combination with a `CdkMenuItemTrigger`.
    // tslint:disable-next-line: lightweight-tokens
    @Self() @Optional() menuTrigger?: CdkMenuItemTrigger,
  ) {
    super(element, ngZone, menuStack, parentMenu, menuAim, dir, menuTrigger);

    this._registerDispatcherListener();
  }

  /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
  private _registerDispatcherListener() {
    this._removeDispatcherListener = this._selectionDispatcher.listen((id: string) => {
      this.checked = this._id === id;
    });
  }

  /** Toggles the checked state of the radio-button. */
  override trigger(options?: {keepOpen: boolean}) {
    super.trigger(options);

    if (!this.disabled) {
      this._selectionDispatcher.notify(this._id, '');
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();

    this._removeDispatcherListener();
  }
}
