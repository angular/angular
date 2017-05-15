import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { async, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { Http } from '@angular/http';
import { By } from '@angular/platform-browser';

import { BehaviorSubject} from 'rxjs/BehaviorSubject';
import { of } from 'rxjs/observable/of';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { DocViewerComponent } from 'app/layout/doc-viewer/doc-viewer.component';
import { GaService } from 'app/shared/ga.service';
import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';
import { MockLocationService } from 'testing/location.service';
import { MockLogger } from 'testing/logger.service';
import { MockSearchService } from 'testing/search.service';
import { MockSwUpdateNotificationsService } from 'testing/sw-update-notifications.service';
import { NavigationNode } from 'app/navigation/navigation.service';
import { ScrollService } from 'app/shared/scroll.service';
import { SearchBoxComponent } from 'app/search/search-box/search-box.component';
import { SearchResultsComponent } from 'app/search/search-results/search-results.component';
import { SearchService } from 'app/search/search.service';
import { SwUpdateNotificationsService } from 'app/sw-updates/sw-update-notifications.service';
import { TocComponent } from 'app/embedded/toc/toc.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let docViewer: HTMLElement;
  let hamburger: HTMLButtonElement;
  let locationService: MockLocationService;
  let sidenav: HTMLElement;

  beforeEach(() => {
    createTestingModule('a/b');

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.onResize(1033); // wide by default
    docViewer = fixture.debugElement.query(By.css('aio-doc-viewer')).nativeElement;
    hamburger = fixture.debugElement.query(By.css('.hamburger')).nativeElement;
    locationService = fixture.debugElement.injector.get(LocationService) as any;
    sidenav = fixture.debugElement.query(By.css('md-sidenav')).nativeElement;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('ServiceWorker update notifications', () => {
    it('should be enabled', () => {
      const swUpdateNotifications = TestBed.get(SwUpdateNotificationsService) as SwUpdateNotificationsService;
      expect(swUpdateNotifications.enable).toHaveBeenCalled();
    });
  });

  describe('onResize', () => {
    it('should update `isSideBySide` accordingly', () => {
      component.onResize(1033);
      expect(component.isSideBySide).toBe(true);
      component.onResize(500);
      expect(component.isSideBySide).toBe(false);
    });
  });

  describe('onScroll', () => {
    it('should update `tocMaxHeight` accordingly', () => {
      expect(component.tocMaxHeight).toBeUndefined();

      component.onScroll();
      expect(component.tocMaxHeight).toBeGreaterThan(0);
    });
  });

  describe('SideNav when side-by-side (wide)', () => {

    beforeEach(() => {
      component.onResize(1033); // side-by-side
    });

    it('should open when nav to a guide page (guide/pipes)', () => {
      locationService.go('guide/pipes');
      fixture.detectChanges();
      expect(sidenav.className).toMatch(/sidenav-open/);
    });

    it('should open when nav to an api page', () => {
      locationService.go('api/a/b/c/d');
      fixture.detectChanges();
      expect(sidenav.className).toMatch(/sidenav-open/);
    });

    it('should be closed when nav to a marketing page (features)', () => {
      locationService.go('features');
      fixture.detectChanges();
      expect(sidenav.className).toMatch(/sidenav-clos/);
    });

    describe('when manually closed', () => {

      beforeEach(() => {
        locationService.go('guide/pipes');
        fixture.detectChanges();
        hamburger.click();
        fixture.detectChanges();
      });

      it('should be closed', () => {
        expect(sidenav.className).toMatch(/sidenav-clos/);
      });

      it('should stay closed when nav from one guide page to another', () => {
        locationService.go('guide/bags');
        fixture.detectChanges();
        expect(sidenav.className).toMatch(/sidenav-clos/);
      });

      it('should stay closed when nav from a guide page to api page', () => {
        locationService.go('api');
        fixture.detectChanges();
        expect(sidenav.className).toMatch(/sidenav-clos/);
      });

      it('should reopen when nav to market page and back to guide page', () => {
        locationService.go('features');
        fixture.detectChanges();
        locationService.go('guide/bags');
        fixture.detectChanges();
        expect(sidenav.className).toMatch(/sidenav-open/);
      });
    });
  });

  describe('SideNav when NOT side-by-side (narrow)', () => {

    beforeEach(() => {
      component.onResize(1000); // NOT side-by-side
    });

    it('should be closed when nav to a guide page (guide/pipes)', () => {
      locationService.go('guide/pipes');
      fixture.detectChanges();
      expect(sidenav.className).toMatch(/sidenav-clos/);
    });

    it('should be closed when nav to an api page', () => {
      locationService.go('api/a/b/c/d');
      fixture.detectChanges();
      expect(sidenav.className).toMatch(/sidenav-clos/);
    });

    it('should be closed when nav to a marketing page (features)', () => {
      locationService.go('features');
      fixture.detectChanges();
      expect(sidenav.className).toMatch(/sidenav-clos/);
    });

    describe('when manually opened', () => {

      beforeEach(() => {
        locationService.go('guide/pipes');
        fixture.detectChanges();
        hamburger.click();
        fixture.detectChanges();
      });

      it('should be open', () => {
        expect(sidenav.className).toMatch(/sidenav-open/);
      });

      it('should close when click in gray content area overlay', () => {
        const sidenavBackdrop = fixture.debugElement.query(By.css('.mat-sidenav-backdrop')).nativeElement;
        sidenavBackdrop.click();
        fixture.detectChanges();
        expect(sidenav.className).toMatch(/sidenav-clos/);
      });

      it('should close when nav to another guide page', () => {
        locationService.go('guide/bags');
        fixture.detectChanges();
        expect(sidenav.className).toMatch(/sidenav-clos/);
      });

      it('should close when nav to api page', () => {
        locationService.go('api');
        fixture.detectChanges();
        expect(sidenav.className).toMatch(/sidenav-clos/);
      });

      it('should close again when nav to market page', () => {
        locationService.go('features');
        fixture.detectChanges();
        expect(sidenav.className).toMatch(/sidenav-clos/);
      });

    });
  });

  describe('SideNav version selector', () => {
    beforeEach(() => {
      component.onResize(1033); // side-by-side
    });

    it('should pick first (current) version by default', () => {
      const versionSelector = sidenav.querySelector('select');
      expect(versionSelector.value).toEqual(TestHttp.docVersions[0].title);
      expect(versionSelector.selectedIndex).toEqual(0);
    });

    // Older docs versions have an href
    it('should navigate when change to a version with an href', () => {
      component.onDocVersionChange(1);
      expect(locationService.go).toHaveBeenCalledWith(TestHttp.docVersions[1].url);
    });

    // The current docs version should not have an href
    // This may change when we perfect our docs versioning approach
    it('should not navigate when change to a version without an href', () => {
      component.onDocVersionChange(0);
      expect(locationService.go).not.toHaveBeenCalled();
    });
  });

  describe('pageId', () => {

    it('should set the id of the doc viewer container based on the current doc', () => {
      const container = fixture.debugElement.query(By.css('section.sidenav-content'));

      locationService.go('guide/pipes');
      fixture.detectChanges();
      expect(component.pageId).toEqual('guide-pipes');
      expect(container.properties['id']).toEqual('guide-pipes');

      locationService.go('news');
      fixture.detectChanges();
      expect(component.pageId).toEqual('news');
      expect(container.properties['id']).toEqual('news');

      locationService.go('');
      fixture.detectChanges();
      expect(component.pageId).toEqual('home');
      expect(container.properties['id']).toEqual('home');
    });

    it('should not be affected by changes to the query', () => {
      const container = fixture.debugElement.query(By.css('section.sidenav-content'));

      locationService.go('guide/pipes');
      fixture.detectChanges();

      locationService.go('guide/other?search=http');
      fixture.detectChanges();
      expect(component.pageId).toEqual('guide-other');
      expect(container.properties['id']).toEqual('guide-other');
    });
  });

  describe('hostClasses', () => {
    it('should set the css classes of the host container based on the current doc and navigation view', () => {
      const host = fixture.debugElement;

      locationService.go('guide/pipes');
      fixture.detectChanges();
      expect(host.properties['className']).toEqual('page-guide-pipes folder-guide view-SideNav');

      locationService.go('features');
      fixture.detectChanges();
      expect(host.properties['className']).toEqual('page-features folder-features view-TopBar');

      locationService.go('');
      fixture.detectChanges();
      expect(host.properties['className']).toEqual('page-home folder-home view-');
    });
  });

  describe('currentDocument', () => {

    it('should display a guide page (guide/pipes)', () => {
      locationService.go('guide/pipes');
      fixture.detectChanges();
      expect(docViewer.innerText).toMatch(/Pipes/i);
    });

    it('should display the api page', () => {
      locationService.go('api');
      fixture.detectChanges();
      expect(docViewer.innerText).toMatch(/API/i);
    });

    it('should display a marketing page', () => {
      locationService.go('features');
      fixture.detectChanges();
      expect(docViewer.innerText).toMatch(/Features/i);
    });

    it('should update the document title', () => {
      const titleService = TestBed.get(Title);
      spyOn(titleService, 'setTitle');
      locationService.go('guide/pipes');
      fixture.detectChanges();
      expect(titleService.setTitle).toHaveBeenCalledWith('Angular - Pipes');
    });

    it('should update the document title, with a default value if the document has no title', () => {
      const titleService = TestBed.get(Title);
      spyOn(titleService, 'setTitle');
      locationService.go('no-title');
      fixture.detectChanges();
      expect(titleService.setTitle).toHaveBeenCalledWith('Angular');
    });
  });

  describe('auto-scrolling', () => {
    let scrollService: ScrollService;
    let scrollSpy: jasmine.Spy;

    beforeEach(() => {
      scrollService = fixture.debugElement.injector.get(ScrollService);
      scrollSpy = spyOn(scrollService, 'scroll');
    });

    it('should not scroll immediately when the docId (path) changes', () => {
      locationService.go('guide/pipes');
      // deliberately not calling `fixture.detectChanges` because don't want `onDocRendered`
      expect(scrollSpy).not.toHaveBeenCalled();
    });

    it('should scroll when just the hash changes (# alone)', () => {
      locationService.go('guide/pipes');
      locationService.go('guide/pipes#somewhere');
      expect(scrollSpy).toHaveBeenCalled();
    });

    it('should scroll when just the hash changes (/#)', () => {
      locationService.go('guide/pipes');
      locationService.go('guide/pipes/#somewhere');
      expect(scrollSpy).toHaveBeenCalled();
    });

    it('should scroll again when nav to the same hash twice in succession', () => {
      locationService.go('guide/pipes');
      locationService.go('guide/pipes#somewhere');
      locationService.go('guide/pipes#somewhere');
      expect(scrollSpy.calls.count()).toBe(2);
    });

    it('should scroll when call onDocRendered directly', () => {
      component.onDocRendered();
      expect(scrollSpy).toHaveBeenCalled();
    });

    it('should scroll (via onDocRendered) when finish navigating to a new doc', () => {
      locationService.go('guide/pipes');
      fixture.detectChanges(); // triggers the event that calls onDocRendered
      expect(scrollSpy).toHaveBeenCalled();
    });
  });

  describe('initial rendering', () => {
    beforeEach(() => {
      createTestingModule('a/b');
      // Remove the DocViewer for this test and hide the missing component message
      TestBed.overrideModule(AppModule, {
        remove: { declarations: [DocViewerComponent] },
        add: { schemas: [NO_ERRORS_SCHEMA] }
      });
    });

    it('should initially add the starting class until the first document is rendered', () => {
      fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.isStarting).toBe(true);
      expect(fixture.debugElement.query(By.css('md-sidenav-container')).classes['starting']).toBe(true);

      fixture.debugElement.query(By.css('aio-doc-viewer')).triggerEventHandler('docRendered', {});
      fixture.detectChanges();
      expect(fixture.componentInstance.isStarting).toBe(false);
      expect(fixture.debugElement.query(By.css('md-sidenav-container')).classes['starting']).toBe(false);
    });
  });

  describe('click intercepting', () => {
    it('should intercept clicks on anchors and call `location.handleAnchorClick()`',
            inject([LocationService], (location: LocationService) => {

      const el = fixture.nativeElement as Element;
      el.innerHTML = '<a href="some/local/url">click me</a>';
      const anchorElement = el.getElementsByTagName('a')[0];
      anchorElement.click();
      expect(location.handleAnchorClick).toHaveBeenCalledWith(anchorElement, 0, false, false);
    }));

    it('should intercept clicks on elements deep within an anchor tag',
            inject([LocationService], (location: LocationService) => {

      const el = fixture.nativeElement as Element;
      el.innerHTML = '<a href="some/local/url"><div><img></div></a>';
      const imageElement  = el.getElementsByTagName('img')[0];
      const anchorElement = el.getElementsByTagName('a')[0];
      imageElement.click();
      expect(location.handleAnchorClick).toHaveBeenCalledWith(anchorElement, 0, false, false);
    }));

    it('should ignore clicks on elements without an anchor ancestor',
            inject([LocationService], (location: LocationService) => {

      const el = fixture.nativeElement as Element;
      el.innerHTML = '<div><p><div><img></div></p></div>';
      const imageElement  = el.getElementsByTagName('img')[0];
      imageElement.click();
      expect(location.handleAnchorClick).not.toHaveBeenCalled();
    }));
  });

  describe('aio-toc', () => {
    let tocDebugElement: DebugElement;
    let tocContainer: DebugElement;

    beforeEach(() => {
      tocDebugElement = fixture.debugElement.query(By.directive(TocComponent));
      tocContainer = tocDebugElement.parent;
    });


    it('should have a non-embedded `<aio-toc>` element', () => {
      expect(tocDebugElement).toBeDefined();
      expect(tocDebugElement.classes['embedded']).toBeFalsy();
    });

    it('should update the TOC container\'s `maxHeight` based on `tocMaxHeight`', () => {
      expect(tocContainer.styles['max-height']).toBeNull();

      component.tocMaxHeight = '100';
      fixture.detectChanges();

      expect(tocContainer.styles['max-height']).toBe('100px');
    });
  });

  describe('footer', () => {
    it('should have version number', () => {
      const versionEl: HTMLElement = fixture.debugElement.query(By.css('aio-footer')).nativeElement;
      expect(versionEl.innerText).toContain(TestHttp.versionFull);
    });
  });

  describe('search', () => {
    describe('initialization', () => {
      it('should initialize the search worker', inject([SearchService], (searchService: SearchService) => {
        fixture.detectChanges(); // triggers ngOnInit
        expect(searchService.initWorker).toHaveBeenCalled();
        expect(searchService.loadIndex).toHaveBeenCalled();
      }));
    });

    describe('click handling', () => {
      it('should intercept clicks not on the search elements and hide the search results', () => {
        component.showSearchResults = true;
        fixture.detectChanges();
        // docViewer is a commonly-clicked, non-search element
        docViewer.click();
        expect(component.showSearchResults).toBe(false);
      });

      it('should not intercept clicks on the searchResults', () => {
        component.showSearchResults = true;
        fixture.detectChanges();

        const searchResults = fixture.debugElement.query(By.directive(SearchResultsComponent));
        searchResults.nativeElement.click();
        fixture.detectChanges();

        expect(component.showSearchResults).toBe(true);
      });

      it('should not intercept clicks om the searchBox', () => {
        component.showSearchResults = true;
        fixture.detectChanges();

        const searchBox = fixture.debugElement.query(By.directive(SearchBoxComponent));
        searchBox.nativeElement.click();
        fixture.detectChanges();

        expect(component.showSearchResults).toBe(true);
      });
    });

    describe('keyup handling', () => {
      it('should grab focus when the / key is pressed', () => {
        const searchBox: SearchBoxComponent = fixture.debugElement.query(By.directive(SearchBoxComponent)).componentInstance;
        spyOn(searchBox, 'focus');
        window.document.dispatchEvent(new KeyboardEvent('keyup', { 'key': '/' }));
        fixture.detectChanges();
        expect(searchBox.focus).toHaveBeenCalled();
      });

      it('should set focus back to the search box when the search results are displayed and the escape key is pressed', () => {
        const searchBox: SearchBoxComponent = fixture.debugElement.query(By.directive(SearchBoxComponent)).componentInstance;
        spyOn(searchBox, 'focus');
        component.showSearchResults = true;
        window.document.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'Escape' }));
        fixture.detectChanges();
        expect(searchBox.focus).toHaveBeenCalled();
      });
    });

    describe('showing search results', () => {
      it('should not display search results when query is empty', () => {
        const searchService: MockSearchService = TestBed.get(SearchService);
        searchService.searchResults.next({ query: '', results: [] });
        fixture.detectChanges();
        expect(component.showSearchResults).toBe(false);
      });

      it('should hide the results when a search result is selected', () => {
        const searchService: MockSearchService = TestBed.get(SearchService);

        const results = [
          { path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' }
        ];

        searchService.searchResults.next({ query: 'something', results: results });
        component.showSearchResults = true;
        fixture.detectChanges();

        const searchResultsComponent = fixture.debugElement.query(By.directive(SearchResultsComponent));
        searchResultsComponent.triggerEventHandler('resultSelected', {});
        fixture.detectChanges();
        expect(component.showSearchResults).toBe(false);
      });
    });
  });

});

