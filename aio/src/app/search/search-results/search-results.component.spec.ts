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
    const results = [
      {path: 'guide/a', title: 'Guide A', type: 'content', keywords: '', titleWords: '' },
      {path: 'guide/b', title: 'Guide B', type: 'content', keywords: '', titleWords: '' },
      {path: 'api/c', title: 'API C', type: 'class', keywords: '', titleWords: '' },
      {path: 'guide/b/c', title: 'Guide B - C', type: 'content', keywords: '', titleWords: '' },
    ];

    searchResults.next({ query: '', results: results});
    expect(currentAreas).toEqual([
      { name: 'api', pages: [
        { path: 'api/c', title: 'API C', type: 'class', keywords: '', titleWords: '' }
      ] },
      { name: 'guide', pages: [
        { path: 'guide/a', title: 'Guide A', type: 'content', keywords: '', titleWords: '' },
        { path: 'guide/b', title: 'Guide B', type: 'content', keywords: '', titleWords: '' },
        { path: 'guide/b/c', title: 'Guide B - C', type: 'content', keywords: '', titleWords: '' }
      ] }
    ]);
  });

  it('should sort by title within sorted area', () => {
    const results = [
      {path: 'guide/b', title: 'Guide B', type: 'content', keywords: '', titleWords: '' },
      {path: 'guide/a', title: 'Guide A', type: 'content', keywords: '', titleWords: '' },
      {path: 'api/d', title: 'API D', type: 'class', keywords: '', titleWords: '' },
      {path: 'guide/a/c', title: 'Guide A - C', type: 'content', keywords: '', titleWords: '' },
      {path: 'api/c', title: 'API C', type: 'class', keywords: '', titleWords: '' },
    ];

    searchResults.next({ query: '', results: results });

    expect(currentAreas).toEqual([
      { name: 'api', pages: [
        {path: 'api/c', title: 'API C', type: 'class', keywords: '', titleWords: '' },
        {path: 'api/d', title: 'API D', type: 'class', keywords: '', titleWords: '' },
      ] },
      { name: 'guide', pages: [
        {path: 'guide/a', title: 'Guide A', type: 'content', keywords: '', titleWords: '' },
        {path: 'guide/a/c', title: 'Guide A - C', type: 'content', keywords: '', titleWords: '' },
        {path: 'guide/b', title: 'Guide B', type: 'content', keywords: '', titleWords: '' },
      ] }
    ]);
  });

  it('should put search results with no containing folder into the default area (other)', () => {
    const results = [
      {path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' }
    ];

    searchResults.next({ query: '', results: results });
    expect(currentAreas).toEqual([
      { name: 'other', pages: [
        { path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' }
      ] }
    ]);
  });

  it('should omit search results with no title', () => {
    const results = [
      {path: 'news', title: undefined, type: 'marketing', keywords: '', titleWords: '' }
    ];

    searchResults.next({ query: '', results: results });
    expect(currentAreas).toEqual([]);
  });

  it('should emit an "resultSelected" event when a search result anchor is clicked', () => {
    let selectedResult: SearchResult;
    component.resultSelected.subscribe((result: SearchResult) => selectedResult = result);
    const results = [
      {path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' }
    ];

    searchResults.next({ query: '', results: results });
    fixture.detectChanges();
    const anchor = fixture.debugElement.query(By.css('a'));

    anchor.triggerEventHandler('click', {});
    expect(selectedResult).toEqual({path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' });
  });

  it('should clear the results when a search result is clicked', () => {
    const results = [
      {path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' }
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
        {path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' }
      ];

      searchResults.next({ query: '', results: results });
      fixture.detectChanges();
      component.hideResults();
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('a'))).toEqual([]);
    });
  });
});
