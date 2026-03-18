/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  output,
  viewChild,
  viewChildren,
} from '@angular/core';

import {ClickOutside, SearchItem} from '../../directives';
import {WINDOW} from '../../providers';
import {Search, SearchHistory} from '../../services';

import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {form, FormField} from '@angular/forms/signals';
import {Router, RouterLink} from '@angular/router';
import {fromEvent} from 'rxjs';
import {RelativeLink} from '../../pipes';
import {AlgoliaIcon} from '../algolia-icon/algolia-icon.component';
import {SearchHistoryComponent} from '../search-history/search-history.component';
import {TextField} from '../text-field/text-field.component';

@Component({
  selector: 'docs-search-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ClickOutside,
    TextField,
    FormField,
    SearchItem,
    AlgoliaIcon,
    RelativeLink,
    RouterLink,
    SearchHistoryComponent,
  ],
  templateUrl: './search-dialog.component.html',
  styleUrls: ['./search-dialog.component.scss'],
})
export class SearchDialog {
  readonly onClose = output();
  readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('searchDialog');
  readonly items = viewChildren(SearchItem);

  readonly history = inject(SearchHistory);
  private readonly search = inject(Search);
  private readonly relativeLink = new RelativeLink();
  private readonly router = inject(Router);
  private readonly window = inject(WINDOW);
  private readonly injector = inject(Injector);
  private readonly keyManager = new ActiveDescendantKeyManager(
    this.items,
    this.injector,
  ).withWrap();

  readonly resultsResource = this.search.resultsResource;
  readonly searchResults = this.search.searchResults;

  searchForm = form(this.search.searchQuery);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.keyManager.destroy());

    // Thinking about refactoring this to a single afterRenderEffect ?
    // Answer: It won't have the same behavior
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

  closeSearchDialog() {
    this.dialog().nativeElement.close();
    this.onClose.emit();
  }

  private navigateToTheActiveItem(): void {
    const activeItemLink: string | undefined = this.keyManager.activeItem?.item()?.url;

    if (!activeItemLink) {
      return;
    }

    this.router.navigateByUrl(this.relativeLink.transform(activeItemLink));
    this.onClose.emit();
  }
}
