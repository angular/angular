/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core';

import {ClickOutside, Search, TextField, WINDOW} from '@angular/docs-shared';
import {FormsModule} from '@angular/forms';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {SearchItem} from '../../directives/search-item/search-item.directive';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router, RouterLink} from '@angular/router';
import {filter, fromEvent} from 'rxjs';
import {AlgoliaIcon} from '../algolia-icon/algolia-icon.component';
import {RelativeLink} from '../../pipes/relative-link.pipe';

@Component({
  selector: 'docs-search-dialog',
  standalone: true,
  imports: [
    ClickOutside,
    TextField,
    FormsModule,
    SearchItem,
    AlgoliaIcon,
    RelativeLink,
    RouterLink,
  ],
  templateUrl: './search-dialog.component.html',
  styleUrls: ['./search-dialog.component.scss'],
})
export class SearchDialog implements OnInit, AfterViewInit, OnDestroy {
  @Output() onClose = new EventEmitter<void>();
  @ViewChild('searchDialog') dialog?: ElementRef<HTMLDialogElement>;
  @ViewChildren(SearchItem) items?: QueryList<SearchItem>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly search = inject(Search);
  private readonly relativeLink = new RelativeLink();
  private readonly router = inject(Router);
  private readonly window = inject(WINDOW);

  private keyManager?: ActiveDescendantKeyManager<SearchItem>;

  searchQuery = this.search.searchQuery;
  searchResults = this.search.searchResults;

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      fromEvent<KeyboardEvent>(this.window, 'keydown')
        .pipe(
          filter((_) => !!this.keyManager),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((event) => {
          // When user presses Enter we can navigate to currently selected item in the search result list.
          if (event.key === 'Enter') {
            this.navigateToTheActiveItem();
          } else {
            this.ngZone.run(() => {
              this.keyManager?.onKeydown(event);
            });
          }
        });
    });
  }

  ngAfterViewInit() {
    this.dialog?.nativeElement.showModal();

    if (!this.items) {
      return;
    }

    this.keyManager = new ActiveDescendantKeyManager(this.items).withWrap();
    this.keyManager?.setFirstItemActive();

    this.updateActiveItemWhenResultsChanged();
    this.scrollToActiveItem();
  }

  ngOnDestroy(): void {
    this.keyManager?.destroy();
  }

  closeSearchDialog() {
    this.dialog?.nativeElement.close();
    this.onClose.next();
  }

  updateSearchQuery(query: string) {
    this.search.updateSearchQuery(query);
  }

  private updateActiveItemWhenResultsChanged(): void {
    this.items?.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      // Change detection should be run before execute `setFirstItemActive`.
      Promise.resolve().then(() => {
        this.keyManager?.setFirstItemActive();
      });
    });
  }

  private navigateToTheActiveItem(): void {
    const activeItemLink: string | undefined = this.keyManager?.activeItem?.item?.url;

    if (!activeItemLink) {
      return;
    }

    this.router.navigateByUrl(this.relativeLink.transform(activeItemLink));
    this.onClose.next();
  }

  private scrollToActiveItem(): void {
    this.keyManager?.change.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.keyManager?.activeItem?.scrollIntoView();
    });
  }
}
