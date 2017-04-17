import { ReflectiveInjector } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { DOCUMENT } from '@angular/platform-browser';
import { AutoScrollService } from './auto-scroll.service';

describe('AutoScrollService', () => {
  let injector: ReflectiveInjector,
      autoScroll: AutoScrollService,
      location: MockPlatformLocation,
      document: MockDocument;

  class MockPlatformLocation {
    hash: string;
  }

  class MockDocument {
    body = new MockElement();
    getElementById = jasmine.createSpy('Document getElementById');
  }

  class MockElement {
    scrollIntoView = jasmine.createSpy('Element scrollIntoView');
  }

  beforeEach(() => {
    spyOn(window, 'scrollBy');
  });

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        AutoScrollService,
        { provide: DOCUMENT, useClass: MockDocument },
        { provide: PlatformLocation, useClass: MockPlatformLocation }
    ]);
    location = injector.get(PlatformLocation);
    document = injector.get(DOCUMENT);
    autoScroll = injector.get(AutoScrollService);
  });

  it('should scroll to the top if there is no hash', () => {
    location.hash = '';

    const topOfPage = new MockElement();
    document.getElementById.and
            .callFake(id  => id === 'top-of-page' ? topOfPage : null);

    autoScroll.scroll();
    expect(topOfPage.scrollIntoView).toHaveBeenCalled();
  });

  it('should not scroll if the hash does not match an element id', () => {
    location.hash = 'not-found';
    document.getElementById.and.returnValue(null);

    autoScroll.scroll();
    expect(document.getElementById).toHaveBeenCalledWith('not-found');
    expect(window.scrollBy).not.toHaveBeenCalled();
  });

  it('should scroll to the element whose id matches the hash', () => {
    const element = new MockElement();
    location.hash = 'some-id';
    document.getElementById.and.returnValue(element);

    autoScroll.scroll();
    expect(document.getElementById).toHaveBeenCalledWith('some-id');
    expect(element.scrollIntoView).toHaveBeenCalled();
    expect(window.scrollBy).toHaveBeenCalledWith(0, -80);
  });
});
