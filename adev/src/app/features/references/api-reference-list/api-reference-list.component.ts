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
  linkedSignal,
  viewChild,
  afterNextRender,
  EnvironmentInjector,
  effect,
  input,
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

export const ALL_TYPES_KEY = 'All';
export const STATUSES = {
  stable: 1,
  developerPreview: 2,
  experimental: 4,
  deprecated: 8,
} as const;
export const DEFAULT_STATUS = STATUSES.stable | STATUSES.developerPreview | STATUSES.experimental;

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
  readonly typeInput = input<string | undefined>(ALL_TYPES_KEY, {alias: 'type'});
  readonly statusInput = input<number | undefined>(DEFAULT_STATUS, {alias: 'status'});

  // inputs are route binded, they can reset to undefined
  // also we want a writable state, so we use a linked signal
  query = linkedSignal(() => this.queryInput() ?? '');
  type = linkedSignal(() => this.typeInput() ?? ALL_TYPES_KEY);
  status = linkedSignal(() => this.statusInput() ?? DEFAULT_STATUS);

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
    const query = this.query().toLocaleLowerCase();
    const status = this.status();
    const type = this.type();
    return this.apiReferenceManager
      .apiGroups()
      .map((group) => ({
        title: group.title,
        id: group.id,
        items: group.items.filter((apiItem) => {
          return (
            (query == '' ? true : apiItem.title.toLocaleLowerCase().includes(query)) &&
            (type === ALL_TYPES_KEY || apiItem.itemType === type) &&
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
      const params: Params = {
        'query': this.query() || null,
        'type': this.type() === ALL_TYPES_KEY ? null : this.type(),
        'status': this.status() === DEFAULT_STATUS ? null : this.status(),
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
    this.type.update((type) => (type === itemType ? ALL_TYPES_KEY : itemType));
  }

  setStatus(status: number): void {
    this.status.update((previousStatus) => {
      if (this.isStatusSelected(status)) {
        return previousStatus & ~status; // Clear the bit
      } else {
        return previousStatus | status; // Set the bit
      }
    });
  }

  isStatusSelected(status: number): boolean {
    return (this.status() & status) === status;
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
