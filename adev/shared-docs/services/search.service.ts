/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, InjectionToken, Provider, inject, resource, signal} from '@angular/core';
import {ENVIRONMENT} from '../providers/index';
import type {Environment, SearchResult, SearchResultItem, SnippetResult} from '../interfaces/index';
import {
  LiteClient,
  liteClient as algoliasearch,
  SearchResponses,
  SearchResult as AlgoliaSearchResult,
} from 'algoliasearch/lite';

export const SEARCH_DELAY = 200;
// Maximum number of facet values to return for each facet during a regular search.
export const MAX_VALUE_PER_FACET = 5;

export const ALGOLIA_CLIENT: InjectionToken<LiteClient> = new InjectionToken<LiteClient>(
  'Search service',
);

export const provideAlgoliaSearchClient = (config: Environment): Provider => {
  return {
    provide: ALGOLIA_CLIENT,
    useFactory: () => algoliasearch(config.algolia.appId, config.algolia.apiKey),
  };
};

@Injectable({
  providedIn: 'root',
})
export class Search {
  readonly searchQuery = signal('');

  private readonly config = inject(ENVIRONMENT);
  private readonly client = inject(ALGOLIA_CLIENT);

  searchResults = resource({
    params: () => this.searchQuery() || undefined, // coerces empty string to undefined
    loader: async ({params: query, abortSignal}) => {
      // Until we have a better alternative we debounce by awaiting for a short delay.
      await wait(SEARCH_DELAY, abortSignal);

      return this.client
        .search([
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
        ])
        .then((response: SearchResponses<unknown>) => {
          return this.parseResult(response);
        });
    },
  });

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

      if (item['url'] && typeof item['url'] === 'string' && !uniqueUrls.has(item['url'])) {
        uniqueUrls.add(item['url']);
        return true;
      }
      return false;
    });
  }

  private parseResult(response: SearchResponses<unknown>): SearchResultItem[] | undefined {
    if (!response) {
      return;
    }

    const result: AlgoliaSearchResult = response.results[0];
    if (!result || !('hits' in result)) {
      return;
    }

    const items = result.hits as unknown as SearchResult[];

    return this.getUniqueSearchResultItems(items).map((hitItem: SearchResult) => {
      const content = hitItem._snippetResult.content;
      const hierarchy = hitItem._snippetResult.hierarchy;
      const hasSubLabel = content || hierarchy?.lvl2 || hierarchy?.lvl3 || hierarchy?.lvl4;

      return {
        id: hitItem.objectID,
        type: hitItem.hierarchy.lvl0 === 'Tutorials' ? 'code' : 'doc',
        url: hitItem.url,

        labelHtml: this.parseLabelToHtml(hitItem._snippetResult.hierarchy?.lvl1?.value ?? ''),
        subLabelHtml: this.parseLabelToHtml(
          hasSubLabel ? this.getBestSnippetForMatch(hitItem) : null,
        ),

        category: hitItem.hierarchy?.lvl0 ?? null,
      };
    });
  }

  private getBestSnippetForMatch(result: SearchResult): string {
    // if there is content, return it
    if (result._snippetResult.content !== undefined) {
      return result._snippetResult.content.value;
    }

    const hierarchy = result._snippetResult.hierarchy;
    if (hierarchy === undefined) {
      return '';
    }

    // return the most specific subheader match
    if (matched(hierarchy.lvl4)) {
      return hierarchy.lvl4!.value;
    }
    if (matched(hierarchy.lvl3)) {
      return hierarchy.lvl3!.value;
    }
    if (matched(hierarchy.lvl2)) {
      return hierarchy.lvl2!.value;
    }
    // if no subheader matched the query, fall back to just returning the most specific one
    return hierarchy.lvl3?.value ?? hierarchy.lvl2?.value ?? '';
  }

  /**
   * Returns an HTML string with marked text for the matches
   */
  private parseLabelToHtml(label: string | null): string | null {
    if (label === null) {
      return null;
    }

    const parts: Array<{highlight: boolean; text: string}> = [];
    while (label.indexOf('<ɵ>') !== -1) {
      const beforeMatch = label.substring(0, label.indexOf('<ɵ>'));
      const match = label.substring(label.indexOf('<ɵ>') + 3, label.indexOf('</ɵ>'));
      parts.push({highlight: false, text: beforeMatch});
      parts.push({highlight: true, text: match});
      label = label.substring(label.indexOf('</ɵ>') + 4);
    }
    parts.push({highlight: false, text: label});

    return parts
      .map((part) => {
        return part.highlight ? `<mark>${part.text}</mark>` : `<span>${part.text}</span>`;
      })
      .join('');
  }
}

function matched(snippet: SnippetResult | undefined): boolean {
  return snippet?.matchLevel !== undefined && snippet.matchLevel !== 'none';
}

/**
 * Temporary helper to implement the debounce functionality on the search resource
 */
function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => resolve(), ms);

    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        reject(new Error('Operation aborted'));
      },
      {once: true},
    );
  });
}
