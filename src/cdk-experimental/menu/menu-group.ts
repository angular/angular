/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  Output,
  EventEmitter,
  ContentChildren,
  AfterContentInit,
  QueryList,
  OnDestroy,
} from '@angular/core';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {takeUntil} from 'rxjs/operators';
import {CdkMenuItemSelectable} from './menu-item-selectable';
import {CdkMenuItem} from './menu-item';

/**
 * Directive which acts as a grouping container for `CdkMenuItem` instances with
 * `role="menuitemradio"`, similar to a `role="radiogroup"` element.
 */
@Directive({
  selector: '[cdkMenuGroup]',
  exportAs: 'cdkMenuGroup',
  host: {
    'role': 'group',
    'class': 'cdk-menu-group',
  },
  providers: [{provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher}],
})
export class CdkMenuGroup implements AfterContentInit, OnDestroy {
  /** Emits the element when checkbox or radiobutton state changed  */
  @Output() readonly change: EventEmitter<CdkMenuItem> = new EventEmitter();

  /** List of menuitemcheckbox or menuitemradio elements which reside in this group */
  @ContentChildren(CdkMenuItemSelectable, {descendants: true})
  private readonly _selectableItems: QueryList<CdkMenuItemSelectable>;

  /** Emits when the _selectableItems QueryList triggers a change */
  private readonly _selectableChanges: EventEmitter<void> = new EventEmitter();

  ngAfterContentInit() {
    this._registerMenuSelectionListeners();
  }

  /**
   * Register the child selectable elements with the change emitter and ensure any new child
   * elements do so as well.
   */
  private _registerMenuSelectionListeners() {
    this._selectableItems.forEach(selectable => this._registerClickListener(selectable));

    this._selectableItems.changes.subscribe((selectableItems: QueryList<CdkMenuItemSelectable>) => {
      this._selectableChanges.next();
      selectableItems.forEach(selectable => this._registerClickListener(selectable));
    });
  }

  /** Register each selectable to emit on the change Emitter when clicked */
  private _registerClickListener(selectable: CdkMenuItemSelectable) {
    selectable.toggled
      .pipe(takeUntil(this._selectableChanges))
      .subscribe(() => this.change.next(selectable));
  }

  ngOnDestroy() {
    this._selectableChanges.next();
    this._selectableChanges.complete();
  }
}
