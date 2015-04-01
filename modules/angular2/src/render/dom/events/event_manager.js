import {isBlank, BaseException, isPresent, StringWrapper} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {VmTurnZone} from 'angular2/src/core/zone/vm_turn_zone';

var BUBBLE_SYMBOL = '^';

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

  addEventListener(element, eventName: string, handler: Function) {
    var shouldSupportBubble = eventName[0] == BUBBLE_SYMBOL; 
    if (shouldSupportBubble) {
      eventName = StringWrapper.substring(eventName, 1); 
    }

    var plugin = this._findPluginFor(eventName);
    plugin.addEventListener(element, eventName, handler, shouldSupportBubble);
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
    throw new BaseException(`No event manager plugin found for event ${eventName}`);
  }
}

export class EventManagerPlugin {
  manager: EventManager;

  // We are assuming here that all plugins support bubbled and non-bubbled events.
  // That is equivalent to having supporting $event.target
  // The bubbling flag (currently ^) is stripped before calling the supports and 
  // addEventListener methods.
  supports(eventName: string): boolean {
    return false;
  }

  addEventListener(element, eventName: string, handler: Function,
      shouldSupportBubble: boolean) {
    throw "not implemented";
  }
}

export class DomEventsPlugin extends EventManagerPlugin {
  manager: EventManager;

  // This plugin should come last in the list of plugins, because it accepts all
  // events.
  supports(eventName: string): boolean {
    return true;
  }

  addEventListener(element, eventName: string, handler: Function,
      shouldSupportBubble: boolean) {
    var outsideHandler = shouldSupportBubble ?
      DomEventsPlugin.bubbleCallback(element, handler, this.manager._zone) :
      DomEventsPlugin.sameElementCallback(element, handler, this.manager._zone);

    this.manager._zone.runOutsideAngular(() => {
      DOM.on(element, eventName, outsideHandler);
    });
  }

  static sameElementCallback(element, handler, zone) {
    return (event) => {
        if (event.target === element) {
          zone.run(() => handler(event));
        }
      };
  }

  static bubbleCallback(element, handler, zone) {
    return (event) => zone.run(() => handler(event));
  }
}
