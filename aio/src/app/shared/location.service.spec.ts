import { ReflectiveInjector } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';
import { LocationService } from './location.service';

describe('LocationService', () => {

  let injector: ReflectiveInjector;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        LocationService,
        Location,
        { provide: LocationStrategy, useClass: MockLocationStrategy }
    ]);
  });

  describe('urlStream', () => {
    it('should emit the latest url at the time it is subscribed to', () => {

      const location: MockLocationStrategy = injector.get(LocationStrategy);

      location.simulatePopState('/initial-url1');
      location.simulatePopState('/initial-url2');
      location.simulatePopState('/initial-url3');

      const service: LocationService = injector.get(LocationService);

      location.simulatePopState('/next-url1');
      location.simulatePopState('/next-url2');
      location.simulatePopState('/next-url3');

      let initialUrl;
      service.currentUrl.subscribe(url => initialUrl = url);
      expect(initialUrl).toEqual('next-url3');
    });

    it('should emit all location changes after it has been subscribed to', () => {
      const location: MockLocationStrategy = injector.get(LocationStrategy);
      const service: LocationService = injector.get(LocationService);

      location.simulatePopState('/initial-url1');
      location.simulatePopState('/initial-url2');
      location.simulatePopState('/initial-url3');

      const urls = [];
      service.currentUrl.subscribe(url => urls.push(url));

      location.simulatePopState('/next-url1');
      location.simulatePopState('/next-url2');
      location.simulatePopState('/next-url3');

      expect(urls).toEqual([
        'initial-url3',
        'next-url1',
        'next-url2',
        'next-url3'
      ]);
    });

    it('should pass only the latest and later urls to each subscriber', () => {
        const location: MockLocationStrategy = injector.get(LocationStrategy);
        const service: LocationService = injector.get(LocationService);

        location.simulatePopState('/initial-url1');
        location.simulatePopState('/initial-url2');
        location.simulatePopState('/initial-url3');

        const urls1 = [];
        service.currentUrl.subscribe(url => urls1.push(url));

        location.simulatePopState('/next-url1');
        location.simulatePopState('/next-url2');

        const urls2 = [];
        service.currentUrl.subscribe(url => urls2.push(url));

        location.simulatePopState('/next-url3');

        expect(urls1).toEqual([
          'initial-url3',
          'next-url1',
          'next-url2',
          'next-url3'
        ]);

        expect(urls2).toEqual([
          'next-url2',
          'next-url3'
        ]);
    });
  });

  describe('go', () => {
    it('should update the location', () => {
      const location: MockLocationStrategy = injector.get(LocationStrategy);
      const service: LocationService = injector.get(LocationService);

      service.go('some-new-url');

      expect(location.internalPath).toEqual('some-new-url');
      expect(location.path(true)).toEqual('some-new-url');
    });

    it('should emit the new url', () => {
      const location: MockLocationStrategy = injector.get(LocationStrategy);
      const service: LocationService = injector.get(LocationService);

      service.go('some-initial-url');

      const urls = [];
      service.currentUrl.subscribe(url => urls.push(url));

      service.go('some-new-url');

      expect(urls).toEqual([
        'some-initial-url',
        'some-new-url'
      ]);
    });
  });
});
