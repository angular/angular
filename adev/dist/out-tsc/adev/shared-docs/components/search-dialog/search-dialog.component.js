/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  output,
  viewChild,
  viewChildren,
} from '@angular/core';
import {WINDOW} from '../../providers';
import {ClickOutside, SearchItem} from '../../directives';
import {Search, SearchHistory} from '../../services';
import {TextField} from '../text-field/text-field.component';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router, RouterLink} from '@angular/router';
import {fromEvent} from 'rxjs';
import {AlgoliaIcon} from '../algolia-icon/algolia-icon.component';
import {RelativeLink} from '../../pipes';
import {SearchHistoryComponent} from '../search-history/search-history.component';
let SearchDialog = (() => {
  let _classDecorators = [
    Component({
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
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var SearchDialog = class {
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
      SearchDialog = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    onClose = output();
    dialog = viewChild.required('searchDialog');
    items = viewChildren(SearchItem);
    textField = viewChild(TextField);
    history = inject(SearchHistory);
    search = inject(Search);
    relativeLink = new RelativeLink();
    router = inject(Router);
    window = inject(WINDOW);
    injector = inject(Injector);
    keyManager = new ActiveDescendantKeyManager(this.items, this.injector).withWrap();
    searchQuery = this.search.searchQuery;
    resultsResource = this.search.resultsResource;
    searchResults = this.search.searchResults;
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
      fromEvent(this.window, 'keydown')
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
    navigateToTheActiveItem() {
      const activeItemLink = this.keyManager.activeItem?.item()?.url;
      if (!activeItemLink) {
        return;
      }
      this.router.navigateByUrl(this.relativeLink.transform(activeItemLink));
      this.onClose.emit();
    }
  };
  return (SearchDialog = _classThis);
})();
export {SearchDialog};
//# sourceMappingURL=search-dialog.component.js.map
