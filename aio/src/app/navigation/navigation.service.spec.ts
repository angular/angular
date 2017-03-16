import { ReflectiveInjector } from '@angular/core';
import { FileLoaderService } from 'app/shared/file-loader.service';
import { TestFileLoaderService } from 'testing/file-loader.service';

import { NavigationService, NavigationViews, NavigationNode, VersionInfo } from 'app/navigation/navigation.service';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';
import { Logger } from 'app/shared/logger.service';

describe('NavigationService', () => {

  let injector: ReflectiveInjector;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        NavigationService,
        { provide: LocationService, useFactory: () => new MockLocationService('a') },
        { provide: FileLoaderService, useClass: TestFileLoaderService },
        Logger
    ]);
  });

  it('should be creatable', () => {
    const service: NavigationService = injector.get(NavigationService);
    expect(service).toBeTruthy();
  });

  describe('navigationViews', () => {
    let service: NavigationService;
    let loader: TestFileLoaderService;

    beforeEach(() => {
      loader = injector.get(FileLoaderService);
      service = injector.get(NavigationService);
    });

    it('should make a single connection to the server', () => {
      expect(loader.connectionsArray.length).toEqual(1);
      expect(loader.connectionsArray[0].url).toBe('navigation.json');
    });

    it('should expose the server response', () => {
      const viewsEvents: NavigationViews[] = [];
      const json = { TopBar: [ { url: 'a' }] };
      service.navigationViews.subscribe(views => viewsEvents.push(views));

      expect(viewsEvents).toEqual([]);
      loader.connectionsArray[0].mockRespond(json);
      expect(viewsEvents).toEqual([json]);
    });

    it('should return the same object to all subscribers', () => {

      const json = { TopBar: [ { url: 'a' }] };

      let views1: NavigationViews;
      service.navigationViews.subscribe(views => views1 = views);

      let views2: NavigationViews;
      service.navigationViews.subscribe(views => views2 = views);

      loader.connectionsArray[0].mockRespond(json);

      // modify the response so we can check that future subscriptions do not trigger another request
      loader.connectionsArray[0].mockRespond({ TopBar: [{ url: 'error 1' }] });

      let views3: NavigationViews;
      service.navigationViews.subscribe(views => views3 = views);

      expect(views2).toBe(views1);
      expect(views3).toBe(views1);
    });


    it('should do WHAT(?) if the request fails');
  });

  describe('selectedNodes', () => {
    let service: NavigationService;
    let loader: TestFileLoaderService;
    let location: MockLocationService;
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

      loader = injector.get(FileLoaderService);
      loader.connectionsArray[0].mockRespond({ nav: nodeTree });
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
    let loader: TestFileLoaderService;
    let service: NavigationService;
    let versionInfo: VersionInfo;

    beforeEach(() => {
      service = injector.get(NavigationService);
      service.versionInfo.subscribe(info => versionInfo = info);

      loader = injector.get(FileLoaderService);
      loader.connectionsArray[0].mockRespond({
        __versionInfo: { raw: '4.0.0' }
      });
    });

    it('should extract the version info', () => {
      expect(versionInfo).toEqual({ raw: '4.0.0' });
    });
  });
});
