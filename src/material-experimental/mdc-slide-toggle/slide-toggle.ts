/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  forwardRef,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Attribute,
  Inject,
  Optional,
} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {FocusMonitor} from '@angular/cdk/a11y';
import {_MatSlideToggleBase} from '@angular/material/slide-toggle';
import {
  MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS,
  MatSlideToggleDefaultOptions,
} from './slide-toggle-config';

/** @docs-private */
export const MAT_SLIDE_TOGGLE_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatSlideToggle),
  multi: true,
};

/** Change event object emitted by a slide toggle. */
export class MatSlideToggleChange {
  constructor(
    /** The source slide toggle of the event. */
    public source: MatSlideToggle,
    /** The new `checked` value of the slide toggle. */
    public checked: boolean,
  ) {}
}

@Component({
  selector: 'mat-slide-toggle',
  templateUrl: 'slide-toggle.html',
  styleUrls: ['slide-toggle.css'],
  inputs: ['disabled', 'disableRipple', 'color', 'tabIndex'],
  host: {
    'class': 'mat-mdc-slide-toggle',
    '[id]': 'id',
    // Needs to be removed since it causes some a11y issues (see #21266).
    '[attr.tabindex]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.name]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[class.mat-mdc-slide-toggle-focused]': '_focused',
    '[class.mat-mdc-slide-toggle-checked]': 'checked',
    '[class._mat-animation-noopable]': '_noopAnimations',
  },
  exportAs: 'matSlideToggle',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MAT_SLIDE_TOGGLE_VALUE_ACCESSOR],
})
export class MatSlideToggle extends _MatSlideToggleBase<MatSlideToggleChange> {
  /** Unique ID for the label element. */
  _labelId: string;

  /** Returns the unique id for the visual hidden button. */
  get buttonId(): string {
    return `${this.id || this._uniqueId}-button`;
  }

  /** Reference to the MDC switch element. */
  @ViewChild('switch') _switchElement: ElementRef<HTMLElement>;

  constructor(
    elementRef: ElementRef,
    focusMonitor: FocusMonitor,
    changeDetectorRef: ChangeDetectorRef,
    @Attribute('tabindex') tabIndex: string,
    @Inject(MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS)
    defaults: MatSlideToggleDefaultOptions,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    super(
      elementRef,
      focusMonitor,
      changeDetectorRef,
      tabIndex,
      defaults,
      animationMode,
      'mat-mdc-slide-toggle-',
    );
    this._labelId = this._uniqueId + '-label';
  }

  /** Method being called whenever the underlying button is clicked. */
  _handleClick() {
    this.toggleChange.emit();

    if (!this.defaults.disableToggleValue) {
      this.checked = !this.checked;
      this._onChange(this.checked);
      this.change.emit(new MatSlideToggleChange(this, this.checked));
    }
  }

  /** Focuses the slide-toggle. */
  focus(): void {
    this._switchElement.nativeElement.focus();
  }

  protected _createChangeEvent(isChecked: boolean) {
    return new MatSlideToggleChange(this, isChecked);
  }

  _getAriaLabelledBy() {
    if (this.ariaLabelledby) {
      return this.ariaLabelledby;
    }

    // Even though we have a `label` element with a `for` pointing to the button, we need the
    // `aria-labelledby`, because the button gets flagged as not having a label by tools like axe.
    return this.ariaLabel ? null : this._labelId;
  }
}
