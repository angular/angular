library angular2.src.platform.dom.events.dom_events;

import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;
import "package:angular2/core.dart"
    show Injectable, EventManagerPlugin, EventManager;

@Injectable()
class DomEventsPlugin extends EventManagerPlugin {
  EventManager manager;
  // This plugin should come last in the list of plugins, because it accepts all

  // events.
  bool supports(String eventName) {
    return true;
  }

  addEventListener(dynamic element, String eventName, Function handler) {
    var zone = this.manager.getZone();
    var outsideHandler = (event) => zone.run(() => handler(event));
    this.manager.getZone().runOutsideAngular(() {
      DOM.on(element, eventName, outsideHandler);
    });
  }

  Function addGlobalEventListener(
      String target, String eventName, Function handler) {
    var element = DOM.getGlobalEventTarget(target);
    var zone = this.manager.getZone();
    var outsideHandler = (event) => zone.run(() => handler(event));
    return this.manager.getZone().runOutsideAngular(() {
      return DOM.onAndCancel(element, eventName, outsideHandler);
    });
  }
}
