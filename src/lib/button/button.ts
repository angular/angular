/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  forwardRef,
  OnDestroy,
  Optional,
  Renderer2,
  Self,
  ViewEncapsulation,
  Inject,
} from '@angular/core';
import {Platform} from '@angular/cdk/platform';
import {FocusOriginMonitor} from '../core';
import {mixinDisabled, CanDisable} from '../core/common-behaviors/disabled';
import {CanColor, mixinColor} from '../core/common-behaviors/color';
import {CanDisableRipple, mixinDisableRipple} from '../core/common-behaviors/disable-ripple';


// TODO(kara): Convert attribute selectors to classes when attr maps become available

/** Default color palette for round buttons (md-fab and md-mini-fab) */
const DEFAULT_ROUND_BUTTON_COLOR = 'accent';


/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'button[md-button], button[mat-button], a[md-button], a[mat-button]',
  host: {'class': 'mat-button'}
})
export class MdButtonCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector:
      'button[md-raised-button], button[mat-raised-button], ' +
      'a[md-raised-button], a[mat-raised-button]',
  host: {'class': 'mat-raised-button'}
})
export class MdRaisedButtonCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector:
      'button[md-icon-button], button[mat-icon-button], a[md-icon-button], a[mat-icon-button]',
  host: {'class': 'mat-icon-button'}
})
export class MdIconButtonCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'button[md-fab], button[mat-fab], a[md-fab], a[mat-fab]',
  host: {'class': 'mat-fab'}
})
export class MdFab {
  constructor(@Self() @Optional() @Inject(forwardRef(() => MdButton)) button: MdButton,
              @Self() @Optional() @Inject(forwardRef(() => MdAnchor)) anchor: MdAnchor) {
    // Set the default color palette for the md-fab components.
    (button || anchor).color = DEFAULT_ROUND_BUTTON_COLOR;
  }
}

/**
 * Directive that targets mini-fab buttons and anchors. It's used to apply the `mat-` class
 * to all mini-fab buttons and also is responsible for setting the default color palette.
 * @docs-private
 */
@Directive({
  selector: 'button[md-mini-fab], button[mat-mini-fab], a[md-mini-fab], a[mat-mini-fab]',
  host: {'class': 'mat-mini-fab'}
})
export class MdMiniFab {
  constructor(@Self() @Optional() @Inject(forwardRef(() => MdButton)) button: MdButton,
              @Self() @Optional() @Inject(forwardRef(() => MdAnchor)) anchor: MdAnchor) {
    // Set the default color palette for the md-mini-fab components.
    (button || anchor).color = DEFAULT_ROUND_BUTTON_COLOR;
  }
}


// Boilerplate for applying mixins to MdButton.
/** @docs-private */
export class MdButtonBase {
  constructor(public _renderer: Renderer2, public _elementRef: ElementRef) {}
}
export const _MdButtonMixinBase = mixinColor(mixinDisabled(mixinDisableRipple(MdButtonBase)));


/**
 * Material design button.
 */
@Component({
  moduleId: module.id,
  selector: `button[md-button], button[md-raised-button], button[md-icon-button],
             button[md-fab], button[md-mini-fab],
             button[mat-button], button[mat-raised-button], button[mat-icon-button],
             button[mat-fab], button[mat-mini-fab]`,
  host: {
    '[disabled]': 'disabled || null',
  },
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  inputs: ['disabled', 'disableRipple', 'color'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdButton extends _MdButtonMixinBase
    implements OnDestroy, CanDisable, CanColor, CanDisableRipple {

  /** Whether the button is round. */
  _isRoundButton: boolean = this._hasAttributeWithPrefix('fab', 'mini-fab');

  /** Whether the button is icon button. */
  _isIconButton: boolean = this._hasAttributeWithPrefix('icon-button');

  constructor(renderer: Renderer2,
              elementRef: ElementRef,
              private _platform: Platform,
              private _focusOriginMonitor: FocusOriginMonitor) {
    super(renderer, elementRef);
    this._focusOriginMonitor.monitor(this._elementRef.nativeElement, this._renderer, true);
  }

  ngOnDestroy() {
    this._focusOriginMonitor.stopMonitoring(this._elementRef.nativeElement);
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

  /**
   * Gets whether the button has one of the given attributes
   * with either an 'md-' or 'mat-' prefix.
   */
  _hasAttributeWithPrefix(...unprefixedAttributeNames: string[]) {
    // If not on the browser, say that there are none of the attributes present.
    // Since these only affect how the ripple displays (and ripples only happen on the client),
    // detecting these attributes isn't necessary when not on the browser.
    if (!this._platform.isBrowser) {
      return false;
    }

    return unprefixedAttributeNames.some(suffix => {
      const el = this._getHostElement();

      return el.hasAttribute('md-' + suffix) || el.hasAttribute('mat-' + suffix);
    });
  }
}

/**
 * Raised Material design button.
 */
@Component({
  moduleId: module.id,
  selector: `a[md-button], a[md-raised-button], a[md-icon-button], a[md-fab], a[md-mini-fab],
             a[mat-button], a[mat-raised-button], a[mat-icon-button], a[mat-fab], a[mat-mini-fab]`,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdAnchor extends MdButton {
  constructor(
      platform: Platform,
      focusOriginMonitor: FocusOriginMonitor,
      elementRef: ElementRef,
      renderer: Renderer2) {
    super(renderer, elementRef, platform, focusOriginMonitor);
  }

  _haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
