import {
  describe,
  ddescribe,
  it,
  iit,
  xit,
  xdescribe,
  expect,
  beforeEach,
  el
} from 'angular2/test_lib';
import {
  EventManager,
  EventManagerPlugin,
  DomEventsPlugin
} from 'angular2/src/render/dom/events/event_manager';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {List, ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';

export function main() {
  var domEventPlugin;

  beforeEach(() => { domEventPlugin = new DomEventsPlugin(); });

  describe('EventManager', () => {

    it('should delegate event bindings to plugins', () => {
      var element = el('<div></div>');
      var handler = (e) => e;
      var plugin = new FakeEventManagerPlugin(['click']);
      var manager = new EventManager([plugin, domEventPlugin], new FakeNgZone());
      manager.addEventListener(element, 'click', handler);
      expect(MapWrapper.get(plugin._nonBubbleEventHandlers, 'click')).toBe(handler);
    });

    it('should delegate bubbling events to plugins', () => {
      var element = el('<div></div>');
      var handler = (e) => e;
      var plugin = new FakeEventManagerPlugin(['click']);
      var manager = new EventManager([plugin, domEventPlugin], new FakeNgZone());
      manager.addEventListener(element, '^click', handler);
      expect(MapWrapper.get(plugin._bubbleEventHandlers, 'click')).toBe(handler);
    });

    it('should delegate event bindings to the first plugin supporting the event', () => {
      var element = el('<div></div>');
      var clickHandler = (e) => e;
      var dblClickHandler = (e) => e;
      var plugin1 = new FakeEventManagerPlugin(['dblclick']);
      var plugin2 = new FakeEventManagerPlugin(['click', 'dblclick']);
      var manager = new EventManager([plugin1, plugin2], new FakeNgZone());
      manager.addEventListener(element, 'click', clickHandler);
      manager.addEventListener(element, 'dblclick', dblClickHandler);
      expect(MapWrapper.contains(plugin1._nonBubbleEventHandlers, 'click')).toBe(false);
      expect(MapWrapper.get(plugin2._nonBubbleEventHandlers, 'click')).toBe(clickHandler);
      expect(MapWrapper.contains(plugin2._nonBubbleEventHandlers, 'dblclick')).toBe(false);
      expect(MapWrapper.get(plugin1._nonBubbleEventHandlers, 'dblclick')).toBe(dblClickHandler);
    });

    it('should throw when no plugin can handle the event', () => {
      var element = el('<div></div>');
      var plugin = new FakeEventManagerPlugin(['dblclick']);
      var manager = new EventManager([plugin], new FakeNgZone());
      expect(() => manager.addEventListener(element, 'click', null))
          .toThrowError('No event manager plugin found for event click');
    });

    it('by default events are only caught on same element', () => {
      var element = el('<div><div></div></div>');
      var child = DOM.firstChild(element);
      var dispatchedEvent = DOM.createMouseEvent('click');
      var receivedEvent = null;
      var handler = (e) => { receivedEvent = e; };
      var manager = new EventManager([domEventPlugin], new FakeNgZone());
      manager.addEventListener(element, 'click', handler);
      DOM.dispatchEvent(child, dispatchedEvent);

      expect(receivedEvent).toBe(null);
    });

    it('bubbled events are caught when fired from a child', () => {
      var element = el('<div><div></div></div>');
      // Workaround for https://bugs.webkit.org/show_bug.cgi?id=122755
      DOM.appendChild(DOM.defaultDoc().body, element);

      var child = DOM.firstChild(element);
      var dispatchedEvent = DOM.createMouseEvent('click');
      var receivedEvent = null;
      var handler = (e) => { receivedEvent = e; };
      var manager = new EventManager([domEventPlugin], new FakeNgZone());
      manager.addEventListener(element, '^click', handler);
      DOM.dispatchEvent(child, dispatchedEvent);

      expect(receivedEvent).toBe(dispatchedEvent);
    });

    it('should add and remove global event listeners with correct bubbling', () => {
      var element = el('<div><div></div></div>');
      DOM.appendChild(DOM.defaultDoc().body, element);
      var dispatchedEvent = DOM.createMouseEvent('click');
      var receivedEvent = null;
      var handler = (e) => { receivedEvent = e; };
      var manager = new EventManager([domEventPlugin], new FakeNgZone());

      var remover = manager.addGlobalEventListener("document", '^click', handler);
      DOM.dispatchEvent(element, dispatchedEvent);
      expect(receivedEvent).toBe(dispatchedEvent);

      receivedEvent = null;
      remover();
      DOM.dispatchEvent(element, dispatchedEvent);
      expect(receivedEvent).toBe(null);

      remover = manager.addGlobalEventListener("document", 'click', handler);
      DOM.dispatchEvent(element, dispatchedEvent);
      expect(receivedEvent).toBe(null);
    });
  });
}

class FakeEventManagerPlugin extends EventManagerPlugin {
  _supports: List<string>;
  _nonBubbleEventHandlers: Map<string, Function>;
  _bubbleEventHandlers: Map<string, Function>;
  constructor(supports: List<string>) {
    super();
    this._supports = supports;
    this._nonBubbleEventHandlers = MapWrapper.create();
    this._bubbleEventHandlers = MapWrapper.create();
  }

  supports(eventName: string): boolean { return ListWrapper.contains(this._supports, eventName); }

  addEventListener(element, eventName: string, handler: Function, shouldSupportBubble: boolean) {
    MapWrapper.set(shouldSupportBubble ? this._bubbleEventHandlers : this._nonBubbleEventHandlers,
                   eventName, handler);
    return () => {
      MapWrapper.delete(
          shouldSupportBubble ? this._bubbleEventHandlers : this._nonBubbleEventHandlers, eventName)
    };
  }
}

class FakeNgZone extends NgZone {
  constructor() { super({enableLongStackTrace: false}); }

  run(fn) { fn(); }

  runOutsideAngular(fn) { return fn(); }
}
