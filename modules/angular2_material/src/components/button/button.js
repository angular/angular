import {Component, View} from 'angular2/angular2';
import {onChange} from 'angular2/src/core/annotations/annotations';
import {isPresent} from 'angular2/src/facade/lang';


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
  hostProperties: {'tabIndex': 'tabIndex'},
  lifecycle: [onChange]
})
@View({
  templateUrl: 'angular2_material/src/components/button/button.html'
})
export class MdAnchor {
  tabIndex: number;

  /** Whether the component is disabled. */
  disabled: boolean;

  onClick(event) {
    // A disabled anchor shouldn't navigate anywhere.
    if (isPresent(this.disabled) && this.disabled !== false) {
      event.preventDefault();
    }
  }

  /** Invoked when a change is detected. */
  onChange(_) {
    // A disabled anchor should not be in the tab flow.
    this.tabIndex = this.disabled ? -1 : 0;
  }
}
