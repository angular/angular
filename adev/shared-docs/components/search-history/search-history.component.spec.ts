/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';
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

function loadItems(history: SearchHistory) {
  for (const item of ITEMS) {
    // Since adding an item sets a timestamp which is later
    // used for sorting the items array, we artificially
    // tick forward the clock and then flush the microtask queue
    // to ensure proper/expected order. This is needed since we
    // are updating the internal signal multiple times consecutively.
    jasmine.clock().tick(100);
    history.addItem(item);
    flushMicrotasks();
  }

  const favorite = ITEMS.filter((i) => i.isFavorite);
  for (const item of favorite) {
    jasmine.clock().tick(100);
    history.makeFavorite(item);
    flushMicrotasks();
  }
}

describe('SearchHistoryComponent', () => {
  let fixture: ComponentFixture<SearchHistoryComponent>;
  let history: SearchHistory;

  beforeEach(fakeAsync(async () => {
    jasmine.clock().uninstall();
    jasmine.clock().install();

    await TestBed.configureTestingModule({
      imports: [SearchHistoryComponent],
      providers: [
        provideZonelessChangeDetection(),
        {provide: LOCAL_STORAGE, useClass: MockLocalStorage},
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchHistoryComponent);
    history = TestBed.inject(SearchHistory);

    loadItems(history);

    fixture.detectChanges();
  }));

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should render all items', () => {
    const recent = fixture.debugElement.queryAll(By.css(RECENT_ITEMS));
    const favorite = fixture.debugElement.queryAll(By.css(FAV_ITEMS));

    expect(recent.map((el) => el.nativeElement.innerText)).toEqual(['Item A', 'Item B']);
    expect(favorite.map((el) => el.nativeElement.innerText)).toEqual(['Item C']);
  });

  it('should remove an item', () => {
    const firstRecent = fixture.debugElement.query(
      By.css(`${RECENT_CONT_SELECTOR} ${REMOVE_BTN_SELECTOR}`),
    );
    firstRecent.nativeElement.click();

    fixture.detectChanges();

    const recent = fixture.debugElement.queryAll(By.css(RECENT_ITEMS));
    expect(recent.map((el) => el.nativeElement.innerText)).toEqual(['Item B']);
  });

  it('should make an item favorite', () => {
    const firstRecent = fixture.debugElement.query(
      By.css(`${RECENT_CONT_SELECTOR} ${FAV_BTN_SELECTOR}`),
    );
    firstRecent.nativeElement.click();

    fixture.detectChanges();

    const recent = fixture.debugElement.queryAll(By.css(RECENT_ITEMS));
    expect(recent.map((el) => el.nativeElement.innerText)).toEqual(['Item B']);

    const favorite = fixture.debugElement.queryAll(By.css(FAV_ITEMS));
    expect(favorite.map((el) => el.nativeElement.innerText)).toEqual(['Item C', 'Item A']);
  });
});
