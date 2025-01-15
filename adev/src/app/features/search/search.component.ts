/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  afterRenderEffect,
  Component,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
  viewChildren,
} from '@angular/core';
import {
  Search,
  SearchResult,
  SnippetResult,
  WINDOW,
  RelativeLink,
  SearchItem,
  TextField,
  AlgoliaIcon,
} from '@angular/docs';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {fromEvent} from 'rxjs';
import {NgTemplateOutlet} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  templateUrl: './search.component.html',
  imports: [
    AlgoliaIcon,
    FormsModule,
    NgTemplateOutlet,
    RelativeLink,
    RouterLink,
    SearchItem,
    TextField,
  ],
  styleUrls: ['./search.component.scss'],
})
export class SearchPage {
  urlSearchQuery = input('', {alias: 'q'});
  items = viewChildren(SearchItem);

  private readonly search = inject(Search);
  private readonly relativeLink = new RelativeLink();
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  protected searchQuery = this.search.searchQuery;
  protected searchResults = this.search.searchResults;

  constructor() {
    const window = inject(WINDOW);
    afterNextRender(() => {
      // One-time set from the URL query parameter
      if (this.urlSearchQuery()) {
        this.updateSearchQuery(this.urlSearchQuery());
      }

      this.setupKeyManager(window);
    });
  }

  splitMarkedText(snippet: string): Array<{highlight: boolean; text: string}> {
    const parts: Array<{highlight: boolean; text: string}> = [];
    while (snippet.indexOf('<ɵ>') !== -1) {
      const beforeMatch = snippet.substring(0, snippet.indexOf('<ɵ>'));
      const match = snippet.substring(snippet.indexOf('<ɵ>') + 3, snippet.indexOf('</ɵ>'));
      parts.push({highlight: false, text: beforeMatch});
      parts.push({highlight: true, text: match});
      snippet = snippet.substring(snippet.indexOf('</ɵ>') + 4);
    }
    parts.push({highlight: false, text: snippet});
    return parts;
  }

  getBestSnippetForMatch(result: SearchResult): string {
    // if there is content, return it
    if (result._snippetResult.content !== undefined) {
      return result._snippetResult.content.value;
    }

    const hierarchy = result._snippetResult.hierarchy;
    if (hierarchy === undefined) {
      return '';
    }
    function matched(snippet: SnippetResult | undefined) {
      return snippet?.matchLevel !== undefined && snippet.matchLevel !== 'none';
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

  protected updateSearchQuery(query: string): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {q: query},
      queryParamsHandling: 'merge', // remove to replace all query params by provided
      replaceUrl: true,
    });
    this.search.updateSearchQuery(query);
  }

  private navigateToTheActiveItem(keyManager: ActiveDescendantKeyManager<SearchItem>): void {
    const activeItemLink: string | undefined = keyManager.activeItem?.item?.url;

    if (!activeItemLink) {
      return;
    }

    this.router.navigateByUrl(this.relativeLink.transform(activeItemLink));
  }

  /**
   * This method is meant to run only on the client side
   */
  private setupKeyManager(window: Window): void {
    const keyManager = new ActiveDescendantKeyManager(this.items, this.injector).withWrap();
    fromEvent<KeyboardEvent>(window, 'keydown')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        // When user presses Enter we can navigate to currently selected item in the search result list.
        if (event.key === 'Enter') {
          this.navigateToTheActiveItem(keyManager);
        } else {
          keyManager.onKeydown(event);
        }
      });

    keyManager.change.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      keyManager.activeItem?.scrollIntoView();
    });

    effect(
      () => {
        this.items();
        afterNextRender(
          {
            write: () => keyManager.setFirstItemActive(),
          },
          {injector: this.injector},
        );
      },
      {injector: this.injector},
    );

    this.destroyRef.onDestroy(() => keyManager.destroy());
  }
}
