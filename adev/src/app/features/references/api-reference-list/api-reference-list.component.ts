/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import ApiItemsSection from '../api-items-section/api-items-section.component';
import {FormsModule} from '@angular/forms';
import {SlideToggle, TextField} from '@angular/docs';
import {NgFor, NgIf} from '@angular/common';
import {ApiItemType} from '../interfaces/api-item-type';
import {ApiReferenceManager} from './api-reference-manager.service';
import ApiItemLabel from '../api-item-label/api-item-label.component';
import {ApiLabel} from '../pipes/api-label.pipe';
import {ApiItemsGroup} from '../interfaces/api-items-group';

export const ALL_STATUSES_KEY = 'All';

@Component({
  selector: 'adev-reference-list',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    ApiItemsSection,
    ApiItemLabel,
    FormsModule,
    SlideToggle,
    TextField,
    ApiLabel,
  ],
  templateUrl: './api-reference-list.component.html',
  styleUrls: ['./api-reference-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ApiReferenceList {
  private readonly apiReferenceManager = inject(ApiReferenceManager);

  private readonly allGroups = this.apiReferenceManager.apiGroups;

  query = signal('');
  includeDeprecated = signal(false);
  type = signal(ALL_STATUSES_KEY);

  featuredGroup = this.apiReferenceManager.featuredGroup;
  filteredGroups = computed((): ApiItemsGroup[] => {
    return this.allGroups()
      .map((group) => ({
        title: group.title,
        isFeatured: group.isFeatured,
        id: group.id,
        items: group.items.filter((apiItem) => {
          return (
            (this.query()
              ? apiItem.title.toLocaleLowerCase().includes(this.query().toLocaleLowerCase())
              : true) &&
            (this.includeDeprecated() ? true : apiItem.isDeprecated === this.includeDeprecated()) &&
            (this.type() === ALL_STATUSES_KEY || apiItem.itemType === this.type())
          );
        }),
      }))
      .filter((group) => group.items.length > 0);
  });
  itemTypes = Object.values(ApiItemType);

  filterByItemType(itemType: ApiItemType): void {
    this.type.set(this.type() === itemType ? ALL_STATUSES_KEY : itemType);
  }
}
