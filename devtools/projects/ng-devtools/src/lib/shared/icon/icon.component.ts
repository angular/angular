/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, inject, input} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

export type IconName = 'graph_downstream' | 'graph_upstream';

@Component({
  selector: 'ng-icon',
  template: `
    <svg class="svg">
      <use [attr.xlink:href]="href()"></use>
    </svg>
  `,
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  name = input.required<IconName>();

  private readonly sanitizer = inject(DomSanitizer);

  // `use` references are resource URLs. The sprite is an asset of DevTools itself and only the
  // icon name varies, so the reference is marked as trusted here.
  protected readonly href = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(`/assets/sprite.svg#${this.name()}`),
  );
}
