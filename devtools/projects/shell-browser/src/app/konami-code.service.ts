/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class KonamiCodeService {
  private static readonly KONAMI_CODE = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];

  private codeIndex = 0;

  constructor() {
    window.addEventListener('keydown', this.onKeyDownListener);
  }

  private readonly onKeyDownListener = (event: KeyboardEvent) => {
    const expectedKey = KonamiCodeService.KONAMI_CODE[this.codeIndex];
    const pressedKey = event.key.length === 1 ? event.key.toLowerCase() : event.key;

    if (pressedKey === expectedKey) {
      this.codeIndex++;
      if (this.codeIndex === KonamiCodeService.KONAMI_CODE.length) {
        this.codeIndex = 0;
        window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank', 'noopener');
      }
      return;
    }

    this.codeIndex = pressedKey === KonamiCodeService.KONAMI_CODE[0] ? 1 : 0;
  };

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.onKeyDownListener);
  }
}
