/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {provideZonelessChangeDetection, ApplicationRef} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';

import {SearchHistoryComponent} from './search-history.component';
import {HistoryItem, SearchHistory} from '../../services';
import {LOCAL_STORAGE} from '../../providers';
import {MockLocalStorage} from '../../testing';

// Keep in sync with the template & styles
const RECENT_CONT_SELECTOR = '.recent';
const FAV_CONT_SELECTOR = '.favorite';
const LABEL_SELECTOR = 'a > span';
const REMOVE_BTN_SELECTOR = 'button.remove-btn';
const FAV_BTN_SELECTOR = 'button.fav-btn';

const RECENT_ITEMS = `${RECENT_CONT_SELECTOR} ${LABEL_SELECTOR}`;
const FAV_ITEMS = `${FAV_CONT_SELECTOR} ${LABEL_SELECTOR}`;

const ITEMS: HistoryItem[] = [
  {
    id: 'c',
    labelHtml: 'Item C',
    url: 'https://angular.dev',
    isFavorite: true,
    createdAt: 0,
  },
  {
    id: 'b',
    labelHtml: 'Item B',
    url: 'https://angular.dev',
    isFavorite: false,
    createdAt: 0,
  },
  {
    id: 'a',
    labelHtml: 'Item A',
    url: 'https://angular.dev',
    isFavorite: false,
    createdAt: 0,
  },
];

async function loadItems(history: SearchHistory) {
  for (const item of ITEMS) {
    // Since adding an item sets a timestamp which is later
    // used for sorting the items array, we
    // update the clock by awaiting a timeout.
    history.addItem(item);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }

  const favorite = ITEMS.filter((i) => i.isFavorite);
  for (const item of favorite) {
    history.makeFavorite(item);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }

  TestBed.tick();
  await TestBed.inject(ApplicationRef).whenStable();
}

describe('SearchHistoryComponent', () => {
  let fixture: ComponentFixture<SearchHistoryComponent>;
  let history: SearchHistory;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {provide: LOCAL_STORAGE, useClass: MockLocalStorage},
        provideRouter([]),
      ],
    });

    fixture = TestBed.createComponent(SearchHistoryComponent);
    history = TestBed.inject(SearchHistory);

    await loadItems(history);

    TestBed.tick();
    await TestBed.inject(ApplicationRef).whenStable();
  });

  it('should render all items', async () => {
    const recent = fixture.debugElement.queryAll(By.css(RECENT_ITEMS));
    const favorite = fixture.debugElement.queryAll(By.css(FAV_ITEMS));

    expect(history.items().recent[0].id).toBe('a');
    expect(history.items().recent[1].id).toBe('b');

    expect(recent.map((el) => el.nativeElement.innerText)).toEqual(['Item A', 'Item B']);
    expect(favorite.map((el) => el.nativeElement.innerText)).toEqual(['Item C']);
  });

  it('should remove an item', () => {
    const firstRecent = fixture.debugElement.query(
      By.css(`${RECENT_CONT_SELECTOR} ${REMOVE_BTN_SELECTOR}`),
    );
    firstRecent.nativeElement.click();

    TestBed.tick();

    const recent = fixture.debugElement.queryAll(By.css(RECENT_ITEMS));
    expect(recent.map((el) => el.nativeElement.innerText)).toEqual(['Item B']);
  });

  it('should make an item favorite', () => {
    const firstRecent = fixture.debugElement.query(
      By.css(`${RECENT_CONT_SELECTOR} ${FAV_BTN_SELECTOR}`),
    );
    firstRecent.nativeElement.click();

    TestBed.tick();

    const recent = fixture.debugElement.queryAll(By.css(RECENT_ITEMS));
    expect(recent.map((el) => el.nativeElement.innerText)).toEqual(['Item B']);

    const favorite = fixture.debugElement.queryAll(By.css(FAV_ITEMS));
    expect(favorite.map((el) => el.nativeElement.innerText)).toEqual(['Item A', 'Item C']);
  });
});
