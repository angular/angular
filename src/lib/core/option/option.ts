import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  NgModule,
  ModuleWithProviders,
  Renderer,
  ViewEncapsulation
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ENTER, SPACE} from '../keyboard/keycodes';
import {coerceBooleanProperty} from '../coercion/boolean-property';
import {MdRippleModule} from '../ripple/ripple';

/**
 * Option IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let _uniqueIdCounter = 0;

/** Event object emitted by MdOption when selected. */
export class MdOptionSelectEvent {
  constructor(public source: MdOption, public isUserInput = false) {}
}


/**
 * Single option inside of a `<md-select>` element.
 */
@Component({
  moduleId: module.id,
  selector: 'md-option, mat-option',
  host: {
    'role': 'option',
    '[attr.tabindex]': '_getTabIndex()',
    '[class.md-selected]': 'selected',
    '[class.md-active]': 'active',
    '[id]': 'id',
    '[attr.aria-selected]': 'selected.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[class.md-option-disabled]': 'disabled',
    '(click)': '_selectViaInteraction()',
    '(keydown)': '_handleKeydown($event)'
  },
  templateUrl: 'option.html',
  encapsulation: ViewEncapsulation.None
})
export class MdOption {
  private _selected: boolean = false;
  private _active: boolean = false;

  /** Whether the option is disabled.  */
  private _disabled: boolean = false;

  private _id: string = `md-option-${_uniqueIdCounter++}`;

  /** The unique ID of the option. */
  get id() { return this._id; }

  /** The form value of the option. */
  @Input() value: any;

  /** Whether the option is disabled. */
  @Input()
  get disabled() { return this._disabled; }
  set disabled(value: any) { this._disabled = coerceBooleanProperty(value); }

  /** Event emitted when the option is selected. */
  @Output() onSelect = new EventEmitter<MdOptionSelectEvent>();

  constructor(private _element: ElementRef, private _renderer: Renderer) {}

  /** Whether or not the option is currently selected. */
  get selected(): boolean {
    return this._selected;
  }

  /**
   * Whether or not the option is currently active and ready to be selected.
   * An active option displays styles as if it is focused, but the
   * focus is actually retained somewhere else. This comes in handy
   * for components like autocomplete where focus must remain on the input.
   */
  get active(): boolean {
    return this._active;
  }

  /**
   * The displayed value of the option. It is necessary to show the selected option in the
   * select's trigger.
   */
  get viewValue(): string {
    // TODO(kara): Add input property alternative for node envs.
    return this._getHostElement().textContent.trim();
  }

  /** Selects the option. */
  select(): void {
    this._selected = true;
    this.onSelect.emit(new MdOptionSelectEvent(this, false));
  }

  /** Deselects the option. */
  deselect(): void {
    this._selected = false;
  }

  /** Sets focus onto this option. */
  focus(): void {
    this._renderer.invokeElementMethod(this._getHostElement(), 'focus');
  }

  /**
   * This method sets display styles on the option to make it appear
   * active. This is used by the ActiveDescendantKeyManager so key
   * events will display the proper options as active on arrow key events.
   */
  setActiveStyles() {
    Promise.resolve(null).then(() => this._active = true);
  }

  /**
   * This method removes display styles on the option that made it appear
   * active. This is used by the ActiveDescendantKeyManager so key
   * events will display the proper options as active on arrow key events.
   */
  setInactiveStyles() {
    Promise.resolve(null).then(() => this._active = false);
  }

  /** Ensures the option is selected when activated from the keyboard. */
  _handleKeydown(event: KeyboardEvent): void {
    if (event.keyCode === ENTER || event.keyCode === SPACE) {
      this._selectViaInteraction();
    }
  }

  /**
   * Selects the option while indicating the selection came from the user. Used to
   * determine if the select's view -> model callback should be invoked.
   */
  _selectViaInteraction() {
    if (!this.disabled) {
      this._selected = true;
      this.onSelect.emit(new MdOptionSelectEvent(this, true));
    }
  }

  /** Returns the correct tabindex for the option depending on disabled state. */
  _getTabIndex() {
    return this.disabled ? '-1' : '0';
  }

  _getHostElement(): HTMLElement {
    return this._element.nativeElement;
  }

}

@NgModule({
  imports: [MdRippleModule, CommonModule],
  exports: [MdOption],
  declarations: [MdOption]
})
export class MdOptionModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdOptionModule,
      providers: []
    };
  }
}
