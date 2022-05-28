/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import {
  ActionInteractionEvent,
  MDCChipActionInteractionTrigger,
  MDCChipActionType,
  MDCChipCssClasses,
} from '@material/chips';
import {take} from 'rxjs/operators';
import {MatChip} from './chip';

/** Event object emitted by MatChipOption when selected or deselected. */
export class MatChipSelectionChange {
  constructor(
    /** Reference to the chip that emitted the event. */
    public source: MatChipOption,
    /** Whether the chip that emitted the event is selected. */
    public selected: boolean,
    /** Whether the selection change was a result of a user interaction. */
    public isUserInput = false,
  ) {}
}

/**
 * An extension of the MatChip component that supports chip selection.
 * Used with MatChipListbox.
 */
@Component({
  selector: 'mat-basic-chip-option, mat-chip-option',
  templateUrl: 'chip-option.html',
  styleUrls: ['chip.css'],
  inputs: ['color', 'disableRipple', 'tabIndex'],
  host: {
    'class': 'mat-mdc-chip mat-mdc-chip-option mdc-evolution-chip mdc-evolution-chip--filter',
    '[class.mat-mdc-chip-selected]': 'selected',
    '[class.mat-mdc-chip-multiple]': '_chipListMultiple',
    '[class.mat-mdc-chip-disabled]': 'disabled',
    '[class.mat-mdc-chip-with-avatar]': 'leadingIcon',
    '[class.mdc-evolution-chip--selectable]': 'selectable',
    '[class.mdc-evolution-chip--disabled]': 'disabled',
    '[class.mdc-evolution-chip--with-trailing-action]': '_hasTrailingIcon()',
    '[class.mdc-evolution-chip--with-primary-graphic]': '_hasLeadingGraphic()',
    '[class.mdc-evolution-chip--with-primary-icon]': 'leadingIcon',
    '[class.mdc-evolution-chip--with-avatar]': 'leadingIcon',
    '[class.mat-mdc-chip-highlighted]': 'highlighted',
    '[class.mat-mdc-chip-with-trailing-icon]': '_hasTrailingIcon()',
    '[attr.tabindex]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.role]': 'role',
    '[id]': 'id',
  },
  providers: [{provide: MatChip, useExisting: MatChipOption}],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipOption extends MatChip implements OnInit, AfterViewInit {
  /** Whether the component is done initializing. */
  private _isInitialized: boolean;

  /**
   * Selected state that was assigned before the component was initializing
   * and which needs to be synced back up with the foundation.
   */
  private _pendingSelectedState: boolean | undefined;

  /** Whether the chip list is selectable. */
  chipListSelectable: boolean = true;

  /** Whether the chip list is in multi-selection mode. */
  _chipListMultiple: boolean = false;

  /**
   * Whether or not the chip is selectable.
   *
   * When a chip is not selectable, changes to its selected state are always
   * ignored. By default an option chip is selectable, and it becomes
   * non-selectable if its parent chip list is not selectable.
   */
  @Input()
  get selectable(): boolean {
    return this._selectable && this.chipListSelectable;
  }
  set selectable(value: BooleanInput) {
    this._selectable = coerceBooleanProperty(value);
  }
  protected _selectable: boolean = true;

  /** Whether the chip is selected. */
  @Input()
  get selected(): boolean {
    return (
      this._pendingSelectedState ?? this._chipFoundation.isActionSelected(MDCChipActionType.PRIMARY)
    );
  }
  set selected(value: BooleanInput) {
    if (this.selectable) {
      const coercedValue = coerceBooleanProperty(value);

      if (this._isInitialized) {
        this._setSelectedState(coercedValue, false);
      } else {
        this._pendingSelectedState = coercedValue;
      }
    }
  }

  /** The ARIA selected applied to the chip. */
  get ariaSelected(): string | null {
    // Remove the `aria-selected` when the chip is deselected in single-selection mode, because
    // it adds noise to NVDA users where "not selected" will be read out for each chip.
    return this.selectable && (this._chipListMultiple || this.selected)
      ? this.selected.toString()
      : null;
  }

  /** The unstyled chip selector for this component. */
  protected override basicChipAttrName = 'mat-basic-chip-option';

  /** Emitted when the chip is selected or deselected. */
  @Output() readonly selectionChange: EventEmitter<MatChipSelectionChange> =
    new EventEmitter<MatChipSelectionChange>();

  ngOnInit() {
    this.role = 'presentation';
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    this._isInitialized = true;

    if (this._pendingSelectedState != null) {
      // Note that we want to clear the pending state before calling `_setSelectedState`, because
      // we want it to read the actual selected state instead falling back to the pending one.
      const selectedState = this._pendingSelectedState;
      this._pendingSelectedState = undefined;
      this._setSelectedState(selectedState, false);
    }
  }

  /** Selects the chip. */
  select(): void {
    if (this.selectable) {
      this._setSelectedState(true, false);
    }
  }

  /** Deselects the chip. */
  deselect(): void {
    if (this.selectable) {
      this._setSelectedState(false, false);
    }
  }

  /** Selects this chip and emits userInputSelection event */
  selectViaInteraction(): void {
    if (this.selectable) {
      this._setSelectedState(true, true);
    }
  }

  /** Toggles the current selected state of this chip. */
  toggleSelected(isUserInput: boolean = false): boolean {
    if (this.selectable) {
      this._setSelectedState(!this.selected, isUserInput);
    }

    return this.selected;
  }

  /** Resets the state of the chip when it loses focus. */
  _blur(): void {
    // When animations are enabled, Angular may end up removing the chip from the DOM a little
    // earlier than usual, causing it to be blurred and throwing off the logic in the chip list
    // that moves focus not the next item. To work around the issue, we defer marking the chip
    // as not focused until the next time the zone stabilizes.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => {
      this._ngZone.run(() => {
        this._hasFocusInternal = false;
        this._onBlur.next({chip: this});
      });
    });
  }

  protected override _onChipInteraction(event: ActionInteractionEvent) {
    const {trigger, source} = event.detail;

    // Non-selection interactions should work the same as other chips.
    if (
      source !== MDCChipActionType.PRIMARY ||
      (trigger !== MDCChipActionInteractionTrigger.CLICK &&
        trigger !== MDCChipActionInteractionTrigger.ENTER_KEY &&
        trigger !== MDCChipActionInteractionTrigger.SPACEBAR_KEY)
    ) {
      super._onChipInteraction(event);
    } else if (this.selectable && !this.disabled) {
      // Otherwise only let the event through if the chip is enabled and selectable.
      this._chipFoundation.handleActionInteraction(event);
      this.selectionChange.emit({
        source: this,
        isUserInput: true,
        selected: this.selected,
      });
    }
  }

  _hasLeadingGraphic() {
    // The checkmark graphic is built in for multi-select chip lists.
    return this.leadingIcon || (this._chipListMultiple && this.selectable);
  }

  private _setSelectedState(isSelected: boolean, isUserInput: boolean) {
    if (isSelected !== this.selected) {
      this._chipFoundation.setActionSelected(MDCChipActionType.PRIMARY, isSelected);
      this.selectionChange.emit({
        source: this,
        isUserInput,
        selected: this.selected,
      });
    }

    // MDC won't assign the selected class until the animation finishes, but that may not
    // happen if animations are disabled. If we detect such a case, assign the class manually.
    if (this._animationsDisabled) {
      this._elementRef.nativeElement.classList.toggle(MDCChipCssClasses.SELECTED, isSelected);
    }
  }
}
