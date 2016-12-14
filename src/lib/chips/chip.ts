import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer
} from '@angular/core';

import {MdFocusable} from '../core/a11y/list-key-manager';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';

export interface MdChipEvent {
  chip: MdChip;
}

/**
 * A material design styled Chip component. Used inside the ChipList component.
 */
@Component({
  selector: 'md-basic-chip, [md-basic-chip], md-chip, [md-chip]',
  template: `<ng-content></ng-content>`,
  host: {
    'tabindex': '-1',
    'role': 'option',

    '[attr.disabled]': 'disabled',
    '[attr.aria-disabled]': '_isAriaDisabled',

    '(click)': '_handleClick($event)'
  }
})
export class MdChip implements MdFocusable, OnInit, OnDestroy {

  /* Whether or not the chip is disabled. */
  protected _disabled: boolean = null;

  /**
   * Emitted when the chip is focused.
   */
  onFocus = new EventEmitter<MdChipEvent>();

  /**
   * Emitted when the chip is destroyed.
   */
  @Output() destroy = new EventEmitter<MdChipEvent>();

  constructor(protected _renderer: Renderer, protected _elementRef: ElementRef) {}

  ngOnInit(): void {
    let el: HTMLElement = this._elementRef.nativeElement;

    if (el.nodeName.toLowerCase() == 'md-chip' || el.hasAttribute('md-chip')) {
      el.classList.add('md-chip');
    }
  }

  ngOnDestroy(): void {
    this.destroy.emit({ chip: this });
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

  /** Allows for programmatic focusing of the chip. */
  focus(): void {
    this._renderer.invokeElementMethod(this._elementRef.nativeElement, 'focus');
    this.onFocus.emit({ chip: this });
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
}
