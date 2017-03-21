import { ReflectiveInjector } from '@angular/core';
import { Http, ConnectionBackend, RequestOptions, BaseRequestOptions, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { NavigationService, NavigationViews, NavigationNode, VersionInfo } from 'app/navigation/navigation.service';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';
import { Logger } from 'app/shared/logger.service';

describe('NavigationService', () => {

  let injector: ReflectiveInjector;

  function createResponse(body: any) {
    return new Response(new ResponseOptions({ body: JSON.stringify(body) }));
  }

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        NavigationService,
        { provide: LocationService, useFactory: () => new MockLocationService('a') },
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
      backend.connectionsArray[0].mockRespond(createResponse({ TopBar: [ { url: 'a' }] }));
      expect(viewsEvents).toEqual([{ TopBar: [ { url: 'a' }] }]);

    });

    it('should return the same object to all subscribers', () => {
      let views1: NavigationViews;
      service.navigationViews.subscribe(views => views1 = views);

      let views2: NavigationViews;
      service.navigationViews.subscribe(views => views2 = views);

      backend.connectionsArray[0].mockRespond(createResponse({ TopBar: [{ url: 'a' }] }));

      // modify the response so we can check that future subscriptions do not trigger another request
      backend.connectionsArray[0].response.next(createResponse({ TopBar: [{ url: 'error 1' }] }));

      let views3: NavigationViews;
      service.navigationViews.subscribe(views => views3 = views);

      expect(views2).toBe(views1);
      expect(views3).toBe(views1);
    });


    it('should do WHAT(?) if the request fails');
  });

  describe('selectedNodes', () => {
    let service: NavigationService, location: MockLocationService;
    let currentNodes: NavigationNode[];
    const nodeTree: NavigationNode[] = [
      { title: 'a', children: [
        { url: 'b', title: 'b', children: [
          { url: 'c', title: 'c' },
          { url: 'd', title: 'd' }
        ] },
        { url: 'e', title: 'e' }
      ] },
      { url: 'f', title: 'f' }
    ];

    beforeEach(() => {
      location = injector.get(LocationService);

      service = injector.get(NavigationService);
      service.selectedNodes.subscribe(nodes => currentNodes = nodes);

      const backend = injector.get(ConnectionBackend);
      backend.connectionsArray[0].mockRespond(createResponse({ nav: nodeTree }));
    });

    it('should list the navigation node that matches the current location, and all its ancestors', () => {
      location.urlSubject.next('b');
      expect(currentNodes).toEqual([
        nodeTree[0].children[0],
        nodeTree[0]
      ]);

      location.urlSubject.next('d');
      expect(currentNodes).toEqual([
        nodeTree[0].children[0].children[1],
        nodeTree[0].children[0],
        nodeTree[0]
      ]);

      location.urlSubject.next('f');
      expect(currentNodes).toEqual([
        nodeTree[1]
      ]);
    });

    it('should be an empty array if no navigation node matches the current location', () => {
      location.urlSubject.next('g');
      expect(currentNodes).toEqual([]);
    });
  });

  describe('versionInfo', () => {
    let service: NavigationService, versionInfo: VersionInfo;

    beforeEach(() => {
      service = injector.get(NavigationService);
      service.versionInfo.subscribe(info => versionInfo = info);

      const backend = injector.get(ConnectionBackend);
      backend.connectionsArray[0].mockRespond(createResponse({
        __versionInfo: { raw: '4.0.0' }
      }));
    });

    it('should extract the version info', () => {
      expect(versionInfo).toEqual({ raw: '4.0.0' });
    });
  });
});
