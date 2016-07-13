import {
  Component,
  ViewEncapsulation,
  Input,
  HostBinding,
  ChangeDetectionStrategy,
  ElementRef,
  Renderer,
  Type,
} from '@angular/core';

// TODO(jelbourn): Ink ripples.
// TODO(jelbourn): Make the `isMouseDown` stuff done with one global listener.
// TODO(kara): Convert attribute selectors to classes when attr maps become available


@Component({
  moduleId: module.id,
  selector: 'button[md-button], button[md-raised-button], button[md-icon-button], ' +
            'button[md-fab], button[md-mini-fab]',
  inputs: ['color'],
  host: {
    '[class.md-button-focus]': '_isKeyboardFocused',
    '(mousedown)': '_setMousedown()',
    '(focus)': '_setKeyboardFocus()',
    '(blur)': '_removeKeyboardFocus()',
  },
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdButton {
  private _color: string;

  /** Whether the button has focus from the keyboard (not the mouse). Used for class binding. */
  _isKeyboardFocused: boolean = false;

  /** Whether a mousedown has occurred on this element in the last 100ms. */
  _isMouseDown: boolean = false;

  constructor(private _elementRef: ElementRef, private _renderer: Renderer) { }

  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this._updateColor(value);
  }

  _setMousedown() {
    // We only *show* the focus style when focus has come to the button via the keyboard.
    // The Material Design spec is silent on this topic, and without doing this, the
    // button continues to look :active after clicking.
    // @see http://marcysutton.com/button-focus-hell/
    this._isMouseDown = true;
    setTimeout(() => { this._isMouseDown = false; }, 100);
  }

  _updateColor(newColor: string) {
    this._setElementColor(this._color, false);
    this._setElementColor(newColor, true);
    this._color = newColor;
  }

  _setElementColor(color: string, isAdd: boolean) {
    if (color != null && color != '') {
      this._renderer.setElementClass(this._elementRef.nativeElement, `md-${color}`, isAdd);
    }
  }

  _setKeyboardFocus() {
    this._isKeyboardFocused = !this._isMouseDown;
  }

  _removeKeyboardFocus() {
    this._isKeyboardFocused = false;
  }

  /** TODO(hansl): e2e test this function. */
  focus() {
    this._elementRef.nativeElement.focus();
  }
}

@Component({
  moduleId: module.id,
  selector: 'a[md-button], a[md-raised-button], a[md-icon-button], a[md-fab], a[md-mini-fab]',
  inputs: ['color'],
  host: {
    '[class.md-button-focus]': '_isKeyboardFocused',
    '(mousedown)': '_setMousedown()',
    '(focus)': '_setKeyboardFocus()',
    '(blur)': '_removeKeyboardFocus()',
    '(click)': '_haltDisabledEvents($event)',
  },
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdAnchor extends MdButton {
  _disabled: boolean = null;

  constructor(elementRef: ElementRef, renderer: Renderer) {
    super(elementRef, renderer);
  }

  @HostBinding('tabIndex')
  get tabIndex(): number {
    return this.disabled ? -1 : 0;
  }

  @HostBinding('attr.aria-disabled')
  /** Gets the aria-disabled value for the component, which must be a string for Dart. */
  get isAriaDisabled(): string {
    return this.disabled ? 'true' : 'false';
  }

  @HostBinding('attr.disabled')
  @Input('disabled')
  get disabled() { return this._disabled; }

  set disabled(value: boolean) {
    // The presence of *any* disabled value makes the component disabled, *except* for false.
    this._disabled = (value != null && value != false) ? true : null;
  }

  _haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}


export const MD_BUTTON_DIRECTIVES: Type[] = [MdButton, MdAnchor];
