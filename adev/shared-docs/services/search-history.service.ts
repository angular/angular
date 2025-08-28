/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, inject, Injectable, signal} from '@angular/core';
import {LOCAL_STORAGE} from '../providers';
import {SearchResultItem} from '../interfaces';

// Add version postfix to the key in case (if ever) the data model changes in the future.
export const SEARCH_HISTORY_LS_KEY = 'docs-search-history-v1';

export const MAX_RECENT_HISTORY_SIZE = 10;

// Represents V1 history item
export interface HistoryItem {
  id: string;
  labelHtml: string;
  url: string;
  isFavorite: boolean;
  createdAt: number;
}

@Injectable({providedIn: 'root'})
export class SearchHistory {
  private readonly localStorage = inject(LOCAL_STORAGE);
  private readonly history = signal<Map<string, HistoryItem>>(new Map());

  private readonly allItems = computed(() =>
    Array.from(this.history().values()).sort((a, b) => b.createdAt - a.createdAt),
  );

  readonly items = computed<{recent: HistoryItem[]; favorite: HistoryItem[]}>(() => ({
    recent: this.allItems().filter((v) => !v.isFavorite),
    favorite: this.allItems().filter((v) => v.isFavorite),
  }));

  readonly hasItems = computed(() => this.allItems().length > 0);

  constructor() {
    this.loadHistory();
  }

  addItem(item: SearchResultItem | HistoryItem): void {
    this.updateHistory((map) => {
      const labelHtml = (item.labelHtml || '').replace(/<\/?mark>/g, '');

      map.set(item.id, {
        id: item.id,
        labelHtml,
        url: item.url,
        isFavorite: false,
        createdAt: Date.now(),
      });

      // `items` still hasn't been updated so we should use `>=`.
      if (this.items().recent.length >= MAX_RECENT_HISTORY_SIZE) {
        const {id} = this.items().recent.at(-1)!;
        map.delete(id);
      }
    });
  }

  removeItem(item: SearchResultItem | HistoryItem): void {
    this.updateHistory((map) => {
      map.delete(item.id);
    });
  }

  makeFavorite(item: SearchResultItem | HistoryItem): void {
    this.updateHistory((map) => {
      const updated = map.get(item.id);
      if (updated) {
        map.set(item.id, {
          ...updated,
          isFavorite: true,
          createdAt: Date.now(),
        });
      }
    });
  }

  private loadHistory(): void {
    let parsedData: HistoryItem[];

    try {
      const historyData = this.localStorage?.getItem(SEARCH_HISTORY_LS_KEY) as string | null;
      parsedData = JSON.parse(historyData ?? '[]') as HistoryItem[];
    } catch {
      parsedData = [];
    }

    const history = new Map();
    for (const item of parsedData) {
      history.set(item.id, item);
    }
    this.history.set(history);
  }

  private updateHistory(updateFn: (map: Map<string, HistoryItem>) => void): void {
    const history = new Map(this.history());
    updateFn(history);
    this.history.set(history);

    try {
      this.localStorage?.setItem(SEARCH_HISTORY_LS_KEY, JSON.stringify(this.allItems()));
    } catch {}
  }
}
