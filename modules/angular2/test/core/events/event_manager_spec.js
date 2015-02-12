import {describe, ddescribe, it, iit, xit, xdescribe, expect, beforeEach, el} from 'angular2/test_lib';
import {EventManager, EventManagerPlugin} from 'angular2/src/core/events/event_manager';
import {VmTurnZone} from 'angular2/src/core/zone/vm_turn_zone';
import {List, ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';
import {DOM, Element} from 'angular2/src/facade/dom';

export function main() {
  describe('EventManager', () => {

    it('should delegate event bindings to plugins', () => {
      var element = el('<div></div>');
      var handler = (e) => e;
      var plugin = new FakeEventManagerPlugin(['click']);
      var manager = new EventManager([plugin], new FakeVmTurnZone());
      manager.addEventListener(element, 'click', handler);
      expect(MapWrapper.get(plugin._eventHandlers, 'click')).toBe(handler);
    });

    it('should delegate event bindings to the first plugin supporting the event', () => {
      var element = el('<div></div>');
      var clickHandler = (e) => e;
      var dblClickHandler = (e) => e;
      var plugin1= new FakeEventManagerPlugin(['dblclick']);
      var plugin2 = new FakeEventManagerPlugin(['click', 'dblclick']);
      var manager = new EventManager([plugin1, plugin2], new FakeVmTurnZone());
      manager.addEventListener(element, 'click', clickHandler);
      manager.addEventListener(element, 'dblclick', dblClickHandler);
      expect(MapWrapper.contains(plugin1._eventHandlers, 'click')).toBe(false);
      expect(MapWrapper.get(plugin2._eventHandlers, 'click')).toBe(clickHandler);
      expect(MapWrapper.contains(plugin2._eventHandlers, 'dblclick')).toBe(false);
      expect(MapWrapper.get(plugin1._eventHandlers, 'dblclick')).toBe(dblClickHandler);
    });

    it('should fall back to native events when no plugin can handle the event', () => {
      var element = el('<div></div>');
      var dispatchedEvent = DOM.createMouseEvent('click');
      var receivedEvent = null;
      var handler = (e) => { receivedEvent = e; };
      var plugin = new FakeEventManagerPlugin(['dblclick']);
      var manager = new EventManager([plugin], new FakeVmTurnZone());
      manager.addEventListener(element, 'click', handler);
      DOM.dispatchEvent(element, dispatchedEvent);
      expect(receivedEvent).toBe(dispatchedEvent);
    });
  });
}

class FakeEventManagerPlugin extends EventManagerPlugin {
  _supports: List<string>;
  _eventHandlers: Map;
  constructor(supports: List<string>) {
    super();
    this._supports = supports;
    this._eventHandlers = MapWrapper.create();
  }

  supports(eventName: string): boolean {
    return ListWrapper.contains(this._supports, eventName);
  }

  addEventListener(element: Element, eventName: string, handler: Function) {
    MapWrapper.set(this._eventHandlers, eventName, handler);
  }
}

class FakeVmTurnZone extends VmTurnZone {
  constructor() {
    super({enableLongStackTrace: false});
  }

  run(fn) {
    fn();
  }

  runOutsideAngular(fn) {
    fn();
  }
}
