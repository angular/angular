import {Component, View, LifecycleEvent, ViewEncapsulation} from 'angular2/angular2';

import {TimerWrapper} from 'angular2/src/core/facade/async';
import {isPresent} from 'angular2/src/core/facade/lang';

// TODO(jelbourn): Ink ripples.
// TODO(jelbourn): Make the `isMosueDown` stuff done with one global listener.

@Component({
  selector: '[md-button]:not(a), [md-fab]:not(a), [md-raised-button]:not(a)',
  host: {
    '(^mousedown)': 'onMousedown()',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '[class.md-button-focus]': 'isKeyboardFocused',
  },
})
@View({
  templateUrl: 'package:angular2_material/src/components/button/button.html',
  encapsulation: ViewEncapsulation.NONE,
})
export class MdButton {
  /** Whether a mousedown has occured on this element in the last 100ms. */
  isMouseDown: boolean = false;

  /** Whether the button has focus from the keyboard (not the mouse). Used for class binding. */
  isKeyboardFocused: boolean = false;

  onMousedown() {
    // We only *show* the focus style when focus has come to the button via the keyboard.
    // The Material Design spec is silent on this topic, and without doing this, the
    // button continues to look :active after clicking.
    // @see http://marcysutton.com/button-focus-hell/
    this.isMouseDown = true;
    TimerWrapper.setTimeout(() => {this.isMouseDown = false}, 100);
  }

  onFocus() {
    this.isKeyboardFocused = !this.isMouseDown;
  }

  onBlur() {
    this.isKeyboardFocused = false;
  }
}


@Component({
  selector: 'a[md-button], a[md-raised-button], a[md-fab]',
  properties: ['disabled'],
  lifecycle: [LifecycleEvent.onChange],
  host: {
    '(^click)': 'onClick($event)',
    '(^mousedown)': 'onMousedown()',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '[tabIndex]': 'tabIndex',
    '[class.md-button-focus]': 'isKeyboardFocused',
    '[attr.aria-disabled]': 'disabled',
  },
})
@View({
  templateUrl: 'package:angular2_material/src/components/button/button.html',
  encapsulation: ViewEncapsulation.NONE
})
export class MdAnchor extends MdButton {
  tabIndex: number;

  /** Whether the component is disabled. */
  disabled_: boolean;

  get disabled(): boolean {
    return this.disabled_;
  }

  set disabled(value) {
    // The presence of *any* disabled value makes the component disabled, *except* for false.
    this.disabled_ = isPresent(value) && this.disabled !== false;
  }

  onClick(event) {
    // A disabled anchor shouldn't navigate anywhere.
    if (this.disabled) {
      event.preventDefault();
    }
  }

  /** Invoked when a change is detected. */
  onChange(_) {
    // A disabled anchor should not be in the tab flow.
    this.tabIndex = this.disabled ? -1 : 0;
  }
}
