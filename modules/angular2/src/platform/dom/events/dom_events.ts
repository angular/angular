import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {Injectable} from 'angular2/core';
import {EventManagerPlugin, EventManager} from './event_manager';

@Injectable()
export class DomEventsPlugin extends EventManagerPlugin {
  manager: EventManager;

  // This plugin should come last in the list of plugins, because it accepts all
  // events.
  supports(eventName: string): boolean { return true; }

  addEventListener(element: HTMLElement, eventName: string, handler: Function) {
    var zone = this.manager.getZone();
    var outsideHandler = (event) => zone.run(() => handler(event));
    this.manager.getZone().runOutsideAngular(() => { DOM.on(element, eventName, outsideHandler); });
  }

  addGlobalEventListener(target: string, eventName: string, handler: Function): Function {
    var element = DOM.getGlobalEventTarget(target);
    var zone = this.manager.getZone();
    var outsideHandler = (event) => zone.run(() => handler(event));
    return this.manager.getZone().runOutsideAngular(
        () => { return DOM.onAndCancel(element, eventName, outsideHandler); });
  }
}
