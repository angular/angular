/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {ActivatedRoute, RouterLink, UrlSegment} from '@angular/router';
import {Search, SearchItem, RelativeLink, SearchResultItem} from '@angular/docs';

@Component({
  imports: [SearchItem, RouterLink, RelativeLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  private readonly search = inject(Search);
  protected readonly searchResults = signal<SearchResultItem[]>([]);

  constructor() {
    const activatedRoute = inject(ActivatedRoute);
    const searchTerms = this.extractSearchTerm(activatedRoute.snapshot.url);
    if (searchTerms) {
      // We're using the one-shot query request to not interfere with the main search signal
      this.search.searchWithQuery(searchTerms).then((results) => {
        this.searchResults.set(results ?? []);
      });
    }
  }

  private extractSearchTerm(url: UrlSegment[]): string {
    return url.join(' ').replace(/[-_/]/g, ' ');
  }
}
