import {bootstrap} from 'angular2/angular2';
import {KeyEventsPlugin} from 'angular2/src/render/dom/events/key_events';

// TODO(radokirov): Once the application is transpiled by TS instead of Traceur,
// add those imports back into 'angular2/angular2';
import {Component} from 'angular2/src/core/annotations_impl/annotations';
import {View} from 'angular2/src/core/annotations_impl/view';

// 2 imports for the Dart version:
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

@Component({
  selector: 'key-events-app'
})
@View({
  template: `Click in the following area and press a key to display its name:<br>
  <div (keydown)="onKeyDown($event)" class="sample-area" tabindex="0">{{lastKey}}</div><br>
  Click in the following area and press shift.enter:<br>
  <div
    (keydown.shift.enter)="onShiftEnter($event)"
    (click)="resetShiftEnter()"
    class="sample-area"
    tabindex="0"
  >{{shiftEnter ? 'You pressed shift.enter!' : ''}}</div>`
})
class KeyEventsApp {
  lastKey: string;
  shiftEnter: boolean;

  constructor() {
    this.lastKey = '(none)';
    this.shiftEnter = false;
  }

  onKeyDown(event) {
    this.lastKey = KeyEventsPlugin.getEventFullKey(event);
    event.preventDefault();
  }

  onShiftEnter(event) {
    this.shiftEnter = true;
    event.preventDefault();
  }

  resetShiftEnter() {
    this.shiftEnter = false;
  }

}

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities(); // for the Dart version
  bootstrap(KeyEventsApp);
}
