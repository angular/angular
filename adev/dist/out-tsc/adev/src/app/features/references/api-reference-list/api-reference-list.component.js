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
import {Router} from '@angular/router';
import {ApiItemType} from '../interfaces/api-item-type';
import {ApiReferenceManager} from './api-reference-manager.service';
import ApiItemLabel from '../api-item-label/api-item-label.component';
import {ApiLabel} from '../pipes/api-label.pipe';
import {CdkMenuModule} from '@angular/cdk/menu';
import {MatChipsModule} from '@angular/material/chips';
export const ALL_TYPES_KEY = 'All';
export const STATUSES = {
  stable: 1,
  developerPreview: 2,
  experimental: 4,
  deprecated: 8,
};
export const DEFAULT_STATUS = STATUSES.stable | STATUSES.developerPreview | STATUSES.experimental;
let ApiReferenceList = (() => {
  let _classDecorators = [
    Component({
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
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ApiReferenceList = class {
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
      ApiReferenceList = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // services
    apiReferenceManager = inject(ApiReferenceManager);
    router = inject(Router);
    filterInput = viewChild.required(TextField, {read: ElementRef});
    injector = inject(EnvironmentInjector);
    // inputs
    queryInput = input('', {alias: 'query'});
    typeInput = input(ALL_TYPES_KEY, {alias: 'type'});
    statusInput = input(DEFAULT_STATUS, {alias: 'status'});
    // inputs are route binded, they can reset to undefined
    // also we want a writable state, so we use a linked signal
    query = linkedSignal(() => this.queryInput() ?? '');
    type = linkedSignal(() => this.typeInput() ?? ALL_TYPES_KEY);
    status = linkedSignal(() => this.statusInput() ?? DEFAULT_STATUS);
    // const state
    itemTypes = Object.values(ApiItemType);
    statuses = STATUSES;
    statusLabels = {
      [STATUSES.stable]: 'Stable',
      [STATUSES.developerPreview]: 'Developer Preview',
      [STATUSES.experimental]: 'Experimental',
      [STATUSES.deprecated]: 'Deprecated',
    };
    filteredGroups = computed(() => {
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
        const params = {
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
    setItemType(itemType) {
      this.type.update((type) => (type === itemType ? ALL_TYPES_KEY : itemType));
    }
    setStatus(status) {
      this.status.update((previousStatus) => {
        if (this.isStatusSelected(status)) {
          return previousStatus & ~status; // Clear the bit
        } else {
          return previousStatus | status; // Set the bit
        }
      });
    }
    isStatusSelected(status) {
      return (this.status() & status) === status;
    }
  };
  return (ApiReferenceList = _classThis);
})();
export default ApiReferenceList;
/**
 * Schedules a function to be run in a new macrotask.
 * This is needed because the `requestIdleCallback` API is not available in all browsers.
 * @param fn
 */
function scheduleOnIdle(fn) {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(fn);
  } else {
    setTimeout(fn, 0);
  }
}
//# sourceMappingURL=api-reference-list.component.js.map
