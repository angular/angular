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
  computed,
  inject,
  model,
  signal,
  viewChild,
  afterNextRender,
} from '@angular/core';
import ApiItemsSection from '../api-items-section/api-items-section.component';
import {FormsModule} from '@angular/forms';
import {SlideToggle, TextField} from '@angular/docs';
import {Params, Router} from '@angular/router';
import {ApiItemType} from '../interfaces/api-item-type';
import {ApiReferenceManager} from './api-reference-manager.service';
import ApiItemLabel from '../api-item-label/api-item-label.component';
import {ApiLabel} from '../pipes/api-label.pipe';
import {ApiItemsGroup} from '../interfaces/api-items-group';

export const ALL_TYPES_KEY = 'All';

@Component({
  selector: 'adev-reference-list',
  imports: [ApiItemsSection, ApiItemLabel, FormsModule, SlideToggle, TextField, ApiLabel],
  templateUrl: './api-reference-list.component.html',
  styleUrls: ['./api-reference-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ApiReferenceList {
  // services
  private readonly apiReferenceManager = inject(ApiReferenceManager);
  private readonly router = inject(Router);

  // inputs
  query = model<string | undefined>('');
  type = model<string | undefined>(ALL_TYPES_KEY);

  // const state
  itemTypes = Object.values(ApiItemType);

  // state
  includeDeprecated = signal(false);

  // queries
  filterInput = viewChild.required(TextField, {read: ElementRef});

  constructor() {
    afterNextRender(() => {
      // Lord forgive me for I have sinned
      // Use the CVA to focus when https://github.com/angular/angular/issues/31133 is implemented
      if (matchMedia('(hover: hover) and (pointer:fine)').matches) {
        scheduleOnIdle(() => {
          this.filterInput().nativeElement.querySelector('input').focus({preventScroll: true});
        });
      }
    });
  }

  filteredGroups = computed((): ApiItemsGroup[] => {
    const query = this.query()?.toLocaleLowerCase();
    return this.apiReferenceManager
      .apiGroups()
      .map((group) => ({
        title: group.title,
        id: group.id,
        items: group.items.filter((apiItem) => {
          return (
            (query !== undefined ? apiItem.title.toLocaleLowerCase().includes(query) : true) &&
            (this.includeDeprecated() ? true : apiItem.isDeprecated === this.includeDeprecated()) &&
            (this.type() === undefined ||
              this.type() === ALL_TYPES_KEY ||
              apiItem.itemType === this.type())
          );
        }),
      }))
      .filter((group) => group.items.length > 0);
  });

  filterByItemType(itemType: ApiItemType): void {
    this.type.update((currentType) => (currentType === itemType ? ALL_TYPES_KEY : itemType));
    this.syncUrlWithFilters();
  }

  // Avoid calling in an `effect`. The `navigate` call will replace the state in
  // the history which will nullify the `Scroll` position which, respectively,
  // will break the scroll position restoration. Not only that but `disableScrolling=true`.
  syncUrlWithFilters() {
    const params: Params = {
      'query': this.query() ?? null,
      'type': this.type() ?? null,
    };

    this.router.navigate([], {
      queryParams: params,
      replaceUrl: true,
      preserveFragment: true,
      info: {
        disableScrolling: true,
      },
    });
  }
}

/**
 * Schedules a function to be run in a new macrotask.
 * This is needed because the `requestIdleCallback` API is not available in all browsers.
 * @param fn
 */
function scheduleOnIdle(fn: () => void): void {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(fn);
  } else {
    setTimeout(fn, 0);
  }
}
