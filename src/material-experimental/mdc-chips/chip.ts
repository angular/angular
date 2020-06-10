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
  HostListener,
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
  CanColorCtor,
  CanDisableRipple,
  CanDisableRippleCtor,
  HasTabIndex,
  HasTabIndexCtor,
  MatRipple,
  mixinColor,
  mixinDisableRipple,
  mixinTabIndex,
  RippleAnimationConfig,
} from '@angular/material/core';
import {MDCChipAdapter, MDCChipFoundation} from '@material/chips';
import {numbers} from '@material/ripple';
import {SPACE, ENTER, hasModifierKey} from '@angular/cdk/keycodes';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatChipAvatar, MatChipTrailingIcon, MatChipRemove} from './chip-icons';


let uid = 0;

/** Represents an event fired on an individual `mat-chip`. */
export interface MatChipEvent {
  /** The chip the event was fired on. */
  chip: MatChip;
}

/** Configuration for the ripple animation. */
const RIPPLE_ANIMATION_CONFIG: RippleAnimationConfig = {
  enterDuration: numbers.DEACTIVATION_TIMEOUT_MS,
  exitDuration: numbers.FG_DEACTIVATION_MS
};

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
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChip extends _MatChipMixinBase implements AfterContentInit, AfterViewInit,
  CanColor, CanDisableRipple, HasTabIndex, OnDestroy {
  /** The ripple animation configuration to use for the chip. */
  readonly _rippleAnimation: RippleAnimationConfig = RIPPLE_ANIMATION_CONFIG;

  /** Whether the ripple is centered on the chip. */
  readonly _isRippleCentered = false;

  /** Emits when the chip is focused. */
  readonly _onFocus = new Subject<MatChipEvent>();

  /** Emits when the chip is blurred. */
  readonly _onBlur = new Subject<MatChipEvent>();

  readonly REMOVE_ICON_HANDLED_KEYS: Set<number> = new Set([SPACE, ENTER]);

  /** Whether this chip is a basic (unstyled) chip. */
  readonly _isBasicChip: boolean;

  /** Whether the chip has focus. */
  protected _hasFocusInternal = false;

    /** Whether animations for the chip are enabled. */
  _animationsDisabled: boolean;

  // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
  // In Ivy the `host` bindings will be merged when this class is extended, whereas in
  // ViewEngine they're overwritten.
  // TODO(mmalerba): we move this back into `host` once Ivy is turned on by default.
  // tslint:disable-next-line:no-host-decorator-in-concrete
  @HostListener('transitionend', ['$event'])
  _handleTransitionEnd(event: TransitionEvent) {
    this._chipFoundation.handleTransitionEnd(event);
  }

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

  private _textElement!: HTMLElement;

  /** The value of the chip. Defaults to the content inside the mdc-chip__text element. */
  @Input()
  get value(): any {
    return this._value !== undefined
      ? this._value
      : this._textElement.textContent!.trim();
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

  /** The chip's leading icon. */
  @ContentChild(MatChipAvatar) leadingIcon: MatChipAvatar;

  /** The chip's trailing icon. */
  @ContentChild(MatChipTrailingIcon) trailingIcon: MatChipTrailingIcon;

  /** The chip's trailing remove icon. */
  @ContentChild(MatChipRemove) removeIcon: MatChipRemove;

  /** Reference to the MatRipple instance of the chip. */
  @ViewChild(MatRipple) ripple: MatRipple;

 /**
  * Implementation of the MDC chip adapter interface.
  * These methods are called by the chip foundation.
  */
  protected _chipAdapter: MDCChipAdapter = {
    addClass: (className) => this._setMdcClass(className, true),
    removeClass: (className) => this._setMdcClass(className, false),
    hasClass: (className) =>
        this._elementRef.nativeElement.classList.contains(className),
    addClassToLeadingIcon: (className) =>
        this.leadingIcon.setClass(className, true),
    removeClassFromLeadingIcon: (className) =>
        this.leadingIcon.setClass(className, false),
    eventTargetHasClass:
        (target: EventTarget|null, className: string) => {
          // We need to null check the `classList`, because IE and Edge don't
          // support it on SVG elements and Edge seems to throw for ripple
          // elements, because they're outside the DOM.
          return (target && (target as Element).classList) ?
              (target as Element).classList.contains(className) :
              false;
        },
    notifyInteraction: () => this._notifyInteraction(),
    notifySelection:
        () => {
          // No-op. We call dispatchSelectionEvent ourselves in MatChipOption,
          // because we want to specify whether selection occurred via user
          // input.
        },
    notifyNavigation: () => this._notifyNavigation(),
    notifyTrailingIconInteraction: () =>
        this.removeIconInteraction.emit(this.id),
    notifyRemoval:
        () => {
          this.removed.emit({chip: this});

          // When MDC removes a chip it just transitions it to `width: 0px`
          // which means that it's still in the DOM and it's still focusable.
          // Make it `display: none` so users can't tab into it.
          this._elementRef.nativeElement.style.display = 'none';
        },
    // Noop for now since we don't support editable chips yet.
    notifyEditStart: () => {},
    notifyEditFinish: () => {},
    getComputedStyleValue:
        propertyName => {
          // This function is run when a chip is removed so it might be
          // invoked during server-side rendering. Add some extra checks just in
          // case.
          if (typeof window !== 'undefined' && window) {
            const getComputedStyle =
                window.getComputedStyle(this._elementRef.nativeElement);
            return getComputedStyle.getPropertyValue(propertyName);
          }
          return '';
        },
    setStyleProperty:
        (propertyName: string, value: string) => {
          this._elementRef.nativeElement.style.setProperty(propertyName, value);
        },
    hasLeadingIcon: () => !!this.leadingIcon,
    isTrailingActionNavigable:
        () => {
          if (this.trailingIcon) {
            return this.trailingIcon.isNavigable();
          }
          return false;
        },
    isRTL: () => !!this._dir && this._dir.value === 'rtl',
    focusPrimaryAction:
        () => {
          // Angular Material MDC chips fully manage focus. TODO: Managing focus
          // and handling keyboard events was added by MDC after our
          // implementation; consider consolidating.
        },
    focusTrailingAction: () => {},
    removeTrailingActionFocus: () => {},
    setPrimaryActionAttr:
        (name: string, value: string) => {
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
    getRootBoundingClientRect: () =>
        this._elementRef.nativeElement.getBoundingClientRect(),
    getCheckmarkBoundingClientRect: () => null,
    getAttribute: (attr) => this._elementRef.nativeElement.getAttribute(attr),
  };

  constructor(
      public _changeDetectorRef: ChangeDetectorRef,
      readonly _elementRef: ElementRef, protected _ngZone: NgZone,
      @Optional() private _dir: Directionality,
      // @breaking-change 8.0.0 `animationMode` parameter to become required.
      @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string) {
    super(_elementRef);
    this._chipFoundation = new MDCChipFoundation(this._chipAdapter);
    this._animationsDisabled = animationMode === 'NoopAnimations';
    this._isBasicChip = _elementRef.nativeElement.hasAttribute(this.basicChipAttrName) ||
                        _elementRef.nativeElement.tagName.toLowerCase() === this.basicChipAttrName;
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
    this._destroyed.next();
    this._destroyed.complete();
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
        .subscribe(event => {
          // The MDC chip foundation calls stopPropagation() for any trailing icon interaction
          // event, even ones it doesn't handle, so we want to avoid passing it keyboard events
          // for which we have a custom handler. Note that we assert the type of the event using
          // the `type`, because `instanceof KeyboardEvent` can throw during server-side rendering.
          const isKeyboardEvent = event.type.startsWith('key');

          if (this.disabled || (isKeyboardEvent &&
              !this.REMOVE_ICON_HANDLED_KEYS.has((event as KeyboardEvent).keyCode))) {
            return;
          }

          this._chipFoundation.handleTrailingActionInteraction();

          if (isKeyboardEvent && !hasModifierKey(event as KeyboardEvent)) {
            const keyCode = (event as KeyboardEvent).keyCode;

            // Prevent default space and enter presses so we don't scroll the page or submit forms.
            if (keyCode === SPACE || keyCode === ENTER) {
              event.preventDefault();
            }
          }
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

  /** Sets whether the given CSS class should be applied to the MDC chip. */
  private _setMdcClass(cssClass: string, active: boolean) {
      const classes = this._elementRef.nativeElement.classList;
      active ? classes.add(cssClass) : classes.remove(cssClass);
      this._changeDetectorRef.markForCheck();
  }

  /** Forwards interaction events to the MDC chip foundation. */
  _handleInteraction(event: MouseEvent | KeyboardEvent) {
    if (this.disabled) {
      return;
    }

    if (event.type === 'click') {
      this._chipFoundation.handleClick();
      return;
    }

    if (event.type === 'keydown') {
      this._chipFoundation.handleKeydown(event as KeyboardEvent);
      return;
    }
  }

  /** Whether or not the ripple should be disabled. */
  _isRippleDisabled(): boolean {
    return this.disabled || this.disableRipple || this._animationsDisabled || this._isBasicChip;
  }

  _notifyInteraction() {
    this.interaction.emit(this.id);
  }

  _notifyNavigation() {
    // TODO: This is a new feature added by MDC. Consider exposing it to users
    // in the future.
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_removable: BooleanInput;
  static ngAcceptInputType_highlighted: BooleanInput;
  static ngAcceptInputType_disableRipple: BooleanInput;
}
