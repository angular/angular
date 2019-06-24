/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
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
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {
  CanColor,
  CanColorCtor,
  CanDisable,
  CanDisableCtor,
  CanDisableRipple,
  CanDisableRippleCtor,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple,
  RippleConfig,
  RippleRenderer,
  RippleTarget,
} from '@angular/material/core';
import {MDCChipAdapter, MDCChipFoundation} from '@material/chips';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';


let uid = 0;

/** Represents an event fired on an individual `mat-chip`. */
export interface MatChipEvent {
  /** The chip the event was fired on. */
  chip: MatChip;
}

/**
 * Directive to add CSS classes to chip leading icon.
 * @docs-private
 */
@Directive({
  selector: 'mat-chip-avatar, [matChipAvatar]',
  host: {
    'class': 'mat-mdc-chip-avatar mdc-chip__icon mdc-chip__icon--leading',
    'role': 'img'
  }
})
export class MatChipAvatar {
  constructor(private _changeDetectorRef: ChangeDetectorRef,
              private _elementRef: ElementRef) {}

  /** Sets whether the given CSS class should be applied to the leading icon. */
  setClass(cssClass: string, active: boolean) {
    const element = this._elementRef.nativeElement;
    active ? element.addClass(cssClass) : element.removeClass(cssClass);
    this._changeDetectorRef.markForCheck();
  }
}

/**
 * Directive to add CSS class to chip trailing icon and notify parent chip
 * about trailing icon interactions.
 *
 * If matChipRemove is used to add this directive, the parent chip will be
 * removed when the trailing icon is clicked.
 *
 * @docs-private
 */
@Directive({
  selector: 'mat-chip-trailing-icon, [matChipTrailingIcon], [matChipRemove]',
  host: {
    'class': 'mat-mdc-chip-trailing-icon mdc-chip__icon mdc-chip__icon--trailing',
    '[tabIndex]': 'tabIndex',
    '[attr.aria-hidden]': '!shouldRemove',
    '[attr.role]': 'shouldRemove ? "button" : null',
    '(click)': 'interaction.emit($event)',
    '(keydown)': 'interaction.emit($event)',
    '(blur)': 'parentChip ? parentChip._blur() : {}',
    '(focus)': 'parentChip ? parentChip._hasFocus = true : {}'
  }
})
export class MatChipTrailingIcon {
  /** Whether interaction with this icon should remove the parent chip. */
  shouldRemove!: boolean;

  /** The MatChip component associated with this icon. */
  @Input() parentChip?: MatChip;

  /** The tab index for this icon. */
  get tabIndex(): number|null {
    if ((this.parentChip && this.parentChip.disabled) || !this.shouldRemove) {
      return -1;
    }
    return 0;
  }

  /** Emits when the user interacts with the icon. */
  @Output() interaction = new EventEmitter<MouseEvent | KeyboardEvent>();

  constructor(private _elementRef: ElementRef) {
    this.shouldRemove = this._isMatChipRemoveIcon();
  }

  /** Returns true if the icon was created with the matChipRemove directive. */
  _isMatChipRemoveIcon(): boolean {
    return this._elementRef.nativeElement.getAttribute('matChipRemove') !== null;
  }
}

/**
 * Directive to add MDC CSS to non-basic chips.
 * @docs-private
 */
@Directive({
  selector: `mat-chip, mat-chip-option, mat-chip-row, [mat-chip], [mat-chip-option],
    [mat-chip-row]`,
  host: {'class': 'mat-mdc-chip mdc-chip'}
})
export class MatChipCssInternalOnly { }

/**
 * Boilerplate for applying mixins to MatChip.
 * @docs-private
 */
class MatChipBase {
  constructor(public _elementRef: ElementRef) {}
}

const _MatChipMixinBase: CanColorCtor & CanDisableRippleCtor & CanDisableCtor & typeof MatChipBase =
    mixinColor(mixinDisableRipple(mixinDisabled(MatChipBase)), 'primary');

