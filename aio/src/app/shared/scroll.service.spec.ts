import {Location, LocationStrategy, PlatformLocation, ViewportScroller} from '@angular/common';
import {DOCUMENT} from '@angular/common';
import {MockLocationStrategy, SpyLocation} from '@angular/common/testing';
import {Injector} from '@angular/core';
import {fakeAsync, tick} from '@angular/core/testing';

import {ScrollService, topMargin} from './scroll.service';
import {SessionStorage, NoopStorage} from './storage.service';

describe('ScrollService', () => {
  const scrollServiceInstances: ScrollService[] = [];
  const createScrollService = (...args: ConstructorParameters<typeof ScrollService>) => {
    const instance = new ScrollService(...args);
    scrollServiceInstances.push(instance);
    return instance;
  };

  const topOfPageElem = {} as Element;
  let injector: Injector;
  let document: MockDocument;
  let platformLocation: MockPlatformLocation;
  let scrollService: ScrollService;
  let location: SpyLocation;
  let sessionStorage: Storage;

  class MockPlatformLocation {
    hash: string;
  }

  class MockDocument {
    body = new MockElement();
    getElementById = jasmine.createSpy('Document getElementById').and.returnValue(topOfPageElem);
    querySelector = jasmine.createSpy('Document querySelector');
  }

  class MockElement {
    getBoundingClientRect =
        jasmine.createSpy('Element getBoundingClientRect').and.returnValue({top: 0});
    scrollIntoView = jasmine.createSpy('Element scrollIntoView');
  }

  const viewportScrollerStub =
      jasmine.createSpyObj('viewportScroller', ['getScrollPosition', 'scrollToPosition']);

  beforeEach(() => {
    injector = Injector.create( {
      providers: [
        {
          provide: ScrollService,
          useFactory: createScrollService,
          deps: [DOCUMENT, PlatformLocation, ViewportScroller, Location, SessionStorage],
        },
        {provide: Location, useClass: SpyLocation, deps: []},
        {provide: DOCUMENT, useClass: MockDocument, deps: []},
        {provide: PlatformLocation, useClass: MockPlatformLocation, deps: []},
        {provide: ViewportScroller, useValue: viewportScrollerStub},
        {provide: LocationStrategy, useClass: MockLocationStrategy, deps: []},
        {provide: SessionStorage, useValue: new NoopStorage()},
      ]
    });

    platformLocation = injector.get(PlatformLocation);
    document = injector.get(DOCUMENT) as unknown as MockDocument;
    scrollService = injector.get(ScrollService);
    location = injector.get(Location) as unknown as SpyLocation;
    sessionStorage = injector.get(SessionStorage);

    spyOn(window, 'scrollBy');
  });

  afterEach(() => {
    scrollServiceInstances.forEach(instance => instance.ngOnDestroy());
  });

  it('should debounce `updateScrollPositonInHistory()`', fakeAsync(() => {
       const updateScrollPositionInHistorySpy =
           spyOn(scrollService, 'updateScrollPositionInHistory');

       window.dispatchEvent(new Event('scroll'));
       tick(249);
       window.dispatchEvent(new Event('scroll'));
       tick(249);
       window.dispatchEvent(new Event('scroll'));
       tick(249);
       expect(updateScrollPositionInHistorySpy).not.toHaveBeenCalled();
       tick(1);
       expect(updateScrollPositionInHistorySpy).toHaveBeenCalledTimes(1);
     }));

  it('should not support `manual` scrollRestoration when it is not writable', () => {
    const original = Object.getOwnPropertyDescriptor(window.history, 'scrollRestoration');
    try {
      Object.defineProperty(window.history, 'scrollRestoration', {
        value: 'auto',
        configurable: true,
      });
      scrollService = createScrollService(
          document, platformLocation as PlatformLocation, viewportScrollerStub, location,
          sessionStorage);

      expect(scrollService.supportManualScrollRestoration).toBe(false);
    } finally {
      if (original !== undefined) {
        Object.defineProperty(window.history, 'scrollRestoration', original);
      } else {
        delete (window.history as any).scrollRestoration;
      }
    }
  });

  it('should set `scrollRestoration` to `manual` if supported', () => {
    if (scrollService.supportManualScrollRestoration) {
      expect(window.history.scrollRestoration).toBe('manual');
    } else {
      expect(window.history.scrollRestoration).toBeUndefined();
    }
  });

  describe('#topOffset', () => {
    it('should query for the top-bar by CSS selector', () => {
      expect(document.querySelector).not.toHaveBeenCalled();

      expect(scrollService.topOffset).toBe(topMargin);
      expect(document.querySelector).toHaveBeenCalled();
    });

    it('should be calculated based on the top-bar\'s height + margin', () => {
      (document.querySelector as jasmine.Spy).and.returnValue({clientHeight: 50});
      expect(scrollService.topOffset).toBe(50 + topMargin);
    });

    it('should only query for the top-bar once', () => {
      expect(scrollService.topOffset).toBe(topMargin);
      (document.querySelector as jasmine.Spy).calls.reset();

      expect(scrollService.topOffset).toBe(topMargin);
      expect(document.querySelector).not.toHaveBeenCalled();
    });

    it('should retrieve the top-bar\'s height again after resize', () => {
      let clientHeight = 50;
      (document.querySelector as jasmine.Spy).and.callFake(() => ({clientHeight}));

      expect(scrollService.topOffset).toBe(50 + topMargin);
      expect(document.querySelector).toHaveBeenCalled();

      (document.querySelector as jasmine.Spy).calls.reset();
      clientHeight = 100;

      expect(scrollService.topOffset).toBe(50 + topMargin);
      expect(document.querySelector).not.toHaveBeenCalled();

      window.dispatchEvent(new Event('resize'));

      expect(scrollService.topOffset).toBe(100 + topMargin);
      expect(document.querySelector).toHaveBeenCalled();
    });

    it('should stop updating on resize once destroyed', () => {
      let clientHeight = 50;
      (document.querySelector as jasmine.Spy).and.callFake(() => ({clientHeight}));

      expect(scrollService.topOffset).toBe(50 + topMargin);

      clientHeight = 100;
      window.dispatchEvent(new Event('resize'));
      expect(scrollService.topOffset).toBe(100 + topMargin);

      scrollService.ngOnDestroy();

      clientHeight = 200;
      window.dispatchEvent(new Event('resize'));
      expect(scrollService.topOffset).toBe(100 + topMargin);
    });
  });

  describe('#topOfPageElement', () => {
    it('should query for the top-of-page element by ID', () => {
      expect(document.getElementById).not.toHaveBeenCalled();

      expect(scrollService.topOfPageElement).toBe(topOfPageElem);
      expect(document.getElementById).toHaveBeenCalled();
    });

    it('should only query for the top-of-page element once', () => {
      expect(scrollService.topOfPageElement).toBe(topOfPageElem);
      (document.getElementById as jasmine.Spy).calls.reset();

      expect(scrollService.topOfPageElement).toBe(topOfPageElem);
      expect(document.getElementById).not.toHaveBeenCalled();
    });

    it('should return `<body>` if unable to find the top-of-page element', () => {
      (document.getElementById as jasmine.Spy).and.returnValue(null);
      expect(scrollService.topOfPageElement).toBe(document.body as any);
    });
  });

  describe('#scroll', () => {
    it('should scroll to the top if there is no hash', () => {
      platformLocation.hash = '';

      const topOfPage = new MockElement();
      document.getElementById.and.callFake((id: string) => id === 'top-of-page' ? topOfPage : null);

      scrollService.scroll();
      expect(topOfPage.scrollIntoView).toHaveBeenCalled();
    });

    it('should not scroll if the hash does not match an element id', () => {
      platformLocation.hash = 'not-found';
      document.getElementById.and.returnValue(null);

      scrollService.scroll();
      expect(document.getElementById).toHaveBeenCalledWith('not-found');
      expect(window.scrollBy).not.toHaveBeenCalled();
    });

    it('should scroll to the element whose id matches the hash', () => {
      const element = new MockElement();
      platformLocation.hash = 'some-id';
      document.getElementById.and.returnValue(element);

      scrollService.scroll();
      expect(document.getElementById).toHaveBeenCalledWith('some-id');
      expect(element.scrollIntoView).toHaveBeenCalled();
      expect(window.scrollBy).toHaveBeenCalled();
    });

    it('should scroll to the element whose id matches the hash with encoded characters', () => {
      const element = new MockElement();
      platformLocation.hash = '%F0%9F%91%8D';  // 👍
      document.getElementById.and.returnValue(element);

      scrollService.scroll();
      expect(document.getElementById).toHaveBeenCalledWith('👍');
      expect(element.scrollIntoView).toHaveBeenCalled();
      expect(window.scrollBy).toHaveBeenCalled();
    });
  });

  describe('#scrollToElement', () => {
    it('should scroll to element', () => {
      const element: Element = new MockElement() as any;
      scrollService.scrollToElement(element);
      expect(element.scrollIntoView).toHaveBeenCalled();
      expect(window.scrollBy).toHaveBeenCalledWith(0, -scrollService.topOffset);
    });

    it('should not scroll more than necessary (e.g. for elements close to the bottom)', () => {
      const element: Element = new MockElement() as any;
      const getBoundingClientRect = element.getBoundingClientRect as jasmine.Spy;
      const topOffset = scrollService.topOffset;

      getBoundingClientRect.and.returnValue({top: topOffset + 100});
      scrollService.scrollToElement(element);
      expect(element.scrollIntoView).toHaveBeenCalledTimes(1);
      expect(window.scrollBy).toHaveBeenCalledWith(0, 100);

      getBoundingClientRect.and.returnValue({top: topOffset - 10});
      scrollService.scrollToElement(element);
      expect(element.scrollIntoView).toHaveBeenCalledTimes(2);
      expect(window.scrollBy).toHaveBeenCalledWith(0, -10);
    });

    it('should scroll all the way to the top if close enough', () => {
      const element: Element = new MockElement() as any;

      (window as any).pageYOffset = 25;
      scrollService.scrollToElement(element);

      expect(element.scrollIntoView).toHaveBeenCalled();
      expect(window.scrollBy).toHaveBeenCalledWith(0, -scrollService.topOffset);
      (window.scrollBy as jasmine.Spy).calls.reset();

      (window as any).pageYOffset = 15;
      scrollService.scrollToElement(element);

      expect(element.scrollIntoView).toHaveBeenCalled();
      expect(window.scrollBy).toHaveBeenCalledWith(0, -scrollService.topOffset);
      expect(window.scrollBy).toHaveBeenCalledWith(0, -15);
    });

    it('should do nothing if no element', () => {
      scrollService.scrollToElement(null);
      expect(window.scrollBy).not.toHaveBeenCalled();
    });
  });

  describe('#scrollToTop', () => {
    it('should scroll to top', () => {
      const topOfPageElement = new MockElement() as any as Element;
      document.getElementById.and.callFake(
          (id: string) => id === 'top-of-page' ? topOfPageElement : null);

      scrollService.scrollToTop();
      expect(topOfPageElement.scrollIntoView).toHaveBeenCalled();
      expect(window.scrollBy).toHaveBeenCalledWith(0, -topMargin);
    });
  });

  describe('#isLocationWithHash', () => {
    it('should return true when the location has a hash', () => {
      platformLocation.hash = 'anchor';
      expect(scrollService.isLocationWithHash()).toBe(true);
    });

    it('should return false when the location has no hash', () => {
      platformLocation.hash = '';
      expect(scrollService.isLocationWithHash()).toBe(false);
    });
  });

  describe('#needToFixScrollPosition', async () => {
    it('should return true when popState event was fired after a back navigation if the browser supports ' +
           'scrollRestoration`. Otherwise, needToFixScrollPosition() returns false',
       () => {
         if (scrollService.supportManualScrollRestoration) {
           location.go('/initial-url1');
           // We simulate a scroll down
           location.replaceState('/initial-url1', 'hack', {scrollPosition: [2000, 0]});
           location.go('/initial-url2');
           location.back();

           expect(scrollService.poppedStateScrollPosition).toEqual([2000, 0]);
           expect(scrollService.needToFixScrollPosition()).toBe(true);
         } else {
           location.go('/initial-url1');
           location.go('/initial-url2');
           location.back();

           expect(scrollService.poppedStateScrollPosition).toBe(null);
           expect(scrollService.needToFixScrollPosition()).toBe(false);
         }
       });

    it('should return true when popState event was fired after a forward navigation if the browser supports ' +
           'scrollRestoration`. Otherwise, needToFixScrollPosition() returns false',
       () => {
         if (scrollService.supportManualScrollRestoration) {
           location.go('/initial-url1');
           location.go('/initial-url2');
           // We simulate a scroll down
           location.replaceState('/initial-url1', 'hack', {scrollPosition: [2000, 0]});

           location.back();
           scrollService.poppedStateScrollPosition = [0, 0];
           location.forward();

           expect(scrollService.poppedStateScrollPosition).toEqual([2000, 0]);
           expect(scrollService.needToFixScrollPosition()).toBe(true);
         } else {
           location.go('/initial-url1');
           location.go('/initial-url2');
           location.back();
           location.forward();

           expect(scrollService.poppedStateScrollPosition).toBe(null);
           expect(scrollService.needToFixScrollPosition()).toBe(false);
         }
       });
  });

  describe('#scrollAfterRender', async () => {
    let scrollSpy: jasmine.Spy;
    let scrollToTopSpy: jasmine.Spy;
    let needToFixScrollPositionSpy: jasmine.Spy;
    let scrollToPosition: jasmine.Spy;
    let isLocationWithHashSpy: jasmine.Spy;
    let getStoredScrollPositionSpy: jasmine.Spy;
    const scrollDelay = 500;

    beforeEach(() => {
      scrollSpy = spyOn(scrollService, 'scroll');
      scrollToTopSpy = spyOn(scrollService, 'scrollToTop');
      scrollToPosition = spyOn(scrollService, 'scrollToPosition');
      needToFixScrollPositionSpy = spyOn(scrollService, 'needToFixScrollPosition');
      getStoredScrollPositionSpy = spyOn(scrollService, 'getStoredScrollPosition');
      isLocationWithHashSpy = spyOn(scrollService, 'isLocationWithHash');
    });


    it('should call `scroll` when we navigate to a location with anchor', fakeAsync(() => {
         needToFixScrollPositionSpy.and.returnValue(false);
         getStoredScrollPositionSpy.and.returnValue(null);
         isLocationWithHashSpy.and.returnValue(true);

         scrollService.scrollAfterRender(scrollDelay);

         expect(scrollSpy).not.toHaveBeenCalled();
         tick(scrollDelay);
         expect(scrollSpy).toHaveBeenCalled();
       }));

    it('should call `scrollToTop` when we navigate to a location without anchor', fakeAsync(() => {
         needToFixScrollPositionSpy.and.returnValue(false);
         getStoredScrollPositionSpy.and.returnValue(null);
         isLocationWithHashSpy.and.returnValue(false);

         scrollService.scrollAfterRender(scrollDelay);

         expect(scrollToTopSpy).toHaveBeenCalled();
         tick(scrollDelay);
         expect(scrollSpy).not.toHaveBeenCalled();
       }));

    it('should call `viewportScroller.scrollToPosition` when we reload a page', fakeAsync(() => {
         getStoredScrollPositionSpy.and.returnValue([0, 1000]);

         scrollService.scrollAfterRender(scrollDelay);

         expect(viewportScrollerStub.scrollToPosition).toHaveBeenCalled();
         expect(getStoredScrollPositionSpy).toHaveBeenCalled();
       }));

    it('should call `scrollToPosition` after a popState', fakeAsync(() => {
         needToFixScrollPositionSpy.and.returnValue(true);
         getStoredScrollPositionSpy.and.returnValue(null);
         scrollService.scrollAfterRender(scrollDelay);
         expect(scrollToPosition).toHaveBeenCalled();
         tick(scrollDelay);
         expect(scrollSpy).not.toHaveBeenCalled();
         expect(scrollToTopSpy).not.toHaveBeenCalled();
       }));
  });

  describe('once destroyed', () => {
    it('should stop updating scroll position', fakeAsync(() => {
         const updateScrollPositionInHistorySpy =
             spyOn(scrollService, 'updateScrollPositionInHistory');

         window.dispatchEvent(new Event('scroll'));
         tick(250);
         expect(updateScrollPositionInHistorySpy).toHaveBeenCalledTimes(1);

         window.dispatchEvent(new Event('scroll'));
         tick(250);
         expect(updateScrollPositionInHistorySpy).toHaveBeenCalledTimes(2);

         updateScrollPositionInHistorySpy.calls.reset();
         scrollService.ngOnDestroy();

         window.dispatchEvent(new Event('scroll'));
         tick(250);
         expect(updateScrollPositionInHistorySpy).not.toHaveBeenCalled();
       }));

    it('should stop updating the stored location href', () => {
      const triggerBeforeunloadEvent = () => {
        // Karma adds an `onbeforeunload` listener to detect whether the tests do a full page reload
        // (and report it as an error). This test tests functionality that requires emitting a
        // `beforeunload` event.
        // To stop Karma from erroring, we replace Karma's `onbeforeunload` listener and restore it
        // after the fake event has been emitted.
        const originalOnbeforeunload = window.onbeforeunload;
        window.onbeforeunload = () => undefined;

        try {
          window.dispatchEvent(new Event('beforeunload'));
        } finally {
          window.onbeforeunload = originalOnbeforeunload;
        }
      };

      const updateScrollLocationHrefSpy = spyOn(scrollService, 'updateScrollLocationHref');

      triggerBeforeunloadEvent();
      expect(updateScrollLocationHrefSpy).toHaveBeenCalledTimes(1);

      triggerBeforeunloadEvent();
      expect(updateScrollLocationHrefSpy).toHaveBeenCalledTimes(2);

      updateScrollLocationHrefSpy.calls.reset();
      scrollService.ngOnDestroy();

      triggerBeforeunloadEvent();
      expect(updateScrollLocationHrefSpy).not.toHaveBeenCalled();
    });

    it('should stop scrolling on `hashchange` events', () => {
      const scrollToPositionSpy = spyOn(scrollService, 'scrollToPosition');

      location.simulateHashChange('foo');
      expect(scrollToPositionSpy).toHaveBeenCalledTimes(1);

      location.simulateHashChange('bar');
      expect(scrollToPositionSpy).toHaveBeenCalledTimes(2);

      scrollToPositionSpy.calls.reset();
      scrollService.ngOnDestroy();

      location.simulateHashChange('baz');
      expect(scrollToPositionSpy).not.toHaveBeenCalled();
    });
  });
});
