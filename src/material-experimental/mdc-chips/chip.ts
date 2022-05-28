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
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ContentChild,
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
  Attribute,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
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
import {
  MDCChipFoundation,
  MDCChipAdapter,
  MDCChipActionType,
  MDCChipActionFocusBehavior,
  MDCChipActionFoundation,
  MDCChipActionEvents,
  ActionInteractionEvent,
  ActionNavigationEvent,
  MDCChipActionInteractionTrigger,
} from '@material/chips';
import {FocusMonitor} from '@angular/cdk/a11y';
import {Subject} from 'rxjs';
import {
  MatChipAvatar,
  MatChipTrailingIcon,
  MatChipRemove,
  MAT_CHIP_AVATAR,
  MAT_CHIP_TRAILING_ICON,
  MAT_CHIP_REMOVE,
} from './chip-icons';
import {emitCustomEvent} from './emit-event';
import {MatChipAction} from './chip-action';

let uid = 0;

/** Represents an event fired on an individual `mat-chip`. */
export interface MatChipEvent {
  /** The chip the event was fired on. */
  chip: MatChip;
}

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
  inputs: ['color', 'disableRipple', 'tabIndex'],
  exportAs: 'matChip',
  templateUrl: 'chip.html',
  styleUrls: ['chip.css'],
  host: {
    'class': 'mat-mdc-chip',
    '[class.mdc-evolution-chip]': '!_isBasicChip',
    '[class.mdc-evolution-chip--disabled]': 'disabled',
    '[class.mdc-evolution-chip--with-trailing-action]': '_hasTrailingIcon()',
    '[class.mdc-evolution-chip--with-primary-graphic]': 'leadingIcon',
    '[class.mdc-evolution-chip--with-primary-icon]': 'leadingIcon',
    '[class.mdc-evolution-chip--with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-highlighted]': 'highlighted',
    '[class.mat-mdc-chip-disabled]': 'disabled',
    '[class.mat-mdc-basic-chip]': '_isBasicChip',
    '[class.mat-mdc-standard-chip]': '!_isBasicChip',
    '[class.mat-mdc-chip-with-trailing-icon]': '_hasTrailingIcon()',
    '[class._mat-animation-noopable]': '_animationsDisabled',
    '[id]': 'id',
    '[attr.role]': 'role',
    '[attr.tabindex]': 'role ? tabIndex : null',
    '[attr.aria-label]': 'ariaLabel',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChip
  extends _MatChipMixinBase
  implements AfterViewInit, CanColor, CanDisableRipple, CanDisable, HasTabIndex, OnDestroy
{
  protected _document: Document;

  /** Whether the ripple is centered on the chip. */
  readonly _isRippleCentered = false;

  /** Emits when the chip is focused. */
  readonly _onFocus = new Subject<MatChipEvent>();

  /** Emits when the chip is blurred. */
  readonly _onBlur = new Subject<MatChipEvent>();

  /** Whether this chip is a basic (unstyled) chip. */
  readonly _isBasicChip: boolean;

  /** Role for the root of the chip. */
  @Input() role: string | null = null;

  /** Whether the chip has focus. */
  protected _hasFocusInternal = false;

  /** Whether moving focus into the chip is pending. */
  private _pendingFocus: boolean;

  /** Whether animations for the chip are enabled. */
  _animationsDisabled: boolean;

  _hasFocus() {
    return this._hasFocusInternal;
  }

  /** A unique id for the chip. If none is supplied, it will be auto-generated. */
  @Input() id: string = `mat-mdc-chip-${uid++}`;

  /** ARIA label for the content of the chip. */
  @Input('aria-label') ariaLabel: string | null = null;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);

    if (this.removeIcon) {
      this.removeIcon.disabled = this._disabled;
    }

    this._chipFoundation.setDisabled(this._disabled);
  }
  protected _disabled: boolean = false;

  private _textElement!: HTMLElement;

  /**
   * The value of the chip. Defaults to the content inside
   * the `mat-mdc-chip-action-label` element.
   */
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

  /** Emitted when a chip is to be removed. */
  @Output() readonly removed: EventEmitter<MatChipEvent> = new EventEmitter<MatChipEvent>();

  /** Emitted when the chip is destroyed. */
  @Output() readonly destroyed: EventEmitter<MatChipEvent> = new EventEmitter<MatChipEvent>();

  /** The MDC foundation containing business logic for MDC chip. */
  _chipFoundation: MDCChipFoundation;

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

  /** Action receiving the primary set of user interactions. */
  @ViewChild(MatChipAction) primaryAction: MatChipAction;

  /**
   * Implementation of the MDC chip adapter interface.
   * These methods are called by the chip foundation.
   */
  protected _chipAdapter: MDCChipAdapter = {
    addClass: className => this._setMdcClass(className, true),
    removeClass: className => this._setMdcClass(className, false),
    hasClass: className => this._elementRef.nativeElement.classList.contains(className),
    emitEvent: <T>(eventName: string, data: T) => {
      emitCustomEvent(this._elementRef.nativeElement, this._document, eventName, data, true);
    },
    setStyleProperty: (propertyName: string, value: string) => {
      this._elementRef.nativeElement.style.setProperty(propertyName, value);
    },
    isRTL: () => this._dir?.value === 'rtl',
    getAttribute: attributeName => this._elementRef.nativeElement.getAttribute(attributeName),
    getElementID: () => this._elementRef.nativeElement.id,
    getOffsetWidth: () => this._elementRef.nativeElement.offsetWidth,
    getActions: () => {
      const result: MDCChipActionType[] = [];

      if (this._getAction(MDCChipActionType.PRIMARY)) {
        result.push(MDCChipActionType.PRIMARY);
      }

      if (this._getAction(MDCChipActionType.TRAILING)) {
        result.push(MDCChipActionType.TRAILING);
      }

      return result;
    },
    isActionSelectable: (action: MDCChipActionType) => {
      return this._getAction(action)?.isSelectable() || false;
    },
    isActionSelected: (action: MDCChipActionType) => {
      return this._getAction(action)?.isSelected() || false;
    },
    isActionDisabled: (action: MDCChipActionType) => {
      return this._getAction(action)?.isDisabled() || false;
    },
    isActionFocusable: (action: MDCChipActionType) => {
      return this._getAction(action)?.isFocusable() || false;
    },
    setActionSelected: (action: MDCChipActionType, isSelected: boolean) => {
      this._getAction(action)?.setSelected(isSelected);
    },
    setActionDisabled: (action: MDCChipActionType, isDisabled: boolean) => {
      this._getAction(action)?.setDisabled(isDisabled);
    },
    setActionFocus: (action: MDCChipActionType, behavior: MDCChipActionFocusBehavior) => {
      this._getAction(action)?.setFocus(behavior);
    },
  };

  constructor(
    public _changeDetectorRef: ChangeDetectorRef,
    elementRef: ElementRef<HTMLElement>,
    protected _ngZone: NgZone,
    private _focusMonitor: FocusMonitor,
    @Inject(DOCUMENT) _document: any,
    @Optional() private _dir: Directionality,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    @Optional()
    @Inject(MAT_RIPPLE_GLOBAL_OPTIONS)
    private _globalRippleOptions?: RippleGlobalOptions,
    @Attribute('tabindex') tabIndex?: string,
  ) {
    super(elementRef);
    const element = elementRef.nativeElement;
    this._document = _document;
    this._chipFoundation = new MDCChipFoundation(this._chipAdapter);
    this._animationsDisabled = animationMode === 'NoopAnimations';
    this._isBasicChip =
      element.hasAttribute(this.basicChipAttrName) ||
      element.tagName.toLowerCase() === this.basicChipAttrName;
    element.addEventListener(MDCChipActionEvents.INTERACTION, this._handleActionInteraction);
    element.addEventListener(MDCChipActionEvents.NAVIGATION, this._handleActionNavigation);
    _focusMonitor.monitor(elementRef, true);

    _ngZone.runOutsideAngular(() => {
      element.addEventListener('transitionend', this._handleTransitionend);
      element.addEventListener('animationend', this._handleAnimationend);
    });

    if (tabIndex != null) {
      this.tabIndex = parseInt(tabIndex) ?? this.defaultTabIndex;
    }
  }

  ngAfterViewInit() {
    this._chipFoundation.init();
    this._chipFoundation.setDisabled(this.disabled);
    this._textElement = this._elementRef.nativeElement.querySelector('.mat-mdc-chip-action-label');

    if (this._pendingFocus) {
      this._pendingFocus = false;
      this.focus();
    }
  }

  ngOnDestroy() {
    const element = this._elementRef.nativeElement;
    element.removeEventListener(MDCChipActionEvents.INTERACTION, this._handleActionInteraction);
    element.removeEventListener(MDCChipActionEvents.NAVIGATION, this._handleActionNavigation);
    element.removeEventListener('transitionend', this._handleTransitionend);
    element.removeEventListener('animationend', this._handleAnimationend);
    this._chipFoundation.destroy();
    this._focusMonitor.stopMonitoring(this._elementRef);
    this.destroyed.emit({chip: this});
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

  _getAction(type: MDCChipActionType): MDCChipActionFoundation | undefined {
    switch (type) {
      case MDCChipActionType.PRIMARY:
        return this.primaryAction?._getFoundation();
      case MDCChipActionType.TRAILING:
        return (this.removeIcon || this.trailingIcon)?._getFoundation();
    }

    return undefined;
  }

  _getFoundation() {
    return this._chipFoundation;
  }

  _hasTrailingIcon() {
    return !!(this.trailingIcon || this.removeIcon);
  }

  /** Allows for programmatic focusing of the chip. */
  focus(): void {
    if (this.disabled) {
      return;
    }

    // If `focus` is called before `ngAfterViewInit`, we won't have access to the primary action.
    // This can happen if the consumer tries to focus a chip immediately after it is added.
    // Queue the method to be called again on init.
    if (!this.primaryAction) {
      this._pendingFocus = true;
      return;
    }

    if (!this._hasFocus()) {
      this._onFocus.next({chip: this});
      this._hasFocusInternal = true;
    }

    this.primaryAction.focus();
  }

  /** Overridden by MatChipOption. */
  protected _onChipInteraction(event: ActionInteractionEvent) {
    const removeElement = this.removeIcon?._elementRef.nativeElement;
    const trigger = event.detail.trigger;

    // MDC's removal process requires an `animationend` event followed by a `transitionend`
    // event coming from the chip, which in turn will call `remove`. While we can stub
    // out these events in our own tests, they can be difficult to fake for consumers that are
    // testing our components or are wrapping them. We skip the entire sequence and trigger the
    // removal directly in order to make the component easier to deal with.
    if (
      removeElement &&
      (trigger === MDCChipActionInteractionTrigger.CLICK ||
        trigger === MDCChipActionInteractionTrigger.ENTER_KEY ||
        trigger === MDCChipActionInteractionTrigger.SPACEBAR_KEY) &&
      (event.target === removeElement || removeElement.contains(event.target))
    ) {
      this.remove();
    } else {
      this._chipFoundation.handleActionInteraction(event);
    }
  }

  private _handleActionInteraction = (event: Event) => {
    this._onChipInteraction(event as ActionInteractionEvent);
  };

  private _handleActionNavigation = (event: Event) => {
    this._chipFoundation.handleActionNavigation(event as ActionNavigationEvent);
  };

  private _handleTransitionend = (event: TransitionEvent) => {
    if (event.target === this._elementRef.nativeElement) {
      this._ngZone.run(() => this._chipFoundation.handleTransitionEnd());
    }
  };

  private _handleAnimationend = (event: AnimationEvent) => {
    if (event.target === this._elementRef.nativeElement) {
      this._ngZone.run(() => this._chipFoundation.handleAnimationEnd(event));
    }
  };
}
