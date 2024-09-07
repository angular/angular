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
import {SearchResult, SnippetResult} from '../../interfaces';

@Component({
  selector: 'docs-search-dialog',
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
  searchResults = this.search.searchResults;

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
