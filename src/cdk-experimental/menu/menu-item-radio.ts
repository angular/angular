/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {Directive, OnDestroy} from '@angular/core';
import {CdkMenuItemSelectable} from './menu-item-selectable';

/**
 * A directive providing behavior for the the "menuitemradio" ARIA role, which behaves similarly to
 * a conventional radio-button. Any sibling `CdkMenuItemRadio` instances within the same `CdkMenu`
 * or `CdkMenuGroup` comprise a radio group with unique selection enforced.
 */
@Directive({
  selector: '[cdkMenuItemRadio]',
  exportAs: 'cdkMenuItemRadio',
  host: {
    '(click)': 'trigger()',
    'type': 'button',
    'role': 'menuitemradio',
    '[attr.aria-checked]': 'checked || null',
    '[attr.aria-disabled]': 'disabled || null',
  },
  providers: [{provide: CdkMenuItemSelectable, useExisting: CdkMenuItemRadio}],
})
export class CdkMenuItemRadio extends CdkMenuItemSelectable implements OnDestroy {
  /** Function to unregister the selection dispatcher */
  private _removeDispatcherListener: () => void;

  constructor(private readonly _selectionDispatcher: UniqueSelectionDispatcher) {
    super();

    this._registerDispatcherListener();
  }

  /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
  private _registerDispatcherListener() {
    this._removeDispatcherListener = this._selectionDispatcher.listen(
      (id: string, name: string) => (this.checked = this.id === id && this.name === name)
    );
  }

  /** Toggles the checked state of the radio-button. */
  trigger() {
    super.trigger();

    if (!this.disabled) {
      this._selectionDispatcher.notify(this.id, this.name);
    }
  }

  ngOnDestroy() {
    this._removeDispatcherListener();
  }
}
