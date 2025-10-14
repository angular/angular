/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {computed, inject, Injectable, signal} from '@angular/core';
import {LOCAL_STORAGE} from '../providers';
// Add version postfix to the key in case (if ever) the data model changes in the future.
export const SEARCH_HISTORY_LS_KEY = 'docs-search-history-v1';
export const MAX_RECENT_HISTORY_SIZE = 10;
function cleanUpHtml(label) {
  return (label || '').replace(/<\/?mark>/g, '');
}
let SearchHistory = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var SearchHistory = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      SearchHistory = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    localStorage = inject(LOCAL_STORAGE);
    history = signal(new Map());
    allItems = computed(() =>
      Array.from(this.history().values()).sort((a, b) => b.createdAt - a.createdAt),
    );
    items = computed(() => ({
      recent: this.allItems().filter((v) => !v.isFavorite),
      favorite: this.allItems().filter((v) => v.isFavorite),
    }));
    hasItems = computed(() => this.allItems().length > 0);
    constructor() {
      this.loadHistory();
    }
    addItem(item) {
      // We don't want to reset nor update the creation date of favorites
      if (this.history().get(item.id)?.isFavorite) {
        return;
      }
      this.updateHistory((map) => {
        map.set(item.id, {
          id: item.id,
          labelHtml: cleanUpHtml(item.labelHtml),
          subLabelHtml: item.subLabelHtml ? cleanUpHtml(item.subLabelHtml) : undefined,
          url: item.url,
          isFavorite: false,
          createdAt: Date.now(),
        });
        // `items` still hasn't been updated so we should use `>=`.
        if (this.items().recent.length >= MAX_RECENT_HISTORY_SIZE) {
          const {id} = this.items().recent.at(-1);
          map.delete(id);
        }
      });
    }
    removeItem(item) {
      this.updateHistory((map) => {
        map.delete(item.id);
      });
    }
    makeFavorite(item) {
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
    loadHistory() {
      let parsedData;
      try {
        const historyData = this.localStorage?.getItem(SEARCH_HISTORY_LS_KEY);
        parsedData = JSON.parse(historyData ?? '[]');
      } catch {
        parsedData = [];
      }
      const history = new Map();
      for (const item of parsedData) {
        history.set(item.id, item);
      }
      this.history.set(history);
    }
    updateHistory(updateFn) {
      const history = new Map(this.history());
      updateFn(history);
      this.history.set(history);
      try {
        this.localStorage?.setItem(SEARCH_HISTORY_LS_KEY, JSON.stringify(this.allItems()));
      } catch {}
    }
  };
  return (SearchHistory = _classThis);
})();
export {SearchHistory};
//# sourceMappingURL=search-history.service.js.map
