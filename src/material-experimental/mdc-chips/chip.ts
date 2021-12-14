/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  ViewEncapsulation,
  ViewChild,
} from '@angular/core';
import {
  CanColor,
  CanDisable,
  CanDisableRipple,
  HasTabIndex,
  MatRipple,
  MAT_RIPPLE_GLOBAL_OPTIONS,
  mixinColor,
  mixinDisableRipple,
  mixinTabIndex,
  RippleGlobalOptions,
} from '@angular/material-experimental/mdc-core';
import {deprecated} from '@material/chips';
import {SPACE, ENTER, hasModifierKey} from '@angular/cdk/keycodes';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {
  MatChipAvatar,
  MatChipTrailingIcon,
  MatChipRemove,
  MAT_CHIP_AVATAR,
  MAT_CHIP_TRAILING_ICON,
  MAT_CHIP_REMOVE,
} from './chip-icons';

let uid = 0;

/** Represents an event fired on an individual `mat-chip`. */
export interface MatChipEvent {
  /** The chip the event was fired on. */
  chip: MatChip;
}

/**
 * Directive to add MDC CSS to non-basic chips.
 * @docs-private
 */
@Directive({
  selector: `mat-chip, mat-chip-option, mat-chip-row, [mat-chip], [mat-chip-option],
    [mat-chip-row]`,
  host: {'class': 'mat-mdc-chip mdc-chip'},
})
export class MatChipCssInternalOnly {}

/**
 * Boilerplate for applying mixins to MatChip.
 * @docs-private
 */
abstract class MatChipBase {
  abstract disabled: boolean;
  constructor(public _elementRef: ElementRef) {}
}

const _MatChipMixinBase = mixinTabIndex(mixinColor(mixinDisableRipple(MatChipBase), 'primary'), -1);

/**
 * Material design styled Chip base component. Used inside the MatChipSet component.
 *
 * Extended by MatChipOption and MatChipRow for different interaction patterns.
 */
