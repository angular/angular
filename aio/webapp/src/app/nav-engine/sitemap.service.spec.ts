import { fakeAsync, tick } from '@angular/core/testing';
import { Http, Response } from '@angular/http';

import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';

import { NavigationMapEntry, NavigationMap, SiteMap } from './doc.model';
import { SiteMapService } from './sitemap.service';

describe('SiteMapService', () => {
  let httpSpy: any;
  let loggerSpy: any;
  let siteMapService: SiteMapService;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('http', ['get']);
    httpSpy.get.and.returnValue(of(getFakeSiteMapResponse()).delay(0));
    loggerSpy = jasmine.createSpyObj('logger', ['log', 'warn', 'error']);

    siteMapService = new SiteMapService(httpSpy, loggerSpy);
  });

  describe('#siteMap', () => {
    let siteMap: SiteMap;

    beforeEach(fakeAsync(() => {
      siteMap = undefined;
      siteMapService.siteMap.subscribe(map => siteMap = map);
      tick();
    }));

    it('should build the sitemap', () => {
      expect(siteMap).toBeDefined();
    });

    it('should set the guide entry path to "index.html"', () => {
      const gsSection = siteMap.navigationMap['getting-started'];
      expect(gsSection).toBeDefined('should have "getting-started" section');
      const guidePath = gsSection.entries[0].path;
      expect(guidePath).toBe('guide/index.html');
    });

    it('should not change defined props of id:"guide"', () => {
      const guideEntry = siteMap.docs['guide'];
      const title = guideEntry.title;
      expect(guideEntry).toBeDefined('should have a doc entry under id:"guide"');
      expect(guideEntry.path).toBe('guide/index.html', 'path be guide\'s "index.html"');
      expect(guideEntry.navTitle).not.toBe(title, 'navTitle should NOT be same as title');
      expect(guideEntry.tooltip).not.toBe(title, 'tooltip should NOT be same as title');
    });

    it('should fill in empty props of id:"foo"', () => {
      const fooEntry = siteMap.docs['foo'];
      const title = fooEntry.title;
      expect(fooEntry).toBeDefined('should have a doc entry under id:"foo"');
      expect(fooEntry.path).toBe('foo.html', 'path should have .html extension');
      expect(fooEntry.navTitle).toBe(title, 'navTitle should be same as title');
      expect(fooEntry.tooltip).toBe(title, 'tooltip should be same as title');
    });
  });

  describe('#siteMap.paths', () => {
    let siteMap: SiteMap;

    beforeEach(fakeAsync(() => {
      siteMap = undefined;
      siteMapService.siteMap.subscribe(map => siteMap = map);
      tick();
    }));

    // One level
    it('should have [menu] ancestor for path "foo.html" ', () => {
      const entries = siteMap.paths['foo.html'];
      expect(entries.length).toBe(1, 'expected one entry');
      expect(entries[0].ancestorIds).toEqual(['menu']);
    });

    // guide/quickstart.html appears twice in the navigation map
    it('should have two entries for path "guide/quickstart.html", solo (primary) and under "menu"', () => {
      const entries = siteMap.paths['guide/quickstart.html'];
      expect(entries.length).toBe(2, 'expected two entries');
      expect(entries[0].ancestorIds).toEqual(['menu'], '1st entry ancestors should be "menu"');
      expect(entries[1].ancestorIds).toEqual([], '2nd entry should be empty');
      expect(entries[1].primary).toBe(true, '2nd entry ancestors should be primary');
    });

    // guide/directives.html is both a doc and the "core/directives" section header
    it('should have [core, directives] ancestors for path "guide/directives.html" ', () => {
      const entries = siteMap.paths['guide/directives.html'];
      expect(entries.length).toBe(1, 'expected one entry');
      expect(entries[0].ancestorIds).toEqual(['core', 'directives']);
    });

    // Path is 3 levels deep in the navigation map
    it('should have [core, directives] ancestors for path "guide/structural-directives.html"', () => {
      const entries = siteMap.paths['guide/structural-directives.html'];
      expect(entries.length).toBe(1, 'expected one entry');
      expect(entries[0].ancestorIds).toEqual(['core', 'directives']);
    });
  });

  describe('#getDocMetadata', () => {
    it('should get news metadata', fakeAsync(() => {
      siteMapService.getDocMetadata('news').subscribe(
        metadata => expect(metadata.path).toBe('news.html')
      );
      tick();
    }));

    it('should be case insensitive', fakeAsync(() => {
      siteMapService.getDocMetadata('NeWs').subscribe(
        metadata => expect(metadata.path).toBe('news.html')
      );
      tick();
    }));

    it('should get "quide/quickstart" metadata', fakeAsync(() => {
      siteMapService.getDocMetadata('guide/quickstart').subscribe(
        metadata => expect(metadata.path).toBe('guide/quickstart.html')
      );
      tick();
    }));

    it('should get metadata by the id:"menu-quickstart"', fakeAsync(() => {
      siteMapService.getDocMetadata('menu-quickstart').subscribe(
        metadata => expect(metadata.path).toBe('guide/quickstart.html')
      );
      tick();
    }));

    it('should get deep "guide/structural-directives" metadata', fakeAsync(() => {
      siteMapService.getDocMetadata('guide/structural-directives').subscribe(
        metadata => expect(metadata.path).toBe('guide/structural-directives.html')
      );
      tick();
    }));

    it('should calculate metadata for id that begins "api/"', fakeAsync(() => {
      const apiId = 'api/my/dog/has/fleas';
      siteMapService.getDocMetadata(apiId).subscribe(
        metadata => expect(metadata.path).toBe(apiId + '.html')
      );
      tick();
    }));
  });

  describe('#getDocMetadataForPath', () => {

    it('should get metadata for path "news.html"', fakeAsync(() => {
      siteMapService.getDocMetadataForPath('news.html').subscribe(
        metadata => expect(metadata.id).toBe('news')
      );
      tick();
    }));

    it('should get primary metadata for "quide/quickstart.html"', fakeAsync(() => {
      siteMapService.getDocMetadataForPath('guide/quickstart.html').subscribe(
        metadata => {
          expect(metadata.id).toBe('guide/quickstart');
        });
      tick();
    }));

    it('should be case insensitive', fakeAsync(() => {
      siteMapService.getDocMetadataForPath('Guide/QuickStart.html').subscribe(
        metadata => {
          expect(metadata.id).toBe('guide/quickstart');
        });
      tick();
    }));

    it('should get deep "guide/attribute-directives.html" metadata', fakeAsync(() => {
      siteMapService.getDocMetadataForPath('guide/attribute-directives.html').subscribe(
        metadata => expect(metadata.id).toBe('attribute-directives')
      );
      tick();
    }));

    it('should calculate metadata for path that begins "api/"', fakeAsync(() => {
      const apiId = 'api/my/dog/has/fleas';
      siteMapService.getDocMetadataForPath(apiId + '.html').subscribe(
        metadata => expect(metadata.id).toBe(apiId)
      );
      tick();
    }));
  });

});

