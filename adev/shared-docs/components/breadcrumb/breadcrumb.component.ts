/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NavigationItem} from '../../interfaces/index';
import {NavigationState} from '../../services/index';

@Component({
  selector: 'docs-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class Breadcrumb {
  private readonly navigationState = inject(NavigationState);

  readonly breadcrumbItems = computed(() => {
    const breadcrumbs: NavigationItem[] = [];
    let activeItem = this.navigationState.activeNavigationItem()?.parent;

    while (activeItem != null) {
      breadcrumbs.push(activeItem);
      activeItem = activeItem.parent;
    }

    return breadcrumbs.reverse();
  });
}
