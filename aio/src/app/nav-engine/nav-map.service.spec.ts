import { fakeAsync, tick } from '@angular/core/testing';
import { Http, Response } from '@angular/http';

import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';

import { DocFetchingService } from './doc-fetching.service';
import { NavNode, NavMap } from './doc.model';
import { NavMapService } from './nav-map.service';

import { getTestNavMapResponse } from '../../testing/nav-map-json-response';

describe('NavMapService', () => {
  let httpSpy: any;
  let loggerSpy: any;
  let navMapService: NavMapService;
  let navMap: NavMap;

  beforeEach(done => {
    httpSpy = jasmine.createSpyObj('http', ['get']);
    httpSpy.get.and.returnValue(of(getTestNavMapResponse()).delay(0).take(1)); // take(1) -> completes
    loggerSpy = jasmine.createSpyObj('logger', ['log', 'warn', 'error']);

    navMapService = new NavMapService(new DocFetchingService(null, null), httpSpy, loggerSpy);

    navMapService.navMap.take(1).subscribe(
      nm => navMap = nm,
      null,
      done);
  });

  it('should return a navMap', () => {
    expect(navMap).toBeDefined();
  });

  it('should have filtered away the "cli-quickstart" because `hide`===true', () => {
    const item = navMap.nodes.find(n => n.docId === 'guide/cli-quickstart');
    expect(item).toBeUndefined();
  });

  describe('Quickstart', () => {
    let item: NavNode;

    beforeEach(() => {
      item = navMap.nodes.find(n => n.navTitle === 'Quickstart');
    });

    it('should have expected item', () => {
      expect(item).toBeDefined();
    });

    it('should have expected docId', () => {
      expect(item.docId).toBe('guide/quickstart');
    });

    it('should have calculated expected docPath', () => {
      expect(item.docPath).toBe('content/guide/quickstart.html');
    });

    it('should have no ancestors because it is a top-level item', () => {
      expect(item.ancestorIds).toEqual([]);
    });
  });

  describe('Getting Started', () => {
    let section: NavNode;

    beforeEach(() => {
      section = navMap.nodes.find(n => n.navTitle === 'Getting started');
    });

    it('should have an id', () => {
      expect(section.id).toBeGreaterThan(0);
    });

    it('should have distinct tooltip', () => {
      expect(section.tooltip).not.toBe(section.navTitle);
    });

    it('should have 2 children', () => {
      expect(section.children.length).toBe(2);
    });

    it('should have itself as ancestor because it has children', () => {
      expect(section.ancestorIds).toEqual([section.id]);
    });
  });

  describe('Tutorial', () => {
    let section: NavNode;
    let intro: NavNode;

    beforeEach(() => {
      section = navMap.nodes.find(n => n.navTitle === 'Tutorial');
      if (section && section.children) {
        intro = section.children.find(n => n.navTitle === 'Introduction');
      }
    });

    it('should have 2 children', () => {
      expect(section.children.length).toBe(2);
    });

    it('intro child\'s docId ends in "/"', () => {
      expect(intro.docId[intro.docId.length - 1]).toEqual('/');
    });

    it('intro child\'s calculated docPath ends in "index.html"', () => {
      expect(intro.docPath).toMatch(/index.html$/);
    });
  });

  describe('Core (3-level)', () => {
    let section: NavNode;

    beforeEach(() => {
      section = navMap.nodes.find(n => n.navTitle === 'Core');
    });

    it('should have 2 children', () => {
      expect(section.children.length).toBe(2);
    });

    describe('->directives', () => {
      let directives: NavNode;

      beforeEach(() => {
        directives = section.children.find(n => n.navTitle === 'Directives');
      });

      it('should have a heading docId', () => {
        expect(directives.docId).toBeTruthy();
      });

      it('should have calculated expected docPath', () => {
        expect(directives.docPath).toBe('content/guide/directives.html');
      });

      it('should have 2 children', () => {
        expect(directives.children.length).toBe(2);
      });

      it('children should have two ancestor ids in lineal order', () => {
        const expectedAncestors = [section.id, directives.id];
        expect(directives.children[0].ancestorIds).toEqual(expectedAncestors, '#1');
        expect(directives.children[1].ancestorIds).toEqual(expectedAncestors, '#2');
      });
    });
  });

  describe('Empty Heading', () => {
    let section: NavNode;

    beforeEach(() => {
      section = navMap.nodes.find(n => n.navTitle === 'Empty Heading');
    });

    it('should have no children', () => {
      expect(section.children.length).toBe(0);
    });

    it('should have itself as ancestor because it has a `children` array', () => {
      expect(section.ancestorIds).toEqual([section.id]);
    });
  });

  describe('External', () => {
    let section: NavNode;
    let gitter: NavNode;

    beforeEach(() => {
      section = navMap.nodes.find(n => n.navTitle === 'External');
      if (section && section.children) {
        gitter = section.children[0];
      }
    });

    it('should have one child (gitter)', () => {
      expect(section.children.length).toBe(1);
    });

    it('child should have a url', () => {
      expect(gitter.url).toBeTruthy();
    });

    it('child should not have a docId', () => {
      expect(gitter.docId).toBeUndefined();
    });

    it('child should not have a docPath', () => {
      expect(gitter.docPath).toBeUndefined();
    });

    it('child should have parent as only ancestor id', () => {
      expect(gitter.ancestorIds).toEqual([section.id]);
    });
  });
});
