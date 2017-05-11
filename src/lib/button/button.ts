import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';
import {coerceBooleanProperty, FocusOriginMonitor, Platform} from '../core';
import {mixinDisabled, CanDisable} from '../core/common-behaviors/disabled';


// TODO(kara): Convert attribute selectors to classes when attr maps become available


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
export class MdFabCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'button[md-mini-fab], button[mat-mini-fab], a[md-mini-fab], a[mat-mini-fab]',
  host: {'class': 'mat-mini-fab'}
})
export class MdMiniFabCssMatStyler {}


// Boilerplate for applying mixins to MdButton.
export class MdButtonBase { }
export const _MdButtonMixinBase = mixinDisabled(MdButtonBase);


/**
 * Material design button.
 */
@Component({
  moduleId: module.id,
  selector: 'button[md-button], button[md-raised-button], button[md-icon-button],' +
            'button[md-fab], button[md-mini-fab],' +
            'button[mat-button], button[mat-raised-button], button[mat-icon-button],' +
            'button[mat-fab], button[mat-mini-fab]',
  host: {
    '[disabled]': 'disabled || null',
  },
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  inputs: ['disabled'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdButton extends _MdButtonMixinBase implements OnDestroy, CanDisable {
  private _color: string;

  /** Whether the button is round. */
  _isRoundButton: boolean = this._hasAttributeWithPrefix('fab', 'mini-fab');

  /** Whether the button is icon button. */
  _isIconButton: boolean = this._hasAttributeWithPrefix('icon-button');

  /** Whether the ripple effect on click should be disabled. */
  private _disableRipple: boolean = false;

  /** Whether the ripple effect for this button is disabled. */
  @Input()
  get disableRipple() { return this._disableRipple; }
  set disableRipple(v) { this._disableRipple = coerceBooleanProperty(v); }

  constructor(
      private _elementRef: ElementRef,
      private _renderer: Renderer2,
      private _platform: Platform,
      private _focusOriginMonitor: FocusOriginMonitor) {
    super();
    this._focusOriginMonitor.monitor(this._elementRef.nativeElement, this._renderer, true);
  }

  ngOnDestroy() {
    this._focusOriginMonitor.stopMonitoring(this._elementRef.nativeElement);
  }

  /** The color of the button. Can be `primary`, `accent`, or `warn`. */
  @Input()
  get color(): string { return this._color; }
  set color(value: string) { this._updateColor(value); }

  _updateColor(newColor: string) {
    this._setElementColor(this._color, false);
    this._setElementColor(newColor, true);
    this._color = newColor;
  }

  _setElementColor(color: string, isAdd: boolean) {
    if (color != null && color != '') {
      if (isAdd) {
        this._renderer.addClass(this._getHostElement(), `mat-${color}`);
      } else {
        this._renderer.removeClass(this._getHostElement(), `mat-${color}`);
      }
    }
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
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': '_isAriaDisabled',
    '(click)': '_haltDisabledEvents($event)',
  },
  inputs: ['disabled'],
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdAnchor extends MdButton {
  constructor(
      elementRef: ElementRef,
      renderer: Renderer2,
      platform: Platform,
      focusOriginMonitor: FocusOriginMonitor) {
    super(elementRef, renderer, platform, focusOriginMonitor);
  }

  /** @docs-private */
  @HostBinding('tabIndex')
  get tabIndex(): number {
    return this.disabled ? -1 : 0;
  }

  get _isAriaDisabled(): string {
    return this.disabled ? 'true' : 'false';
  }

  _haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
