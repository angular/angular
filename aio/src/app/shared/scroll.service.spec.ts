import { ReflectiveInjector } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { DOCUMENT } from '@angular/platform-browser';

import { ScrollService, topMargin } from './scroll.service';

describe('ScrollService', () => {
  let injector: ReflectiveInjector;
  let document: MockDocument;
  let location: MockPlatformLocation;
  let scrollService: ScrollService;

  class MockPlatformLocation {
    hash: string;
  }

  class MockDocument {
    body = new MockElement();
    getElementById = jasmine.createSpy('Document getElementById');
    querySelector = jasmine.createSpy('Document querySelector');
  }

  class MockElement {
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

  describe('#scroll', () => {
    it('should scroll to the top if there is no hash', () => {
      location.hash = '';

      const topOfPage = new MockElement();
      document.getElementById.and
              .callFake(id  => id === 'top-of-page' ? topOfPage : null);

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
  });

  describe('#scrollToElement', () => {
    it('should scroll to element', () => {
      const element = <Element><any> new MockElement();
      scrollService.scrollToElement(element);
      expect(element.scrollIntoView).toHaveBeenCalled();
      expect(window.scrollBy).toHaveBeenCalledWith(0, -topMargin);
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
        id => id === 'top-of-page' ? topOfPageElement : null
      );

      scrollService.scrollToTop();
      expect(topOfPageElement.scrollIntoView).toHaveBeenCalled();
      expect(window.scrollBy).toHaveBeenCalledWith(0, -topMargin);
    });
  });

});
