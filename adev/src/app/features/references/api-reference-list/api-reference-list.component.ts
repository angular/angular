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
import {ActivatedRoute, Router} from '@angular/router';
import {Subject, debounceTime} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatSnackBar} from '@angular/material/snack-bar';

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
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  private readonly allGroups = this.apiReferenceManager.apiGroups;

  private readonly querySubject = new Subject<string>();

  query = signal('');
  includeDeprecated = signal(false);
  type = signal(ALL_STATUSES_KEY);

  featuredGroup = this.apiReferenceManager.featuredGroup;
  filteredGroups = computed(() => {
    console.log(this.type());
    return this.allGroups()
      .map((group) => ({
        title: group.title,
        isFeatured: group.isFeatured,
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
    this.type.update((currentType) => (currentType === itemType ? ALL_STATUSES_KEY : itemType));
  }

  updateQuery(queryStr: string): void {
    this.querySubject.next(queryStr);
  }

  createLink(): void {
    const urlTree = this.router.createUrlTree([], {
      queryParams: {
        query: this.query() || undefined,
        type: this.type() || undefined,
      },
    });
    this.router.navigateByUrl(urlTree, {replaceUrl: true});

    navigator.clipboard.writeText(urlTree.toString());
    this.snackBar.open('Link copied to clipboard');
  }

  constructor() {
    this.querySubject.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((queryStr) => {
      this.query.set(queryStr ?? '');
    });

    const routeQuery = this.activatedRoute.snapshot.queryParamMap.get('query');
    if (routeQuery) {
      this.query.set(routeQuery);
    }

    const routeType = this.activatedRoute.snapshot.queryParamMap.get('type');
    if (routeType) {
      this.type.set(routeType);
    }
  }
}
