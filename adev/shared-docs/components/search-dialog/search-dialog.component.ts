/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  Signal,
  afterNextRender,
  computed,
  effect,
  inject,
  output,
  viewChild,
  viewChildren,
} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';

import {WINDOW} from '../../providers/index';
import {ClickOutside} from '../../directives/index';
import {Search} from '../../services/index';

import {TextField} from '../text-field/text-field.component';
import {FormsModule} from '@angular/forms';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {SearchItem} from '../../directives/search-item/search-item.directive';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router, RouterLink} from '@angular/router';
import {filter, fromEvent} from 'rxjs';
import {AlgoliaIcon} from '../algolia-icon/algolia-icon.component';
import {RelativeLink} from '../../pipes/relative-link.pipe';
import {SearchResult} from '../../interfaces';

@Component({
  selector: 'docs-search-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ClickOutside,
    TextField,
    FormsModule,
    SearchItem,
    AlgoliaIcon,
    RelativeLink,
    RouterLink,
    NgTemplateOutlet,
  ],
  templateUrl: './search-dialog.component.html',
  styleUrls: ['./search-dialog.component.scss'],
})
export class SearchDialog implements OnDestroy {
  onClose = output();
  dialog = viewChild.required<ElementRef<HTMLDialogElement>>('searchDialog');
  items = viewChildren(SearchItem);

  private readonly search = inject(Search);
  private readonly relativeLink = new RelativeLink();
  private readonly router = inject(Router);
  private readonly window = inject(WINDOW);
  private readonly injector = inject(Injector);
  private readonly keyManager = new ActiveDescendantKeyManager(
    this.items,
    this.injector,
  ).withWrap();

  searchQuery = this.search.searchQuery;
  // searchResults = this.search.searchResults;
  searchResults: Signal<Array<{header: string; results: SearchResult[]}>> = computed(() => {
    const results = this.search.searchResults();
    if (results === undefined) {
      return [];
    }
    return [
      ...Array.from(results.docsResultsByHeader.keys()).map((header) => ({
        header: header,
        results: results.docsResultsByHeader.get(header)!,
      })),
      ...(results.apiReferenceResults.length > 0
        ? [
            {
              header: 'API Reference',
              results: results.apiReferenceResults,
            },
          ]
        : []),
    ];
  });

  constructor() {
    effect(() => {
      this.items();
      afterNextRender(
        {
          write: () => this.keyManager.setFirstItemActive(),
        },
        {injector: this.injector},
      );
    });

    this.keyManager.change.pipe(takeUntilDestroyed()).subscribe(() => {
      this.keyManager.activeItem?.scrollIntoView();
    });

    afterNextRender({
      write: () => {
        if (!this.dialog().nativeElement.open) {
          this.dialog().nativeElement.showModal?.();
        }
      },
    });

    fromEvent<KeyboardEvent>(this.window, 'keydown')
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        // When user presses Enter we can navigate to currently selected item in the search result list.
        if (event.key === 'Enter') {
          this.navigateToTheActiveItem();
        } else {
          this.keyManager.onKeydown(event);
        }
      });
  }

  splitHighlightedText(snippet: string): Array<{highlight: boolean; text: string}> {
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

  ngOnDestroy(): void {
    this.keyManager.destroy();
  }

  closeSearchDialog() {
    this.dialog().nativeElement.close();
    this.onClose.emit();
  }

  updateSearchQuery(query: string) {
    this.search.updateSearchQuery(query);
  }

  private navigateToTheActiveItem(): void {
    const activeItemLink: string | undefined = this.keyManager.activeItem?.item?.url;

    if (!activeItemLink) {
      return;
    }

    this.router.navigateByUrl(this.relativeLink.transform(activeItemLink));
    this.onClose.emit();
  }
}
