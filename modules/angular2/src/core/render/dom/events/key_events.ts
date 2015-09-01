import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {
  isPresent,
  isBlank,
  StringWrapper,
  RegExpWrapper,
  BaseException,
  NumberWrapper
} from 'angular2/src/core/facade/lang';
import {StringMapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
import {EventManagerPlugin} from './event_manager';
import {NgZone} from 'angular2/src/core/zone/ng_zone';

var modifierKeys = ['alt', 'control', 'meta', 'shift'];
var modifierKeyGetters: StringMap<string, Function> = {
  'alt': (event) => event.altKey,
  'control': (event) => event.ctrlKey,
  'meta': (event) => event.metaKey,
  'shift': (event) => event.shiftKey
};

export class KeyEventsPlugin extends EventManagerPlugin {
  constructor() { super(); }

  supports(eventName: string): boolean {
    return isPresent(KeyEventsPlugin.parseEventName(eventName));
  }

  addEventListener(element: HTMLElement, eventName: string, handler: (Event: any) => any) {
    var parsedEvent = KeyEventsPlugin.parseEventName(eventName);

    var outsideHandler = KeyEventsPlugin.eventCallback(
        element, StringMapWrapper.get(parsedEvent, 'fullKey'), handler, this.manager.getZone());

    this.manager.getZone().runOutsideAngular(() => {
      DOM.on(element, StringMapWrapper.get(parsedEvent, 'domEventName'), outsideHandler);
    });
  }

  static parseEventName(eventName: string): StringMap<string, string> {
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
    var result = StringMapWrapper.create();
    StringMapWrapper.set(result, 'domEventName', domEventName);
    StringMapWrapper.set(result, 'fullKey', fullKey);
    return result;
  }

  static getEventFullKey(event: Event): string {
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

  static eventCallback(element: HTMLElement, fullKey: any, handler: (Event) => any, zone: NgZone):
      (event: Event) => void {
    return (event) => {
      if (StringWrapper.equals(KeyEventsPlugin.getEventFullKey(event), fullKey)) {
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
