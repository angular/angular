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
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  output,
  viewChild,
  viewChildren,
} from '@angular/core';

import {WINDOW} from '../../providers/index';
import {ClickOutside} from '../../directives/index';
import {Search, SearchHistory} from '../../services/index';

import {TextField} from '../text-field/text-field.component';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {SearchItem} from '../../directives/search-item/search-item.directive';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router, RouterLink} from '@angular/router';
import {fromEvent} from 'rxjs';
import {AlgoliaIcon} from '../algolia-icon/algolia-icon.component';
import {RelativeLink} from '../../pipes/relative-link.pipe';
import {SearchHistoryComponent} from '../search-history/search-history.component';

@Component({
  selector: 'docs-search-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ClickOutside,
    TextField,
    ReactiveFormsModule,
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
  readonly textField = viewChild(TextField);

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

  readonly searchQuery = this.search.searchQuery;
  readonly resultsResource = this.search.resultsResource;
  readonly searchResults = this.search.searchResults;

  // We use a FormControl instead of relying on NgModel+signal to avoid
  // the issue https://github.com/angular/angular/issues/13568
  // TODO: Use signal forms when available
  searchControl = new FormControl(this.searchQuery(), {nonNullable: true});

  constructor() {
    inject(DestroyRef).onDestroy(() => this.keyManager.destroy());

    this.searchControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.searchQuery.set(value);
    });

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
        // We want to select the pre-existing text on opening
        // In order to change the search input with minimal user interaction.
        this.textField()?.input().nativeElement.select();
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
