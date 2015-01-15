import {EventManagerPlugin} from './event_manager';
import {DOM, Element} from 'facade/dom';
import {isPresent} from 'facade/lang';
import {ListWrapper} from 'facade/collection';

export class HammerGesturesPlugin extends EventManagerPlugin {
  isEnabled(): boolean {
    return isPresent(window.Hammer);
  }

  supports(eventName: string) {
    var eventNames = ['swipe', 'tap', 'pinch', 'rotate'];

    return ListWrapper.any(eventNames, (name) => name === eventName);
  }

  addEventListener(element: Element, eventName: string, handler: Function) {
    var zone = this.manager.zone;

    zone.runOutsideAngular(function() {
      // TODO(vicb): max 1 manager per element
      // Creating the manager bind events, must be done outside of angular
      var mc = new Hammer(element);

      mc.on(eventName, function(eventObj) {
        zone.run(function() {
          handler(eventObj);
        });
      });
    });
  }
}
