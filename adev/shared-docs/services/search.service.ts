/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, afterNextRender, inject, signal} from '@angular/core';
import {ENVIRONMENT} from '../providers/index';
import {SearchResult} from '../interfaces/index';
import {toObservable} from '@angular/core/rxjs-interop';
import {debounceTime, filter, from, of, switchMap} from 'rxjs';
import {liteClient as algoliasearch} from 'algoliasearch/lite';
import {NavigationEnd, Router} from '@angular/router';

export const SEARCH_DELAY = 200;
// Maximum number of facet values to return for each facet during a regular search.
export const MAX_VALUE_PER_FACET = 5;

@Injectable({
  providedIn: 'root',
})
export class Search {
  private readonly _searchQuery = signal('');
  private readonly _searchResults = signal<undefined | SearchResult[]>(undefined);

  private readonly router = inject(Router);
  private readonly config = inject(ENVIRONMENT);
  private readonly client = algoliasearch(this.config.algolia.appId, this.config.algolia.apiKey);

  searchQuery = this._searchQuery.asReadonly();
  searchResults = this._searchResults.asReadonly();

  searchResults$ = toObservable(this.searchQuery).pipe(
    debounceTime(SEARCH_DELAY),
    switchMap((query) => {
      return !!query
        ? from(
            this.client.search([
              {
                indexName: this.config.algolia.indexName,
                params: {
                  query: query,
                  maxValuesPerFacet: MAX_VALUE_PER_FACET,
                  attributesToRetrieve: [
                    'hierarchy.lvl0',
                    'hierarchy.lvl1',
                    'hierarchy.lvl2',
                    'hierarchy.lvl3',
                    'hierarchy.lvl4',
                    'hierarchy.lvl5',
                    'hierarchy.lvl6',
                    'content',
                    'type',
                    'url',
                  ],
                  hitsPerPage: 20,
                  snippetEllipsisText: '…',
                  highlightPreTag: '<ɵ>',
                  highlightPostTag: '</ɵ>',
                  attributesToHighlight: [],
                  attributesToSnippet: [
                    'hierarchy.lvl1:10',
                    'hierarchy.lvl2:10',
                    'hierarchy.lvl3:10',
                    'hierarchy.lvl4:10',
                    'hierarchy.lvl5:10',
                    'hierarchy.lvl6:10',
                    'content:10',
                  ],
                },
                type: 'default',
              },
            ]),
          )
        : of(undefined);
    }),
  );

  constructor() {
    afterNextRender(() => {
      this.listenToSearchResults();
      this.resetSearchQueryOnNavigationEnd();
    });
  }

  updateSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  private listenToSearchResults(): void {
    this.searchResults$.subscribe((response: any) => {
      this._searchResults.set(
        response ? this.getUniqueSearchResultItems(response.results[0].hits) : undefined,
      );
    });
  }

  private getUniqueSearchResultItems(items: SearchResult[]): SearchResult[] {
    const uniqueUrls = new Set<string>();

    return items.filter((item) => {
      if (item.type === 'content' && !item._snippetResult.content) {
        return false;
      }
      // Ensure that this result actually matched on the type.
      // If not, this is going to be a duplicate. There should be another result in
      // the list that already matched on its type.
      // A lvl2 match will also return all its lvl3 results as well, even if those
      // values don't also match the query.
      if (
        item.type.indexOf('lvl') === 0 &&
        item._snippetResult.hierarchy?.[item.type as 'lvl1']?.matchLevel === 'none'
      ) {
        return false;
      }
      if (item.url && !uniqueUrls.has(item.url)) {
        uniqueUrls.add(item.url);
        return true;
      }
      return false;
    });
  }

  private resetSearchQueryOnNavigationEnd(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateSearchQuery('');
    });
  }
}
