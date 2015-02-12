import {isBlank, BaseException, isPresent} from 'angular2/src/facade/lang';
import {DOM, Element} from 'angular2/src/facade/dom';
import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {VmTurnZone} from 'angular2/src/core/zone/vm_turn_zone';

export class EventManager {
  _plugins: List<EventManagerPlugin>;
  _zone: VmTurnZone;

  constructor(plugins: List<EventManagerPlugin>, zone: VmTurnZone) {
    this._zone = zone;
    this._plugins = plugins;
    for (var i = 0; i < plugins.length; i++) {
      plugins[i].manager = this;
    }
  }

  addEventListener(element: Element, eventName: string, handler: Function) {
    var plugin = this._findPluginFor(eventName);

    if (isPresent(plugin)) {
      plugin.addEventListener(element, eventName, handler);
    } else {
      this._addNativeEventListener(element, eventName, handler);
    }
  }

  getZone(): VmTurnZone {
    return this._zone;
  }

  _findPluginFor(eventName: string): EventManagerPlugin {
    var plugins = this._plugins;
    for (var i = 0; i < plugins.length; i++) {
      var plugin = plugins[i];
      if (plugin.supports(eventName)) {
        return plugin;
      }
    }
    return null;
  }

  _addNativeEventListener(element: Element, eventName: string, handler: Function) {
    this._zone.runOutsideAngular(() => {
      DOM.on(element, eventName, (event) => {
        if (event.target === element) {
          this._zone.run(function() {
            handler(event);
          });
        }
      });
    });
  }
}

export class EventManagerPlugin {
  manager: EventManager;

  supports(eventName: string): boolean {
    return false;
  }

  addEventListener(element: Element, eventName: string, handler: Function) {
    throw "not implemented";
  }
}
