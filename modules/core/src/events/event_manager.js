import {isBlank, BaseException, isPresent} from 'facade/lang';
import {Element} from 'facade/dom';
import {List, ListWrapper, MapWrapper} from 'facade/collection';
import {VmTurnZone} from 'core/zone/vm_turn_zone';

export class EventManager {
  plugins: List<EventManagerPlugin>;
  zone: VmTurnZone;

  constructor(plugins: List<EventManagerPlugin>, zone: VmTurnZone) {
    this.zone = zone;
    this.plugins = ListWrapper.create();

    for (var i = 0; i < plugins.length; i++) {
      var plugin = ListWrapper.get(plugins, i);
      if (plugin.isEnabled()) {
        plugin.manager = this;
        ListWrapper.push(this.plugins, plugin);
      }
    }
  }

  addEventListener(element: Element, eventName: string, handler: Function) {
    var plugin = this._findPluginFor(eventName);

    if (isBlank(plugin)) {
      throw new BaseException(`no plugin found to handle the ${eventName} event`);
    }

    plugin.addEventListener(element, eventName, handler);
  }

  _findPluginFor(eventName: string): EventManagerPlugin {
    var plugins = this.plugins;
    for (var i = 0; i < plugins.length; i++) {
      var plugin = plugins[i];
      if (plugin.supports(eventName)) {
        return plugin;
      }
    }
    return null;
  }
}

export class EventManagerPlugin {
  manager: EventManager;

  isEnabled(): boolean {
    return true;
  }

  supports(eventName: string): boolean {
    return false;
  }

  addEventListener(element: Element, eventName: string, handler: Function) {
    throw "not implemented";
  }
}
