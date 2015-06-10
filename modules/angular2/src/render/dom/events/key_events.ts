import {DOM} from 'angular2/src/dom/dom_adapter';
import {
  isPresent,
  isBlank,
  StringWrapper,
  RegExpWrapper,
  BaseException,
  NumberWrapper
} from 'angular2/src/facade/lang';
import {StringMapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {EventManagerPlugin} from './event_manager';

var modifierKeys = ['alt', 'control', 'meta', 'shift'];
var modifierKeyGetters: StringMap<string, Function> =
    {
      'alt': (event) => event.altKey,
      'control': (event) => event.ctrlKey,
      'meta': (event) => event.metaKey,
      'shift': (event) => event.shiftKey
    }

export class KeyEventsPlugin extends EventManagerPlugin {
  constructor() { super(); }

  supports(eventName: string): boolean {
    return isPresent(KeyEventsPlugin.parseEventName(eventName));
  }

  addEventListener(element, eventName: string, handler: Function, shouldSupportBubble: boolean) {
    var parsedEvent = KeyEventsPlugin.parseEventName(eventName);

    var outsideHandler = KeyEventsPlugin.eventCallback(element, shouldSupportBubble,
                                                       StringMapWrapper.get(parsedEvent, 'fullKey'),
                                                       handler, this.manager.getZone());

    this.manager.getZone().runOutsideAngular(() => {
      DOM.on(element, StringMapWrapper.get(parsedEvent, 'domEventName'), outsideHandler);
    });
  }

  static parseEventName(eventName: string) /* {'domEventName': string, 'fullKey': string} */ {
    var parts = eventName.toLowerCase().split('.');

    var domEventName = ListWrapper.removeAt(parts, 0);
    if ((parts.length === 0) ||
        !(StringWrapper.equals(domEventName, 'keydown') ||
          StringWrapper.equals(domEventName, 'keyup'))) {
      return null;
    }

    var key = KeyEventsPlugin._normalizeKey(ListWrapper.removeLast(parts));

    var fullKey = '';
    ListWrapper.forEach(modifierKeys, (modifierName) => {
      if (ListWrapper.contains(parts, modifierName)) {
        ListWrapper.remove(parts, modifierName);
        fullKey += modifierName + '.';
      }
    });
    fullKey += key;

    if (parts.length != 0 || key.length === 0) {
      // returning null instead of throwing to let another plugin process the event
      return null;
    }

    return {'domEventName': domEventName, 'fullKey': fullKey};
  }

  static getEventFullKey(event): string {
    var fullKey = '';
    var key = DOM.getEventKey(event);
    key = key.toLowerCase();
    if (StringWrapper.equals(key, ' ')) {
      key = 'space';  // for readability
    } else if (StringWrapper.equals(key, '.')) {
      key = 'dot';  // because '.' is used as a separator in event names
    }
    ListWrapper.forEach(modifierKeys, (modifierName) => {
      if (modifierName != key) {
        var modifierGetter = StringMapWrapper.get(modifierKeyGetters, modifierName);
        if (modifierGetter(event)) {
          fullKey += modifierName + '.';
        }
      }
    });
    fullKey += key;
    return fullKey;
  }

  static eventCallback(element, shouldSupportBubble, fullKey, handler, zone) {
    return (event) => {
      var correctElement = shouldSupportBubble || event.target === element;
      if (correctElement && StringWrapper.equals(KeyEventsPlugin.getEventFullKey(event), fullKey)) {
        zone.run(() => handler(event));
      }
    };
  }

  static _normalizeKey(keyName: string): string {
    // TODO: switch to a StringMap if the mapping grows too much
    switch (keyName) {
      case 'esc':
        return 'escape';
      default:
        return keyName;
    }
  }
}
