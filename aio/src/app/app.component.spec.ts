import { async, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { Http } from '@angular/http';
import { By } from '@angular/platform-browser';

import { of } from 'rxjs/observable/of';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { GaService } from 'app/shared/ga.service';
import { SearchService } from 'app/search/search.service';
import { SearchResultsComponent } from 'app/search/search-results/search-results.component';
import { SearchBoxComponent } from 'app/search/search-box/search-box.component';
import { AutoScrollService } from 'app/shared/auto-scroll.service';
import { MockSearchService } from 'testing/search.service';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';
import { Logger } from 'app/shared/logger.service';
import { MockLogger } from 'testing/logger.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  const initialUrl = 'a/b';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AppModule ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: SearchService, useClass: MockSearchService },
        { provide: GaService, useClass: TestGaService },
        { provide: Http, useClass: TestHttp },
        { provide: LocationService, useFactory: () => new MockLocationService(initialUrl) },
        { provide: Logger, useClass: MockLogger }
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

  describe('google analytics', () => {
    it('should call gaService.locationChanged with initial URL', () => {
      const { locationChanged } = TestBed.get(GaService) as TestGaService;
      expect(locationChanged.calls.count()).toBe(1, 'gaService.locationChanged');
      const args = locationChanged.calls.first().args;
      expect(args[0]).toBe(initialUrl);
    });

    // Todo: add test to confirm tracking URL when navigate.
  });

  describe('isHamburgerVisible', () => {
    console.log('PENDING: AppComponent isHamburgerVisible');
  });

  describe('onResize', () => {
    it('should update `isSideBySide` accordingly', () => {
      component.onResize(1000);
      expect(component.isSideBySide).toBe(true);
      component.onResize(500);
      expect(component.isSideBySide).toBe(false);
    });
  });

  describe('shows/hide SideNav based on doc', () => {
    let locationService: MockLocationService;

    beforeEach(() => {
      locationService = fixture.debugElement.injector.get(LocationService) as any;
      component.onResize(1000); // side-by-side
    });

    it('should have sidenav open when doc in the sidenav (guide/pipes)', () => {
      locationService.urlSubject.next('guide/pipes');
      expect(component.isSideNavDoc).toBe(true, 'isSideNavDoc');

      fixture.detectChanges();
      const sidenav = fixture.debugElement.query(By.css('md-sidenav')).nativeElement;
      expect(sidenav.className).toMatch(/sidenav-open/);
    });

    it('should have sidenav closed when doc not in the sidenav (api)', () => {
      locationService.urlSubject.next('api');
      expect(component.isSideNavDoc).toBe(false, 'isSideNavNode');

      fixture.detectChanges();
      const sidenav = fixture.debugElement.query(By.css('md-sidenav')).nativeElement;
      expect(sidenav.className).toMatch(/sidenav-clos/);
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
      component.onDocRendered(null);
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
});

class TestGaService {
  locationChanged = jasmine.createSpy('locationChanged');
}

class TestHttp {
  // tslint:disable:quotemark
  navJson = {
    "TopBar": [
      {
        "url": "api",
        "title": "API"
      },
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
      "full": "4.0.0-local+sha.73808dd",
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
