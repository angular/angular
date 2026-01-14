/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkMenuModule} from '@angular/cdk/menu';
import {KeyValuePipe} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import {Select, SelectOption, TextField} from '@angular/docs';
import {FormField, form} from '@angular/forms/signals';
import {MatChipsModule} from '@angular/material/chips';
import {Params, Router} from '@angular/router';
import ApiItemLabel from '../api-item-label/api-item-label.component';
import ApiItemsSection from '../api-items-section/api-items-section.component';
import {ApiItemType} from '../interfaces/api-item-type';
import {ApiItemsGroup} from '../interfaces/api-items-group';
import {ApiLabel} from '../pipes/api-label.pipe';
import {ApiReferenceManager} from './api-reference-manager.service';

export const ALL_TYPES_KEY = 'All';
export const ALL_PACKAGES = 'All';
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
    TextField,
    ApiLabel,
    CdkMenuModule,
    MatChipsModule,
    KeyValuePipe,
    Select,
    FormField,
  ],
  templateUrl: './api-reference-list.component.html',
  styleUrls: ['./api-reference-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ApiReferenceList {
  // services
  private readonly apiReferenceManager = inject(ApiReferenceManager);
  private readonly router = inject(Router);
  private readonly injector = inject(EnvironmentInjector);

  // inputs
  readonly queryInput = input<string | undefined>('', {alias: 'query'});
  readonly typeInput = input<string | undefined>(ALL_TYPES_KEY, {alias: 'type'});
  readonly statusInput = input<number | undefined>(DEFAULT_STATUS, {alias: 'status'});
  protected selectedPackageInput = input<string | undefined>(ALL_PACKAGES, {alias: 'package'});

  // inputs are route binded, they can reset to undefined
  // also we want a writable state, so we use a linked signal
  public form = form(
    linkedSignal(() => ({
      query: this.queryInput() ?? '',
      status: this.statusInput() ?? DEFAULT_STATUS,
      type: this.typeInput() ?? ALL_TYPES_KEY,
      selectedPackage: this.selectedPackageInput() ?? ALL_PACKAGES,
    })),
  );

  protected packageOptions = computed<SelectOption[]>(() => [
    {label: 'All Packages', value: ALL_PACKAGES},
    ...this.apiReferenceManager.apiGroups().map((group) => ({
      label: group.title,
      value: group.id,
    })),
  ]);

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
    const query = this.form.query().value().toLocaleLowerCase();
    const status = this.form.status().value();
    const type = this.form.type().value();
    return this.apiReferenceManager
      .apiGroups()
      .map((group) => ({
        title: group.title,
        id: group.id,
        items: group.items.filter((apiItem) => {
          return (
            (query == ''
              ? true
              : apiItem.title.toLocaleLowerCase().includes(query) ||
                group.title.toLocaleLowerCase().includes(query)) &&
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
      .filter(
        (group) =>
          group.items.length > 0 &&
          (this.form.selectedPackage().value() === ALL_PACKAGES ||
            group.id === this.form.selectedPackage().value()),
      );
  });

  constructor() {
    effect(() => {
      const filterInput = this.form.query();
      afterNextRender(
        {
          write: () => {
            if (matchMedia('(hover: hover) and (pointer:fine)').matches) {
              scheduleOnIdle(() => filterInput.focusBoundControl());
            }
          },
        },
        {injector: this.injector},
      );
    });

    effect(() => {
      // We'll only set the params if we deviate from the default values
      const params: Params = {
        'query': this.form.query().value() || null,
        'type': this.form.type().value() === ALL_TYPES_KEY ? null : this.form.type().value(),
        'status': this.form.status().value() === DEFAULT_STATUS ? null : this.form.status().value(),
        'package':
          this.form.selectedPackage().value() === ALL_PACKAGES
            ? null
            : this.form.selectedPackage().value(),
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
    this.form.type().value.update((type) => (type === itemType ? ALL_TYPES_KEY : itemType));
  }

  setStatus(status: number): void {
    this.form.status().value.update((previousStatus) => {
      if (this.isStatusSelected(status)) {
        return previousStatus & ~status; // Clear the bit
      } else {
        return previousStatus | status; // Set the bit
      }
    });
  }

  isStatusSelected(status: number): boolean {
    return (this.form.status().value() & status) === status;
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
