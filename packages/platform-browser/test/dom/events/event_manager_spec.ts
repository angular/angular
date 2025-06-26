/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {NgZone} from '@angular/core';
import {DomEventsPlugin} from '../../../src/dom/events/dom_events';
import {EventManager, EventManagerPlugin} from '../../../src/dom/events/event_manager';

import {TestBed} from '@angular/core/testing';
import {isNode, createMouseEvent, el} from '@angular/private/testing';

import type {} from 'zone.js';

(function () {
  if (isNode) return;
  let domEventPlugin: DomEventsPlugin;
  let doc: Document;
  let zone: NgZone;
  const {runInInjectionContext} = TestBed;

  describe('EventManager', () => {
    beforeEach(() => {
      doc = getDOM().supportsDOMEvents ? document : getDOM().createHtmlDocument();
      zone = new NgZone({});
      runInInjectionContext(() => {
        domEventPlugin = new DomEventsPlugin(doc);
      });
    });

    it('should delegate event bindings to plugins that are passed in from the most generic one to the most specific one', () => {
      const element = el('<div></div>');
      const handler = (e: Event) => e;
      const plugin = new FakeEventManagerPlugin(doc, ['click']);
      const manager = new EventManager([domEventPlugin, plugin], new FakeNgZone());
      manager.addEventListener(element, 'click', handler);
      expect(plugin.eventHandler['click']).toBe(handler);
    });

    it('should delegate event bindings to the first plugin supporting the event', () => {
      const element = el('<div></div>');
      const clickHandler = (e: Event) => e;
      const dblClickHandler = (e: Event) => e;
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
      expect(() => manager.addEventListener(element, 'click', null!)).toThrowError(
        'NG05101: No event manager plugin found for event click',
      );
    });

    it('events are caught when fired from a child', () => {
      const element = el('<div><div></div></div>');
      // Workaround for https://bugs.webkit.org/show_bug.cgi?id=122755
      doc.body.appendChild(element);

      const child = element.firstChild as Element;
      const dispatchedEvent = createMouseEvent('click');
      let receivedEvent: MouseEvent | undefined;
      const handler = (e: MouseEvent) => {
        receivedEvent = e;
      };
      const manager = new EventManager([domEventPlugin], new FakeNgZone());
      manager.addEventListener(element, 'click', handler);
      getDOM().dispatchEvent(child, dispatchedEvent);

      expect(receivedEvent).toBe(dispatchedEvent);
    });

    it('should keep zone when addEventListener', () => {
      const Zone = (window as any)['Zone'];

      const element = el('<div><div></div></div>');
      doc.body.appendChild(element);
      const dispatchedEvent = createMouseEvent('click');
      let receivedEvent: MouseEvent | undefined;
      let receivedZone: Zone | undefined;
      const handler = (e: MouseEvent) => {
        receivedEvent = e;
        receivedZone = Zone.current;
      };
      const manager = new EventManager([domEventPlugin], new FakeNgZone());

      let remover: Function | undefined;
      Zone.root.run(() => {
        remover = manager.addEventListener(element, 'click', handler);
      });
      getDOM().dispatchEvent(element, dispatchedEvent);
      expect(receivedEvent).toBe(dispatchedEvent);
      expect(receivedZone?.name).toBe(Zone.root.name);

      receivedEvent = undefined;
      remover?.();
      getDOM().dispatchEvent(element, dispatchedEvent);
      expect(receivedEvent).toBe(undefined);
    });

    it('should keep zone when addEventListener multiple times', () => {
      const Zone = (window as any)['Zone'];

      const element = el('<div><div></div></div>');
      doc.body.appendChild(element);
      const dispatchedEvent = createMouseEvent('click');
      let receivedEvents: MouseEvent[] = [];
      let receivedZones: Zone[] = [];
      const handler1 = (e: MouseEvent) => {
        receivedEvents.push(e);
        receivedZones.push(Zone.current.name);
      };
      const handler2 = (e: MouseEvent) => {
        receivedEvents.push(e);
        receivedZones.push(Zone.current.name);
      };
      const manager = new EventManager([domEventPlugin], new FakeNgZone());

      let remover1: Function | undefined;
      let remover2: Function | undefined;
      Zone.root.run(() => {
        remover1 = manager.addEventListener(element, 'click', handler1);
      });
      Zone.root.fork({name: 'test'}).run(() => {
        remover2 = manager.addEventListener(element, 'click', handler2);
      });
      getDOM().dispatchEvent(element, dispatchedEvent);
      expect(receivedEvents).toEqual([dispatchedEvent, dispatchedEvent]);
      expect(receivedZones).toEqual([Zone.root.name, 'test']);

      receivedEvents = [];
      remover1?.();
      remover2?.();
      getDOM().dispatchEvent(element, dispatchedEvent);
      expect(receivedEvents).toEqual([]);
    });

    it('should support event.stopImmediatePropagation', () => {
      const Zone = (window as any)['Zone'];

      const element = el('<div><div></div></div>');
      doc.body.appendChild(element);
      const dispatchedEvent = createMouseEvent('click');
      let receivedEvents: MouseEvent[] = [];
      let receivedZones: Zone[] = [];
      const handler1 = (e: MouseEvent) => {
        receivedEvents.push(e);
        receivedZones.push(Zone.current.name);
        e.stopImmediatePropagation();
      };
      const handler2 = (e: MouseEvent) => {
        receivedEvents.push(e);
        receivedZones.push(Zone.current.name);
      };
      const manager = new EventManager([domEventPlugin], new FakeNgZone());

      let remover1: Function | undefined;
      let remover2: Function | undefined;
      Zone.root.run(() => {
        remover1 = manager.addEventListener(element, 'click', handler1);
      });
      Zone.root.fork({name: 'test'}).run(() => {
        remover2 = manager.addEventListener(element, 'click', handler2);
      });
      getDOM().dispatchEvent(element, dispatchedEvent);
      expect(receivedEvents).toEqual([dispatchedEvent]);
      expect(receivedZones).toEqual([Zone.root.name]);

      receivedEvents = [];
      remover1?.();
      remover2?.();
      getDOM().dispatchEvent(element, dispatchedEvent);
      expect(receivedEvents).toEqual([]);
    });

    it('should handle event correctly when one handler remove itself ', () => {
      const Zone = (window as any)['Zone'];

      const element = el('<div><div></div></div>');
      doc.body.appendChild(element);
      const dispatchedEvent = createMouseEvent('click');
      let receivedEvents: MouseEvent[] = [];
      let receivedZones: Zone[] = [];
      let remover1: Function | undefined;
      let remover2: Function | undefined;
      const handler1 = (e: MouseEvent) => {
        receivedEvents.push(e);
        receivedZones.push(Zone.current.name);
        remover1 && remover1();
      };
      const handler2 = (e: MouseEvent) => {
        receivedEvents.push(e);
        receivedZones.push(Zone.current.name);
      };
      const manager = new EventManager([domEventPlugin], new FakeNgZone());

      Zone.root.run(() => {
        remover1 = manager.addEventListener(element, 'click', handler1);
      });
      Zone.root.fork({name: 'test'}).run(() => {
        remover2 = manager.addEventListener(element, 'click', handler2);
      });
      getDOM().dispatchEvent(element, dispatchedEvent);
      expect(receivedEvents).toEqual([dispatchedEvent, dispatchedEvent]);
      expect(receivedZones).toEqual([Zone.root.name, 'test']);

      receivedEvents = [];
      remover1?.();
      remover2?.();
      getDOM().dispatchEvent(element, dispatchedEvent);
      expect(receivedEvents).toEqual([]);
    });

    it('should only add same callback once when addEventListener', () => {
      const Zone = (window as any)['Zone'];

      const element = el('<div><div></div></div>');
      doc.body.appendChild(element);
      const dispatchedEvent = createMouseEvent('click');
      let receivedEvents: MouseEvent[] = [];
      let receivedZones: Zone[] = [];
      const handler = (e: MouseEvent) => {
        receivedEvents.push(e);
        receivedZones.push(Zone.current.name);
      };
      const manager = new EventManager([domEventPlugin], new FakeNgZone());

      let remover1: Function | undefined;
      let remover2: Function | undefined;
      Zone.root.run(() => {
        remover1 = manager.addEventListener(element, 'click', handler);
      });
      Zone.root.fork({name: 'test'}).run(() => {
        remover2 = manager.addEventListener(element, 'click', handler);
      });
      getDOM().dispatchEvent(element, dispatchedEvent);
      expect(receivedEvents).toEqual([dispatchedEvent]);
      expect(receivedZones).toEqual([Zone.root.name]);

      receivedEvents = [];
      remover1?.();
      remover2?.();
      getDOM().dispatchEvent(element, dispatchedEvent);
      expect(receivedEvents).toEqual([]);
    });

    it('should be able to remove event listener which was added inside of ngZone', () => {
      const Zone = (window as any)['Zone'];

      const element = el('<div><div></div></div>');
      doc.body.appendChild(element);
      const dispatchedEvent = createMouseEvent('click');
      let receivedEvents: MouseEvent[] = [];
      let receivedZones: Zone[] = [];
      const handler1 = (e: MouseEvent) => {
        receivedEvents.push(e);
        receivedZones.push(Zone.current.name);
      };
      const handler2 = (e: MouseEvent) => {
        receivedEvents.push(e);
        receivedZones.push(Zone.current.name);
      };
      const manager = new EventManager([domEventPlugin], new FakeNgZone());

      let remover1: Function | undefined;
      let remover2: Function | undefined;
      // handler1 is added in root zone
      Zone.root.run(() => {
        remover1 = manager.addEventListener(element, 'click', handler1);
      });
      // handler2 is added in 'angular' zone
      Zone.root.fork({name: 'fakeAngularZone', properties: {isAngularZone: true}}).run(() => {
        remover2 = manager.addEventListener(element, 'click', handler2);
      });
      getDOM().dispatchEvent(element, dispatchedEvent);
      expect(receivedEvents).toEqual([dispatchedEvent, dispatchedEvent]);
      expect(receivedZones).toEqual([Zone.root.name, 'fakeAngularZone']);

      receivedEvents = [];
      remover1?.();
      remover2?.();
      getDOM().dispatchEvent(element, dispatchedEvent);
      // handler1 and handler2 are added in different zone
      // one is angular zone, the other is not
      // should still be able to remove them correctly
      expect(receivedEvents).toEqual([]);
    });

    // This test is reliant on `zone_event_unpatched_init.js` and verifies
    // that the Zone unpatched event setting applies to the event manager.
    it('should run unpatchedEvents handler outside of ngZone', () => () => {
      const element = el('<div><div></div></div>');
      const zone = new NgZone({enableLongStackTrace: true});
      const manager = new EventManager([domEventPlugin], zone);
      let timeoutId: NodeJS.Timeout | null = null;

      doc.body.appendChild(element);

      // Register the event listener in the Angular zone. If the handler would be
      // patched then, the Zone should propagate into the listener callback.
      zone.run(() => {
        manager.addEventListener(element, 'unpatchedEventManagerTest', () => {
          // schedule some timer that would cause the zone to become unstable. if the event
          // handler would be patched, `hasPendingMacrotasks` would be `true`.
          timeoutId = setTimeout(() => {}, 9999999);
        });
      });

      expect(zone.hasPendingMacrotasks).toBe(false);
      getDOM().dispatchEvent(element, createMouseEvent('unpatchedEventManagerTest'));

      expect(zone.hasPendingMacrotasks).toBe(false);
      expect(timeoutId).not.toBe(null);

      // cleanup the DOM by removing the test element we attached earlier.
      element.remove();
      timeoutId && clearTimeout(timeoutId);
    });

    it('should only trigger one Change detection when bubbling with shouldCoalesceEventChangeDetection = true', (done: DoneFn) => {
      doc = getDOM().supportsDOMEvents ? document : getDOM().createHtmlDocument();
      zone = new NgZone({shouldCoalesceEventChangeDetection: true});
      runInInjectionContext(() => {
        domEventPlugin = new DomEventsPlugin(doc);
      });
      const element = el('<div></div>');
      const child = el('<div></div>');
      element.appendChild(child);
      doc.body.appendChild(element);
      const dispatchedEvent = createMouseEvent('click');
      let receivedEvents: MouseEvent[] = [];
      let stables: boolean[] = [];
      const handler = (e: MouseEvent) => {
        receivedEvents.push(e);
      };
      const manager = new EventManager([domEventPlugin], zone);
      let removerChild: Function;
      let removerParent: Function;

      zone.run(() => {
        removerChild = manager.addEventListener(child, 'click', handler);
        removerParent = manager.addEventListener(element, 'click', handler);
      });
      zone.onStable.subscribe((isStable: boolean) => {
        stables.push(isStable);
      });
      getDOM().dispatchEvent(child, dispatchedEvent);
      requestAnimationFrame(() => {
        expect(receivedEvents.length).toBe(2);
        expect(stables.length).toBe(1);

        removerChild && removerChild();
        removerParent && removerParent();
        done();
      });
    });

    it('should only trigger one Change detection when bubbling with shouldCoalesceRunChangeDetection = true', (done: DoneFn) => {
      doc = getDOM().supportsDOMEvents ? document : getDOM().createHtmlDocument();
      zone = new NgZone({shouldCoalesceRunChangeDetection: true});
      runInInjectionContext(() => {
        domEventPlugin = new DomEventsPlugin(doc);
      });
      const element = el('<div></div>');
      const child = el('<div></div>');
      element.appendChild(child);
      doc.body.appendChild(element);
      const dispatchedEvent = createMouseEvent('click');
      let receivedEvents: MouseEvent[] = [];
      let stables: boolean[] = [];
      const handler = (e: MouseEvent) => {
        receivedEvents.push(e);
      };
      const manager = new EventManager([domEventPlugin], zone);
      let removerChild: Function;
      let removerParent: Function;

      zone.run(() => {
        removerChild = manager.addEventListener(child, 'click', handler);
        removerParent = manager.addEventListener(element, 'click', handler);
      });
      zone.onStable.subscribe((isStable: boolean) => {
        stables.push(isStable);
      });
      getDOM().dispatchEvent(child, dispatchedEvent);
      requestAnimationFrame(() => {
        expect(receivedEvents.length).toBe(2);
        expect(stables.length).toBe(1);

        removerChild && removerChild();
        removerParent && removerParent();
        done();
      });
    });

    it('should not drain micro tasks queue too early with shouldCoalesceEventChangeDetection=true', (done: DoneFn) => {
      doc = getDOM().supportsDOMEvents ? document : getDOM().createHtmlDocument();
      zone = new NgZone({shouldCoalesceEventChangeDetection: true});
      runInInjectionContext(() => {
        domEventPlugin = new DomEventsPlugin(doc);
      });
      const element = el('<div></div>');
      const child = el('<div></div>');
      doc.body.appendChild(element);
      const dispatchedClickEvent = createMouseEvent('click');
      const dispatchedBlurEvent: FocusEvent = getDOM()
        .getDefaultDocument()
        .createEvent('FocusEvent');
      dispatchedBlurEvent.initEvent('blur', true, true);
      let logs: string[] = [];
      const handler = () => {};

      const blurHandler = (e: Event) => {
        logs.push('blur');
      };
      const manager = new EventManager([domEventPlugin], zone);
      let removerParent: Function;
      let removerChildFocus: Function;

      zone.run(() => {
        removerParent = manager.addEventListener(element, 'click', handler);
        removerChildFocus = manager.addEventListener(child, 'blur', blurHandler);
      });
      const sub = zone.onStable.subscribe(() => {
        sub.unsubscribe();
        logs.push('begin');
        queueMicrotask(() => {
          logs.push('promise resolved');
        });
        element.appendChild(child);
        getDOM().dispatchEvent(child, dispatchedBlurEvent);
        logs.push('end');
      });
      getDOM().dispatchEvent(element, dispatchedClickEvent);
      requestAnimationFrame(() => {
        expect(logs).toEqual(['begin', 'blur', 'end', 'promise resolved']);

        removerParent();
        removerChildFocus();
        done();
      });
    });

    it('should not drain micro tasks queue too early with shouldCoalesceRunChangeDetection=true', (done: DoneFn) => {
      doc = getDOM().supportsDOMEvents ? document : getDOM().createHtmlDocument();
      zone = new NgZone({shouldCoalesceRunChangeDetection: true});
      runInInjectionContext(() => {
        domEventPlugin = new DomEventsPlugin(doc);
      });
      const element = el('<div></div>');
      const child = el('<div></div>');
      doc.body.appendChild(element);
      const dispatchedClickEvent = createMouseEvent('click');
      const dispatchedBlurEvent: FocusEvent = getDOM()
        .getDefaultDocument()
        .createEvent('FocusEvent');
      dispatchedBlurEvent.initEvent('blur', true, true);
      let logs: string[] = [];
      const handler = () => {};

      const blurHandler = (e: Event) => {
        logs.push('blur');
      };
      const manager = new EventManager([domEventPlugin], zone);
      let removerParent: Function;
      let removerChildFocus: Function;

      zone.run(() => {
        removerParent = manager.addEventListener(element, 'click', handler);
        removerChildFocus = manager.addEventListener(child, 'blur', blurHandler);
      });
      const sub = zone.onStable.subscribe(() => {
        sub.unsubscribe();
        logs.push('begin');
        queueMicrotask(() => {
          logs.push('promise resolved');
        });
        element.appendChild(child);
        getDOM().dispatchEvent(child, dispatchedBlurEvent);
        logs.push('end');
      });
      getDOM().dispatchEvent(element, dispatchedClickEvent);
      requestAnimationFrame(() => {
        expect(logs).toEqual(['begin', 'blur', 'end', 'promise resolved']);

        removerParent && removerParent();
        removerChildFocus && removerChildFocus();
        done();
      });
    });
  });
})();

/** @internal */
class FakeEventManagerPlugin extends EventManagerPlugin {
  eventHandler: {[event: string]: Function} = {};

  constructor(
    doc: Document,
    public supportedEvents: string[],
  ) {
    super(doc);
  }

  override supports(eventName: string): boolean {
    return this.supportedEvents.indexOf(eventName) > -1;
  }

  override addEventListener(element: Element, eventName: string, handler: Function) {
    this.eventHandler[eventName] = handler;
    return () => {
      delete this.eventHandler[eventName];
    };
  }
}

class FakeNgZone extends NgZone {
  constructor() {
    super({enableLongStackTrace: false, shouldCoalesceEventChangeDetection: true});
  }
  override run<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T {
    return fn();
  }
  override runOutsideAngular(fn: Function) {
    return fn();
  }
}
