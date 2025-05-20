/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject, computed} from '@angular/core';
import {NavigationState} from '../../services/index';
import {NavigationItem} from '../../interfaces/index';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'docs-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Breadcrumb {
  private readonly navigationState = inject(NavigationState);

  breadcrumbItems = computed(() => {
    const breadcrumbs: NavigationItem[] = [];
    let activeItem = this.navigationState.activeNavigationItem()?.parent;

    while (activeItem != null) {
      breadcrumbs.push(activeItem);
      activeItem = activeItem.parent;
    }

    return breadcrumbs.reverse();
  });
}
