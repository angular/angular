library angular2.src.core.render.dom.events.key_events;

import "dart:html";
import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, StringWrapper, RegExpWrapper, NumberWrapper;
import "package:angular2/src/facade/collection.dart"
    show StringMapWrapper, ListWrapper;
import "event_manager.dart" show EventManagerPlugin;
import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;
import "package:angular2/src/core/di.dart" show Injectable;

var modifierKeys = ["alt", "control", "meta", "shift"];
Map<String,
    dynamic /* (event: KeyboardEvent) => boolean */ > modifierKeyGetters = {
  "alt": (KeyboardEvent event) => event.altKey,
  "control": (KeyboardEvent event) => event.ctrlKey,
  "meta": (KeyboardEvent event) => event.metaKey,
  "shift": (KeyboardEvent event) => event.shiftKey
};

@Injectable()
class KeyEventsPlugin extends EventManagerPlugin {
  KeyEventsPlugin() : super() {
    /* super call moved to initializer */;
  }
  bool supports(String eventName) {
    return isPresent(KeyEventsPlugin.parseEventName(eventName));
  }

  addEventListener(dynamic element, String eventName,
      dynamic /* (Event: any) => any */ handler) {
    var parsedEvent = KeyEventsPlugin.parseEventName(eventName);
    var outsideHandler = KeyEventsPlugin.eventCallback(
        element,
        StringMapWrapper.get(parsedEvent, "fullKey"),
        handler,
        this.manager.getZone());
    this.manager.getZone().runOutsideAngular(() {
      DOM.on(element, StringMapWrapper.get(parsedEvent, "domEventName"),
          outsideHandler);
    });
  }

  static Map<String, String> parseEventName(String eventName) {
    List<String> parts = eventName.toLowerCase().split(".");
    var domEventName = parts.removeAt(0);
    if ((identical(parts.length, 0)) ||
        !(StringWrapper.equals(domEventName, "keydown") ||
            StringWrapper.equals(domEventName, "keyup"))) {
      return null;
    }
    var key = KeyEventsPlugin._normalizeKey(parts.removeLast());
    var fullKey = "";
    modifierKeys.forEach((modifierName) {
      if (ListWrapper.contains(parts, modifierName)) {
        ListWrapper.remove(parts, modifierName);
        fullKey += modifierName + ".";
      }
    });
    fullKey += key;
    if (parts.length != 0 || identical(key.length, 0)) {
      // returning null instead of throwing to let another plugin process the event
      return null;
    }
    var result = StringMapWrapper.create();
    StringMapWrapper.set(result, "domEventName", domEventName);
    StringMapWrapper.set(result, "fullKey", fullKey);
    return result;
  }

  static String getEventFullKey(KeyboardEvent event) {
    var fullKey = "";
    var key = DOM.getEventKey(event);
    key = key.toLowerCase();
    if (StringWrapper.equals(key, " ")) {
      key = "space";
    } else if (StringWrapper.equals(key, ".")) {
      key = "dot";
    }
    modifierKeys.forEach((modifierName) {
      if (modifierName != key) {
        var modifierGetter =
            StringMapWrapper.get(modifierKeyGetters, modifierName);
        if (modifierGetter(event)) {
          fullKey += modifierName + ".";
        }
      }
    });
    fullKey += key;
    return fullKey;
  }

  static dynamic /* (event: KeyboardEvent) => void */ eventCallback(
      dynamic element,
      dynamic fullKey,
      dynamic /* (e: Event) => any */ handler,
      NgZone zone) {
    return (event) {
      if (StringWrapper.equals(
          KeyEventsPlugin.getEventFullKey(event), fullKey)) {
        zone.run(() => handler(event));
      }
    };
  }

  /** @internal */
  static String _normalizeKey(String keyName) {
    // TODO: switch to a StringMap if the mapping grows too much
    switch (keyName) {
      case "esc":
        return "escape";
      default:
        return keyName;
    }
  }
}
