import { async, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { Http } from '@angular/http';
import { By } from '@angular/platform-browser';

import { of } from 'rxjs/observable/of';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { GaService } from 'app/shared/ga.service';
import { SearchResultsComponent } from 'app/search/search-results/search-results.component';
import { SearchBoxComponent } from 'app/search/search-box/search-box.component';
import { SearchService } from 'app/search/search.service';
import { MockSearchService } from 'testing/search.service';
import { AutoScrollService } from 'app/shared/auto-scroll.service';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';
import { Logger } from 'app/shared/logger.service';
import { MockLogger } from 'testing/logger.service';
import { SwUpdateNotificationsService } from 'app/sw-updates/sw-update-notifications.service';
import { MockSwUpdateNotificationsService } from 'testing/sw-update-notifications.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  const initialUrl = 'a/b';

  beforeEach(async(() => {
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
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

  describe('is Hamburger Visible', () => {
    console.log('PENDING: AppComponent');
  });

  describe('onResize', () => {
    it('should update `isSideBySide` accordingly', () => {
      component.onResize(1033);
      expect(component.isSideBySide).toBe(true);
      component.onResize(500);
      expect(component.isSideBySide).toBe(false);
    });
  });

  describe('shows/hide SideNav based on doc\'s navigation view', () => {
    let locationService: MockLocationService;

    beforeEach(() => {
      locationService = fixture.debugElement.injector.get(LocationService) as any;
      component.onResize(1000); // side-by-side
    });

    it('should have sidenav open when doc in the sidenav (guide/pipes)', () => {
      locationService.urlSubject.next('guide/pipes');

      fixture.detectChanges();
      const sidenav = fixture.debugElement.query(By.css('md-sidenav')).nativeElement;
      expect(sidenav.className).toMatch(/sidenav-open/);
    });

    it('should have sidenav open when doc is an api page', () => {
      locationService.urlSubject.next('api/a/b/c/d');

      fixture.detectChanges();
      const sidenav = fixture.debugElement.query(By.css('md-sidenav')).nativeElement;
      expect(sidenav.className).toMatch(/sidenav-open/);
    });

    it('should have sidenav closed when doc not in the sidenav (features)', () => {
      locationService.urlSubject.next('features');

      fixture.detectChanges();
      const sidenav = fixture.debugElement.query(By.css('md-sidenav')).nativeElement;
      expect(sidenav.className).toMatch(/sidenav-clos/);
    });
  });

  describe('pageId', () => {
    let locationService: MockLocationService;

    beforeEach(() => {
      locationService = fixture.debugElement.injector.get(LocationService) as any;
    });

    it('should set the id of the doc viewer container based on the current url', () => {
      const container = fixture.debugElement.query(By.css('section.sidenav-content'));

      locationService.urlSubject.next('guide/pipes');
      fixture.detectChanges();
      expect(component.pageId).toEqual('guide-pipes');
      expect(container.properties['id']).toEqual('guide-pipes');

      locationService.urlSubject.next('news');
      fixture.detectChanges();
      expect(component.pageId).toEqual('news');
      expect(container.properties['id']).toEqual('news');

      locationService.urlSubject.next('');
      fixture.detectChanges();
      expect(component.pageId).toEqual('home');
      expect(container.properties['id']).toEqual('home');
    });

    it('should not be affected by changes to the query or hash', () => {
      const container = fixture.debugElement.query(By.css('section.sidenav-content'));

      locationService.urlSubject.next('guide/pipes');
      fixture.detectChanges();

      locationService.urlSubject.next('guide/other?search=http');
      fixture.detectChanges();
      expect(component.pageId).toEqual('guide-other');
      expect(container.properties['id']).toEqual('guide-other');

      locationService.urlSubject.next('guide/http#anchor-1');
      fixture.detectChanges();
      expect(component.pageId).toEqual('guide-http');
      expect(container.properties['id']).toEqual('guide-http');
    });
  });

  describe('currentDocument', () => {
    console.log('PENDING: AppComponent currentDocument');
  });

  describe('navigationViews', () => {
    console.log('PENDING: AppComponent navigationViews');
  });

  describe('autoScrolling', () => {
    it('should AutoScrollService.scroll when the url changes', () => {
      const locationService: MockLocationService = fixture.debugElement.injector.get(LocationService) as any;
      const scrollService: AutoScrollService = fixture.debugElement.injector.get(AutoScrollService);
      spyOn(scrollService, 'scroll');
      locationService.urlSubject.next('some/url#fragment');
      expect(scrollService.scroll).toHaveBeenCalledWith(jasmine.any(HTMLElement));
    });

    it('should be called when a document has been rendered', () => {
      const scrollService: AutoScrollService = fixture.debugElement.injector.get(AutoScrollService);
      spyOn(scrollService, 'scroll');
      component.onDocRendered();
      expect(scrollService.scroll).toHaveBeenCalledWith(jasmine.any(HTMLElement));
    });
  });

  describe('initialization', () => {
    it('should initialize the search worker', inject([SearchService], (searchService: SearchService) => {
      fixture.detectChanges(); // triggers ngOnInit
      expect(searchService.initWorker).toHaveBeenCalled();
      expect(searchService.loadIndex).toHaveBeenCalled();
    }));
  });

  describe('click intercepting', () => {
    it('should intercept clicks on anchors and call `location.handleAnchorClick()`',
            inject([LocationService], (location: LocationService) => {
      const anchorElement: HTMLAnchorElement = document.createElement('a');
      anchorElement.href = 'some/local/url';
      fixture.nativeElement.append(anchorElement);
      anchorElement.click();
      expect(location.handleAnchorClick).toHaveBeenCalledWith(anchorElement, 0, false, false);
    }));

    it('should intercept clicks not on the search elements and hide the search results', () => {
      const searchResults: SearchResultsComponent = fixture.debugElement.query(By.directive(SearchResultsComponent)).componentInstance;
      const docViewer = fixture.debugElement.query(By.css('aio-doc-viewer'));
      spyOn(searchResults, 'hideResults');
      docViewer.nativeElement.click();
      expect(searchResults.hideResults).toHaveBeenCalled();
    });

    it('should not intercept clicks on any of the search elements', () => {
      const searchResults = fixture.debugElement.query(By.directive(SearchResultsComponent));
      const searchResultsComponent: SearchResultsComponent = searchResults.componentInstance;
      const searchBox = fixture.debugElement.query(By.directive(SearchBoxComponent));
      spyOn(searchResultsComponent, 'hideResults');

      searchResults.nativeElement.click();
      expect(searchResultsComponent.hideResults).not.toHaveBeenCalled();

      searchBox.nativeElement.click();
      expect(searchResultsComponent.hideResults).not.toHaveBeenCalled();
    });
  });

  describe('footer', () => {
    it('should have version number', () => {
      const versionEl: HTMLElement = fixture.debugElement.query(By.css('aio-footer')).nativeElement;
      expect(versionEl.innerText).toContain(TestHttp.versionFull);
    });
  });

});

class TestGaService {
  locationChanged = jasmine.createSpy('locationChanged');
}

class TestSearchService {
  initWorker = jasmine.createSpy('initWorker');
  loadIndex  = jasmine.createSpy('loadIndex');
}

class TestHttp {
  static versionFull = '4.0.0-local+sha.73808dd';

  // tslint:disable:quotemark
  navJson = {
    "TopBar": [
      {
        "url": "features",
        "title": "Features"
      }
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
          }
        ]
      },
      {
        "url": "api",
        "title": "API",
        "tooltip": "Details of the Angular classes and values."
      }
    ],
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

  apiDoc = {
    "title": "API",
    "contents": "<h1>API Doc</h1>"
  };

  pipesDoc = {
    "title": "Pipes",
    "contents": "<h1>Pipes Doc</h1>"
  };

  testDoc = {
    "title": "Test",
    "contents": "<h1>Test Doc</h1>"
  };

  // get = jasmine.createSpy('get').and.callFake((url: string) => { ... });
  get(url: string) {
    const json =
      /navigation.json/.test(url) ? this.navJson :
      /api/.test(url) ? this.apiDoc :
      /pipes/.test(url) ? this.pipesDoc :
      this.testDoc;
    return of({ json: () => json });
  }

}
