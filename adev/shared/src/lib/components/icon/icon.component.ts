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
  ChangeDetectorRef,
  Component,
  afterNextRender,
  inject,
} from '@angular/core';

@Component({
  selector: 'docs-icon',
  standalone: true,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  host: {
    '[class]': 'MATERIAL_SYMBOLS_OUTLINED',
    '[style.font-size.px]': 'fontSize',
    'aria-hidden': 'true',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  private readonly cdRef = inject(ChangeDetectorRef);

  get fontSize(): number | null {
    return IconComponent.isFontLoaded ? null : 0;
  }

  protected readonly MATERIAL_SYMBOLS_OUTLINED = 'material-symbols-outlined';

  private static isFontLoaded: boolean = false;
  /** Share the same promise across different instances of the component */
  private static whenFontLoad?: Promise<FontFace[]> | undefined;

  constructor() {
    if (IconComponent.isFontLoaded) {
      return;
    }

    const document = inject(DOCUMENT);
    afterNextRender(async () => {
      IconComponent.whenFontLoad ??= document.fonts.load('normal 1px "Material Symbols Outlined"');
      await IconComponent.whenFontLoad;
      IconComponent.isFontLoaded = true;

      // We need to ensure CD is triggered on the component when the font is loaded
      this.cdRef.markForCheck();
    });
  }
}
