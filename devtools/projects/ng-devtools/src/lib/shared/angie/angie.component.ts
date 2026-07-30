/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, input} from '@angular/core';

type AngieType = 'coding-01' | 'error' | 'orthos-back' | 'sad' | 'teaching';
type AngieSize = 'sm' | 'md' | 'lg';

const PX_SIZE: {[key in AngieSize]: number} = {
  'sm': 48,
  'md': 96,
  'lg': 128,
};

@Component({
  selector: 'ng-angie',
  template: `<img
    [src]="src()"
    [width]="sizePx()"
    [height]="sizePx()"
    alt="Angie illustration"
    aria-hidden="true"
  />`,
  styleUrl: 'angie.component.scss',
  host: {
    '[style.width.px]': 'sizePx()',
    '[style.height.px]': 'sizePx()',
  },
})
export class AngieComponent {
  protected readonly type = input.required<AngieType>();
  protected readonly size = input.required<AngieSize>();

  protected readonly src = computed(() => `/assets/angie/angie-${this.type()}.svg`);
  protected readonly sizePx = computed(() => PX_SIZE[this.size()]);
}
