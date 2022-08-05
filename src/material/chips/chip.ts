/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

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
  mixinDisabled,
  RippleGlobalOptions,
} from '@angular/material/core';
import {FocusMonitor} from '@angular/cdk/a11y';
import {Subject} from 'rxjs';
import {take} from 'rxjs/operators';
import {MatChipAvatar, MatChipTrailingIcon, MatChipRemove} from './chip-icons';
import {MatChipAction} from './chip-action';
import {BACKSPACE, DELETE} from '@angular/cdk/keycodes';
import {MAT_CHIP, MAT_CHIP_AVATAR, MAT_CHIP_REMOVE, MAT_CHIP_TRAILING_ICON} from './tokens';

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
const _MatChipMixinBase = mixinTabIndex(
  mixinColor(
    mixinDisableRipple(
      mixinDisabled(
        class {
          constructor(public _elementRef: ElementRef<HTMLElement>) {}
        },
      ),
    ),
    'primary',
  ),
  -1,
);

/**
 * Material design styled Chip base component. Used inside the MatChipSet component.
 *
 * Extended by MatChipOption and MatChipRow for different interaction patterns.
 */
@Component({
  selector: 'mat-basic-chip, mat-chip',
  inputs: ['color', 'disabled', 'disableRipple', 'tabIndex'],
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
    '(keydown)': '_handleKeydown($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: MAT_CHIP, useExisting: MatChip}],
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
  private _hasFocusInternal = false;

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

  constructor(
    public _changeDetectorRef: ChangeDetectorRef,
    elementRef: ElementRef<HTMLElement>,
    protected _ngZone: NgZone,
    private _focusMonitor: FocusMonitor,
    @Inject(DOCUMENT) _document: any,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    @Optional()
    @Inject(MAT_RIPPLE_GLOBAL_OPTIONS)
    private _globalRippleOptions?: RippleGlobalOptions,
    @Attribute('tabindex') tabIndex?: string,
  ) {
    super(elementRef);
    const element = elementRef.nativeElement;
    this._document = _document;
    this._animationsDisabled = animationMode === 'NoopAnimations';
    this._isBasicChip =
      element.hasAttribute(this.basicChipAttrName) ||
      element.tagName.toLowerCase() === this.basicChipAttrName;
    if (tabIndex != null) {
      this.tabIndex = parseInt(tabIndex) ?? this.defaultTabIndex;
    }
    this._monitorFocus();
  }

  ngAfterViewInit() {
    this._textElement = this._elementRef.nativeElement.querySelector('.mat-mdc-chip-action-label')!;

    if (this._pendingFocus) {
      this._pendingFocus = false;
      this.focus();
    }
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef);
    this.destroyed.emit({chip: this});
    this.destroyed.complete();
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

  /** Returns whether the chip has a trailing icon. */
  _hasTrailingIcon() {
    return !!(this.trailingIcon || this.removeIcon);
  }

  /** Handles keyboard events on the chip. */
  _handleKeydown(event: KeyboardEvent) {
    if (event.keyCode === BACKSPACE || event.keyCode === DELETE) {
      event.preventDefault();
      this.remove();
    }
  }

  /** Allows for programmatic focusing of the chip. */
  focus(): void {
    if (!this.disabled) {
      // If `focus` is called before `ngAfterViewInit`, we won't have access to the primary action.
      // This can happen if the consumer tries to focus a chip immediately after it is added.
      // Queue the method to be called again on init.
      if (this.primaryAction) {
        this.primaryAction.focus();
      } else {
        this._pendingFocus = true;
      }
    }
  }

  /** Gets the action that contains a specific target node. */
  _getSourceAction(target: Node): MatChipAction | undefined {
    return this._getActions().find(action => {
      const element = action._elementRef.nativeElement;
      return element === target || element.contains(target);
    });
  }

  /** Gets all of the actions within the chip. */
  _getActions(): MatChipAction[] {
    const result: MatChipAction[] = [];

    if (this.primaryAction) {
      result.push(this.primaryAction);
    }

    if (this.removeIcon) {
      result.push(this.removeIcon);
    }

    if (this.trailingIcon) {
      result.push(this.trailingIcon);
    }

    return result;
  }

  /** Handles interactions with the primary action of the chip. */
  _handlePrimaryActionInteraction() {
    // Empty here, but is overwritten in child classes.
  }

  /** Starts the focus monitoring process on the chip. */
  private _monitorFocus() {
    this._focusMonitor.monitor(this._elementRef, true).subscribe(origin => {
      const hasFocus = origin !== null;

      if (hasFocus !== this._hasFocusInternal) {
        this._hasFocusInternal = hasFocus;

        if (hasFocus) {
          this._onFocus.next({chip: this});
        } else {
          // When animations are enabled, Angular may end up removing the chip from the DOM a little
          // earlier than usual, causing it to be blurred and throwing off the logic in the chip list
          // that moves focus not the next item. To work around the issue, we defer marking the chip
          // as not focused until the next time the zone stabilizes.
          this._ngZone.onStable
            .pipe(take(1))
            .subscribe(() => this._ngZone.run(() => this._onBlur.next({chip: this})));
        }
      }
    });
  }
}
