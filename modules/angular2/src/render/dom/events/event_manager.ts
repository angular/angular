import {isBlank, BaseException, isPresent, StringWrapper} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {NgZone} from 'angular2/src/core/zone/ng_zone';

var BUBBLE_SYMBOL = '^';

export class EventManager {
  constructor(public _plugins: List<EventManagerPlugin>, public _zone: NgZone) {
    for (var i = 0; i < _plugins.length; i++) {
      _plugins[i].manager = this;
    }
  }

  addEventListener(element, eventName: string, handler: Function) {
    var withoutBubbleSymbol = this._removeBubbleSymbol(eventName);
    var plugin = this._findPluginFor(withoutBubbleSymbol);
    plugin.addEventListener(element, withoutBubbleSymbol, handler,
                            withoutBubbleSymbol != eventName);
  }

  addGlobalEventListener(target: string, eventName: string, handler: Function): Function {
    var withoutBubbleSymbol = this._removeBubbleSymbol(eventName);
    var plugin = this._findPluginFor(withoutBubbleSymbol);
    return plugin.addGlobalEventListener(target, withoutBubbleSymbol, handler,
                                         withoutBubbleSymbol != eventName);
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

  _removeBubbleSymbol(eventName: string): string {
    return eventName[0] == BUBBLE_SYMBOL ? StringWrapper.substring(eventName, 1) : eventName;
  }
}

export class EventManagerPlugin {
  manager: EventManager;

  // We are assuming here that all plugins support bubbled and non-bubbled events.
  // That is equivalent to having supporting $event.target
  // The bubbling flag (currently ^) is stripped before calling the supports and
  // addEventListener methods.
  supports(eventName: string): boolean { return false; }

  addEventListener(element, eventName: string, handler: Function, shouldSupportBubble: boolean) {
    throw "not implemented";
  }

  addGlobalEventListener(element, eventName: string, handler: Function,
                         shouldSupportBubble: boolean): Function {
    throw "not implemented";
  }
}

export class DomEventsPlugin extends EventManagerPlugin {
  manager: EventManager;

  // This plugin should come last in the list of plugins, because it accepts all
  // events.
  supports(eventName: string): boolean { return true; }

  addEventListener(element, eventName: string, handler: Function, shouldSupportBubble: boolean) {
    var outsideHandler =
        this._getOutsideHandler(shouldSupportBubble, element, handler, this.manager._zone);
    this.manager._zone.runOutsideAngular(() => { DOM.on(element, eventName, outsideHandler); });
  }

  addGlobalEventListener(target: string, eventName: string, handler: Function,
                         shouldSupportBubble: boolean): Function {
    var element = DOM.getGlobalEventTarget(target);
    var outsideHandler =
        this._getOutsideHandler(shouldSupportBubble, element, handler, this.manager._zone);
    return this.manager._zone.runOutsideAngular(
        () => { return DOM.onAndCancel(element, eventName, outsideHandler); });
  }

  _getOutsideHandler(shouldSupportBubble: boolean, element, handler: Function, zone: NgZone) {
    return shouldSupportBubble ? DomEventsPlugin.bubbleCallback(element, handler, zone) :
                                 DomEventsPlugin.sameElementCallback(element, handler, zone);
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
