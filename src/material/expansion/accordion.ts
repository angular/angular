/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, ContentChildren, QueryList, AfterContentInit} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {CdkAccordion} from '@angular/cdk/accordion';
import {FocusKeyManager} from '@angular/cdk/a11y';
import {HOME, END} from '@angular/cdk/keycodes';
import {MAT_ACCORDION, MatAccordionBase, MatAccordionDisplayMode} from './accordion-base';
import {MatExpansionPanelHeader} from './expansion-panel-header';

/**
 * Directive for a Material Design Accordion.
 */
@Directive({
  selector: 'mat-accordion',
  exportAs: 'matAccordion',
  inputs: ['multi'],
  providers: [{
    provide: MAT_ACCORDION,
    useExisting: MatAccordion
  }],
  host: {
    class: 'mat-accordion'
  }
})
export class MatAccordion extends CdkAccordion implements MatAccordionBase, AfterContentInit {
  private _keyManager: FocusKeyManager<MatExpansionPanelHeader>;

  @ContentChildren(MatExpansionPanelHeader, {descendants: true})
  _headers: QueryList<MatExpansionPanelHeader>;

  /** Whether the expansion indicator should be hidden. */
  @Input()
  get hideToggle(): boolean { return this._hideToggle; }
  set hideToggle(show: boolean) { this._hideToggle = coerceBooleanProperty(show); }
  private _hideToggle: boolean = false;

  /**
   * Display mode used for all expansion panels in the accordion. Currently two display
   * modes exist:
   *  default - a gutter-like spacing is placed around any expanded panel, placing the expanded
   *     panel at a different elevation from the rest of the accordion.
   *  flat - no spacing is placed around expanded panels, showing all panels at the same
   *     elevation.
   */
  @Input() displayMode: MatAccordionDisplayMode = 'default';

  ngAfterContentInit() {
    this._keyManager = new FocusKeyManager(this._headers).withWrap();
  }

  /** Handles keyboard events coming in from the panel headers. */
  _handleHeaderKeydown(event: KeyboardEvent) {
    const {keyCode} = event;
    const manager = this._keyManager;

    if (keyCode === HOME) {
      manager.setFirstItemActive();
      event.preventDefault();
    } else if (keyCode === END) {
      manager.setLastItemActive();
      event.preventDefault();
    } else {
      this._keyManager.onKeydown(event);
    }
  }

  _handleHeaderFocus(header: MatExpansionPanelHeader) {
    this._keyManager.updateActiveItem(header);
  }
}