@Component({
  selector: 'mat-basic-chip, mat-chip',
  inputs: ['color', 'disableRipple'],
  exportAs: 'matChip',
  templateUrl: 'chip.html',
  styleUrls: ['chips.css'],
  host: {
    '[class.mat-mdc-chip-disabled]': 'disabled',
    '[class.mat-mdc-chip-highlighted]': 'highlighted',
    '[class.mat-mdc-chip-with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-with-trailing-icon]': 'trailingIcon || removeIcon',
    '[class.mat-mdc-basic-chip]': '_isBasicChip',
    '[class.mat-mdc-standard-chip]': '!_isBasicChip',
    '[class._mat-animation-noopable]': '_animationsDisabled',
    '[id]': 'id',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '(transitionend)': '_handleTransitionEnd($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChip
  extends _MatChipMixinBase
  implements
    AfterContentInit,
    AfterViewInit,
    CanColor,
    CanDisableRipple,
    CanDisable,
    HasTabIndex,
    OnDestroy
{
  /** Whether the ripple is centered on the chip. */
  readonly _isRippleCentered = false;

  /** Emits when the chip is focused. */
  readonly _onFocus = new Subject<MatChipEvent>();

  /** Emits when the chip is blurred. */
  readonly _onBlur = new Subject<MatChipEvent>();

  readonly REMOVE_ICON_HANDLED_KEYS: ReadonlySet<number> = new Set([SPACE, ENTER]);

  /** Whether this chip is a basic (unstyled) chip. */
  readonly _isBasicChip: boolean;

  /** Whether the chip has focus. */
  protected _hasFocusInternal = false;

  /** Whether animations for the chip are enabled. */
  _animationsDisabled: boolean;

  _handleTransitionEnd(event: TransitionEvent) {
    this._chipFoundation.handleTransitionEnd(event);
  }

  _hasFocus() {
    return this._hasFocusInternal;
  }

  /** Default unique id for the chip. */
  private _uniqueId = `mat-mdc-chip-${uid++}`;

  /** A unique id for the chip. If none is supplied, it will be auto-generated. */
  @Input() id: string = this._uniqueId;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    if (this.removeIcon) {
      this.removeIcon.disabled = this._disabled;
    }
  }
  protected _disabled: boolean = false;

  private _textElement!: HTMLElement;

  /** The value of the chip. Defaults to the content inside the mdc-chip__text element. */
  @Input()
  get value(): any {
    return this._value !== undefined ? this._value : this._textElement.textContent!.trim();
  }
  set value(value: any) {
    this._value = value;
  }
  protected _value: any;

  /**
   * Determines whether or not the chip displays the remove styling and emits (removed) events.
   */
  @Input()
  get removable(): boolean {
    return this._removable;
  }
  set removable(value: BooleanInput) {
    this._removable = coerceBooleanProperty(value);
  }
  protected _removable: boolean = true;

  /**
   * Colors the chip for emphasis as if it were selected.
   */
  @Input()
  get highlighted(): boolean {
    return this._highlighted;
  }
  set highlighted(value: BooleanInput) {
    this._highlighted = coerceBooleanProperty(value);
  }
  protected _highlighted: boolean = false;

  /** Emitted when the user interacts with the chip. */
  @Output() readonly interaction = new EventEmitter<string>();

  /** Emitted when the chip is destroyed. */
  @Output() readonly destroyed: EventEmitter<MatChipEvent> = new EventEmitter<MatChipEvent>();

  /** Emitted when a chip is to be removed. */
  @Output() readonly removed: EventEmitter<MatChipEvent> = new EventEmitter<MatChipEvent>();

  /** The MDC foundation containing business logic for MDC chip. */
  _chipFoundation: deprecated.MDCChipFoundation;

  /** The unstyled chip selector for this component. */
  protected basicChipAttrName = 'mat-basic-chip';

  /** The chip's leading icon. */
  @ContentChild(MAT_CHIP_AVATAR) leadingIcon: MatChipAvatar;

  /** The chip's trailing icon. */
  @ContentChild(MAT_CHIP_TRAILING_ICON) trailingIcon: MatChipTrailingIcon;

  /** The chip's trailing remove icon. */
  @ContentChild(MAT_CHIP_REMOVE) removeIcon: MatChipRemove;

  /** Reference to the MatRipple instance of the chip. */
  @ViewChild(MatRipple) ripple: MatRipple;

  /**
   * Implementation of the MDC chip adapter interface.
   * These methods are called by the chip foundation.
   */
  protected _chipAdapter: deprecated.MDCChipAdapter = {
    addClass: className => this._setMdcClass(className, true),
    removeClass: className => this._setMdcClass(className, false),
    hasClass: className => this._elementRef.nativeElement.classList.contains(className),
    addClassToLeadingIcon: className => this.leadingIcon.setClass(className, true),
    removeClassFromLeadingIcon: className => this.leadingIcon.setClass(className, false),
    eventTargetHasClass: (target: EventTarget | null, className: string) => {
      // We need to null check the `classList`, because IE and Edge don't
      // support it on SVG elements and Edge seems to throw for ripple
      // elements, because they're outside the DOM.
      return target && (target as Element).classList
        ? (target as Element).classList.contains(className)
        : false;
    },
    notifyInteraction: () => this._notifyInteraction(),
    notifySelection: () => {
      // No-op. We call dispatchSelectionEvent ourselves in MatChipOption,
      // because we want to specify whether selection occurred via user
      // input.
    },
    notifyNavigation: () => this._notifyNavigation(),
    notifyTrailingIconInteraction: () => {},
    notifyRemoval: () => this.remove(),
    notifyEditStart: () => {
      this._onEditStart();
      this._changeDetectorRef.markForCheck();
    },
    notifyEditFinish: () => {
      this._onEditFinish();
      this._changeDetectorRef.markForCheck();
    },
    getComputedStyleValue: propertyName => {
      // This function is run when a chip is removed so it might be
      // invoked during server-side rendering. Add some extra checks just in
      // case.
      if (typeof window !== 'undefined' && window) {
        const getComputedStyle = window.getComputedStyle(this._elementRef.nativeElement);
        return getComputedStyle.getPropertyValue(propertyName);
      }
      return '';
    },
    setStyleProperty: (propertyName: string, value: string) => {
      this._elementRef.nativeElement.style.setProperty(propertyName, value);
    },
    hasLeadingIcon: () => !!this.leadingIcon,
    isTrailingActionNavigable: () => {
      if (this.trailingIcon) {
        return this.trailingIcon.isNavigable();
      }
      return false;
    },
    isRTL: () => !!this._dir && this._dir.value === 'rtl',
    focusPrimaryAction: () => {
      // Angular Material MDC chips fully manage focus. TODO: Managing focus
      // and handling keyboard events was added by MDC after our
      // implementation; consider consolidating.
    },
    focusTrailingAction: () => {},
    removeTrailingActionFocus: () => {},
    setPrimaryActionAttr: (name: string, value: string) => {
      // MDC is currently using this method to set aria-checked on choice
      // and filter chips, which in the MDC templates have role="checkbox"
      // and role="radio" respectively. We have role="option" on those chips
      // instead, so we do not want aria-checked. Since we also manage the
      // tabindex ourselves, we don't allow MDC to set it.
      if (name === 'aria-checked' || name === 'tabindex') {
        return;
      }
      this._elementRef.nativeElement.setAttribute(name, value);
    },
    // The 2 functions below are used by the MDC ripple, which we aren't using,
    // so they will never be called
    getRootBoundingClientRect: () => this._elementRef.nativeElement.getBoundingClientRect(),
    getCheckmarkBoundingClientRect: () => null,
    getAttribute: attr => this._elementRef.nativeElement.getAttribute(attr),
  };

  constructor(
    public _changeDetectorRef: ChangeDetectorRef,
    elementRef: ElementRef,
    protected _ngZone: NgZone,
    @Optional() private _dir: Directionality,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    @Optional()
    @Inject(MAT_RIPPLE_GLOBAL_OPTIONS)
    private _globalRippleOptions?: RippleGlobalOptions,
  ) {
    super(elementRef);
    this._chipFoundation = new deprecated.MDCChipFoundation(this._chipAdapter);
    this._animationsDisabled = animationMode === 'NoopAnimations';
    this._isBasicChip =
      elementRef.nativeElement.hasAttribute(this.basicChipAttrName) ||
      elementRef.nativeElement.tagName.toLowerCase() === this.basicChipAttrName;
  }

  ngAfterContentInit() {
    this._initRemoveIcon();
  }

  ngAfterViewInit() {
    this._chipFoundation.init();
    this._textElement = this._elementRef.nativeElement.querySelector('.mdc-chip__text');
  }

  ngOnDestroy() {
    this.destroyed.emit({chip: this});
    this._chipFoundation.destroy();
  }

  /** Sets up the remove icon chip foundation, and subscribes to remove icon events. */
  private _initRemoveIcon() {
    if (this.removeIcon) {
      this._chipFoundation.setShouldRemoveOnTrailingIconClick(true);
      this.removeIcon.disabled = this.disabled;

      this.removeIcon.interaction.pipe(takeUntil(this.destroyed)).subscribe(event => {
        // The MDC chip foundation calls stopPropagation() for any trailing icon interaction
        // event, even ones it doesn't handle, so we want to avoid passing it keyboard events
        // for which we have a custom handler. Note that we assert the type of the event using
        // the `type`, because `instanceof KeyboardEvent` can throw during server-side rendering.
        const isKeyboardEvent = event.type.startsWith('key');

        if (
          this.disabled ||
          (isKeyboardEvent && !this.REMOVE_ICON_HANDLED_KEYS.has((event as KeyboardEvent).keyCode))
        ) {
          return;
        }

        this.remove();

        if (isKeyboardEvent && !hasModifierKey(event as KeyboardEvent)) {
          const keyCode = (event as KeyboardEvent).keyCode;

          // Prevent default space and enter presses so we don't scroll the page or submit forms.
          if (keyCode === SPACE || keyCode === ENTER) {
            event.preventDefault();
          }
        }
      });
    }
  }

  /**
   * Allows for programmatic removal of the chip.
   *
   * Informs any listeners of the removal request. Does not remove the chip from the DOM.
   */
  remove(): void {
    if (this.removable) {
      this.removed.emit({chip: this});
    }
  }

  /** Sets whether the given CSS class should be applied to the MDC chip. */
  private _setMdcClass(cssClass: string, active: boolean) {
    const classes = this._elementRef.nativeElement.classList;
    active ? classes.add(cssClass) : classes.remove(cssClass);
    this._changeDetectorRef.markForCheck();
  }

  /** Forwards interaction events to the MDC chip foundation. */
  _handleInteraction(event: MouseEvent | KeyboardEvent | FocusEvent) {
    if (this.disabled) {
      return;
    }

    if (event.type === 'click') {
      this._chipFoundation.handleClick();
      return;
    }

    if (event.type === 'dblclick') {
      this._chipFoundation.handleDoubleClick();
    }

    if (event.type === 'keydown') {
      this._chipFoundation.handleKeydown(event as KeyboardEvent);
      return;
    }

    if (event.type === 'focusout') {
      this._chipFoundation.handleFocusOut(event as FocusEvent);
    }

    if (event.type === 'focusin') {
      this._chipFoundation.handleFocusIn(event as FocusEvent);
    }
  }

  /** Whether or not the ripple should be disabled. */
  _isRippleDisabled(): boolean {
    return (
      this.disabled ||
      this.disableRipple ||
      this._animationsDisabled ||
      this._isBasicChip ||
      !!this._globalRippleOptions?.disabled
    );
  }

  _notifyInteraction() {
    this.interaction.emit(this.id);
  }

  _notifyNavigation() {
    // TODO: This is a new feature added by MDC. Consider exposing it to users
    // in the future.
  }

  /** Overridden by MatChipRow. */
  protected _onEditStart() {}

  /** Overridden by MatChipRow. */
  protected _onEditFinish() {}
}
