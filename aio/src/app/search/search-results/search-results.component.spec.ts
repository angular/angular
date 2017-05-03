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
  let searchService: SearchService;
  let searchResults: Subject<SearchResults>;
  let currentAreas: SearchArea[];

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchResultsComponent ],
      providers: [
        { provide: SearchService, useFactory: () => new MockSearchService() }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
    searchService = fixture.debugElement.injector.get(SearchService);
    searchResults = searchService.searchResults as Subject<SearchResults>;
    fixture.detectChanges();
    component.searchAreas.subscribe(areas => currentAreas = areas);
  });

  it('should map the search results into groups based on their containing folder', () => {
    const results = getTestResults(3);

    searchResults.next({ query: '', results: results});
    expect(currentAreas).toEqual([
      { name: 'api', pages: [
        { path: 'api/d', title: 'API D', type: '', keywords: '', titleWords: '' }
      ], priorityPages: [] },
      { name: 'guide', pages: [
        { path: 'guide/a', title: 'Guide A', type: '', keywords: '', titleWords: '' },
        { path: 'guide/b', title: 'Guide B', type: '', keywords: '', titleWords: '' },
      ], priorityPages: [] }
    ]);
  });

  it('should special case results that are top level folders', () => {
    searchResults.next({ query: '', results: [
      { path: 'tutorial', title: 'Tutorial index', type: '', keywords: '', titleWords: '' },
      { path: 'tutorial/toh-pt1', title: 'Tutorial - part 1', type: '', keywords: '', titleWords: '' },
    ]});
    expect(currentAreas).toEqual([
      { name: 'tutorial', pages: [
        { path: 'tutorial/toh-pt1', title: 'Tutorial - part 1', type: '', keywords: '', titleWords: '' },
        { path: 'tutorial', title: 'Tutorial index', type: '', keywords: '', titleWords: '' },
      ], priorityPages: [] }
    ]);
  });

  it('should sort by title within sorted area', () => {
    const results = getTestResults(5);
    searchResults.next({ query: '', results: results });

    expect(currentAreas).toEqual([
      { name: 'api', pages: [
        { path: 'api/c', title: 'API C', type: '', keywords: '', titleWords: '' },
        { path: 'api/d', title: 'API D', type: '', keywords: '', titleWords: '' },
      ], priorityPages: [] },
      { name: 'guide', pages: [
        { path: 'guide/a', title: 'Guide A',       type: '', keywords: '', titleWords: '' },
        { path: 'guide/a/c', title: 'Guide A - C', type: '', keywords: '', titleWords: '' },
        { path: 'guide/b', title: 'Guide B',       type: '', keywords: '', titleWords: '' },
      ], priorityPages: [] }
    ]);
  });

  it('should put first 5 area results into priorityPages when more than 10 pages', () => {
    const results = getTestResults();
    const sorted = results.slice().sort((l, r) => l.title > r.title ? 1 : -1);
    const expected = [
      {
        name: 'api',
        pages: sorted.filter(p => p.path.startsWith('api')),
        priorityPages: []
      },
      {
        name: 'guide',
        pages: sorted.filter(p => p.path.startsWith('guide')),
        priorityPages: results.filter(p => p.path.startsWith('guide')).slice(0, 5)
      }
    ];

    searchResults.next({ query: '', results: results });
    expect(currentAreas).toEqual(expected);
  });

  it('should put search results with no containing folder into the default area (other)', () => {
    const results = [
      { path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' }
    ];

    searchResults.next({ query: '', results: results });
    expect(currentAreas).toEqual([
      { name: 'other', pages: [
        { path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' }
      ], priorityPages: [] }
    ]);
  });

  it('should omit search results with no title', () => {
    const results = [
      { path: 'news', title: undefined, type: 'marketing', keywords: '', titleWords: '' }
    ];

    searchResults.next({ query: '', results: results });
    expect(currentAreas).toEqual([]);
  });

  it('should emit an "resultSelected" event when a search result anchor is clicked', () => {
    let selectedResult: SearchResult;
    component.resultSelected.subscribe((result: SearchResult) => selectedResult = result);
    const results = [
      { path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' }
    ];

    searchResults.next({ query: '', results: results });
    fixture.detectChanges();
    const anchor = fixture.debugElement.query(By.css('a'));

    anchor.triggerEventHandler('click', {});
    expect(selectedResult).toEqual({ path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' });
  });

  it('should clear the results when a search result is clicked', () => {
    const results = [
      { path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' }
    ];

    searchResults.next({ query: '', results: results });
    fixture.detectChanges();
    const anchor = fixture.debugElement.query(By.css('a'));
    anchor.triggerEventHandler('click', {});

    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('a'))).toEqual([]);
  });

  describe('hideResults', () => {
    it('should clear the results', () => {
      const results = [
        { path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' }
      ];

      searchResults.next({ query: '', results: results });
      fixture.detectChanges();
      component.hideResults();
      fixture.detectChanges();
      expect(getText()).toBe('');
    });
  });

  describe('when no query results', () => {

    it('should display "not found" message', () => {
      searchResults.next({ query: 'something', results: [] });
      fixture.detectChanges();
      expect(getText()).toContain('No results');
    });

    it('should not display "not found" message after hideResults()', () => {
      searchResults.next({ query: 'something', results: [] });
      fixture.detectChanges();
      component.hideResults();
      fixture.detectChanges();
      expect(getText()).toBe('');
    });

    it('should not display "not found" message when query is empty', () => {
      searchResults.next({ query: '', results: [] });
      fixture.detectChanges();
      expect(getText()).toBe('');
    });
  });
});
