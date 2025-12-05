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
  viewChild,
  afterNextRender,
  EnvironmentInjector,
  effect,
  input,
  signal,
} from '@angular/core';
import ApiItemsSection from '../api-items-section/api-items-section.component';
import {FormsModule} from '@angular/forms';
import {TextField} from '@angular/docs';
import {KeyValuePipe} from '@angular/common';
import {Params, Router} from '@angular/router';
import {ApiItemType} from '../interfaces/api-item-type';
import {ApiReferenceManager} from './api-reference-manager.service';
import ApiItemLabel from '../api-item-label/api-item-label.component';
import {ApiLabel} from '../pipes/api-label.pipe';
import {ApiItemsGroup} from '../interfaces/api-items-group';
import {CdkMenuModule} from '@angular/cdk/menu';
import {MatChipsModule} from '@angular/material/chips';
import {Field, form} from '@angular/forms/signals';

const ALL_API_ITEMS = 'all' as const;

export type ApiItemTypeFilter = ApiItemType | typeof ALL_API_ITEMS;

export const STATUSES = {
  stable: 1,
  developerPreview: 2,
  experimental: 4,
  deprecated: 8,
} as const;
export const DEFAULT_STATUS = STATUSES.stable | STATUSES.developerPreview | STATUSES.experimental;

export type StatusFlag = (typeof STATUSES)[keyof typeof STATUSES];

export type StatusBitmask = number;

interface QueryData {
  query: string;
  type: ApiItemTypeFilter;
  status: StatusBitmask;
}

@Component({
  selector: 'adev-reference-list',
  imports: [
    ApiItemsSection,
    ApiItemLabel,
    FormsModule,
    TextField,
    ApiLabel,
    CdkMenuModule,
    MatChipsModule,
    KeyValuePipe,
    Field,
  ],
  templateUrl: './api-reference-list.component.html',
  styleUrls: ['./api-reference-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ApiReferenceList {
  // services
  private readonly apiReferenceManager = inject(ApiReferenceManager);
  private readonly router = inject(Router);
  private readonly filterInput = viewChild.required(TextField, {read: ElementRef});
  private readonly injector = inject(EnvironmentInjector);

  // inputs
  readonly queryInput = input<string | undefined>('', {alias: 'query'});
  readonly typeInput = input<ApiItemTypeFilter | undefined>(ALL_API_ITEMS, {alias: 'type'});
  readonly statusInput = input<number | undefined>(DEFAULT_STATUS, {alias: 'status'});

  readonly searchState = signal<QueryData>({
    query: this.queryInput() ?? '',
    type: this.typeInput() ?? ALL_API_ITEMS,
    status: this.statusInput() ?? DEFAULT_STATUS,
  });

  protected readonly queryForm = form(this.searchState);

  // const state
  protected readonly itemTypes = Object.values(ApiItemType);
  protected readonly statuses = STATUSES;

  protected readonly statusLabels = {
    [STATUSES.stable]: 'Stable',
    [STATUSES.developerPreview]: 'Developer Preview',
    [STATUSES.experimental]: 'Experimental',
    [STATUSES.deprecated]: 'Deprecated',
  };

  readonly filteredGroups = computed((): ApiItemsGroup[] => {
    const query = this.queryForm.query().value().toLocaleLowerCase();
    const status = this.queryForm.status().value();
    const type = this.queryForm.type().value();

    return this.apiReferenceManager
      .apiGroups()
      .map((group) => ({
        title: group.title,
        id: group.id,
        items: group.items.filter((apiItem) => {
          return (
            (query == '' ? true : apiItem.title.toLocaleLowerCase().includes(query)) &&
            (type === ALL_API_ITEMS || apiItem.itemType === type) &&
            ((status & STATUSES.stable &&
              !apiItem.developerPreview &&
              !apiItem.deprecated &&
              !apiItem.experimental) ||
              (status & STATUSES.deprecated && apiItem.deprecated) ||
              (status & STATUSES.developerPreview && apiItem.developerPreview) ||
              (status & STATUSES.experimental && apiItem.experimental))
          );
        }),
      }))
      .filter((group) => group.items.length > 0);
  });

  constructor() {
    effect(() => {
      const filterInput = this.filterInput();
      afterNextRender(
        {
          write: () => {
            // Lord forgive me for I have sinned
            // Use the CVA to focus when https://github.com/angular/angular/issues/31133 is implemented
            if (matchMedia('(hover: hover) and (pointer:fine)').matches) {
              scheduleOnIdle(() => filterInput.nativeElement.querySelector('input').focus());
            }
          },
        },
        {injector: this.injector},
      );
    });

    effect(() => {
      // We'll only set the params if we deviate from the default values
      const current = this.searchState();
      const params: Params = {
        query: current.query || null,
        type: current.type === ALL_API_ITEMS ? null : current.type,
        status: current.status === DEFAULT_STATUS ? null : current.status,
      };

      this.router.navigate([], {
        queryParams: params,
        replaceUrl: true,
        preserveFragment: true,
        info: {
          disableScrolling: true,
        },
      });
    });
  }

  setItemType(itemType: ApiItemType): void {
    this.searchState.update((current) => ({
      ...current,
      type: current.type === itemType ? ALL_API_ITEMS : itemType,
    }));
  }

  setStatus(status: number): void {
    this.searchState.update((current) => {
      const currentStatus = current.status;
      return {
        ...current,
        status: this.isStatusSelected(status)
          ? currentStatus & ~status // clear bit
          : currentStatus | status, // set bit
      };
    });
  }

  isStatusSelected(status: number): boolean {
    return (this.queryForm.status().value() & status) === status;
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
