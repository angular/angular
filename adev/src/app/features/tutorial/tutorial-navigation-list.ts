/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {NgTemplateOutlet} from '@angular/common';
import {NavigationItem} from '@angular/docs';

@Component({
  selector: 'adev-tutorial-navigation-list',
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  template: `
    <ng-template #navigationList let-navigationItems>
      <ul class="docs-navigation-list docs-faceted-list">
        @for (item of navigationItems; track $index) {
          <li class="docs-faceted-list-item">
            <a
              [routerLink]="'/' + item.path"
              routerLinkActive="docs-faceted-list-item-active"
              [routerLinkActiveOptions]="{exact: true}"
            >
              <span class="docs-faceted-list-item-text"> {{ item.label }} </span>
            </a>

            @if (item.children && item.children.length > 0) {
              <ng-container
                *ngTemplateOutlet="
                  navigationList;
                  context: {$implicit: item.children, level: item.level}
                "
              />
            }
          </li>
        }
      </ul>
    </ng-template>

    <ng-container *ngTemplateOutlet="navigationList; context: {$implicit: navigationItems()}" />
  `,
  styleUrls: ['./tutorial-navigation-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialNavigationList {
  readonly navigationItems = input.required<NavigationItem[]>();
}
