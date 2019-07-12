/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
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
  ViewEncapsulation
} from '@angular/core';
import {
  CanColor,
  CanColorCtor,
  CanDisableRipple,
  CanDisableRippleCtor,
  MAT_RIPPLE_GLOBAL_OPTIONS,
  HasTabIndex,
  HasTabIndexCtor,
  mixinColor,
  mixinDisableRipple,
  mixinTabIndex,
  RippleConfig,
  RippleGlobalOptions,
  RippleRenderer,
  RippleTarget,
} from '@angular/material/core';
import {MDCChipAdapter, MDCChipFoundation} from '@material/chips';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatChipAvatar, MatChipTrailingIcon, MatChipRemove} from './chip-icons';


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
  host: {'class': 'mat-mdc-chip mdc-chip'}
})
export class MatChipCssInternalOnly { }

/**
 * Boilerplate for applying mixins to MatChip.
 * @docs-private
 */
class MatChipBase {
  disabled!: boolean;
  constructor(public _elementRef: ElementRef) {}
}

const _MatChipMixinBase:
  CanColorCtor &
  CanDisableRippleCtor &
  HasTabIndexCtor &
  typeof MatChipBase =
    mixinTabIndex(mixinColor(mixinDisableRipple(MatChipBase), 'primary'), -1);

/**
 * Material design styled Chip base component. Used inside the MatChipSet component.
 *
 * Extended by MatChipOption and MatChipRow for different interaction patterns.
 */
@Component({
  moduleId: module.id,
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
    '[class.mat-mdc-basic-chip]': '_isBasicChip()',
    '[class.mat-mdc-standard-chip]': '!_isBasicChip()',
    '[class._mat-animation-noopable]': '_animationsDisabled',
    '[id]': 'id',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '(transitionend)': '_chipFoundation.handleTransitionEnd($event)'
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChip extends _MatChipMixinBase implements AfterContentInit, AfterViewInit,
  CanColor, CanDisableRipple, HasTabIndex, RippleTarget, OnDestroy {
  /** Emits when the chip is focused. */
  readonly _onFocus = new Subject<MatChipEvent>();

  /** Emits when the chip is blurred. */
  readonly _onBlur = new Subject<MatChipEvent>();

  readonly HANDLED_KEYS: number[] = [];

  /** Whether the chip has focus. */
  protected _hasFocusInternal = false;

    /** Whether animations for the chip are enabled. */
  _animationsDisabled: boolean;

  get _hasFocus() {
    return this._hasFocusInternal;
  }

  /** Default unique id for the chip. */
  private _uniqueId = `mat-mdc-chip-${uid++}`;

  /** A unique id for the chip. If none is supplied, it will be auto-generated. */
  @Input() id: string = this._uniqueId;


  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    if (this.removeIcon) {
      this.removeIcon.disabled = value;
    }
  }
  protected _disabled: boolean = false;


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

  /** Emitted when the user interacts with the remove icon. */
  @Output() removeIconInteraction = new EventEmitter<string>();

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
  protected _destroyed = new Subject<void>();

  /** The ripple renderer for this chip. */
  private _rippleRenderer: RippleRenderer;

  /**
   * Ripple configuration for ripples that are launched on pointer down.
   * Implemented as part of RippleTarget.
   * @docs-private
   */
  rippleConfig: RippleConfig & RippleGlobalOptions;

  /**
   * Implemented as part of RippleTarget. Whether ripples are disabled on interaction.
   * @docs-private
   */
  get rippleDisabled(): boolean {
    return this.disabled || this.disableRipple || !!this.rippleConfig.disabled ||
      this._isBasicChip();
  }

  /** The chip's leading icon. */
  @ContentChild(MatChipAvatar, {static: false}) leadingIcon: MatChipAvatar;

  /** The chip's trailing icon. */
  @ContentChild(MatChipTrailingIcon, {static: false}) trailingIcon: MatChipTrailingIcon;

  /** The chip's trailing remove icon. */
  @ContentChild(MatChipRemove, {static: false}) removeIcon: MatChipRemove;

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
    notifyTrailingIconInteraction: () => this.removeIconInteraction.emit(this.id),
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
    protected _ngZone: NgZone,
    @Optional() @Inject(MAT_RIPPLE_GLOBAL_OPTIONS)
    private _globalRippleOptions: RippleGlobalOptions | null,
    // @breaking-change 8.0.0 `animationMode` parameter to become required.
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string) {
    super(_elementRef);
    this._chipFoundation = new MDCChipFoundation(this._chipAdapter);
    this._animationsDisabled = animationMode === 'NoopAnimations';
  }

  ngAfterContentInit() {
    this._initRemoveIcon();
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

  /** Sets up the remove icon chip foundation, and subscribes to remove icon events. */
  _initRemoveIcon() {
    if (this.removeIcon) {
      this._chipFoundation.setShouldRemoveOnTrailingIconClick(true);
      this._listenToRemoveIconInteraction();
      this.removeIcon.disabled = this.disabled;
    }
  }

  /** Handles interaction with the remove icon. */
  _listenToRemoveIconInteraction() {
    this.removeIcon.interaction
        .pipe(takeUntil(this._destroyed))
        .subscribe((event) => {
          // The MDC chip foundation calls stopPropagation() for any trailing icon interaction
          // event, even ones it doesn't handle, so we want to avoid passing it keyboard events
          // for which we have a custom handler.
          if (this.disabled || (event instanceof KeyboardEvent &&
            this.HANDLED_KEYS.indexOf(event.keyCode) !== -1)) {
            return;
          }
          this._chipFoundation.handleTrailingIconInteraction(event);
        });
  }

  /**
   * Allows for programmatic removal of the chip.
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
    this.rippleConfig = this._globalRippleOptions || {};

    // Configure ripple animation to match MDC Ripple.
    this.rippleConfig.animation = {
      enterDuration: 225  /*MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS */,
      exitDuration: 150 /* MDCRippleFoundation.numbers.FG_DEACTIVATION_MS */,
    };

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
