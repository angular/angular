/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgZone} from '@angular/core/src/zone/ng_zone';
import {beforeEach, describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {DomEventsPlugin} from '@angular/platform-browser/src/dom/events/dom_events';
import {EventManager, EventManagerPlugin} from '@angular/platform-browser/src/dom/events/event_manager';
import {el} from '../../../testing/src/browser_util';

export function main() {
  let domEventPlugin: DomEventsPlugin;
  let doc: any;

  describe('EventManager', () => {

    beforeEach(() => {
      doc = getDOM().supportsDOMEvents() ? document : getDOM().createHtmlDocument();
      domEventPlugin = new DomEventsPlugin(doc);
    });

    it('should delegate event bindings to plugins that are passed in from the most generic one to the most specific one',
       () => {
         const element = el('<div></div>');
         const handler = (e: any /** TODO #9100 */) => e;
         const plugin = new FakeEventManagerPlugin(doc, ['click']);
         const manager = new EventManager([domEventPlugin, plugin], new FakeNgZone());
         manager.addEventListener(element, 'click', handler);
         expect(plugin.eventHandler['click']).toBe(handler);
       });

    it('should delegate event bindings to the first plugin supporting the event', () => {
      const element = el('<div></div>');
      const clickHandler = (e: any /** TODO #9100 */) => e;
      const dblClickHandler = (e: any /** TODO #9100 */) => e;
      const plugin1 = new FakeEventManagerPlugin(doc, ['dblclick']);
      const plugin2 = new FakeEventManagerPlugin(doc, ['click', 'dblclick']);
      const manager = new EventManager([plugin2, plugin1], new FakeNgZone());
      manager.addEventListener(element, 'click', clickHandler);
      manager.addEventListener(element, 'dblclick', dblClickHandler);
      expect(plugin2.eventHandler['click']).toBe(clickHandler);
      expect(plugin1.eventHandler['dblclick']).toBe(dblClickHandler);
    });

    it('should throw when no plugin can handle the event', () => {
      const element = el('<div></div>');
      const plugin = new FakeEventManagerPlugin(doc, ['dblclick']);
      const manager = new EventManager([plugin], new FakeNgZone());
      expect(() => manager.addEventListener(element, 'click', null !))
          .toThrowError('No event manager plugin found for event click');
    });

    it('events are caught when fired from a child', () => {
      const element = el('<div><div></div></div>');
      // Workaround for https://bugs.webkit.org/show_bug.cgi?id=122755
      getDOM().appendChild(doc.body, element);

      const child = getDOM().firstChild(element);
      const dispatchedEvent = getDOM().createMouseEvent('click');
      let receivedEvent: any /** TODO #9100 */ = null;
      const handler = (e: any /** TODO #9100 */) => { receivedEvent = e; };
      const manager = new EventManager([domEventPlugin], new FakeNgZone());
      manager.addEventListener(element, 'click', handler);
      getDOM().dispatchEvent(child, dispatchedEvent);

      expect(receivedEvent).toBe(dispatchedEvent);
    });

    it('should add and remove global event listeners', () => {
      const element = el('<div><div></div></div>');
      getDOM().appendChild(doc.body, element);
      const dispatchedEvent = getDOM().createMouseEvent('click');
      let receivedEvent: any /** TODO #9100 */ = null;
      const handler = (e: any /** TODO #9100 */) => { receivedEvent = e; };
      const manager = new EventManager([domEventPlugin], new FakeNgZone());

      const remover = manager.addGlobalEventListener('document', 'click', handler);
      getDOM().dispatchEvent(element, dispatchedEvent);
      expect(receivedEvent).toBe(dispatchedEvent);

      receivedEvent = null;
      remover();
      getDOM().dispatchEvent(element, dispatchedEvent);
      expect(receivedEvent).toBe(null);
    });
  });
}

/** @internal */
class FakeEventManagerPlugin extends EventManagerPlugin {
  eventHandler: {[event: string]: Function} = {};

  constructor(doc: any, public supportedEvents: string[]) { super(doc); }

  supports(eventName: string): boolean { return this.supportedEvents.indexOf(eventName) > -1; }

  addEventListener(element: any, eventName: string, handler: Function) {
    this.eventHandler[eventName] = handler;
    return () => { delete (this.eventHandler[eventName]); };
  }
}

class FakeNgZone extends NgZone {
  constructor() { super({enableLongStackTrace: false}); }
  run(fn: Function) { fn(); }

  runOutsideAngular(fn: Function) { return fn(); }
}
