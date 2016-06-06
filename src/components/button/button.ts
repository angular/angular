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
    '[class.md-button-focus]': 'isKeyboardFocused',
    '(mousedown)': 'setMousedown()',
    '(focus)': 'setKeyboardFocus()',
    '(blur)': 'removeKeyboardFocus()',
  },
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdButton {
  private _color: string;

  /** Whether the button has focus from the keyboard (not the mouse). Used for class binding. */
  isKeyboardFocused: boolean = false;

  /** Whether a mousedown has occurred on this element in the last 100ms. */
  isMouseDown: boolean = false;

  constructor(private elementRef: ElementRef, private renderer: Renderer) { }

  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this._updateColor(value);
  }

  /** @internal */
  setMousedown() {
    // We only *show* the focus style when focus has come to the button via the keyboard.
    // The Material Design spec is silent on this topic, and without doing this, the
    // button continues to look :active after clicking.
    // @see http://marcysutton.com/button-focus-hell/
    this.isMouseDown = true;
    setTimeout(() => { this.isMouseDown = false; }, 100);
  }

  _updateColor(newColor: string) {
    this._setElementColor(this._color, false);
    this._setElementColor(newColor, true);
    this._color = newColor;
  }

  _setElementColor(color: string, isAdd: boolean) {
    if (color != null && color != '') {
      this.renderer.setElementClass(this.elementRef.nativeElement, `md-${color}`, isAdd);
    }
  }

  /** @internal */
  setKeyboardFocus() {
    this.isKeyboardFocused = !this.isMouseDown;
  }

  /** @internal */
  removeKeyboardFocus() {
    this.isKeyboardFocused = false;
  }

  /** TODO(hansl): e2e test this function. */
  focus() {
    this.elementRef.nativeElement.focus();
  }
}

@Component({
  moduleId: module.id,
  selector: 'a[md-button], a[md-raised-button], a[md-icon-button], a[md-fab], a[md-mini-fab]',
  inputs: ['color'],
  host: {
    '[class.md-button-focus]': 'isKeyboardFocused',
    '(mousedown)': 'setMousedown()',
    '(focus)': 'setKeyboardFocus()',
    '(blur)': 'removeKeyboardFocus()',
    '(click)': 'haltDisabledEvents($event)',
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

  /** @internal */
  haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}


export const MD_BUTTON_DIRECTIVES: Type[] = [MdButton, MdAnchor];
