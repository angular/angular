import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {Injectable} from 'angular2/core';
import {EventManagerPlugin, EventManager} from './event_manager';

@Injectable()
export class DomEventsPlugin extends EventManagerPlugin {
  // This plugin should come last in the list of plugins, because it accepts all
  // events.
  supports(eventName: string): boolean { return true; }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    var zone = this.manager.getZone();
    var outsideHandler = (event) => zone.runGuarded(() => handler(event));
    return this.manager.getZone().runOutsideAngular(
        () => DOM.onAndCancel(element, eventName, outsideHandler));
  }

  addGlobalEventListener(target: string, eventName: string, handler: Function): Function {
    var element = DOM.getGlobalEventTarget(target);
    var zone = this.manager.getZone();
    var outsideHandler = (event) => zone.runGuarded(() => handler(event));
    return this.manager.getZone().runOutsideAngular(
        () => DOM.onAndCancel(element, eventName, outsideHandler));
  }
}
