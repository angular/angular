import { ReflectiveInjector } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';
import { MockLocationStrategy } from '@angular/common/testing';
import { Http, ConnectionBackend, RequestOptions, BaseRequestOptions, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { NavigationService, NavigationViews } from 'app/navigation/navigation.service';
import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';

describe('NavigationService', () => {

  let injector: ReflectiveInjector;

  function createResponse(body: any) {
    return new Response(new ResponseOptions({ body: JSON.stringify(body) }));
  }

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        NavigationService,
        LocationService,
        Location,
        { provide: LocationStrategy, useClass: MockLocationStrategy },
        { provide: ConnectionBackend, useClass: MockBackend },
        { provide: RequestOptions, useClass: BaseRequestOptions },
        Http,
        Logger
    ]);
  });

  it('should be creatable', () => {
    const service: NavigationService = injector.get(NavigationService);
    expect(service).toBeTruthy();
  });

  describe('navigationViews', () => {
    let service: NavigationService, backend: MockBackend;

    beforeEach(() => {
      backend = injector.get(ConnectionBackend);
      service = injector.get(NavigationService);
    });

    it('should make a single connection to the server', () => {
      expect(backend.connectionsArray.length).toEqual(1);
      expect(backend.connectionsArray[0].request.url).toEqual('content/navigation.json');
    });

    it('should expose the server response', () => {
      const viewsEvents: NavigationViews[] = [];
      service.navigationViews.subscribe(views => viewsEvents.push(views));

      expect(viewsEvents).toEqual([]);
      backend.connectionsArray[0].mockRespond(createResponse({ TopBar: [ { path: 'a' }] }));
      expect(viewsEvents).toEqual([{ TopBar: [ { path: 'a' }] }]);

    });

    it('should return the same object to all subscribers', () => {
      let views1: NavigationViews;
      service.navigationViews.subscribe(views => views1 = views);

      let views2: NavigationViews;
      service.navigationViews.subscribe(views => views2 = views);

      backend.connectionsArray[0].mockRespond(createResponse({ TopBar: [{ path: 'a' }] }));

      // modify the response so we can check that future subscriptions do not trigger another request
      backend.connectionsArray[0].response.next(createResponse({ TopBar: [{ path: 'error 1' }] }));

      let views3: NavigationViews;
      service.navigationViews.subscribe(views => views3 = views);

      expect(views2).toBe(views1);
      expect(views3).toBe(views1);
    });


    it('should do WHAT(?) if the request fails', () => {
      console.warn('PENDING: NavigationService navigationViews should do WHAT(?) if the request fails');
    });
  });

  describe('navigationMap', () => {
    it('should compute the navigation map', () => {
      console.warn('PENDING: NavigationService navigationMap should compute the navigation map');
    });
  });
});
