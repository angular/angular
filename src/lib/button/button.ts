/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor} from '@angular/cdk/a11y';
import {Platform} from '@angular/cdk/platform';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  forwardRef,
  Inject,
  OnDestroy,
  Optional,
  Self,
  ViewEncapsulation,
} from '@angular/core';
import {
  CanColor,
  CanDisable,
  CanDisableRipple,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple
} from '@angular/material/core';


// TODO(kara): Convert attribute selectors to classes when attr maps become available

/** Default color palette for round buttons (mat-fab and mat-mini-fab) */
const DEFAULT_ROUND_BUTTON_COLOR = 'accent';


/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'button[mat-button], a[mat-button]',
  host: {'class': 'mat-button'}
})
export class MatButtonCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'button[mat-raised-button], a[mat-raised-button]',
  host: {'class': 'mat-raised-button'}
})
export class MatRaisedButtonCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'button[mat-icon-button], a[mat-icon-button]',
  host: {'class': 'mat-icon-button'}
})
export class MatIconButtonCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'button[mat-fab], a[mat-fab]',
  host: {'class': 'mat-fab'}
})
export class MatFab {
  constructor(@Self() @Optional() @Inject(forwardRef(() => MatButton)) button: MatButton,
              @Self() @Optional() @Inject(forwardRef(() => MatAnchor)) anchor: MatAnchor) {
    // Set the default color palette for the mat-fab components.
    (button || anchor).color = DEFAULT_ROUND_BUTTON_COLOR;
  }
}

/**
 * Directive that targets mini-fab buttons and anchors. It's used to apply the `mat-` class
 * to all mini-fab buttons and also is responsible for setting the default color palette.
 * @docs-private
 */
@Directive({
  selector: 'button[mat-mini-fab], a[mat-mini-fab]',
  host: {'class': 'mat-mini-fab'}
})
export class MatMiniFab {
  constructor(@Self() @Optional() @Inject(forwardRef(() => MatButton)) button: MatButton,
              @Self() @Optional() @Inject(forwardRef(() => MatAnchor)) anchor: MatAnchor) {
    // Set the default color palette for the mat-mini-fab components.
    (button || anchor).color = DEFAULT_ROUND_BUTTON_COLOR;
  }
}


// Boilerplate for applying mixins to MatButton.
/** @docs-private */
export class MatButtonBase {
  constructor(public _elementRef: ElementRef) {}
}
export const _MatButtonMixinBase = mixinColor(mixinDisabled(mixinDisableRipple(MatButtonBase)));


/**
 * Material design button.
 */
@Component({
  moduleId: module.id,
  selector: `button[mat-button], button[mat-raised-button], button[mat-icon-button],
             button[mat-fab], button[mat-mini-fab]`,
  exportAs: 'matButton',
  host: {
    '[disabled]': 'disabled || null',
  },
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  inputs: ['disabled', 'disableRipple', 'color'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatButton extends _MatButtonMixinBase
    implements OnDestroy, CanDisable, CanColor, CanDisableRipple {

  /** Whether the button is round. */
  _isRoundButton: boolean = this._hasHostAttributes('mat-fab', 'mat-mini-fab');

  /** Whether the button is icon button. */
  _isIconButton: boolean = this._hasHostAttributes('mat-icon-button');

  constructor(elementRef: ElementRef,
              private _platform: Platform,
              private _focusMonitor: FocusMonitor) {
    super(elementRef);
    this._focusMonitor.monitor(this._elementRef.nativeElement, true);
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
  }

  /** Focuses the button. */
  focus(): void {
    this._getHostElement().focus();
  }

  _getHostElement() {
    return this._elementRef.nativeElement;
  }

  _isRippleDisabled() {
    return this.disableRipple || this.disabled;
  }

  /** Gets whether the button has one of the given attributes. */
  _hasHostAttributes(...attributes: string[]) {
    // If not on the browser, say that there are none of the attributes present.
    // Since these only affect how the ripple displays (and ripples only happen on the client),
    // detecting these attributes isn't necessary when not on the browser.
    if (!this._platform.isBrowser) {
      return false;
    }

    return attributes.some(attribute => this._getHostElement().hasAttribute(attribute));
  }
}

/**
 * Raised Material design button.
 */
@Component({
  moduleId: module.id,
  selector: `a[mat-button], a[mat-raised-button], a[mat-icon-button], a[mat-fab], a[mat-mini-fab]`,
  exportAs: 'matButton, matAnchor',
  host: {
    '[attr.tabindex]': 'disabled ? -1 : 0',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '(click)': '_haltDisabledEvents($event)',
  },
  inputs: ['disabled', 'disableRipple', 'color'],
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatAnchor extends MatButton {
  constructor(
      platform: Platform,
      focusMonitor: FocusMonitor,
      elementRef: ElementRef) {
    super(elementRef, platform, focusMonitor);
  }

  _haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
