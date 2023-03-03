/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fakeAsync, tick} from '@angular/core/testing';
import {DefaultUrlSerializer, Event, NavigationEnd, NavigationStart} from '@angular/router';
import {Subject} from 'rxjs';
import {filter, switchMap, take} from 'rxjs/operators';

import {Scroll} from '../src/events';
import {RouterScroller} from '../src/router_scroller';

// TODO: add tests that exercise the `withInMemoryScrolling` feature of the provideRouter function
const fakeZone = {
  runOutsideAngular: (fn: any) => fn(),
  run: (fn: any) => fn()
};
describe('RouterScroller', () => {
  it('defaults to disabled', () => {
    const events = new Subject<Event>();
    const router = <any>{
      events,
      parseUrl: (url: any) => new DefaultUrlSerializer().parse(url),
      triggerEvent: (e: any) => events.next(e)
    };

    const viewportScroller = jasmine.createSpyObj(
        'viewportScroller',
        ['getScrollPosition', 'scrollToPosition', 'scrollToAnchor', 'setHistoryScrollRestoration']);
    setScroll(viewportScroller, 0, 0);
    const scroller = new RouterScroller(
        new DefaultUrlSerializer(), {events} as any, viewportScroller, fakeZone as any);

    expect((scroller as any).options.scrollPositionRestoration).toBe('disabled');
    expect((scroller as any).options.anchorScrolling).toBe('disabled');
  });

  function nextScrollEvent(events: Subject<Event>): Promise<Scroll> {
    return events.pipe(filter((e): e is Scroll => e instanceof Scroll), take(1)).toPromise();
  }

  describe('scroll to top', () => {
    it('should scroll to the top', async () => {
      const {events, viewportScroller} =
          createRouterScroller({scrollPositionRestoration: 'top', anchorScrolling: 'disabled'});

      events.next(new NavigationStart(1, '/a'));
      events.next(new NavigationEnd(1, '/a', '/a'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);

      events.next(new NavigationStart(2, '/a'));
      events.next(new NavigationEnd(2, '/b', '/b'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);

      events.next(new NavigationStart(3, '/a', 'popstate'));
      events.next(new NavigationEnd(3, '/a', '/a'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
    });
  });

  describe('scroll to the stored position', () => {
    it('should scroll to the stored position on popstate', async () => {
      const {events, viewportScroller} =
          createRouterScroller({scrollPositionRestoration: 'enabled', anchorScrolling: 'disabled'});

      events.next(new NavigationStart(1, '/a'));
      events.next(new NavigationEnd(1, '/a', '/a'));
      await nextScrollEvent(events);
      setScroll(viewportScroller, 10, 100);
      expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);

      events.next(new NavigationStart(2, '/b'));
      events.next(new NavigationEnd(2, '/b', '/b'));
      await nextScrollEvent(events);
      setScroll(viewportScroller, 20, 200);
      expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);

      events.next(new NavigationStart(3, '/a', 'popstate', {navigationId: 1}));
      events.next(new NavigationEnd(3, '/a', '/a'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([10, 100]);
    });
  });

  describe('anchor scrolling', () => {
    it('should work (scrollPositionRestoration is disabled)', async () => {
      const {events, viewportScroller} =
          createRouterScroller({scrollPositionRestoration: 'disabled', anchorScrolling: 'enabled'});
      events.next(new NavigationStart(1, '/a#anchor'));
      events.next(new NavigationEnd(1, '/a#anchor', '/a#anchor'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToAnchor).toHaveBeenCalledWith('anchor');

      events.next(new NavigationStart(2, '/a#anchor2'));
      events.next(new NavigationEnd(2, '/a#anchor2', '/a#anchor2'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToAnchor).toHaveBeenCalledWith('anchor2');
      viewportScroller.scrollToAnchor.calls.reset();

      // we never scroll to anchor when navigating back.
      events.next(new NavigationStart(3, '/a#anchor', 'popstate'));
      events.next(new NavigationEnd(3, '/a#anchor', '/a#anchor'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToAnchor).not.toHaveBeenCalled();
      expect(viewportScroller.scrollToPosition).not.toHaveBeenCalled();
    });

    it('should work (scrollPositionRestoration is enabled)', async () => {
      const {events, viewportScroller} =
          createRouterScroller({scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled'});
      events.next(new NavigationStart(1, '/a#anchor'));
      events.next(new NavigationEnd(1, '/a#anchor', '/a#anchor'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToAnchor).toHaveBeenCalledWith('anchor');

      events.next(new NavigationStart(2, '/a#anchor2'));
      events.next(new NavigationEnd(2, '/a#anchor2', '/a#anchor2'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToAnchor).toHaveBeenCalledWith('anchor2');
      viewportScroller.scrollToAnchor.calls.reset();

      // we never scroll to anchor when navigating back
      events.next(new NavigationStart(3, '/a#anchor', 'popstate', {navigationId: 1}));
      events.next(new NavigationEnd(3, '/a#anchor', '/a#anchor'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToAnchor).not.toHaveBeenCalled();
      expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
    });
  });

  describe('extending a scroll service', () => {
    it('work', fakeAsync(() => {
         const {events, viewportScroller} = createRouterScroller(
             {scrollPositionRestoration: 'disabled', anchorScrolling: 'disabled'});

         events
             .pipe(filter((e): e is Scroll => e instanceof Scroll && !!e.position), switchMap(p => {
                     // can be any delay (e.g., we can wait for NgRx store to emit an event)
                     const r = new Subject<Scroll>();
                     setTimeout(() => {
                       r.next(p);
                       r.complete();
                     }, 1000);
                     return r;
                   }))
             .subscribe((e: Scroll) => {
               viewportScroller.scrollToPosition(e.position);
             });

         events.next(new NavigationStart(1, '/a'));
         events.next(new NavigationEnd(1, '/a', '/a'));
         tick();
         setScroll(viewportScroller, 10, 100);

         events.next(new NavigationStart(2, '/b'));
         events.next(new NavigationEnd(2, '/b', '/b'));
         tick();
         setScroll(viewportScroller, 20, 200);

         events.next(new NavigationStart(3, '/c'));
         events.next(new NavigationEnd(3, '/c', '/c'));
         tick();
         setScroll(viewportScroller, 30, 300);

         events.next(new NavigationStart(4, '/a', 'popstate', {navigationId: 1}));
         events.next(new NavigationEnd(4, '/a', '/a'));

         tick(500);
         expect(viewportScroller.scrollToPosition).not.toHaveBeenCalled();

         events.next(new NavigationStart(5, '/a', 'popstate', {navigationId: 1}));
         events.next(new NavigationEnd(5, '/a', '/a'));

         tick(5000);
         expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([10, 100]);
       }));
  });


  function createRouterScroller({scrollPositionRestoration, anchorScrolling}: {
    scrollPositionRestoration: 'disabled'|'enabled'|'top',
    anchorScrolling: 'disabled'|'enabled'
  }) {
    const events = new Subject<Event>();
    const transitions: any = {events};

    const viewportScroller = jasmine.createSpyObj(
        'viewportScroller',
        ['getScrollPosition', 'scrollToPosition', 'scrollToAnchor', 'setHistoryScrollRestoration']);
    setScroll(viewportScroller, 0, 0);

    const scroller = new RouterScroller(
        new DefaultUrlSerializer(), transitions, viewportScroller, fakeZone as any,
        {scrollPositionRestoration, anchorScrolling});
    scroller.init();

    return {events, viewportScroller};
  }

  function setScroll(viewportScroller: any, x: number, y: number) {
    viewportScroller.getScrollPosition.and.returnValue([x, y]);
  }
});
