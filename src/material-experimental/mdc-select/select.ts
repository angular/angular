/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  OnInit,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import {MAT_SELECT_TRIGGER, _MatSelectBase} from '@angular/material/select';
import {
  MatOptgroup,
  MatOption,
  MAT_OPTGROUP,
  MAT_OPTION_PARENT_COMPONENT,
  _countGroupLabelsBeforeOption,
  _getOptionScrollPosition,
} from '@angular/material-experimental/mdc-core';
import {CdkOverlayOrigin, ConnectedPosition} from '@angular/cdk/overlay';
import {MatFormFieldControl} from '@angular/material/form-field';
import {takeUntil} from 'rxjs/operators';
import {matSelectAnimations} from './select-animations';

/** Change event object that is emitted when the select value has changed. */
export class MatSelectChange {
  constructor(
    /** Reference to the select that emitted the change event. */
    public source: MatSelect,
    /** Current value of the select that emitted the event. */
    public value: any) { }
}

/**
 * Allows the user to customize the trigger that is displayed when the select has a value.
 */
@Directive({
  selector: 'mat-select-trigger',
  providers: [{provide: MAT_SELECT_TRIGGER, useExisting: MatSelectTrigger}],
})
export class MatSelectTrigger {}

@Component({
  selector: 'mat-select',
  exportAs: 'matSelect',
  templateUrl: 'select.html',
  styleUrls: ['select.css'],
  inputs: ['disabled', 'disableRipple', 'tabIndex'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'combobox',
    'aria-autocomplete': 'none',
    'aria-haspopup': 'listbox',
    'class': 'mat-mdc-select',
    '[attr.id]': 'id',
    '[attr.tabindex]': 'tabIndex',
    '[attr.aria-controls]': 'panelOpen ? id + "-panel" : null',
    '[attr.aria-expanded]': 'panelOpen',
    '[attr.aria-label]': 'ariaLabel || null',
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-activedescendant]': '_getAriaActiveDescendant()',
    '[class.mat-mdc-select-disabled]': 'disabled',
    '[class.mat-mdc-select-invalid]': 'errorState',
    '[class.mat-mdc-select-required]': 'required',
    '[class.mat-mdc-select-empty]': 'empty',
    '[class.mat-mdc-select-multiple]': 'multiple',
    '(keydown)': '_handleKeydown($event)',
    '(focus)': '_onFocus()',
    '(blur)': '_onBlur()',
  },
  animations: [matSelectAnimations.transformPanel],
  providers: [
    {provide: MatFormFieldControl, useExisting: MatSelect},
    {provide: MAT_OPTION_PARENT_COMPONENT, useExisting: MatSelect}
  ],
})
export class MatSelect extends _MatSelectBase<MatSelectChange> implements OnInit, AfterViewInit {
  @ContentChildren(MatOption, {descendants: true}) options: QueryList<MatOption>;
  @ContentChildren(MAT_OPTGROUP, {descendants: true}) optionGroups: QueryList<MatOptgroup>;
  @ContentChild(MAT_SELECT_TRIGGER) customTrigger: MatSelectTrigger;

  _positions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      panelClass: 'mat-mdc-select-panel-above'
    },
  ];

  /** Ideal origin for the overlay panel. */
  _preferredOverlayOrigin: CdkOverlayOrigin | undefined;

  /** Width of the overlay panel. */
  _overlayWidth: number;

  override get shouldLabelFloat(): boolean {
    // Since the panel doesn't overlap the trigger, we
    // want the label to only float when there's a value.
    return this.panelOpen || !this.empty || (this.focused && !!this.placeholder);
  }

  override ngOnInit() {
    super.ngOnInit();
    this._viewportRuler.change().pipe(takeUntil(this._destroy)).subscribe(() => {
      if (this.panelOpen) {
        this._overlayWidth = this._getOverlayWidth();
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
    // Note that it's important that we read this in `ngAfterViewInit`, because
    // reading it earlier will cause the form field to return a different element.
    if (this._parentFormField) {
      // TODO(crisbeto): currently the MDC select is based on the standard one which uses the
      // connected overlay directive for its panel. In order to keep the logic as similar as
      // possible, we have to use the directive here which only accepts a `CdkOverlayOrigin` as
      // its origin. For now we fake an origin directive by constructing an object that looks
      // like it, although eventually we should switch to creating the OverlayRef here directly.
      this._preferredOverlayOrigin = {
        elementRef: this._parentFormField.getConnectedOverlayOrigin()
      };
    }
  }

  override open() {
    this._overlayWidth = this._getOverlayWidth();
    super.open();
    // Required for the MDC form field to pick up when the overlay has been opened.
    this.stateChanges.next();
  }

  override close() {
    super.close();
    // Required for the MDC form field to pick up when the overlay has been closed.
    this.stateChanges.next();
  }

  /** Scrolls the active option into view. */
  protected _scrollOptionIntoView(index: number): void {
    const option = this.options.toArray()[index];

    if (option) {
      const panel: HTMLElement = this.panel.nativeElement;
      const labelCount = _countGroupLabelsBeforeOption(index, this.options, this.optionGroups);
      const element = option._getHostElement();

      if (index === 0 && labelCount === 1) {
        // If we've got one group label before the option and we're at the top option,
        // scroll the list to the top. This is better UX than scrolling the list to the
        // top of the option, because it allows the user to read the top group's label.
        panel.scrollTop = 0;
      } else {
        panel.scrollTop = _getOptionScrollPosition(
          element.offsetTop,
          element.offsetHeight,
          panel.scrollTop,
          panel.offsetHeight
        );
      }
    }
  }

  protected _positioningSettled() {
    this._scrollOptionIntoView(this._keyManager.activeItemIndex || 0);
  }

  protected _getChangeEvent(value: any) {
    return new MatSelectChange(this, value);
  }

  /** Gets how wide the overlay panel should be. */
  private _getOverlayWidth() {
    const refToMeasure = (this._preferredOverlayOrigin?.elementRef || this._elementRef);
    return refToMeasure.nativeElement.getBoundingClientRect().width;
  }
}
