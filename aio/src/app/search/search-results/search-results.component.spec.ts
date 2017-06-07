import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { SearchService, SearchResult, SearchResults } from '../search.service';
import { SearchResultsComponent, SearchArea } from './search-results.component';
import { MockSearchService } from 'testing/search.service';

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let fixture: ComponentFixture<SearchResultsComponent>;
  let searchResults: Subject<SearchResults>;

  /** Get all text from component element */
  function getText() { return fixture.debugElement.nativeElement.innerText; }

  /** Get a full set of test results. "Take" what you need */
  function getTestResults(take?: number) {
    const results: SearchResult[] = [
      { path: 'guide/a', title: 'Guide A' },
      { path: 'api/d', title: 'API D' },
      { path: 'guide/b', title: 'Guide B' },
      { path: 'guide/a/c', title: 'Guide A - C' },
      { path: 'api/c', title: 'API C' }
    ]
    // fill it out to exceed 10 guide pages
    .concat('nmlkjihgfe'.split('').map(l => {
      return { path: 'guide/' + l, title: 'Guide ' + l};
    }))
    // add these empty fields to satisfy interface
    .map(r => ({...{ keywords: '', titleWords: '', type: '' }, ...r }));

    return take === undefined ? results : results.slice(0, take);
  }

  function compareTitle(l: {title: string}, r: {title: string}) {
    return l.title.toUpperCase() > r.title.toUpperCase() ? 1 : -1;
  }


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchResultsComponent ],
      providers: [
        { provide: SearchService, useFactory: () => new MockSearchService() }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
    searchResults = TestBed.get(SearchService).searchResults;
    fixture.detectChanges();
  });

  it('should map the search results into groups based on their containing folder', () => {
    const results = getTestResults(3);

    searchResults.next({ query: '', results: results});
    expect(component.searchAreas).toEqual([
      { name: 'api', priorityPages: [
        { path: 'api/d', title: 'API D', type: '', keywords: '', titleWords: '' }
      ], pages: [] },
      { name: 'guide', priorityPages: [
        { path: 'guide/a', title: 'Guide A', type: '', keywords: '', titleWords: '' },
        { path: 'guide/b', title: 'Guide B', type: '', keywords: '', titleWords: '' },
      ], pages: [] }
    ]);
  });

  it('should special case results that are top level folders', () => {
    searchResults.next({ query: '', results: [
      { path: 'tutorial', title: 'Tutorial index', type: '', keywords: '', titleWords: '' },
      { path: 'tutorial/toh-pt1', title: 'Tutorial - part 1', type: '', keywords: '', titleWords: '' },
    ]});
    expect(component.searchAreas).toEqual([
      { name: 'tutorial', priorityPages: [
        { path: 'tutorial', title: 'Tutorial index', type: '', keywords: '', titleWords: '' },
        { path: 'tutorial/toh-pt1', title: 'Tutorial - part 1', type: '', keywords: '', titleWords: '' },
      ], pages: [] }
    ]);
  });

  it('should put first 5 results for each area into priorityPages', () => {
    const results = getTestResults();
    searchResults.next({ query: '', results: results });
    expect(component.searchAreas[0].priorityPages).toEqual(results.filter(p => p.path.startsWith('api')).slice(0, 5));
    expect(component.searchAreas[1].priorityPages).toEqual(results.filter(p => p.path.startsWith('guide')).slice(0, 5));
  });

  it('should put the nonPriorityPages into the pages array, sorted by title', () => {
    const results = getTestResults();
    searchResults.next({ query: '', results: results });
    expect(component.searchAreas[0].pages).toEqual([]);
    expect(component.searchAreas[1].pages).toEqual(results.filter(p => p.path.startsWith('guide')).slice(5).sort(compareTitle));
  });

  it('should put a total count in the header of each area of search results', () => {
    const results = getTestResults();
    searchResults.next({ query: '', results: results });
    fixture.detectChanges();
    const headers = fixture.debugElement.queryAll(By.css('h3'));
    expect(headers.length).toEqual(2);
    expect(headers[0].nativeElement.textContent).toContain('(2)');
    expect(headers[1].nativeElement.textContent).toContain('(13)');
  });

  it('should put search results with no containing folder into the default area (other)', () => {
    const results = [
      { path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' }
    ];

    searchResults.next({ query: '', results: results });
    expect(component.searchAreas).toEqual([
      { name: 'other', priorityPages: [
        { path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' }
      ], pages: [] }
    ]);
  });

  it('should omit search results with no title', () => {
    const results = [
      { path: 'news', title: undefined, type: 'marketing', keywords: '', titleWords: '' }
    ];

    searchResults.next({ query: 'something', results: results });
    expect(component.searchAreas).toEqual([]);
  });

  it('should emit a "resultSelected" event when a search result anchor is clicked', () => {
    const searchResult = { path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' };
    let selected: SearchResult;
    component.resultSelected.subscribe(result => selected = result);

    searchResults.next({ query: 'something', results: [searchResult] });
    fixture.detectChanges();
    expect(selected).toBeUndefined();

    const anchor = fixture.debugElement.query(By.css('a'));
    anchor.triggerEventHandler('click', {});
    fixture.detectChanges();
    expect(selected).toEqual(searchResult);
  });

  describe('when no query results', () => {
    it('should display "not found" message', () => {
      searchResults.next({ query: 'something', results: [] });
      fixture.detectChanges();
      expect(getText()).toContain('No results');
    });
  });
});
