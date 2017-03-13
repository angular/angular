import { async, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { GaService } from 'app/shared/ga.service';
import { SearchService } from 'app/search/search.service';
import { MockSearchService } from 'testing/search.service';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';

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
        { provide: LocationService, useFactory: () => new MockLocationService(initialUrl) }
      ]
    });
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
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
  });

  describe('onResize', () => {
    it('should update `isSideBySide` accordingly', () => {
      component.onResize(1000);
      expect(component.isSideBySide).toBe(true);
      component.onResize(500);
      expect(component.isSideBySide).toBe(false);
    });
  });

  describe('currentDocument', () => {
    console.log('PENDING: AppComponent currentDocument');
  });

  describe('navigationViews', () => {
    console.log('PENDING: AppComponent navigationViews');
  });

  describe('initialisation', () => {
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
  });
});

class TestGaService {
  locationChanged = jasmine.createSpy('locationChanged');
}
