/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

@Component({
  selector: 'docs-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'material-symbols-outlined',
    '[style.font-size.px]': 'fontSize()',
    'aria-hidden': 'true',
    'translate': 'no',
  },
  template: '<ng-content />',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  private static isFontLoaded = signal(false);

  protected readonly fontSize = computed(() => (IconComponent.isFontLoaded() ? null : 0));

  /** Share the same promise across different instances of the component */
  private static whenFontLoad?: Promise<FontFace[]> | undefined;

  constructor() {
    if (IconComponent.isFontLoaded()) {
      return;
    }

    const document = inject(DOCUMENT);
    afterNextRender(async () => {
      IconComponent.whenFontLoad ??= document.fonts.load('normal 1px "Material Symbols Outlined"');
      await IconComponent.whenFontLoad;
      IconComponent.isFontLoaded.set(true);
    });
  }
}