//////////////
function getFakeSiteMapResponse(): Response {
  // tslint:disable:quotemark
  const fakeNavMapJson = {
    "menu": {
      "id": "menu",
      "entries": [
        {
          "path": "news",
          "title": "News",
          "tooltip": ""
        },
        {
          "id": "menu-quickstart",
          "path": "guide/quickstart",
          "title": "Getting started",
          "tooltip": ""
        },
        {
          "path": "foo",
          "title": "Foo"
        },
      ]
    },

    "quickstart": {
      "path": "guide/quickstart",
      "primary": true,
      "title": "Quickstart",
      "tooltip": "A quick look at an Angular app."
    },

    "getting-started": {
      "id": "getting-started",
      "title": "Getting started",
      "entries": [
        {
          "id": "guide",
          "path": "guide/",
          "title": "Documentation overview",
          "navTitle": "Overview",
          "tooltip": "How to read and use this documentation."
        },
        {
          "path": "guide/setup",
          "title": "Setup for local development",
          "navTitle": "Setup",
          "tooltip": "Install the Angular QuickStart seed for faster, more efficient development on your machine."
        }
      ]
    },

    "core": {
      "id": "core",
      "title": "Core",
      "tooltip": "Learn the core capabilities of Angular",
      "entries": [
        {
          "path": "guide/ngmodule",
          "title": "Angular Modules (NgModule)",
          "tooltip": "Define application modules with @NgModule."
        },
        {
          "id": "directives",
          "title": "Directives",
          "path": "guide/directives",
          "entries": [
            {
              "id": "attribute-directives",
              "path": "guide/attribute-directives",
              "title": "Attribute directives",
              "tooltip": "Attribute directives attach behavior to elements."
            },
            {
              "path": "guide/structural-directives",
              "title": "Structural directives",
              "tooltip": "Structural directives manipulate the layout of the page."
            }
          ]
        }
      ]
    }
  };
  // tslint:enable:quotemark
  return {
    status: 200,
    json: () => fakeNavMapJson
  } as Response;
}
