import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';

import {Focusable} from '../core/a11y/focus-key-manager';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';
import {CanColor, mixinColor} from '../core/common-behaviors/color';

export interface MdChipEvent {
  chip: MdChip;
}

// Boilerplate for applying mixins to MdChip.
export class MdChipBase {
  constructor(public _renderer: Renderer2, public _elementRef: ElementRef) {}
}
export const _MdChipMixinBase = mixinColor(MdChipBase, 'primary');


/**
 * Material design styled Chip component. Used inside the MdChipList component.
 */
@Component({
  selector: `md-basic-chip, [md-basic-chip], md-chip, [md-chip],
             mat-basic-chip, [mat-basic-chip], mat-chip, [mat-chip]`,
  template: `<ng-content></ng-content>`,
  inputs: ['color'],
  host: {
    '[class.mat-chip]': 'true',
    'tabindex': '-1',
    'role': 'option',

    '[class.mat-chip-selected]': 'selected',
    '[attr.disabled]': 'disabled',
    '[attr.aria-disabled]': '_isAriaDisabled',

    '(click)': '_handleClick($event)'
  }
})
export class MdChip extends _MdChipMixinBase implements Focusable, OnInit, OnDestroy, CanColor {

  /** Whether or not the chip is disabled. Disabled chips cannot be focused. */
  protected _disabled: boolean = null;

  /** Whether or not the chip is selected. */
  protected _selected: boolean = false;

  /** Emitted when the chip is focused. */
  onFocus = new EventEmitter<MdChipEvent>();

  /** Emitted when the chip is selected. */
  @Output() select = new EventEmitter<MdChipEvent>();

  /** Emitted when the chip is deselected. */
  @Output() deselect = new EventEmitter<MdChipEvent>();

  /** Emitted when the chip is destroyed. */
  @Output() destroy = new EventEmitter<MdChipEvent>();

  constructor(renderer: Renderer2, elementRef: ElementRef) {
    super(renderer, elementRef);
  }

  ngOnInit(): void {
    this._addDefaultCSSClass();
  }

  ngOnDestroy(): void {
    this.destroy.emit({chip: this});
  }

  /** Whether or not the chip is disabled. */
  @Input() get disabled(): boolean {
    return this._disabled;
  }

  /** Sets the disabled state of the chip. */
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value) ? true : null;
  }

  /** A String representation of the current disabled state. */
  get _isAriaDisabled(): string {
    return String(coerceBooleanProperty(this.disabled));
  }

  /** Whether or not this chip is selected. */
  @Input() get selected(): boolean {
    return this._selected;
  }

  set selected(value: boolean) {
    this._selected = coerceBooleanProperty(value);

    if (this._selected) {
      this.select.emit({chip: this});
    } else {
      this.deselect.emit({chip: this});
    }
  }

  /**
   * Toggles the current selected state of this chip.
   * @return Whether the chip is selected.
   */
  toggleSelected(): boolean {
    this.selected = !this.selected;
    return this.selected;
  }

  /** Allows for programmatic focusing of the chip. */
  focus(): void {
    this._elementRef.nativeElement.focus();
    this.onFocus.emit({chip: this});
  }

  /** Ensures events fire properly upon click. */
  _handleClick(event: Event) {
    // Check disabled
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      this.focus();
    }
  }

  /** Initializes the appropriate CSS classes based on the chip type (basic or standard). */
  private _addDefaultCSSClass() {
    let el: HTMLElement = this._elementRef.nativeElement;

    // Always add the `mat-chip` class
    this._renderer.addClass(el, 'mat-chip');

    // If we are a basic chip, also add the `mat-basic-chip` class for :not() targeting
    if (el.nodeName.toLowerCase() == 'mat-basic-chip' || el.hasAttribute('mat-basic-chip') ||
        el.nodeName.toLowerCase() == 'md-basic-chip' || el.hasAttribute('md-basic-chip')) {
      this._renderer.addClass(el, 'mat-basic-chip');
    }
  }
}
