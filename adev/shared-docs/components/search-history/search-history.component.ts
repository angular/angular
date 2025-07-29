/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  Component,
  DestroyRef,
  effect,
  inject,
  Injector,
  viewChildren,
} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';

import {SearchHistory} from '../../services';
import {RelativeLink} from '../../pipes';
import {SearchItem} from '../../directives/search-item/search-item.directive';

@Component({
  selector: 'docs-search-history',
  imports: [RelativeLink, RouterLink, SearchItem],
  templateUrl: './search-history.component.html',
  styleUrl: './search-history.component.scss',
  host: {
    '(document:keydown)': 'onKeydown($event)',
    '(document:mousemove)': 'onMouseMove($event)',
  },
})
export class SearchHistoryComponent {
  protected readonly items = viewChildren(SearchItem);

  readonly history = inject(SearchHistory);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);

  private readonly relativeLink = new RelativeLink();
  private readonly keyManager = new ActiveDescendantKeyManager(
    this.items,
    this.injector,
  ).withWrap();

  private lastMouseCoor: {x: number; y: number} = {x: 0, y: 0};

  constructor() {
    inject(DestroyRef).onDestroy(() => this.keyManager.destroy());

    afterNextRender({
      write: () => {
        if (this.items().length) {
          this.keyManager.setFirstItemActive();
        }
      },
    });

    const keyManagerActive = toSignal(this.keyManager.change);

    effect(() => {
      if (keyManagerActive() !== undefined) {
        this.keyManager.activeItem?.scrollIntoView();
      }
    });
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.navigateToTheActiveItem();
    } else {
      this.keyManager.onKeydown(e);
    }
  }

  onMouseMove(e: MouseEvent) {
    // Happens before mouseenter
    this.lastMouseCoor = {x: e.clientX, y: e.clientY};
  }

  onMouseEnter(e: MouseEvent, idx: number) {
    // Since `mouseenter` can be called when there isn't a `mousemove`
    // in the case when the key navigation is scrolling items into the view
    // that happen to be under the mouse cursor, we need to perform a mouse
    // coor check to prevent this undesired behavior.
    const {x, y} = this.lastMouseCoor;
    if (e.clientX === x && e.clientY === y) {
      return;
    }

    this.keyManager.setActiveItem(idx);
  }

  navigateToTheActiveItem() {
    const activeItemLink = this.keyManager.activeItem?.item()?.url;

    if (activeItemLink) {
      const url = this.relativeLink.transform(activeItemLink);
      this.router.navigateByUrl(url);
    }
  }
}
