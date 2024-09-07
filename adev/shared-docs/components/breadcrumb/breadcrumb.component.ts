/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, OnInit, inject, signal} from '@angular/core';
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
export class Breadcrumb implements OnInit {
  private readonly navigationState = inject(NavigationState);

  breadcrumbItems = signal<NavigationItem[]>([]);

  ngOnInit(): void {
    this.setBreadcrumbItemsBasedOnNavigationStructure();
  }

  private setBreadcrumbItemsBasedOnNavigationStructure(): void {
    let breadcrumbs: NavigationItem[] = [];

    const traverse = (node: NavigationItem | null) => {
      if (!node) {
        return;
      }

      if (node.parent) {
        breadcrumbs = [node.parent, ...breadcrumbs];
        traverse(node.parent);
      }
    };

    traverse(this.navigationState.activeNavigationItem());

    this.breadcrumbItems.set(breadcrumbs);
  }
}
