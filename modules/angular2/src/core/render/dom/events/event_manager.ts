import {isBlank, BaseException, isPresent, StringWrapper} from 'angular2/src/core/facade/lang';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {NgZone} from 'angular2/src/core/zone/ng_zone';

export class EventManager {
  constructor(public _plugins: EventManagerPlugin[], public _zone: NgZone) {
    for (var i = 0; i < _plugins.length; i++) {
      _plugins[i].manager = this;
    }
  }

  addEventListener(element: HTMLElement, eventName: string, handler: Function) {
    var plugin = this._findPluginFor(eventName);
    plugin.addEventListener(element, eventName, handler);
  }

  addGlobalEventListener(target: string, eventName: string, handler: Function): Function {
    var plugin = this._findPluginFor(eventName);
    return plugin.addGlobalEventListener(target, eventName, handler);
  }

  getZone(): NgZone { return this._zone; }

  _findPluginFor(eventName: string): EventManagerPlugin {
    var plugins = this._plugins;
    for (var i = 0; i < plugins.length; i++) {
      var plugin = plugins[i];
      if (plugin.supports(eventName)) {
        return plugin;
      }
    }
    throw new BaseException(`No event manager plugin found for event ${eventName}`);
  }
}

export class EventManagerPlugin {
  manager: EventManager;

  // That is equivalent to having supporting $event.target
  supports(eventName: string): boolean { return false; }

  addEventListener(element: HTMLElement, eventName: string, handler: Function) {
    throw "not implemented";
  }

  addGlobalEventListener(element: string, eventName: string, handler: Function): Function {
    throw "not implemented";
  }
}

export class DomEventsPlugin extends EventManagerPlugin {
  manager: EventManager;

  // This plugin should come last in the list of plugins, because it accepts all
  // events.
  supports(eventName: string): boolean { return true; }

  addEventListener(element: HTMLElement, eventName: string, handler: Function) {
    var zone = this.manager._zone;
    var outsideHandler = (event) => zone.run(() => handler(event));
    this.manager._zone.runOutsideAngular(() => { DOM.on(element, eventName, outsideHandler); });
  }

  addGlobalEventListener(target: string, eventName: string, handler: Function): Function {
    var element = DOM.getGlobalEventTarget(target);
    var zone = this.manager._zone;
    var outsideHandler = (event) => zone.run(() => handler(event));
    return this.manager._zone.runOutsideAngular(
        () => { return DOM.onAndCancel(element, eventName, outsideHandler); });
  }
}
