/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
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

describe('SearchHistory', async () => {
  let service: SearchHistory;
  let storage: Storage;

  async function loadItems() {
    for (const item of ITEMS) {
      // Since adding an item sets a timestamp which is later
      // used for sorting the items array, we
      // update the clock by awaiting a timeout.
      await new Promise((resolve) => setTimeout(resolve, 5));
      service.addItem(item);
    }
  }

  beforeEach(() => {
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

  it('should load history items', async () => {
    await loadItems();

    expect(service.items().recent.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('should delete a history item', async () => {
    await loadItems();

    const bItem = ITEMS.find((i) => i.id === 'b')!;

    service.removeItem(bItem);

    expect(service.items().recent.map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('should make item favorite', async () => {
    await loadItems();

    const aItem = ITEMS.find((i) => i.id === 'a')!;

    service.makeFavorite(aItem);

    expect(service.items().recent.map((i) => i.id)).toEqual(['b', 'c']);
    expect(service.items().favorite.map((i) => i.id)).toEqual(['a']);
  });

  it('should set a limit to history size', async () => {
    const extra = 10;
    const ids = [];

    for (let i = 1; i <= MAX_RECENT_HISTORY_SIZE + extra; i++) {
      const id = i.toString();
      ids.push(id);

      await new Promise((resolve) => setTimeout(resolve, 5));
      service.addItem({
        id,
        labelHtml: id,
        isFavorite: false,
        url: '',
        createdAt: 0,
      });
    }

    ids.splice(0, extra);

    expect(service.items().recent.map((i) => i.id)).toEqual(ids.reverse());
  });
});
