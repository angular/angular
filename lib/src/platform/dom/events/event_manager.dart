library angular2.src.platform.dom.events.event_manager;

import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/core/di.dart" show Injectable, Inject, OpaqueToken;
import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;
import "package:angular2/src/facade/collection.dart" show ListWrapper;

const OpaqueToken EVENT_MANAGER_PLUGINS =
    const OpaqueToken("EventManagerPlugins");

@Injectable()
class EventManager {
  NgZone _zone;
  List<EventManagerPlugin> _plugins;
  EventManager(@Inject(EVENT_MANAGER_PLUGINS) List<EventManagerPlugin> plugins,
      this._zone) {
    plugins.forEach((p) => p.manager = this);
    this._plugins = ListWrapper.reversed(plugins);
  }
  addEventListener(dynamic element, String eventName, Function handler) {
    var plugin = this._findPluginFor(eventName);
    plugin.addEventListener(element, eventName, handler);
  }

  Function addGlobalEventListener(
      String target, String eventName, Function handler) {
    var plugin = this._findPluginFor(eventName);
    return plugin.addGlobalEventListener(target, eventName, handler);
  }

  NgZone getZone() {
    return this._zone;
  }

  /** @internal */
  EventManagerPlugin _findPluginFor(String eventName) {
    var plugins = this._plugins;
    for (var i = 0; i < plugins.length; i++) {
      var plugin = plugins[i];
      if (plugin.supports(eventName)) {
        return plugin;
      }
    }
    throw new BaseException(
        '''No event manager plugin found for event ${ eventName}''');
  }
}

class EventManagerPlugin {
  EventManager manager;
  // That is equivalent to having supporting $event.target
  bool supports(String eventName) {
    return false;
  }

  addEventListener(dynamic element, String eventName, Function handler) {
    throw "not implemented";
  }

  Function addGlobalEventListener(
      String element, String eventName, Function handler) {
    throw "not implemented";
  }
}
