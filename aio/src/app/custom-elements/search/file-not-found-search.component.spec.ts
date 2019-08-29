import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';
import { SearchResults } from 'app/search/interfaces';
import { SearchResultsComponent } from 'app/shared/search-results/search-results.component';
import { SearchService } from 'app/search/search.service';
import { FileNotFoundSearchComponent } from './file-not-found-search.component';


describe('FileNotFoundSearchComponent', () => {
  let fixture: ComponentFixture<FileNotFoundSearchComponent>;
  let searchService: SearchService;
  let searchResultSubject: Subject<SearchResults>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [ FileNotFoundSearchComponent, SearchResultsComponent ],
      providers: [
        { provide: LocationService, useValue: new MockLocationService('base/initial-url?some-query') },
        SearchService
      ]
    });

    fixture = TestBed.createComponent(FileNotFoundSearchComponent);
    searchService = TestBed.get(SearchService);
    searchResultSubject = new Subject<SearchResults>();
    spyOn(searchService, 'search').and.callFake(() => searchResultSubject.asObservable());
    fixture.detectChanges();
  });

  it('should run a search with a query built from the current url', () => {
    expect(searchService.search).toHaveBeenCalledWith('base initial url');
  });

  it('should pass through any results to the `aio-search-results` component', () => {
    const searchResultsComponent = fixture.debugElement.query(By.directive(SearchResultsComponent)).componentInstance;
    expect(searchResultsComponent.searchResults).toBe(null);

    const results = { query: 'base initial url', results: []};
    searchResultSubject.next(results);
    fixture.detectChanges();
    expect(searchResultsComponent.searchResults).toEqual(results);
  });
});
