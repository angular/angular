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
  EnvironmentInjector,
  afterNextRender,
  computed,
  effect,
  inject,
  model,
  signal,
  viewChild,
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

export const ALL_STATUSES_KEY = 'All';

@Component({
  selector: 'adev-reference-list',
  imports: [ApiItemsSection, ApiItemLabel, FormsModule, SlideToggle, TextField, ApiLabel],
  templateUrl: './api-reference-list.component.html',
  styleUrls: ['./api-reference-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ApiReferenceList {
  private readonly apiReferenceManager = inject(ApiReferenceManager);
  private readonly router = inject(Router);
  filterInput = viewChild.required(TextField, {read: ElementRef});
  private readonly injector = inject(EnvironmentInjector);

  private readonly allGroups = this.apiReferenceManager.apiGroups;

  constructor() {
    effect(() => {
      const filterInput = this.filterInput();
      afterNextRender(
        {
          write: () => {
            // Lord forgive me for I have sinned
            // Use the CVA to focus when https://github.com/angular/angular/issues/31133 is implemented
            if (matchMedia('(hover: hover) and (pointer:fine)').matches) {
              filterInput.nativeElement.querySelector('input').focus();
            }
          },
        },
        {injector: this.injector},
      );
    });

    effect(
      () => {
        const params: Params = {
          'query': this.query() ? this.query() : null,
          'type': this.type() ? this.type() : null,
        };

        this.router.navigate([], {
          queryParams: params,
          replaceUrl: true,
          preserveFragment: true,
          info: {
            disableScrolling: true,
          },
        });
      },
      {allowSignalWrites: true},
    );
  }

  query = model<string | undefined>('');
  includeDeprecated = signal(false);

  type = model<string | undefined>(ALL_STATUSES_KEY);

  featuredGroup = this.apiReferenceManager.featuredGroup;
  filteredGroups = computed((): ApiItemsGroup[] => {
    return this.allGroups()
      .map((group) => ({
        title: group.title,
        isFeatured: group.isFeatured,
        id: group.id,
        items: group.items.filter((apiItem) => {
          return (
            (this.query() !== undefined
              ? apiItem.title
                  .toLocaleLowerCase()
                  .includes((this.query() as string).toLocaleLowerCase())
              : true) &&
            (this.includeDeprecated() ? true : apiItem.isDeprecated === this.includeDeprecated()) &&
            (this.type() === undefined ||
              this.type() === ALL_STATUSES_KEY ||
              apiItem.itemType === this.type())
          );
        }),
      }))
      .filter((group) => group.items.length > 0);
  });
  itemTypes = Object.values(ApiItemType);

  filterByItemType(itemType: ApiItemType): void {
    this.type.update((currentType) => (currentType === itemType ? ALL_STATUSES_KEY : itemType));
  }
}
