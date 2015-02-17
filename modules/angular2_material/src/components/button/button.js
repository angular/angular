import {Component, View} from 'angular2/angular2';
import {PropertySetter, EventEmitter} from 'angular2/src/core/annotations/di';
import {onChange} from 'angular2/src/core/annotations/annotations';
import {isPresent, StringWrapper} from 'angular2/src/facade/lang';


@Component({selector: '[md-button]:not([href])'})
@View({templateUrl: 'angular2_material/src/components/button/button.html'})
export class MdButton {
  // TODO(jelbourn): Ink ripples.
}


@Component({
  selector: '[md-button][href]',
  properties: {
    'disabled': 'disabled'
  },
  hostListeners: {'click': 'onClick($event)'},
  lifecycle: [onChange]
})
@View({
  templateUrl: 'angular2_material/src/components/button/button.html'
})
export class MdAnchor {
  tabIndexSetter: Function;

  /** Whether the component is disabled. */
  disabled: boolean;

  constructor(@PropertySetter('tabIndex') tabIndexSetter: Function) {
    this.tabIndexSetter = tabIndexSetter;
  }

  onClick(event) {
    // A disabled anchor shouldn't navigate anywhere.
    if (isPresent(this.disabled) && this.disabled !== false) {
      event.preventDefault();
    }
  }

  /** Invoked when a change is detected. */
  onChange(_) {
    // A disabled anchor should not be in the tab flow.
    this.tabIndexSetter(this.disabled ? -1 : 0);
  }
}
