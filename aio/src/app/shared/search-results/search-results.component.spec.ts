/* eslint-disable @angular-eslint/component-selector */
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SearchResult } from 'app/search/interfaces';
import { SearchResultsComponent } from './search-results.component';

@Component({
  selector: 'mat-icon',
  template: '',
})
class MockMatIconComponent {}

describe('SearchResultsComponent', () => {

  let component: SearchResultsComponent;
  let fixture: ComponentFixture<SearchResultsComponent>;
  let guideA: SearchResult;
  let apiD: SearchResult;
  let guideB: SearchResult;
  let guideAC: SearchResult;
  let apiC: SearchResult;
  let guideN: SearchResult;
  let guideM: SearchResult;
  let guideL: SearchResult;
  let guideK: SearchResult;
  let guideJ: SearchResult;
  let guideI: SearchResult;
  let guideH: SearchResult;
  let guideG: SearchResult;
  let guideF: SearchResult;
  let guideE: SearchResult;
  let standardResults: SearchResult[];

  /** Get all text from component element. */
  function getText() { return fixture.debugElement.nativeElement.textContent; }

  /** Pass the given search results to the component and trigger change detection. */
  function setSearchResults(query: string, results: SearchResult[]) {
    component.searchResults = {query, results};
    component.ngOnChanges();
    fixture.detectChanges();
  }

  /** Get a full set of test results. "Take" what you need */
  beforeEach(() => {
    /* eslint-disable max-len */
    apiD = { path: 'api/d', title: 'API D', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    apiC = { path: 'api/c', title: 'API C', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    guideA = { path: 'guide/a', title: 'Guide A', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    guideB = { path: 'guide/b', title: 'Guide B', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    guideAC = { path: 'guide/a/c', title: 'Guide A - C', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    guideE =  { path: 'guide/e', title: 'Guide e', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    guideF =  { path: 'guide/f', title: 'Guide f', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    guideG =  { path: 'guide/g', title: 'Guide g', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    guideH =  { path: 'guide/h', title: 'Guide h', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    guideI =  { path: 'guide/i', title: 'Guide i', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    guideJ =  { path: 'guide/j', title: 'Guide j', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    guideK =  { path: 'guide/k', title: 'Guide k', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    guideL =  { path: 'guide/l', title: 'Guide l', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    guideM =  { path: 'guide/m', title: 'Guide m', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    guideN =  { path: 'guide/n', title: 'Guide n', deprecated: false, keywords: '', titleWords: '', type: '', topics: '' };
    /* eslint-enable max-len */

    standardResults = [
      guideA,
      apiD,
      guideB,
      guideAC,
      apiC,
      guideN,
      guideM,
      guideL,
      guideK,
      guideJ,
      guideI,
      guideH,
      guideG,
      guideF,
      guideE,
    ];
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchResultsComponent, MockMatIconComponent ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should map the search results into groups based on their containing folder', () => {
    const startA = {
      path: 'start/a',
      title: 'Start A',
      deprecated: false,
      keywords: '',
      titleWords: '',
      type: '',
      topics: '',
    };
    const tutorialA = {
      path: 'tutorial/a',
      title: 'Tutorial A',
      deprecated: false,
      keywords: '',
      titleWords: '',
      type: '',
      topics: '',
    };

    setSearchResults('', [guideA, apiD, guideB, startA, tutorialA]);
    expect(component.searchAreas).toEqual([
      { name: 'api', priorityPages: [apiD], pages: [] },
      { name: 'guides', priorityPages: [guideA, guideB], pages: [] },
      { name: 'tutorials', priorityPages: [startA, tutorialA], pages: [] },
    ]);
  });

  it('should special case results that are top level folders', () => {
    setSearchResults('', [
      {
        path: 'docs',
        title: 'Docs introduction',
        type: '',
        keywords: '',
        titleWords: '',
        deprecated: false,
        topics: '',
      },
      {
        path: 'start',
        title: 'Getting started',
        type: '',
        keywords: '',
        titleWords: '',
        deprecated: false,
        topics: '',
      },
      {
        path: 'tutorial',
        title: 'Tutorial index',
        type: '',
        keywords: '',
        titleWords: '',
        deprecated: false,
        topics: '',
      },
      {
        path: 'tutorial/tour-of-heroes/toh-pt1',
        title: 'Tutorial - part 1',
        type: '',
        keywords: '',
        titleWords: '',
        deprecated: false,
        topics: '',
      },
    ]);
    expect(component.searchAreas).toEqual([
      {
        name: 'guides',
        priorityPages: [
          {
            path: 'docs',
            title: 'Docs introduction',
            type: '',
            keywords: '',
            titleWords: '',
            deprecated: false,
            topics: '',
          },
        ],
        pages: [],
      },
      {
        name: 'tutorials',
        priorityPages: [
          {
            path: 'start',
            title: 'Getting started',
            type: '',
            keywords: '',
            titleWords: '',
            deprecated: false,
            topics: '',
          },
          {
            path: 'tutorial',
            title: 'Tutorial index',
            type: '',
            keywords: '',
            titleWords: '',
            deprecated: false,
            topics: '',
          },
          {
            path: 'tutorial/tour-of-heroes/toh-pt1',
            title: 'Tutorial - part 1',
            type: '',
            keywords: '',
            titleWords: '',
            deprecated: false,
            topics: '',
          },
        ],
        pages: [],
      },
    ]);
  });

  it('should put, at most, the first 5 results for each area into priorityPages, not sorted', () => {
    setSearchResults('', standardResults);
    expect(component.searchAreas[0].priorityPages).toEqual([apiD, apiC]);
    expect(component.searchAreas[1].priorityPages).toEqual([guideA, guideB, guideAC, guideN, guideM]);
  });

  it('should put the nonPriorityPages into the pages array, sorted by title', () => {
    setSearchResults('', standardResults);
    expect(component.searchAreas[0].pages).toEqual([]);
    expect(component.searchAreas[1].pages).toEqual([
      guideE, guideF, guideG, guideH, guideI, guideJ, guideK, guideL
    ]);
  });

  it('should put a total count in the header of each area of search results', () => {
    setSearchResults('', standardResults);
    fixture.detectChanges();
    const headers = fixture.debugElement.queryAll(By.css('h3'));
    expect(headers.length).toEqual(2);
    expect(headers[0].nativeElement.textContent).toContain('(2)');
    expect(headers[1].nativeElement.textContent).toContain('(13)');
  });

  it('should put search results with no containing folder into the default area (other)', () => {
    const results = [
      { path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '', deprecated: false, topics: '' }
    ];

    setSearchResults('', results);
    expect(component.searchAreas).toEqual([
      { name: 'other', priorityPages: [
        { path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '', deprecated: false, topics: '' }
      ], pages: [] }
    ]);
  });

  it('should omit search results with no title', () => {
    const results = [
      { path: 'news', title: '', type: 'marketing', keywords: '', titleWords: '', deprecated: false, topics: '' }
    ];

    setSearchResults('something', results);
    expect(component.searchAreas).toEqual([]);
  });

  describe('when there are deprecated items', () => {
    beforeEach(() => {
      apiD.deprecated = true;
      guideAC.deprecated = true;
      guideJ.deprecated = true;
      guideE.deprecated = true;
      setSearchResults('something', standardResults);
    });
    // eslint-disable-next-line max-len
    it('should include deprecated items in priority pages unless there are fewer than 5 non-deprecated priority pages', () => {
      // Priority pages do not include deprecated items:
      expect(component.searchAreas[1].priorityPages).not.toContain(guideAC);
      expect(component.searchAreas[1].priorityPages).not.toContain(guideJ);
      // Except where there are too few priority pages:
      expect(component.searchAreas[0].priorityPages).toContain(apiD);
    });

    it('should move the non-priority deprecated pages to the bottom of the pages list, unsorted', () => {
      // Bottom pages are the deprecated ones (in original order)
      expect(component.searchAreas[1].pages.slice(-3)).toEqual([guideAC, guideJ, guideE]);
    });

    it('should sort the non-deprecated, non-priority pages by title', () => {
      // The rest of the pages are non-deprecated, sorted by title
      expect(component.searchAreas[1].pages.slice(0, -3)).toEqual([
        guideF, guideG, guideH, guideI, guideK,
      ]);
    });
  });

  it('should display "Searching ..." while waiting for search results', () => {
    fixture.detectChanges();
    expect(getText()).toContain('Searching ...');
  });

  it('should not display default links while searching', () => {
    fixture.detectChanges();
    const resultLinks = fixture.debugElement.queryAll(By.css('.search-page a'));
    expect(resultLinks.length).toEqual(0);
  });

  describe('when a search result anchor is clicked', () => {
    let searchResult: SearchResult;
    let selected: SearchResult|null;
    let anchor: DebugElement;

    beforeEach(() => {
      component.resultSelected.subscribe((result: SearchResult) => selected = result);

      selected = null;
      searchResult = {
        path: 'news',
        title: 'News',
        type: 'marketing',
        keywords: '',
        titleWords: '',
        deprecated: false,
        topics: '',
      };
      setSearchResults('something', [searchResult]);

      fixture.detectChanges();
      anchor = fixture.debugElement.query(By.css('a'));

      expect(selected).toBeNull();
    });

    it('should emit a "resultSelected" event', () => {
      anchor.triggerEventHandler('click', {button: 0, ctrlKey: false, metaKey: false});
      fixture.detectChanges();
      expect(selected).toBe(searchResult);
    });

    it('should not emit an event if mouse button is not zero (middle or right)', () => {
      anchor.triggerEventHandler('click', {button: 1, ctrlKey: false, metaKey: false});
      fixture.detectChanges();
      expect(selected).toBeNull();
    });

    it('should not emit an event if the `ctrl` key is pressed', () => {
      anchor.triggerEventHandler('click', {button: 0, ctrlKey: true, metaKey: false});
      fixture.detectChanges();
      expect(selected).toBeNull();
    });

    it('should not emit an event if the `meta` key is pressed', () => {
      anchor.triggerEventHandler('click', {button: 0, ctrlKey: false, metaKey: true});
      fixture.detectChanges();
      expect(selected).toBeNull();
    });
  });

  describe('when no query results', () => {
    beforeEach(() => {
      setSearchResults('something', []);
    });

    it('should display "not found" message', () => {
      expect(getText()).toContain('No results');
    });

    it('should contain reference links', () => {
      const resultLinks = fixture.debugElement.queryAll(By.css('.search-page a'));
      const resultHrefs = resultLinks.map(a => a.nativeNode.getAttribute('href'));
      expect(resultHrefs.length).toEqual(5);
      expect(resultHrefs).toEqual([
        'api',
        'resources',
        'guide/glossary',
        'guide/cheatsheet',
        'https://blog.angular.io/',
      ]);
    });
  });
});