//// test helpers ////

function createTestingModule(initialUrl: string) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [ AppModule ],
    providers: [
      { provide: APP_BASE_HREF, useValue: '/' },
      { provide: GaService, useClass: TestGaService },
      { provide: Http, useClass: TestHttp },
      { provide: LocationService, useFactory: () => new MockLocationService(initialUrl) },
      { provide: Logger, useClass: MockLogger },
      { provide: SearchService, useClass: MockSearchService },
      { provide: SwUpdateNotificationsService, useClass: MockSwUpdateNotificationsService },
    ]
  });
}

class TestGaService {
  locationChanged = jasmine.createSpy('locationChanged');
}

class TestSearchService {
  initWorker = jasmine.createSpy('initWorker');
  loadIndex  = jasmine.createSpy('loadIndex');
}

class TestHttp {
  static versionFull = '4.0.0-local+sha.73808dd';

  static docVersions: NavigationNode[] = [
    { title: 'v4.0.0' },
    { title: 'v2', url: 'https://v2.angular.io' }
  ];

  // tslint:disable:quotemark
  navJson = {
    "TopBar": [
      {
        "url": "features",
        "title": "Features"
      },
      {
        "url": "no-title",
        "title": "No Title"
      },
    ],
    "SideNav": [
      {
      "title": "Core",
      "tooltip": "Learn the core capabilities of Angular",
      "children": [
          {
            "url": "guide/pipes",
            "title": "Pipes",
            "tooltip": "Pipes transform displayed values within a template."
          },
          {
            "url": "guide/bags",
            "title": "Bags",
            "tooltip": "Pack your bags for a code adventure."
          }
        ]
      },
      {
        "url": "api",
        "title": "API",
        "tooltip": "Details of the Angular classes and values."
      }
    ],
    "docVersions": TestHttp.docVersions,

    "__versionInfo": {
      "raw": "4.0.0-rc.6",
      "major": 4,
      "minor": 0,
      "patch": 0,
      "prerelease": [
        "local"
      ],
      "build": "sha.73808dd",
      "version": "4.0.0-local",
      "codeName": "snapshot",
      "isSnapshot": true,
      "full": TestHttp.versionFull,
      "branch": "master",
      "commitSHA": "73808dd38b5ccd729404936834d1568bd066de81"
    }
  };

  get(url: string) {
    let data;
    if (/navigation\.json/.test(url)) {
      data = this.navJson;
    } else {
      const match = /generated\/docs\/(.+)\.json/.exec(url);
      const id = match[1];
      // Make up a title for test purposes
      const title = id.split('/').pop().replace(/^([a-z])/, (_, letter) => letter.toUpperCase());
      const h1 = (id === 'no-title') ? '' : `<h1>${title}</h1>`;
      const contents = `${h1}<h2 id="#somewhere">Some heading</h2>`;
      data = { id, contents };
    }
    return of({ json: () => data });
  }
}
