/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SearchDialog} from './search-dialog.component';
import {ENVIRONMENT, WINDOW} from '../../providers';
import {ALGOLIA_CLIENT, Search} from '../../services';
import {FakeEventTarget} from '../../testing/index';
import {By} from '@angular/platform-browser';
import {AlgoliaIcon} from '../algolia-icon/algolia-icon.component';
import {Router, provideRouter} from '@angular/router';
import {ApplicationRef, provideZonelessChangeDetection, ResourceStatus} from '@angular/core';
import {SearchResult} from '../../interfaces';

describe('SearchDialog', () => {
  let fixture: ComponentFixture<SearchDialog>;

  const searchResults = jasmine.createSpy();

  const fakeWindow = new FakeEventTarget();

  let search: Search;

  beforeEach(async () => {
    searchResults.and.returnValue([]);

    TestBed.configureTestingModule({
      imports: [SearchDialog, provideRouter([])],
      providers: [
        provideZonelessChangeDetection(),
        {provide: ENVIRONMENT, useValue: {algolia: {index: 'fakeIndex'}}},
        {provide: ALGOLIA_CLIENT, useValue: {search: searchResults}},
        {provide: WINDOW, useValue: fakeWindow},
      ],
    });

    fixture = TestBed.createComponent(SearchDialog);
    fixture.detectChanges();
    search = TestBed.inject(Search);
  });

  it('should navigate to active item when user pressed Enter', async () => {
    const router = TestBed.inject(Router);
    const navigateByUrlSpy = spyOn(router, 'navigateByUrl');

    search.searchQuery.set('fakeQuery');
    searchResults.and.returnValue(Promise.resolve({results: [{hits: fakeSearchResults}]}));

    // Fire the request
    TestBed.inject(ApplicationRef).tick();

    // Wait for the resource to resolve
    await TestBed.inject(ApplicationRef).whenStable();

    fakeWindow.dispatchEvent(
      new KeyboardEvent('keydown', {
        code: 'Enter',
        key: 'Enter',
        charCode: 13,
        keyCode: 13,
        view: window,
        bubbles: true,
      }),
    );

    expect(navigateByUrlSpy).toHaveBeenCalledOnceWith('fakeUrl1#h1');
  });

  it('should always display algolia logo', () => {
    const algoliaIcon = fixture.debugElement.query(By.directive(AlgoliaIcon));

    expect(algoliaIcon).toBeTruthy();
  });

  it('should display `No results found` message when there are no results for provided query', async () => {
    search.searchQuery.set('fakeQuery');
    searchResults.and.returnValue(Promise.resolve({results: [{hits: []}]}));

    // Fire the request
    TestBed.inject(ApplicationRef).tick();

    // Wait for the resource to resolve
    await TestBed.inject(ApplicationRef).whenStable();

    const noResultsContainer = fixture.debugElement.query(
      By.css('.docs-search-results__no-results'),
    );

    expect(noResultsContainer).toBeTruthy();
  });

  it('should display `Start typing to see results` message when there are no provided query', () => {
    searchResults.and.returnValue(undefined);
    fixture.detectChanges();

    const startTypingContainer = fixture.debugElement.query(
      By.css('.docs-search-results__start-typing'),
    );

    expect(startTypingContainer).toBeTruthy();
  });

  it('should display list of the search results when results exist', async () => {
    search.searchQuery.set('fakeQuery');
    searchResults.and.returnValue(Promise.resolve({results: [{hits: fakeSearchResults}]}));

    // Fire the request
    TestBed.inject(ApplicationRef).tick();

    // Wait for the resource to resolve
    await TestBed.inject(ApplicationRef).whenStable();

    const resultListContainer = fixture.debugElement.query(By.css('ul.docs-search-results'));
    const resultItems = fixture.debugElement.queryAll(By.css('ul.docs-search-results li a'));

    expect(resultListContainer).toBeTruthy();
    expect(resultItems.length).toBe(2);
    expect(resultItems[0].nativeElement.href).toBe(`${window.origin}/fakeUrl1#h1`);
    expect(resultItems[1].nativeElement.href).toBe(`${window.origin}/fakeUrl2#h1`);
  });

  it('should close search dialog when user clicked outside `.docs-search-container`', () => {
    const dialogContainer = fixture.debugElement.query(By.css('dialog'));
    const closeSearchDialogSpy = spyOn(fixture.componentInstance, 'closeSearchDialog');

    dialogContainer.nativeElement.click();

    expect(closeSearchDialogSpy).toHaveBeenCalled();
  });
});

const fakeSearchResults = [
  {
    'url': 'https://angular.dev/fakeUrl1#h1',
    'hierarchy': {
      'lvl0': 'FakeLvl0',
      'lvl1': 'FakeLvl1',
      'lvl2': 'FakeLvl2',
      'lvl3': null,
      'lvl4': null,
      'lvl5': null,
      'lvl6': null,
    },
    'objectID': 'fakeObjectId1',
    _snippetResult: {},
    type: '',
    content: null,
  },
  {
    'url': 'https://angular.dev/fakeUrl2#h1',
    'hierarchy': {
      'lvl0': 'FakeLvl0',
      'lvl1': 'FakeLvl1',
      'lvl2': 'FakeLvl2',
      'lvl3': null,
      'lvl4': null,
      'lvl5': null,
      'lvl6': null,
    },
    'objectID': 'fakeObjectId2',
    type: '',
    content: null,
    _snippetResult: {},
  },
] satisfies SearchResult[];
