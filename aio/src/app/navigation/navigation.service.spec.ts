import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  CurrentNodes, NavigationNode, navigationPath, NavigationService, NavigationViews, VersionInfo,
} from 'app/navigation/navigation.service';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';

describe('NavigationService', () => {

  let injector: Injector;
  let navService: NavigationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    injector = TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        NavigationService,
        { provide: LocationService, useFactory: () => new MockLocationService('a') }
      ]
    });

    navService = injector.get(NavigationService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('navigationViews', () => {

    it('should make a single connection to the server', () => {
      const req = httpMock.expectOne({});
      expect(req.request.url).toBe('generated/navigation.json');
    });

    it('should expose the server response', () => {
      const viewsEvents: NavigationViews[] = [];
      navService.navigationViews.subscribe(views => viewsEvents.push(views));

      expect(viewsEvents).toEqual([]);
      httpMock.expectOne({}).flush({ TopBar: [ { title: '', url: 'a' }] });
      expect(viewsEvents).toEqual([{ TopBar: [ { title: '', url: 'a' }] }]);
    });

    it('navigationViews observable should complete', () => {
      let completed = false;
      navService.navigationViews.subscribe({complete: () => completed = true});

      httpMock.expectOne({method: 'get', url: navigationPath}).flush({});
      expect(completed).withContext('observable completed').toBe(true);
    });

    it('should return the same object to all subscribers', () => {
      let views1: NavigationViews|undefined;
      navService.navigationViews.subscribe(views => views1 = views);

      let views2: NavigationViews|undefined;
      navService.navigationViews.subscribe(views => views2 = views);

      httpMock.expectOne({}).flush({ TopBar: [{ url: 'a' }] });

      let views3: NavigationViews|undefined;
      navService.navigationViews.subscribe(views => views3 = views);

      expect(views2).toBe(views1);
      expect(views3).toBe(views1);

      // Verfy that subsequent subscriptions did not trigger another request.
      httpMock.expectNone({});
    });

    it('should do WHAT(?) if the request fails');
  });

  describe('node.tooltip', () => {
    let view: NavigationNode[];

    const sideNav: NavigationNode[] = [
      { title: 'a', tooltip: 'a tip' },
      { title: 'b' },
      { title: 'c!'},
      { title: '', url: 'foo' }
    ];

    beforeEach(() => {
      navService.navigationViews.subscribe(views => view = views.sideNav);
      httpMock.expectOne({}).flush({sideNav});
    });

    it('should have the supplied tooltip', () => {
      expect(view[0].tooltip).toEqual('a tip');
    });

    it('should create a tooltip from title + period', () => {
      expect(view[1].tooltip).toEqual('b.');
    });

    it('should create a tooltip from title, keeping its trailing punctuation', () => {
      expect(view[2].tooltip).toEqual('c!');
    });

    it('should not create a tooltip if there is no title', () => {
      expect(view[3].tooltip).toBeUndefined();
    });
  });

  describe('currentNode', () => {
    let currentNodes: CurrentNodes;
    let locationService: MockLocationService;

    const topBarNodes: NavigationNode[] = [
      { url: 'features', title: 'Features', tooltip: 'tip' }
    ];
    const sideNavNodes: NavigationNode[] = [
        { title: 'a', tooltip: 'tip', children: [
          { url: 'b', title: 'b', tooltip: 'tip', children: [
            { url: 'c', title: 'c', tooltip: 'tip' },
            { url: 'd', title: 'd', tooltip: 'tip' }
          ] },
          { url: 'e', title: 'e', tooltip: 'tip' }
        ] },
        { url: 'f', title: 'f', tooltip: 'tip' }
      ];

    const navJson = {
      TopBar: topBarNodes,
      SideNav: sideNavNodes,
      __versionInfo: {}
    };

    beforeEach(() => {
      locationService = injector.get(LocationService) as any as MockLocationService;
      navService.currentNodes.subscribe(selected => currentNodes = selected);
      httpMock.expectOne({}).flush(navJson);
    });

    it('should list the side navigation node that matches the current location, and all its ancestors', () => {
      locationService.go('b');
      expect(currentNodes).toEqual({
        SideNav: {
          url: 'b',
          view: 'SideNav',
          nodes: [
            sideNavNodes[0].children?.[0] as NavigationNode,
            sideNavNodes[0]
          ]
        }
      });

      locationService.go('d');
      expect(currentNodes).toEqual({
        SideNav: {
          url: 'd',
          view: 'SideNav',
          nodes: [
            sideNavNodes[0].children?.[0].children?.[1] as NavigationNode,
            sideNavNodes[0].children?.[0] as NavigationNode,
            sideNavNodes[0]
          ]
        }
      });

      locationService.go('f');
      expect(currentNodes).toEqual({
        SideNav: {
          url: 'f',
          view: 'SideNav',
          nodes: [ sideNavNodes[1] ]
        }
      });
    });

    it('should be a TopBar selected node if the current location is a top menu node', () => {
      locationService.go('features');
      expect(currentNodes).toEqual({
        TopBar: {
          url: 'features',
          view: 'TopBar',
          nodes: [ topBarNodes[0] ]
        }
      });
    });

    it('should be a plain object if no navigation node matches the current location', () => {
      locationService.go('g?search=moo#anchor-1');
      expect(currentNodes).toEqual({
        '': {
          url: 'g',
          view: '',
          nodes: []
        }
      });
    });

    it('should ignore trailing slashes, hashes, and search params on URLs in the navmap', () => {
      const cnode: CurrentNodes = {
        SideNav: {
          url: 'c',
          view: 'SideNav',
          nodes: [
            sideNavNodes[0].children?.[0].children?.[0] as NavigationNode,
            sideNavNodes[0].children?.[0] as NavigationNode,
            sideNavNodes[0]
          ]
        }
      };

      locationService.go('c');
      expect(currentNodes).withContext('location: c').toEqual(cnode);

      locationService.go('c#foo');
      expect(currentNodes).withContext('location: c#foo').toEqual(cnode);

      locationService.go('c?foo=1');
      expect(currentNodes).withContext('location: c?foo=1').toEqual(cnode);

      locationService.go('c#foo?bar=1&baz=2');
      expect(currentNodes).withContext('location: c#foo?bar=1&baz=2').toEqual(cnode);
    });
  });

  describe('versionInfo', () => {
    const expectedVersionInfo = { major: 4 } as VersionInfo;
    let versionInfo: VersionInfo;

    beforeEach(() => {
      navService.versionInfo.subscribe(info => versionInfo = info);
      httpMock.expectOne({}).flush({
        __versionInfo: expectedVersionInfo
      });
    });

    it('should extract the version info', () => {
      expect(versionInfo).toEqual(expectedVersionInfo);
    });
  });

  describe('docVersions', () => {
    let actualDocVersions: NavigationNode[];
    let docVersions: NavigationNode[];
    let expectedDocVersions: NavigationNode[];

    beforeEach(() => {
      actualDocVersions = [];
      docVersions = [
        { title: 'v4.0.0' },
        { title: 'v2', url: 'https://v2.angular.io' }
      ];

      expectedDocVersions = docVersions.map(v => (
        {...v, ...{ tooltip: v.title + '.'}})
      );

      navService.navigationViews.subscribe(views => actualDocVersions = views.docVersions);
    });

    it('should extract the docVersions', () => {
      httpMock.expectOne({}).flush({ docVersions });
      expect(actualDocVersions).toEqual(expectedDocVersions);
    });
  });
});
