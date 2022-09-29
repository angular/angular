/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  Input,
  ContentChildren,
  QueryList,
  AfterContentInit,
  OnDestroy,
} from '@angular/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {CdkAccordion} from '@angular/cdk/accordion';
import {FocusKeyManager} from '@angular/cdk/a11y';
import {startWith} from 'rxjs/operators';
import {
  MAT_ACCORDION,
  MatAccordionBase,
  MatAccordionDisplayMode,
  MatAccordionTogglePosition,
} from './accordion-base';
import {MatExpansionPanelHeader} from './expansion-panel-header';

/**
 * Directive for a Material Design Accordion.
 */
@Directive({
  selector: 'mat-accordion',
  exportAs: 'matAccordion',
  inputs: ['multi'],
  providers: [
    {
      provide: MAT_ACCORDION,
      useExisting: MatAccordion,
    },
  ],
  host: {
    class: 'mat-accordion',
    // Class binding which is only used by the test harness as there is no other
    // way for the harness to detect if multiple panel support is enabled.
    '[class.mat-accordion-multi]': 'this.multi',
  },
})
export class MatAccordion
  extends CdkAccordion
  implements MatAccordionBase, AfterContentInit, OnDestroy
{
  private _keyManager: FocusKeyManager<MatExpansionPanelHeader>;

  /** Headers belonging to this accordion. */
  private _ownHeaders = new QueryList<MatExpansionPanelHeader>();

  /** All headers inside the accordion. Includes headers inside nested accordions. */
  @ContentChildren(MatExpansionPanelHeader, {descendants: true})
  _headers: QueryList<MatExpansionPanelHeader>;

  /** Whether the expansion indicator should be hidden. */
  @Input()
  get hideToggle(): boolean {
    return this._hideToggle;
  }
  set hideToggle(show: BooleanInput) {
    this._hideToggle = coerceBooleanProperty(show);
  }
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

  /** The position of the expansion indicator. */
  @Input() togglePosition: MatAccordionTogglePosition = 'after';

  ngAfterContentInit() {
    this._headers.changes
      .pipe(startWith(this._headers))
      .subscribe((headers: QueryList<MatExpansionPanelHeader>) => {
        this._ownHeaders.reset(headers.filter(header => header.panel.accordion === this));
        this._ownHeaders.notifyOnChanges();
      });

    this._keyManager = new FocusKeyManager(this._ownHeaders).withWrap().withHomeAndEnd();
  }

  /** Handles keyboard events coming in from the panel headers. */
  _handleHeaderKeydown(event: KeyboardEvent) {
    this._keyManager.onKeydown(event);
  }

  _handleHeaderFocus(header: MatExpansionPanelHeader) {
    this._keyManager.updateActiveItem(header);
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._keyManager?.destroy();
    this._ownHeaders.destroy();
  }
}