/**
 * Material design styled Chip base component. Used inside the MatChipSet component.
 *
 * Extended by MatChipOption and MatChipRow for different interaction patterns.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-basic-chip, mat-chip',
  inputs: ['color', 'disabled', 'disableRipple'],
  exportAs: 'matChip',
  templateUrl: 'chip.html',
  styleUrls: ['chips.css'],
  host: {
    '[class.mat-mdc-chip-disabled]': 'disabled',
    '[class.mat-mdc-chip-highlighted]': 'highlighted',
    '[class.mat-mdc-chip-with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-with-trailing-icon]': 'trailingIcon',
    '[id]': 'id',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '(transitionend)': '_chipFoundation.handleTransitionEnd($event)'
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChip extends _MatChipMixinBase implements AfterContentInit, AfterViewInit,
  CanColor, CanDisable, CanDisableRipple, RippleTarget, OnDestroy {
  /** Emits when the chip is focused. */
  readonly _onFocus = new Subject<MatChipEvent>();

  /** Emits when the chip is blurred. */
  readonly _onBlur = new Subject<MatChipEvent>();

  /** Whether the chip has focus. */
  _hasFocus: boolean = false;

  /** Default unique id for the chip. */
  private _uniqueId = `mat-mdc-chip-${uid++}`;

  /** A unique id for the chip. If none is supplied, it will be auto-generated. */
  @Input() id: string = this._uniqueId;

  /** The value of the chip. Defaults to the content inside `<mat-chip>` tags. */
  @Input()
  get value(): any {
    return this._value != undefined
      ? this._value
      : this._elementRef.nativeElement.textContent;
  }
  set value(value: any) { this._value = value; }
  protected _value: any;

  /**
   * Determines whether or not the chip displays the remove styling and emits (removed) events.
   */
  @Input()
  get removable(): boolean { return this._removable; }
  set removable(value: boolean) {
    this._removable = coerceBooleanProperty(value);
  }
  protected _removable: boolean = true;

  /**
   * Colors the chip for emphasis as if it were selected.
   */
  @Input()
  get highlighted(): boolean { return this._highlighted; }
  set highlighted(value: boolean) {
    this._highlighted = coerceBooleanProperty(value);
  }
  protected _highlighted: boolean = false;

  /** Emitted when the user interacts with the trailing icon. */
  @Output() trailingIconInteraction = new EventEmitter<string>();

  /** Emitted when the user interacts with the chip. */
  @Output() interaction = new EventEmitter<string>();

  /** Emitted when the chip is destroyed. */
  @Output() readonly destroyed: EventEmitter<MatChipEvent> = new EventEmitter<MatChipEvent>();

  /** Emitted when a chip is to be removed. */
  @Output() readonly removed: EventEmitter<MatChipEvent> = new EventEmitter<MatChipEvent>();

  /** The MDC foundation containing business logic for MDC chip. */
  _chipFoundation: MDCChipFoundation;

  /** The unstyled chip selector for this component. */
  protected basicChipAttrName = 'mat-basic-chip';

  /** Subject that emits when the component has been destroyed. */
  private _destroyed = new Subject<void>();

  /** The ripple renderer for this chip. */
  private _rippleRenderer: RippleRenderer;

  /**
   * Implemented as part of RippleTarget. Configures ripple animation to match MDC Ripple.
   * @docs-private
   */
  rippleConfig: RippleConfig = {
    animation: {
      enterDuration: 225 /* MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS */,
      exitDuration: 150 /* MDCRippleFoundation.numbers.FG_DEACTIVATION_MS */,
    }
  };

  /**
   * Implemented as part of RippleTarget. Whether ripples are disabled on interaction.
   * @docs-private
   */
  get rippleDisabled(): boolean {
    return this.disabled || this.disableRipple || this._isBasicChip();
  }

  /** The chip's leading icon. */
  @ContentChild(MatChipAvatar, {static: false}) leadingIcon: MatChipAvatar;

  /** The chip's trailing icon. */
  @ContentChild(MatChipTrailingIcon, {static: false}) trailingIcon: MatChipTrailingIcon;

 /**
  * Implementation of the MDC chip adapter interface.
  * These methods are called by the chip foundation.
  */
  protected _chipAdapter: MDCChipAdapter = {
    addClass: (className) => this._setMdcClass(className, true),
    removeClass: (className) => this._setMdcClass(className, false),
    hasClass: (className) => this._elementRef.nativeElement.classList.contains(className),
    addClassToLeadingIcon: (className) => this.leadingIcon.setClass(className, true),
    removeClassFromLeadingIcon: (className) => this.leadingIcon.setClass(className, false),
    eventTargetHasClass: (target: EventTarget | null, className: string) => {
      return target ? (target as Element).classList.contains(className) : false;
    },
    notifyInteraction: () => this.interaction.emit(this.id),
    notifySelection: () => {
      // No-op. We call dispatchSelectionEvent ourselves in MatChipOption, because we want to
      // specify whether selection occurred via user input.
    },
    notifyTrailingIconInteraction: () => this.trailingIconInteraction.emit(this.id),
    notifyRemoval: () => this.removed.emit({chip: this}),
    getComputedStyleValue: (propertyName) => {
      return window.getComputedStyle(this._elementRef.nativeElement).getPropertyValue(propertyName);
    },
    setStyleProperty: (propertyName: string, value: string) => {
      this._elementRef.nativeElement.style.setProperty(propertyName, value);
    },
    hasLeadingIcon: () => { return !!this.leadingIcon; },
    // The 2 functions below are used by the MDC ripple, which we aren't using,
    // so they will never be called
    getRootBoundingClientRect: () => this._elementRef.nativeElement.getBoundingClientRect(),
    getCheckmarkBoundingClientRect: () => { return null; },
 };

 constructor(
    public _changeDetectorRef: ChangeDetectorRef,
    readonly _elementRef: ElementRef,
    private _platform: Platform,
    private _ngZone: NgZone) {
    super(_elementRef);
    this._chipFoundation = new MDCChipFoundation(this._chipAdapter);
  }

  ngAfterContentInit() {
    this._initTrailingIcon();
  }

  ngAfterViewInit() {
    this._initRipple();
    this._chipFoundation.init();
  }

  ngOnDestroy() {
    this.destroyed.emit({chip: this});
    this._destroyed.next();
    this._destroyed.complete();
    this._rippleRenderer._removeTriggerEvents();
    this._chipFoundation.destroy();
  }

  /** Allows for programmatic focusing of the chip. */
  focus(): void {
    if (this.disabled) {
      return;
    }

    if (!this._hasFocus) {
      this._elementRef.nativeElement.focus();
      this._onFocus.next({chip: this});
    }
    this._hasFocus = true;
  }

  /** Resets the state of the chip when it loses focus. */
  _blur(): void {
    this._hasFocus = false;
    this._onBlur.next({chip: this});
  }

  /** Handles click events on the chip. */
  _handleClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
    } else {
      this._handleInteraction(event);
      event.stopPropagation();
    }
  }

  /** Registers this chip with the trailing icon, and subscribes to trailing icon events. */
  _initTrailingIcon() {
    if (this.trailingIcon) {
      this.trailingIcon.parentChip = this;
      this._chipFoundation.setShouldRemoveOnTrailingIconClick(this.trailingIcon.shouldRemove);
      this._listenToTrailingIconInteraction();
    }
  }

  /** Handles interaction with the trailing icon. */
  _listenToTrailingIconInteraction() {
    this.trailingIcon.interaction
        .pipe(takeUntil(this._destroyed))
        .subscribe((event) => {
          if (!this.disabled) {
            this._chipFoundation.handleTrailingIconInteraction(event);
          }
        });
  }

  /**
   * Allows for programmatic removal of the chip. Called when the DELETE or BACKSPACE
   * keys are pressed.
   *
   * Informs any listeners of the removal request. Does not remove the chip from the DOM.
   */
  remove(): void {
    if (this.removable) {
      this._chipFoundation.beginExit();
    }
  }

  /** Whether this chip is a basic (unstyled) chip. */
  _isBasicChip() {
    const element = this._elementRef.nativeElement as HTMLElement;
    return element.hasAttribute(this.basicChipAttrName) ||
      element.tagName.toLowerCase() === this.basicChipAttrName;
  }

  /** Sets whether the given CSS class should be applied to the MDC chip. */
  private _setMdcClass(cssClass: string, active: boolean) {
      const classes = this._elementRef.nativeElement.classList;
      active ? classes.add(cssClass) : classes.remove(cssClass);
      this._changeDetectorRef.markForCheck();
  }

  /** Initializes the ripple renderer. */
  private _initRipple() {
    this._rippleRenderer =
      new RippleRenderer(this, this._ngZone, this._elementRef, this._platform);
    this._rippleRenderer.setupTriggerEvents(this._elementRef.nativeElement);
  }

  /** Forwards interaction events to the MDC chip foundation. */
  _handleInteraction(event: MouseEvent | KeyboardEvent) {
    if (!this.disabled) {
      this._chipFoundation.handleInteraction(event);
    }
  }
}
