import { async, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { SearchService } from 'app/search/search.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AppModule ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' }
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

  describe('onSearch', () => {
    it('should call the search service', inject([SearchService], (search: SearchService) => {
      spyOn(search, 'search');
      component.onSearch('some query');
      expect(search.search).toHaveBeenCalledWith('some query');
    }));
  });

  describe('currentDocument', () => {

  });

  describe('navigationViews', () => {

  });

  describe('searchResults', () => {

  });


});
