import { ReflectiveInjector } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { DOCUMENT } from '@angular/platform-browser';

import { ScrollService, topMargin } from './scroll.service';

describe('ScrollService', () => {
  const topOfPageElem = {} as Element;
  let injector: ReflectiveInjector;
  let document: MockDocument;
  let location: MockPlatformLocation;
  let scrollService: ScrollService;

  class MockPlatformLocation {
    hash: string;
  }

  class MockDocument {
    body = new MockElement();
    getElementById = jasmine.createSpy('Document getElementById').and.returnValue(topOfPageElem);
    querySelector = jasmine.createSpy('Document querySelector');
  }

  class MockElement {
    getBoundingClientRect = jasmine.createSpy('Element getBoundingClientRect')
                                   .and.returnValue({top: 0});
    scrollIntoView = jasmine.createSpy('Element scrollIntoView');
  }

  beforeEach(() => {
    spyOn(window, 'scrollBy');
  });

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        ScrollService,
        { provide: DOCUMENT, useClass: MockDocument },
        { provide: PlatformLocation, useClass: MockPlatformLocation }
    ]);
    location = injector.get(PlatformLocation);
    document = injector.get(DOCUMENT);
    scrollService = injector.get(ScrollService);
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
      location.hash = '';

      const topOfPage = new MockElement();
      document.getElementById.and
              .callFake((id: string) => id === 'top-of-page' ? topOfPage : null);

      scrollService.scroll();
      expect(topOfPage.scrollIntoView).toHaveBeenCalled();
    });

    it('should not scroll if the hash does not match an element id', () => {
      location.hash = 'not-found';
      document.getElementById.and.returnValue(null);

      scrollService.scroll();
      expect(document.getElementById).toHaveBeenCalledWith('not-found');
      expect(window.scrollBy).not.toHaveBeenCalled();
    });

    it('should scroll to the element whose id matches the hash', () => {
      const element = new MockElement();
      location.hash = 'some-id';
      document.getElementById.and.returnValue(element);

      scrollService.scroll();
      expect(document.getElementById).toHaveBeenCalledWith('some-id');
      expect(element.scrollIntoView).toHaveBeenCalled();
      expect(window.scrollBy).toHaveBeenCalled();
    });

    it('should scroll to the element whose id matches the hash with encoded characters', () => {
      const element = new MockElement();
      location.hash = '%F0%9F%91%8D'; // 👍
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
      const topOfPageElement = <Element><any> new MockElement();
      document.getElementById.and.callFake(
        (id: string) => id === 'top-of-page' ? topOfPageElement : null
      );

      scrollService.scrollToTop();
      expect(topOfPageElement.scrollIntoView).toHaveBeenCalled();
      expect(window.scrollBy).toHaveBeenCalledWith(0, -topMargin);
    });
  });

});
