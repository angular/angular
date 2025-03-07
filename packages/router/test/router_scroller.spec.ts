/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {DefaultUrlSerializer, Event, NavigationEnd, NavigationStart} from '@angular/router';
import {Subject} from 'rxjs';
import {filter, switchMap, take} from 'rxjs/operators';

import {BeforeActivateRoutes, RedirectRequest, Scroll} from '../src/events';
import {RouterScroller} from '../src/router_scroller';
import {ɵNoopNgZone as NoopNgZone} from '@angular/core';
import {
  NavigationTransition,
  NavigationTransitions,
} from '@angular/router/src/navigation_transition';

// TODO: add tests that exercise the `withInMemoryScrolling` feature of the provideRouter function
describe('RouterScroller', () => {
  it('defaults to disabled', () => {
    const events = new Subject<Event>();
    const viewportScroller = jasmine.createSpyObj('viewportScroller', [
      'getScrollPosition',
      'scrollToPosition',
      'scrollToAnchor',
      'setHistoryScrollRestoration',
    ]);
    setScroll(viewportScroller, 0, 0);
    const scroller = TestBed.runInInjectionContext(
      () =>
        new RouterScroller(
          new DefaultUrlSerializer(),
          {events} as any,
          viewportScroller,
          new NoopNgZone(),
        ),
    );

    expect((scroller as any).options.scrollPositionRestoration).toBe('disabled');
    expect((scroller as any).options.anchorScrolling).toBe('disabled');
  });

  function nextScrollEvent(
    events: Subject<Event | BeforeActivateRoutes | RedirectRequest>,
  ): Promise<Scroll> {
    return events
      .pipe(
        filter((e): e is Scroll => e instanceof Scroll),
        take(1),
      )
      .toPromise() as Promise<Scroll>;
  }

  describe('scroll to top', () => {
    it('should scroll to the top (scrollPositionRestoration is top)', async () => {
      const {transitions, viewportScroller} = createRouterScroller({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'disabled',
      });
      const {events} = transitions;

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

    it('should not scroll to the top (scrollPositionRestoration is top) on forward navigation when disableScrollToTop is true', async () => {
      const {transitions, viewportScroller} = createRouterScroller({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'disabled',
      });
      const {events} = transitions;
      transitions.currentTransition = {extras: {disableScrollToTop: true}} as NavigationTransition;

      events.next(new NavigationStart(1, '/a'));
      events.next(new NavigationEnd(1, '/a', '/a'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToPosition).toHaveBeenCalledTimes(0);

      events.next(new NavigationStart(2, '/a'));
      events.next(new NavigationEnd(2, '/b', '/b'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToPosition).toHaveBeenCalledTimes(0);

      events.next(new NavigationStart(3, '/a', 'popstate'));
      events.next(new NavigationEnd(3, '/a', '/a'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
    });

    it('should scroll to the top (scrollPositionRestoration is enabled)', async () => {
      const {transitions, viewportScroller} = createRouterScroller({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'disabled',
      });
      const {events} = transitions;

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

    it('should not scroll to the top (scrollPositionRestoration is enabled) on forward navigation when disableScrollToTop is true', async () => {
      const {transitions, viewportScroller} = createRouterScroller({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'disabled',
      });
      const {events} = transitions;
      transitions.currentTransition = {extras: {disableScrollToTop: true}} as NavigationTransition;

      events.next(new NavigationStart(1, '/a'));
      events.next(new NavigationEnd(1, '/a', '/a'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToPosition).toHaveBeenCalledTimes(0);

      events.next(new NavigationStart(2, '/a'));
      events.next(new NavigationEnd(2, '/b', '/b'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToPosition).toHaveBeenCalledTimes(0);

      events.next(new NavigationStart(3, '/a', 'popstate'));
      events.next(new NavigationEnd(3, '/a', '/a'));
      await nextScrollEvent(events);
      expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
    });
  });

  describe('scroll to the stored position', () => {
    it('should scroll to the stored position on popstate', async () => {
      const {transitions, viewportScroller} = createRouterScroller({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'disabled',
      });
      const {events} = transitions;

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

    it('should scroll to the stored position on popstate when disableScrollToTop is true', async () => {
      const {transitions, viewportScroller} = createRouterScroller({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'disabled',
      });
      const {events} = transitions;
      transitions.currentTransition = {extras: {disableScrollToTop: true}} as NavigationTransition;

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
      const {transitions, viewportScroller} = createRouterScroller({
        scrollPositionRestoration: 'disabled',
        anchorScrolling: 'enabled',
      });
      const {events} = transitions;

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

    it('should work (scrollPositionRestoration is disabled and disableScrollToTop is true)', async () => {
      const {transitions, viewportScroller} = createRouterScroller({
        scrollPositionRestoration: 'disabled',
        anchorScrolling: 'enabled',
      });
      const {events} = transitions;
      transitions.currentTransition = {extras: {disableScrollToTop: true}} as NavigationTransition;

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
      const {transitions, viewportScroller} = createRouterScroller({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      });
      const {events} = transitions;

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

    it('should work (scrollPositionRestoration is enabled and disableScrollToTop is true)', async () => {
      const {transitions, viewportScroller} = createRouterScroller({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      });
      const {events} = transitions;
      transitions.currentTransition = {extras: {disableScrollToTop: true}} as NavigationTransition;

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
      const {transitions, viewportScroller} = createRouterScroller({
        scrollPositionRestoration: 'disabled',
        anchorScrolling: 'disabled',
      });
      const {events} = transitions;

      events
        .pipe(
          filter((e): e is Scroll => e instanceof Scroll && !!e.position),
          switchMap((p) => {
            // can be any delay (e.g., we can wait for NgRx store to emit an event)
            const r = new Subject<Scroll>();
            setTimeout(() => {
              r.next(p);
              r.complete();
            }, 1000);
            return r;
          }),
        )
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

  function createRouterScroller({
    scrollPositionRestoration,
    anchorScrolling,
  }: {
    scrollPositionRestoration: 'disabled' | 'enabled' | 'top';
    anchorScrolling: 'disabled' | 'enabled';
  }) {
    const transitions: {
      events: Subject<Event | BeforeActivateRoutes | RedirectRequest>;
      currentTransition: NavigationTransition | null;
    } = {
      events: new Subject(),
      currentTransition: null,
    };

    const viewportScroller = jasmine.createSpyObj('viewportScroller', [
      'getScrollPosition',
      'scrollToPosition',
      'scrollToAnchor',
      'setHistoryScrollRestoration',
    ]);
    setScroll(viewportScroller, 0, 0);

    const scroller = TestBed.runInInjectionContext(
      () =>
        new RouterScroller(
          new DefaultUrlSerializer(),
          transitions as NavigationTransitions,
          viewportScroller,
          new NoopNgZone(),
          {scrollPositionRestoration, anchorScrolling},
        ),
    );
    scroller.init();

    return {transitions, viewportScroller};
  }

  function setScroll(viewportScroller: any, x: number, y: number) {
    viewportScroller.getScrollPosition.and.returnValue([x, y]);
  }
});
