/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';
import {
  HistoryItem,
  MAX_RECENT_HISTORY_SIZE,
  SEARCH_HISTORY_LS_KEY,
  SearchHistory,
} from './search-history.service';
import {LOCAL_STORAGE} from '../providers';
import {MockLocalStorage} from '../testing';

const ITEMS: HistoryItem[] = [
  {
    id: 'c',
    labelHtml: 'Item C',
  },
  {
    id: 'b',
    labelHtml: 'Item B',
  },
  {
    id: 'a',
    labelHtml: 'Item A',
  },
].map((i) => ({...i, url: '', createdAt: 0, isFavorite: false}));

describe('SearchHistory', () => {
  let service: SearchHistory;
  let storage: Storage;

  function loadItems() {
    for (const item of ITEMS) {
      // Since adding an item sets a timestamp which is later
      // used for sorting the items array, we artificially
      // tick forward the clock and then flush the microtask queue
      // to ensure proper/expected order. This is needed since we
      // are updating the internal signal multiple times consecutively.
      jasmine.clock().tick(100);
      service.addItem(item);
      flushMicrotasks();
    }
  }

  beforeEach(() => {
    jasmine.clock().uninstall();
    jasmine.clock().install();

    TestBed.configureTestingModule({
      providers: [
        SearchHistory,
        {
          provide: LOCAL_STORAGE,
          useClass: MockLocalStorage,
        },
      ],
    });
    service = TestBed.inject(SearchHistory);
    storage = TestBed.inject(LOCAL_STORAGE)!;
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a history item (both storage and instance)', () => {
    const item: HistoryItem = {
      id: 'a',
      labelHtml: 'Item 1',
      createdAt: 0,
      isFavorite: false,
      url: '',
    };

    service.addItem(item);

    // Instance check
    expect(service.items().recent.map((i) => i.id)).toEqual(['a']);

    expect(service.hasItems()).toBeTruthy();

    // Storage check
    const dataString = storage.getItem(SEARCH_HISTORY_LS_KEY) as string | null;
    const data = JSON.parse(dataString ?? '') ?? [];

    expect(data?.length).toEqual(1);

    const itemCopy = {...item} as Partial<HistoryItem>;
    delete itemCopy.createdAt;

    expect(data.pop()).toEqual(jasmine.objectContaining(itemCopy));
  });

  it('should load history items', fakeAsync(() => {
    loadItems();

    expect(service.items().recent.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  }));

  it('should delete a history item', fakeAsync(() => {
    loadItems();

    const bItem = ITEMS.find((i) => i.id === 'b')!;

    service.removeItem(bItem);

    expect(service.items().recent.map((i) => i.id)).toEqual(['a', 'c']);
  }));

  it('should make item favorite', fakeAsync(() => {
    loadItems();

    const aItem = ITEMS.find((i) => i.id === 'a')!;

    service.makeFavorite(aItem);

    expect(service.items().recent.map((i) => i.id)).toEqual(['b', 'c']);
    expect(service.items().favorite.map((i) => i.id)).toEqual(['a']);
  }));

  it('should set a limit to history size', fakeAsync(() => {
    const extra = 10;
    const ids = [];

    for (let i = 1; i <= MAX_RECENT_HISTORY_SIZE + extra; i++) {
      const id = i.toString();
      ids.push(id);

      jasmine.clock().tick(100);
      service.addItem({
        id,
        labelHtml: id,
        isFavorite: false,
        url: '',
        createdAt: 0,
      });
      flushMicrotasks();
    }

    ids.splice(0, extra);

    expect(service.items().recent.map((i) => i.id)).toEqual(ids.reverse());
  }));
});
