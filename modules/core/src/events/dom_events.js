import {EventManagerPlugin} from './event_manager';
import {DOM, Element} from 'facade/dom';

export class DomEventsPlugin extends EventManagerPlugin {
  isEnabled(): boolean {
    return true;
  }

  supports(eventName: string): boolean {
    return true;
  }

  addEventListener(element: Element, eventName: string, handler: Function) {
    var zone = this.manager.zone;

    zone.runOutsideAngular(function() {
      DOM.on(element, eventName, function(event) {
        if (event.target === element) {
          zone.run(function() {
            handler(event);
          });
        }
      });
    });
  }
}
