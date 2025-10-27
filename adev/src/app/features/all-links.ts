/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {SUB_NAVIGATION_DATA} from '../routing/sub-navigation-data';
import {NavigationItem} from '@angular/docs';

// The goal of this page is to help the indexation of all pages by Algolia

const routeData = SUB_NAVIGATION_DATA;

@Component({
  selector: 'app-link-list',
  imports: [RouterLink],
  template: `
    <ul>
      @for (item of items(); track $index) {
        <li>
          @if (item.path && !item.path.startsWith('http')) {
            <a [routerLink]="item.path.startsWith('/') ? item.path : '/'+item.path">{{ item.label }}</a>
          }
          @if (item.children) {
            <app-link-list [items]="item.children" />
          }
        </li>
      }
    </ul>
  `,
})
export class LinkListComponent {
  items = input.required<NavigationItem[]>();
}

@Component({
  imports: [LinkListComponent],
  template: `
    <h1>All Links</h1>
    <h2>Docs</h2>
    <app-link-list [items]="routeData.docs" />
    <h2>Reference</h2>
    <app-link-list [items]="routeData.reference" />
    <h2>Tutorials</h2>
    <app-link-list [items]="routeData.tutorials" />
    <h2>Footer</h2>
    <app-link-list [items]="routeData.footer" />
  `,
})
export class AllLinks {
  routeData = routeData;
}
