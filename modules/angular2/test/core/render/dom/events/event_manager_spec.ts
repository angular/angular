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
} from 'angular2/src/core/render/dom/events/event_manager';
import {NgZone, NgZone_} from 'angular2/src/core/zone/ng_zone';
import {ListWrapper, Map, MapWrapper} from 'angular2/src/core/facade/collection';
import {DOM} from 'angular2/src/core/dom/dom_adapter';

export function main() {
  var domEventPlugin;

  beforeEach(() => { domEventPlugin = new DomEventsPlugin(); });

  describe('EventManager', () => {

    it('should delegate event bindings to plugins that are passed in from the most generic one to the most specific one',
       () => {
         var element = el('<div></div>');
         var handler = (e) => e;
         var plugin = new FakeEventManagerPlugin(['click']);
         var manager = new EventManager([domEventPlugin, plugin], new FakeNgZone());
         manager.addEventListener(element, 'click', handler);
         expect(plugin._eventHandler.get('click')).toBe(handler);
       });

    it('should delegate event bindings to the first plugin supporting the event', () => {
      var element = el('<div></div>');
      var clickHandler = (e) => e;
      var dblClickHandler = (e) => e;
      var plugin1 = new FakeEventManagerPlugin(['dblclick']);
      var plugin2 = new FakeEventManagerPlugin(['click', 'dblclick']);
      var manager = new EventManager([plugin2, plugin1], new FakeNgZone());
      manager.addEventListener(element, 'click', clickHandler);
      manager.addEventListener(element, 'dblclick', dblClickHandler);
      expect(plugin1._eventHandler.has('click')).toBe(false);
      expect(plugin2._eventHandler.get('click')).toBe(clickHandler);
      expect(plugin2._eventHandler.has('dblclick')).toBe(false);
      expect(plugin1._eventHandler.get('dblclick')).toBe(dblClickHandler);
    });

    it('should throw when no plugin can handle the event', () => {
      var element = el('<div></div>');
      var plugin = new FakeEventManagerPlugin(['dblclick']);
      var manager = new EventManager([plugin], new FakeNgZone());
      expect(() => manager.addEventListener(element, 'click', null))
          .toThrowError('No event manager plugin found for event click');
    });

    it('events are caught when fired from a child', () => {
      var element = el('<div><div></div></div>');
      // Workaround for https://bugs.webkit.org/show_bug.cgi?id=122755
      DOM.appendChild(DOM.defaultDoc().body, element);

      var child = DOM.firstChild(element);
      var dispatchedEvent = DOM.createMouseEvent('click');
      var receivedEvent = null;
      var handler = (e) => { receivedEvent = e; };
      var manager = new EventManager([domEventPlugin], new FakeNgZone());
      manager.addEventListener(element, 'click', handler);
      DOM.dispatchEvent(child, dispatchedEvent);

      expect(receivedEvent).toBe(dispatchedEvent);
    });

    it('should add and remove global event listeners', () => {
      var element = el('<div><div></div></div>');
      DOM.appendChild(DOM.defaultDoc().body, element);
      var dispatchedEvent = DOM.createMouseEvent('click');
      var receivedEvent = null;
      var handler = (e) => { receivedEvent = e; };
      var manager = new EventManager([domEventPlugin], new FakeNgZone());

      var remover = manager.addGlobalEventListener("document", 'click', handler);
      DOM.dispatchEvent(element, dispatchedEvent);
      expect(receivedEvent).toBe(dispatchedEvent);

      receivedEvent = null;
      remover();
      DOM.dispatchEvent(element, dispatchedEvent);
      expect(receivedEvent).toBe(null);
    });
  });
}

class FakeEventManagerPlugin extends EventManagerPlugin {
  _eventHandler = new Map<string, Function>();
  constructor(public _supports: string[]) { super(); }

  supports(eventName: string): boolean { return ListWrapper.contains(this._supports, eventName); }

  addEventListener(element, eventName: string, handler: Function) {
    this._eventHandler.set(eventName, handler);
    return () => { MapWrapper.delete(this._eventHandler, eventName); };
  }
}

class FakeNgZone extends NgZone_ {
  constructor() {
    super({enableLongStackTrace: false});
  }
  run(fn) { fn(); }

  runOutsideAngular(fn) { return fn(); }
}
