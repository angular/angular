import { ReflectiveInjector } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { DOCUMENT } from '@angular/platform-browser';
import { AutoScrollService } from './auto-scroll.service';


describe('AutoScrollService', () => {
  let injector: ReflectiveInjector,
      autoScroll: AutoScrollService,
      container: HTMLElement,
      location: MockPlatformLocation,
      document: MockDocument;

  class MockPlatformLocation {
    hash: string;
  }

  class MockDocument {
    getElementById = jasmine.createSpy('Document getElementById');
  }

  class MockElement {
    scrollIntoView = jasmine.createSpy('Element scrollIntoView');
  }

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        AutoScrollService,
        { provide: DOCUMENT, useClass: MockDocument },
        { provide: PlatformLocation, useClass: MockPlatformLocation }
    ]);
    location = injector.get(PlatformLocation);
    document = injector.get(DOCUMENT);
    container = window.document.createElement('div');
    container.scrollTop = 100;
    autoScroll = injector.get(AutoScrollService);
  });

  it('should scroll the container to the top if there is no hash', () => {
    location.hash = '';

    autoScroll.scroll(container);
    expect(container.scrollTop).toEqual(0);
  });

  it('should scroll the container to the top if the hash does not match an element id', () => {
    location.hash = 'some-id';
    document.getElementById.and.returnValue(null);

    autoScroll.scroll(container);
    expect(document.getElementById).toHaveBeenCalledWith('some-id');
    expect(container.scrollTop).toEqual(0);
  });

  it('should scroll the container to the element whose id matches the hash', () => {
    const element = new MockElement();
    location.hash = 'some-id';
    document.getElementById.and.returnValue(element);

    autoScroll.scroll(container);
    expect(document.getElementById).toHaveBeenCalledWith('some-id');
    expect(element.scrollIntoView).toHaveBeenCalled();
  });
});
