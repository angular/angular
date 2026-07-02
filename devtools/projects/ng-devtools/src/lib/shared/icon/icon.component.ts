/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, input} from '@angular/core';

export type IconName = 'graph_downstream' | 'graph_upstream';

@Component({
  selector: 'ng-icon',
  template: `
    <svg class="svg">
      <use [attr.xlink:href]="'/assets/sprite.svg#' + name()"></use>
    </svg>
  `,
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  name = input.required<IconName>();
}
